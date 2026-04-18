import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.hero} role="banner" aria-labelledby="hero-title">
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          {/* Left: text content */}
          <div>
            <span className="eyebrow">TEF Canada · TCF Canada · CLB 7+</span>
            <h1 id="hero-title">
              French is your shortcut to staying in Canada — and getting PR.
            </h1>
            <p className={styles.lede}>
              Live online small-batch French classes built specifically for Canadians on a work permit or PR journey.{' '}
              <strong>CLB 5 in 4–5 months</strong> unlocks a work permit extension via the Francophone Mobility Program.{' '}
              <strong>CLB 7 in 9 months</strong> unlocks +50 CRS points for Express Entry. 5 live classes a week. 98% pass rate.
            </p>

            <div className={styles.heroCta}>
              <a href="/#courses" className={`btn-primary ${styles.btnLg}`}>
                Enroll in Next Batch →
              </a>
              <a href="#results" className={`btn-secondary ${styles.btnLg}`}>
                See Student Results
              </a>
            </div>

            <div className={styles.heroMeta}>
              <div className={styles.avatars}>
                <span style={{ background: '#3B82F6' }}>A</span>
                <span style={{ background: '#E11D48' }}>R</span>
                <span style={{ background: '#F59E0B' }}>S</span>
                <span style={{ background: '#10B981' }}>+</span>
              </div>
              <div>
                <div className={styles.stars}>★★★★★</div>
                <div className={styles.ratingText}>
                  <strong>4.9/5</strong> from 500+ Canada PR students
                </div>
              </div>
            </div>
          </div>

          {/* Right: transformation visual */}
          <div className={styles.heroVisual}>
            <div className={styles.visualLabel}>Your TEF/TCF Transformation</div>

            <div className={styles.scoreCard}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>Month 1 · Beginner</span>
                <span className={styles.scoreVal} style={{ color: '#FCA5A5' }}>A1</span>
              </div>
              <div className={styles.bar}><div style={{ width: '18%' }} /></div>
            </div>

            <div className={styles.scoreCard}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>Month 4–5 · Working proficiency</span>
                <span className={styles.scoreVal} style={{ color: '#FDE68A' }}>CLB 5</span>
              </div>
              <div className={styles.bar}><div style={{ width: '55%' }} /></div>
            </div>

            <div className={styles.scoreCard}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>Month 9 · PR-ready</span>
                <span className={styles.scoreVal} style={{ color: '#86EFAC' }}>CLB 7 · B2</span>
              </div>
              <div className={styles.bar}><div style={{ width: '85%' }} /></div>
            </div>

            <div className={`${styles.scoreCard} ${styles.scoreCardHighlight}`}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabelGreen}>Canada PR bonus points</span>
                <span className={styles.scoreVal} style={{ color: '#fff' }}>+50</span>
              </div>
              <div className={styles.scoreSubtext}>Unlocked via French proficiency</div>
            </div>

            <div className={styles.badgeFloat}>
              <span className={styles.dot} /> 98% Pass Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
