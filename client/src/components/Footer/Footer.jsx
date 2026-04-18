import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footGrid}>
                    <div>
                        <Link to="/" className={styles.logo}>
                            <span className={styles.logoMark}>A1</span>
                            <span>A1 French Classes</span>
                        </Link>
                        <p className={styles.desc}>Canada's trusted online French coaching for PR aspirants. 5 live classes a week. 98% TEF/TCF pass rate.</p>
                        <div className={styles.socials}>
                            <a href="#" aria-label="Instagram">📷</a>
                            <a href="#" aria-label="YouTube">▶</a>
                            <a href="#" aria-label="Facebook">f</a>
                            <a href="#" aria-label="LinkedIn">in</a>
                        </div>
                    </div>
                    <div>
                        <h4>Courses</h4>
                        <Link to="/courses/9577b728-e64b-43a9-b822-7ae5e8eebbba">CLB 5 Foundation</Link>
                        <Link to="/courses/3ac37cc0-dc58-499b-934e-349b7b59ea22">CLB 7 PR Mastery</Link>
                        <a href="#">Free Placement Test</a>
                    </div>
                    <div>
                        <h4>Resources</h4>
                        <a href="#">TEF vs TCF Guide</a>
                        <a href="#">CRS Points Calculator</a>
                        <a href="#">Sample Mock Exam</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div>
                        <h4>Contact</h4>
                        <a href="mailto:hello@a1frenchclasses.ca">hello@a1frenchclasses.ca</a>
                        <a href="#">+1 (XXX) XXX-XXXX</a>
                        <a href="#">WhatsApp us</a>
                        <a href="#">Book a free call</a>
                    </div>
                </div>
                <div className={styles.footBottom}>
                    © 2026 A1 French Classes · All rights reserved · Made with ❤️ for future Canadians
                </div>
            </div>
        </footer>
    );
};

export default Footer;