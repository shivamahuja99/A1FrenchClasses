import { useGetHomeContentQuery } from '../../store/api/apiSlice';
import styles from './FAQ.module.css';

const FAQ = () => {
  const { data, isLoading, error } = useGetHomeContentQuery();
  const faqItems = Array.isArray(data?.faq) ? data.faq : [];

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">FAQs</span>
          <h2>Questions we hear every day</h2>
        </div>

        {isLoading && <p>Loading FAQs...</p>}
        {error && <p>Unable to load FAQs right now.</p>}

        {!isLoading && !error && (
          <div className={styles.faqWrap}>
            {faqItems.length > 0 ? (
              faqItems.map((item, i) => (
                <details key={`${item.question}-${i}`} className={styles.details} open={i === 0}>
                  <summary className={styles.summary}>{item.question}</summary>
                  <div
                    className={styles.faqBody}
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </details>
              ))
            ) : (
              <p>No FAQs available right now.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;
