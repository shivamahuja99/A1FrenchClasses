import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useHomepageData } from '../../../controllers/useHomepageData';
import HomePage from '../HomePage';
import authReducer from '../../../store/slices/authSlice';
import uiReducer from '../../../store/slices/uiSlice';
import { apiSlice } from '../../../store/api/apiSlice';

// Mock the useHomepageData hook
vi.mock('../../../controllers/useHomepageData', () => ({
  useHomepageData: vi.fn()
}));

// Mock the components
vi.mock('../../../components', () => ({
  Header: ({ logo, navigationItems }) => (
    <header data-testid="header">
      <div>Logo: {logo || 'A1frenchclasses'}</div>
      <nav>
        {navigationItems?.map((item, index) => (
          <a key={index} href={item.href}>{item.label}</a>
        ))}
      </nav>
    </header>
  ),
  Footer: ({ logo, companyInfo, contactInfo }) => (
    <footer data-testid="footer">
      <div>Logo: {logo || 'A1frenchclasses'}</div>
      <div>Email: {contactInfo?.email}</div>
      <div>Description: {companyInfo?.description}</div>
    </footer>
  ),
  HeroSection: ({ title, subtitle, ctaText, backgroundImage }) => (
    <section data-testid="hero-section">
      <h1>{title || 'Master French with Confidence'}</h1>
      <p>{subtitle || 'Join thousands of students who have transformed their French language skills with our expert-led courses and proven methodology.'}</p>
      <button>{ctaText || 'Start Learning Today'}</button>
      {backgroundImage && <img src={backgroundImage} alt="French learning environment" />}
    </section>
  ),
  TrustIndicators: () => (
    <section data-testid="trust-indicators">
      <h2>Trusted by Companies</h2>
    </section>
  ),
  CompanyStory: ({ teamImage }) => (
    <section data-testid="company-story">
      <h2>Our Story</h2>
      <p>We believe that learning French should be engaging and effective.</p>
      {teamImage && <img src={teamImage} alt="Our team" />}
    </section>
  ),
  FeaturedCourses: () => (
    <section data-testid="featured-courses">
      <h2>Featured Courses</h2>
    </section>
  ),
  CustomerTestimonials: () => (
    <section data-testid="customer-testimonials">
      <h2>What Our Students Say</h2>
    </section>
  ),
  ErrorBoundary: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

// Mock ProfileDropdown since it's used in HomePage
vi.mock('../../../components/ProfileDropdown/ProfileDropdown', () => ({
  default: () => <div data-testid="profile-dropdown">Profile Dropdown</div>
}));

const mockHomepageData = {
  navigation: {
    logo: '/images/logo.png',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  hero: {
    title: 'Master French with Confidence',
    subtitle: 'Join thousands of students who have transformed their French language skills with our expert-led courses and proven methodology.',
    ctaText: 'Start Learning Today',
    backgroundImage: '/images/hero-background.jpg'
  },
  companyStory: {
    title: 'Our Story',
    mission: 'We believe that learning French should be engaging and effective.',
    story: 'What started as a small language school has grown into a global platform.',
    teamImage: '/images/team-photo.jpg',
    statistics: {
      studentsHelped: '10,000+',
      coursesOffered: '15+',
      successRate: '95%',
      yearsExperience: '8+'
    }
  }
};

const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    useHomepageData.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    renderWithProvider(<HomePage />);

    expect(screen.getByText('Loading homepage content...')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    useHomepageData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load data'
    });

    renderWithProvider(<HomePage />);

    expect(screen.getByText('Error Loading Page')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders homepage with all sections when data is loaded', async () => {
    useHomepageData.mockReturnValue({
      data: mockHomepageData,
      loading: false,
      error: null
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      // Check Header and Footer are rendered
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();

      // Check all main sections are rendered
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('trust-indicators')).toBeInTheDocument();
      expect(screen.getByTestId('company-story')).toBeInTheDocument();
      expect(screen.getByTestId('featured-courses')).toBeInTheDocument();
      expect(screen.getByTestId('customer-testimonials')).toBeInTheDocument();

      // Check Hero section content
      expect(screen.getByText('Master French with Confidence')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of students who have transformed their French language skills with our expert-led courses and proven methodology.')).toBeInTheDocument();
      expect(screen.getByText('Start Learning Today')).toBeInTheDocument();

      // Check that error boundaries are present
      expect(screen.getAllByTestId('error-boundary')).toHaveLength(5);
    });
  });

  it('renders with default values when data is missing', async () => {
    useHomepageData.mockReturnValue({
      data: {},
      loading: false,
      error: null
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      // Should render with default hero content
      expect(screen.getByText('Master French with Confidence')).toBeInTheDocument();
      expect(screen.getByText(/Join thousands of students who have transformed/)).toBeInTheDocument();
      expect(screen.getByText('Start Learning Today')).toBeInTheDocument();

      // Should render all sections
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('trust-indicators')).toBeInTheDocument();
      expect(screen.getByTestId('company-story')).toBeInTheDocument();
      expect(screen.getByTestId('featured-courses')).toBeInTheDocument();
      expect(screen.getByTestId('customer-testimonials')).toBeInTheDocument();
    });
  });

  it('renders hero image when provided', async () => {
    useHomepageData.mockReturnValue({
      data: mockHomepageData,
      loading: false,
      error: null
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      const heroImage = screen.getByAltText('French learning environment');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src', '/images/hero-background.jpg');
    });
  });

  it('renders team image when provided', async () => {
    useHomepageData.mockReturnValue({
      data: mockHomepageData,
      loading: false,
      error: null
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      const teamImage = screen.getByAltText('Our team');
      expect(teamImage).toBeInTheDocument();
      expect(teamImage).toHaveAttribute('src', '/images/team-photo.jpg');
    });
  });

  it('renders all sections regardless of data availability', async () => {
    const dataWithoutStory = {
      ...mockHomepageData,
      companyStory: {}
    };

    useHomepageData.mockReturnValue({
      data: dataWithoutStory,
      loading: false,
      error: null
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      // All sections should still render as they are now separate components
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('trust-indicators')).toBeInTheDocument();
      expect(screen.getByTestId('company-story')).toBeInTheDocument();
      expect(screen.getByTestId('featured-courses')).toBeInTheDocument();
      expect(screen.getByTestId('customer-testimonials')).toBeInTheDocument();
    });
  });

  it('has proper semantic HTML structure', async () => {
    useHomepageData.mockReturnValue({
      data: mockHomepageData,
      loading: false,
      error: null
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });
});