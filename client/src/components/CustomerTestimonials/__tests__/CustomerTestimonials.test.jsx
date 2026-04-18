import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerTestimonials from '../CustomerTestimonials';

vi.mock('../../../store/api/apiSlice', () => ({
  useGetReviewsQuery: vi.fn()
}));

import { useGetReviewsQuery } from '../../../store/api/apiSlice';

describe('CustomerTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    useGetReviewsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });

    render(<CustomerTestimonials />);
    expect(screen.getByText('Loading testimonials...')).toBeInTheDocument();
  });

  it('renders testimonials from DB-backed home content payload', () => {
    useGetReviewsQuery.mockReturnValue({
      data: [
        {
          id: 1,
          rating: 5,
          testimonial_tag: 'TEF · CLB 7',
          comment: 'Great experience',
          testimonial_role: 'Engineer',
          user: { name: 'Arjun P.' }
        }
      ],
      isLoading: false,
      error: null
    });

    render(<CustomerTestimonials />);
    expect(screen.getByText('Arjun P.')).toBeInTheDocument();
    expect(screen.getByText('"Great experience"')).toBeInTheDocument();
    expect(screen.getByText('TEF · CLB 7')).toBeInTheDocument();
  });
});
