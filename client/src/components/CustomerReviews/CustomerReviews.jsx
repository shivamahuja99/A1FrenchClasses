import styles from './CustomerReviews.module.css';

const CustomerReviews = ({ reviews = [], courseId }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <h3>No Reviews Yet</h3>
                <p>Be the first to review this course!</p>
            </div>
        );
    }

    // Calculate average rating
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: (reviews.filter(r => r.rating === star).length / reviews.length) * 100
    }));

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={index < rating ? styles.starFilled : styles.starEmpty}
            >
                ★
            </span>
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className={styles.customerReviews}>
            {/* Rating Summary */}
            <div className={styles.ratingSummary}>
                <div className={styles.averageRating}>
                    <div className={styles.ratingNumber}>{averageRating.toFixed(1)}</div>
                    <div className={styles.stars}>{renderStars(Math.round(averageRating))}</div>
                    <div className={styles.reviewCount}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
                </div>

                <div className={styles.ratingDistribution}>
                    {ratingDistribution.map(({ star, count, percentage }) => (
                        <div key={star} className={styles.distributionRow}>
                            <span className={styles.starLabel}>{star} ★</span>
                            <div className={styles.distributionBar}>
                                <div
                                    className={styles.distributionFill}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className={styles.distributionCount}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className={styles.reviewsList}>
                {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewerInfo}>
                                <div className={styles.reviewerAvatar}>
                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className={styles.reviewerDetails}>
                                    <h4 className={styles.reviewerName}>{review.user?.name || 'Anonymous'}</h4>
                                    <div className={styles.reviewMeta}>
                                        <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
                                        <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerReviews;
