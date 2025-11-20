import React, { useState, useRef, useEffect } from 'react';
import styles from './LazyImage.module.css';

const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  placeholder = '/images/placeholder.jpg',
  webpSrc = null,
  srcSet = null,
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [webpSupported, setWebpSupported] = useState(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 1, 1);
      const dataURL = canvas.toDataURL('image/webp');
      setWebpSupported(dataURL.indexOf('data:image/webp') === 0);
    };

    checkWebPSupport();
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, isInView]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError(e);
  };

  // Generate WebP source if supported and available
  const getImageSrc = () => {
    if (webpSupported && webpSrc) {
      return webpSrc;
    }
    return src;
  };

  // Generate srcSet with WebP support
  const getSourceSet = () => {
    if (!srcSet) return undefined;
    
    if (webpSupported && webpSrc) {
      // Convert regular srcSet to WebP if available
      return srcSet.replace(/\.(jpg|jpeg|png)/g, '.webp');
    }
    
    return srcSet;
  };

  const containerClasses = [
    styles.lazyImageContainer,
    className,
    isLoaded ? styles.loaded : '',
    hasError ? styles.error : ''
  ].filter(Boolean).join(' ');

  return (
    <div ref={imgRef} className={containerClasses}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className={styles.placeholder} aria-hidden="true">
          <div className={styles.skeleton} />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className={styles.errorState} role="img" aria-label={alt}>
          <span className={styles.errorIcon}>📷</span>
          <span className={styles.errorText}>Image unavailable</span>
        </div>
      )}

      {/* Actual image - only render when in view or priority */}
      {(isInView || priority) && (
        <picture>
          {/* WebP source if supported */}
          {webpSupported && webpSrc && (
            <source
              srcSet={getSourceSet() || webpSrc}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback image */}
          <img
            src={getImageSrc()}
            srcSet={getSourceSet()}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            className={styles.image}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;