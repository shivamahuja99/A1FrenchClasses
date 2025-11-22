import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/api/apiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import FormInput from './FormInput';
import GoogleAuthButton from './GoogleAuthButton';
import { validation } from '../../utils/validation';
import styles from './AuthForm.module.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }

        // Clear API error
        if (apiError) {
            setApiError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const emailError = validation.email(formData.email);
        if (emailError) newErrors.email = emailError;

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        try {
            const result = await login(formData).unwrap();

            // Update Redux state
            dispatch(setCredentials(result));

            // Redirect to home page
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setApiError(err.error || 'Failed to login. Please check your credentials.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formSubtitle}>Sign in to continue your learning journey</p>

            {apiError && (
                <div className={styles.apiError} role="alert">
                    {apiError}
                </div>
            )}

            <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                required
                autoComplete="email"
                disabled={isLoading}
            />

            <FormInput
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
            />

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <span className={styles.spinner}></span>
                        Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
            </button>

            <GoogleAuthButton mode="signin" />

            <p className={styles.switchForm}>
                Don't have an account?{' '}
                <a href="/signup" className={styles.link}>
                    Sign up
                </a>
            </p>
        </form>
    );
};

export default LoginForm;
