import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import UserDetailsForm from '../../components/profile/UserDetailsForm';
import PurchasedCoursesList from '../../components/profile/PurchasedCoursesList';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';
import styles from './ProfilePage.module.css';
import { useEffect } from 'react';

const ProfilePage = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className={styles.page}>
            <Header
                logo={navigationConfig.logo}
                navigationItems={navigationConfig.items}
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

            <Footer
                logo={navigationConfig.logo}
                companyInfo={footerConfig.companyInfo}
                navigationLinks={navigationConfig.items}
                socialLinks={footerConfig.socialLinks}
                contactInfo={footerConfig.contactInfo}
            />
        </div>
    );
};

export default ProfilePage;
