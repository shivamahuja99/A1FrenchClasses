package home

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/repository"

	"gorm.io/gorm"
)

type FAQItem struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type TestimonialItem struct {
	Stars    string `json:"stars"`
	Tag      string `json:"tag"`
	Quote    string `json:"quote"`
	Initials string `json:"initials"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	AvatarBg string `json:"avatar_bg"`
}

type WhyUsItem struct {
	Icon        string `json:"icon"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type HomeContentResponse struct {
	FAQ          []FAQItem         `json:"faq"`
	Testimonials []TestimonialItem `json:"testimonials"`
	WhyUs        []WhyUsItem       `json:"why_us"`
}

type HomeHandler struct {
	logger       *slog.Logger
	settingsRepo repository.SettingsRepository
}

func NewHomeHandler(logger *slog.Logger, db *gorm.DB) *HomeHandler {
	settingsRepo := repository.NewPostgresSettingsRepository(db)
	return &HomeHandler{
		logger:       logger,
		settingsRepo: settingsRepo,
	}
}

func (h *HomeHandler) GetHomeContent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	response := HomeContentResponse{
		FAQ:          []FAQItem{},
		Testimonials: []TestimonialItem{},
		WhyUs:        []WhyUsItem{},
	}

	if err := h.loadJSONSetting(ctx, "homepage_faq", &response.FAQ); err != nil {
		h.logger.ErrorContext(ctx, "Failed to load homepage FAQ", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to load homepage content")
		return
	}
	if err := h.loadJSONSetting(ctx, "homepage_testimonials", &response.Testimonials); err != nil {
		h.logger.ErrorContext(ctx, "Failed to load homepage testimonials", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to load homepage content")
		return
	}
	if err := h.loadJSONSetting(ctx, "homepage_why_us", &response.WhyUs); err != nil {
		h.logger.ErrorContext(ctx, "Failed to load homepage why us", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to load homepage content")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, response)
}

func (h *HomeHandler) loadJSONSetting(ctx context.Context, key string, dest any) error {
	value, err := h.settingsRepo.GetSetting(ctx, key)
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	return json.Unmarshal([]byte(value), dest)
}
