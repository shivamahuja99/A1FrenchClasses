import { useNavigate } from 'react-router-dom';
import { useGetCartQuery, useRemoveFromCartMutation, useClearCartMutation } from '../../store/api/apiSlice';
import styles from './CartPage.module.css';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { Header, Footer } from '../../components';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';

const CartPage = () => {
    const navigate = useNavigate();
    const { data: cartData, isLoading, error } = useGetCartQuery();
    const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const cart = cartData?.cart;
    const total = cartData?.total || 0;

    const handleRemoveItem = async (itemId) => {
        try {
            await removeFromCart(itemId).unwrap();
        } catch (err) {
            console.error('Failed to remove item:', err);
            alert('Failed to remove item. Please try again.');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                await clearCart().unwrap();
            } catch (err) {
                console.error('Failed to clear cart:', err);
                alert('Failed to clear cart. Please try again.');
            }
        }
    };

    const handleCheckout = () => {
        // Navigate to checkout page (to be implemented)
        alert('Checkout functionality coming soon!');
    };

    if (isLoading) {
        return (
            <div className={styles.cartPage}>
                <Header
                    logo={navigationConfig.logo}
                    navigationItems={navigationConfig.items}
                    authComponent={isAuthenticated ? <ProfileDropdown /> : null}
                />
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>Shopping Cart</h1>
                    <LoadingSkeleton variant="card" count={2} />
                </div>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.cartPage}>
                <Header
                    logo={navigationConfig.logo}
                    navigationItems={navigationConfig.items}
                    authComponent={isAuthenticated ? <ProfileDropdown /> : null}
                />
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <h2>Error Loading Cart</h2>
                        <p>Unable to load your cart. Please try again later.</p>
                        <button onClick={() => window.location.reload()} className={styles.retryButton}>
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className={styles.cartPage}>
                <Header
                    logo={navigationConfig.logo}
                    navigationItems={navigationConfig.items}
                    authComponent={isAuthenticated ? <ProfileDropdown /> : null}
                />
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>Shopping Cart</h1>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any courses yet.</p>
                        <button onClick={() => navigate('/courses')} className={styles.browseButton}>
                            Browse Courses
                        </button>
                    </div>
                </div>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    return (
        <div className={styles.cartPage}>
            <Header
                logo={navigationConfig.logo}
                navigationItems={navigationConfig.items}
                authComponent={isAuthenticated ? <ProfileDropdown /> : null}
            />

            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Shopping Cart ({cart.items.length})</h1>

                <div className={styles.cartLayout}>
                    {/* Cart Items List */}
                    <div className={styles.cartItems}>
                        <div className={styles.cartHeader}>
                            <span className={styles.headerCourse}>Course</span>
                            <span className={styles.headerPrice}>Price</span>
                            <span className={styles.headerAction}>Action</span>
                        </div>

                        {cart.items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemImage}>
                                        <img src={item.course.image_url} alt={item.course.name} />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <h3 className={styles.itemTitle}>{item.course.name}</h3>
                                        <p className={styles.itemInstructor}>By {item.course.instructor?.name || 'Instructor'}</p>
                                        <div className={styles.itemMeta}>
                                            <span>{item.course.num_lectures || 'Multiple'} lectures</span>
                                            <span>•</span>
                                            <span>{item.course.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.itemPrice}>
                                    <span className={styles.price}>${item.price.toFixed(2)}</span>
                                    {item.course.discount > 0 && (
                                        <span className={styles.originalPrice}>${item.course.price}</span>
                                    )}
                                </div>

                                <div className={styles.itemAction}>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className={styles.removeButton}
                                        disabled={isRemoving}
                                        aria-label="Remove item"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className={styles.cartActions}>
                            <button
                                onClick={handleClearCart}
                                className={styles.clearButton}
                                disabled={isClearing}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className={styles.orderSummary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Tax (Estimated)</span>
                            <span>$0.00</span>
                        </div>

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <button onClick={handleCheckout} className={styles.checkoutButton}>
                            Proceed to Checkout
                        </button>

                        <div className={styles.secureCheckout}>
                            <span>🔒 Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

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

export default CartPage;
