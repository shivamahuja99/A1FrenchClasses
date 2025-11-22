// Google OAuth integration service

export const googleOAuth = {
    // Initialize Google Sign-In
    initialize: (clientId) => {
        return new Promise((resolve, reject) => {
            // Load Google Sign-In script
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                if (window.google) {
                    resolve(window.google);
                } else {
                    reject(new Error('Google Sign-In failed to load'));
                }
            };

            script.onerror = () => {
                reject(new Error('Failed to load Google Sign-In script'));
            };

            document.head.appendChild(script);
        });
    },

    // Handle Google Sign-In response
    handleCredentialResponse: (response) => {
        try {
            // Decode JWT token to get user info
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding Google credential:', error);
            throw new Error('Failed to process Google Sign-In response');
        }
    },

    // Extract user data from Google response
    extractUserData: (googleData) => {
        return {
            sub: googleData.sub, // Google user ID
            email: googleData.email,
            name: googleData.name,
            picture: googleData.picture,
            email_verified: googleData.email_verified,
        };
    },
};

export default googleOAuth;
