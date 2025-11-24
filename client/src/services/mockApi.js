// Mock API service to simulate backend
// Replace these functions with actual API calls to your backend

const MOCK_DELAY = 800; // Simulate network delay

// Mock database using localStorage
const USERS_KEY = 'mock_users_db';
const COURSES_KEY = 'mock_courses_db';

// Initialize mock data
const initializeMockData = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }

    if (!localStorage.getItem(COURSES_KEY)) {
        // Mock purchased courses data
        const mockCourses = [
            {
                id: 1,
                title: 'French A1 - Beginner',
                description: 'Complete beginner course for French language',
                image: '/images/course-a1.jpg',
                progress: 45,
                enrolledDate: '2024-01-15',
            },
            {
                id: 2,
                title: 'French A2 - Elementary',
                description: 'Elementary level French course',
                image: '/images/course-a2.jpg',
                progress: 20,
                enrolledDate: '2024-02-01',
            },
        ];
        localStorage.setItem(COURSES_KEY, JSON.stringify(mockCourses));
    }
};

initializeMockData();

// Helper to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
    // User signup
    signup: async (userData) => {
        await delay(MOCK_DELAY);

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

        // Check if user already exists
        const existingUser = users.find((u) => u.email === userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            age: userData.age || null,
            dateOfBirth: userData.dateOfBirth || null,
            password: userData.password, // In real app, this would be hashed
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Generate mock token
        const token = `mock_token_${newUser.id}_${Date.now()}`;

        // Return user without password
        const { password, ...userWithoutPassword } = newUser;

        return {
            user: userWithoutPassword,
            token,
        };
    },

    // User login
    login: async (credentials) => {
        await delay(MOCK_DELAY);

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

        const user = users.find(
            (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Generate mock token
        const token = `mock_token_${user.id}_${Date.now()}`;

        // Return user without password
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    },

    // Google OAuth
    googleAuth: async (googleData) => {
        await delay(MOCK_DELAY);

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

        // Check if user exists
        let user = users.find((u) => u.email === googleData.email);

        if (!user) {
            // Create new user from Google data
            user = {
                id: Date.now(),
                name: googleData.name,
                email: googleData.email,
                age: null,
                dateOfBirth: null,
                googleId: googleData.sub,
                picture: googleData.picture,
                createdAt: new Date().toISOString(),
            };

            users.push(user);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        // Generate mock token
        const token = `mock_token_${user.id}_${Date.now()}`;

        return {
            user,
            token,
        };
    },

    // Get current user
    getCurrentUser: async (token) => {
        await delay(MOCK_DELAY);

        if (!token) {
            throw new Error('No token provided');
        }

        // Extract user ID from token (mock implementation)
        const userId = parseInt(token.split('_')[2]);

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find((u) => u.id === userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    },

    // Update user profile
    updateProfile: async (token, updates) => {
        await delay(MOCK_DELAY);

        if (!token) {
            throw new Error('No token provided');
        }

        // Extract user ID from token
        const userId = parseInt(token.split('_')[2]);

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const userIndex = users.findIndex((u) => u.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Update user
        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            id: users[userIndex].id, // Ensure ID doesn't change
            email: users[userIndex].email, // Ensure email doesn't change
        };

        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Return updated user without password
        const { password, ...userWithoutPassword } = users[userIndex];

        return userWithoutPassword;
    },

    // Get purchased courses
    getPurchasedCourses: async (token) => {
        await delay(MOCK_DELAY);

        if (!token) {
            throw new Error('No token provided');
        }

        // In a real app, this would fetch user-specific courses
        const courses = JSON.parse(localStorage.getItem(COURSES_KEY) || '[]');

        return courses;
    },

    // Logout
    logout: async () => {
        await delay(300);
        // In a real app, this might invalidate the token on the server
        return { success: true };
    },
};

export default mockApi;
