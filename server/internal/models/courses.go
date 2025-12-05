package models

import (
	"time"

	"gorm.io/gorm"
)

type Course struct {
	*gorm.Model
	ID           string     `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string     `json:"name" db:"name"`
	Description  string     `json:"description" db:"description"`
	Duration     string     `json:"duration" db:"duration"`
	Rating       float64    `json:"rating" db:"rating"`
	ImageURL     string     `json:"image_url" db:"image_url"`
	Difficulty   string     `json:"difficulty" db:"difficulty"`
	CourseURL    string     `json:"course_url" db:"course_url"`
	InstructorID string     `json:"instructor_id" db:"instructor_id" gorm:"type:uuid"`
	Instructor   User       `json:"instructor" gorm:"foreignKey:InstructorID;references:ID"`
	Price        float64    `json:"price" db:"price"`
	Discount     float64    `json:"discount" db:"discount"`
	NumLectures  int        `json:"num_lectures" db:"num_lectures"`
	StartDate    *time.Time `json:"start_date,omitempty" db:"start_date"`
	EndDate      *time.Time `json:"end_date,omitempty" db:"end_date"`
	ClassTiming  string     `json:"class_timing" db:"class_timing"`
	Reviews      []Review   `json:"reviews,omitempty" gorm:"foreignKey:CourseID"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}

type UserCourses struct {
	*gorm.Model
	UserID    string    `json:"user_id" db:"user_id" gorm:"type:uuid"`
	CourseID  string    `json:"course_id" db:"course_id" gorm:"type:uuid"`
	User      User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
	Course    Course    `json:"course" gorm:"foreignKey:CourseID;references:ID"`
	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
