import { useGetPurchasedCoursesQuery } from '../../store/api/apiSlice';
import styles from './PurchasedCoursesList.module.css';

const PurchasedCoursesList = () => {
    const { data: courses, isLoading, error } = useGetPurchasedCoursesQuery();

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>My Courses</h2>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading your courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>My Courses</h2>
                <div className={styles.error}>
                    Failed to load courses. Please try again later.
                </div>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>My Courses</h2>
                <div className={styles.empty}>
                    <svg
                        className={styles.emptyIcon}
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <h3>No courses yet</h3>
                    <p>Start learning by enrolling in a course</p>
                    <a href="/courses" className={styles.browseButton}>
                        Browse Courses
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>My Courses</h2>
            <div className={styles.coursesList}>
                {courses.map((course) => (
                    <div key={course.id} className={styles.courseCard}>
                        <div className={styles.courseImage}>
                            <img src={course.image} alt={course.title} />
                            <div className={styles.progressOverlay}>
                                <div className={styles.progressCircle}>
                                    <svg className={styles.progressSvg} viewBox="0 0 36 36">
                                        <path
                                            className={styles.progressBg}
                                            d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className={styles.progressBar}
                                            strokeDasharray={`${course.progress}, 100`}
                                            d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className={styles.progressText}>{course.progress}%</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.courseContent}>
                            <h3 className={styles.courseTitle}>{course.title}</h3>
                            <p className={styles.courseDescription}>{course.description}</p>

                            <div className={styles.courseFooter}>
                                <span className={styles.enrolledDate}>
                                    Enrolled: {new Date(course.enrolledDate).toLocaleDateString()}
                                </span>
                                <a href={`/courses/${course.id}`} className={styles.continueButton}>
                                    Continue Learning →
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurchasedCoursesList;
