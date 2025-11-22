import { describe, it, expect } from 'vitest';
import authReducer, {
    setCredentials,
    logout,
    updateUser,
} from '../../store/slices/authSlice';

describe('authSlice', () => {
    const initialState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
    };

    it('should handle initial state', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setCredentials', () => {
        const user = { id: 1, name: 'Test User', email: 'test@example.com' };
        const token = 'fake-token';

        const actual = authReducer(
            initialState,
            setCredentials({ user, token })
        );

        expect(actual.user).toEqual(user);
        expect(actual.token).toEqual(token);
        expect(actual.isAuthenticated).toBe(true);
    });

    it('should handle logout', () => {
        const loggedInState = {
            user: { id: 1, name: 'Test User' },
            token: 'fake-token',
            isAuthenticated: true,
            loading: false,
        };

        const actual = authReducer(loggedInState, logout());

        expect(actual).toEqual(initialState);
    });

    it('should handle updateUser', () => {
        const loggedInState = {
            user: { id: 1, name: 'Old Name', email: 'test@example.com' },
            token: 'fake-token',
            isAuthenticated: true,
        };

        const updatedUser = { id: 1, name: 'New Name', email: 'test@example.com' };

        const actual = authReducer(loggedInState, updateUser(updatedUser));

        expect(actual.user).toEqual(updatedUser);
        expect(actual.token).toEqual('fake-token');
        expect(actual.isAuthenticated).toBe(true);
    });
});
