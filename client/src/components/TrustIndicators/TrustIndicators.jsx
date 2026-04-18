import styles from './TrustIndicators.module.css';

const STATS = [
  { num: '500+', label: 'Students trained' },
  { num: '98%', label: 'TEF/TCF pass rate' },
  { num: '+50', label: 'CRS points unlocked' },
  { num: '9 mo.', label: 'Beginner → CLB 7' },
];

const TrustIndicators = () => {
  return (
    <section className={styles.trust} aria-label="Key statistics">
      <div className={styles.container}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.statItem}>
            <div className={styles.num}>{stat.num}</div>
            <div className={styles.lbl}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustIndicators;