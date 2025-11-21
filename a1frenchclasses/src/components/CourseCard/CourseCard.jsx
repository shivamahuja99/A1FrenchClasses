import styles from './CourseCard.module.css';
import LazyImage from '../LazyImage/LazyImage';
import { generateOptimizedImagePaths } from '../../utils/imageUtils';

const CourseCard = ({ course }) => {
  if (!course) {
    return null;
  }

  const {
    id,
    title,
    instructor,
    duration,
    description,
    price,
    discount,
    difficulty,
    image,
    rating,
    course_url
  } = course;

  const hasDiscount = discount && discount > 0;
  // Assuming price is the base price and we calculate the discounted price
  // Or if price is the final price, we calculate original.
  // Let's assume price is the original price and we show the discounted price.
  const discountedPrice = hasDiscount
    ? (price * (1 - discount / 100)).toFixed(2)
    : price;

  const getLevelBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return styles.levelBeginner;
      case 'intermediate':
        return styles.levelIntermediate;
      case 'advanced':
        return styles.levelAdvanced;
      default:
        return styles.levelDefault;
    }
  };

  const handleCardClick = () => {
    if (course_url) {
      window.location.href = course_url;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className={styles.star}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className={styles.star}>½</span>); // Simplified half star
      } else {
        stars.push(<span key={i} className={styles.star} style={{ opacity: 0.3 }}>★</span>);
      }
    }
    return stars;
  };

  return (
    <article
      className={styles.courseCard}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-labelledby={`course-title-${id}`}
      aria-describedby={`course-description-${id} course-price-${id}`}
    >
      {/* Course Image */}
      <div className={styles.imageContainer}>
        <LazyImage
          src={image}
          alt={`${title} course - ${description.substring(0, 100)}...`}
          className={styles.courseImage}
          width={300}
          height={200}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          {...generateOptimizedImagePaths(image)}
          placeholder="/images/placeholder-course.jpg"
        />

        {/* Difficulty Level Badge */}
        <div
          className={`${styles.levelBadge} ${getLevelBadgeClass(difficulty)}`}
          role="img"
          aria-label={`Course difficulty level: ${difficulty}`}
        >
          {difficulty}
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div
            className={styles.discountBadge}
            role="img"
            aria-label={`${discount}% discount available`}
          >
            -{discount}%
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className={styles.courseContent}>
        {/* Course Title */}
        <h3 id={`course-title-${id}`} className={styles.courseTitle}>{title}</h3>

        {/* Rating */}
        {rating && (
          <div className={styles.rating} aria-label={`Rating: ${rating} out of 5 stars`}>
            {renderStars(rating)}
            <span>({rating})</span>
          </div>
        )}

        {/* Tutor and Duration */}
        <div className={styles.courseInfo} role="group" aria-label="Course details">
          <span className={styles.tutor} aria-label={`Instructor: ${instructor}`}>
            By {instructor}
          </span>
          <span className={styles.duration} aria-label={`Course duration: ${duration}`}>
            {duration}
          </span>
        </div>

        {/* Course Description */}
        <p id={`course-description-${id}`} className={styles.description}>{description}</p>

        {/* Pricing Section */}
        <div className={styles.pricingSection} role="group" aria-label="Pricing information">
          <div id={`course-price-${id}`} className={styles.priceContainer}>
            <span
              className={styles.currentPrice}
              aria-label={`Current price: $${discountedPrice}`}
            >
              ${discountedPrice}
            </span>
            {hasDiscount && (
              <span
                className={styles.originalPrice}
                aria-label={`Original price: $${price}`}
              >
                ${price}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;