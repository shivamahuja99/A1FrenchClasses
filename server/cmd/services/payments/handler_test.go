package payments

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"services/internal/models"
	"services/internal/repository"
	"testing"

	"github.com/gorilla/mux"
)

// ===================== Mock PayPal Client =====================

type mockPayPalClient struct {
	createOrderFn  func(amount float64, orderID string) (string, string, error)
	captureOrderFn func(orderID string) (string, error)
}

func (m *mockPayPalClient) CreateOrder(amount float64, orderID string) (string, string, error) {
	if m.createOrderFn != nil {
		return m.createOrderFn(amount, orderID)
	}
	return "PAYPAL_ORDER_123", "https://paypal.com/approve/123", nil
}

func (m *mockPayPalClient) CaptureOrder(orderID string) (string, error) {
	if m.captureOrderFn != nil {
		return m.captureOrderFn(orderID)
	}
	return "COMPLETED", nil
}

// ===================== Mock Repositories =====================

type mockPaymentRepo struct {
	payments []*models.Payment
	createFn func(ctx context.Context, payment *models.Payment) error
}

func (m *mockPaymentRepo) Create(ctx context.Context, payment *models.Payment) error {
	if m.createFn != nil {
		return m.createFn(ctx, payment)
	}
	m.payments = append(m.payments, payment)
	return nil
}
func (m *mockPaymentRepo) FindByID(ctx context.Context, id string) (*models.Payment, error) {
	for _, p := range m.payments {
		if p.ID == id {
			return p, nil
		}
	}
	return nil, repository.ErrPaymentNotFound
}
func (m *mockPaymentRepo) FindAll(ctx context.Context) ([]*models.Payment, error) {
	return m.payments, nil
}
func (m *mockPaymentRepo) Update(ctx context.Context, payment *models.Payment) error { return nil }
func (m *mockPaymentRepo) Delete(ctx context.Context, id string) error               { return nil }

type mockOrderRepo struct {
	orders   []*models.Order
	createFn func(ctx context.Context, order *models.Order) error
}

func (m *mockOrderRepo) Create(ctx context.Context, order *models.Order) error {
	if m.createFn != nil {
		return m.createFn(ctx, order)
	}
	order.ID = "test-order-id"
	m.orders = append(m.orders, order)
	return nil
}
func (m *mockOrderRepo) FindByID(ctx context.Context, id string) (*models.Order, error) {
	for _, o := range m.orders {
		if o.ID == id {
			return o, nil
		}
	}
	return nil, repository.ErrOrderNotFound
}
func (m *mockOrderRepo) FindAll(ctx context.Context) ([]*models.Order, error) {
	return m.orders, nil
}
func (m *mockOrderRepo) FindByUserID(ctx context.Context, userID string) ([]*models.Order, error) {
	var result []*models.Order
	for _, o := range m.orders {
		if o.UserID == userID {
			result = append(result, o)
		}
	}
	return result, nil
}
func (m *mockOrderRepo) Update(ctx context.Context, order *models.Order) error { return nil }
func (m *mockOrderRepo) UpdateStatus(ctx context.Context, id string, status string) error {
	for _, o := range m.orders {
		if o.ID == id {
			o.Status = status
			return nil
		}
	}
	return repository.ErrOrderNotFound
}
func (m *mockOrderRepo) Delete(ctx context.Context, id string) error { return nil }

type mockCartRepo struct {
	cart    *models.Cart
	total   float64
	cleared bool
}

func (m *mockCartRepo) GetCartByUserID(ctx context.Context, userID string) (*models.Cart, error) {
	if m.cart == nil {
		return nil, repository.ErrCartNotFound
	}
	return m.cart, nil
}
func (m *mockCartRepo) CreateCart(ctx context.Context, cart *models.Cart) error { return nil }
func (m *mockCartRepo) ClearCart(ctx context.Context, cartID string) error {
	m.cleared = true
	return nil
}
func (m *mockCartRepo) DeleteCart(ctx context.Context, cartID string) error { return nil }
func (m *mockCartRepo) AddItemToCart(ctx context.Context, cartItem *models.CartItem) error {
	return nil
}
func (m *mockCartRepo) GetCartItem(ctx context.Context, cartItemID string) (*models.CartItem, error) {
	return nil, nil
}
func (m *mockCartRepo) UpdateCartItem(ctx context.Context, cartItem *models.CartItem) error {
	return nil
}
func (m *mockCartRepo) RemoveItemFromCart(ctx context.Context, cartItemID string) error { return nil }
func (m *mockCartRepo) GetCartItemByCourseID(ctx context.Context, cartID, courseID string) (*models.CartItem, error) {
	return nil, nil
}
func (m *mockCartRepo) GetCartTotal(ctx context.Context, cartID string) (float64, error) {
	return m.total, nil
}

type mockUserRepo struct {
	assignedCourses map[string][]string // userID -> []courseID
}

