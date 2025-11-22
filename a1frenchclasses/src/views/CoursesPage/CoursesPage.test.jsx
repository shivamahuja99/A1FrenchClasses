import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CoursesPage from './CoursesPage';
import * as useCoursesDataModule from '../../controllers/useCoursesData';

// Mock the useCoursesData hook
vi.mock('../../controllers/useCoursesData');

// Mock child components
vi.mock('../../components', () => ({
    Header: () => <div data-testid="header">Header</div>,
    Footer: () => <div data-testid="footer">Footer</div>
}));

vi.mock('../../components/CourseCard/CourseCard', () => ({
    default: ({ course }) => <div data-testid="course-card">{course.title}</div>
}));

vi.mock('../../components/LoadingSkeleton/LoadingSkeleton', () => ({
    default: () => <div data-testid="loading-skeleton">Loading...</div>
}));

const mockCourses = [
    {
        id: 1,
        title: 'Complete French Course: Learn French for Beginners',
        description: 'Master the basics of French grammar, vocabulary, and pronunciation.',
        image: 'https://via.placeholder.com/300x200',
        rating: 4.8,
        price: 19.99,
        discount: 10,
        difficulty: 'Beginner',
        duration: '12 weeks',
        language: 'English',
        instructor: 'Marie Laurent',
        course_url: 'https://example.com/course-1'
    },
    {
        id: 2,
        title: 'Intermediate French: Mastering Conversation',
        description: 'Take your French to the next level with conversational skills.',
        image: 'https://via.placeholder.com/300x200',
        rating: 4.6,
        price: 29.99,
        discount: 15,
        difficulty: 'Intermediate',
        duration: '10 weeks',
        language: 'French',
        instructor: 'Jean-Pierre Dubois',
        course_url: 'https://example.com/course-2'
    }
];

describe('CoursesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state correctly', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: [],
            loading: true,
            error: null
        });

        render(<CoursesPage />);

        expect(screen.getByText('Our French Courses')).toBeInTheDocument();
        expect(screen.getByText('Loading courses...')).toBeInTheDocument();
        expect(screen.getByText('Loading course catalog...')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: [],
            loading: false,
            error: 'Failed to load courses'
        });

        render(<CoursesPage />);

        expect(screen.getByText('Unable to Load Courses')).toBeInTheDocument();
        expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('renders courses list correctly', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: mockCourses,
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        expect(screen.getByText('Our French Language Courses')).toBeInTheDocument();
        expect(screen.getByText('Complete French Course: Learn French for Beginners')).toBeInTheDocument();
        expect(screen.getByText('Intermediate French: Mastering Conversation')).toBeInTheDocument();
        expect(screen.getByText('2 Courses Available')).toBeInTheDocument();
    });

    it('displays course count correctly', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: mockCourses,
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        const statsContainer = screen.getByLabelText('Course statistics');
        expect(statsContainer).toHaveTextContent(/2.*Courses Available/i);
    });

    it('renders empty state when no courses available', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: [],
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        expect(screen.getByText('No courses available at the moment.')).toBeInTheDocument();
        expect(screen.getByText('Please check back later for new courses.')).toBeInTheDocument();
    });

    it('handles retry button click in error state', () => {
        const reloadMock = vi.fn();
        Object.defineProperty(window, 'location', {
            value: { reload: reloadMock },
            writable: true
        });

        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: [],
            loading: false,
            error: 'Network error'
        });

        render(<CoursesPage />);

        const retryButton = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(retryButton);

        expect(reloadMock).toHaveBeenCalled();
    });

    it('renders all course cards with correct data', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: mockCourses,
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        // Check that both courses are rendered
        mockCourses.forEach(course => {
            expect(screen.getByText(course.title)).toBeInTheDocument();
        });
    });

    it('renders header and footer components', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: mockCourses,
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        // Check for header and footer mocks
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('displays SEO-friendly page title and description', () => {
        vi.spyOn(useCoursesDataModule, 'useCoursesData').mockReturnValue({
            courses: mockCourses,
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        expect(screen.getByText('Our French Language Courses')).toBeInTheDocument();
        expect(screen.getByText(/Explore our comprehensive collection/i)).toBeInTheDocument();
    });
});
