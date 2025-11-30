package reviews

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

type ReviewHandler struct {
	logger *log.Logger
	repo   repository.ReviewRepository
}

func NewReviewHandler(logger *log.Logger, db *gorm.DB) *ReviewHandler {
	repo := repository.NewPostgresReviewRepository(db)
	return &ReviewHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	h.logger.Println("Creating Review")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var review models.Review
	if err := json.Unmarshal(body, &review); err != nil {
		h.logger.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(r.Context(), &review); err != nil {
		h.logger.Printf("Error creating review: %v", err)
		http.Error(w, "Failed to create review", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(review)
}

func (h *ReviewHandler) GetReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	review, err := h.repo.FindByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrReviewNotFound {
			http.Error(w, "Review not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting review: %v", err)
		http.Error(w, "Failed to get review", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(review)
}

func (h *ReviewHandler) ListReviews(w http.ResponseWriter, r *http.Request) {
	reviews, err := h.repo.FindAll(r.Context())
	if err != nil {
		h.logger.Printf("Error listing reviews: %v", err)
		http.Error(w, "Failed to list reviews", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reviews)
}

func (h *ReviewHandler) UpdateReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var review models.Review
	if err := json.Unmarshal(body, &review); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}
	review.ID = uint(idUint)

	if err := h.repo.Update(r.Context(), &review); err != nil {
		if err == repository.ErrReviewNotFound {
			http.Error(w, "Review not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error updating review: %v", err)
		http.Error(w, "Failed to update review", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(review)
}

func (h *ReviewHandler) DeleteReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(r.Context(), id); err != nil {
		if err == repository.ErrReviewNotFound {
			http.Error(w, "Review not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error deleting review: %v", err)
		http.Error(w, "Failed to delete review", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
