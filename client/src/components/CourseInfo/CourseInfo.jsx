import styles from './CourseInfo.module.css';

const CourseInfo = ({ course }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Course Details</h2>
            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>📚</div>
                    <div className={styles.detailContent}>
                        <h3 className={styles.detailTitle}>Number of Lectures</h3>
                        <p className={styles.detailValue}>{course.num_lectures || 'TBA'} lectures</p>
                    </div>
                </div>

                <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>📅</div>
                    <div className={styles.detailContent}>
                        <h3 className={styles.detailTitle}>Start Date</h3>
                        <p className={styles.detailValue}>{formatDate(course.start_date)}</p>
                    </div>
                </div>

                <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>🏁</div>
                    <div className={styles.detailContent}>
                        <h3 className={styles.detailTitle}>End Date</h3>
                        <p className={styles.detailValue}>{formatDate(course.end_date)}</p>
                    </div>
                </div>

                <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>🕐</div>
                    <div className={styles.detailContent}>
                        <h3 className={styles.detailTitle}>Class Timing</h3>
                        <p className={styles.detailValue}>{course.class_timing || 'TBA'}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CourseInfo;
