import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useRetryOrderMutation } from '../../store/api/apiSlice';
import { Header, Footer } from '../../components';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import styles from './Checkout.module.css';

const CheckoutCancel = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [retryOrder, { isLoading }] = useRetryOrderMutation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handleRetry = async () => {
        if (!orderId) return;
        try {
            const response = await retryOrder(orderId).unwrap();
            if (response.approve_url) {
                window.location.href = response.approve_url;
            }
        } catch (err) {
            console.error("Retry failed:", err);
            alert("Failed to retry payment. Please go back to cart.");
        }
    };

    return (
        <div className={styles.checkoutPage}>
            <Header logo={navigationConfig.logo} navigationItems={navigationConfig.items} authComponent={isAuthenticated ? <ProfileDropdown /> : null} />
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2>Checkout Cancelled</h2>
                    <p>It looks like you cancelled the PayPal checkout process.</p>
                    <div className={styles.actions}>
                        {orderId && (
                            <button onClick={handleRetry} disabled={isLoading} className="btn btn-primary" style={{ width: '100%' }}>
                                {isLoading ? 'Generating Link...' : 'Retry Payment'}
                            </button>
                        )}
                        <Link to="/cart" className="btn btn-secondary" style={{ width: '100%' }}>Return to Cart</Link>
                    </div>
                </div>
            </div>
            <Footer logo={navigationConfig.logo} companyInfo={footerConfig.companyInfo} navigationLinks={navigationConfig.items} socialLinks={footerConfig.socialLinks} contactInfo={footerConfig.contactInfo} />
        </div>
    );
};

export default CheckoutCancel;
