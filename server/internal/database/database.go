package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// GormLogger is a custom GORM logger that uses slog
type GormLogger struct {
	logger        *slog.Logger
	slowThreshold time.Duration
}

func NewGormLogger(slogLogger *slog.Logger) *GormLogger {
	return &GormLogger{
		logger:        slogLogger,
		slowThreshold: 200 * time.Millisecond,
	}
}

func (l *GormLogger) LogMode(level logger.LogLevel) logger.Interface {
	// GormLogger doesn't use the level internally for filtering yet,
	// as slog should handle its own levels.
	return l
}

func (l *GormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	l.logger.InfoContext(ctx, fmt.Sprintf(msg, data...))
}

func (l *GormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	l.logger.WarnContext(ctx, fmt.Sprintf(msg, data...))
}

func (l *GormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	l.logger.ErrorContext(ctx, fmt.Sprintf(msg, data...))
}

func (l *GormLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	elapsed := time.Since(begin)
	sql, rows := fc()

	fields := []any{
		slog.Duration("elapsed", elapsed),
		slog.String("sql", sql),
		slog.Int64("rows", rows),
	}

	if err != nil && err != gorm.ErrRecordNotFound {
		fields = append(fields, slog.Any("error", err))
		l.logger.ErrorContext(ctx, "GORM Trace Error", fields...)
		return
	}

	if elapsed > l.slowThreshold && l.slowThreshold != 0 {
		l.logger.WarnContext(ctx, "GORM Slow SQL", fields...)
		return
	}

	l.logger.InfoContext(ctx, "GORM Trace", fields...)
}

func ConnectDatabase(ctx context.Context, l *slog.Logger) (*DB, error) {
	// Initialize database connection
	dbConfig, err := LoadConfig()
	if err != nil {
		l.Error("Failed to load database config", "error", err)
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	db, err := New(ctx, dbConfig, l)
	if err != nil {
		l.Error("Failed to connect to database", "error", err)
		return nil, err
	}

	return db, nil
}

// DB wraps the GORM database connection
type DB struct {
	DB_client *gorm.DB
	logger    *slog.Logger
}

// New creates a new database connection using GORM
func New(ctx context.Context, config *Config, appLogger *slog.Logger) (*DB, error) {
	if config == nil {
		return nil, fmt.Errorf("database config is required")
	}

	databaseConnection := config.GetDBUrl()

	// Note: For Supabase free tier, use Session Pooler (port 6543) instead of direct connection (port 5432)
	// Session Pooler provides IPv4 compatibility which is required for Docker containers
	appLogger.Info("Connecting to database", "note", "ensure you're using Session Pooler on port 6543 for IPv4 support")

	// Create connection with retry logic
	var db *gorm.DB
	var err error
	maxRetries := 5

	// Configure GORM logger to use slog
	gormConfig := &gorm.Config{
		Logger: NewGormLogger(appLogger),
	}

	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(postgres.New(postgres.Config{
			DSN:                  databaseConnection,
			PreferSimpleProtocol: true, // required for Session Pooler (PgBouncer)
		}), gormConfig)
		if err == nil {
			break
		}

		if i < maxRetries-1 {
			waitTime := time.Duration(i+1) * 2 * time.Second
			appLogger.Warn("Failed to connect to database, retrying",
				"attempt", i+1,
				"max_retries", maxRetries,
				"wait_time", waitTime,
				"error", err)
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

	appLogger.Info("Successfully connected to database with GORM")

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
			db.logger.Info("Closing database connection")
			_ = sqlDB.Close()
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
