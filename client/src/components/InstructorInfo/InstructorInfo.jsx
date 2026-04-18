import { Link } from 'react-router-dom';
import styles from './InstructorInfo.module.css';

const InstructorInfo = ({ instructor }) => {
  const name = instructor?.name || "Madame F.";
  const initials = name.substring(0, 2).toUpperCase();
  
  return (
    <section id="teacher" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.teacherGrid}>
          <div className={`${styles.teacherImg} reveal`}>
            {instructor?.image_url ? (
              <img src={instructor.image_url} alt={name} className={styles.avatarImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} />
            ) : (
              <div className={styles.initials}>{initials}</div>
            )}
            <div className={styles.credentials}>
              <strong>Your instructor — {name}</strong>
              <span>Certified DELF-DALF examiner · 8+ years teaching</span>
            </div>
          </div>
          <div className="reveal">
            <span className="eyebrow">Meet Your Teacher</span>
            <h2>A certified French expert who actually understands the Canada PR process</h2>
            <p className={styles.bioFirst}>
              Most online tutors have never set foot in a TEF exam hall. Your instructor holds a DALF C2 certification, has been training TEF/TCF candidates since 2017, and has personally guided 500+ students to CLB 7+ scores.
            </p>
            <p className={styles.bioSecond}>
              Beyond teaching, she's coached students through the entire PR journey — from picking the right exam (TEF vs TCF), to booking slots, to maximizing CRS points. When you enroll, you get a teacher who treats your PR dream like her own.
            </p>
            <div className={styles.credList}>
              <span>✓ DALF C2 Certified</span>
              <span>✓ CELTA Trained</span>
              <span>✓ 8+ Years Teaching</span>
              <span>✓ 500+ Students Coached</span>
              <span>✓ Based in Canada</span>
            </div>
            <div className={styles.ctaWrap}>
              <a href="/#courses" className="btn btn-primary">Start Learning With Her →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorInfo;
