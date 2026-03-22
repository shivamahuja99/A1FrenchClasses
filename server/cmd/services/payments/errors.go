package payments

const (
	// HTTP Status Codes commonly returned by PayPal
	StatusUnprocessableEntity = "422"
	StatusBadRequest          = "400"
	StatusUnauthorized        = "401"
	StatusForbidden           = "403"
	StatusNotFound            = "404"
	StatusInternalServerError = "500"
	StatusServiceUnavailable  = "503"

	// Success/Idempotency
	ErrOrderAlreadyCaptured = "ORDER_ALREADY_CAPTURED"
	ErrDuplicateResource    = "DUPLICATE_RESOURCE"
	ErrDuplicateInvoiceID   = "DUPLICATE_INVOICE_ID"

	// Authorization/Authentication
	ErrNotAuthorized         = "NOT_AUTHORIZED"
	ErrAuthenticationFailure = "AUTHENTICATION_FAILURE"

	// Resource Issues
	ErrResourceNotFound  = "RESOURCE_NOT_FOUND"
	ErrInvalidResourceID = "INVALID_RESOURCE_ID"
	ErrInvalidPayerID    = "INVALID_PAYER_ID"

	// Transaction Issues
	ErrInstrumentDeclined            = "INSTRUMENT_DECLINED"
	ErrTransactionRefused            = "TRANSACTION_REFUSED"
	ErrMaxPaymentAttemptsExceeded    = "MAX_NUMBER_OF_PAYMENT_ATTEMPTS_EXCEEDED"
	ErrPayerAccountLockedOrClosed    = "PAYER_ACCOUNT_LOCKED_OR_CLOSED"
	ErrPayeeAccountLockedOrClosed    = "PAYEE_ACCOUNT_LOCKED_OR_CLOSED"
	ErrPayeeAccountRestricted        = "PAYEE_ACCOUNT_RESTRICTED"
	ErrPayeeAccountInvalid           = "PAYEE_ACCOUNT_INVALID"
	ErrPayeeBlockedTransaction       = "PAYEE_BLOCKED_TRANSACTION"

	// Validation Issues
	ErrUnprocessableEntity  = "UNPROCESSABLE_ENTITY"
	ErrInvalidRequest       = "INVALID_REQUEST"
	ErrCurrencyNotSupported = "CURRENCY_NOT_SUPPORTED"
	ErrAmountMismatch       = "AMOUNT_MISMATCH"
	ErrCardExpired          = "CARD_EXPIRED"

	// System Issues
	ErrInternalServerError = "INTERNAL_SERVER_ERROR"
	ErrServiceUnavailable  = "SERVICE_UNAVAILABLE"
)
