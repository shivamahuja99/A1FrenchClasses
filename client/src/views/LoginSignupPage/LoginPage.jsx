import LoginForm from '../../components/auth/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandTitle}>A1 French Classes</h1>
                    <p className={styles.brandTagline}>
                        The fastest path to CLB 7 and your +50 CRS points.
                    </p>
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>TEF & TCF Canada focused</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>Live interactive batches</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>Accelerate your Express Entry</span>
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
