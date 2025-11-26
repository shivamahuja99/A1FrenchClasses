package User

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"services/internal/models"
)

type UserHandler struct {
	logger *log.Logger
}

func NewUserHandler(logger *log.Logger) *UserHandler {
	return &UserHandler{
		logger: logger,
	}
}

func (uh *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	uh.logger.Println("Creating User", r.Body)

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		uh.logger.Printf("Error reading request body: %v", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
	uh.logger.Println("Request body:", string(body))
	// Parse JSON into User struct
	var user models.User
	if err := json.Unmarshal(body, &user); err != nil {
		uh.logger.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Log the received user data
	uh.logger.Printf("Received user: ID=%s, Name=%s, Age=%d, Gender=%s",
		user.ID, user.Name, user.Age, user.Gender)

	// TODO: Save user to database

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User created successfully",
		"id":      user.ID,
	})
}

func (uh *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	uh.logger.Println("Creating User", r.Body)
}
