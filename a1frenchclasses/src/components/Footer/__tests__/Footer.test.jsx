import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

const mockNavigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

const mockSocialLinks = [
  { platform: 'Facebook', url: 'https://facebook.com/a1frenchclasses', icon: '/icons/facebook.svg' },
  { platform: 'Twitter', url: 'https://twitter.com/a1frenchclasses', icon: '/icons/twitter.svg' },
  { platform: 'Instagram', url: 'https://instagram.com/a1frenchclasses', icon: '/icons/instagram.svg' }
];

const mockContactInfo = {
  email: 'info@a1frenchclasses.com',
  phone: '+1 (555) 123-4567',
  address: '123 French Street, Paris, France',
  hours: 'Mon-Fri: 9AM-6PM'
};

const mockCompanyInfo = {
  description: 'Learn French with confidence through our expert-led courses.',
  privacyPolicy: '/privacy',
  termsOfService: '/terms'
};

describe('Footer Component', () => {
  it('renders footer with logo text when no logo image provided', () => {
    render(<Footer />);
    
    expect(screen.getByText('A1frenchclasses')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders footer with logo image when provided', () => {
    const logoSrc = '/images/logo.png';
    render(<Footer logo={logoSrc} />);
    
    const logoImage = screen.getByAltText('A1frenchclasses');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', logoSrc);
  });

  it('displays company description when provided', () => {
    render(<Footer companyInfo={mockCompanyInfo} />);
    
    expect(screen.getByText(mockCompanyInfo.description)).toBeInTheDocument();
  });

  it('renders navigation links correctly', () => {
    render(<Footer navigationLinks={mockNavigationLinks} />);
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByLabelText('Footer navigation')).toBeInTheDocument();
    
    mockNavigationLinks.forEach(link => {
      const linkElement = screen.getByText(link.label);
      expect(linkElement).toBeInTheDocument();
      expect(linkElement.closest('a')).toHaveAttribute('href', link.href);
    });
  });

  it('renders social links correctly', () => {
    render(<Footer socialLinks={mockSocialLinks} />);
    
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    
    mockSocialLinks.forEach(social => {
      const socialLink = screen.getByLabelText(`Follow us on ${social.platform}`);
      expect(socialLink).toBeInTheDocument();
      expect(socialLink).toHaveAttribute('href', social.url);
      expect(socialLink).toHaveAttribute('target', '_blank');
      expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
      
      if (social.icon) {
        const iconImage = screen.getByAltText(social.platform);
        expect(iconImage).toHaveAttribute('src', social.icon);
      }
    });
  });

  it('renders contact information correctly', () => {
    render(<Footer contactInfo={mockContactInfo} />);
    
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Check email
    const emailLink = screen.getByLabelText(`Send email to ${mockContactInfo.email}`);
    expect(emailLink).toHaveAttribute('href', `mailto:${mockContactInfo.email}`);
    expect(screen.getByText(mockContactInfo.email)).toBeInTheDocument();
    
    // Check phone
    const phoneLink = screen.getByLabelText(`Call ${mockContactInfo.phone}`);
    expect(phoneLink).toHaveAttribute('href', 'tel:+1(555)123-4567');
    expect(screen.getByText(mockContactInfo.phone)).toBeInTheDocument();
    
    // Check address
    expect(screen.getByText(mockContactInfo.address)).toBeInTheDocument();
    
    // Check hours
    expect(screen.getByText(mockContactInfo.hours)).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} A1frenchclasses. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders legal links when provided', () => {
    render(<Footer companyInfo={mockCompanyInfo} />);
    
    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', mockCompanyInfo.privacyPolicy);
    
    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', mockCompanyInfo.termsOfService);
  });

  it('handles empty props gracefully', () => {
    render(<Footer />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('A1frenchclasses')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Should not render sections that have no data
    expect(screen.queryByText('Quick Links')).not.toBeInTheDocument();
    expect(screen.queryByText('Follow Us')).not.toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<Footer 
      navigationLinks={mockNavigationLinks}
      contactInfo={mockContactInfo}
    />);
    
    // Check main footer element
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    
    // Check navigation
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument();
    
    // Check address element
    const addressElement = screen.getByText(mockContactInfo.address).closest('address');
    expect(addressElement).toBeInTheDocument();
    
    // Check lists
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThan(0);
  });

  it('renders all sections when all props are provided', () => {
    render(<Footer 
      logo="/images/logo.png"
      companyInfo={mockCompanyInfo}
      navigationLinks={mockNavigationLinks}
      socialLinks={mockSocialLinks}
      contactInfo={mockContactInfo}
    />);
    
    // Check all sections are present
    expect(screen.getByAltText('A1frenchclasses')).toBeInTheDocument();
    expect(screen.getByText(mockCompanyInfo.description)).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });
});