func (m *mockUserRepo) Create(ctx context.Context, user *models.User) error { return nil }
func (m *mockUserRepo) FindByID(ctx context.Context, id string) (*models.User, error) {
	return nil, nil
}
func (m *mockUserRepo) FindByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	return nil, nil
}
func (m *mockUserRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	return nil, nil
}
func (m *mockUserRepo) FindAll(ctx context.Context) ([]*models.User, error) { return nil, nil }
func (m *mockUserRepo) Update(ctx context.Context, user *models.User) error { return nil }
func (m *mockUserRepo) Delete(ctx context.Context, id string) error         { return nil }
func (m *mockUserRepo) GetPurchasedCourses(ctx context.Context, userID string) ([]*models.Course, error) {
	return nil, nil
}
func (m *mockUserRepo) AssignCourse(ctx context.Context, userID string, courseID string) error {
	if m.assignedCourses == nil {
		m.assignedCourses = make(map[string][]string)
	}
	m.assignedCourses[userID] = append(m.assignedCourses[userID], courseID)
	return nil
}

// ===================== Helper =====================

func contextWithUserID(userID string) context.Context {
	return context.WithValue(context.Background(), models.UserIDContextKey, userID)
}

func newTestHandler(paymentRepo *mockPaymentRepo, orderRepo *mockOrderRepo, cartRepo *mockCartRepo, userRepo *mockUserRepo, pp *mockPayPalClient) *PaymentHandler {
	return &PaymentHandler{
		logger:       slog.New(slog.NewTextHandler(os.Stdout, nil)),
		repo:         paymentRepo,
		orderRepo:    orderRepo,
		cartRepo:     cartRepo,
		userRepo:     userRepo,
		db:           nil, // no raw db in these tests
		paypalClient: pp,
	}
}

// ===================== Checkout Tests =====================

func TestCheckout_Unauthorized(t *testing.T) {
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequest("POST", "/api/checkout", nil)
	rr := httptest.NewRecorder()
	h.Checkout(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", rr.Code)
	}
}

func TestCheckout_EmptyCart(t *testing.T) {
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{cart: nil}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout", nil)
	rr := httptest.NewRecorder()
	h.Checkout(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty cart, got %d", rr.Code)
	}
}

func TestCheckout_CartWithNoItems(t *testing.T) {
	cart := &models.Cart{ID: "cart-1", Items: []models.CartItem{}}
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{cart: cart, total: 123}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout", nil)
	rr := httptest.NewRecorder()
	h.Checkout(rr, req)

	// Since we calculate items first, it should return 400 or handle normally.
	// Currently the handler checks len(cart.Items) == 0 early.
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for cart with no items, got %d", rr.Code)
	}
}

func TestCheckout_ZeroTotal(t *testing.T) {
	cart := &models.Cart{
		ID: "cart-1",
		Items: []models.CartItem{
			{ID: "item-1", CourseID: "course-1", Price: 0, Quantity: 1},
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{cart: cart, total: 0}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout", nil)
	rr := httptest.NewRecorder()
	h.Checkout(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for zero total, got %d", rr.Code)
	}
}

func TestCheckout_OrderCreationFailure(t *testing.T) {
	cart := &models.Cart{
		ID: "cart-1",
		Items: []models.CartItem{
			{ID: "item-1", CourseID: "course-1", Price: 100, Quantity: 1},
		},
	}
	orderRepo := &mockOrderRepo{
		createFn: func(ctx context.Context, order *models.Order) error {
			return errors.New("database error")
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{cart: cart, total: 100}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout", nil)
	rr := httptest.NewRecorder()
	h.Checkout(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 for order creation failure, got %d", rr.Code)
	}
}

func TestCheckout_PayPalFailure(t *testing.T) {
	cart := &models.Cart{
		ID: "cart-1",
		Items: []models.CartItem{
			{ID: "item-1", CourseID: "course-1", Price: 100, Quantity: 1},
		},
	}
	pp := &mockPayPalClient{
		createOrderFn: func(amount float64, orderID string) (string, string, error) {
			return "", "", fmt.Errorf("paypal is down")
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{cart: cart, total: 100}, &mockUserRepo{}, pp)
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout", nil)
	rr := httptest.NewRecorder()
	h.Checkout(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 for PayPal failure, got %d", rr.Code)
	}
}

// ===================== CaptureCheckout Tests =====================

func TestCaptureCheckout_InvalidJSON(t *testing.T) {
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequest("POST", "/api/checkout/capture", bytes.NewBuffer([]byte("NOT_JSON")))
	rr := httptest.NewRecorder()
	h.CaptureCheckout(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid JSON, got %d", rr.Code)
	}
}

func TestCaptureCheckout_PayPalCaptureFailure(t *testing.T) {
	pp := &mockPayPalClient{
		captureOrderFn: func(orderID string) (string, error) {
			return "", fmt.Errorf("capture failed")
		},
	}
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "order-1", Status: "PENDING"},
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{}, &mockUserRepo{}, pp)
	body, _ := json.Marshal(map[string]string{"order_id": "order-1", "token": "paypal-token"})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout/capture", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	h.CaptureCheckout(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for PayPal capture failure, got %d", rr.Code)
	}
	if orderRepo.orders[0].Status != "FAILED" {
		t.Errorf("expected order status FAILED, got %s", orderRepo.orders[0].Status)
	}
}

func TestCaptureCheckout_Idempotency(t *testing.T) {
	// 1. Order already COMPLETED
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "order-completed", Status: "COMPLETED"},
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{}, &mockUserRepo{}, &mockPayPalClient{})
	body, _ := json.Marshal(map[string]string{"order_id": "order-completed", "token": "token"})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout/capture", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	h.CaptureCheckout(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 for already completed order, got %d", rr.Code)
	}
}

