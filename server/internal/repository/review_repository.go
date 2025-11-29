package repository

import (
	"context"
	"errors"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrReviewNotFound = errors.New("review not found")
)

type ReviewRepository interface {
	Create(ctx context.Context, review *models.Review) error
	FindByID(ctx context.Context, id string) (*models.Review, error)
	FindAll(ctx context.Context) ([]*models.Review, error)
	Update(ctx context.Context, review *models.Review) error
	Delete(ctx context.Context, id string) error
}

type PostgresReviewRepository struct {
	db *gorm.DB
}

func NewPostgresReviewRepository(db *gorm.DB) ReviewRepository {
	return &PostgresReviewRepository{db: db}
}

func (r *PostgresReviewRepository) Create(ctx context.Context, review *models.Review) error {
	if err := r.db.WithContext(ctx).Create(review).Error; err != nil {
		return fmt.Errorf("failed to create review: %w", err)
	}
	return nil
}

func (r *PostgresReviewRepository) FindByID(ctx context.Context, id string) (*models.Review, error) {
	var review models.Review
	if err := r.db.WithContext(ctx).First(&review, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, fmt.Errorf("failed to find review: %w", err)
	}
	return &review, nil
}

func (r *PostgresReviewRepository) FindAll(ctx context.Context) ([]*models.Review, error) {
	var reviews []*models.Review
	if err := r.db.WithContext(ctx).Find(&reviews).Error; err != nil {
		return nil, fmt.Errorf("failed to list reviews: %w", err)
	}
	return reviews, nil
}

func (r *PostgresReviewRepository) Update(ctx context.Context, review *models.Review) error {
	result := r.db.WithContext(ctx).Model(review).Updates(review)
	if result.Error != nil {
		return fmt.Errorf("failed to update review: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrReviewNotFound
	}
	return nil
}

func (r *PostgresReviewRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Review{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete review: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrReviewNotFound
	}
	return nil
}
