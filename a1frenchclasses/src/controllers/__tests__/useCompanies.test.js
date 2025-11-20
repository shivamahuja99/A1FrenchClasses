import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCompanies, useTrustedCompanies } from '../useCompanies.js';

// Mock fetch
global.fetch = vi.fn();

describe('useCompanies', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockCompanies = [
    {
      id: 'company-1',
      name: 'Microsoft',
      logo: '/images/microsoft.png'
    },
    {
      id: 'company-2',
      name: 'Google',
      logo: '/images/google.png'
    }
  ];

  it('should load companies successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanies,
    });

    const { result } = renderHook(() => useCompanies());

    expect(result.current.loading).toBe(true);
    expect(result.current.companies).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.companies).toEqual(mockCompanies);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/data/companies.json');
  });

  it('should handle fetch errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const { result } = renderHook(() => useCompanies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.companies).toEqual([]);
    expect(result.current.error).toBe('Failed to load companies: 403');
  });
});

describe('useTrustedCompanies', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should return limited number of trusted companies', async () => {
    const mockCompanies = Array.from({ length: 8 }, (_, i) => ({
      id: `company-${i + 1}`,
      name: `Company ${i + 1}`,
      logo: `/images/company-${i + 1}.png`
    }));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanies,
    });

    const { result } = renderHook(() => useTrustedCompanies(4));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.companies).toHaveLength(4);
    expect(result.current.companies).toEqual(mockCompanies.slice(0, 4));
  });

  it('should use default limit of 6', async () => {
    const mockCompanies = Array.from({ length: 10 }, (_, i) => ({
      id: `company-${i + 1}`,
      name: `Company ${i + 1}`
    }));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanies,
    });

    const { result } = renderHook(() => useTrustedCompanies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.companies).toHaveLength(6);
  });
});