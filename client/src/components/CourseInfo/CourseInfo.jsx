import styles from './CourseInfo.module.css';

const CourseInfo = ({ course }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const detailItems = [
        {
            icon: '📚',
            title: 'Number of Lectures',
            value: `${course.num_lectures || 'TBA'} lectures`
        },
        {
            icon: '📅',
            title: 'Start Date',
            value: formatDate(course.start_date)
        },
        {
            icon: '🏁',
            title: 'End Date',
            value: formatDate(course.end_date)
        },
        {
            icon: '🕐',
            title: 'Class Timing',
            value: course.class_timing || 'TBA'
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.sectionHead}>
                <span className="eyebrow">Course Snapshot</span>
                <h2 className={styles.sectionTitle}>Everything You Need to Plan Your Learning</h2>
                <p className={styles.sectionCopy}>
                    Clear schedule, structure, and outcomes so you can commit with confidence.
                </p>
            </div>

            <div className={styles.detailsGrid}>
                {detailItems.map((item) => (
                    <div key={item.title} className={styles.detailItem}>
                        <div className={styles.detailIconWrap}>
                            <div className={styles.detailIcon}>{item.icon}</div>
                        </div>
                        <div className={styles.detailContent}>
                            <h3 className={styles.detailTitle}>{item.title}</h3>
                            <p className={styles.detailValue}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CourseInfo;
