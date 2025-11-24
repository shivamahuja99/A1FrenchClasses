import React from 'react';
import styles from './HeroSection.module.css';

const HeroSection = ({ 
  title, 
  subtitle, 
  ctaText, 
  backgroundImage,
  onCtaClick 
}) => {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      // Default behavior - scroll to courses section or navigate to courses page
      const coursesSection = document.getElementById('featured-courses');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/courses';
      }
    }
  };

  return (
    <section 
      className={styles.heroSection}
      style={{ 
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundColor: backgroundImage ? 'transparent' : '#1976d2'
      }}
      role="banner"
      aria-labelledby="hero-title"
      aria-describedby="hero-subtitle"
    >
      {backgroundImage && (
        <div 
          role="img" 
          aria-label="Hero background image"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1
          }}
        />
      )}
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 
              id="hero-title"
              className={styles.title}
            >
              {title}
            </h1>
            <p 
              id="hero-subtitle"
              className={styles.subtitle}
            >
              {subtitle}
            </p>
            <button
              className={styles.ctaButton}
              onClick={handleCtaClick}
              aria-describedby="hero-title hero-subtitle"
              type="button"
            >
              {ctaText}
              <span className="sr-only"> - Navigate to featured courses section</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;