package paymentplans

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"services/internal/models"
	"services/internal/repository"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PaymentPlanHandler struct {
	logger *log.Logger
	repo   repository.PaymentPlanRepository
}

func NewPaymentPlanHandler(logger *log.Logger, db *gorm.DB) *PaymentPlanHandler {
	repo := repository.NewPostgresPaymentPlanRepository(db)
	return &PaymentPlanHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *PaymentPlanHandler) CreatePaymentPlan(w http.ResponseWriter, r *http.Request) {
	h.logger.Println("Creating PaymentPlan")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var plan models.PaymentPlan
	if err := json.Unmarshal(body, &plan); err != nil {
		h.logger.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(r.Context(), &plan); err != nil {
		h.logger.Printf("Error creating payment plan: %v", err)
		http.Error(w, "Failed to create payment plan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(plan)
}

func (h *PaymentPlanHandler) GetPaymentPlan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	plan, err := h.repo.FindByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrPaymentPlanNotFound {
			http.Error(w, "Payment plan not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting payment plan: %v", err)
		http.Error(w, "Failed to get payment plan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plan)
}

func (h *PaymentPlanHandler) ListPaymentPlans(w http.ResponseWriter, r *http.Request) {
	plans, err := h.repo.FindAll(r.Context())
	if err != nil {
		h.logger.Printf("Error listing payment plans: %v", err)
		http.Error(w, "Failed to list payment plans", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plans)
}

func (h *PaymentPlanHandler) UpdatePaymentPlan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var plan models.PaymentPlan
	if err := json.Unmarshal(body, &plan); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	plan.ID = uint(idUint)

	if err := h.repo.Update(r.Context(), &plan); err != nil {
		if err == repository.ErrPaymentPlanNotFound {
			http.Error(w, "Payment plan not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error updating payment plan: %v", err)
		http.Error(w, "Failed to update payment plan", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plan)
}

func (h *PaymentPlanHandler) DeletePaymentPlan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(r.Context(), id); err != nil {
		if err == repository.ErrPaymentPlanNotFound {
			http.Error(w, "Payment plan not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error deleting payment plan: %v", err)
		http.Error(w, "Failed to delete payment plan", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
