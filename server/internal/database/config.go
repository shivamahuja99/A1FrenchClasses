package database

import (
	"os"
)

// Config holds all database configuration
type Config struct {
	db_url string
}

// LoadConfig loads database configuration from environment variables
func LoadConfig() (*Config, error) {

	db_url := getEnv("DATABASE_URL", "postgresql://postgres.ykemplfbpumnmfbtkrta:a1frenchclassesdatabase@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")
	config := &Config{
		db_url: db_url,
	}

	return config, nil
}

func (c *Config) GetDBUrl() string {
	return c.db_url
}

// getEnv retrieves an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
