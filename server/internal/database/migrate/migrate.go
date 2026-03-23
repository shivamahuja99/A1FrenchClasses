package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"services/internal/database"
	"services/internal/models"
	"services/internal/telemetry"

	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: .env file not found\n")
	}

	ctx := context.Background()

	// Initialize Telemetry for migration logs too
	logger, shutdown, err := telemetry.InitLogger(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize telemetry: %v\n", err)
		os.Exit(1)
	}
	defer shutdown()

	db, err := database.ConnectDatabase(ctx, logger)
	if err != nil {
		logger.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	_ = MigrateDatabase(ctx, db.DB_client, logger)
}

func MigrateDatabase(ctx context.Context, db_client *gorm.DB, logger *slog.Logger) error {
	if db_client == nil {
		return fmt.Errorf("database client is required")
	}

	logger.Info("Starting database migration")

	if err := db_client.AutoMigrate(models.AllModels...); err != nil {
		return fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	// Manual migration: drop legacy columns that AutoMigrate doesn't remove.
	legacyColumns := []string{"course_id", "user_id"}
	for _, col := range legacyColumns {
		sql := fmt.Sprintf(
			`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='%s') THEN ALTER TABLE payments DROP COLUMN %s; END IF; END $$;`,
			col, col,
		)
		if err := db_client.Exec(sql).Error; err != nil {
			logger.Warn("Could not drop legacy column", "column", col, "error", err)
		} else {
			logger.Info("Dropped legacy column", "column", col)
		}
	}

	logger.Info("Database migration completed successfully")
	return nil
}
