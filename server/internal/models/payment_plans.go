package models

import (
	"time"

	"gorm.io/gorm"
)

type PaymentPlan struct {
	*gorm.Model
	ID       uint    `json:"id" db:"id" gorm:"primaryKey"`
	Amount   float64 `json:"amount" db:"amount"`
	CourseID string  `json:"course_id" db:"course_id" gorm:"type:uuid"`
	Course   Course  `json:"course" gorm:"foreignKey:CourseID"`
	Duration string  `json:"duration" db:"duration"`
	Discount float64 `json:"discount" db:"discount"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
