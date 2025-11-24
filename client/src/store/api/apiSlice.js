import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { mockApi } from '../../services/mockApi';

// Custom base query that uses our mock API
const mockBaseQuery = async (args) => {
    try {
        const { url, method, body } = args;
        const token = localStorage.getItem('token');

        let result;

        switch (url) {
            case '/auth/signup':
                result = await mockApi.signup(body);
                break;
            case '/auth/login':
                result = await mockApi.login(body);
                break;
            case '/auth/google':
                result = await mockApi.googleAuth(body);
                break;
            case '/auth/me':
                result = await mockApi.getCurrentUser(token);
                break;
            case '/auth/logout':
                result = await mockApi.logout();
                break;
            case '/user/profile':
                result = await mockApi.updateProfile(token, body);
                break;
            case '/user/courses':
                result = await mockApi.getPurchasedCourses(token);
                break;
            default:
                throw new Error(`Unknown endpoint: ${url}`);
        }

        return { data: result };
    } catch (error) {
        return {
            error: {
                status: 'CUSTOM_ERROR',
                error: error.message,
            },
        };
    }
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: mockBaseQuery,
    tagTypes: ['User', 'Courses'],
    endpoints: (builder) => ({
        // Authentication endpoints
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        signup: builder.mutation({
            query: (userData) => ({
                url: '/auth/signup',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        googleAuth: builder.mutation({
            query: (googleData) => ({
                url: '/auth/google',
                method: 'POST',
                body: googleData,
            }),
            invalidatesTags: ['User'],
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Courses'],
        }),

        // User endpoints
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),

        updateProfile: builder.mutation({
            query: (updates) => ({
                url: '/user/profile',
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['User'],
        }),

        // Courses endpoints
        getPurchasedCourses: builder.query({
            query: () => ({
                url: '/user/courses',
                method: 'GET',
            }),
            providesTags: ['Courses'],
        }),
    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useGoogleAuthMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useUpdateProfileMutation,
    useGetPurchasedCoursesQuery,
} = apiSlice;
