import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import UserDetailsForm from '../components/profile/UserDetailsForm';
import PurchasedCoursesList from '../components/profile/PurchasedCoursesList';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import ProfileDropdown from '../components/ProfileDropdown/ProfileDropdown';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const navigationItems = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
    ];

    return (
        <div className={styles.page}>
            <Header
                logo="/images/logo.png"
                navigationItems={navigationItems}
                authComponent={isAuthenticated ? <ProfileDropdown /> : null}
            />

            <main className={styles.main} id="main-content">
                <div className={styles.container}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>My Profile</h1>
                        <p className={styles.pageSubtitle}>
                            Manage your account and track your learning progress
                        </p>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.sidebar}>
                            <UserDetailsForm />
                        </div>

                        <div className={styles.mainContent}>
                            <PurchasedCoursesList />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
