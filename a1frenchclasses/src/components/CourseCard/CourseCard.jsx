import styles from './CourseCard.module.css';
import LazyImage from '../LazyImage/LazyImage';
import { generateOptimizedImagePaths } from '../../utils/imageUtils';

const CourseCard = ({ course }) => {
  if (!course) {
    return null;
  }

  const {
    id,
    name,
    tutor,
    duration,
    description,
    price,
    originalPrice,
    level,
    image,
    paymentPlans = []
  } = course;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

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
    // Navigate to course detail page
    window.location.href = `/courses/${id}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
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
          alt={`${name} course - ${description.substring(0, 100)}...`}
          className={styles.courseImage}
          width={300}
          height={200}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          {...generateOptimizedImagePaths(image)}
          placeholder="/images/placeholder-course.jpg"
        />
        
        {/* Difficulty Level Badge */}
        <div 
          className={`${styles.levelBadge} ${getLevelBadgeClass(level)}`}
          role="img"
          aria-label={`Course difficulty level: ${level}`}
        >
          {level}
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div 
            className={styles.discountBadge}
            role="img"
            aria-label={`${discountPercentage}% discount available`}
          >
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className={styles.courseContent}>
        {/* Course Title */}
        <h3 id={`course-title-${id}`} className={styles.courseTitle}>{name}</h3>
        
        {/* Tutor and Duration */}
        <div className={styles.courseInfo} role="group" aria-label="Course details">
          <span className={styles.tutor} aria-label={`Instructor: ${tutor}`}>
            By {tutor}
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
              aria-label={`Current price: $${price}`}
            >
              ${price}
            </span>
            {hasDiscount && (
              <span 
                className={styles.originalPrice}
                aria-label={`Original price: $${originalPrice}`}
              >
                ${originalPrice}
              </span>
            )}
          </div>

          {/* Payment Plans */}
          {paymentPlans.length > 0 && (
            <div className={styles.paymentPlans} role="group" aria-label="Payment options">
              <span className={styles.paymentLabel} id={`payment-options-${id}`}>
                Payment options:
              </span>
              <div className={styles.plansList} aria-labelledby={`payment-options-${id}`}>
                {paymentPlans.map((plan, index) => (
                  <span 
                    key={index} 
                    className={styles.paymentPlan}
                    aria-label={`${plan.type}: $${plan.amount}${plan.duration !== 'One-time' ? ` per ${plan.duration}` : ''}`}
                  >
                    {plan.type}: ${plan.amount}
                    {plan.duration !== 'One-time' && ` / ${plan.duration}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CourseCard;