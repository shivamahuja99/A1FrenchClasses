package repository

import (
	"context"
	"fmt"
	"services/internal/models"

	"gorm.io/gorm"
)

type LeadRepository interface {
	CreateLead(ctx context.Context, lead *models.Lead) error
	GetLeadByID(ctx context.Context, id int) (*models.Lead, error)
	ListLeads(ctx context.Context) ([]*models.Lead, error)
}

type PostgresLeadRepository struct {
	db *gorm.DB
}

func NewPostgresLeadRepository(db *gorm.DB) *PostgresLeadRepository {
	return &PostgresLeadRepository{db: db}
}

func (r *PostgresLeadRepository) CreateLead(ctx context.Context, lead *models.Lead) error {
	if err := r.db.WithContext(ctx).Create(lead).Error; err != nil {
		return fmt.Errorf("could not create lead: %w", err)
	}
	return nil
}

func (r *PostgresLeadRepository) GetLeadByID(ctx context.Context, id int) (*models.Lead, error) {
	var lead models.Lead
	if err := r.db.WithContext(ctx).First(&lead, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("could not get lead: %w", err)
	}
	return &lead, nil
}

func (r *PostgresLeadRepository) ListLeads(ctx context.Context) ([]*models.Lead, error) {
	var leads []*models.Lead
	if err := r.db.WithContext(ctx).Order("created_at desc").Find(&leads).Error; err != nil {
		return nil, fmt.Errorf("could not list leads: %w", err)
	}
	return leads, nil
}
