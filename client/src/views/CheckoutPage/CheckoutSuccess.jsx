import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCaptureCheckoutMutation } from '../../store/api/apiSlice';
import { Header, Footer } from '../../components';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';
import styles from './Checkout.module.css';

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const token = searchParams.get('token');
    const [captureCheckout, { isLoading }] = useCaptureCheckoutMutation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [status, setStatus] = useState('processing');
    const hasCaptured = useRef(false);

    useEffect(() => {
        if (!orderId || !token) {
            setStatus('error');
            return;
        }

        const capturePayment = async () => {
            if (hasCaptured.current) return;
            hasCaptured.current = true;

            try {
                await captureCheckout({ order_id: orderId, token }).unwrap();
                setStatus('success');
            } catch (err) {
                console.error("Failed to capture payment", err);
                // Even on error, we keep hasCaptured.current = true to prevent automatic retries 
                // in StrictMode, but user could manually retry if we had a button.
                setStatus('error');
            }
        };

        capturePayment();
    }, [orderId, token, captureCheckout]);

    return (
        <div className={styles.checkoutPage}>
            <Header logo={navigationConfig.logo} navigationItems={navigationConfig.items} authComponent={isAuthenticated ? <ProfileDropdown /> : null} />
            <div className={styles.container}>
                {status === 'processing' && (
                    <div className={styles.card}>
                        <h2>Processing your payment...</h2>
                        <p>Please do not close this window while we securely confirm your payment.</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className={styles.card}>
                        <h2>Payment Successful! 🎉</h2>
                        <p>Thank you for your purchase. Your new courses are now available in your account.</p>
                        <Link to="/profile" className="btn btn-primary" style={{ width: '100%' }}>Go to My Courses</Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className={styles.card}>
                        <h2>Payment Processing Failed</h2>
                        <p>We could not verify your payment. If you were charged, please contact support.</p>
                        <Link to="/cart" className="btn btn-primary" style={{ width: '100%' }}>Return to Cart</Link>
                    </div>
                )}
            </div>
            <Footer logo={navigationConfig.logo} companyInfo={footerConfig.companyInfo} navigationLinks={navigationConfig.items} socialLinks={footerConfig.socialLinks} contactInfo={footerConfig.contactInfo} />
        </div>
    );
};

export default CheckoutSuccess;
