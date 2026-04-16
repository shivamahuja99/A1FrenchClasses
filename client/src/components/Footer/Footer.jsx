import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

const Footer = ({
  logo,
  companyInfo = {},
  navigationLinks = [],
  socialLinks = [],
  contactInfo = {}
}) => {
  const currentYear = new Date().getFullYear();

  // Fallback links if none provided
  const links = navigationLinks.length > 0 ? navigationLinks : [
    { label: 'Programs', href: '/courses' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact-us' }
  ];

  return (
    <footer id="footer" className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Company Section */}
          <div className={styles.companySection}>
            <div className={styles.logo}>
              {logo ? (
                <img src={logo} alt="A1 French Classes logo" className={styles.logoImage} />
              ) : (
                <span className={styles.logoText}>A1 FRENCH CLASSES</span>
              )}
            </div>
            <p className={styles.companyDescription}>
              {companyInfo.description || 'Learn French with confidence through our expert-led courses and proven methodology.'}
            </p>
            
            <div className={styles.socialLinks}>
              <h3 className={styles.sectionTitle}>Connect</h3>
              <ul className={styles.socialList} role="list">
                {socialLinks.map((social, index) => (
                  <li key={index} className={styles.socialItem}>
                    <a href={social.url} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <span className="sr-only">{social.platform}</span>
                      {/* Using platform name as placeholder for icons */}
                      <span style={{fontSize: '0.8rem', fontWeight: 800}}>{social.platform.substring(0, 2).toUpperCase()}</span>
                    </a>
                  </li>
                ))}
                {socialLinks.length === 0 && (
                  <>
                    <li className={styles.socialItem}><a href="#" className={styles.socialLink}>FB</a></li>
                    <li className={styles.socialItem}><a href="#" className={styles.socialLink}>TW</a></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Programs</h3>
            <nav role="navigation">
              <ul className={styles.linksList} role="list">
                {links.map((link, index) => (
                  <li key={index} className={styles.linkItem}>
                    <Link to={link.href} className={styles.footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact Information Section */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Toronto Studio</h3>
            <address className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <a href={`mailto:${contactInfo.email || 'hello@a1frenchclasses.ca'}`} className={styles.contactLink}>
                  {contactInfo.email || 'hello@a1frenchclasses.ca'}
                </a>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Location</span>
                <span className={styles.contactText}>{contactInfo.address || 'Toronto, ON Canada'}</span>
              </div>
            </address>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>© {currentYear} A1 FRENCH CLASSES. All rights reserved.</p>
          </div>
          <nav className={styles.legalLinks} aria-label="Legal">
            <Link to="/privacy" className={styles.legalLink}>Privacy</Link>
            <Link to="/terms" className={styles.legalLink}>Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;