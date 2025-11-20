import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeaturedCourses from './FeaturedCourses';

// Mock the useFeaturedCourses hook
vi.mock('../../controllers/useCourses', () => ({
  useFeaturedCourses: vi.fn()
}));

// Mock window.location.href
delete window.location;
window.location = { href: '', reload: vi.fn() };

const mockCourses = [
  {
    id: 'course-1',
    name: 'French Basics',
    tutor: 'Marie Dubois',
    duration: '8 weeks',
    description: 'Learn French basics',
    price: 199,
    originalPrice: 299,
    level: 'Beginner',
    image: '/test-image-1.jpg',
    paymentPlans: []
  },
  {
    id: 'course-2',
    name: 'Advanced French',
    tutor: 'Pierre Laurent',
    duration: '12 weeks',
    description: 'Advanced French course',
    price: 349,
    originalPrice: 449,
    level: 'Advanced',
    image: '/test-image-2.jpg',
    paymentPlans: []
  }
];

describe('FeaturedCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: [],
      loading: true,
      error: null
    });

    render(<FeaturedCourses />);
    
    expect(screen.getByText('Featured Courses')).toBeInTheDocument();
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading courses')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: 'Failed to load courses'
    });

    render(<FeaturedCourses />);
    
    expect(screen.getByText('Featured Courses')).toBeInTheDocument();
    expect(screen.getByText('Unable to load courses at the moment. Please try again later.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders empty state when no courses available', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null
    });

    render(<FeaturedCourses />);
    
    expect(screen.getByText('Featured Courses')).toBeInTheDocument();
    expect(screen.getByText('No courses available at the moment.')).toBeInTheDocument();
  });

  it('renders courses correctly when data is available', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null
    });

    render(<FeaturedCourses />);
    
    expect(screen.getByText('Featured Courses')).toBeInTheDocument();
    expect(screen.getByText('French Basics')).toBeInTheDocument();
    expect(screen.getByText('Advanced French')).toBeInTheDocument();
    expect(screen.getByText('View All Courses')).toBeInTheDocument();
  });

  it('handles View All Courses button click', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null
    });

    render(<FeaturedCourses />);
    
    const viewAllButton = screen.getByText('View All Courses');
    fireEvent.click(viewAllButton);
    
    expect(window.location.href).toBe('/courses');
  });

  it('handles View All Courses button keyboard navigation', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null
    });

    render(<FeaturedCourses />);
    
    const viewAllButton = screen.getByText('View All Courses');
    fireEvent.keyDown(viewAllButton, { key: 'Enter' });
    
    expect(window.location.href).toBe('/courses');
  });

  it('handles retry button click in error state', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: 'Failed to load courses'
    });

    render(<FeaturedCourses />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('respects limit prop', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null
    });

    render(<FeaturedCourses limit={2} />);
    
    expect(useFeaturedCourses).toHaveBeenCalledWith(2);
  });

  it('hides View All link when showViewAllLink is false', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null
    });

    render(<FeaturedCourses showViewAllLink={false} />);
    
    expect(screen.queryByText('View All Courses')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const { useFeaturedCourses } = require('../../controllers/useCourses');
    useFeaturedCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null
    });

    render(<FeaturedCourses />);
    
    expect(screen.getByLabelText('Featured courses')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});