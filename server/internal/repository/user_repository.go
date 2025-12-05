package repository

import (
	"context"
	"errors"
	"fmt"

	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrUserNotFound = errors.New("user not found")
	ErrUserExists   = errors.New("user already exists")
)

// UserRepository defines the interface for user data access
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id string) (*models.User, error)
	FindByGoogleID(ctx context.Context, googleID string) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindAll(ctx context.Context) ([]*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id string) error
	GetPurchasedCourses(ctx context.Context, userID string) ([]*models.Course, error)
}

// PostgresUserRepository implements UserRepository using PostgreSQL and GORM
type PostgresUserRepository struct {
	db *gorm.DB
}

// NewPostgresUserRepository creates a new PostgreSQL user repository
func NewPostgresUserRepository(db *gorm.DB) UserRepository {
	return &PostgresUserRepository{
		db: db,
	}
}

// Create inserts a new user into the database
func (r *PostgresUserRepository) Create(ctx context.Context, user *models.User) error {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrUserExists
		}
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// FindByID retrieves a user by their ID
func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	return &user, nil
}

// FindByGoogleID retrieves a user by their Google ID
func (r *PostgresUserRepository) FindByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Where("google_id = ?", googleID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by google_id: %w", err)
	}
	return &user, nil
}

// FindByEmail retrieves a user by their email
func (r *PostgresUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}
	return &user, nil
}

// FindAll retrieves all users from the database
func (r *PostgresUserRepository) FindAll(ctx context.Context) ([]*models.User, error) {
	var users []*models.User
	if err := r.db.WithContext(ctx).Order("created_at desc").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	return users, nil
}

// Update updates an existing user in the database
func (r *PostgresUserRepository) Update(ctx context.Context, user *models.User) error {
	result := r.db.WithContext(ctx).Model(user).Updates(user)
	if result.Error != nil {
		return fmt.Errorf("failed to update user: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// Delete removes a user from the database
func (r *PostgresUserRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete user: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// GetPurchasedCourses retrieves all courses purchased by a specific user
func (r *PostgresUserRepository) GetPurchasedCourses(ctx context.Context, userID string) ([]*models.Course, error) {
	var courses []*models.Course
	err := r.db.WithContext(ctx).
		Joins("JOIN user_courses ON user_courses.course_id = courses.id").
		Where("user_courses.user_id = ?", userID).
		Find(&courses).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get purchased courses: %w", err)
	}
	return courses, nil
}
