// Form validation utilities

export const validation = {
    // Email validation
    email: (email) => {
        if (!email) {
            return 'Email is required';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }

        return '';
    },

    // Password validation
    password: (password) => {
        if (!password) {
            return 'Password is required';
        }

        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }

        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }

        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }

        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }

        return '';
    },

    // Password strength checker
    passwordStrength: (password) => {
        if (!password) return { strength: 'none', score: 0 };

        let score = 0;

        // Length
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Determine strength
        if (score <= 2) return { strength: 'weak', score, color: '#f44336' };
        if (score <= 4) return { strength: 'medium', score, color: '#ff9800' };
        return { strength: 'strong', score, color: '#4caf50' };
    },

    // Confirm password validation
    confirmPassword: (password, confirmPassword) => {
        if (!confirmPassword) {
            return 'Please confirm your password';
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        return '';
    },

    // Name validation
    name: (name) => {
        if (!name) {
            return 'Name is required';
        }

        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters long';
        }

        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Name can only contain letters and spaces';
        }

        return '';
    },

    // Age validation
    age: (age) => {
        if (!age) {
            return ''; // Age is optional
        }

        const ageNum = parseInt(age, 10);

        if (isNaN(ageNum)) {
            return 'Age must be a number';
        }

        if (ageNum < 5 || ageNum > 120) {
            return 'Please enter a valid age';
        }

        return '';
    },

    // Date of birth validation
    dateOfBirth: (dob) => {
        if (!dob) {
            return ''; // DOB is optional
        }

        const date = new Date(dob);
        const today = new Date();

        if (isNaN(date.getTime())) {
            return 'Please enter a valid date';
        }

        if (date > today) {
            return 'Date of birth cannot be in the future';
        }

        // Check if person is at least 5 years old
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 5);

        if (date > minDate) {
            return 'You must be at least 5 years old';
        }

        return '';
    },

    // Required field validation
    required: (value, fieldName = 'This field') => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return `${fieldName} is required`;
        }
        return '';
    },
};

export default validation;
