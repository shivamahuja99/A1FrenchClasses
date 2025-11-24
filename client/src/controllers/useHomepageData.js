import { useState, useEffect } from 'react';

/**
 * Custom hook for loading homepage data
 * Handles loading states and error handling for homepage content
 */
export const useHomepageData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/homepage.json');
        if (!response.ok) {
          throw new Error(`Failed to load homepage data: ${response.status}`);
        }
        
        const homepageData = await response.json();
        setData(homepageData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageData();
  }, []);

  return { data, loading, error };
};