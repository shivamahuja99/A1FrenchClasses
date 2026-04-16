package service

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/smtp"
	"net/url"
	"os"
	"services/internal/models"
	"services/internal/repository"
	"strings"
	"time"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type NotificationService struct {
	logger       *slog.Logger
	settingsRepo repository.SettingsRepository
}

func NewNotificationService(logger *slog.Logger, settingsRepo repository.SettingsRepository) *NotificationService {
	return &NotificationService{
		logger:       logger,
		settingsRepo: settingsRepo,
	}
}

func (s *NotificationService) NotifyLead(ctx context.Context, lead models.Lead) {
	// 1. Get Settings
	recipientEmail, _ := s.settingsRepo.GetSetting(ctx, "contact_recipient_email")
	whatsappNumber, _ := s.settingsRepo.GetSetting(ctx, "contact_whatsapp_number")
	spreadsheetID, _ := s.settingsRepo.GetSetting(ctx, "google_spreadsheet_id")

	// 2. Send Email
	if recipientEmail != "" {
		go s.sendEmail(recipientEmail, lead)
	}

	// 3. Send WhatsApp (Simplified)
	if whatsappNumber != "" {
		go s.sendWhatsApp(whatsappNumber, lead)
	}

	// 4. Append to Google Sheets
	if spreadsheetID != "" {
		go s.appendToGoogleSheets(spreadsheetID, lead)
	}
}

func (s *NotificationService) sendEmail(recipient string, lead models.Lead) {
	// 1. Get credentials from environment
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	from := os.Getenv("SMTP_FROM")

	if host == "" || user == "" || pass == "" {
		s.logger.Warn("SMTP credentials not configured, skipping email notification")
		return
	}

	// 2. Build the message
	subject := "New Lead Received: " + lead.Subject
	body := fmt.Sprintf("Name: %s\nEmail: %s\nPhone: %s\n\nMessage:\n%s",
		lead.Name, lead.Email, lead.Phone, lead.Message)

	msg := []byte(fmt.Sprintf("To: %s\r\nFrom: %s\r\nSubject: %s\r\n\r\n%s",
		recipient, from, subject, body))

	// 3. Authenticate and Send
	auth := smtp.PlainAuth("", user, pass, host)
	err := smtp.SendMail(host+":"+port, auth, from, []string{recipient}, msg)

	if err != nil {
		s.logger.Error("Failed to send lead email", "error", err)
	} else {
		s.logger.Info("Lead email sent successfully", "to", recipient)
	}
}

func (s *NotificationService) sendWhatsApp(number string, lead models.Lead) {
	s.logger.Info("Sending WhatsApp notification", "to", number, "lead", lead.Name)

	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	fromNumber := os.Getenv("TWILIO_WHATSAPP_NUMBER") // e.g., "whatsapp:+14155238886"

	if accountSid == "" || authToken == "" || fromNumber == "" {
		s.logger.Warn("Twilio credentials not configured, skipping WhatsApp notification")
		return
	}

	apiURL := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid)

	messageBody := fmt.Sprintf("New Lead from A1 French Classes!\n\nName: %s\nEmail: %s\nSubject: %s\nMessage: %s",
		lead.Name, lead.Email, lead.Subject, lead.Message)

	data := url.Values{}
	data.Set("From", fromNumber)
	data.Set("To", "whatsapp:"+number)
	data.Set("Body", messageBody)

	req, _ := http.NewRequest("POST", apiURL, strings.NewReader(data.Encode()))
	req.SetBasicAuth(accountSid, authToken)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		s.logger.Error("Failed to connect to Twilio", "error", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		s.logger.Error("Twilio API error", "status", resp.Status, "body", string(body))
	} else {
		s.logger.Info("WhatsApp notification sent successfully", "to", number)
	}
}

func (s *NotificationService) appendToGoogleSheets(spreadsheetID string, lead models.Lead) {
	s.logger.Info("Appending lead to Google Sheets", "sheet_id", spreadsheetID)

	ctx := context.Background()
	credsJSON := os.Getenv("GOOGLE_SHEETS_CREDENTIALS_JSON")

	if credsJSON == "" {
		s.logger.Warn("GOOGLE_SHEETS_CREDENTIALS_JSON not configured, skipping Google Sheets append")
		return
	}

	srv, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(credsJSON)))
	if err != nil {
		s.logger.Error("Could not initialize Google Sheets service", "error", err)
		return
	}

	values := [][]any{
		{
			lead.ID,
			lead.CreatedAt.Format(time.RFC3339),
			lead.Name,
			lead.Email,
			lead.Phone,
			lead.Subject,
			lead.Message,
		},
	}

	rb := &sheets.ValueRange{
		Values: values,
	}

	// Appends to the end of the first sheet found
	_, err = srv.Spreadsheets.Values.Append(spreadsheetID, "Sheet1!A1", rb).
		ValueInputOption("RAW").
		InsertDataOption("INSERT_ROWS").
		Do()

	if err != nil {
		s.logger.Error("Could not append to Google Sheet", "error", err)
	} else {
		s.logger.Info("Lead appended to Google Sheet successfully", "sheet_id", spreadsheetID)
	}
}
