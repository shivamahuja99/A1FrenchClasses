package repository

import (
	"context"
	"errors"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrPaymentPlanNotFound = errors.New("payment plan not found")
)

type PaymentPlanRepository interface {
	Create(ctx context.Context, plan *models.PaymentPlan) error
	FindByID(ctx context.Context, id string) (*models.PaymentPlan, error)
	FindAll(ctx context.Context) ([]*models.PaymentPlan, error)
	Update(ctx context.Context, plan *models.PaymentPlan) error
	Delete(ctx context.Context, id string) error
}

type PostgresPaymentPlanRepository struct {
	db *gorm.DB
}

func NewPostgresPaymentPlanRepository(db *gorm.DB) PaymentPlanRepository {
	return &PostgresPaymentPlanRepository{db: db}
}

func (r *PostgresPaymentPlanRepository) Create(ctx context.Context, plan *models.PaymentPlan) error {
	if err := r.db.WithContext(ctx).Create(plan).Error; err != nil {
		return fmt.Errorf("failed to create payment plan: %w", err)
	}
	return nil
}

func (r *PostgresPaymentPlanRepository) FindByID(ctx context.Context, id string) (*models.PaymentPlan, error) {
	var plan models.PaymentPlan
	if err := r.db.WithContext(ctx).First(&plan, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaymentPlanNotFound
		}
		return nil, fmt.Errorf("failed to find payment plan: %w", err)
	}
	return &plan, nil
}

func (r *PostgresPaymentPlanRepository) FindAll(ctx context.Context) ([]*models.PaymentPlan, error) {
	var plans []*models.PaymentPlan
	if err := r.db.WithContext(ctx).Find(&plans).Error; err != nil {
		return nil, fmt.Errorf("failed to list payment plans: %w", err)
	}
	return plans, nil
}

func (r *PostgresPaymentPlanRepository) Update(ctx context.Context, plan *models.PaymentPlan) error {
	result := r.db.WithContext(ctx).Model(plan).Updates(plan)
	if result.Error != nil {
		return fmt.Errorf("failed to update payment plan: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrPaymentPlanNotFound
	}
	return nil
}

func (r *PostgresPaymentPlanRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.PaymentPlan{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete payment plan: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrPaymentPlanNotFound
	}
	return nil
}
