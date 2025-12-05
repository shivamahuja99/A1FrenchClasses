import styles from './CoursePurchaseCard.module.css';

const CoursePurchaseCard = ({
    course,
    discountedPrice,
    hasDiscount,
    isAddingToCart,
    addedToCart,
    isInCart,
    onBuyNow,
    onAddToCart
}) => {
    return (
        <div className={styles.purchaseCard}>
            <div className={styles.priceSection}>
                <div className={styles.priceContainer}>
                    <span className={styles.currentPrice}>${discountedPrice}</span>
                    {hasDiscount && (
                        <>
                            <span className={styles.originalPrice}>${course.price}</span>
                            <span className={styles.discountBadge}>-{course.discount}% OFF</span>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.purchaseActions}>
                <button
                    onClick={onBuyNow}
                    className={styles.buyNowButton}
                    disabled={isAddingToCart}
                >
                    {isAddingToCart ? 'Processing...' : 'buy now'}
                </button>

                <button
                    onClick={onAddToCart}
                    className={styles.addToCartButton}
                    disabled={isAddingToCart || (addedToCart && !isInCart)}
                >
                    {addedToCart ? '✓ Added to Cart' : (isInCart ? 'Go to Cart' : 'Add to Cart')}
                </button>
            </div>

            <div className={styles.courseIncludes}>
                <h3 className={styles.includesTitle}>This course includes:</h3>
                <ul className={styles.includesList}>
                    <li>✓ {course.num_lectures || 'Multiple'} video lectures</li>
                    <li>✓ Live online classes</li>
                    <li>✓ Certificate of completion</li>
                    <li>✓ Lifetime access</li>
                    <li>✓ Interactive exercises</li>
                </ul>
            </div>
        </div>
    );
};

export default CoursePurchaseCard;
