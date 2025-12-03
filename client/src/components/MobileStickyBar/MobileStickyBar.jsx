import styles from './MobileStickyBar.module.css';

const MobileStickyBar = ({
    discountedPrice,
    hasDiscount,
    originalPrice,
    isAddingToCart,
    addedToCart,
    onBuyNow,
    onAddToCart
}) => {
    return (
        <div className={styles.stickyBar}>
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
                    disabled={isAddingToCart || addedToCart}
                    aria-label="Add to cart"
                >
                    {addedToCart ? '✓' : '+'}
                </button>
                <button
                    onClick={onBuyNow}
                    className={styles.buyNowButton}
                    disabled={isAddingToCart}
                >
                    {isAddingToCart ? '...' : 'Buy Now'}
                </button>
            </div>
        </div>
    );
};

export default MobileStickyBar;
