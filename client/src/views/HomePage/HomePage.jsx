import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHomepageData } from '../../controllers/useHomepageData';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import {
  Header,
  Footer,
  HeroSection,
  TrustIndicators,
  CompanyStory,
  FeaturedCourses,
  CustomerTestimonials,
  ErrorBoundary
} from '../../components';
import ProfileDropdown from '../../components/ProfileDropdown/ProfileDropdown';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';
import styles from './HomePage.module.css';

const HomePage = () => {
  console.log("Starting home page")
  const { data, loading, error } = useHomepageData();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Preload critical images for better performance
  const criticalImages = [
    '/images/hero-background.jpg',
    '/images/company-story.jpg',
    '/images/placeholder-course.jpg',
    '/images/placeholder-avatar.jpg'
  ];
  useImagePreloader(criticalImages, !loading && !error);

  // Handle scrolling to hash anchor when page loads or hash changes
  useEffect(() => {
    if (!loading && location.hash) {
      // Small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, loading]);

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status" aria-live="polite">
        <div className={`${styles.spinner} animate-pulse`} aria-hidden="true"></div>
        <p className="animate-fade-in">Loading homepage content...</p>
        <span className="sr-only">Please wait while we load the A1frenchclasses homepage</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer} role="alert" aria-live="assertive">
        <h1>Error Loading Page</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          type="button"
          aria-describedby="error-description"
        >
          Try Again
        </button>
        <span id="error-description" className="sr-only">
          Reload the page to try loading the homepage again
        </span>
      </div>
    );
  }

  // Extract data for components (hero and company story still come from API)
  const heroData = data?.hero || {};
  const companyStoryData = data?.companyStory || {};

  return (
    <div className={styles.homePage}>
      {/* Header - uses common navigation config */}
      <Header
        logo={navigationConfig.logo}
        navigationItems={navigationConfig.items}
        authComponent={isAuthenticated ? <ProfileDropdown /> : null}
      />

      {/* Main Content */}
      <main id="main-content" className={styles.main} role="main">
        {/* Hero Section */}
        <ErrorBoundary>
          <HeroSection
            title={heroData.title}
            subtitle={heroData.subtitle}
            ctaText={heroData.ctaText}
            backgroundImage={heroData.backgroundImage}
          />
        </ErrorBoundary>

        {/* Trust Indicators Section */}
        <div className={styles.sectionSpacing}>
          <ErrorBoundary>
            <TrustIndicators />
          </ErrorBoundary>
        </div>

        {/* Company Story Section */}
        <div id="aboutus" className={styles.sectionSpacing}>
          <ErrorBoundary>
            <CompanyStory
              title={companyStoryData.title}
              mission={companyStoryData.mission}
              story={companyStoryData.story}
              teamImage={companyStoryData.teamImage}
              statistics={companyStoryData.statistics}
            />
          </ErrorBoundary>
        </div>

        {/* Featured Courses Section */}
        <div id="courses" className={styles.sectionSpacing}>
          <ErrorBoundary>
            <FeaturedCourses />
          </ErrorBoundary>
        </div>

        {/* Customer Testimonials Section */}
        <div id="testimonials" className={styles.sectionSpacing}>
          <ErrorBoundary>
            <CustomerTestimonials />
          </ErrorBoundary>
        </div>
      </main>

      {/* Footer - uses common footer config */}
      <Footer
        logo={navigationConfig.logo}
        companyInfo={footerConfig.companyInfo}
        navigationLinks={navigationConfig.items}
        socialLinks={footerConfig.socialLinks}
        contactInfo={footerConfig.contactInfo}
      />
    </div>
  );
};

export default HomePage;