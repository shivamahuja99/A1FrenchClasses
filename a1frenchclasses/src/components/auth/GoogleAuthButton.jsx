import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGoogleAuthMutation } from '../../store/api/apiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { googleOAuth } from '../../services/googleOAuth';
import styles from './AuthForm.module.css';

const GoogleAuthButton = ({ mode = 'signin' }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [googleAuth, { isLoading }] = useGoogleAuthMutation();
    const [error, setError] = useState('');

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId || clientId === 'your_google_client_id_here') {
            console.warn('Google Client ID not configured.');
            return;
        }

        // Initialize Google Sign-In
        googleOAuth.initialize(clientId).then((google) => {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse,
            });

            // Render the button
            google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                {
                    theme: 'outline',
                    size: 'large',
                    text: mode === 'signin' ? 'signin_with' : 'signup_with',
                    width: '100%',
                }
            );
        }).catch((err) => {
            console.error('Failed to initialize Google Sign-In:', err);
            setError('Failed to load Google Sign-In');
        });
    }, [clientId, mode]);

    const handleGoogleResponse = async (response) => {
        try {
            setError('');

            // Decode and extract user data
            const userData = googleOAuth.handleCredentialResponse(response);
            const googleData = googleOAuth.extractUserData(userData);

            // Call our API with Google data
            const result = await googleAuth(googleData).unwrap();

            // Update Redux state
            dispatch(setCredentials(result));

            // Redirect to home page
            navigate('/');
        } catch (err) {
            console.error('Google auth error:', err);
            setError(err.error || 'Failed to sign in with Google');
        }
    };

    if (!clientId || clientId === 'your_google_client_id_here') {
        return (
            <div className={styles.googleAuthContainer}>
                <div className={styles.googleAuthWarning}>
                    <p>Google Sign-In not configured</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.googleAuthContainer}>
            <div className={styles.divider}>
                <span>OR</span>
            </div>

            <div id="googleSignInButton" className={styles.googleButton}></div>

            {error && (
                <div className={styles.errorMessage} role="alert">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                </div>
            )}
        </div>
    );
};

export default GoogleAuthButton;
