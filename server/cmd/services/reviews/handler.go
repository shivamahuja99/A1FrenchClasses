package reviews

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

type ReviewHandler struct {
	logger *slog.Logger
	repo   repository.ReviewRepository
}

func NewReviewHandler(logger *slog.Logger, db *gorm.DB) *ReviewHandler {
	repo := repository.NewPostgresReviewRepository(db)
	return &ReviewHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.InfoContext(ctx, "Creating Review")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error reading request body", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var review models.Review
	if err := json.Unmarshal(body, &review); err != nil {
		h.logger.ErrorContext(ctx, "Error parsing JSON", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	if err := h.repo.Create(ctx, &review); err != nil {
		h.logger.ErrorContext(ctx, "Error creating review", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create review")
		return
	}

	api.RespondWithJSON(w, http.StatusCreated, review)
}

func (h *ReviewHandler) GetReview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	review, err := h.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrReviewNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Review not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error getting review", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get review")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, review)
}

func (h *ReviewHandler) ListReviews(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	reviews, err := h.repo.FindAll(ctx)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error listing reviews", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to list reviews")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, reviews)
}

func (h *ReviewHandler) UpdateReview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var review models.Review
	if err := json.Unmarshal(body, &review); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid ID format")
		return
	}
	review.ID = uint(idUint)

	if err := h.repo.Update(ctx, &review); err != nil {
		if err == repository.ErrReviewNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Review not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error updating review", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to update review")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, review)
}

func (h *ReviewHandler) DeleteReview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrReviewNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Review not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error deleting review", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to delete review")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
