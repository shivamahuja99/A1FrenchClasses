package paymentplans

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/models"
	"services/internal/repository"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PaymentPlanHandler struct {
	logger *slog.Logger
	repo   repository.PaymentPlanRepository
}

func NewPaymentPlanHandler(logger *slog.Logger, db *gorm.DB) *PaymentPlanHandler {
	repo := repository.NewPostgresPaymentPlanRepository(db)
	return &PaymentPlanHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *PaymentPlanHandler) CreatePaymentPlan(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.InfoContext(ctx, "Creating PaymentPlan")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error reading request body", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var plan models.PaymentPlan
	if err := json.Unmarshal(body, &plan); err != nil {
		h.logger.ErrorContext(ctx, "Error parsing JSON", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	if err := h.repo.Create(ctx, &plan); err != nil {
		h.logger.ErrorContext(ctx, "Error creating payment plan", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create payment plan")
		return
	}

	api.RespondWithJSON(w, http.StatusCreated, plan)
}

func (h *PaymentPlanHandler) GetPaymentPlan(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	plan, err := h.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrPaymentPlanNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Payment plan not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error getting payment plan", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get payment plan")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, plan)
}

func (h *PaymentPlanHandler) ListPaymentPlans(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	plans, err := h.repo.FindAll(ctx)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error listing payment plans", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to list payment plans")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, plans)
}

func (h *PaymentPlanHandler) UpdatePaymentPlan(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var plan models.PaymentPlan
	if err := json.Unmarshal(body, &plan); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid ID format")
		return
	}
	plan.ID = uint(idUint)

	if err := h.repo.Update(ctx, &plan); err != nil {
		if err == repository.ErrPaymentPlanNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Payment plan not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error updating payment plan", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to update payment plan")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, plan)
}

func (h *PaymentPlanHandler) DeletePaymentPlan(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrPaymentPlanNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Payment plan not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error deleting payment plan", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to delete payment plan")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
