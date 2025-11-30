package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"services/internal/database"
	"services/internal/models"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

var logger = log.New(os.Stdout, "", log.LstdFlags)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}
	ctx := context.Background()
	db, err := database.ConnectDatabase(ctx, logger)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	MigrateDatabase(ctx, db.DB_client)

}
func MigrateDatabase(ctx context.Context, db_client *gorm.DB) error {
	if db_client == nil {
		return fmt.Errorf("database client is required")
	}

	if err := db_client.AutoMigrate(models.AllModels...); err != nil {
		return fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	return nil
}
