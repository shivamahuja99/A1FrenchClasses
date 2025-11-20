import styles from './TestimonialCard.module.css';
import LazyImage from '../LazyImage/LazyImage';
import { generateOptimizedImagePaths } from '../../utils/imageUtils';

const TestimonialCard = ({ testimonial }) => {
  if (!testimonial) {
    return null;
  }

  const {
    id,
    customerName,
    feedback,
    rating,
    customerPhoto,
    courseCompleted
  } = testimonial;

  // Generate star rating display
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className={styles.star} aria-hidden="true">
          ★
        </span>
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <span key="half" className={styles.starHalf} aria-hidden="true">
          ★
        </span>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className={styles.starEmpty} aria-hidden="true">
          ☆
        </span>
      );
    }
    
    return stars;
  };

  return (
    <article 
      className={styles.testimonialCard} 
      role="article"
      aria-labelledby={`testimonial-author-${id}`}
      aria-describedby={`testimonial-content-${id} testimonial-rating-${id}`}
    >
      {/* Customer Photo */}
      <div className={styles.photoContainer}>
        <LazyImage
          src={customerPhoto}
          alt={`${customerName}, satisfied student`}
          className={styles.customerPhoto}
          width={60}
          height={60}
          sizes="60px"
          {...generateOptimizedImagePaths(customerPhoto)}
          placeholder="/images/placeholder-avatar.jpg"
        />
      </div>

      {/* Testimonial Content */}
      <div className={styles.testimonialContent}>
        {/* Star Rating */}
        <div className={styles.ratingContainer}>
          <div 
            id={`testimonial-rating-${id}`}
            className={styles.starRating} 
            role="img" 
            aria-label={`Rating: ${rating} out of 5 stars`}
          >
            {renderStarRating(rating)}
          </div>
          <span className={styles.ratingText} aria-hidden="true">
            ({rating}/5)
          </span>
        </div>

        {/* Customer Feedback */}
        <blockquote className={styles.feedback}>
          <p id={`testimonial-content-${id}`} className={styles.feedbackText}>
            "{feedback}"
          </p>
        </blockquote>

        {/* Customer Info */}
        <div className={styles.customerInfo}>
          <h4 id={`testimonial-author-${id}`} className={styles.customerName}>
            {customerName}
          </h4>
          <span 
            className={styles.courseCompleted}
            aria-label={`Completed course: ${courseCompleted}`}
          >
            {courseCompleted}
          </span>
        </div>
      </div>
    </article>
  );
};

export default TestimonialCard;