import styles from './BonusOffer.module.css';

const BonusOffer = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.guarantee}>
          <div className={styles.seal}>50%<br/>OFF<br/><span className={styles.sealSub}>PR CONSULT</span></div>
          <div>
            <h2>Enroll today — get 50% off a Canada PR consultation.</h2>
            <p>Every student who joins a CLB 5 or CLB 7 batch this month gets a 50% discount on a one-on-one Canada PR consultation with our partnered immigration consultant. Map your Express Entry profile, plan your CRS jump, and walk away with a personalized PR roadmap.</p>
          </div>
          <a href="#courses" className={styles.ctaBtn}>Claim Your Seat →</a>
        </div>
      </div>
    </section>
  );
};

export default BonusOffer;
