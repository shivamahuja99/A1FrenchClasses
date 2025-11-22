import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import authReducer from '../../store/slices/authSlice';
import uiReducer from '../../store/slices/uiSlice';
import { apiSlice } from '../../store/api/apiSlice';
import LoginPage from '../../views/LoginPage';
import HomePage from '../../views/HomePage/HomePage';
import ProfilePage from '../../views/ProfilePage';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock the API responses
vi.mock('../../services/mockApi', () => ({
    mockApi: {
        login: vi.fn(),
        getCurrentUser: vi.fn(),
        getPurchasedCourses: vi.fn(),
        logout: vi.fn(),
    },
}));

import { mockApi } from '../../services/mockApi';

// Mock the HomePage components to simplify testing
vi.mock('../../views/HomePage/HomePage', () => ({
    default: () => <div>Home Page</div>,
}));

// Mock the ProfilePage components
vi.mock('../../views/ProfilePage', () => ({
    default: () => <div>Profile Page</div>,
}));

const renderApp = (initialRoute = '/') => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            ui: uiReducer,
            [apiSlice.reducerPath]: apiSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware),
    });

    return {
        ...render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[initialRoute]}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </Provider>
        ),
        store,
    };
};

describe('Authentication Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('redirects to login when accessing protected route unauthenticated', () => {
        renderApp('/profile');

        // Should redirect to login page
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.queryByText('Profile Page')).not.toBeInTheDocument();
    });

    it('allows access to protected route when authenticated', async () => {
        // Setup authenticated state
        const preloadedState = {
            auth: {
                user: { id: 1, name: 'Test User' },
                token: 'fake-token',
                isAuthenticated: true,
            },
        };

        const store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer,
                [apiSlice.reducerPath]: apiSlice.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(apiSlice.middleware),
            preloadedState,
        });

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/profile']}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });

    it('redirects to home after successful login', async () => {
        // Mock successful login response
        mockApi.login.mockResolvedValue({
            user: { id: 1, name: 'Test User', email: 'test@example.com' },
            token: 'fake-token',
        });

        renderApp('/login');

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'Test1234' },
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // Wait for redirect to home
        await waitFor(() => {
            expect(screen.getByText('Home Page')).toBeInTheDocument();
        });
    });
});
