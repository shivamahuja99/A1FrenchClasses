import { Link } from 'react-router-dom';
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
      role="banner"
      aria-labelledby="hero-title"
      aria-describedby="hero-subtitle"
    >
      <div className={styles.grid}>
        {/* ---- Left: text content ---- */}
        <div className={styles.textContent}>
          <span className={styles.overline}>Élégance et Éducation</span>

          <h1 id="hero-title" className={styles.title}>
            {title
              ? title
              : <>Master the Art of <span className={styles.titleAccent}>French.</span></>
            }
          </h1>

          <p id="hero-subtitle" className={styles.subtitle}>
            {subtitle ||
              "Experience a curated approach to language learning. From the streets of Paris to global boardrooms, we refine your voice with academic rigour and cultural soul."
            }
          </p>

          <div className={styles.ctaGroup}>
            <button
              className={styles.ctaButton}
              onClick={handleCtaClick}
              type="button"
              aria-describedby="hero-title hero-subtitle"
            >
              {ctaText || 'View Programs'}
              <span className="sr-only"> - Navigate to featured courses section</span>
            </button>

            <Link to="/courses" className={styles.ctaSecondary}>
              Browse All Courses
            </Link>
          </div>
        </div>

        {/* ---- Right: image card ---- */}
        <div className={styles.imageContent}>
          <div className={styles.imageWrapper}>
            {backgroundImage ? (
              <img
                src={backgroundImage}
                alt="Students learning French in an elegant academic setting"
                className={styles.heroImage}
                loading="eager"
              />
            ) : (
              /* Gradient placeholder card when no image is provided */
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 60%, #fe9800 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '28rem',
                }}
              >
                <span style={{ fontSize: '5rem', filter: 'brightness(0) invert(1)', opacity: 0.6 }}>
                  🎓
                </span>
              </div>
            )}
          </div>

          {/* Decorative amber blob */}
          <div className={styles.blob} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;