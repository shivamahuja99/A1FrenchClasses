/**
 * Utility functions for formatting pricing, course levels, and testimonial ratings
 */

/**
 * Format price with currency symbol and proper formatting
 * @param {number} price - The price to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = '$') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return `${currency}0`;
  }
  
  return `${currency}${price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Format pricing with original and discounted prices
 * @param {number} price - Current/discounted price
 * @param {number} originalPrice - Original price before discount
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {object} Object with formatted prices and discount info
 */
export const formatPricing = (price, originalPrice, currency = '$') => {
  const formattedPrice = formatPrice(price, currency);
  const formattedOriginalPrice = formatPrice(originalPrice, currency);
  
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const discountAmount = hasDiscount ? originalPrice - price : 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return {
    price: formattedPrice,
    originalPrice: formattedOriginalPrice,
    hasDiscount,
    discountAmount: formatPrice(discountAmount, currency),
    discountPercentage: `${discountPercentage}%`,
    savings: hasDiscount ? `Save ${formatPrice(discountAmount, currency)}` : null
  };
};

/**
 * Format course level with appropriate styling class
 * @param {string} level - Course difficulty level
 * @returns {object} Object with formatted level and CSS class
 */
export const formatCourseLevel = (level) => {
  if (!level || typeof level !== 'string') {
    return {
      level: 'Unknown',
      className: 'level-unknown',
      color: '#666'
    };
  }

  const normalizedLevel = level.toLowerCase().trim();
  
  const levelMap = {
    'beginner': {
      level: 'Beginner',
      className: 'level-beginner',
      color: '#4caf50'
    },
    'intermediate': {
      level: 'Intermediate',
      className: 'level-intermediate',
      color: '#ff9800'
    },
    'advanced': {
      level: 'Advanced',
      className: 'level-advanced',
      color: '#f44336'
    }
  };

  return levelMap[normalizedLevel] || {
    level: level,
    className: 'level-custom',
    color: '#2196f3'
  };
};

/**
 * Format testimonial rating as stars
 * @param {number} rating - Rating value (0-5)
 * @returns {object} Object with star display information
 */
export const formatRating = (rating) => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return {
      rating: 0,
      stars: '☆☆☆☆☆',
      filledStars: 0,
      emptyStars: 5,
      percentage: 0,
      display: '0/5'
    };
  }

  const clampedRating = Math.max(0, Math.min(5, rating));
  const filledStars = Math.floor(clampedRating);
  const emptyStars = 5 - filledStars;
  
  const starDisplay = '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
  const percentage = (clampedRating / 5) * 100;

  return {
    rating: clampedRating,
    stars: starDisplay,
    filledStars,
    emptyStars,
    percentage: Math.round(percentage),
    display: `${clampedRating}/5`
  };
};

/**
 * Format payment plan information
 * @param {Array} paymentPlans - Array of payment plan objects
 * @returns {Array} Formatted payment plans with display information
 */
export const formatPaymentPlans = (paymentPlans) => {
  if (!Array.isArray(paymentPlans)) {
    return [];
  }

  return paymentPlans.map(plan => ({
    ...plan,
    formattedAmount: formatPrice(plan.amount),
    displayText: plan.type === 'Full Payment' 
      ? `${formatPrice(plan.amount)} (${plan.duration})`
      : `${formatPrice(plan.amount)}/month for ${plan.duration}`,
    isRecommended: plan.type === 'Full Payment' // Mark full payment as recommended
  }));
};