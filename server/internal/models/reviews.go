package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	*gorm.Model
	ID       uint   `json:"id" db:"id" gorm:"primaryKey"`
	Rating   int    `json:"rating" db:"rating"`
	Comment  string `json:"comment" db:"comment"`
	CourseID string `json:"course_id" db:"course_id" gorm:"type:uuid"`
	Course   Course `json:"course" gorm:"foreignKey:CourseID"`
	UserID   string `json:"user_id" db:"user_id" gorm:"type:uuid"`
	User     User   `json:"user" gorm:"foreignKey:UserID"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
