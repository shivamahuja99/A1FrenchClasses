import { useState, useEffect } from 'react';

/**
 * Custom hook for loading testimonials data
 * Handles loading states and error handling for customer testimonials
 */
export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/testimonials.json');
        if (!response.ok) {
          throw new Error(`Failed to load testimonials: ${response.status}`);
        }
        
        const testimonialsData = await response.json();
        setTestimonials(testimonialsData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  return { testimonials, loading, error };
};

/**
 * Custom hook for loading featured testimonials
 * Returns a subset of testimonials for display on homepage
 */
export const useFeaturedTestimonials = (limit = 3) => {
  const { testimonials, loading, error } = useTestimonials();
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);

  useEffect(() => {
    if (testimonials.length > 0) {
      // Filter for highest rated testimonials first, then limit
      const sortedTestimonials = [...testimonials]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
      
      setFeaturedTestimonials(sortedTestimonials);
    }
  }, [testimonials, limit]);

  return { testimonials: featuredTestimonials, loading, error };
};