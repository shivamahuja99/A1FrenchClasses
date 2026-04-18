import styles from './HowItWorks.module.css';

const STEPS = [
  {
    num: '1',
    title: 'Month 1 · Enroll & build foundations',
    desc: 'Pick your package, take a free placement test, and start with the basics — pronunciation, everyday vocabulary, core grammar. Confidence from day one.'
  },
  {
    num: '2',
    title: 'Months 2–5 · Reach CLB 5',
    desc: '5 live small-batch classes every week. Speaking drills, writing practice, weekly quizzes. By month 5, you can handle everyday French and are ready for your first mock TEF/TCF.'
  },
  {
    num: '3',
    title: 'Months 6–9 · Hit CLB 7 & score the +50 CRS',
    desc: 'Full B2 curriculum, 25+ timed mock exams, line-by-line feedback on écrite. We book your exam slot and celebrate when your CLB 7+ hits your IRCC profile.'
  }
];

const HowItWorks = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className="eyebrow">How It Works</span>
          <h2>From zero French to PR-ready in 3 clear stages</h2>
        </div>
        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.num} className={`${styles.step} reveal`}>
              <div className={styles.num}>{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
