import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Header, Footer } from '../../components';
import ContactForm from '../../components/ContactForm/ContactForm';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import styles from './ContactPage.module.css';

const ContactPage = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className={styles.contactPage}>
            <Header
                logo={navigationConfig.logo}
                navigationItems={navigationConfig.items}
                authComponent={isAuthenticated ? <ProfileDropdown /> : null}
            />
            
            <main id="main-content" className={styles.main} role="main">
                <div className={styles.container}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.title}>Contact Us</h1>
                        <p className={styles.subtitle}>
                            Have questions about our French courses? Start your language journey today. 
                            Our team is here to help you find the perfect program.
                        </p>
                    </header>
                    
                    <div className={styles.contentWrapper}>
                        <div className={styles.infoSection}>
                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}>✉️</div>
                                <div className={styles.infoCardContent}>
                                    <h3>Email</h3>
                                    <p>{footerConfig.contactInfo.email}</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}>📱</div>
                                <div className={styles.infoCardContent}>
                                    <h3>WhatsApp</h3>
                                    <p>{footerConfig.contactInfo.phone}</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}>📍</div>
                                <div className={styles.infoCardContent}>
                                    <h3>Location</h3>
                                    <p>{footerConfig.contactInfo.address}</p>
                                </div>
                            </div>
                        </div>

                        <ContactForm />
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

export default ContactPage;
