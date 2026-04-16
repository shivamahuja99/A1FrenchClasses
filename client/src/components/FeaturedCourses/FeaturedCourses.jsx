import { useGetCoursesQuery, useGetUserCoursesQuery } from '../../store/api/apiSlice';
import { Link } from 'react-router-dom';
import CourseCard from '../CourseCard/CourseCard';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';
import styles from './FeaturedCourses.module.css';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const FeaturedCourses = ({ limit = 3 }) => {
  const { data: courses = [], isLoading: loading, error } = useGetCoursesQuery();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: userCourses } = useGetUserCoursesQuery(undefined, { skip: !isAuthenticated });

  // Limit the courses displayed
  const displayedCourses = courses.slice(0, limit);

  if (loading) {
    return (
      <section className={styles.featuredCourses} aria-labelledby="featured-courses-title">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="featured-courses-title" className={styles.title}>Refined Programs</h2>
            <p className={styles.subtitle}>Explore our curricula designed for academic and professional excellence.</p>
          </div>
          <div className={styles.coursesGrid}>
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.featuredCourses} aria-labelledby="featured-courses-title">
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="featured-courses-title" className={styles.title}>Programs</h2>
          </div>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>Unable to load programs at the moment.</p>
            <button className={styles.retryButton} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-courses" className={styles.featuredCourses} aria-labelledby="featured-courses-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="featured-courses-title" className={styles.title}>Refined Programs</h2>
          <p className={styles.subtitle}>
            From foundational A1 to business-ready C1, our courses are curated for the modern world.
          </p>
        </div>

        <div className={styles.coursesGrid} role="list">
          {displayedCourses.map((course, index) => (
            <div
              key={course.id}
              className={`${styles.courseItem} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.15}s` }}
              role="listitem"
            >
              <CourseCard 
                course={course} 
                isEnrolled={Array.isArray(userCourses) && userCourses.some(c => String(c.id) === String(course.id))} 
              />
            </div>
          ))}
        </div>

        {courses.length > limit && (
          <div className={styles.viewAllContainer}>
            <Link to="/courses" className={styles.viewAllButton}>
              Explore Full Catalog
              <span className={styles.buttonIcon} aria-hidden="true">→</span>
            </Link>
            <p className={styles.courseCount}>
              Showing {displayedCourses.length} of our {courses.length} masterclasses
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;