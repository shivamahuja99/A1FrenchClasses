package paypal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var (
	baseSandboxURL = "https://api-m.sandbox.paypal.com"
	baseLiveURL    = "https://api-m.paypal.com"
)

type Client struct {
	ClientID     string
	ClientSecret string
	BaseURL      string
	HTTPClient   *http.Client
}

func NewClient() *Client {
	// Default to Sandbox, allow override
	baseURL := baseSandboxURL
	if os.Getenv("PAYPAL_ENVIRONMENT") == "live" {
		baseURL = baseLiveURL
	}

	return &Client{
		ClientID:     os.Getenv("PAYPAL_CLIENT_ID"),
		ClientSecret: os.Getenv("PAYPAL_CLIENT_SECRET"),
		BaseURL:      baseURL,
		HTTPClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// getAccessToken authenticates using Client Credentials grant
func (c *Client) getAccessToken() (string, error) {
	req, err := http.NewRequest("POST", c.BaseURL+"/v1/oauth2/token", bytes.NewBuffer([]byte("grant_type=client_credentials")))
	if err != nil {
		return "", err
	}
	req.SetBasicAuth(c.ClientID, c.ClientSecret)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("failed to get access token, status: %d, body: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	token, ok := result["access_token"].(string)
	if !ok {
		return "", fmt.Errorf("access token not found in response")
	}

	return token, nil
}

type PurchaseUnitRequest struct {
	Amount struct {
		CurrencyCode string `json:"currency_code"`
		Value        string `json:"value"`
	} `json:"amount"`
}

type ApplicationContext struct {
	ReturnURL string `json:"return_url"`
	CancelURL string `json:"cancel_url"`
}

type CreateOrderRequest struct {
	Intent             string               `json:"intent"`
	PurchaseUnits      []PurchaseUnitRequest `json:"purchase_units"`
	ApplicationContext ApplicationContext   `json:"application_context"`
}

// CreateOrder calls the PayPal API to create an order
func (c *Client) CreateOrder(amount float64, orderID string) (string, string, error) {
	token, err := c.getAccessToken()
	if err != nil {
		return "", "", err
	}

	// Assuming the front-end runs on localhost:5173 for local dev 
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	orderReq := CreateOrderRequest{
		Intent: "CAPTURE",
		ApplicationContext: ApplicationContext{
			ReturnURL: fmt.Sprintf("%s/checkout/success?order_id=%s", frontendURL, orderID),
			CancelURL: fmt.Sprintf("%s/checkout/cancel?order_id=%s", frontendURL, orderID),
		},
	}
	// Add format helper for amount
	amountStr := fmt.Sprintf("%.2f", amount)
	orderReq.PurchaseUnits = []PurchaseUnitRequest{
		{
			Amount: struct {
				CurrencyCode string `json:"currency_code"`
				Value        string `json:"value"`
			}{
				CurrencyCode: "USD",
				Value:        amountStr,
			},
		},
	}

	bodyBytes, err := json.Marshal(orderReq)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequest("POST", c.BaseURL+"/v2/checkout/orders", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", "", err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("failed to create order, status: %d, body: %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		ID    string `json:"id"`
		Links []struct {
			Href   string `json:"href"`
			Rel    string `json:"rel"`
			Method string `json:"method"`
		} `json:"links"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", "", err
	}

	var approveURL string
	for _, link := range result.Links {
		if link.Rel == "approve" {
			approveURL = link.Href
			break
		}
	}

	return result.ID, approveURL, nil
}

// CaptureOrder captures a previously created order using its ID
func (c *Client) CaptureOrder(orderID string) (string, error) {
	token, err := c.getAccessToken()
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", c.BaseURL+"/v2/checkout/orders/"+orderID+"/capture", nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("failed to capture order, status: %d, body: %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.Status, nil
}
