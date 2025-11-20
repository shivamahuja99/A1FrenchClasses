import { useState, useEffect } from 'react';

/**
 * Custom hook for loading companies data
 * Handles loading states and error handling for trusted company information
 */
export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/companies.json');
        if (!response.ok) {
          throw new Error(`Failed to load companies: ${response.status}`);
        }
        
        const companiesData = await response.json();
        setCompanies(companiesData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading companies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return { companies, loading, error };
};

/**
 * Custom hook for loading trusted companies for homepage display
 * Returns a subset of companies to show as trust indicators
 */
export const useTrustedCompanies = (limit = 6) => {
  const { companies, loading, error } = useCompanies();
  const [trustedCompanies, setTrustedCompanies] = useState([]);

  useEffect(() => {
    if (companies.length > 0) {
      // Take the first 'limit' companies for homepage display
      setTrustedCompanies(companies.slice(0, limit));
    }
  }, [companies, limit]);

  return { companies: trustedCompanies, loading, error };
};