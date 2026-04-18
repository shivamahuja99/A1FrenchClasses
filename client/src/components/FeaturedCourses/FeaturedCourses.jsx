import { Link } from 'react-router-dom';
import { useGetCoursesQuery } from '../../store/api/apiSlice';
import styles from './FeaturedCourses.module.css';

const FeaturedCourses = () => {
  const { data: courses = [], isLoading, error } = useGetCoursesQuery();
  const featuredCourses = Array.isArray(courses) ? courses.slice(0, 2) : [];

  const renderPrice = (course) => {
    const hasDiscount = Number(course.discount) > 0;
    const discountedPrice = hasDiscount
      ? (Number(course.price) * (1 - Number(course.discount) / 100)).toFixed(2)
      : Number(course.price).toFixed(2);

    return {
      hasDiscount,
      discountedPrice,
      originalPrice: Number(course.price).toFixed(2)
    };
  };

  return (
    <section id="courses" className={styles.pricing}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">Pick Your Path</span>
          <h2>Choose the right course for your PR goal</h2>
          <p>All featured courses on this page now come directly from the latest course data in our database.</p>
        </div>

        {isLoading && <p className={styles.offerNotice}>Loading courses...</p>}
        {error && <p className={styles.offerNotice}>Unable to load courses right now.</p>}

        {!isLoading && !error && (
          <div className={styles.cards}>
            {featuredCourses.map((course, index) => {
              const { hasDiscount, discountedPrice, originalPrice } = renderPrice(course);
              const thisIncludes = Array.isArray(course.this_includes) ? course.this_includes : [];

              return (
                <div
                  key={course.id}
                  className={`${styles.card} ${index === 1 ? styles.featured : ''} reveal`}
                >
                  <span className={styles.ribbon} style={{ background: index === 1 ? '#10B981' : '#b91010ff' }}>
                    {index === 1 ? 'Most Popular' : 'Featured Course'}
                  </span>
                  <h3>{course.name}</h3>
                  <p className={styles.sub}>{course.description}</p>
                  <div className={styles.price}>
                    ${discountedPrice}
                    <small>CAD / {course.duration || 'Duration TBA'}</small>
                  </div>
                  {hasDiscount && (
                    <p className={styles.discountText}>
                      <s>${originalPrice}</s> before discount
                    </p>
                  )}

                  <ul className={styles.featuresList}>
                    {thisIncludes.length > 0 ? (
                      thisIncludes.map((item) => <li key={`${course.id}-${item}`}>{item}</li>)
                    ) : (
                      <li>Course inclusions will be updated soon.</li>
                    )}
                  </ul>

                  <Link to={`/courses/${course.id}`} className={index === 1 ? "btn btn-primary" : "btn btn-secondary"} style={{ width: '100%' }}>
                    Enroll — ${discountedPrice} CAD
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
