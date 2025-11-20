import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateResponsiveImageUrls,
  generateSrcSet,
  generateSizes,
  getOptimizedImageUrl,
  extractAltTextFromPath,
  preloadImages
} from '../imageUtils.js';

describe('generateResponsiveImageUrls', () => {
  it('should generate responsive URLs for valid path', () => {
    const result = generateResponsiveImageUrls('/images/course.jpg');
    
    expect(result.mobile).toBe('/images/course-480w.jpg');
    expect(result.tablet).toBe('/images/course-768w.jpg');
    expect(result.desktop).toBe('/images/course-1200w.jpg');
    expect(result.original).toBe('/images/course.jpg');
    expect(result.webp.mobile).toBe('/images/course-480w.webp');
  });

  it('should handle custom options', () => {
    const options = {
      mobileWidth: 320,
      tabletWidth: 640,
      desktopWidth: 1024,
      format: 'png'
    };
    
    const result = generateResponsiveImageUrls('/images/course.jpg', options);
    
    expect(result.mobile).toBe('/images/course-320w.png');
    expect(result.tablet).toBe('/images/course-640w.png');
    expect(result.desktop).toBe('/images/course-1024w.png');
  });

  it('should handle invalid paths', () => {
    const result = generateResponsiveImageUrls(null);
    
    expect(result.mobile).toBe('/images/placeholder-mobile.jpg');
    expect(result.tablet).toBe('/images/placeholder-tablet.jpg');
    expect(result.desktop).toBe('/images/placeholder-desktop.jpg');
    expect(result.original).toBe('/images/placeholder.jpg');
  });

  it('should handle paths without extension', () => {
    const result = generateResponsiveImageUrls('/images/course');
    
    expect(result.mobile).toBe('/images/course-480w.jpg');
    expect(result.original).toBe('/images/course');
  });
});

describe('generateSrcSet', () => {
  it('should generate proper srcSet string', () => {
    const result = generateSrcSet('/images/course.jpg');
    
    expect(result).toBe('/images/course-480w.jpg 480w, /images/course-768w.jpg 768w, /images/course-1200w.jpg 1200w');
  });

  it('should handle custom widths', () => {
    const options = {
      mobileWidth: 320,
      tabletWidth: 640,
      desktopWidth: 1024
    };
    
    const result = generateSrcSet('/images/course.jpg', options);
    
    expect(result).toBe('/images/course-320w.jpg 320w, /images/course-640w.jpg 640w, /images/course-1024w.jpg 1024w');
  });
});

describe('generateSizes', () => {
  it('should generate default sizes string', () => {
    const result = generateSizes();
    
    expect(result).toBe('(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw');
  });

  it('should handle custom breakpoints', () => {
    const breakpoints = {
      mobile: '90vw',
      tablet: '45vw',
      desktop: '30vw',
      mobileBreakpoint: '600px',
      tabletBreakpoint: '900px'
    };
    
    const result = generateSizes(breakpoints);
    
    expect(result).toBe('(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw');
  });
});

describe('getOptimizedImageUrl', () => {
  it('should return optimized URL for valid path', () => {
    const result = getOptimizedImageUrl('/images/course.jpg');
    
    expect(result.url).toBe('/images/course.jpg');
    expect(result.fallback).toBe('/images/course.jpg');
    expect(result.alt).toBe('Course');
  });

  it('should handle webp format with fallback', () => {
    const result = getOptimizedImageUrl('/images/course.webp');
    
    expect(result.url).toBe('/images/course.webp');
    expect(result.fallback).toBe('/images/course.jpg');
  });

  it('should return placeholder for invalid path', () => {
    const result = getOptimizedImageUrl(null);
    
    expect(result.url).toBe('/images/placeholder.jpg');
    expect(result.fallback).toBe('/images/placeholder.jpg');
    expect(result.alt).toBe('Placeholder image');
  });
});

describe('extractAltTextFromPath', () => {
  it('should extract meaningful alt text', () => {
    expect(extractAltTextFromPath('/images/french-basics-course.jpg')).toBe('French Basics Course');
    expect(extractAltTextFromPath('/images/user_profile_photo.png')).toBe('User Profile Photo');
    expect(extractAltTextFromPath('/images/company-logo.svg')).toBe('Company Logo');
  });

  it('should handle edge cases', () => {
    expect(extractAltTextFromPath('')).toBe('Image');
    expect(extractAltTextFromPath(null)).toBe('Image');
    expect(extractAltTextFromPath('/images/')).toBe('Image');
  });

  it('should handle simple filenames', () => {
    expect(extractAltTextFromPath('course.jpg')).toBe('Course');
    expect(extractAltTextFromPath('photo')).toBe('Photo');
  });
});

describe('preloadImages', () => {
  beforeEach(() => {
    // Mock Image constructor
    global.Image = vi.fn(() => ({
      onload: null,
      onerror: null,
      src: ''
    }));
  });

  it('should handle empty or invalid input', async () => {
    const result = await preloadImages(null);
    expect(result).toEqual([]);
    
    const result2 = await preloadImages('invalid');
    expect(result2).toEqual([]);
  });

  it('should create Image objects for each path', () => {
    const paths = ['/image1.jpg', '/image2.jpg'];
    preloadImages(paths);
    
    expect(global.Image).toHaveBeenCalledTimes(2);
  });

  it('should handle successful image loading', async () => {
    const mockImg = {
      onload: null,
      onerror: null,
      src: ''
    };
    
    global.Image = vi.fn(() => mockImg);
    
    const promise = preloadImages(['/image1.jpg']);
    
    // Simulate successful load
    setTimeout(() => {
      if (mockImg.onload) mockImg.onload();
    }, 0);
    
    const result = await promise;
    expect(result).toHaveLength(1);
  });

  it('should handle image loading errors', async () => {
    const mockImg = {
      onload: null,
      onerror: null,
      src: ''
    };
    
    global.Image = vi.fn(() => mockImg);
    
    const promise = preloadImages(['/invalid-image.jpg']);
    
    // Simulate error
    setTimeout(() => {
      if (mockImg.onerror) mockImg.onerror();
    }, 0);
    
    const result = await promise;
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('rejected');
  });
});