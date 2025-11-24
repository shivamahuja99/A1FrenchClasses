import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import authReducer from './store/slices/authSlice';
import { apiSlice } from './store/api/apiSlice';

// Mock the API slice hooks
vi.mock('./store/api/apiSlice', async () => {
    const actual = await vi.importActual('./store/api/apiSlice');
    return {
        ...actual,
        useGetCurrentUserQuery: vi.fn(),
    };
});

// Mock child components to simplify testing
vi.mock('./views', () => ({
    HomePage: () => <div>Home Page</div>,
    CoursesPage: () => <div>Courses Page</div>,
    LoginPage: () => <div>Login Page</div>,
    SignupPage: () => <div>Signup Page</div>,
    ProfilePage: () => <div>Profile Page</div>,
}));

describe('App', () => {
    it('renders loading state when initializing auth', () => {
        const { useGetCurrentUserQuery } = require('./store/api/apiSlice');
        useGetCurrentUserQuery.mockReturnValue({
            data: null,
            isLoading: true,
        });

        const store = configureStore({
            reducer: {
                auth: authReducer,
                [apiSlice.reducerPath]: apiSlice.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(apiSlice.middleware),
            preloadedState: {
                auth: {
                    token: 'fake-token',
                    isAuthenticated: true, // Simulate logged in state to trigger fetch
                },
            },
        });

        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders app content when auth initialized', () => {
        const { useGetCurrentUserQuery } = require('./store/api/apiSlice');
        useGetCurrentUserQuery.mockReturnValue({
            data: { id: 1, name: 'Test User' },
            isLoading: false,
        });

        const store = configureStore({
            reducer: {
                auth: authReducer,
                [apiSlice.reducerPath]: apiSlice.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(apiSlice.middleware),
            preloadedState: {
                auth: {
                    token: 'fake-token',
                    isAuthenticated: true,
                },
            },
        });

        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
});
