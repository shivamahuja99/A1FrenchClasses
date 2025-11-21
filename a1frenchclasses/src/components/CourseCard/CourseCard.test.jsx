import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseCard from './CourseCard';

// Mock window.location.href
delete window.location;
window.location = { href: '' };

const mockCourse = {
  id: 1,
  title: 'Test French Course',
  instructor: 'Test Tutor',
  duration: '8 weeks',
  description: 'A test course description',
  price: 100,
  discount: 20,
  difficulty: 'Beginner',
  image: '/test-image.jpg',
  rating: 4.5,
  course_url: 'https://example.com/course-1'
};

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('Test French Course')).toBeInTheDocument();
    expect(screen.getByText('By Test Tutor')).toBeInTheDocument();
    expect(screen.getByText('8 weeks')).toBeInTheDocument();
    expect(screen.getByText('A test course description')).toBeInTheDocument();
    // Discounted price: 100 * (1 - 0.2) = 80
    expect(screen.getByText('$80.00')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('displays discount badge when discount is present', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('displays rating correctly', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('(4.5)')).toBeInTheDocument();
    // Check for stars (simplified check for presence)
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('handles click navigation', () => {
    render(<CourseCard course={mockCourse} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(window.location.href).toBe('https://example.com/course-1');
  });

  it('handles keyboard navigation', () => {
    render(<CourseCard course={mockCourse} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(window.location.href).toBe('https://example.com/course-1');
  });

  it('returns null when no course is provided', () => {
    const { container } = render(<CourseCard course={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('applies correct level badge class', () => {
    render(<CourseCard course={mockCourse} />);

    const levelBadge = screen.getByText('Beginner');
    expect(levelBadge.className).toContain('levelBeginner');
  });
});