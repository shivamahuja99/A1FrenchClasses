import { useState } from 'react';
import styles from './AuthForm.module.css';

const FormInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    error,
    placeholder,
    required = false,
    autoComplete,
    disabled = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={styles.formGroup}>
            <label htmlFor={name} className={styles.label}>
                {label}
                {required && <span className={styles.required} aria-label="required">*</span>}
            </label>

            <div className={styles.inputWrapper}>
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${name}-error` : undefined}
                />

                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.togglePassword}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={0}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                )}
            </div>

            {error && (
                <span id={`${name}-error`} className={styles.errorMessage} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

export default FormInput;
