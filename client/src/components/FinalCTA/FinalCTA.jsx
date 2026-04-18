import { Link } from 'react-router-dom';
import styles from './FinalCTA.module.css';

const FinalCTA = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.finalCta}>
          <div className={styles.urgency}>
            <span className={styles.dot}></span> Limited batch size · Max 10–12 students per cohort
          </div>
          <h2>Your PR dream shouldn't wait another draw.</h2>
          <p>
            Every month you delay learning French is another month you're leaving 50 CRS points on the table.
            Start today — CLB 5 in 4–5 months, CLB 7 and the full CRS bonus in 9 months.
          </p>
          <div className={styles.ctaGroup}>
            <a href="/#courses" className="btn btn-primary btn-lg">Enroll Now — Save $250 →</a>
            <a href="https://wa.me/something" className={`btn btn-secondary btn-lg ${styles.ghostBtn}`}>WhatsApp Us</a>
          </div>
          <p className={styles.bonusNotice}>
            🎁 Enroll this month → claim 50% off a Canada PR consultation with our partnered immigration consultant
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
