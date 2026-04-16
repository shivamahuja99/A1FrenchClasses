package models

type AppSetting struct {
	Key         string `json:"key" db:"key"`
	Value       string `json:"value" db:"value"`
	Description string `json:"description" db:"description"`
}
