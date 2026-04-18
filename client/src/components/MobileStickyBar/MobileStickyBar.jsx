import styles from './MobileStickyBar.module.css';

const MobileStickyBar = ({
    discountedPrice,
    hasDiscount,
    originalPrice,
    isAddingToCart,
    addedToCart,
    isInCart,
    isEnrolled,
    onStartLearning,
    onBuyNow,
    onAddToCart
}) => {
    return (
        <div className={styles.stickyBar}>
            {isEnrolled ? (
                <div className={styles.enrolledActions}>
                    <button
                        className="btn btn-primary"
                        onClick={onStartLearning}
                        style={{ width: '100%', padding: '12px 20px' }}
                    >
                        Start Learning
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.priceContainer}>
                        <span className={styles.currentPrice}>${discountedPrice}</span>
                        {hasDiscount && (
                            <span className={styles.originalPrice}>${originalPrice}</span>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={onAddToCart}
                            className="btn btn-secondary"
                            disabled={isAddingToCart || (addedToCart && !isInCart)}
                            aria-label={isInCart ? "Go to cart" : "Add to cart"}
                            style={{ padding: '12px', minWidth: '48px', flexShrink: 0 }}
                        >
                            {addedToCart ? '✓' : (isInCart ? '→' : '+')}
                        </button>
                        <button
                            onClick={onBuyNow}
                            className="btn btn-primary"
                            disabled={isAddingToCart || isInCart}
                            style={{ flex: 1, padding: '12px 20px' }}
                        >
                            {isAddingToCart ? '...' : (isInCart ? 'In Cart' : 'Buy Now')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MobileStickyBar;
