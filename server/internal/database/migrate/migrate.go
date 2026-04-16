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

	// Drop quantity from cart_items
	cartItemsSql := `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cart_items' AND column_name='quantity') THEN ALTER TABLE cart_items DROP COLUMN quantity; END IF; END $$;`
	if err := db_client.Exec(cartItemsSql).Error; err != nil {
		logger.Warn("Could not drop quantity column from cart_items", "error", err)
	} else {
		logger.Info("Dropped quantity column from cart_items")
	}

	// Seed default app settings
	logger.Info("Seeding default app settings")
	initialSettings := []models.AppSetting{
		{Key: "contact_recipient_email", Value: "hello@a1frenchclasses.ca", Description: "Email where contact submissions are sent"},
		{Key: "contact_whatsapp_number", Value: "+1234567890", Description: "WhatsApp number for automated notifications"},
		{Key: "google_spreadsheet_id", Value: "", Description: "ID of the Google Sheet for lead storage"},
	}

	for _, setting := range initialSettings {
		if err := db_client.Where("key = ?", setting.Key).FirstOrCreate(&setting).Error; err != nil {
			logger.Warn("Could not seed app setting", "key", setting.Key, "error", err)
		}
	}
	logger.Info("Default app settings seeded")

	logger.Info("Database migration completed successfully")
	return nil
}
