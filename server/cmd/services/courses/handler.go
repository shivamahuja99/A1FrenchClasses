package courses

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"services/internal/models"
	"services/internal/repository"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CourseHandler struct {
	logger *log.Logger
	repo   repository.CourseRepository
}

func NewCourseHandler(logger *log.Logger, db *gorm.DB) *CourseHandler {
	repo := repository.NewPostgresCourseRepository(db)
	return &CourseHandler{
		logger: logger,
		repo:   repo,
	}
}

func (h *CourseHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	h.logger.Println("Creating Course")

	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var course models.Course
	if err := json.Unmarshal(body, &course); err != nil {
		h.logger.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(r.Context(), &course); err != nil {
		h.logger.Printf("Error creating course: %v", err)
		http.Error(w, "Failed to create course", http.StatusInternalServerError)
		return
	}

	h.logger.Printf("Created course: ID=%s", course.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	course, err := h.repo.FindByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrCourseNotFound {
			http.Error(w, "Course not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error getting course: %v", err)
		http.Error(w, "Failed to get course", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) ListCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := h.repo.FindAll(r.Context())
	if err != nil {
		h.logger.Printf("Error listing courses: %v", err)
		http.Error(w, "Failed to list courses", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}

func (h *CourseHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var course models.Course
	if err := json.Unmarshal(body, &course); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	course.ID = id

	if err := h.repo.Update(r.Context(), &course); err != nil {
		if err == repository.ErrCourseNotFound {
			http.Error(w, "Course not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error updating course: %v", err)
		http.Error(w, "Failed to update course", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.repo.Delete(r.Context(), id); err != nil {
		if err == repository.ErrCourseNotFound {
			http.Error(w, "Course not found", http.StatusNotFound)
			return
		}
		h.logger.Printf("Error deleting course: %v", err)
		http.Error(w, "Failed to delete course", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
