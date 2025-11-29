package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"services/internal/models"

	"gorm.io/gorm"
)

var (
	ErrSessionNotFound = errors.New("session not found")
	ErrInvalidToken    = errors.New("invalid token")
)

type SessionRepository interface {
	CreateSession(ctx context.Context, session *models.Session) error
	FindByAccessToken(ctx context.Context, token string) (*models.Session, error)
	FindByRefreshToken(ctx context.Context, token string) (*models.Session, error)
	DeleteSession(ctx context.Context, token string) error
	DeleteExpiredSessions(ctx context.Context) error
	DeleteUserSessions(ctx context.Context, userID string) error
}

type PostgresSessionRepository struct {
	db *gorm.DB
}

func NewPostgresSessionRepository(db *gorm.DB) SessionRepository {
	return &PostgresSessionRepository{db: db}
}

func (r *PostgresSessionRepository) CreateSession(ctx context.Context, session *models.Session) error {
	if err := r.db.WithContext(ctx).Create(session).Error; err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	return nil
}

func (r *PostgresSessionRepository) FindByAccessToken(ctx context.Context, token string) (*models.Session, error) {
	var session models.Session
	if err := r.db.WithContext(ctx).Preload("User").Where("access_token = ?", token).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to find session: %w", err)
	}

	// Check if session is expired
	if session.ExpiresAt.Before(time.Now()) {
		return nil, ErrInvalidToken
	}

	return &session, nil
}

func (r *PostgresSessionRepository) FindByRefreshToken(ctx context.Context, token string) (*models.Session, error) {
	var session models.Session
	if err := r.db.WithContext(ctx).Preload("User").Where("refresh_token = ?", token).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to find session: %w", err)
	}
	return &session, nil
}

func (r *PostgresSessionRepository) DeleteSession(ctx context.Context, token string) error {
	result := r.db.WithContext(ctx).Where("access_token = ? OR refresh_token = ?", token, token).Delete(&models.Session{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete session: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrSessionNotFound
	}
	return nil
}

func (r *PostgresSessionRepository) DeleteExpiredSessions(ctx context.Context) error {
	if err := r.db.WithContext(ctx).Where("expires_at < ?", time.Now()).Delete(&models.Session{}).Error; err != nil {
		return fmt.Errorf("failed to delete expired sessions: %w", err)
	}
	return nil
}

func (r *PostgresSessionRepository) DeleteUserSessions(ctx context.Context, userID string) error {
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.Session{}).Error; err != nil {
		return fmt.Errorf("failed to delete user sessions: %w", err)
	}
	return nil
}
