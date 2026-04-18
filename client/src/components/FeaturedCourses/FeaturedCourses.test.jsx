import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FeaturedCourses from './FeaturedCourses';

vi.mock('../../store/api/apiSlice', () => ({
  useGetCoursesQuery: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className, style }) => (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  )
}));

import { useGetCoursesQuery } from '../../store/api/apiSlice';

describe('FeaturedCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    useGetCoursesQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });

    render(<FeaturedCourses />);
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
  });

  it('renders API data and uses this_includes from DB payload', () => {
    useGetCoursesQuery.mockReturnValue({
      data: [
        {
          id: 'course-1',
          name: 'CLB 5 Foundation',
          description: 'Description',
          duration: '4 months',
          price: 1500,
          discount: 0,
          this_includes: ['5 live classes weekly', '10+ mocks']
        }
      ],
      isLoading: false,
      error: null
    });

    render(<FeaturedCourses />);
    expect(screen.getByText('CLB 5 Foundation')).toBeInTheDocument();
    expect(screen.getByText('5 live classes weekly')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Course' })).toHaveAttribute('href', '/courses/course-1');
  });
});
