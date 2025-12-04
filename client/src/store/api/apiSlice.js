import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Get API URL based on environment
const getApiUrl = () => {
    const env = import.meta.env.VITE_ENV || 'dev';
    return env === 'prod'
        ? import.meta.env.VITE_API_URL_PROD
        : import.meta.env.VITE_API_URL_DEV;
};

// Base query with authentication
const baseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Base query with automatic token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // If we get a 401 error, try to refresh the token
    if (result.error && result.error.status === 401) {
        console.log('🔄 Got 401 error, attempting token refresh...');
        const refreshToken = sessionStorage.getItem('refresh_token');

        if (refreshToken) {
            // Try to refresh the token
            const refreshResult = await baseQuery(
                {
                    url: '/api/refresh',
                    method: 'POST',
                    body: { refresh_token: refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                console.log('✅ Token refresh successful');
                // Store the new tokens
                const { access_token, refresh_token } = refreshResult.data;
                sessionStorage.setItem('access_token', access_token);
                sessionStorage.setItem('refresh_token', refresh_token);

                // Retry the original request with new token
                result = await baseQuery(args, api, extraOptions);
            } else {
                console.error('❌ Token refresh failed:', refreshResult.error);
                // Refresh failed, clear tokens and redirect to login
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        } else {
            console.log('⚠️ No refresh token available, redirecting to login');
            window.location.href = '/login';
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Courses', 'Reviews', 'Cart'],
    endpoints: (builder) => ({
        // ============ Authentication Endpoints ============

        // Email/Password Signup
        signup: builder.mutation({
            query: (userData) => ({
                url: '/api/signup',
                method: 'POST',
                body: userData,
            }),
            transformResponse: (response) => {
                // Store tokens in sessionStorage
                if (response.access_token) {
                    sessionStorage.setItem('access_token', response.access_token);
                }
                if (response.refresh_token) {
                    sessionStorage.setItem('refresh_token', response.refresh_token);
                }
                return response;
            },
            invalidatesTags: ['User'],
        }),

        // Email/Password Login
        loginWithEmail: builder.mutation({
            query: (credentials) => ({
                url: '/api/login/email',
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (response) => {
                // Store tokens in sessionStorage
                if (response.access_token) {
                    sessionStorage.setItem('access_token', response.access_token);
                }
                if (response.refresh_token) {
                    sessionStorage.setItem('refresh_token', response.refresh_token);
                }
                return response;
            },
            invalidatesTags: ['User'],
        }),

        // Google OAuth Login
        googleAuth: builder.mutation({
            query: (googleData) => ({
                url: '/api/login/google',
                method: 'POST',
                body: googleData,
            }),
            transformResponse: (response) => {
                // Store tokens in sessionStorage
                if (response.access_token) {
                    sessionStorage.setItem('access_token', response.access_token);
                }
                if (response.refresh_token) {
                    sessionStorage.setItem('refresh_token', response.refresh_token);
                }
                return response;
            },
            invalidatesTags: ['User'],
        }),

        // Refresh Token
        refreshToken: builder.mutation({
            query: (refreshToken) => ({
                url: '/api/refresh',
                method: 'POST',
                body: { refresh_token: refreshToken },
            }),
            transformResponse: (response) => {
                // Store new tokens
                if (response.access_token) {
                    sessionStorage.setItem('access_token', response.access_token);
                }
                if (response.refresh_token) {
                    sessionStorage.setItem('refresh_token', response.refresh_token);
                }
                return response;
            },
        }),

        // Logout
        logout: builder.mutation({
            query: (token) => ({
                url: '/api/logout',
                method: 'POST',
                body: { token },
            }),
            transformResponse: (response) => {
                // Clear tokens from sessionStorage
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                return response;
            },
            invalidatesTags: ['User', 'Courses', 'Reviews'],
        }),

        // ============ User Endpoints (Protected) ============

        // Get Current User
        getCurrentUser: builder.query({
            query: () => ({
                url: '/api/user/me',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),

        // Update User Profile
        updateProfile: builder.mutation({
            query: (userData) => ({
                url: '/api/user/me',
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // ============ Course Endpoints (Protected) ============

        // List All Courses
        getCourses: builder.query({
            query: () => ({
                url: '/api/courses',
                method: 'GET',
            }),
            providesTags: ['Courses'],
        }),

        // Get Single Course
        getCourse: builder.query({
            query: (courseId) => ({
                url: `/api/courses/${courseId}`,
                method: 'GET',
            }),
            providesTags: (result, error, courseId) => [{ type: 'Courses', id: courseId }],
        }),

        // ============ Review Endpoints (Protected) ============

        // Get Reviews for a Course
        getCourseReviews: builder.query({
            query: (courseId) => ({
                url: `/api/reviews?course_id=${courseId}`,
                method: 'GET',
            }),
            providesTags: (result, error, courseId) => [
                { type: 'Reviews', id: courseId },
            ],
        }),

        // Create Review
        createReview: builder.mutation({
            query: (reviewData) => ({
                url: '/api/reviews',
                method: 'POST',
                body: reviewData,
            }),
            invalidatesTags: (result, error, { course_id }) => [
                { type: 'Reviews', id: course_id },
                'Reviews',
            ],
        }),

        // Update Review
        updateReview: builder.mutation({
            query: ({ id, ...reviewData }) => ({
                url: `/api/reviews/${id}`,
                method: 'PUT',
                body: reviewData,
            }),
            invalidatesTags: (result, error, { course_id }) => [
                { type: 'Reviews', id: course_id },
                'Reviews',
            ],
        }),

        // Delete Review
        deleteReview: builder.mutation({
            query: (reviewId) => ({
                url: `/api/reviews/${reviewId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Reviews'],
        }),

        // ============ Cart Endpoints (Protected) ============

        // Get User's Cart
        getCart: builder.query({
            query: () => ({
                url: '/api/cart',
                method: 'GET',
            }),
            providesTags: ['Cart'],
        }),

        // Add Item to Cart
        addToCart: builder.mutation({
            query: (cartData) => ({
                url: '/api/cart/items',
                method: 'POST',
                body: cartData,
            }),
            invalidatesTags: ['Cart'],
        }),

        // Update Cart Item
        updateCartItem: builder.mutation({
            query: ({ id, ...updateData }) => ({
                url: `/api/cart/items/${id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: ['Cart'],
        }),

        // Remove Item from Cart
        removeFromCart: builder.mutation({
            query: (itemId) => ({
                url: `/api/cart/items/${itemId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),

        // Clear Cart
        clearCart: builder.mutation({
            query: () => ({
                url: '/api/cart',
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),
    }),
});

export const {
    // Auth hooks
    useSignupMutation,
    useLoginWithEmailMutation,
    useGoogleAuthMutation,
    useRefreshTokenMutation,
    useLogoutMutation,

    // User hooks
    useGetCurrentUserQuery,
    useUpdateProfileMutation,

    // Course hooks
    useGetCoursesQuery,
    useGetCourseQuery,

    // Review hooks
    useGetCourseReviewsQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,

    // Cart hooks
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = apiSlice;
