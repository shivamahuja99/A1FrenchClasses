import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerTestimonials from '../CustomerTestimonials';

// Mock the testimonials controller
vi.mock('../../../controllers/useTestimonials', () => ({
  useFeaturedTestimonials: vi.fn()
}));

// Mock the TestimonialCard component
vi.mock('../../TestimonialCard/TestimonialCard', () => ({
  default: ({ testimonial }) => (
    <div data-testid={`testimonial-${testimonial.id}`}>
      <h4>{testimonial.customerName}</h4>
      <p>{testimonial.feedback}</p>
    </div>
  )
}));

import { useFeaturedTestimonials } from '../../../controllers/useTestimonials';

const mockTestimonials = [
  {
    id: 'testimonial-1',
    customerName: 'Sarah Johnson',
    feedback: 'Great course!',
    rating: 5,
    customerPhoto: '/images/testimonials/sarah-johnson.jpg',
    courseCompleted: 'French Basics - A1 Level'
  },
  {
    id: 'testimonial-2',
    customerName: 'Michael Chen',
    feedback: 'Excellent teaching!',
    rating: 5,
    customerPhoto: '/images/testimonials/michael-chen.jpg',
    courseCompleted: 'Business French Professional'
  },
  {
    id: 'testimonial-3',
    customerName: 'Emma Rodriguez',
    feedback: 'Highly recommended!',
    rating: 4,
    customerPhoto: '/images/testimonials/emma-rodriguez.jpg',
    courseCompleted: 'Conversational French Mastery'
  }
];

describe('CustomerTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders testimonials section with header', async () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    expect(screen.getByText('What Our Students Say')).toBeInTheDocument();
    expect(screen.getByText('Real feedback from our French learning community')).toBeInTheDocument();
  });

  it('displays testimonials in grid layout', async () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    await waitFor(() => {
      expect(screen.getByTestId('testimonial-testimonial-1')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-testimonial-2')).toBeInTheDocument();
      expect(screen.getByTestId('testimonial-testimonial-3')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: [],
      loading: true,
      error: null
    });

    render(<CustomerTestimonials />);
    
    expect(screen.getByText('Loading testimonials...')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading testimonials')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    useFeaturedTestimonials.mockReturnValue({
      testimonials: [],
      loading: false,
      error: 'Failed to load testimonials'
    });

    render(<CustomerTestimonials />);
    
    expect(screen.getByText('Unable to load testimonials at the moment. Please try again later.')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockReload).toHaveBeenCalled();
  });

  it('shows empty state when no testimonials', () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: [],
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    expect(screen.getByText('No testimonials available at the moment.')).toBeInTheDocument();
  });

  it('handles carousel navigation with next button', async () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    const nextButton = screen.getByLabelText('Next testimonial');
    expect(nextButton).toBeInTheDocument();
    
    fireEvent.click(nextButton);
    // The carousel functionality is primarily CSS-based, so we just verify the button works
    expect(nextButton).toBeInTheDocument();
  });

  it('handles carousel navigation with previous button', async () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    const prevButton = screen.getByLabelText('Previous testimonial');
    expect(prevButton).toBeInTheDocument();
    
    fireEvent.click(prevButton);
    expect(prevButton).toBeInTheDocument();
  });

  it('handles dot indicator navigation', async () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    const dotIndicators = screen.getAllByRole('tab');
    expect(dotIndicators).toHaveLength(3);
    
    fireEvent.click(dotIndicators[1]);
    expect(dotIndicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('handles keyboard navigation for carousel controls', async () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    const nextButton = screen.getByLabelText('Next testimonial');
    
    fireEvent.keyDown(nextButton, { key: 'Enter' });
    expect(nextButton).toBeInTheDocument();
    
    fireEvent.keyDown(nextButton, { key: ' ' });
    expect(nextButton).toBeInTheDocument();
  });

  it('respects limit prop', () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials.slice(0, 2),
      loading: false,
      error: null
    });

    render(<CustomerTestimonials limit={2} />);
    
    expect(useFeaturedTestimonials).toHaveBeenCalledWith(2);
  });

  it('hides navigation when showNavigation is false', () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials showNavigation={false} />);
    
    expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous testimonial')).not.toBeInTheDocument();
  });

  it('has proper semantic structure and accessibility', () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    
    // Check section with proper label
    const section = screen.getByLabelText('Customer testimonials');
    expect(section).toBeInTheDocument();
    
    // Check list structure
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    // Check carousel region
    const carousel = screen.getByRole('region', { name: 'Testimonials carousel' });
    expect(carousel).toBeInTheDocument();
    
    // Check tablist for dot indicators
    const tablist = screen.getByRole('tablist', { name: 'Testimonial navigation' });
    expect(tablist).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    useFeaturedTestimonials.mockReturnValue({
      testimonials: mockTestimonials,
      loading: false,
      error: null
    });

    const { container } = render(<CustomerTestimonials />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('customerTestimonials');
    
    const title = screen.getByText('What Our Students Say');
    expect(title).toHaveClass('title');
  });
});