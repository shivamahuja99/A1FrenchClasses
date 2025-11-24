import { useEffect } from 'react';
import { useCoursesData } from '../../controllers/useCoursesData';
import { Header, Footer } from '../../components';
import CourseCard from '../../components/CourseCard/CourseCard';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import navigationConfig from '../../config/navigation';
import footerConfig from '../../config/footer';
import styles from './CoursesPage.module.css';

const CoursesPage = () => {
    const { courses, loading, error } = useCoursesData();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (loading) {
        return (
            <div className={styles.coursesPage}>
                <Header logo={navigationConfig.logo} navigationItems={navigationConfig.items} />
                <main className={styles.main} role="main">
                    <div className={styles.container}>
                        <div className={styles.header}>
                            <h1 className={styles.title}>Our French Courses</h1>
                            <p className={styles.subtitle}>Loading courses...</p>
                        </div>
                        <div className={styles.coursesGrid} role="status" aria-live="polite">
                            <LoadingSkeleton variant="card" count={6} />
                            <span className="sr-only">Loading course catalog...</span>
                        </div>
                    </div>
                </main>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.coursesPage}>
                <Header logo={navigationConfig.logo} navigationItems={navigationConfig.items} />
                <main className={styles.main} role="main">
                    <div className={styles.container}>
                        <div className={styles.errorContainer} role="alert" aria-live="assertive">
                            <h1 className={styles.errorTitle}>Unable to Load Courses</h1>
                            <p className={styles.errorMessage}>{error}</p>
                            <button
                                className={styles.retryButton}
                                onClick={() => window.location.reload()}
                                type="button"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>
                <Footer
                    logo={navigationConfig.logo}
                    companyInfo={footerConfig.companyInfo}
                    navigationLinks={navigationConfig.items}
                    socialLinks={footerConfig.socialLinks}
                    contactInfo={footerConfig.contactInfo}
                />
            </div>
        );
    }

    return (
        <div className={styles.coursesPage}>
            {/* SEO Meta Tags - would be handled by Helmet or similar in production */}
            <Header logo={navigationConfig.logo} navigationItems={navigationConfig.items} />

            <main id="main-content" className={styles.main} role="main">
                <div className={styles.container}>
                    {/* Page Header */}
                    <header className={styles.header}>
                        <h1 className={styles.title}>Our French Language Courses</h1>
                        <p className={styles.subtitle}>
                            Explore our comprehensive collection of French courses designed for all levels.
                            From beginner to advanced, find the perfect course to achieve your language learning goals.
                        </p>
                        <div className={styles.stats} aria-label="Course statistics">
                            <span className={styles.stat}>
                                <strong>{courses.length}</strong> Courses Available
                            </span>
                        </div>
                    </header>

                    {/* Courses Grid */}
                    {courses.length > 0 ? (
                        <section
                            className={styles.coursesSection}
                            aria-labelledby="courses-heading"
                        >
                            <h2 id="courses-heading" className="sr-only">Available Courses</h2>
                            <div
                                className={styles.coursesGrid}
                                role="list"
                                aria-label={`${courses.length} courses available`}
                            >
                                {courses.map((course, index) => (
                                    <div
                                        key={course.id}
                                        className={styles.courseItem}
                                        role="listitem"
                                        aria-setsize={courses.length}
                                        aria-posinset={index + 1}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyMessage}>No courses available at the moment.</p>
                            <p className={styles.emptySubtext}>Please check back later for new courses.</p>
                        </div>
                    )}
                </div>
            </main>

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

export default CoursesPage;
