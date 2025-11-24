import { useState, useEffect } from 'react';

/**
 * Custom hook for loading courses data
 * Handles loading states and error handling for course information
 */
export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/courses.json');
        if (!response.ok) {
          throw new Error(`Failed to load courses: ${response.status}`);
        }
        
        const coursesData = await response.json();
        setCourses(coursesData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return { courses, loading, error };
};

/**
 * Custom hook for loading featured courses (top-selling courses)
 * Returns a subset of courses marked as featured or top-selling
 */
export const useFeaturedCourses = (limit = 3) => {
  const { courses, loading, error } = useCourses();
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    if (courses.length > 0) {
      // For now, we'll take the first 'limit' courses as featured
      // In a real app, this could be based on a 'featured' flag in the data
      setFeaturedCourses(courses.slice(0, limit));
    }
  }, [courses, limit]);

  return { courses: featuredCourses, loading, error };
};