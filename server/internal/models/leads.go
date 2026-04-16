package models

import (
	"time"
)

type Lead struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	Phone     string    `json:"phone" db:"phone"`
	Subject   string    `json:"subject" db:"subject"`
	Message   string    `json:"message" db:"message"`
	CourseID  *int      `json:"course_id,omitempty" db:"course_id"`
	Status    string    `json:"status" db:"status"` // 'new', 'contacted', 'resolved'
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
