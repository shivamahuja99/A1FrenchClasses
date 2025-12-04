package User

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"services/internal/auth"
	"services/internal/models"
	"services/internal/repository"
	"time"

	"gorm.io/gorm"
)

type UserHandler struct {
	logger      *log.Logger
	repo        repository.UserRepository
	sessionRepo repository.SessionRepository
}

func NewUserHandler(logger *log.Logger, db *gorm.DB) *UserHandler {
	repo := repository.NewPostgresUserRepository(db)
	sessionRepo := repository.NewPostgresSessionRepository(db)
	return &UserHandler{
		logger:      logger,
		repo:        repo,
		sessionRepo: sessionRepo,
	}
}

func sendJSONError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

func (uh *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	uh.logger.Println("Creating User")

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		uh.logger.Printf("Error reading request body: %v", err)
		sendJSONError(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Parse JSON into User struct
	var user models.User
	if err := json.Unmarshal(body, &user); err != nil {
		uh.logger.Printf("Error parsing JSON: %v", err)
		sendJSONError(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Save user to database
	if err := uh.repo.Create(r.Context(), &user); err != nil {
		uh.logger.Printf("Error creating user: %v", err)
		sendJSONError(w, "Failed to create user", http.StatusInternalServerError)
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
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := uh.repo.FindByID(r.Context(), userID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			sendJSONError(w, "User not found", http.StatusNotFound)
			return
		}
		uh.logger.Printf("Error getting user: %v", err)
		sendJSONError(w, "Failed to get user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (uh *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name        string `json:"name"`
		DateOfBirth string `json:"dob"`
		Age         int    `json:"age"` // Note: Age is not in the model, but might be sent by frontend. We'll ignore it or calculate DOB if needed.
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find existing user
	user, err := uh.repo.FindByID(r.Context(), userID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			sendJSONError(w, "User not found", http.StatusNotFound)
			return
		}
		uh.logger.Printf("Error getting user: %v", err)
		sendJSONError(w, "Failed to get user", http.StatusInternalServerError)
		return
	}

	// Update fields
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.DateOfBirth != "" {
		user.DateOfBirth = req.DateOfBirth
	}

	// Save updates
	if err := uh.repo.Update(r.Context(), user); err != nil {
		uh.logger.Printf("Error updating user: %v", err)
		sendJSONError(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// Login handles Google OAuth login
func (uh *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		GoogleToken string `json:"google_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Verify Google token
	googleInfo, err := auth.VerifyGoogleToken(r.Context(), req.GoogleToken)
	if err != nil {
		uh.logger.Printf("Error verifying Google token: %v", err)
		sendJSONError(w, "Invalid Google token", http.StatusUnauthorized)
		return
	}

	// Find or create user
	user, err := uh.repo.FindByGoogleID(r.Context(), googleInfo.Sub)
	if err != nil {
		if err != repository.ErrUserNotFound {
			uh.logger.Printf("Error finding user: %v", err)
			sendJSONError(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Create new user
		user = &models.User{
			GoogleID: &googleInfo.Sub,
			Email:    googleInfo.Email,
			Name:     googleInfo.Name,
			Type:     "student", // Default type
		}

		if err := uh.repo.Create(r.Context(), user); err != nil {
			uh.logger.Printf("Error creating user: %v", err)
			sendJSONError(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		uh.logger.Printf("Error generating access token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.Printf("Error generating refresh token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Create session
	session := &models.Session{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(r.Context(), session); err != nil {
		uh.logger.Printf("Error creating session: %v", err)
		sendJSONError(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return tokens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"user":          user,
	})
}

// RefreshToken handles token refresh
func (uh *UserHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find session by refresh token
	session, err := uh.sessionRepo.FindByRefreshToken(r.Context(), req.RefreshToken)
	if err != nil {
		sendJSONError(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	// Delete old session
	if err := uh.sessionRepo.DeleteSession(r.Context(), req.RefreshToken); err != nil {
		uh.logger.Printf("Error deleting old session: %v", err)
	}

	// Generate new tokens
	accessToken, err := auth.GenerateAccessToken(session.UserID, session.User.Email)
	if err != nil {
		uh.logger.Printf("Error generating access token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.Printf("Error generating refresh token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Create new session
	newSession := &models.Session{
		UserID:       session.UserID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(r.Context(), newSession); err != nil {
		uh.logger.Printf("Error creating session: %v", err)
		sendJSONError(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return new tokens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
	})
}

// Logout handles user logout
func (uh *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Delete session
	if err := uh.sessionRepo.DeleteSession(r.Context(), req.Token); err != nil {
		uh.logger.Printf("Error deleting session: %v", err)
		sendJSONError(w, "Failed to logout", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Logged out successfully"))
}

// Signup handles user registration with email and password
func (uh *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.Name == "" {
		sendJSONError(w, "Name, email and password are required", http.StatusBadRequest)
		return
	}

	// Check if user already exists
	existingUser, err := uh.repo.FindByEmail(r.Context(), req.Email)
	if err == nil && existingUser != nil {
		sendJSONError(w, "User with this email already exists", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		uh.logger.Printf("Error hashing password: %v", err)
		sendJSONError(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Create user
	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Type:     "student", // Default type
		GoogleID: nil,
	}

	if err := uh.repo.Create(r.Context(), user); err != nil {
		uh.logger.Printf("Error creating user: %v", err)
		sendJSONError(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		uh.logger.Printf("Error generating access token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.Printf("Error generating refresh token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Create session
	session := &models.Session{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(r.Context(), session); err != nil {
		uh.logger.Printf("Error creating session: %v", err)
		sendJSONError(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return tokens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"user":          user,
	})
}

// LoginWithEmail handles email/password login
func (uh *UserHandler) LoginWithEmail(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		sendJSONError(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// Find user by email
	user, err := uh.repo.FindByEmail(r.Context(), req.Email)
	if err != nil {
		if err == repository.ErrUserNotFound {
			sendJSONError(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}
		uh.logger.Printf("Error finding user: %v", err)
		sendJSONError(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Verify password
	if err := auth.ComparePassword(user.Password, req.Password); err != nil {
		sendJSONError(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		uh.logger.Printf("Error generating access token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.Printf("Error generating refresh token: %v", err)
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Create session
	session := &models.Session{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(r.Context(), session); err != nil {
		uh.logger.Printf("Error creating session: %v", err)
		sendJSONError(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return tokens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"user":          user,
	})
}
