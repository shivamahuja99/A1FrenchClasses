package leads

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/models"
	"services/internal/repository"
	"services/internal/service"

	"gorm.io/gorm"
)

type LeadHandler struct {
	logger              *slog.Logger
	leadRepo            repository.LeadRepository
	settingsRepo        repository.SettingsRepository
	notificationService *service.NotificationService
}

func NewLeadHandler(logger *slog.Logger, db *gorm.DB) *LeadHandler {
	leadRepo := repository.NewPostgresLeadRepository(db)
	settingsRepo := repository.NewPostgresSettingsRepository(db)
	notificationService := service.NewNotificationService(logger, settingsRepo)
	return &LeadHandler{
		logger:              logger,
		leadRepo:            leadRepo,
		settingsRepo:        settingsRepo,
		notificationService: notificationService,
	}
}

func (h *LeadHandler) CreateLead(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.InfoContext(ctx, "Receiving new contact inquiry")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error reading request body", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var lead models.Lead
	if err := json.Unmarshal(body, &lead); err != nil {
		h.logger.ErrorContext(ctx, "Error parsing JSON", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	// Default status
	if lead.Status == "" {
		lead.Status = "new"
	}

	// 1. Save to Database
	if err := h.leadRepo.CreateLead(ctx, &lead); err != nil {
		h.logger.ErrorContext(ctx, "Error saving lead to database", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to save inquiry")
		return
	}

	// 2. Load settings for notifications
	recipientEmail, _ := h.settingsRepo.GetSetting(ctx, "contact_recipient_email")
	whatsappNumber, _ := h.settingsRepo.GetSetting(ctx, "contact_whatsapp_number")
	spreadsheetID, _ := h.settingsRepo.GetSetting(ctx, "google_spreadsheet_id")

	h.logger.InfoContext(ctx, "Triggering lead notifications", 
		"recipient", recipientEmail, 
		"whatsapp", whatsappNumber, 
		"sheet_id", spreadsheetID)

	// 2. Trigger asynchronous notifications (Email, WhatsApp, Google Sheets)
	h.notificationService.NotifyLead(ctx, lead)

	h.logger.InfoContext(ctx, "Processed contact inquiry", "lead_id", lead.ID)

	api.RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Contact inquiry submitted successfully",
		"lead_id": lead.ID,
	})
}

func (h *LeadHandler) ListLeads(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	leads, err := h.leadRepo.ListLeads(ctx)
	if (err != nil) {
		h.logger.ErrorContext(ctx, "Error listing leads", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to list leads")
		return
	}
	api.RespondWithJSON(w, http.StatusOK, leads)
}
