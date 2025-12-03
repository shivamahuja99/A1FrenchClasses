package models

import (
	"time"

	"gorm.io/gorm"
)

// Cart represents a user's shopping cart
type Cart struct {
	*gorm.Model
	ID        string     `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    string     `json:"user_id" db:"user_id" gorm:"type:uuid;not null"`
	User      User       `json:"user,omitempty" gorm:"foreignKey:UserID;references:ID"`
	Items     []CartItem `json:"items,omitempty" gorm:"foreignKey:CartID"`
	CreatedAt time.Time  `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}

// CartItem represents an item in the shopping cart
type CartItem struct {
	*gorm.Model
	ID        string    `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CartID    string    `json:"cart_id" db:"cart_id" gorm:"type:uuid;not null"`
	Cart      Cart      `json:"cart,omitempty" gorm:"foreignKey:CartID;references:ID"`
	CourseID  string    `json:"course_id" db:"course_id" gorm:"type:uuid;not null"`
	Course    Course    `json:"course,omitempty" gorm:"foreignKey:CourseID;references:ID"`
	Quantity  int       `json:"quantity" db:"quantity" gorm:"default:1"`
	Price     float64   `json:"price" db:"price"`
	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
