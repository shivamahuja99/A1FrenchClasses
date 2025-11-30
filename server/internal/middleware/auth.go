package middleware

import (
	"context"
	"net/http"
	"services/internal/auth"
	"services/internal/repository"
	"strings"
)

type contextKey string

const UserContextKey contextKey = "user"

type AuthMiddleware struct {
	sessionRepo repository.SessionRepository
}

func NewAuthMiddleware(sessionRepo repository.SessionRepository) *AuthMiddleware {
	return &AuthMiddleware{
		sessionRepo: sessionRepo,
	}
}

// Authenticate validates the JWT token and loads the session
func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		// Check for Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		// Validate JWT token
		claims, err := auth.ValidateAccessToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Verify session exists in database
		session, err := m.sessionRepo.FindByAccessToken(r.Context(), tokenString)
		if err != nil {
			http.Error(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, session.User)
		ctx = context.WithValue(ctx, "user_id", claims.UserID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireScope is a placeholder for future scope-based authorization
func (m *AuthMiddleware) RequireScope(scopes ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// TODO: Implement scope checking when scopes are defined
			// For now, just pass through
			next.ServeHTTP(w, r)
		})
	}
}
