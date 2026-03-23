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

	// Manual migration: drop legacy columns that AutoMigrate doesn't remove.
	// The payments table previously had course_id and user_id columns;
	// payments now link to orders instead.
	legacyColumns := []string{"course_id", "user_id"}
	for _, col := range legacyColumns {
		sql := fmt.Sprintf(
			`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='%s') THEN ALTER TABLE payments DROP COLUMN %s; END IF; END $$;`,
			col, col,
		)
		if err := db_client.Exec(sql).Error; err != nil {
			logger.Printf("Warning: could not drop payments.%s: %v", col, err)
		} else {
			logger.Printf("Dropped legacy column payments.%s (if it existed)", col)
		}
	}

	return nil
}
