import SignupForm from '../components/auth/SignupForm';
import styles from './SignupPage.module.css';

const SignupPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandTitle}>Join A1 French Classes</h1>
                    <p className={styles.brandTagline}>
                        Start your French learning journey today
                    </p>
                    <div className={styles.benefits}>
                        <div className={styles.benefit}>
                            <span className={styles.benefitIcon}>🎓</span>
                            <div>
                                <h3>Learn at Your Pace</h3>
                                <p>Flexible courses designed for all levels</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <span className={styles.benefitIcon}>👥</span>
                            <div>
                                <h3>Expert Support</h3>
                                <p>Get help from experienced French teachers</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <span className={styles.benefitIcon}>📱</span>
                            <div>
                                <h3>Study Anywhere</h3>
                                <p>Access courses on any device, anytime</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <SignupForm />
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
