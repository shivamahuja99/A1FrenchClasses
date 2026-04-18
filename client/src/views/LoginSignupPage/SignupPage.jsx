import SignupForm from '../../components/auth/SignupForm';
import styles from './SignupPage.module.css';

const SignupPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandTitle}>Join A1 French Classes</h1>
                    <p className={styles.brandTagline}>
                        Start your journey to CLB 7+ today.
                    </p>
                    <div className={styles.benefits}>
                        <div className={styles.benefit}>
                            <span className={styles.benefitIcon}>🇨🇦</span>
                            <div>
                                <h3>Canada Immigration Focus</h3>
                                <p>Courses designed specifically for TEF & TCF</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <span className={styles.benefitIcon}>🎯</span>
                            <div>
                                <h3>Small Live Batches</h3>
                                <p>Get personalized attention and speaking practice</p>
                            </div>
                        </div>
                        <div className={styles.benefit}>
                            <span className={styles.benefitIcon}>🏆</span>
                            <div>
                                <h3>98% Pass Rate</h3>
                                <p>Join 500+ successful applicants</p>
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
