import { useFeaturedCourses } from '../../controllers/useCourses';
import CourseCard from '../CourseCard/CourseCard';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';
import styles from './FeaturedCourses.module.css';

const FeaturedCourses = ({ limit = 3, showViewAllLink = true }) => {
  const { courses, loading, error } = useFeaturedCourses(limit);

  if (loading) {
    return (
      <section 
        className={styles.featuredCourses} 
        aria-labelledby="featured-courses-title"
        role="region"
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="featured-courses-title" className={styles.title}>Featured Courses</h2>
            <p className={styles.subtitle}>Discover our most popular French courses</p>
          </div>
          <div className={styles.coursesGrid} role="status" aria-live="polite">
            <LoadingSkeleton variant="card" count={limit} />
            <span className="sr-only">Loading featured courses...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section 
        className={styles.featuredCourses} 
        aria-labelledby="featured-courses-title"
        role="region"
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="featured-courses-title" className={styles.title}>Featured Courses</h2>
            <p className={styles.subtitle}>Discover our most popular French courses</p>
          </div>
          <div className={styles.errorContainer} role="alert" aria-live="assertive">
            <p className={styles.errorMessage}>
              Unable to load courses at the moment. Please try again later.
            </p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
              aria-describedby="featured-courses-title"
              type="button"
            >
              Try Again
              <span className="sr-only"> to load featured courses</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <section className={styles.featuredCourses} aria-label="Featured courses">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Featured Courses</h2>
            <p className={styles.subtitle}>Discover our most popular French courses</p>
          </div>
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>No courses available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const handleViewAllClick = () => {
    window.location.href = '/courses';
  };

  const handleViewAllKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleViewAllClick();
    }
  };

  return (
    <section 
      id="featured-courses"
      className={styles.featuredCourses} 
      aria-labelledby="featured-courses-title"
      role="region"
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 id="featured-courses-title" className={styles.title}>Featured Courses</h2>
          <p className={styles.subtitle}>
            Discover our most popular French courses designed to help you achieve fluency
          </p>
        </div>

        {/* Courses Grid */}
        <div 
          className={styles.coursesGrid} 
          role="list"
          aria-label={`${courses.length} featured courses available`}
        >
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className={`${styles.courseItem} animate-fade-in animate-delay-${(index + 1) * 100}`}
              role="listitem"
              aria-setsize={courses.length}
              aria-posinset={index + 1}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* View All Courses Link */}
        {showViewAllLink && (
          <div className={styles.viewAllContainer}>
            <button
              className={styles.viewAllButton}
              onClick={handleViewAllClick}
              onKeyDown={handleViewAllKeyDown}
              type="button"
              aria-describedby="featured-courses-title"
            >
              View All Courses
              <span className={styles.viewAllArrow} aria-hidden="true">→</span>
              <span className="sr-only"> - Navigate to complete course catalog</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;