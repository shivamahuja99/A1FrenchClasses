package repository

import (
	"context"
	"errors"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrCartNotFound     = errors.New("cart not found")
	ErrCartItemNotFound = errors.New("cart item not found")
)

type CartRepository interface {
	// Cart operations
	GetCartByUserID(ctx context.Context, userID string) (*models.Cart, error)
	CreateCart(ctx context.Context, cart *models.Cart) error
	ClearCart(ctx context.Context, cartID string) error
	DeleteCart(ctx context.Context, cartID string) error

	// Cart item operations
	AddItemToCart(ctx context.Context, cartItem *models.CartItem) error
	GetCartItem(ctx context.Context, cartItemID string) (*models.CartItem, error)
	UpdateCartItem(ctx context.Context, cartItem *models.CartItem) error
	RemoveItemFromCart(ctx context.Context, cartItemID string) error
	GetCartItemByCourseID(ctx context.Context, cartID, courseID string) (*models.CartItem, error)

	// Utility operations
	GetCartTotal(ctx context.Context, cartID string) (float64, error)
}

type PostgresCartRepository struct {
	db *gorm.DB
}

func NewPostgresCartRepository(db *gorm.DB) CartRepository {
	return &PostgresCartRepository{db: db}
}

// GetCartByUserID retrieves a user's cart with all items and course details
func (r *PostgresCartRepository) GetCartByUserID(ctx context.Context, userID string) (*models.Cart, error) {
	var cart models.Cart
	err := r.db.WithContext(ctx).
		Preload("Items.Course.Instructor").
		Preload("Items.Course").
		Where("user_id = ?", userID).
		First(&cart).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCartNotFound
		}
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}

	return &cart, nil
}

// CreateCart creates a new cart for a user
func (r *PostgresCartRepository) CreateCart(ctx context.Context, cart *models.Cart) error {
	if err := r.db.WithContext(ctx).Create(cart).Error; err != nil {
		return fmt.Errorf("failed to create cart: %w", err)
	}
	return nil
}

// ClearCart removes all items from a cart
func (r *PostgresCartRepository) ClearCart(ctx context.Context, cartID string) error {
	result := r.db.WithContext(ctx).Where("cart_id = ?", cartID).Delete(&models.CartItem{})
	if result.Error != nil {
		return fmt.Errorf("failed to clear cart: %w", result.Error)
	}
	return nil
}

// DeleteCart deletes a cart and all its items
func (r *PostgresCartRepository) DeleteCart(ctx context.Context, cartID string) error {
	// First delete all cart items
	if err := r.ClearCart(ctx, cartID); err != nil {
		return err
	}

	// Then delete the cart
	result := r.db.WithContext(ctx).Delete(&models.Cart{}, "id = ?", cartID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete cart: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrCartNotFound
	}
	return nil
}

// AddItemToCart adds a course to the cart
func (r *PostgresCartRepository) AddItemToCart(ctx context.Context, cartItem *models.CartItem) error {
	if err := r.db.WithContext(ctx).Create(cartItem).Error; err != nil {
		return fmt.Errorf("failed to add item to cart: %w", err)
	}
	return nil
}

// GetCartItem retrieves a specific cart item
func (r *PostgresCartRepository) GetCartItem(ctx context.Context, cartItemID string) (*models.CartItem, error) {
	var cartItem models.CartItem
	err := r.db.WithContext(ctx).
		Preload("Course").
		First(&cartItem, "id = ?", cartItemID).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCartItemNotFound
		}
		return nil, fmt.Errorf("failed to get cart item: %w", err)
	}

	return &cartItem, nil
}

// UpdateCartItem updates a cart item (e.g., quantity)
func (r *PostgresCartRepository) UpdateCartItem(ctx context.Context, cartItem *models.CartItem) error {
	result := r.db.WithContext(ctx).Model(cartItem).Updates(cartItem)
	if result.Error != nil {
		return fmt.Errorf("failed to update cart item: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrCartItemNotFound
	}
	return nil
}

// RemoveItemFromCart removes an item from the cart
func (r *PostgresCartRepository) RemoveItemFromCart(ctx context.Context, cartItemID string) error {
	result := r.db.WithContext(ctx).Delete(&models.CartItem{}, "id = ?", cartItemID)
	if result.Error != nil {
		return fmt.Errorf("failed to remove item from cart: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrCartItemNotFound
	}
	return nil
}

// GetCartItemByCourseID finds a cart item by course ID
func (r *PostgresCartRepository) GetCartItemByCourseID(ctx context.Context, cartID, courseID string) (*models.CartItem, error) {
	var cartItem models.CartItem
	err := r.db.WithContext(ctx).
		Where("cart_id = ? AND course_id = ?", cartID, courseID).
		First(&cartItem).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCartItemNotFound
		}
		return nil, fmt.Errorf("failed to get cart item by course: %w", err)
	}

	return &cartItem, nil
}

// GetCartTotal calculates the total price of all items in the cart
func (r *PostgresCartRepository) GetCartTotal(ctx context.Context, cartID string) (float64, error) {
	var total float64
	err := r.db.WithContext(ctx).
		Model(&models.CartItem{}).
		Where("cart_id = ?", cartID).
		Select("COALESCE(SUM(price * quantity), 0)").
		Scan(&total).Error

	if err != nil {
		return 0, fmt.Errorf("failed to calculate cart total: %w", err)
	}

	return total, nil
}
