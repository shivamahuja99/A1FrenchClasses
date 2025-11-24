import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TestimonialCard from '../TestimonialCard';

// Mock LazyImage and imageUtils
vi.mock('../LazyImage/LazyImage', () => ({
  default: ({ src, alt, className, ...props }) => (
    <img src={src} alt={alt} className={className} {...props} />
  )
}));

vi.mock('../../utils/imageUtils', () => ({
  generateOptimizedImagePaths: () => ({})
}));

const mockTestimonial = {
  id: 'testimonial-1',
  customerName: 'Sarah Johnson',
  feedback: 'A1frenchclasses transformed my French learning journey. The interactive lessons and personalized feedback helped me achieve fluency faster than I ever imagined.',
  rating: 5,
  customerPhoto: '/images/testimonials/sarah-johnson.jpg',
  courseCompleted: 'French Basics - A1 Level'
};

describe('TestimonialCard', () => {
  it('renders testimonial card with all content', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);

    // Check customer name
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();

    // Check feedback text
    expect(screen.getByText(/A1frenchclasses transformed my French learning journey/)).toBeInTheDocument();

    // Check course completed
    expect(screen.getByText('French Basics - A1 Level')).toBeInTheDocument();

    // Check rating display
    expect(screen.getByLabelText('Rating: 5 out of 5 stars')).toBeInTheDocument();
    expect(screen.getByText('(5/5)')).toBeInTheDocument();
  });

  it('renders customer photo with correct alt text', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);

    const photo = screen.getByAltText('Sarah Johnson, satisfied student');
    expect(photo).toBeInTheDocument();
    expect(photo).toHaveAttribute('src', '/images/testimonials/sarah-johnson.jpg');
  });

  it('renders star rating correctly for full stars', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);

    const starRating = screen.getByRole('img', { name: 'Rating: 5 out of 5 stars' });
    expect(starRating).toBeInTheDocument();
  });

  it('renders star rating correctly for partial rating', () => {
    const partialRatingTestimonial = {
      ...mockTestimonial,
      rating: 4.5
    };

    render(<TestimonialCard testimonial={partialRatingTestimonial} />);

    const starRating = screen.getByRole('img', { name: 'Rating: 4.5 out of 5 stars' });
    expect(starRating).toBeInTheDocument();
    expect(screen.getByText('(4.5/5)')).toBeInTheDocument();
  });

  it('renders star rating correctly for lower rating', () => {
    const lowerRatingTestimonial = {
      ...mockTestimonial,
      rating: 3
    };

    render(<TestimonialCard testimonial={lowerRatingTestimonial} />);

    const starRating = screen.getByRole('img', { name: 'Rating: 3 out of 5 stars' });
    expect(starRating).toBeInTheDocument();
    expect(screen.getByText('(3/5)')).toBeInTheDocument();
  });

  it('renders feedback as blockquote with proper formatting', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);

    const feedbackText = screen.getByText(/"A1frenchclasses transformed my French learning journey/);
    expect(feedbackText).toBeInTheDocument();
    expect(feedbackText.closest('blockquote')).toBeInTheDocument();
  });

  it('has proper semantic structure with article role', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('handles missing testimonial prop gracefully', () => {
    const { container } = render(<TestimonialCard testimonial={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalTestimonial = {
      id: 'testimonial-minimal',
      customerName: 'John Doe',
      feedback: 'Great course!',
      rating: 4
    };

    render(<TestimonialCard testimonial={minimalTestimonial} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('"Great course!"')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating: 4 out of 5 stars')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} />);

    const card = container.querySelector('article');
    expect(card).toHaveClass('testimonialCard');

    const photo = screen.getByAltText('Sarah Johnson, satisfied student');
    expect(photo).toHaveClass('customerPhoto');

    const name = screen.getByText('Sarah Johnson');
    expect(name).toHaveClass('customerName');
  });

  it('has proper accessibility attributes', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);

    // Check ARIA label for star rating
    const starRating = screen.getByLabelText('Rating: 5 out of 5 stars');
    expect(starRating).toHaveAttribute('role', 'img');

    // Check article role
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });
});