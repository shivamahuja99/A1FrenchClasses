import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    isAuthenticated: !!sessionStorage.getItem('access_token'),
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, access_token, refresh_token } = action.payload;
            state.user = user;
            state.isAuthenticated = true;

            // Tokens are already stored in sessionStorage by apiSlice
            // Just store user data here
            if (user) {
                sessionStorage.setItem('user', JSON.stringify(user));
            }
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            sessionStorage.setItem('user', JSON.stringify(state.user));
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;

            // Clear all auth data from sessionStorage
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setCredentials, updateUser, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
