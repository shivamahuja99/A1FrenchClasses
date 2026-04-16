import styles from './MobileStickyBar.module.css';

const MobileStickyBar = ({
    discountedPrice,
    hasDiscount,
    originalPrice,
    isAddingToCart,
    addedToCart,
    isInCart,
    isEnrolled,
    onBuyNow,
    onAddToCart
}) => {
    return (
        <div className={styles.stickyBar}>
            {isEnrolled ? (
                <div className={styles.enrolledActions}>
                    <button
                        className={styles.startLearningButton}
                        onClick={() => window.location.href = '/profile'}
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
                            className={styles.addToCartButton}
                            disabled={isAddingToCart || (addedToCart && !isInCart)}
                            aria-label={isInCart ? "Go to cart" : "Add to cart"}
                        >
                            {addedToCart ? '✓' : (isInCart ? '→' : '+')}
                        </button>
                        <button
                            onClick={onBuyNow}
                            className={styles.buyNowButton}
                            disabled={isAddingToCart || isInCart}
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
