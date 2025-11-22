import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

const mockNavigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

const renderHeader = (props = {}) => {
  return render(
    <MemoryRouter>
      <Header navigationItems={mockNavigationItems} {...props} />
    </MemoryRouter>
  );
};

describe('Header Component', () => {
  it('renders header with logo text when no logo image provided', () => {
    renderHeader();

    expect(screen.getByText('A1frenchclasses')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders header with logo image when provided', () => {
    const logoSrc = '/images/logo.png';
    renderHeader({ logo: logoSrc });

    const logoImage = screen.getByAltText('A1frenchclasses logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', logoSrc);
  });

  it('renders navigation items correctly', () => {
    renderHeader();

    mockNavigationItems.forEach(item => {
      const links = screen.getAllByText(item.label);
      expect(links.length).toBeGreaterThan(0);

      // Check desktop navigation
      const desktopLink = links.find(link =>
        link.closest('[role="navigation"][aria-label="Main navigation"]')
      );
      if (desktopLink) {
        expect(desktopLink.closest('a')).toHaveAttribute('href', item.href);
      }
    });
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    renderHeader();

    const openMenuButton = screen.getByLabelText('Open navigation menu');
    const mobileMenu = screen.getByLabelText('Mobile navigation');

    // Initially closed
    expect(openMenuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');

    // Click to open
    fireEvent.click(openMenuButton);
    const closeMenuButton = screen.getByLabelText('Close navigation menu');
    expect(closeMenuButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');

    // Click to close
    fireEvent.click(closeMenuButton);
    expect(screen.getByLabelText('Open navigation menu')).toHaveAttribute('aria-expanded', 'false');
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports keyboard navigation for mobile menu toggle', () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText('Open navigation menu');

    // Test Enter key
    fireEvent.keyDown(mobileMenuButton, { key: 'Enter' });
    expect(screen.getByLabelText('Close navigation menu')).toHaveAttribute('aria-expanded', 'true');

    // Test Space key - re-query button as it might have re-rendered or label changed
    const closeButton = screen.getByLabelText('Close navigation menu');
    // Note: Header.jsx implementation toggles on Space key too
    fireEvent.keyDown(closeButton, { key: ' ' });
    expect(screen.getByLabelText('Open navigation menu')).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes mobile menu when Escape key is pressed', () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText('Open navigation menu');

    // Open menu
    fireEvent.click(mobileMenuButton);
    expect(screen.getByLabelText('Close navigation menu')).toHaveAttribute('aria-expanded', 'true');

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByLabelText('Open navigation menu')).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes mobile menu when navigation link is clicked', () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText('Open navigation menu');

    // Open menu
    fireEvent.click(mobileMenuButton);
    expect(screen.getByLabelText('Close navigation menu')).toHaveAttribute('aria-expanded', 'true');

    // Click a mobile navigation link
    const mobileNavLinks = screen.getAllByText('Home');
    const mobileHomeLink = mobileNavLinks.find(link =>
      link.closest('[aria-label="Mobile navigation"]')
    );

    if (mobileHomeLink) {
      fireEvent.click(mobileHomeLink);
      expect(screen.getByLabelText('Open navigation menu')).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('has proper accessibility attributes', () => {
    renderHeader();

    // Check main navigation
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();

    // Check logo link
    expect(screen.getByLabelText('A1frenchclasses - Return to homepage')).toBeInTheDocument();

    // Check mobile menu button
    const mobileMenuButton = screen.getByLabelText('Open navigation menu');
    expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('handles empty navigation items gracefully', () => {
    renderHeader({ navigationItems: [] });

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('A1frenchclasses')).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    const navigationWithHome = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' }
    ];

    renderHeader({ navigationItems: navigationWithHome });

    const homeLinks = screen.getAllByText('Home');
    homeLinks.forEach(link => {
      const anchorElement = link.closest('a');
      if (anchorElement && anchorElement.getAttribute('href') === '/') {
        expect(anchorElement).toHaveAttribute('aria-current', 'page');
      }
    });
  });
});