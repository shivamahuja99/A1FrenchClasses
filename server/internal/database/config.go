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

	db_url := getEnv("DATABASE_URL", "")
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
