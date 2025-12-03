import styles from './CourseHeader.module.css';

const CourseHeader = ({ course }) => {
    if (!course) return null;

    return (
        <div className={styles.courseHeader}>
            <div className={styles.container}>
                <div className={styles.headerContent}>
                    <h1 className={styles.courseTitle}>{course.name}</h1>
                    <p className={styles.courseDescription}>{course.description}</p>

                    <div className={styles.courseMetadata}>
                        <div className={styles.metadataItem}>
                            <span className={styles.metadataLabel}>Difficulty:</span>
                            <span className={`${styles.metadataValue} ${styles[`difficulty${course.difficulty}`]}`}>
                                {course.difficulty}
                            </span>
                        </div>
                        <div className={styles.metadataItem}>
                            <span className={styles.metadataLabel}>Duration:</span>
                            <span className={styles.metadataValue}>{course.duration}</span>
                        </div>
                        {course.rating && (
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Rating:</span>
                                <span className={styles.metadataValue}>⭐ {course.rating}/5</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.headerImage}>
                    <img src={course.image_url} alt={course.name} className={styles.courseImage} />
                </div>
            </div>
        </div>
    );
};

export default CourseHeader;
