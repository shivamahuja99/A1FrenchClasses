package repository

import (
	"context"
	"errors"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrOrderNotFound = errors.New("order not found")
)

type OrderRepository interface {
	Create(ctx context.Context, order *models.Order) error
	FindByID(ctx context.Context, id string) (*models.Order, error)
	FindAll(ctx context.Context) ([]*models.Order, error)
	FindByUserID(ctx context.Context, userID string) ([]*models.Order, error)
	Update(ctx context.Context, order *models.Order) error
	UpdateStatus(ctx context.Context, id string, status string) error
	Delete(ctx context.Context, id string) error
}

type PostgresOrderRepository struct {
	db *gorm.DB
}

func NewPostgresOrderRepository(db *gorm.DB) OrderRepository {
	return &PostgresOrderRepository{db: db}
}

func (r *PostgresOrderRepository) Create(ctx context.Context, order *models.Order) error {
	if err := r.db.WithContext(ctx).Create(order).Error; err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}
	return nil
}

func (r *PostgresOrderRepository) FindByID(ctx context.Context, id string) (*models.Order, error) {
	var order models.Order
	if err := r.db.WithContext(ctx).Preload("Items").Preload("Items.Course").Preload("Payments").First(&order, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, fmt.Errorf("failed to find order: %w", err)
	}
	return &order, nil
}

func (r *PostgresOrderRepository) FindAll(ctx context.Context) ([]*models.Order, error) {
	var orders []*models.Order
	if err := r.db.WithContext(ctx).Preload("Items").Preload("Payments").Find(&orders).Error; err != nil {
		return nil, fmt.Errorf("failed to list orders: %w", err)
	}
	return orders, nil
}

func (r *PostgresOrderRepository) FindByUserID(ctx context.Context, userID string) ([]*models.Order, error) {
	var orders []*models.Order
	if err := r.db.WithContext(ctx).Preload("Items").Preload("Payments").Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		return nil, fmt.Errorf("failed to find user orders: %w", err)
	}
	return orders, nil
}

func (r *PostgresOrderRepository) Update(ctx context.Context, order *models.Order) error {
	result := r.db.WithContext(ctx).Model(order).Updates(order)
	if result.Error != nil {
		return fmt.Errorf("failed to update order: %w", result.Error)
	}
	return nil
}

func (r *PostgresOrderRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	result := r.db.WithContext(ctx).Model(&models.Order{}).Where("id = ?", id).Update("status", status)
	if result.Error != nil {
		return fmt.Errorf("failed to update order status: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrOrderNotFound
	}
	return nil
}

func (r *PostgresOrderRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Order{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete order: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrOrderNotFound
	}
	return nil
}
