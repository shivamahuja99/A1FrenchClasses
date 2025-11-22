import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isProfileDropdownOpen: false,
    notifications: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleProfileDropdown: (state) => {
            state.isProfileDropdownOpen = !state.isProfileDropdownOpen;
        },
        closeProfileDropdown: (state) => {
            state.isProfileDropdownOpen = false;
        },
        openProfileDropdown: (state) => {
            state.isProfileDropdownOpen = true;
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const {
    toggleProfileDropdown,
    closeProfileDropdown,
    openProfileDropdown,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectIsProfileDropdownOpen = (state) => state.ui.isProfileDropdownOpen;
export const selectNotifications = (state) => state.ui.notifications;
