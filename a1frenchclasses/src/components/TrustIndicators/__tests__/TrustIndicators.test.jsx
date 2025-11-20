import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrustIndicators from '../TrustIndicators';

// Mock the imageUtils
vi.mock('../../../utils/imageUtils', () => ({
  generateResponsiveImageUrl: vi.fn((url, width) => `${url}?w=${width}`)
}));

describe('TrustIndicators', () => {
  const mockCompanies = [
    {
      id: 'company-1',
      name: 'Microsoft',
      logo: '/images/companies/microsoft-logo.png',
      description: 'Global technology leader'
    },
    {
      id: 'company-2',
      name: 'Google',
      logo: '/images/companies/google-logo.png',
      description: 'Search and cloud services'
    }
  ];

  const mockStatistics = {
    studentsHelped: '10,000+',
    coursesOffered: '15+',
    successRate: '95%',
    yearsExperience: '8+'
  };

  it('renders trust indicators section with title', () => {
    render(<TrustIndicators />);
    
    expect(screen.getByRole('heading', { name: /trusted by leading companies/i })).toBeInTheDocument();
  });

  it('renders statistics when provided', () => {
    render(<TrustIndicators statistics={mockStatistics} />);
    
    expect(screen.getByText('10,000+')).toBeInTheDocument();
    expect(screen.getByText('Students Helped')).toBeInTheDocument();
    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('Courses Offered')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('8+')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
  });

  it('renders company logos when provided', () => {
    render(<TrustIndicators companies={mockCompanies} />);
    
    expect(screen.getByText(/professionals from these companies trust/i)).toBeInTheDocument();
    
    // Check for company logos (including duplicates for carousel)
    const microsoftLogos = screen.getAllByAltText('Microsoft logo');
    const googleLogos = screen.getAllByAltText('Google logo');
    
    expect(microsoftLogos).toHaveLength(2); // Original + duplicate
    expect(googleLogos).toHaveLength(2); // Original + duplicate
  });

  it('has proper accessibility attributes', () => {
    render(<TrustIndicators companies={mockCompanies} statistics={mockStatistics} />);
    
    // Check main heading
    const title = screen.getByRole('heading');
    expect(title).toHaveAttribute('id', 'trust-title');
    
    // Check statistics region
    const statsRegion = screen.getByRole('region', { name: /company statistics/i });
    expect(statsRegion).toBeInTheDocument();
    
    // Check logos region
    const logosRegion = screen.getByRole('region', { name: /trusted company logos/i });
    expect(logosRegion).toBeInTheDocument();
    
    // Check aria-labels for statistics
    expect(screen.getByLabelText('10,000+ students helped')).toBeInTheDocument();
    expect(screen.getByLabelText('15+ courses offered')).toBeInTheDocument();
  });

  it('handles image loading states correctly', async () => {
    render(<TrustIndicators companies={mockCompanies} />);
    
    const images = screen.getAllByRole('img');
    const firstImage = images[0];
    
    // Simulate image load start
    fireEvent.loadStart(firstImage);
    
    // Simulate image load complete
    fireEvent.load(firstImage);
    
    // The component should handle these events without errors
    expect(firstImage).toBeInTheDocument();
  });

  it('displays fallback when image fails to load', async () => {
    render(<TrustIndicators companies={mockCompanies} />);
    
    const images = screen.getAllByRole('img');
    const firstImage = images[0];
    
    // Simulate image error
    fireEvent.error(firstImage);
    
    await waitFor(() => {
      expect(screen.getByText('Microsoft')).toBeInTheDocument();
    });
  });

  it('renders with empty props gracefully', () => {
    render(<TrustIndicators />);
    
    expect(screen.getByRole('heading', { name: /trusted by leading companies/i })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /company statistics/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/professionals from these companies/i)).not.toBeInTheDocument();
  });

  it('renders partial statistics correctly', () => {
    const partialStats = {
      studentsHelped: '5,000+',
      successRate: '90%'
    };
    
    render(<TrustIndicators statistics={partialStats} />);
    
    expect(screen.getByText('5,000+')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.queryByText('Courses Offered')).not.toBeInTheDocument();
    expect(screen.queryByText('Years Experience')).not.toBeInTheDocument();
  });

  it('applies lazy loading to images', () => {
    render(<TrustIndicators companies={mockCompanies} />);
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('includes duplicate logos for carousel effect', () => {
    render(<TrustIndicators companies={mockCompanies} />);
    
    // Should have original logos + duplicates
    const microsoftElements = screen.getAllByLabelText(/Microsoft logo/i);
    const googleElements = screen.getAllByLabelText(/Google logo/i);
    
    expect(microsoftElements).toHaveLength(2);
    expect(googleElements).toHaveLength(2);
  });
});