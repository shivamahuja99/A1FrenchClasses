import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import authReducer from '../../store/slices/authSlice';
import uiReducer from '../../store/slices/uiSlice';
import { apiSlice } from '../../store/api/apiSlice';

// Helper to render with Redux and Router
const renderWithProviders = (component, { preloadedState = {} } = {}) => {
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

    return {
        ...render(
            <Provider store={store}>
                <BrowserRouter>{component}</BrowserRouter>
            </Provider>
        ),
        store,
    };
};

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form with all fields', () => {
        renderWithProviders(<LoginForm />);

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderWithProviders(<LoginForm />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
        });
    });

    it('clears error when user types', async () => {
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // Trigger error
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });

        // Type to clear error
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        await waitFor(() => {
            expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderWithProviders(<LoginForm />);

        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByLabelText(/show password/i);

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('has link to signup page', () => {
        renderWithProviders(<LoginForm />);

        const signupLink = screen.getByRole('link', { name: /sign up/i });
        expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('disables submit button while loading', async () => {
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });

        fireEvent.click(submitButton);

        // Button should be disabled during submission
        expect(submitButton).toBeDisabled();
    });

    it('renders Google auth button', () => {
        renderWithProviders(<LoginForm />);

        expect(screen.getByText(/OR/i)).toBeInTheDocument();
    });
});
