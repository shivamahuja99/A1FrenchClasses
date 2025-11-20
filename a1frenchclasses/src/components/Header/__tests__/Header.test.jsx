import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../Header';

const mockNavigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

describe('Header Component', () => {
  it('renders header with logo text when no logo image provided', () => {
    render(<Header navigationItems={mockNavigationItems} />);
    
    expect(screen.getByText('A1frenchclasses')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders header with logo image when provided', () => {
    const logoSrc = '/images/logo.png';
    render(<Header logo={logoSrc} navigationItems={mockNavigationItems} />);
    
    const logoImage = screen.getByAltText('A1frenchclasses');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', logoSrc);
  });

  it('renders navigation items correctly', () => {
    render(<Header navigationItems={mockNavigationItems} />);
    
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
    render(<Header navigationItems={mockNavigationItems} />);
    
    const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
    const mobileMenu = screen.getByLabelText('Mobile navigation');
    
    // Initially closed
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
    
    // Click to open
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');
    
    // Click to close
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports keyboard navigation for mobile menu toggle', () => {
    render(<Header navigationItems={mockNavigationItems} />);
    
    const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
    
    // Test Enter key
    fireEvent.keyDown(mobileMenuButton, { key: 'Enter' });
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Test Space key
    fireEvent.keyDown(mobileMenuButton, { key: ' ' });
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes mobile menu when Escape key is pressed', () => {
    render(<Header navigationItems={mockNavigationItems} />);
    
    const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
    
    // Open menu
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes mobile menu when navigation link is clicked', () => {
    render(<Header navigationItems={mockNavigationItems} />);
    
    const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
    
    // Open menu
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click a mobile navigation link
    const mobileNavLinks = screen.getAllByText('Home');
    const mobileHomeLink = mobileNavLinks.find(link => 
      link.closest('[aria-label="Mobile navigation"]')
    );
    
    if (mobileHomeLink) {
      fireEvent.click(mobileHomeLink);
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('has proper accessibility attributes', () => {
    render(<Header navigationItems={mockNavigationItems} />);
    
    // Check main navigation
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
    
    // Check logo link
    expect(screen.getByLabelText('A1frenchclasses - Home')).toBeInTheDocument();
    
    // Check mobile menu button
    const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
    expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('handles empty navigation items gracefully', () => {
    render(<Header navigationItems={[]} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('A1frenchclasses')).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    const navigationWithHome = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' }
    ];
    
    render(<Header navigationItems={navigationWithHome} />);
    
    const homeLinks = screen.getAllByText('Home');
    homeLinks.forEach(link => {
      const anchorElement = link.closest('a');
      if (anchorElement && anchorElement.getAttribute('href') === '/') {
        expect(anchorElement).toHaveAttribute('aria-current', 'page');
      }
    });
  });
});