import { useEffect } from 'react';
import { preloadCriticalImages } from '../utils/imageUtils';

/**
 * Hook to preload critical images for better performance
 * @param {Array<string>} imagePaths - Array of critical image paths to preload
 * @param {boolean} enabled - Whether preloading is enabled
 */
export const useImagePreloader = (imagePaths = [], enabled = true) => {
  useEffect(() => {
    if (!enabled || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      return;
    }

    // Only preload on fast connections to avoid wasting bandwidth
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.saveData
    );

    if (isSlowConnection) {
      return;
    }

    // Preload images after a short delay to not block initial render
    const timeoutId = setTimeout(() => {
      preloadCriticalImages(imagePaths).catch(error => {
        console.warn('Failed to preload some images:', error);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [imagePaths, enabled]);
};

export default useImagePreloader;