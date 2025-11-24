import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CompanyStory from '../CompanyStory';

// Mock the imageUtils
vi.mock('../../../utils/imageUtils', () => ({
  generateResponsiveImageUrl: vi.fn((url, width) => `${url}?w=${width}`)
}));

describe('CompanyStory', () => {
  const defaultProps = {
    title: 'Our Story',
    mission: 'At A1frenchclasses, we believe that learning French should be engaging, effective, and accessible to everyone.',
    story: 'What started as a small language school in Paris has grown into a global online platform trusted by professionals worldwide.',
    teamImage: '/images/team-photo.jpg',
    statistics: {
      studentsHelped: '10,000+',
      yearsExperience: '8+'
    }
  };

  it('renders company story section with all content', () => {
    render(<CompanyStory {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument();
    expect(screen.getByText(/our mission/i)).toBeInTheDocument();
    expect(screen.getByText(/learning french should be engaging/i)).toBeInTheDocument();
    expect(screen.getByText(/what started as a small language school/i)).toBeInTheDocument();
  });

  it('renders statistics when provided', () => {
    render(<CompanyStory {...defaultProps} />);
    
    expect(screen.getByText('10,000+')).toBeInTheDocument();
    expect(screen.getByText('Students Transformed')).toBeInTheDocument();
    expect(screen.getByText('8+')).toBeInTheDocument();
    expect(screen.getByText('Years of Excellence')).toBeInTheDocument();
  });

  it('renders team image with proper attributes', () => {
    render(<CompanyStory {...defaultProps} />);
    
    const image = screen.getByRole('img', { name: /team members working together/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('src', '/images/team-photo.jpg?w=600');
  });

  it('has proper accessibility attributes', () => {
    render(<CompanyStory {...defaultProps} />);
    
    // Check main heading
    const title = screen.getByRole('heading', { name: /our story/i });
    expect(title).toHaveAttribute('id', 'story-title');
    
    // Check statistics region
    const statsRegion = screen.getByRole('region', { name: /key achievements/i });
    expect(statsRegion).toBeInTheDocument();
  });

  it('handles image loading and error states', async () => {
    render(<CompanyStory {...defaultProps} />);
    
    const image = screen.getByRole('img');
    
    // Simulate image error
    fireEvent.error(image);
    
    await waitFor(() => {
      expect(screen.getByText('Our Amazing Team')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
    });
  });

  it('renders without optional props gracefully', () => {
    const minimalProps = {
      title: 'Test Story'
    };
    
    render(<CompanyStory {...minimalProps} />);
    
    expect(screen.getByRole('heading', { name: /test story/i })).toBeInTheDocument();
    expect(screen.queryByText(/our mission/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /key achievements/i })).not.toBeInTheDocument();
  });

  it('renders with default title when not provided', () => {
    render(<CompanyStory mission="Test mission" />);
    
    expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument();
  });

  it('renders mission section when mission is provided', () => {
    const props = {
      mission: 'Our mission is to make French learning accessible to everyone.'
    };
    
    render(<CompanyStory {...props} />);
    
    expect(screen.getByText(/our mission/i)).toBeInTheDocument();
    expect(screen.getByText(/make french learning accessible/i)).toBeInTheDocument();
  });

  it('renders story section when story is provided', () => {
    const props = {
      story: 'We started in a small classroom and now serve students worldwide.'
    };
    
    render(<CompanyStory {...props} />);
    
    expect(screen.getByText(/started in a small classroom/i)).toBeInTheDocument();
  });

  it('renders partial statistics correctly', () => {
    const props = {
      statistics: {
        studentsHelped: '5,000+'
      }
    };
    
    render(<CompanyStory {...props} />);
    
    expect(screen.getByText('5,000+')).toBeInTheDocument();
    expect(screen.getByText('Students Transformed')).toBeInTheDocument();
    expect(screen.queryByText('Years of Excellence')).not.toBeInTheDocument();
  });

  it('does not render statistics section when empty', () => {
    const props = {
      statistics: {}
    };
    
    render(<CompanyStory {...props} />);
    
    expect(screen.queryByRole('region', { name: /key achievements/i })).not.toBeInTheDocument();
  });

  it('handles image load event correctly', () => {
    render(<CompanyStory {...defaultProps} />);
    
    const image = screen.getByRole('img');
    
    // Simulate image load
    fireEvent.load(image);
    
    // Component should handle the load event without errors
    expect(image).toBeInTheDocument();
  });

  it('displays image fallback with proper accessibility', async () => {
    render(<CompanyStory {...defaultProps} />);
    
    const image = screen.getByRole('img');
    fireEvent.error(image);
    
    await waitFor(() => {
      const fallback = screen.getByRole('img', { name: /team photo unavailable/i });
      expect(fallback).toBeInTheDocument();
    });
  });
});