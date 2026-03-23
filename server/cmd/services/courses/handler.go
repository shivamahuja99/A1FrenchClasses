package courses

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/models"
	"services/internal/repository"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CourseHandler struct {
	logger *slog.Logger
	repo   repository.CourseRepository
}

func NewCourseHandler(logger *slog.Logger, db *gorm.DB) *CourseHandler {
	repo := repository.NewPostgresCourseRepository(db)
	return &CourseHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *CourseHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	h.logger.InfoContext(ctx, "Creating Course")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error reading request body", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var course models.Course
	if err := json.Unmarshal(body, &course); err != nil {
		h.logger.ErrorContext(ctx, "Error parsing JSON", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	if err := h.repo.Create(ctx, &course); err != nil {
		h.logger.ErrorContext(ctx, "Error creating course", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create course")
		return
	}

	h.logger.InfoContext(ctx, "Created course", "course_id", course.ID)

	api.RespondWithJSON(w, http.StatusCreated, course)
}

func (h *CourseHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	course, err := h.repo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrCourseNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Course not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error getting course", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get course")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, course)
}

func (h *CourseHandler) ListCourses(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	courses, err := h.repo.FindAll(ctx)
	if err != nil {
		h.logger.ErrorContext(ctx, "Error listing courses", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to list courses")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, courses)
}

func (h *CourseHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	var course models.Course
	if err := json.Unmarshal(body, &course); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}
	course.ID = id

	if err := h.repo.Update(ctx, &course); err != nil {
		if err == repository.ErrCourseNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Course not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error updating course", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to update course")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, course)
}

func (h *CourseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(ctx, id); err != nil {
		if err == repository.ErrCourseNotFound {
			api.RespondWithError(w, http.StatusNotFound, "Course not found")
			return
		}
		h.logger.ErrorContext(ctx, "Error deleting course", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to delete course")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
