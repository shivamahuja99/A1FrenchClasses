package cart

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"services/internal/models"
	"services/internal/repository"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CartHandler struct {
	logger     *log.Logger
	cartRepo   repository.CartRepository
	courseRepo repository.CourseRepository
}

func NewCartHandler(logger *log.Logger, db *gorm.DB) *CartHandler {
	cartRepo := repository.NewPostgresCartRepository(db)
	courseRepo := repository.NewPostgresCourseRepository(db)
	return &CartHandler{
		logger:     logger,
		cartRepo:   cartRepo,
		courseRepo: courseRepo,
	}
}

// GetCart retrieves the user's cart
func (h *CartHandler) GetCart(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	cart, err := h.cartRepo.GetCartByUserID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrCartNotFound) {
			// Create a new cart if one doesn't exist
			newCart := &models.Cart{
				UserID: userID,
				Items:  []models.CartItem{},
			}
			if err := h.cartRepo.CreateCart(r.Context(), newCart); err != nil {
				h.logger.Printf("Error creating cart: %v", err)
				http.Error(w, "Failed to create cart", http.StatusInternalServerError)
				return
			}
			cart = newCart
		} else {
			h.logger.Printf("Error getting cart: %v", err)
			http.Error(w, "Failed to get cart", http.StatusInternalServerError)
			return
		}
	}

	// Calculate total
	total, err := h.cartRepo.GetCartTotal(r.Context(), cart.ID)
	if err != nil {
		h.logger.Printf("Error calculating cart total: %v", err)
	}

	response := map[string]interface{}{
		"cart":  cart,
		"total": total,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// AddToCart adds a course to the user's cart
func (h *CartHandler) AddToCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req struct {
		CourseID string `json:"course_id"`
		Quantity int    `json:"quantity"`
	}

	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	// Get or create cart
	cart, err := h.cartRepo.GetCartByUserID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrCartNotFound) {
			newCart := &models.Cart{UserID: userID}
			if err := h.cartRepo.CreateCart(r.Context(), newCart); err != nil {
				h.logger.Printf("Error creating cart: %v", err)
				http.Error(w, "Failed to create cart", http.StatusInternalServerError)
				return
			}
			cart = newCart
		} else {
			h.logger.Printf("Error getting cart: %v", err)
			http.Error(w, "Failed to get cart", http.StatusInternalServerError)
			return
		}
	}

	// Get course details to get the price
	course, err := h.courseRepo.FindByID(r.Context(), req.CourseID)
	if err != nil {
		if errors.Is(err, repository.ErrCourseNotFound) {
			http.Error(w, "Course not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting course: %v", err)
		http.Error(w, "Failed to get course", http.StatusInternalServerError)
		return
	}

	// Calculate price (with discount if applicable)
	price := course.Price
	if course.Discount > 0 {
		price = course.Price * (1 - course.Discount/100)
	}

	// Check if course already in cart
	existingItem, err := h.cartRepo.GetCartItemByCourseID(r.Context(), cart.ID, req.CourseID)
	if err == nil {
		// Update quantity
		existingItem.Quantity += req.Quantity
		if err := h.cartRepo.UpdateCartItem(r.Context(), existingItem); err != nil {
			h.logger.Printf("Error updating cart item: %v", err)
			http.Error(w, "Failed to update cart item", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(existingItem)
		return
	}

	// Add new item to cart
	cartItem := &models.CartItem{
		CartID:   cart.ID,
		CourseID: req.CourseID,
		Quantity: req.Quantity,
		Price:    price,
	}

	if err := h.cartRepo.AddItemToCart(r.Context(), cartItem); err != nil {
		h.logger.Printf("Error adding item to cart: %v", err)
		http.Error(w, "Failed to add item to cart", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cartItem)
}

// UpdateCartItem updates the quantity of a cart item
func (h *CartHandler) UpdateCartItem(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	itemID := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req struct {
		Quantity int `json:"quantity"`
	}

	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if req.Quantity <= 0 {
		http.Error(w, "Quantity must be greater than 0", http.StatusBadRequest)
		return
	}

	// Get cart item
	cartItem, err := h.cartRepo.GetCartItem(r.Context(), itemID)
	if err != nil {
		if errors.Is(err, repository.ErrCartItemNotFound) {
			http.Error(w, "Cart item not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting cart item: %v", err)
		http.Error(w, "Failed to get cart item", http.StatusInternalServerError)
		return
	}

	// Verify the cart belongs to the user
	cart, err := h.cartRepo.GetCartByUserID(r.Context(), userID)
	if err != nil || cart.ID != cartItem.CartID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Update quantity
	cartItem.Quantity = req.Quantity
	if err := h.cartRepo.UpdateCartItem(r.Context(), cartItem); err != nil {
		h.logger.Printf("Error updating cart item: %v", err)
		http.Error(w, "Failed to update cart item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cartItem)
}

// RemoveFromCart removes an item from the cart
func (h *CartHandler) RemoveFromCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	itemID := vars["id"]

	// Get cart item to verify ownership
	cartItem, err := h.cartRepo.GetCartItem(r.Context(), itemID)
	if err != nil {
		if errors.Is(err, repository.ErrCartItemNotFound) {
			http.Error(w, "Cart item not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting cart item: %v", err)
		http.Error(w, "Failed to get cart item", http.StatusInternalServerError)
		return
	}

	// Verify the cart belongs to the user
	cart, err := h.cartRepo.GetCartByUserID(r.Context(), userID)
	if err != nil || cart.ID != cartItem.CartID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Remove item
	if err := h.cartRepo.RemoveItemFromCart(r.Context(), itemID); err != nil {
		h.logger.Printf("Error removing cart item: %v", err)
		http.Error(w, "Failed to remove cart item", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ClearCart removes all items from the user's cart
func (h *CartHandler) ClearCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	cart, err := h.cartRepo.GetCartByUserID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrCartNotFound) {
			http.Error(w, "Cart not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting cart: %v", err)
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
		return
	}

	if err := h.cartRepo.ClearCart(r.Context(), cart.ID); err != nil {
		h.logger.Printf("Error clearing cart: %v", err)
		http.Error(w, "Failed to clear cart", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
