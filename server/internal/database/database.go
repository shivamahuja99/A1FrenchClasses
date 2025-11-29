package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectDatabase(ctx context.Context, logger *log.Logger) (*DB, error) {
	// Initialize database connection
	dbConfig, err := LoadConfig()
	if err != nil {
		logger.Fatalf("Failed to load database config: %v", err)
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	db, err := New(ctx, dbConfig, logger)
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
		return nil, err
	}

	return db, nil
}

// DB wraps the GORM database connection
type DB struct {
	DB_client *gorm.DB
	logger    *log.Logger
}

// New creates a new database connection using GORM
func New(ctx context.Context, config *Config, appLogger *log.Logger) (*DB, error) {
	if config == nil {
		return nil, fmt.Errorf("database config is required")
	}

	databaseConnection := config.GetDBUrl()

	// Configure GORM logger
	gormLogger := logger.New(
		appLogger,
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	gormConfig := &gorm.Config{
		Logger: gormLogger,
	}

	// Create connection with retry logic
	var db *gorm.DB
	var err error
	maxRetries := 5

	for i := range maxRetries {
		db, err = gorm.Open(postgres.Open(databaseConnection), gormConfig)
		if err == nil {
			break
		}

		if i < maxRetries-1 {
			waitTime := time.Duration(i+1) * 2 * time.Second
			appLogger.Printf("Failed to connect to database (attempt %d/%d), retrying in %v: %v",
				i+1, maxRetries, waitTime, err)
			time.Sleep(waitTime)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Verify connection
	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	appLogger.Println("Successfully connected to database with GORM")

	return &DB{
		DB_client: db,
		logger:    appLogger,
	}, nil
}

// Close closes the database connection
func (db *DB) Close() {
	if db.DB_client != nil {
		sqlDB, err := db.DB_client.DB()
		if err == nil {
			db.logger.Println("Closing database connection")
			sqlDB.Close()
		}
	}
}

// HealthCheck verifies database connectivity
func (db *DB) HealthCheck(ctx context.Context) error {
	if db.DB_client == nil {
		return fmt.Errorf("database is not initialized")
	}

	sqlDB, err := db.DB_client.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	if err := sqlDB.PingContext(ctx); err != nil {
		return fmt.Errorf("database health check failed: %w", err)
	}

	return nil
}
