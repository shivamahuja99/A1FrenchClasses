package User

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"services/internal/api"
	"services/internal/auth"
	"services/internal/models"
	"services/internal/repository"
	"time"

	"gorm.io/gorm"
)

type UserHandler struct {
	logger      *slog.Logger
	repo        repository.UserRepository
	sessionRepo repository.SessionRepository
}

func NewUserHandler(logger *slog.Logger, db *gorm.DB) *UserHandler {
	repo := repository.NewPostgresUserRepository(db)
	sessionRepo := repository.NewPostgresSessionRepository(db)
	return &UserHandler{
		logger:      logger,
		repo:        repo,
		sessionRepo: sessionRepo,
	}
}

func (uh *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uh.logger.InfoContext(ctx, "Creating User")

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error reading request body", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer func() { _ = r.Body.Close() }()

	// Parse JSON into User struct
	var user models.User
	if err := json.Unmarshal(body, &user); err != nil {
		uh.logger.ErrorContext(ctx, "Error parsing JSON", "error", err)
		api.RespondWithError(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	// Save user to database
	if err := uh.repo.Create(ctx, &user); err != nil {
		uh.logger.ErrorContext(ctx, "Error creating user", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Log the received user data
	uh.logger.InfoContext(ctx, "Created user", "user_id", user.ID, "name", user.Name)

	// Send success response
	api.RespondWithJSON(w, http.StatusCreated, map[string]string{
		"message": "User created successfully",
		"id":      user.ID,
	})
}

func (uh *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Get user ID from context (set by auth middleware)
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := uh.repo.FindByID(ctx, userID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			api.RespondWithError(w, http.StatusNotFound, "User not found")
			return
		}
		uh.logger.ErrorContext(ctx, "Error getting user", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get user")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, user)
}

func (uh *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Get user ID from context (set by auth middleware)
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Name        string `json:"name"`
		DateOfBirth string `json:"dob"`
		Age         int    `json:"age"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Find existing user
	user, err := uh.repo.FindByID(ctx, userID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			api.RespondWithError(w, http.StatusNotFound, "User not found")
			return
		}
		uh.logger.ErrorContext(ctx, "Error getting user", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get user")
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
	if err := uh.repo.Update(ctx, user); err != nil {
		uh.logger.ErrorContext(ctx, "Error updating user", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, user)
}

// Login handles Google OAuth login
func (uh *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req struct {
		GoogleToken string `json:"google_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Verify Google token
	googleInfo, err := auth.VerifyGoogleToken(ctx, req.GoogleToken)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error verifying Google token", "error", err)
		api.RespondWithError(w, http.StatusUnauthorized, "Invalid Google token")
		return
	}

	// Find or create user
	user, err := uh.repo.FindByGoogleID(ctx, googleInfo.Sub)
	if err != nil {
		if err != repository.ErrUserNotFound {
			uh.logger.ErrorContext(ctx, "Error finding user", "error", err)
			api.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
			return
		}

		// Create new user
		user = &models.User{
			GoogleID: &googleInfo.Sub,
			Email:    googleInfo.Email,
			Name:     googleInfo.Name,
			Type:     "student", // Default type
		}

		if err := uh.repo.Create(ctx, user); err != nil {
			uh.logger.ErrorContext(ctx, "Error creating user", "error", err)
			api.RespondWithError(w, http.StatusInternalServerError, "Failed to create user")
			return
		}
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating access token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating refresh token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Create session
	session := &models.Session{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(ctx, session); err != nil {
		uh.logger.ErrorContext(ctx, "Error creating session", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	// Return tokens
	api.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"user":          user,
	})
}

// RefreshToken handles token refresh
func (uh *UserHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Find session by refresh token
	session, err := uh.sessionRepo.FindByRefreshToken(ctx, req.RefreshToken)
	if err != nil {
		api.RespondWithError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	// Delete old session
	if err := uh.sessionRepo.DeleteSession(ctx, req.RefreshToken); err != nil {
		uh.logger.WarnContext(ctx, "Error deleting old session", "error", err)
	}

	// Generate new tokens
	accessToken, err := auth.GenerateAccessToken(session.UserID, session.User.Email)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating access token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating refresh token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Create new session
	newSession := &models.Session{
		UserID:       session.UserID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(ctx, newSession); err != nil {
		uh.logger.ErrorContext(ctx, "Error creating session", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	// Return new tokens
	api.RespondWithJSON(w, http.StatusOK, map[string]string{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
	})
}

// Logout handles user logout
func (uh *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Delete session
	if err := uh.sessionRepo.DeleteSession(ctx, req.Token); err != nil {
		uh.logger.ErrorContext(ctx, "Error deleting session", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to logout")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// Signup handles user registration with email and password
func (uh *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.Name == "" {
		api.RespondWithError(w, http.StatusBadRequest, "Name, email and password are required")
		return
	}

	// Check if user already exists
	existingUser, err := uh.repo.FindByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		api.RespondWithError(w, http.StatusConflict, "User with this email already exists")
		return
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error hashing password", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create user")
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

	if err := uh.repo.Create(ctx, user); err != nil {
		uh.logger.ErrorContext(ctx, "Error creating user", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating access token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating refresh token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Create session
	session := &models.Session{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(ctx, session); err != nil {
		uh.logger.ErrorContext(ctx, "Error creating session", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	// Return tokens
	api.RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"user":          user,
	})
}

// LoginWithEmail handles email/password login
func (uh *UserHandler) LoginWithEmail(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		api.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		api.RespondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Find user by email
	user, err := uh.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		if err == repository.ErrUserNotFound {
			api.RespondWithError(w, http.StatusUnauthorized, "Invalid email or password")
			return
		}
		uh.logger.ErrorContext(ctx, "Error finding user", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Verify password
	if err := auth.ComparePassword(user.Password, req.Password); err != nil {
		api.RespondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating access token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error generating refresh token", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Create session
	session := &models.Session{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(15 * time.Minute),
	}

	if err := uh.sessionRepo.CreateSession(ctx, session); err != nil {
		uh.logger.ErrorContext(ctx, "Error creating session", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	// Return tokens
	api.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"user":          user,
	})
}

// GetUserCourses retrieves courses purchased by the authenticated user
func (uh *UserHandler) GetUserCourses(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Get user ID from context (set by auth middleware)
	userID, ok := ctx.Value(models.UserIDContextKey).(string)
	if !ok {
		api.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	courses, err := uh.repo.GetPurchasedCourses(ctx, userID)
	if err != nil {
		uh.logger.ErrorContext(ctx, "Error getting user courses", "error", err)
		api.RespondWithError(w, http.StatusInternalServerError, "Failed to get user courses")
		return
	}

	api.RespondWithJSON(w, http.StatusOK, courses)
}
