package repository

import (
	"context"
	"errors"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrCourseNotFound = errors.New("course not found")
)

type CourseRepository interface {
	Create(ctx context.Context, course *models.Course) error
	FindByID(ctx context.Context, id string) (*models.Course, error)
	FindAll(ctx context.Context) ([]*models.Course, error)
	Update(ctx context.Context, course *models.Course) error
	Delete(ctx context.Context, id string) error
}

type PostgresCourseRepository struct {
	db *gorm.DB
}

func NewPostgresCourseRepository(db *gorm.DB) CourseRepository {
	return &PostgresCourseRepository{db: db}
}

func (r *PostgresCourseRepository) Create(ctx context.Context, course *models.Course) error {
	if err := r.db.WithContext(ctx).Create(course).Error; err != nil {
		return fmt.Errorf("failed to create course: %w", err)
	}
	return nil
}

func (r *PostgresCourseRepository) FindByID(ctx context.Context, id string) (*models.Course, error) {
	var course models.Course
	if err := r.db.WithContext(ctx).First(&course, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, fmt.Errorf("failed to find course: %w", err)
	}
	return &course, nil
}

func (r *PostgresCourseRepository) FindAll(ctx context.Context) ([]*models.Course, error) {
	var courses []*models.Course
	if err := r.db.WithContext(ctx).Find(&courses).Error; err != nil {
		return nil, fmt.Errorf("failed to list courses: %w", err)
	}
	return courses, nil
}

func (r *PostgresCourseRepository) Update(ctx context.Context, course *models.Course) error {
	result := r.db.WithContext(ctx).Model(course).Updates(course)
	if result.Error != nil {
		return fmt.Errorf("failed to update course: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrCourseNotFound
	}
	return nil
}

func (r *PostgresCourseRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Course{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete course: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrCourseNotFound
	}
	return nil
}
