import styles from './TrustIndicators.module.css';

const FEATURES = [
  {
    icon: '🌍',
    title: 'Global Reach',
    description:
      'Spoken by over 300 million people across five continents. The fifth most spoken language globally and an official language at the UN.',
  },
  {
    icon: '📖',
    title: 'Cultural Depth',
    description:
      'Unlock the original works of Hugo, Proust, and Camus. Access the heritage of fashion, gastronomy, art, and philosophy.',
  },
  {
    icon: '📈',
    title: 'Career Catalyst',
    description:
      'A major language of the UN, EU, and the Olympics. Essential for careers in international business, law, and diplomacy.',
  },
];

const TrustIndicators = ({ companies = [], statistics = {} }) => {
  const hasStats = Object.keys(statistics).length > 0;

  return (
    <section className={styles.trustIndicators} aria-labelledby="trust-title">
      <div className={styles.container}>
        {/* Section header */}
        <div className={styles.sectionHeader}>
          <h2 id="trust-title" className={styles.title}>
            Why Learn French?
          </h2>
          <p className={styles.subtitle}>
            Beyond the romance, French is the language of international diplomacy,
            luxury commerce, and global philosophy.
          </p>
        </div>

        {/* 3-column feature grid */}
        <div className={styles.featuresGrid} role="list" aria-label="Reasons to learn French">
          {FEATURES.map((feature) => (
            <div key={feature.title} className={styles.featureItem} role="listitem">
              <div className={styles.iconBox} aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats row — when API returns statistics */}
        {hasStats && (
          <div className={styles.statistics} role="region" aria-label="Key statistics">
            {statistics.studentsHelped && (
              <div className={styles.statItem}>
                <span className={styles.statNumber} aria-label={`${statistics.studentsHelped} students helped`}>
                  {statistics.studentsHelped}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Students Helped</span>
              </div>
            )}
            {statistics.coursesOffered && (
              <div className={styles.statItem}>
                <span className={styles.statNumber} aria-label={`${statistics.coursesOffered} courses`}>
                  {statistics.coursesOffered}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Courses Offered</span>
              </div>
            )}
            {statistics.successRate && (
              <div className={styles.statItem}>
                <span className={styles.statNumber} aria-label={`${statistics.successRate} success rate`}>
                  {statistics.successRate}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Success Rate</span>
              </div>
            )}
            {statistics.yearsExperience && (
              <div className={styles.statItem}>
                <span className={styles.statNumber} aria-label={`${statistics.yearsExperience} years experience`}>
                  {statistics.yearsExperience}
                </span>
                <span className={styles.statLabel} aria-hidden="true">Years Experience</span>
              </div>
            )}
          </div>
        )}

        {/* Company logos (if passed) */}
        {companies.length > 0 && (
          <div className={styles.companiesSection}>
            <p className={styles.companiesText}>
              Professionals from these companies trust our French courses
            </p>
            <div className={styles.logoCarousel} role="region" aria-label="Trusted companies">
              <div className={styles.logoTrack} role="list">
                {companies.map((company) => (
                  <div key={company.id} className={styles.logoItem} role="listitem">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className={styles.logo}
                      width={120}
                      height={60}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustIndicators;