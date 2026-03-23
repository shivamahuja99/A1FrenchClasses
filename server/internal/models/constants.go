package models

type ContextKey string

const (
	UserIDContextKey ContextKey = "user_id"
	UserContextKey   ContextKey = "user"
)

const (
	OrderStatusPending   = "pending"
	OrderStatusCompleted = "completed"
	OrderStatusFailed    = "failed"
	OrderStatusCancelled = "cancelled"
)
