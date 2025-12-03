import styles from './InstructorInfo.module.css';

const InstructorInfo = ({ instructor }) => {
    if (!instructor) return null;

    return (
        <div className={styles.instructorInfo}>
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {instructor.image_url ? (
                        <img src={instructor.image_url} alt={instructor.name} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {instructor.name?.charAt(0).toUpperCase() || 'I'}
                        </div>
                    )}
                </div>
                <div className={styles.details}>
                    <h3 className={styles.name}>{instructor.name}</h3>
                    <p className={styles.role}>French Language Instructor</p>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>4.9</span>
                            <span className={styles.statLabel}>Rating</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>10+</span>
                            <span className={styles.statLabel}>Courses</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>1000+</span>
                            <span className={styles.statLabel}>Students</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bio}>
                <p>
                    {instructor.bio ||
                        `${instructor.name} is a certified French language instructor with over 5 years of experience teaching students of all levels. Passionate about French culture and language, they make learning engaging and effective through interactive methods and real-world examples.`}
                </p>
            </div>
        </div>
    );
};

export default InstructorInfo;
