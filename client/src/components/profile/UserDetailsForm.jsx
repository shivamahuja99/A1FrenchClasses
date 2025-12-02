import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, updateUser } from '../../store/slices/authSlice';
import { useUpdateProfileMutation } from '../../store/api/apiSlice';
import FormInput from '../auth/FormInput';
import { validation } from '../../utils/validation';
import styles from './UserDetailsForm.module.css';

const UserDetailsForm = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: user?.age || '',
        dob: user?.dob || '',
        email: user?.email || '',
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

        // Clear messages
        if (apiError) setApiError('');
        if (successMessage) setSuccessMessage('');
    };

    const validateForm = () => {
        const newErrors = {};

        const nameError = validation.name(formData.name);
        if (nameError) newErrors.name = nameError;

        const ageError = validation.age(formData.age);
        if (ageError) newErrors.age = ageError;

        const dobError = validation.dob(formData.dob);
        if (dobError) newErrors.dob = dobError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            const updates = {
                name: formData.name,
                age: formData.age ? parseInt(formData.age, 10) : null,
                dob: formData.dob || null,
            };

            // Call API to update profile
            const result = await updateProfile(updates).unwrap();

            // Update Redux state
            dispatch(updateUser(result));

            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Update profile error:', err);
            setApiError(err.error || 'Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            age: user?.age || '',
            dob: user?.dateOfBirth || '',
            email: user?.email || '',
        });
        setErrors({});
        setApiError('');
        setSuccessMessage('');
        setIsEditing(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Personal Information</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className={styles.editButton}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {successMessage && (
                <div className={styles.successMessage} role="alert">
                    {successMessage}
                </div>
            )}

            {apiError && (
                <div className={styles.errorMessage} role="alert">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <FormInput
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    required
                    disabled={!isEditing || isLoading}
                />

                <FormInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    disabled={true}
                />

                <div className={styles.row}>
                    <FormInput
                        label="Age"
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        error={errors.age}
                        placeholder="Your age"
                        disabled={!isEditing || isLoading}
                    />

                    <FormInput
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        error={errors.dob}
                        disabled={!isEditing || isLoading}
                    />
                </div>

                {isEditing && (
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={`${styles.button} ${styles.cancelButton}`}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.saveButton}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default UserDetailsForm;
