import { useState } from 'react';
import { useFeaturedTestimonials } from '../../controllers/useTestimonials';
import TestimonialCard from '../TestimonialCard/TestimonialCard';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';
import styles from './CustomerTestimonials.module.css';

const CustomerTestimonials = ({ limit = 3, showNavigation = true }) => {
  const { testimonials, loading, error } = useFeaturedTestimonials(limit);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = (e, action, index = null) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'previous') {
        handlePrevious();
      } else if (action === 'next') {
        handleNext();
      } else if (action === 'dot' && index !== null) {
        handleDotClick(index);
      }
    }
  };

  if (loading) {
    return (
      <section className={styles.customerTestimonials} aria-label="Customer testimonials">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>What Our Students Say</h2>
            <p className={styles.subtitle}>Real feedback from our French learning community</p>
          </div>
          <div className={styles.testimonialsGrid}>
            <LoadingSkeleton variant="testimonial" count={limit} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.customerTestimonials} aria-label="Customer testimonials">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>What Our Students Say</h2>
            <p className={styles.subtitle}>Real feedback from our French learning community</p>
          </div>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              Unable to load testimonials at the moment. Please try again later.
            </p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
              aria-label="Retry loading testimonials"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className={styles.customerTestimonials} aria-label="Customer testimonials">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>What Our Students Say</h2>
            <p className={styles.subtitle}>Real feedback from our French learning community</p>
          </div>
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>No testimonials available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={styles.customerTestimonials} 
      aria-labelledby="testimonials-title"
      role="region"
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 id="testimonials-title" className={styles.title}>What Our Students Say</h2>
          <p className={styles.subtitle}>
            Real feedback from our French learning community
          </p>
        </div>

        {/* Testimonials Display */}
        <div className={styles.testimonialsWrapper}>
          {/* Desktop Grid Layout */}
          <div 
            className={styles.testimonialsGrid} 
            role="list"
            aria-label={`${testimonials.length} student testimonials`}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={styles.testimonialItem} 
                role="listitem"
                aria-setsize={testimonials.length}
                aria-posinset={index + 1}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Mobile Carousel Layout */}
          <div 
            className={styles.testimonialsCarousel} 
            role="region" 
            aria-labelledby="testimonials-title"
            aria-live="polite"
          >
            <div 
              className={styles.carouselTrack}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              role="group"
              aria-label={`Testimonial ${currentIndex + 1} of ${testimonials.length}`}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className={styles.carouselSlide}
                  aria-hidden={index !== currentIndex}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            {showNavigation && testimonials.length > 1 && (
              <>
                {/* Previous/Next Buttons */}
                <button
                  className={`${styles.navButton} ${styles.navPrevious}`}
                  onClick={handlePrevious}
                  onKeyDown={(e) => handleKeyDown(e, 'previous')}
                  aria-label={`Previous testimonial (currently showing ${currentIndex + 1} of ${testimonials.length})`}
                  type="button"
                >
                  <span className={styles.navArrow} aria-hidden="true">‹</span>
                </button>
                
                <button
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={handleNext}
                  onKeyDown={(e) => handleKeyDown(e, 'next')}
                  aria-label={`Next testimonial (currently showing ${currentIndex + 1} of ${testimonials.length})`}
                  type="button"
                >
                  <span className={styles.navArrow} aria-hidden="true">›</span>
                </button>

                {/* Dot Indicators */}
                <div 
                  className={styles.dotIndicators} 
                  role="tablist" 
                  aria-label="Testimonial navigation"
                >
                  {testimonials.map((testimonial, index) => (
                    <button
                      key={index}
                      className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                      onClick={() => handleDotClick(index)}
                      onKeyDown={(e) => handleKeyDown(e, 'dot', index)}
                      role="tab"
                      aria-selected={index === currentIndex}
                      aria-label={`Go to testimonial ${index + 1} by ${testimonial.customerName}`}
                      type="button"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;