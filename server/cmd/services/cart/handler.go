package cart

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/models"
	"services/internal/repository"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CartHandler struct {
	logger     *slog.Logger
	cartRepo   repository.CartRepository
	courseRepo repository.CourseRepository
}

func NewCartHandler(logger *slog.Logger, db *gorm.DB) *CartHandler {
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
	ctx := r.Context()
	// Get user ID from context (set by auth middleware)
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	cart, err := h.cartRepo.GetCartByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrCartNotFound) {
			// Create a new cart if one doesn't exist
			newCart := &models.Cart{
				UserID: userID,
				Items:  []models.CartItem{},
			}
			if err := h.cartRepo.CreateCart(ctx, newCart); err != nil {
				h.logger.ErrorContext(ctx, "Error creating cart", "error", err)
				api.RespondWithError(w, http.StatusInternalServerError, "Failed to create cart")
				return
			}
			cart = newCart
		} else {
			h.logger.ErrorContext(ctx, "Error getting cart", "error", err)
			api.RespondWithError(w, http.StatusInternalServerError, "Failed to get cart")
			return
		}
	}

	// Calculate total
	total, err := h.cartRepo.GetCartTotal(ctx, cart.ID)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error calculating cart total", "error", err)
	}

	response := map[string]interface{}{
		"cart":  cart,
		"total": total,
	}

	api.RespondWithJSON(w, http.StatusOK, response)
}

// AddToCart adds a course to the user's cart
func (h *CartHandler) AddToCart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var req struct {
		CourseID string `json:"course_id"`
	}

	if err := json.Unmarshal(body, &req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	// Get or create cart
	cart, err := h.cartRepo.GetCartByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrCartNotFound) {
			newCart := &models.Cart{UserID: userID}
			if err := h.cartRepo.CreateCart(ctx, newCart); err != nil {
				h.logger.ErrorContext(ctx, "Error creating cart", "error", err)
				api.RespondWithError(w, http.StatusInternalServerError, "Failed to create cart")
				return
			}
			cart = newCart
		} else {
			h.logger.ErrorContext(ctx, "Error getting cart", "error", err)
			api.RespondWithError(w, http.StatusInternalServerError, "Failed to get cart")
			return
		}
	}

	// Get course details to get the price
	course, err := h.courseRepo.FindByID(ctx, req.CourseID)
	if err != nil {
		if errors.Is(err, repository.ErrCourseNotFound) {
			api.RespondWithError(w, http.StatusNotFound, "Course not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error getting course", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get course")
		return
	}

	// Calculate price (with discount if applicable)
	price := course.Price
	if course.Discount > 0 {
		price = course.Price * (1 - course.Discount/100)
	}

	// Check if course already in cart
	existingItem, err := h.cartRepo.GetCartItemByCourseID(ctx, cart.ID, req.CourseID)
	if err == nil {
		api.RespondWithJSON(w, http.StatusOK, existingItem)
		return
	}

	// Add new item to cart
	cartItem := &models.CartItem{
		CartID:   cart.ID,
		CourseID: req.CourseID,
		Price:    price,
	}

	if err := h.cartRepo.AddItemToCart(ctx, cartItem); err != nil {
		h.logger.ErrorContext(ctx, "Error adding item to cart", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to add item to cart")
		return
	}

	api.RespondWithJSON(w, http.StatusCreated, cartItem)
}


// RemoveFromCart removes an item from the cart
func (h *CartHandler) RemoveFromCart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	vars := mux.Vars(r)
	itemID := vars["id"]

	// Get cart item to verify ownership
	cartItem, err := h.cartRepo.GetCartItem(ctx, itemID)
	if err != nil {
		if errors.Is(err, repository.ErrCartItemNotFound) {
			api.RespondWithError(w, http.StatusNotFound, "Cart item not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error getting cart item", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get cart item")
		return
	}

	// Verify the cart belongs to the user
	cart, err := h.cartRepo.GetCartByUserID(ctx, userID)
	if err != nil || cart.ID != cartItem.CartID {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Remove item
	if err := h.cartRepo.RemoveItemFromCart(ctx, itemID); err != nil {
		h.logger.ErrorContext(ctx, "Error removing cart item", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to remove cart item")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ClearCart removes all items from the user's cart
func (h *CartHandler) ClearCart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	cart, err := h.cartRepo.GetCartByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrCartNotFound) {
			api.RespondWithError(w, http.StatusNotFound, "Cart not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error getting cart", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get cart")
		return
	}

	if err := h.cartRepo.ClearCart(ctx, cart.ID); err != nil {
		h.logger.ErrorContext(ctx, "Error clearing cart", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to clear cart")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
