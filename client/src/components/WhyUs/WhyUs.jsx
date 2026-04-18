import { useGetHomeContentQuery } from '../../store/api/apiSlice';
import styles from './WhyUs.module.css';

const WhyUs = () => {
  const { data, isLoading, error } = useGetHomeContentQuery();
  const features = Array.isArray(data?.why_us) ? data.why_us : [];

  return (
    <section id="why" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">Why A1 French Classes</span>
          <h2>Everything else teaches French. We teach you to score.</h2>
        </div>

        {isLoading && <p>Loading why us content...</p>}
        {error && <p>Unable to load why us content right now.</p>}

        {!isLoading && !error && (
          <div className={styles.features}>
            {features.length > 0 ? (
              features.map((f, index) => (
                <div key={`${f.title}-${index}`} className={`${styles.feature} reveal`}>
                  <div className={styles.icon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))
            ) : (
              <p>No Why Us items available right now.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default WhyUs;
