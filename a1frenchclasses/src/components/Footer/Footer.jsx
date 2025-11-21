import styles from './Footer.module.css';

const Footer = ({
  logo,
  companyInfo = {},
  navigationLinks = [],
  socialLinks = [],
  contactInfo = {}
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Company Section */}
          <div className={styles.companySection}>
            <div className={styles.logo}>
              {logo ? (
                <img src={logo} alt="A1frenchclasses" className={styles.logoImage} />
              ) : (
                <span className={styles.logoText}>A1frenchclasses</span>
              )}
            </div>
            {companyInfo.description && (
              <p className={styles.companyDescription}>
                {companyInfo.description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className={styles.socialLinks}>
                <h3 className={styles.sectionTitle} id="social-links-title">Follow Us</h3>
                <ul className={styles.socialList} role="list" aria-labelledby="social-links-title">
                  {socialLinks.map((social, index) => (
                    <li key={index} className={styles.socialItem}>
                      <a
                        href={social.url}
                        className={styles.socialLink}
                        aria-label={`Follow A1frenchclasses on ${social.platform} (opens in new window)`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.icon ? (
                          <img
                            src={social.icon}
                            alt=""
                            className={styles.socialIcon}
                            width="20"
                            height="20"
                            aria-hidden="true"
                          />
                        ) : (
                          <span>{social.platform}</span>
                        )}
                        <span className="sr-only">{social.platform}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Links Section */}
          {navigationLinks.length > 0 && (
            <div className={styles.linksSection}>
              <h3 className={styles.sectionTitle} id="quick-links-title">Quick Links</h3>
              <nav role="navigation" aria-labelledby="quick-links-title">
                <ul className={styles.linksList} role="list">
                  {navigationLinks.map((link, index) => (
                    <li key={index} className={styles.linkItem}>
                      <a
                        href={link.href}
                        className={styles.footerLink}
                        aria-describedby="quick-links-title"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}

          {/* Contact Information Section */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle} id="contact-title">Contact Us</h3>
            <address className={styles.contactInfo} aria-labelledby="contact-title">
              {contactInfo.email && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel} id="email-label">Email:</span>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className={styles.contactLink}
                    aria-labelledby="email-label"
                    aria-describedby="contact-title"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel} id="phone-label">Phone:</span>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                    className={styles.contactLink}
                    aria-labelledby="phone-label"
                    aria-describedby="contact-title"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.address && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel} id="address-label">Address:</span>
                  <span
                    className={styles.contactText}
                    aria-labelledby="address-label"
                  >
                    {contactInfo.address}
                  </span>
                </div>
              )}
              {contactInfo.hours && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel} id="hours-label">Hours:</span>
                  <span
                    className={styles.contactText}
                    aria-labelledby="hours-label"
                  >
                    {contactInfo.hours}
                  </span>
                </div>
              )}
            </address>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p id="copyright-info">
              © {currentYear} A1frenchclasses. All rights reserved.
            </p>
          </div>
          {(companyInfo.privacyPolicy || companyInfo.termsOfService) && (
            <nav className={styles.legalLinks} aria-label="Legal information">
              {companyInfo.privacyPolicy && (
                <a
                  href={companyInfo.privacyPolicy}
                  className={styles.legalLink}
                  aria-describedby="copyright-info"
                >
                  Privacy Policy
                </a>
              )}
              {companyInfo.termsOfService && (
                <a
                  href={companyInfo.termsOfService}
                  className={styles.legalLink}
                  aria-describedby="copyright-info"
                >
                  Terms of Service
                </a>
              )}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;