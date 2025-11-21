import { useHomepageData } from '../../controllers/useHomepageData';
import { useImagePreloader } from '../../hooks/useImagePreloader';
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
import styles from './HomePage.module.css';

const HomePage = () => {
  console.log("Starting home page")
  const { data, loading, error } = useHomepageData();

  // Preload critical images for better performance
  const criticalImages = [
    '/images/hero-background.jpg',
    '/images/company-story.jpg',
    '/images/placeholder-course.jpg',
    '/images/placeholder-avatar.jpg'
  ];
  useImagePreloader(criticalImages, !loading && !error);

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

  // Extract data for components
  const navigationData = data?.navigation || {};
  const heroData = data?.hero || {};
  const companyStoryData = data?.companyStory || {};

  // Mock contact info and social links for footer (these would typically come from data)
  const contactInfo = {
    email: 'info@a1frenchclasses.com',
    phone: '+1 (555) 123-4567',
    address: '123 French Street, Paris, France',
    hours: 'Mon-Fri: 9AM-6PM'
  };

  const socialLinks = [
    { platform: 'Facebook', url: 'https://facebook.com/a1frenchclasses' },
    { platform: 'Twitter', url: 'https://twitter.com/a1frenchclasses' },
    { platform: 'Instagram', url: 'https://instagram.com/a1frenchclasses' }
  ];

  const companyInfo = {
    description: 'Learn French with confidence through our expert-led courses and proven methodology.',
    privacyPolicy: '/privacy',
    termsOfService: '/terms'
  };

  return (
    <div className={styles.homePage}>
      {/* Header */}
      <Header
        logo={navigationData.logo}
        navigationItems={navigationData.items || []}
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

      {/* Footer */}
      <Footer
        logo={navigationData.logo}
        companyInfo={companyInfo}
        navigationLinks={navigationData.items || []}
        socialLinks={socialLinks}
        contactInfo={contactInfo}
      />
    </div>
  );
};

export default HomePage;