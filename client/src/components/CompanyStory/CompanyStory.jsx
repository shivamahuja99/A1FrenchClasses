import styles from './CompanyStory.module.css';

const CompanyStory = ({
  title = 'Our Story',
  mission,
  story,
  teamImage,
  statistics = {},
}) => {
  const hasStats = Object.keys(statistics).length > 0;

  return (
    <section className={styles.companyStory} aria-labelledby="story-title">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <h2 id="story-title" className={styles.title}>
              {title}
            </h2>
            <p className={styles.subtitle}>
              {mission ||
                'We are dedicated to providing specialised curriculums tailored to your linguistic journey. Each program is led by certified native experts.'}
            </p>
          </div>
          {/* Optional: Keep a link if needed, or remove if it feels too cluttered */}
          <a href="/courses" className={styles.brochureLink}>
            Explore our curriculum →
          </a>
        </div>

        <div className={styles.grid}>
          {/* Left Side: Story Text */}
          <div className={styles.textContent}>
            <div className={styles.storyWrap}>
              <p className={styles.story}>
                {story ||
                  'Founded with a passion for the French language, A1FrenchClasses has grown into a premier destination for students worldwide. Our approach combines traditional values with modern, interactive techniques to ensure every student finds their unique pathway to fluency.'}
              </p>
            </div>

            {hasStats && (
              <div className={styles.statsGrid}>
                {statistics.studentsHelped && (
                  <div className={styles.statCard}>
                    <span className={styles.statNumber}>{statistics.studentsHelped}</span>
                    <span className={styles.statLabel}>Students Formed</span>
                  </div>
                )}
                {statistics.yearsExperience && (
                  <div className={styles.statCard}>
                    <span className={styles.statNumber}>{statistics.yearsExperience}</span>
                    <span className={styles.statLabel}>Years Excellence</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Visual Content */}
          <div className={styles.visualContent}>
            <div className={styles.imageWrapper}>
              {teamImage ? (
                <img src={teamImage} alt="Our Team" className={styles.teamImage} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <div className={styles.placeholderBlob}></div>
                  <span className={styles.placeholderText}>L'Académie Parisienne</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;