package models

import (
	"time"

	"gorm.io/gorm"
)

type Course struct {
	*gorm.Model
	ID           string `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string `json:"name" db:"name"`
	Description  string `json:"description" db:"description"`
	Duration     string `json:"duration" db:"duration"`
	Rating       int    `json:"rating" db:"rating"`
	ImageURL     string `json:"image_url" db:"image_url"`
	Difficulty   string `json:"difficulty" db:"difficulty"`
	CourseURL    string `json:"course_url" db:"course_url"`
	InstructorID string `json:"instructor_id" db:"instructor_id" gorm:"type:uuid"`
	Instructor   User   `json:"instructor" gorm:"foreignKey:InstructorID"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
