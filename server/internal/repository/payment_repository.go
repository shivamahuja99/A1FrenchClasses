package repository

import (
	"context"
	"errors"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrPaymentNotFound = errors.New("payment not found")
)

type PaymentRepository interface {
	Create(ctx context.Context, payment *models.Payment) error
	FindByID(ctx context.Context, id string) (*models.Payment, error)
	FindAll(ctx context.Context) ([]*models.Payment, error)
	Update(ctx context.Context, payment *models.Payment) error
	Delete(ctx context.Context, id string) error
}

type PostgresPaymentRepository struct {
	db *gorm.DB
}

func NewPostgresPaymentRepository(db *gorm.DB) PaymentRepository {
	return &PostgresPaymentRepository{db: db}
}

func (r *PostgresPaymentRepository) Create(ctx context.Context, payment *models.Payment) error {
	if err := r.db.WithContext(ctx).Create(payment).Error; err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}
	return nil
}

func (r *PostgresPaymentRepository) FindByID(ctx context.Context, id string) (*models.Payment, error) {
	var payment models.Payment
	if err := r.db.WithContext(ctx).First(&payment, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaymentNotFound
		}
		return nil, fmt.Errorf("failed to find payment: %w", err)
	}
	return &payment, nil
}

func (r *PostgresPaymentRepository) FindAll(ctx context.Context) ([]*models.Payment, error) {
	var payments []*models.Payment
	if err := r.db.WithContext(ctx).Find(&payments).Error; err != nil {
		return nil, fmt.Errorf("failed to list payments: %w", err)
	}
	return payments, nil
}

func (r *PostgresPaymentRepository) Update(ctx context.Context, payment *models.Payment) error {
	result := r.db.WithContext(ctx).Model(payment).Updates(payment)
	if result.Error != nil {
		return fmt.Errorf("failed to update payment: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrPaymentNotFound
	}
	return nil
}

func (r *PostgresPaymentRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Payment{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete payment: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrPaymentNotFound
	}
	return nil
}
