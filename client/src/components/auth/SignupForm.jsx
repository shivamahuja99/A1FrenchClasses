import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSignupMutation } from '../../store/api/apiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import FormInput from './FormInput';
import GoogleAuthButton from './GoogleAuthButton';
import { validation } from '../../utils/validation';
import styles from './AuthForm.module.css';

const SignupForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [signup, { isLoading }] = useSignupMutation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0 });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Update password strength
        if (name === 'password') {
            setPasswordStrength(validation.passwordStrength(value));
        }

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

        const nameError = validation.name(formData.name);
        if (nameError) newErrors.name = nameError;

        const emailError = validation.email(formData.email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validation.password(formData.password);
        if (passwordError) newErrors.password = passwordError;

        const confirmPasswordError = validation.confirmPassword(
            formData.password,
            formData.confirmPassword
        );
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

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
            const { confirmPassword, ...signupData } = formData;
            const result = await signup(signupData).unwrap();

            // Update Redux state
            dispatch(setCredentials(result));

            // Redirect to home page
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err);
            setApiError(err.error || 'Failed to create account. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSubtitle}>Join us and start learning French today</p>

            {apiError && (
                <div className={styles.apiError} role="alert">
                    {apiError}
                </div>
            )}

            <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                disabled={isLoading}
            />

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
                placeholder="Create a password"
                required
                autoComplete="new-password"
                disabled={isLoading}
            />

            {formData.password && (
                <div className={styles.passwordStrength}>
                    <div className={styles.strengthBar}>
                        <div
                            className={styles.strengthFill}
                            style={{
                                width: `${(passwordStrength.score / 6) * 100}%`,
                                backgroundColor: passwordStrength.color,
                            }}
                        ></div>
                    </div>
                    <span className={styles.strengthText} style={{ color: passwordStrength.color }}>
                        Password strength: {passwordStrength.strength}
                    </span>
                </div>
            )}

            <FormInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
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
                        Creating account...
                    </>
                ) : (
                    'Sign Up'
                )}
            </button>

            <GoogleAuthButton mode="signup" />

            <p className={styles.switchForm}>
                Already have an account?{' '}
                <a href="/login" className={styles.link}>
                    Sign in
                </a>
            </p>
        </form>
    );
};

export default SignupForm;
