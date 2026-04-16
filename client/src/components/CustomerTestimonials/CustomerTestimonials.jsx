import { useState } from 'react';
import { useFeaturedTestimonials } from '../../controllers/useTestimonials';
import TestimonialCard from '../TestimonialCard/TestimonialCard';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';
import styles from './CustomerTestimonials.module.css';

const CustomerTestimonials = ({ limit = 3, showNavigation = true }) => {
  const { testimonials, loading, error } = useFeaturedTestimonials(limit);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (loading) {
    return (
      <section className={styles.customerTestimonials}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Student Voices</h2>
            <div className={styles.testimonialsGrid}>
              <LoadingSkeleton variant="testimonial" count={limit} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !testimonials || testimonials.length === 0) return null;

  return (
    <section className={styles.customerTestimonials} aria-labelledby="testimonials-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="testimonials-title" className={styles.title}>Student Voices</h2>
          <p className={styles.subtitle}>Real stories of fluency and cultural discovery from our global community.</p>
        </div>

        <div className={styles.testimonialsWrapper}>
          {/* Desktop view */}
          <div className={styles.testimonialsGrid} role="list">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`${styles.testimonialItem} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
                role="listitem"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Mobile Carousel view - logic managed via CSS display and currentIndex */}
          <div className={styles.testimonialsCarousel}>
            <div 
              className={styles.carouselTrack}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className={styles.carouselSlide}>
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>

            {showNavigation && testimonials.length > 1 && (
              <>
                <button className={styles.navPrevious} onClick={handlePrevious} aria-label="Previous">
                  <span className={styles.navArrow}>‹</span>
                </button>
                <button className={styles.navNext} onClick={handleNext} aria-label="Next">
                  <span className={styles.navArrow}>›</span>
                </button>
                
                <div className={styles.dotIndicators}>
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Slide ${index + 1}`}
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