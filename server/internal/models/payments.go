package models

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	*gorm.Model
	ID                  string    `json:"id" db:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	OrderID             string    `json:"order_id" db:"order_id" gorm:"type:uuid;not null"`
	Order               Order     `json:"order,omitempty" gorm:"foreignKey:OrderID;references:ID"`
	TransactionAmount   float64   `json:"transaction_amount" db:"transaction_amount"`
	TransactionDate     time.Time `json:"transaction_date" db:"transaction_date" gorm:"autoCreateTime"`
	TransactionMethod   string    `json:"transaction_method" db:"transaction_method"`
	TransactionStatus   string    `json:"transaction_status" db:"transaction_status" gorm:"default:'PENDING'"`
	TransactionID       string    `json:"transaction_id" db:"transaction_id"`
	PayPalTransactionID string    `json:"paypal_transaction_id" db:"paypal_transaction_id"`

	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"autoUpdateTime"`
}
