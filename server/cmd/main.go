package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"services/cmd/services/courses"
	paymentplans "services/cmd/services/payment_plans"
	"services/cmd/services/payments"
	"services/cmd/services/reviews"
	user "services/cmd/services/users"
	"services/internal/database"
	"services/internal/middleware"
	"services/internal/repository"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var logger = log.New(os.Stdout, "", log.LstdFlags)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize database
	ctx := context.Background()
	db, err := database.ConnectDatabase(ctx, logger)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize handlers
	router := mux.NewRouter()
	userHandler := user.NewUserHandler(logger, db.DB_client)
	courseHandler := courses.NewCourseHandler(logger, db.DB_client)
	paymentPlanHandler := paymentplans.NewPaymentPlanHandler(logger, db.DB_client)
	reviewHandler := reviews.NewReviewHandler(logger, db.DB_client)
	paymentHandler := payments.NewPaymentHandler(logger, db.DB_client)

	// Initialize auth middleware
	sessionRepo := repository.NewPostgresSessionRepository(db.DB_client)
	authMiddleware := middleware.NewAuthMiddleware(sessionRepo)

	// Health check endpoint (public)
	router.Handle("/health", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := db.HealthCheck(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Database unavailable"))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}))

	// Public auth routes
	router.HandleFunc("/api/signup", userHandler.Signup).Methods("POST")
	router.HandleFunc("/api/login/google", userHandler.Login).Methods("POST")
	router.HandleFunc("/api/login/email", userHandler.LoginWithEmail).Methods("POST")
	router.HandleFunc("/api/refresh", userHandler.RefreshToken).Methods("POST")
	router.HandleFunc("/api/logout", userHandler.Logout).Methods("POST")

	// Protected routes (require authentication)
	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(authMiddleware.Authenticate)

	// User routes (protected)
	protected.HandleFunc("/user/me", userHandler.GetUser).Methods("GET")

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

	// Payment routes (protected)
	protected.HandleFunc("/payments", paymentHandler.CreatePayment).Methods("POST")
	protected.HandleFunc("/payments", paymentHandler.ListPayments).Methods("GET")
	protected.HandleFunc("/payments/{id}", paymentHandler.GetPayment).Methods("GET")
	protected.HandleFunc("/payments/{id}", paymentHandler.UpdatePayment).Methods("PUT")
	protected.HandleFunc("/payments/{id}", paymentHandler.DeletePayment).Methods("DELETE")

	runServer(router)
}

func runServer(router *mux.Router) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		logger.Printf("Starting server on port %s...\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatalf("Server forced to shutdown: %v", err)
	}

	logger.Println("Server exited properly")
}
