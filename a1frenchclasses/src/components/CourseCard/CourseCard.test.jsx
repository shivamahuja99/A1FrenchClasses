import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseCard from './CourseCard';

// Mock window.location.href
delete window.location;
window.location = { href: '' };

const mockCourse = {
  id: 'test-course',
  name: 'Test French Course',
  tutor: 'Test Tutor',
  duration: '8 weeks',
  description: 'A test course description',
  price: 199,
  originalPrice: 299,
  level: 'Beginner',
  image: '/test-image.jpg',
  paymentPlans: [
    {
      type: 'Full Payment',
      amount: 199,
      duration: 'One-time'
    },
    {
      type: 'Monthly',
      amount: 67,
      duration: '3 months'
    }
  ]
};

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('Test French Course')).toBeInTheDocument();
    expect(screen.getByText('By Test Tutor')).toBeInTheDocument();
    expect(screen.getByText('8 weeks')).toBeInTheDocument();
    expect(screen.getByText('A test course description')).toBeInTheDocument();
    expect(screen.getByText('$199')).toBeInTheDocument();
    expect(screen.getByText('$299')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('displays discount percentage when original price is higher', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('-33%')).toBeInTheDocument();
  });

  it('shows payment plans when available', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('Payment options:')).toBeInTheDocument();
    expect(screen.getByText('Full Payment: $199')).toBeInTheDocument();
    expect(screen.getByText('Monthly: $67 / 3 months')).toBeInTheDocument();
  });

  it('handles click navigation', () => {
    render(<CourseCard course={mockCourse} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(window.location.href).toBe('/courses/test-course');
  });

  it('handles keyboard navigation', () => {
    render(<CourseCard course={mockCourse} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(window.location.href).toBe('/courses/test-course');
  });

  it('returns null when no course is provided', () => {
    const { container } = render(<CourseCard course={null} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies correct level badge class', () => {
    render(<CourseCard course={mockCourse} />);
    
    const levelBadge = screen.getByText('Beginner');
    expect(levelBadge).toHaveClass('levelBeginner');
  });

  it('handles image error gracefully', () => {
    render(<CourseCard course={mockCourse} />);
    
    const image = screen.getByAltText('Test French Course course thumbnail');
    fireEvent.error(image);
    
    expect(image.src).toContain('/images/placeholder-course.jpg');
  });
});