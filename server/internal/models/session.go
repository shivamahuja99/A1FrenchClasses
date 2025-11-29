package models

import (
	"time"

	"gorm.io/gorm"
)

type Session struct {
	*gorm.Model
	ID           string    `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID       string    `json:"user_id" db:"user_id" gorm:"type:uuid;not null;index"`
	User         User      `json:"user" gorm:"foreignKey:UserID"`
	AccessToken  string    `json:"access_token" db:"access_token" gorm:"uniqueIndex;not null"`
	RefreshToken string    `json:"refresh_token" db:"refresh_token" gorm:"uniqueIndex;not null"`
	ExpiresAt    time.Time `json:"expires_at" db:"expires_at" gorm:"not null"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
