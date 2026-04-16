package repository

import (
	"context"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SettingsRepository interface {
	GetSetting(ctx context.Context, key string) (string, error)
	SetSetting(ctx context.Context, key string, value string) error
	ListSettings(ctx context.Context) ([]*models.AppSetting, error)
}

type PostgresSettingsRepository struct {
	db *gorm.DB
}

func NewPostgresSettingsRepository(db *gorm.DB) *PostgresSettingsRepository {
	return &PostgresSettingsRepository{db: db}
}

func (r *PostgresSettingsRepository) GetSetting(ctx context.Context, key string) (string, error) {
	var setting models.AppSetting
	if err := r.db.WithContext(ctx).Where("key = ?", key).First(&setting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", fmt.Errorf("could not get setting: %w", err)
	}
	return setting.Value, nil
}

func (r *PostgresSettingsRepository) SetSetting(ctx context.Context, key string, value string) error {
	setting := models.AppSetting{
		Key:   key,
		Value: value,
	}
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value"}),
	}).Create(&setting).Error; err != nil {
		return fmt.Errorf("could not set setting: %w", err)
	}
	return nil
}

func (r *PostgresSettingsRepository) ListSettings(ctx context.Context) ([]*models.AppSetting, error) {
	var settings []*models.AppSetting
	if err := r.db.WithContext(ctx).Find(&settings).Error; err != nil {
		return nil, fmt.Errorf("could not list settings: %w", err)
	}
	return settings, nil
}
