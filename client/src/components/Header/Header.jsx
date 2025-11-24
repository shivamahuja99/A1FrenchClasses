import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ logo, navigationItems = [], authComponent = null }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  // Helper to normalize href - if we're not on homepage and href is a hash, prepend '/'
  const getNormalizedHref = (href) => {
    if (href && href.startsWith('#') && location.pathname !== '/') {
      return `/${href}`;
    }
    return href;
  };

  // Helper to check if a navigation item is active
  const isActive = (href) => {
    if (!href) return false;

    // Special handling for home route
    if (href === '/') {
      // Home is only active when on homepage with NO hash
      return location.pathname === '/' && !location.hash;
    }

    // For hash links (like #aboutus)
    if (href.startsWith('#')) {
      return location.pathname === '/' && location.hash === href;
    }

    // For hash links with slash (like /#aboutus)
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.substring(1);
    }

    // For other routes, check if pathname matches
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Handle navigation link clicks - scroll to top for home
  const handleNavLinkClick = (e, href) => {
    // If clicking on home link
    if (href === '/') {
      // If already on homepage, scroll to top and clear hash
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState('', document.title, window.location.pathname);
      }
    }
    // Close mobile menu if open
    handleNavClick();
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
          <Link
            to="/"
            aria-label="A1frenchclasses - Return to homepage"
            onClick={(e) => handleNavLinkClick(e, '/')}
          >
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
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onClick={(e) => handleNavLinkClick(e, item.href)}
                    tabIndex={0}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={getNormalizedHref(item.href)}
                    className={styles.navLink}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    tabIndex={0}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Section */}
        <div className={styles.authSection}>
          {authComponent || (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/signup" className={styles.signupButton}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

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
                    onClick={(e) => handleNavLinkClick(e, item.href)}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={getNormalizedHref(item.href)}
                    className={styles.mobileNavLink}
                    onClick={handleNavClick}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Auth Section */}
          <div className={styles.mobileAuthSection}>
            {authComponent == null ? <div className={styles.mobileAuthButtons}>
              <Link
                to="/login"
                className={styles.mobileLoginButton}
                onClick={handleNavClick}
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={styles.mobileSignupButton}
                onClick={handleNavClick}
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                Sign Up
              </Link>
            </div>
              : <div></div>}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;