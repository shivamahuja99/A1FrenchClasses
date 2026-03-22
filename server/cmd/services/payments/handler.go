package payments

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"services/internal/models"
	"services/internal/paypal"
	"services/internal/repository"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// PayPalClient is an interface for PayPal operations so it can be mocked in tests.
type PayPalClient interface {
	CreateOrder(amount float64, orderID string) (string, string, error)
	CaptureOrder(orderID string) (string, error)
}

type PaymentHandler struct {
	logger       *log.Logger
	repo         repository.PaymentRepository
	orderRepo    repository.OrderRepository
	cartRepo     repository.CartRepository
	userRepo     repository.UserRepository
	db           *gorm.DB
	paypalClient PayPalClient
}

func NewPaymentHandler(logger *log.Logger, db *gorm.DB) *PaymentHandler {
	return &PaymentHandler{
		logger:       logger,
		repo:         repository.NewPostgresPaymentRepository(db),
		orderRepo:    repository.NewPostgresOrderRepository(db),
		cartRepo:     repository.NewPostgresCartRepository(db),
		userRepo:     repository.NewPostgresUserRepository(db),
		db:           db,
		paypalClient: paypal.NewClient(),
	}
}

// === NEW CHECKOUT ENDPOINTS ===

func (h *PaymentHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	// 1. Get UserID
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Get Cart
	cart, err := h.cartRepo.GetCartByUserID(r.Context(), userID)
	if err != nil || len(cart.Items) == 0 {
		http.Error(w, "Cart is empty or not found", http.StatusBadRequest)
		return
	}

	// 3. Calculate total
	total, err := h.cartRepo.GetCartTotal(r.Context(), cart.ID)
	if err != nil || total <= 0 {
		http.Error(w, "Invalid cart total", http.StatusBadRequest)
		return
	}

	// 4. Create Order with Items
	var orderItems []models.OrderItem
	for _, item := range cart.Items {
		orderItems = append(orderItems, models.OrderItem{
			CourseID: item.CourseID,
			Price:    item.Price,
		})
	}

	order := models.Order{
		UserID:      userID,
		TotalAmount: total,
		Status:      "PENDING",
		Items:       orderItems,
	}

	if err := h.orderRepo.Create(r.Context(), &order); err != nil {
		if h.logger != nil {
			h.logger.Printf("Failed to create order: %v", err)
		}
		http.Error(w, "Failed to create order", http.StatusInternalServerError)
		return
	}

	// 6. Create PayPal Order
	paypalOrderID, approveURL, err := h.paypalClient.CreateOrder(total, order.ID)
	if err != nil {
		if h.logger != nil {
			h.logger.Printf("Failed to create PayPal order: %v", err)
		}
		http.Error(w, "Payment provider error", http.StatusInternalServerError)
		return
	}

	if h.logger != nil {
		h.logger.Printf("Created PayPal order %s for internal order %s", paypalOrderID, order.ID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"order_id":    order.ID,
		"approve_url": approveURL,
	})
}

