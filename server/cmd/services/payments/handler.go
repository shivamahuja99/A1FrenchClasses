package payments

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/models"
	"services/internal/paypal"
	"services/internal/repository"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// PayPalClient is an interface for PayPal operations so it can be mocked in tests.
type PayPalClient interface {
	CreateOrder(amount float64, orderID string) (string, string, error)
	CaptureOrder(orderID string) (string, error)
}

type PaymentHandler struct {
	logger       *slog.Logger
	repo         repository.PaymentRepository
	orderRepo    repository.OrderRepository
	cartRepo     repository.CartRepository
	userRepo     repository.UserRepository
	db           *gorm.DB
	paypalClient PayPalClient
}

func NewPaymentHandler(logger *slog.Logger, db *gorm.DB) *PaymentHandler {
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
	ctx := r.Context()
	// 1. Get UserID
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok || userID == "" {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// 2. Get Cart
	cart, err := h.cartRepo.GetCartByUserID(ctx, userID)
	if err != nil || len(cart.Items) == 0 {
		api.RespondWithError(w, http.StatusBadRequest, "Cart is empty or not found")
		return
	}

	// 3. Calculate total
	total, err := h.cartRepo.GetCartTotal(ctx, cart.ID)
	if err != nil || total <= 0 {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid cart total")
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

	if err := h.orderRepo.Create(ctx, &order); err != nil {
		h.logger.ErrorContext(ctx, "Failed to create order", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create order")
		return
	}

	// 6. Create PayPal Order
	paypalOrderID, approveURL, err := h.paypalClient.CreateOrder(total, order.ID)
	if err != nil {
		h.logger.ErrorContext(ctx, "Failed to create PayPal order", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Payment provider error")
		return
	}

	h.logger.InfoContext(ctx, "Created PayPal order", "paypal_order_id", paypalOrderID, "order_id", order.ID)

	api.RespondWithJSON(w, http.StatusOK, map[string]string{
		"order_id":    order.ID,
		"approve_url": approveURL,
	})
}

func (h *PaymentHandler) CaptureCheckout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req struct {
		OrderID string `json:"order_id"`
		Token   string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	// 1. Fetch current order status for idempotency check
	order, err := h.orderRepo.FindByID(ctx, req.OrderID)
	if err != nil {
		h.logger.ErrorContext(ctx, "Order not found", "order_id", req.OrderID)
		api.RespondWithError(w, http.StatusNotFound, "Order not found")
		return
	}

	// If already completed, return success immediately (Idempotency)
	if order.Status == "COMPLETED" {
		h.logger.InfoContext(ctx, "Order already COMPLETED, skipping double capture", "order_id", req.OrderID)
		api.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "success", "message": "already_completed"})
		return
	}

	// 2. Capture PayPal Order
	status, err := h.paypalClient.CaptureOrder(req.Token)
	if err != nil {
		h.logger.ErrorContext(ctx, "Failed to capture PayPal order", "error", err)

		// Check if error is due to order already being captured
		isAlreadyCaptured := (strings.Contains(err.Error(), ErrOrderAlreadyCaptured) ||
			strings.Contains(err.Error(), ErrDuplicateResource) ||
			strings.Contains(err.Error(), StatusUnprocessableEntity) ||
			strings.Contains(err.Error(), StatusBadRequest))

		if isAlreadyCaptured {
			h.logger.InfoContext(ctx, "PayPal reported order already captured or duplicate. Marking as COMPLETED.", "order_id", req.OrderID)
			status = "COMPLETED"
		} else {
			_ = h.orderRepo.UpdateStatus(ctx, req.OrderID, "FAILED")
			api.RespondWithError(w, http.StatusBadRequest, "Failed to capture payment")
			return
		}
	}

	if status == "COMPLETED" {
		if err := h.orderRepo.UpdateStatus(ctx, req.OrderID, "COMPLETED"); err != nil {
			h.logger.ErrorContext(ctx, "Failed to update order status to COMPLETED", "order_id", req.OrderID, "error", err)
		}

		// Re-fetch or use existing order object if it hasn't changed (Items are needed)
		if order.Items == nil {
			order, _ = h.orderRepo.FindByID(ctx, req.OrderID)
		}

		payment := models.Payment{
			OrderID:             req.OrderID,
			TransactionAmount:   order.TotalAmount,
			TransactionMethod:   "PAYPAL",
			TransactionStatus:   "SUCCESS",
			PayPalTransactionID: req.Token,
		}
		if err := h.repo.Create(ctx, &payment); err != nil {
			h.logger.ErrorContext(ctx, "Failed to create payment record", "order_id", req.OrderID, "error", err)
		}

		userID, _ := ctx.Value(models.UserIDContextKey).(string)
		for _, item := range order.Items {
			if err := h.userRepo.AssignCourse(ctx, userID, item.CourseID); err != nil {
				h.logger.ErrorContext(ctx, "Failed to assign course to user", "user_id", userID, "course_id", item.CourseID, "error", err)
			}
		}

		cart, _ := h.cartRepo.GetCartByUserID(ctx, userID)
		if cart != nil {
			if err := h.cartRepo.ClearCart(ctx, cart.ID); err != nil {
				h.logger.ErrorContext(ctx, "Failed to clear cart", "cart_id", cart.ID, "error", err)
			}
		}

		api.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "success"})
	} else {
		_ = h.orderRepo.UpdateStatus(ctx, req.OrderID, "FAILED")
		api.RespondWithError(w, http.StatusBadRequest, "Payment not completed")
	}
}

func (h *PaymentHandler) RetryOrder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	order, err := h.orderRepo.FindByID(ctx, id)
	if err != nil {
		api.RespondWithError(w, http.StatusNotFound, "Order not found")
		return
	}

	if order.Status == "COMPLETED" {
		api.RespondWithError(w, http.StatusBadRequest, "Order already completed")
		return
	}

	paypalOrderID, approveURL, err := h.paypalClient.CreateOrder(order.TotalAmount, order.ID)
	if err != nil {
		h.logger.ErrorContext(ctx, "Failed to retry PayPal order", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Payment provider error")
		return
	}

	h.logger.InfoContext(ctx, "Retrying PayPal order", "paypal_order_id", paypalOrderID, "order_id", order.ID)

	api.RespondWithJSON(w, http.StatusOK, map[string]string{
		"order_id":    order.ID,
		"approve_url": approveURL,
	})
}

// === LEGACY PAYMENT ENDPOINTS ===

func (h *PaymentHandler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var payment models.Payment
	if err := json.Unmarshal(body, &payment); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	if err := h.repo.Create(ctx, &payment); err != nil {
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create payment")
		return
	}

	api.RespondWithJSON(w, http.StatusCreated, payment)
}

func (h *PaymentHandler) GetPayment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	payment, err := h.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrPaymentNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Payment not found")
			return
		}
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get payment")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, payment)
}

func (h *PaymentHandler) ListPayments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	payments, err := h.repo.FindAll(ctx)
	if err != nil {
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to list payments")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, payments)
}

func (h *PaymentHandler) UpdatePayment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var payment models.Payment
	if err := json.Unmarshal(body, &payment); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	payment.ID = id

	if err := h.repo.Update(ctx, &payment); err != nil {
		if err == repository.ErrPaymentNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Payment not found")
			return
		}
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to update payment")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, payment)
}

func (h *PaymentHandler) DeletePayment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrPaymentNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Payment not found")
			return
		}
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to delete payment")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
