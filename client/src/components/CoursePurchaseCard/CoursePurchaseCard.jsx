import styles from './CoursePurchaseCard.module.css';

const CoursePurchaseCard = ({
    course,
    discountedPrice,
    hasDiscount,
    isAddingToCart,
    addedToCart,
    isInCart,
    isEnrolled,
    onBuyNow,
    onAddToCart
}) => {
    return (
        <div className={styles.purchaseCard}>
            <div className={styles.priceSection}>
                {isEnrolled ? (
                    <div className={styles.enrolledStatus}>
                        <span className={styles.enrolledBadge}>🎓 Start Learning</span>
                        <p className={styles.enrolledText}>You have lifetime access to this course</p>
                    </div>
                ) : (
                    <div className={styles.priceContainer}>
                        <span className={styles.currentPrice}>${discountedPrice}</span>
                        {hasDiscount && (
                            <>
                                <span className={styles.originalPrice}>${course.price}</span>
                                <span className={styles.discountBadge}>-{course.discount}% OFF</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.purchaseActions}>
                {isEnrolled ? (
                    <button
                        className={styles.startLearningButton}
                        onClick={() => window.location.href = '/profile'} // Since no lessons page yet
                    >
                        Start Learning
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onBuyNow}
                            className={styles.buyNowButton}
                            disabled={isAddingToCart || isInCart}
                        >
                            {isAddingToCart ? 'Processing...' : (isInCart ? 'In Cart' : 'buy now')}
                        </button>

                        <button
                            onClick={onAddToCart}
                            className={styles.addToCartButton}
                            disabled={isAddingToCart || (addedToCart && !isInCart)}
                        >
                            {addedToCart ? '✓ Added to Cart' : (isInCart ? 'Go to Cart' : 'Add to Cart')}
                        </button>
                    </>
                )}
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
