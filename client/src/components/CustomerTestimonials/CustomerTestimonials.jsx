import { useGetReviewsQuery } from '../../store/api/apiSlice';
import styles from './CustomerTestimonials.module.css';

const CustomerTestimonials = () => {
  const { data: reviews = [], isLoading, error } = useGetReviewsQuery();
  const testimonials = Array.isArray(reviews) ? reviews.slice(0, 6) : [];

  const starsFromRating = (rating = 0) => '★'.repeat(Math.max(0, Math.min(5, rating)));
  const initialsFromName = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U';

  return (
    <section id="results" className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">Real Student Results</span>
          <h2>Student success stories from our latest batches</h2>
        </div>

        {isLoading && <p>Loading testimonials...</p>}
        {error && <p>Unable to load testimonials right now.</p>}

        {!isLoading && !error && (
          <div className={styles.testGrid}>
            {testimonials.length > 0 ? (
              testimonials.map((review) => (
                <div key={review.id} className={`${styles.test} reveal`}>
                  <div>
                    <div className={styles.stars}>{starsFromRating(review.rating)}</div>
                    <span className={styles.scoreTag}>{review.testimonial_tag || 'Student Review'}</span>
                  </div>
                  <blockquote>"{review.comment}"</blockquote>
                  <div className={styles.person}>
                    <div className={styles.avatar} style={{ background: review.testimonial_avatar_bg }}>
                      {initialsFromName(review.user?.name)}
                    </div>
                    <div>
                      <div className={styles.name}>{review.user?.name || 'Anonymous Student'}</div>
                      <div className={styles.role}>{review.testimonial_role || 'Student'}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No testimonials available right now.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerTestimonials;
