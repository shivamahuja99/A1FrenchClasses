import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTestimonials, useFeaturedTestimonials } from '../useTestimonials';

// Mock fetch
global.fetch = vi.fn();

const mockTestimonialsData = [
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
    rating: 4,
    customerPhoto: '/images/testimonials/michael-chen.jpg',
    courseCompleted: 'Business French Professional'
  },
  {
    id: 'testimonial-3',
    customerName: 'Emma Rodriguez',
    feedback: 'Highly recommended!',
    rating: 5,
    customerPhoto: '/images/testimonials/emma-rodriguez.jpg',
    courseCompleted: 'Conversational French Mastery'
  }
];

describe('useTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads testimonials successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestimonialsData
    });

    const { result } = renderHook(() => useTestimonials());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.testimonials).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toEqual(mockTestimonialsData);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/data/testimonials.json');
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to load testimonials: 404';
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTestimonials());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles network error', async () => {
    const networkError = new Error('Network error');
    fetch.mockRejectedValueOnce(networkError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTestimonials());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toEqual([]);
    expect(result.current.error).toBe('Network error');
    expect(consoleSpy).toHaveBeenCalledWith('Error loading testimonials:', networkError);

    consoleSpy.mockRestore();
  });

  it('handles JSON parsing error', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      }
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTestimonials());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toEqual([]);
    expect(result.current.error).toBe('Invalid JSON');

    consoleSpy.mockRestore();
  });
});

describe('useFeaturedTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns limited number of testimonials sorted by rating', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestimonialsData
    });

    const { result } = renderHook(() => useFeaturedTestimonials(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toHaveLength(2);
    // Should be sorted by rating (5, 5) - highest first
    expect(result.current.testimonials[0].rating).toBe(5);
    expect(result.current.testimonials[1].rating).toBe(5);
  });

  it('uses default limit of 3', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTestimonialsData
    });

    const { result } = renderHook(() => useFeaturedTestimonials());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toHaveLength(3);
  });

  it('handles empty testimonials array', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    const { result } = renderHook(() => useFeaturedTestimonials(3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.testimonials).toEqual([]);
  });

  it('propagates loading state from useTestimonials', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFeaturedTestimonials());

    expect(result.current.loading).toBe(true);
    expect(result.current.testimonials).toEqual([]);
  });

  it('propagates error state from useTestimonials', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFeaturedTestimonials());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load testimonials: 500');
    expect(result.current.testimonials).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('sorts testimonials by rating correctly', async () => {
    const unsortedTestimonials = [
      { ...mockTestimonialsData[0], rating: 3 },
      { ...mockTestimonialsData[1], rating: 5 },
      { ...mockTestimonialsData[2], rating: 4 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => unsortedTestimonials
    });

    const { result } = renderHook(() => useFeaturedTestimonials(3));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should be sorted by rating: 5, 4, 3
    expect(result.current.testimonials[0].rating).toBe(5);
    expect(result.current.testimonials[1].rating).toBe(4);
    expect(result.current.testimonials[2].rating).toBe(3);
  });
});