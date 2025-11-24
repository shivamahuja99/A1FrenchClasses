import { describe, it, expect } from 'vitest';
import uiReducer, {
    toggleProfileDropdown,
    closeProfileDropdown,
    addNotification,
    removeNotification,
    clearNotifications,
} from '../../store/slices/uiSlice';

describe('uiSlice', () => {
    const initialState = {
        isProfileDropdownOpen: false,
        notifications: [],
    };

    it('should handle initial state', () => {
        expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle toggleProfileDropdown', () => {
        // Test opening
        let actual = uiReducer(initialState, toggleProfileDropdown());
        expect(actual.isProfileDropdownOpen).toBe(true);

        // Test closing
        actual = uiReducer(actual, toggleProfileDropdown());
        expect(actual.isProfileDropdownOpen).toBe(false);
    });

    it('should handle closeProfileDropdown', () => {
        const openState = { ...initialState, isProfileDropdownOpen: true };
        const actual = uiReducer(openState, closeProfileDropdown());
        expect(actual.isProfileDropdownOpen).toBe(false);
    });

    it('should handle addNotification', () => {
        const notification = { id: '1', message: 'Test', type: 'success' };
        const actual = uiReducer(initialState, addNotification(notification));

        expect(actual.notifications).toHaveLength(1);
        expect(actual.notifications[0]).toEqual(notification);
    });

    it('should handle removeNotification', () => {
        const stateWithNotification = {
            ...initialState,
            notifications: [{ id: '1', message: 'Test' }],
        };

        const actual = uiReducer(stateWithNotification, removeNotification('1'));
        expect(actual.notifications).toHaveLength(0);
    });

    it('should handle clearNotifications', () => {
        const stateWithNotifications = {
            ...initialState,
            notifications: [
                { id: '1', message: 'Test 1' },
                { id: '2', message: 'Test 2' },
            ],
        };

        const actual = uiReducer(stateWithNotifications, clearNotifications());
        expect(actual.notifications).toHaveLength(0);
    });
});
