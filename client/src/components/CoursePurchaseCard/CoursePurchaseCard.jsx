import styles from './CoursePurchaseCard.module.css';

const CoursePurchaseCard = ({
    course,
    discountedPrice,
    hasDiscount,
    isAddingToCart,
    addedToCart,
    isInCart,
    isEnrolled,
    onStartLearning,
    onBuyNow,
    onAddToCart
}) => {
    const thisIncludes = Array.isArray(course?.this_includes) ? course.this_includes : [];

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
                        className="btn btn-primary"
                        onClick={onStartLearning}
                        style={{ width: '100%' }}
                    >
                        Start Learning
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onBuyNow}
                            className="btn btn-primary"
                            disabled={isAddingToCart || isInCart}
                            style={{ width: '100%' }}
                        >
                            {isAddingToCart ? 'Processing...' : (isInCart ? 'In Cart' : 'Buy Now')}
                        </button>

                        <button
                            onClick={onAddToCart}
                            className="btn btn-secondary"
                            disabled={isAddingToCart || (addedToCart && !isInCart)}
                            style={{ width: '100%' }}
                        >
                            {addedToCart ? '✓ Added to Cart' : (isInCart ? 'Go to Cart' : 'Add to Cart')}
                        </button>
                    </>
                )}
            </div>

            <div className={styles.courseIncludes}>
                <h3 className={styles.includesTitle}>This course includes:</h3>
                <ul className={styles.includesList}>
                    {thisIncludes.length > 0 ? (
                        thisIncludes.map((item) => <li key={item}>{item}</li>)
                    ) : (
                        <li>Course inclusions will be updated soon</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CoursePurchaseCard;
