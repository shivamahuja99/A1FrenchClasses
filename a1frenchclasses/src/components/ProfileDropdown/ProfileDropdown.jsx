import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { logout } from '../../store/slices/authSlice';
import {
    selectIsProfileDropdownOpen,
    toggleProfileDropdown,
    closeProfileDropdown,
} from '../../store/slices/uiSlice';
import { useLogoutMutation } from '../../store/api/apiSlice';
import styles from './ProfileDropdown.module.css';

const ProfileDropdown = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const user = useSelector(selectCurrentUser);
    const isOpen = useSelector(selectIsProfileDropdownOpen);
    const [logoutMutation] = useLogoutMutation();

    // Get user initials
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                dispatch(closeProfileDropdown());
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                dispatch(closeProfileDropdown());
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, dispatch]);

    const handleToggle = () => {
        dispatch(toggleProfileDropdown());
    };

    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
            dispatch(logout());
            dispatch(closeProfileDropdown());
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Still logout locally even if API call fails
            dispatch(logout());
            dispatch(closeProfileDropdown());
            navigate('/');
        }
    };

    const handleProfileClick = () => {
        dispatch(closeProfileDropdown());
    };

    if (!user) return null;

    return (
        <div className={styles.profileDropdown} ref={dropdownRef}>
            <button
                className={styles.avatarButton}
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="User menu"
            >
                <div className={styles.avatar}>
                    {user.picture ? (
                        <img src={user.picture} alt={user.name} className={styles.avatarImage} />
                    ) : (
                        <span className={styles.initials}>{getInitials(user.name)}</span>
                    )}
                </div>
                <span className={styles.userName}>{user.name}</span>
                <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu} role="menu">
                    <div className={styles.userInfo}>
                        <div className={styles.userInfoName}>{user.name}</div>
                        <div className={styles.userInfoEmail}>{user.email}</div>
                    </div>

                    <div className={styles.divider}></div>

                    <Link
                        to="/profile"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={handleProfileClick}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                            />
                        </svg>
                        My Profile
                    </Link>

                    <div className={styles.divider}></div>

                    <button
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 6 15 7.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
