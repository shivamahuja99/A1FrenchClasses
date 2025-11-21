import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ logo, navigationItems = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest(`.${styles.header}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Helper to determine if link is internal (route) or external (anchor/hash)
  const isInternalRoute = (href) => {
    return href && !href.startsWith('#') && !href.startsWith('http');
  };

  return (
    <header className={styles.header} role="banner">
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link to="/" aria-label="A1frenchclasses - Return to homepage">
            {logo ? (
              <img
                src={logo}
                alt="A1frenchclasses logo"
                className={styles.logoImage}
                width="120"
                height="40"
              />
            ) : (
              <span className={styles.logoText}>A1frenchclasses</span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} role="navigation" aria-label="Main navigation">
          <ul className={styles.navList} role="menubar">
            {navigationItems.map((item, index) => (
              <li key={index} className={styles.navItem} role="none">
                {isInternalRoute(item.href) ? (
                  <Link
                    to={item.href}
                    className={styles.navLink}
                    role="menuitem"
                    aria-current={item.href === '/' ? 'page' : undefined}
                    tabIndex={0}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={styles.navLink}
                    role="menuitem"
                    aria-current={item.href === '/' ? 'page' : undefined}
                    tabIndex={0}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          onKeyDown={(e) => handleKeyDown(e, toggleMobileMenu)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-haspopup="true"
        >
          <span className={styles.hamburger} aria-hidden="true">
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </span>
          <span className="sr-only">
            {isMobileMenuOpen ? "Close menu" : "Open menu"}
          </span>
        </button>

        {/* Mobile Navigation */}
        <nav
          id="mobile-menu"
          className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}
          role="navigation"
          aria-label="Mobile navigation"
          aria-hidden={!isMobileMenuOpen}
        >
          <ul className={styles.mobileNavList} role="menu">
            {navigationItems.map((item, index) => (
              <li key={index} className={styles.mobileNavItem} role="none">
                {isInternalRoute(item.href) ? (
                  <Link
                    to={item.href}
                    className={styles.mobileNavLink}
                    onClick={handleNavClick}
                    role="menuitem"
                    aria-current={item.href === '/' ? 'page' : undefined}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={styles.mobileNavLink}
                    onClick={handleNavClick}
                    role="menuitem"
                    aria-current={item.href === '/' ? 'page' : undefined}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;