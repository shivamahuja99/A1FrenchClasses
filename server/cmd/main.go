package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"services/cmd/services/cart"
	"services/cmd/services/courses"
	paymentplans "services/cmd/services/payment_plans"
	"services/cmd/services/payments"
	"services/cmd/services/reviews"
	user "services/cmd/services/users"
	"services/internal/api"
	"services/internal/database"
	"services/internal/middleware"
	"services/internal/repository"
	"services/internal/telemetry"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: .env file not found, using system environment variables\n")
	}

	// Initialize context for setup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize Telemetry (OpenTelemetry logs)
	logger, shutdown, err := telemetry.InitLogger(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize telemetry: %v\n", err)
		os.Exit(1)
	}
	defer shutdown()

	// Initialize database
	db, err := database.ConnectDatabase(ctx, logger)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// Initialize handlers
	router := mux.NewRouter()

	// Apply global middleware
	router.Use(middleware.LoggingMiddleware(logger))
	// CORSMiddleware will wrap the entire router below

	userHandler := user.NewUserHandler(logger, db.DB_client)
	courseHandler := courses.NewCourseHandler(logger, db.DB_client)
	paymentPlanHandler := paymentplans.NewPaymentPlanHandler(logger, db.DB_client)
	reviewHandler := reviews.NewReviewHandler(logger, db.DB_client)
	paymentHandler := payments.NewPaymentHandler(logger, db.DB_client)
	cartHandler := cart.NewCartHandler(logger, db.DB_client)

	// Initialize auth middleware
	sessionRepo := repository.NewPostgresSessionRepository(db.DB_client)
	authMiddleware := middleware.NewAuthMiddleware(sessionRepo)

	// Health check endpoint (public)
	router.Handle("/health", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := db.HealthCheck(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte("Database unavailable"))
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	}))

	// Public auth routes
	router.HandleFunc("/api/signup", userHandler.Signup).Methods("POST")
	router.HandleFunc("/api/login/google", userHandler.Login).Methods("POST")
	router.HandleFunc("/api/login/email", userHandler.LoginWithEmail).Methods("POST")
	router.HandleFunc("/api/refresh", userHandler.RefreshToken).Methods("POST")
	router.HandleFunc("/api/logout", userHandler.Logout).Methods("POST")

	// General public routes
	router.HandleFunc("/api/accepted", func(w http.ResponseWriter, r *http.Request) {
		api.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "api accepted"})
	}).Methods("POST")

	// Protected routes (require authentication)
	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(authMiddleware.Authenticate)

	// User routes (protected)
	protected.HandleFunc("/user/me", userHandler.GetUser).Methods("GET")
	protected.HandleFunc("/user/me", userHandler.UpdateUser).Methods("PUT")
	protected.HandleFunc("/user/me/courses", userHandler.GetUserCourses).Methods("GET")

	// Course routes (protected)
	protected.HandleFunc("/courses", courseHandler.CreateCourse).Methods("POST")
	protected.HandleFunc("/courses", courseHandler.ListCourses).Methods("GET")
	protected.HandleFunc("/courses/{id}", courseHandler.GetCourse).Methods("GET")
	protected.HandleFunc("/courses/{id}", courseHandler.UpdateCourse).Methods("PUT")
	protected.HandleFunc("/courses/{id}", courseHandler.DeleteCourse).Methods("DELETE")

	// Payment Plan routes (protected)
	protected.HandleFunc("/payment-plans", paymentPlanHandler.CreatePaymentPlan).Methods("POST")
	protected.HandleFunc("/payment-plans", paymentPlanHandler.ListPaymentPlans).Methods("GET")
	protected.HandleFunc("/payment-plans/{id}", paymentPlanHandler.GetPaymentPlan).Methods("GET")
	protected.HandleFunc("/payment-plans/{id}", paymentPlanHandler.UpdatePaymentPlan).Methods("PUT")
	protected.HandleFunc("/payment-plans/{id}", paymentPlanHandler.DeletePaymentPlan).Methods("DELETE")

	// Review routes (protected)
	protected.HandleFunc("/reviews", reviewHandler.CreateReview).Methods("POST")
	protected.HandleFunc("/reviews", reviewHandler.ListReviews).Methods("GET")
	protected.HandleFunc("/reviews/{id}", reviewHandler.GetReview).Methods("GET")
	protected.HandleFunc("/reviews/{id}", reviewHandler.UpdateReview).Methods("PUT")
	protected.HandleFunc("/reviews/{id}", reviewHandler.DeleteReview).Methods("DELETE")

	// Checkout routes (protected)
	protected.HandleFunc("/checkout", paymentHandler.Checkout).Methods("POST")
	protected.HandleFunc("/checkout/capture", paymentHandler.CaptureCheckout).Methods("POST")
	protected.HandleFunc("/orders/{id}/retry", paymentHandler.RetryOrder).Methods("POST")

	// Payment routes (protected)
	protected.HandleFunc("/payments", paymentHandler.CreatePayment).Methods("POST")
	protected.HandleFunc("/payments", paymentHandler.ListPayments).Methods("GET")
	protected.HandleFunc("/payments/{id}", paymentHandler.GetPayment).Methods("GET")
	protected.HandleFunc("/payments/{id}", paymentHandler.UpdatePayment).Methods("PUT")
	protected.HandleFunc("/payments/{id}", paymentHandler.DeletePayment).Methods("DELETE")

	// Cart routes (protected)
	protected.HandleFunc("/cart", cartHandler.GetCart).Methods("GET")
	protected.HandleFunc("/cart/items", cartHandler.AddToCart).Methods("POST")
	protected.HandleFunc("/cart/items/{id}", cartHandler.RemoveFromCart).Methods("DELETE")
	protected.HandleFunc("/cart", cartHandler.ClearCart).Methods("DELETE")

	globalHandler := middleware.CORSMiddleware(router)
	runServer(globalHandler, logger)
}

func runServer(handler http.Handler, logger *slog.Logger) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: handler,
	}

	// Graceful shutdown
	go func() {
		logger.Info("Starting server", "port", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("Server failed to start", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}

	logger.Info("Server exited properly")
}
