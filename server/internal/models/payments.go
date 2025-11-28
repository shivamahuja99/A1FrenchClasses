package models

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	*gorm.Model
	ID                uint      `json:"id" db:"id" gorm:"primaryKey"`
	TransactionAmount float64   `json:"transaction_amount" db:"transaction_amount"`
	TransactionDate   time.Time `json:"transaction_date" db:"transaction_date" gorm:"autoCreateTime"`
	CourseID          string    `json:"course_id" db:"course_id" gorm:"type:uuid"`
	Course            Course    `json:"course" gorm:"foreignKey:CourseID"`
	TransactionMethod string    `json:"transaction_method" db:"transaction_method"`
	TransactionStatus string    `json:"transaction_status" db:"transaction_status"`
	TransactionID     string    `json:"transaction_id" db:"transaction_id"`
	UserID            string    `json:"user_id" db:"user_id" gorm:"type:uuid"`
	User              User      `json:"user" gorm:"foreignKey:UserID"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
