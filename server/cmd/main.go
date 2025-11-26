package main

import (
	"log"
	"net/http"
	"os"
	user "services/cmd/services/users"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var logger = log.New(os.Stdout, "", log.LstdFlags)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	router := mux.NewRouter()
	userHandler := user.NewUserHandler(logger)
	router.Handle("/health", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}))
	router.HandleFunc("/api/user", userHandler.CreateUser).Methods("POST")

	runServer(router)
}

func runServer(router *mux.Router) error {
	port := os.Getenv("PORT")
	logger.Printf("Starting server on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		logger.Fatalf("Server failed to start: %v", err)
		return err
	}
	return nil
}
