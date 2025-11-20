import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCourses, useFeaturedCourses } from '../useCourses.js';

// Mock fetch
global.fetch = vi.fn();

describe('useCourses', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockCourses = [
    {
      id: 'course-1',
      name: 'French Basics',
      tutor: 'Marie Dubois',
      price: 199
    },
    {
      id: 'course-2',
      name: 'Advanced French',
      tutor: 'Pierre Laurent',
      price: 349
    },
    {
      id: 'course-3',
      name: 'Business French',
      tutor: 'Sophie Martin',
      price: 449
    }
  ];

  it('should load courses successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourses,
    });

    const { result } = renderHook(() => useCourses());

    expect(result.current.loading).toBe(true);
    expect(result.current.courses).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.courses).toEqual(mockCourses);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/data/courses.json');
  });

  it('should handle fetch errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCourses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.courses).toEqual([]);
    expect(result.current.error).toBe('Failed to load courses: 500');
  });
});

describe('useFeaturedCourses', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should return limited number of featured courses', async () => {
    const mockCourses = [
      { id: 'course-1', name: 'Course 1' },
      { id: 'course-2', name: 'Course 2' },
      { id: 'course-3', name: 'Course 3' },
      { id: 'course-4', name: 'Course 4' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourses,
    });

    const { result } = renderHook(() => useFeaturedCourses(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.courses).toHaveLength(2);
    expect(result.current.courses).toEqual([
      { id: 'course-1', name: 'Course 1' },
      { id: 'course-2', name: 'Course 2' }
    ]);
  });

  it('should use default limit of 3 when no limit specified', async () => {
    const mockCourses = Array.from({ length: 5 }, (_, i) => ({
      id: `course-${i + 1}`,
      name: `Course ${i + 1}`
    }));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCourses,
    });

    const { result } = renderHook(() => useFeaturedCourses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.courses).toHaveLength(3);
  });
});