func TestCaptureCheckout_PayPalAlreadyCaptured(t *testing.T) {
	// 2. PayPal returns ORDER_ALREADY_CAPTURED error
	pp := &mockPayPalClient{
		captureOrderFn: func(orderID string) (string, error) {
			return "", fmt.Errorf("failed to capture order, status: 422, body: {\"name\":\"UNPROCESSABLE_ENTITY\",\"message\":\"The requested action could not be performed, semantically incorrect, or failed business validation.\",\"debug_id\":\"f3391930662f4\",\"details\":[{\"issue\":\"ORDER_ALREADY_CAPTURED\",\"description\":\"Order already captured.\"}]}")
		},
	}
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "order-pending", Status: "PENDING", TotalAmount: 100},
		},
	}
	paymentRepo := &mockPaymentRepo{}
	userRepo := &mockUserRepo{}
	h := newTestHandler(paymentRepo, orderRepo, &mockCartRepo{cart: &models.Cart{ID: "cart-1"}}, userRepo, pp)

	body, _ := json.Marshal(map[string]string{"order_id": "order-pending", "token": "token"})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout/capture", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	h.CaptureCheckout(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 for already-captured error, got %d", rr.Code)
	}
	if orderRepo.orders[0].Status != "COMPLETED" {
		t.Errorf("expected order status COMPLETED, got %s", orderRepo.orders[0].Status)
	}
}

func TestCaptureCheckout_NonCompletedStatus(t *testing.T) {
	pp := &mockPayPalClient{
		captureOrderFn: func(orderID string) (string, error) {
			return "VOIDED", nil
		},
	}
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "order-1", Status: "PENDING"},
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{}, &mockUserRepo{}, pp)
	body, _ := json.Marshal(map[string]string{"order_id": "order-1", "token": "token"})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/checkout/capture", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	h.CaptureCheckout(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for non-COMPLETED status, got %d", rr.Code)
	}
	if orderRepo.orders[0].Status != "FAILED" {
		t.Errorf("expected order status FAILED, got %s", orderRepo.orders[0].Status)
	}
}

// ===================== RetryOrder Tests =====================

func TestRetryOrder_OrderNotFound(t *testing.T) {
	h := newTestHandler(&mockPaymentRepo{}, &mockOrderRepo{}, &mockCartRepo{}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/orders/non-existent/retry", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "non-existent"})
	rr := httptest.NewRecorder()
	h.RetryOrder(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404 for missing order, got %d", rr.Code)
	}
}

func TestRetryOrder_AlreadyCompleted(t *testing.T) {
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "completed-order", Status: "COMPLETED", TotalAmount: 100, UserID: "user-1"},
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{}, &mockUserRepo{}, &mockPayPalClient{})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/orders/completed-order/retry", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "completed-order"})
	rr := httptest.NewRecorder()
	h.RetryOrder(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for completed order retry, got %d", rr.Code)
	}
}

func TestRetryOrder_Success(t *testing.T) {
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "failed-order", Status: "FAILED", TotalAmount: 250.50, UserID: "user-1"},
		},
	}
	pp := &mockPayPalClient{
		createOrderFn: func(amount float64, orderID string) (string, string, error) {
			if amount != 250.50 {
				t.Errorf("expected amount 250.50, got %f", amount)
			}
			if orderID != "failed-order" {
				t.Errorf("expected orderID 'failed-order', got %s", orderID)
			}
			return "PAYPAL_RETRY_123", "https://paypal.com/approve/retry", nil
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{}, &mockUserRepo{}, pp)
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/orders/failed-order/retry", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "failed-order"})
	rr := httptest.NewRecorder()
	h.RetryOrder(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 for retry, got %d", rr.Code)
	}

	var resp map[string]string
	_ = json.NewDecoder(rr.Body).Decode(&resp)

	if resp["approve_url"] != "https://paypal.com/approve/retry" {
		t.Errorf("expected retry approve_url, got %s", resp["approve_url"])
	}
}

func TestRetryOrder_PayPalDown(t *testing.T) {
	orderRepo := &mockOrderRepo{
		orders: []*models.Order{
			{ID: "failed-order", Status: "FAILED", TotalAmount: 100, UserID: "user-1"},
		},
	}
	pp := &mockPayPalClient{
		createOrderFn: func(amount float64, orderID string) (string, string, error) {
			return "", "", fmt.Errorf("PayPal timeout")
		},
	}
	h := newTestHandler(&mockPaymentRepo{}, orderRepo, &mockCartRepo{}, &mockUserRepo{}, pp)
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/orders/failed-order/retry", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "failed-order"})
	rr := httptest.NewRecorder()
	h.RetryOrder(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 when PayPal is down, got %d", rr.Code)
	}
}
