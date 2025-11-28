package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	*gorm.Model
	ID           string `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string `json:"name" db:"name"`
	Email        string `json:"email" db:"email"`
	Type         string `json:"type" db:"type"`
	MobileNumber string `json:"mobile_number" db:"mobile_number"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
