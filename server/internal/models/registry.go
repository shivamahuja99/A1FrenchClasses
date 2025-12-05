package models

// AllModels is a registry of all GORM models in the application.
// Add new models here to ensure they are auto-migrated.
var AllModels = []any{
	&User{},
	&Course{},
	&PaymentPlan{},
	&Review{},
	&Payment{},
	&Session{},
	&Cart{},
	&CartItem{},
	&UserCourses{},
}
