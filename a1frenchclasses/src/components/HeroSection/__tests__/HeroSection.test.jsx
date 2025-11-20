import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  const defaultProps = {
    title: 'Master French with Confidence',
    subtitle: 'Join thousands of students who have transformed their French language skills',
    ctaText: 'Start Learning Today',
    backgroundImage: '/images/hero-background.jpg'
  };

  it('renders hero section with correct content', () => {
    render(<HeroSection {...defaultProps} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Master French with Confidence')).toBeInTheDocument();
    expect(screen.getByText(/Join thousands of students/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Learning Today/i })).toBeInTheDocument();
  });

  it('applies background image style correctly', () => {
    render(<HeroSection {...defaultProps} />);
    
    const heroSection = screen.getByRole('banner');
    expect(heroSection).toHaveStyle({
      backgroundImage: 'url(/images/hero-background.jpg)'
    });
  });

  it('has proper accessibility attributes', () => {
    render(<HeroSection {...defaultProps} />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveAttribute('id', 'hero-title');
    
    const subtitle = screen.getByText(/Join thousands of students/);
    expect(subtitle).toHaveAttribute('aria-describedby', 'hero-title');
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Start Learning Today - Navigate to courses');
  });

  it('calls custom onCtaClick when provided', () => {
    const mockOnCtaClick = vi.fn();
    render(<HeroSection {...defaultProps} onCtaClick={mockOnCtaClick} />);
    
    const ctaButton = screen.getByRole('button');
    fireEvent.click(ctaButton);
    
    expect(mockOnCtaClick).toHaveBeenCalledTimes(1);
  });

  it('scrolls to courses section when no custom handler provided', () => {
    // Mock getElementById and scrollIntoView
    const mockScrollIntoView = vi.fn();
    const mockElement = { scrollIntoView: mockScrollIntoView };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    
    render(<HeroSection {...defaultProps} />);
    
    const ctaButton = screen.getByRole('button');
    fireEvent.click(ctaButton);
    
    expect(document.getElementById).toHaveBeenCalledWith('featured-courses');
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('navigates to courses page when courses section not found', () => {
    // Mock getElementById to return null
    vi.spyOn(document, 'getElementById').mockReturnValue(null);
    
    // Mock window.location
    delete window.location;
    window.location = { href: '' };
    
    render(<HeroSection {...defaultProps} />);
    
    const ctaButton = screen.getByRole('button');
    fireEvent.click(ctaButton);
    
    expect(window.location.href).toBe('/courses');
  });

  it('renders with minimal props', () => {
    const minimalProps = {
      title: 'Test Title',
      ctaText: 'Click Me'
    };
    
    render(<HeroSection {...minimalProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
  });
});