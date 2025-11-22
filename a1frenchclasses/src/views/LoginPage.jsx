import LoginForm from '../components/auth/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandTitle}>A1 French Classes</h1>
                    <p className={styles.brandTagline}>
                        Master French with expert guidance and interactive lessons
                    </p>
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>Expert instructors</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>Interactive lessons</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>Flexible schedule</span>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
