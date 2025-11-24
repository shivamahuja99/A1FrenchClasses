/**
 * Utility functions for responsive image URL generation and optimization
 */

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} basePath - Base image path
 * @param {object} options - Options for image generation
 * @returns {object} Object with responsive image URLs
 */
export const generateResponsiveImageUrls = (basePath, options = {}) => {
  if (!basePath || typeof basePath !== 'string') {
    return {
      mobile: '/images/placeholder-mobile.jpg',
      tablet: '/images/placeholder-tablet.jpg',
      desktop: '/images/placeholder-desktop.jpg',
      original: '/images/placeholder.jpg'
    };
  }

  const {
    mobileWidth = 480,
    tabletWidth = 768,
    desktopWidth = 1200,
    format = 'jpg',
    quality = 80
  } = options;

  // Extract file extension and name
  const lastDotIndex = basePath.lastIndexOf('.');
  const pathWithoutExt = lastDotIndex > -1 ? basePath.substring(0, lastDotIndex) : basePath;
  const originalExt = lastDotIndex > -1 ? basePath.substring(lastDotIndex + 1) : format;

  return {
    mobile: `${pathWithoutExt}-${mobileWidth}w.${format}`,
    tablet: `${pathWithoutExt}-${tabletWidth}w.${format}`,
    desktop: `${pathWithoutExt}-${desktopWidth}w.${format}`,
    original: basePath,
    webp: {
      mobile: `${pathWithoutExt}-${mobileWidth}w.webp`,
      tablet: `${pathWithoutExt}-${tabletWidth}w.webp`,
      desktop: `${pathWithoutExt}-${desktopWidth}w.webp`,
      original: `${pathWithoutExt}.webp`
    }
  };
};

/**
 * Generate srcSet string for responsive images
 * @param {string} basePath - Base image path
 * @param {object} options - Options for srcSet generation
 * @returns {string} srcSet string for use in img elements
 */
export const generateSrcSet = (basePath, options = {}) => {
  const urls = generateResponsiveImageUrls(basePath, options);
  
  const {
    mobileWidth = 480,
    tabletWidth = 768,
    desktopWidth = 1200
  } = options;

  return [
    `${urls.mobile} ${mobileWidth}w`,
    `${urls.tablet} ${tabletWidth}w`,
    `${urls.desktop} ${desktopWidth}w`
  ].join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param {object} breakpoints - Breakpoint configuration
 * @returns {string} sizes attribute string
 */
export const generateSizes = (breakpoints = {}) => {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
    mobileBreakpoint = '768px',
    tabletBreakpoint = '1024px'
  } = breakpoints;

  return [
    `(max-width: ${mobileBreakpoint}) ${mobile}`,
    `(max-width: ${tabletBreakpoint}) ${tablet}`,
    desktop
  ].join(', ');
};

/**
 * Get optimized image URL with fallback
 * @param {string} imagePath - Original image path
 * @param {object} options - Optimization options
 * @returns {object} Object with optimized URL and fallback
 */
export const getOptimizedImageUrl = (imagePath, options = {}) => {
  if (!imagePath) {
    return {
      url: '/images/placeholder.jpg',
      fallback: '/images/placeholder.jpg',
      alt: 'Placeholder image'
    };
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fallbackFormat = 'jpg'
  } = options;

  // For now, return the original path since we don't have an image optimization service
  // In a real application, this would integrate with services like Cloudinary, ImageKit, etc.
  const optimizedUrl = imagePath;
  const fallbackUrl = imagePath.replace(/\.(webp|avif)$/i, `.${fallbackFormat}`);

  return {
    url: optimizedUrl,
    fallback: fallbackUrl,
    alt: extractAltTextFromPath(imagePath)
  };
};

/**
 * Extract meaningful alt text from image path
 * @param {string} imagePath - Image file path
 * @returns {string} Generated alt text
 */
export const extractAltTextFromPath = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return 'Image';
  }

  // Extract filename without extension
  const filename = imagePath.split('/').pop().split('.')[0];
  
  // Convert kebab-case and snake_case to readable text
  const altText = filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();

  return altText || 'Image';
};

/**
 * Check if image format is supported by browser
 * @param {string} format - Image format to check
 * @returns {Promise<boolean>} Promise resolving to support status
 */
export const isImageFormatSupported = (format) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 1, 1);
    
    const dataURL = canvas.toDataURL(`image/${format}`);
    resolve(dataURL.indexOf(`data:image/${format}`) === 0);
  });
};

/**
 * Preload critical images
 * @param {Array<string>} imagePaths - Array of image paths to preload
 * @returns {Promise<Array>} Promise resolving when all images are loaded
 */
export const preloadImages = (imagePaths) => {
  if (!Array.isArray(imagePaths)) {
    return Promise.resolve([]);
  }

  const loadPromises = imagePaths.map(path => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(path);
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = path;
    });
  });

  return Promise.allSettled(loadPromises);
};
/**

 * Generate responsive image URL for a specific width
 * @param {string} basePath - Base image path
 * @param {number} width - Target width
 * @returns {string} Responsive image URL
 */
export const generateResponsiveImageUrl = (basePath, width = 400) => {
  if (!basePath || typeof basePath !== 'string') {
    return '/images/placeholder.jpg';
  }

  // For now, return the original path since we don't have image optimization
  // In production, this would generate URLs for different sizes
  return basePath;
};

/**
 * Generate WebP version of image path
 * @param {string} imagePath - Original image path
 * @returns {string} WebP version of the image path
 */
export const generateWebPPath = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  // Replace extension with .webp
  return imagePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
};

/**
 * Generate optimized image paths with WebP support
 * @param {string} basePath - Base image path
 * @param {object} options - Optimization options
 * @returns {object} Object with optimized paths
 */
export const generateOptimizedImagePaths = (basePath, options = {}) => {
  if (!basePath) {
    return {
      original: '/images/placeholder.jpg',
      webp: null,
      srcSet: null,
      webpSrcSet: null
    };
  }

  const {
    widths = [480, 768, 1200],
    format = 'jpg'
  } = options;

  // Generate srcSet for different widths
  const srcSetEntries = widths.map(width => {
    const url = generateResponsiveImageUrl(basePath, width);
    return `${url} ${width}w`;
  });

  const webpSrcSetEntries = widths.map(width => {
    const webpUrl = generateWebPPath(generateResponsiveImageUrl(basePath, width));
    return webpUrl ? `${webpUrl} ${width}w` : null;
  }).filter(Boolean);

  return {
    original: basePath,
    webp: generateWebPPath(basePath),
    srcSet: srcSetEntries.join(', '),
    webpSrcSet: webpSrcSetEntries.length > 0 ? webpSrcSetEntries.join(', ') : null
  };
};

/**
 * Create image preloader for critical images
 * @param {Array<string>} imagePaths - Array of critical image paths
 * @returns {Promise<void>} Promise that resolves when images are preloaded
 */
export const preloadCriticalImages = async (imagePaths) => {
  if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
    return;
  }

  const preloadPromises = imagePaths.map(path => {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = path;
      link.onload = resolve;
      link.onerror = resolve; // Don't fail the whole batch if one image fails
      document.head.appendChild(link);
    });
  });

  await Promise.all(preloadPromises);
};