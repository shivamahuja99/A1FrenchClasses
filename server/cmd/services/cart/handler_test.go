package cart

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"services/internal/models"
	"services/internal/repository"
	"testing"
)

// ===================== Mock Repositories =====================

type mockCartRepo struct {
	cart      *models.Cart
	cartItems []*models.CartItem
	createErr error
	addErr    error
}

func (m *mockCartRepo) GetCartByUserID(ctx context.Context, userID string) (*models.Cart, error) {
	if m.cart == nil {
		return nil, repository.ErrCartNotFound
	}
	return m.cart, nil
}
func (m *mockCartRepo) CreateCart(ctx context.Context, cart *models.Cart) error { return m.createErr }
func (m *mockCartRepo) ClearCart(ctx context.Context, cartID string) error      { return nil }
func (m *mockCartRepo) DeleteCart(ctx context.Context, cartID string) error     { return nil }

func (m *mockCartRepo) AddItemToCart(ctx context.Context, cartItem *models.CartItem) error {
	if m.addErr != nil {
		return m.addErr
	}
	m.cartItems = append(m.cartItems, cartItem)
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
	for _, item := range m.cartItems {
		if item.CartID == cartID && item.CourseID == courseID {
			return item, nil
		}
	}
	return nil, repository.ErrCartItemNotFound
}
func (m *mockCartRepo) GetCartTotal(ctx context.Context, cartID string) (float64, error) { return 0, nil }

// mockCourseRepo
type mockCourseRepo struct {
	courses []*models.Course
}

func (m *mockCourseRepo) Create(ctx context.Context, course *models.Course) error { return nil }
func (m *mockCourseRepo) FindByID(ctx context.Context, id string) (*models.Course, error) {
	for _, c := range m.courses {
		if c.ID == id {
			return c, nil
		}
	}
	return nil, repository.ErrCourseNotFound
}
func (m *mockCourseRepo) FindAll(ctx context.Context) ([]*models.Course, error) { return nil, nil }
func (m *mockCourseRepo) FindByInstructorID(ctx context.Context, instructorID string) ([]*models.Course, error) {
	return nil, nil
}
func (m *mockCourseRepo) Update(ctx context.Context, course *models.Course) error { return nil }
func (m *mockCourseRepo) Delete(ctx context.Context, id string) error               { return nil }

// ===================== Helper =====================

func contextWithUserID(userID string) context.Context {
	return context.WithValue(context.Background(), models.UserIDContextKey, userID)
}

func newTestHandler(cartRepo *mockCartRepo, courseRepo *mockCourseRepo) *CartHandler {
	return &CartHandler{
		logger:     slog.New(slog.NewTextHandler(os.Stdout, nil)),
		cartRepo:   cartRepo,
		courseRepo: courseRepo,
	}
}

// ===================== AddToCart Tests =====================

func TestAddToCart_SuccessNewItem(t *testing.T) {
	cartRepo := &mockCartRepo{
		cart: &models.Cart{ID: "cart-1", UserID: "user-1"},
	}
	courseRepo := &mockCourseRepo{
		courses: []*models.Course{
			{ID: "course-1", Price: 100},
		},
	}
	h := newTestHandler(cartRepo, courseRepo)

	body, _ := json.Marshal(map[string]interface{}{
		"course_id": "course-1",
	})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/cart/items", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	h.AddToCart(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected 201 Created for new cart item, got %d", rr.Code)
	}

	if len(cartRepo.cartItems) != 1 {
		t.Errorf("expected 1 item in cart, got %d", len(cartRepo.cartItems))
	}
}

func TestAddToCart_AlreadyExists(t *testing.T) {
	cartRepo := &mockCartRepo{
		cart: &models.Cart{ID: "cart-1", UserID: "user-1"},
		cartItems: []*models.CartItem{
			{ID: "item-1", CartID: "cart-1", CourseID: "course-1", Price: 100},
		},
	}
	courseRepo := &mockCourseRepo{
		courses: []*models.Course{
			{ID: "course-1", Price: 100},
		},
	}
	h := newTestHandler(cartRepo, courseRepo)

	body, _ := json.Marshal(map[string]interface{}{
		"course_id": "course-1",
	})
	req, _ := http.NewRequestWithContext(contextWithUserID("user-1"), "POST", "/api/cart/items", bytes.NewBuffer(body))
	rr := httptest.NewRecorder()
	h.AddToCart(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 OK for existing item, got %d", rr.Code)
	}

	if len(cartRepo.cartItems) != 1 {
		t.Errorf("expected still only 1 item in cart, got %d", len(cartRepo.cartItems))
	}
}
