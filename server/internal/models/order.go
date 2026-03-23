package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	*gorm.Model
	ID          string      `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID      string      `json:"user_id" db:"user_id" gorm:"type:uuid;not null"`
	User        User        `json:"user,omitempty" gorm:"foreignKey:UserID;references:ID"`
	TotalAmount float64     `json:"total_amount" db:"total_amount"`
	Status      string      `json:"status" db:"status" gorm:"default:'PENDING'"` // PENDING, COMPLETED, FAILED, CANCELLED
	Items       []OrderItem `json:"items,omitempty" gorm:"foreignKey:OrderID;references:ID"`
	Payments    []Payment   `json:"payments,omitempty" gorm:"foreignKey:OrderID;references:ID"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}

type OrderItem struct {
	*gorm.Model
	ID        string    `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	OrderID   string    `json:"order_id" db:"order_id" gorm:"type:uuid;not null"`
	Order     Order     `json:"order,omitempty" gorm:"foreignKey:OrderID;references:ID"`
	CourseID  string    `json:"course_id" db:"course_id" gorm:"type:uuid;not null"`
	Course    Course    `json:"course,omitempty" gorm:"foreignKey:CourseID;references:ID"`
	Price     float64   `json:"price" db:"price"`
	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
