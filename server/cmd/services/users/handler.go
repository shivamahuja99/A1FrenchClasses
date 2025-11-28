package User

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"services/internal/models"
	"services/internal/repository"

	"github.com/gorilla/mux"
)

type UserHandler struct {
	logger *log.Logger
	repo   repository.UserRepository
}

func NewUserHandler(logger *log.Logger, repo repository.UserRepository) *UserHandler {
	return &UserHandler{
		logger: logger,
		repo:   repo,
	}
}

func (uh *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	uh.logger.Println("Creating User")

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		uh.logger.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Parse JSON into User struct
	var user models.User
	if err := json.Unmarshal(body, &user); err != nil {
		uh.logger.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Save user to database
	if err := uh.repo.Create(r.Context(), &user); err != nil {
		uh.logger.Printf("Error creating user: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Log the received user data
	uh.logger.Printf("Created user: ID=%s, Name=%s", user.ID, user.Name)

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User created successfully",
		"id":      user.ID,
	})
}

func (uh *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	user, err := uh.repo.FindByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrUserNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		uh.logger.Printf("Error getting user: %v", err)
		http.Error(w, "Failed to get user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
