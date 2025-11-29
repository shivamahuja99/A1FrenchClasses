package payments

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

type PaymentHandler struct {
	logger *log.Logger
	repo   repository.PaymentRepository
}

func NewPaymentHandler(logger *log.Logger, db *gorm.DB) *PaymentHandler {
	repo := repository.NewPostgresPaymentRepository(db)
	return &PaymentHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *PaymentHandler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	h.logger.Println("Creating Payment")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payment models.Payment
	if err := json.Unmarshal(body, &payment); err != nil {
		h.logger.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(r.Context(), &payment); err != nil {
		h.logger.Printf("Error creating payment: %v", err)
		http.Error(w, "Failed to create payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(payment)
}

func (h *PaymentHandler) GetPayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	payment, err := h.repo.FindByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrPaymentNotFound {
			http.Error(w, "Payment not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting payment: %v", err)
		http.Error(w, "Failed to get payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *PaymentHandler) ListPayments(w http.ResponseWriter, r *http.Request) {
	payments, err := h.repo.FindAll(r.Context())
	if err != nil {
		h.logger.Printf("Error listing payments: %v", err)
		http.Error(w, "Failed to list payments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

func (h *PaymentHandler) UpdatePayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payment models.Payment
	if err := json.Unmarshal(body, &payment); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	payment.ID = uint(idUint)

	if err := h.repo.Update(r.Context(), &payment); err != nil {
		if err == repository.ErrPaymentNotFound {
			http.Error(w, "Payment not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error updating payment: %v", err)
		http.Error(w, "Failed to update payment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

func (h *PaymentHandler) DeletePayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(r.Context(), id); err != nil {
		if err == repository.ErrPaymentNotFound {
			http.Error(w, "Payment not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error deleting payment: %v", err)
		http.Error(w, "Failed to delete payment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