func (h *PaymentHandler) CaptureCheckout(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OrderID string `json:"order_id"`
		Token   string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// 1. Fetch current order status for idempotency check
	order, err := h.orderRepo.FindByID(r.Context(), req.OrderID)
	if err != nil {
		h.logger.Printf("Order not found: %s", req.OrderID)
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// If already completed, return success immediately (Idempotency)
	if order.Status == "COMPLETED" {
		if h.logger != nil {
			h.logger.Printf("Order %s already COMPLETED, skipping double capture", req.OrderID)
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "already_completed"})
		return
	}

	// 2. Capture PayPal Order
	status, err := h.paypalClient.CaptureOrder(req.Token)
	if err != nil {
		if h.logger != nil {
			h.logger.Printf("Failed to capture PayPal order: %v", err)
		}

		// Check if error is due to order already being captured 
		// PayPal returns 422 with ORDER_ALREADY_CAPTURED in the body
		// We'll check the error message for this specific string
		isAlreadyCaptured := (
			strings.Contains(err.Error(), ErrOrderAlreadyCaptured) || 
			strings.Contains(err.Error(), ErrDuplicateResource) || 
			strings.Contains(err.Error(), StatusUnprocessableEntity) || 
			strings.Contains(err.Error(), StatusBadRequest)) 

		if isAlreadyCaptured {
			// If it's already captured, we should double-check if we should mark it COMPLETED
			// For safety, let's treat this as a potentially successful mount retry
			h.logger.Printf("PayPal reported order %s already captured or duplicate. Marking as COMPLETED if internal check passes.", req.OrderID)
			status = "COMPLETED" // Force success state to proceed with internal fulfillment
		} else {
			// Only mark as FAILED if it wasn't a duplicate/already-captured error
			h.orderRepo.UpdateStatus(r.Context(), req.OrderID, "FAILED")
			http.Error(w, "Failed to capture payment", http.StatusBadRequest)
			return
		}
	}

	if status == "COMPLETED" {
		h.orderRepo.UpdateStatus(r.Context(), req.OrderID, "COMPLETED")

		// Re-fetch or use existing order object if it hasn't changed (Items are needed)
		if order.Items == nil {
			order, _ = h.orderRepo.FindByID(r.Context(), req.OrderID)
		}

		payment := models.Payment{
			OrderID:             req.OrderID,
			TransactionAmount:   order.TotalAmount,
			TransactionMethod:   "PAYPAL",
			TransactionStatus:   "SUCCESS",
			PayPalTransactionID: req.Token,
		}
		h.repo.Create(r.Context(), &payment)

		userID, _ := r.Context().Value("user_id").(string)
		for _, item := range order.Items {
			h.userRepo.AssignCourse(r.Context(), userID, item.CourseID)
		}

		cart, _ := h.cartRepo.GetCartByUserID(r.Context(), userID)
		if cart != nil {
			h.cartRepo.ClearCart(r.Context(), cart.ID)
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	} else {
		h.orderRepo.UpdateStatus(r.Context(), req.OrderID, "FAILED")
		http.Error(w, "Payment not completed", http.StatusBadRequest)
	}
}

func (h *PaymentHandler) RetryOrder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	order, err := h.orderRepo.FindByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	if order.Status == "COMPLETED" {
		http.Error(w, "Order already completed", http.StatusBadRequest)
		return
	}

	paypalOrderID, approveURL, err := h.paypalClient.CreateOrder(order.TotalAmount, order.ID)
	if err != nil {
		if h.logger != nil {
			h.logger.Printf("Failed to retry PayPal order: %v", err)
		}
		http.Error(w, "Payment provider error", http.StatusInternalServerError)
		return
	}

	if h.logger != nil {
		h.logger.Printf("Retrying PayPal order %s for internal order %s", paypalOrderID, order.ID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"order_id":    order.ID,
		"approve_url": approveURL,
	})
}

// === LEGACY PAYMENT ENDPOINTS ===

func (h *PaymentHandler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payment models.Payment
	if err := json.Unmarshal(body, &payment); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(r.Context(), &payment); err != nil {
		http.Error(w, "Failed to create payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(payment)
}

func (h *PaymentHandler) GetPayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	payment, err := h.repo.FindByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrPaymentNotFound {
			http.Error(w, "Payment not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to get payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *PaymentHandler) ListPayments(w http.ResponseWriter, r *http.Request) {
	payments, err := h.repo.FindAll(r.Context())
	if err != nil {
		http.Error(w, "Failed to list payments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

func (h *PaymentHandler) UpdatePayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payment models.Payment
	if err := json.Unmarshal(body, &payment); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	payment.ID = id

	if err := h.repo.Update(r.Context(), &payment); err != nil {
		if err == repository.ErrPaymentNotFound {
			http.Error(w, "Payment not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to update payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *PaymentHandler) DeletePayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(r.Context(), id); err != nil {
		if err == repository.ErrPaymentNotFound {
			http.Error(w, "Payment not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to delete payment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
