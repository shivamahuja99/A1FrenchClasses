import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import SignupForm from '../../components/auth/SignupForm';
import authReducer from '../../store/slices/authSlice';
import uiReducer from '../../store/slices/uiSlice';
import { apiSlice } from '../../store/api/apiSlice';

const renderWithProviders = (component) => {
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
                <BrowserRouter>{component}</BrowserRouter>
            </Provider>
        ),
        store,
    };
};

describe('SignupForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders signup form with all fields', () => {
        renderWithProviders(<SignupForm />);

        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderWithProviders(<SignupForm />);

        const submitButton = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    it('validates name format', async () => {
        renderWithProviders(<SignupForm />);

        const nameInput = screen.getByLabelText(/full name/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        // Test too short
        fireEvent.change(nameInput, { target: { value: 'A' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        });

        // Test invalid characters
        fireEvent.change(nameInput, { target: { value: 'Test123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/name can only contain letters/i)).toBeInTheDocument();
        });
    });

    it('validates password strength', async () => {
        renderWithProviders(<SignupForm />);

        const passwordInput = screen.getByLabelText(/^password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        // Test too short
        fireEvent.change(passwordInput, { target: { value: 'Test1' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
        });

        // Test missing uppercase
        fireEvent.change(passwordInput, { target: { value: 'test1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/password must contain at least one uppercase/i)).toBeInTheDocument();
        });

        // Test missing number
        fireEvent.change(passwordInput, { target: { value: 'TestTest' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
        });
    });

    it('shows password strength indicator', async () => {
        renderWithProviders(<SignupForm />);

        const passwordInput = screen.getByLabelText(/^password/i);

        // Weak password
        fireEvent.change(passwordInput, { target: { value: 'Test12' } });
        await waitFor(() => {
            expect(screen.getByText(/password strength: weak/i)).toBeInTheDocument();
        });

        // Medium password
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        await waitFor(() => {
            expect(screen.getByText(/password strength: medium/i)).toBeInTheDocument();
        });

        // Strong password
        fireEvent.change(passwordInput, { target: { value: 'Test1234!@#' } });
        await waitFor(() => {
            expect(screen.getByText(/password strength: strong/i)).toBeInTheDocument();
        });
    });

    it('validates password confirmation', async () => {
        renderWithProviders(<SignupForm />);

        const passwordInput = screen.getByLabelText(/^password/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test5678' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

    it('accepts valid form submission', async () => {
        renderWithProviders(<SignupForm />);

        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/^email/i);
        const passwordInput = screen.getByLabelText(/^password/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test1234' } });

        fireEvent.click(submitButton);

        // Should not show validation errors
        await waitFor(() => {
            expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
        });
    });

    it('has link to login page', () => {
        renderWithProviders(<SignupForm />);

        const loginLink = screen.getByRole('link', { name: /sign in/i });
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('disables form during submission', async () => {
        renderWithProviders(<SignupForm />);

        const nameInput = screen.getByLabelText(/full name/i);
        const emailInput = screen.getByLabelText(/^email/i);
        const passwordInput = screen.getByLabelText(/^password/i);
        const confirmInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test1234' } });

        fireEvent.click(submitButton);

        // All inputs and button should be disabled
        expect(submitButton).toBeDisabled();
    });
});
