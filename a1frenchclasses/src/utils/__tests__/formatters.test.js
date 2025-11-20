import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatPricing,
  formatCourseLevel,
  formatRating,
  formatPaymentPlans
} from '../formatters.js';

describe('formatPrice', () => {
  it('should format price with default currency', () => {
    expect(formatPrice(199)).toBe('$199');
    expect(formatPrice(1299)).toBe('$1,299');
    expect(formatPrice(0)).toBe('$0');
  });

  it('should format price with custom currency', () => {
    expect(formatPrice(199, '€')).toBe('€199');
    expect(formatPrice(1299, '£')).toBe('£1,299');
  });

  it('should handle invalid inputs', () => {
    expect(formatPrice(null)).toBe('$0');
    expect(formatPrice(undefined)).toBe('$0');
    expect(formatPrice('invalid')).toBe('$0');
    expect(formatPrice(NaN)).toBe('$0');
  });

  it('should handle decimal numbers by rounding', () => {
    expect(formatPrice(199.99)).toBe('$200');
    expect(formatPrice(199.49)).toBe('$199');
  });
});

describe('formatPricing', () => {
  it('should format pricing with discount', () => {
    const result = formatPricing(199, 299);
    
    expect(result.price).toBe('$199');
    expect(result.originalPrice).toBe('$299');
    expect(result.hasDiscount).toBe(true);
    expect(result.discountAmount).toBe('$100');
    expect(result.discountPercentage).toBe('33%');
    expect(result.savings).toBe('Save $100');
  });

  it('should format pricing without discount', () => {
    const result = formatPricing(199, 199);
    
    expect(result.price).toBe('$199');
    expect(result.originalPrice).toBe('$199');
    expect(result.hasDiscount).toBe(false);
    expect(result.discountAmount).toBe('$0');
    expect(result.discountPercentage).toBe('0%');
    expect(result.savings).toBe(null);
  });

  it('should handle no original price', () => {
    const result = formatPricing(199, null);
    
    expect(result.hasDiscount).toBe(false);
    expect(result.savings).toBe(null);
  });
});

describe('formatCourseLevel', () => {
  it('should format standard course levels', () => {
    expect(formatCourseLevel('Beginner')).toEqual({
      level: 'Beginner',
      className: 'level-beginner',
      color: '#4caf50'
    });

    expect(formatCourseLevel('intermediate')).toEqual({
      level: 'Intermediate',
      className: 'level-intermediate',
      color: '#ff9800'
    });

    expect(formatCourseLevel('ADVANCED')).toEqual({
      level: 'Advanced',
      className: 'level-advanced',
      color: '#f44336'
    });
  });

  it('should handle custom levels', () => {
    const result = formatCourseLevel('Expert');
    expect(result.level).toBe('Expert');
    expect(result.className).toBe('level-custom');
    expect(result.color).toBe('#2196f3');
  });

  it('should handle invalid inputs', () => {
    expect(formatCourseLevel(null)).toEqual({
      level: 'Unknown',
      className: 'level-unknown',
      color: '#666'
    });

    expect(formatCourseLevel('')).toEqual({
      level: 'Unknown',
      className: 'level-unknown',
      color: '#666'
    });
  });
});

describe('formatRating', () => {
  it('should format valid ratings', () => {
    const result5 = formatRating(5);
    expect(result5.rating).toBe(5);
    expect(result5.stars).toBe('★★★★★');
    expect(result5.filledStars).toBe(5);
    expect(result5.emptyStars).toBe(0);
    expect(result5.percentage).toBe(100);
    expect(result5.display).toBe('5/5');

    const result3 = formatRating(3);
    expect(result3.stars).toBe('★★★☆☆');
    expect(result3.filledStars).toBe(3);
    expect(result3.emptyStars).toBe(2);
    expect(result3.percentage).toBe(60);
  });

  it('should handle edge cases', () => {
    const result0 = formatRating(0);
    expect(result0.stars).toBe('☆☆☆☆☆');
    expect(result0.percentage).toBe(0);

    const resultHigh = formatRating(10); // Should clamp to 5
    expect(resultHigh.rating).toBe(5);
    expect(resultHigh.stars).toBe('★★★★★');

    const resultNegative = formatRating(-1); // Should clamp to 0
    expect(resultNegative.rating).toBe(0);
    expect(resultNegative.stars).toBe('☆☆☆☆☆');
  });

  it('should handle invalid inputs', () => {
    const result = formatRating('invalid');
    expect(result.rating).toBe(0);
    expect(result.stars).toBe('☆☆☆☆☆');
    expect(result.display).toBe('0/5');
  });
});

describe('formatPaymentPlans', () => {
  it('should format payment plans array', () => {
    const plans = [
      {
        type: 'Full Payment',
        amount: 199,
        duration: 'One-time'
      },
      {
        type: 'Monthly',
        amount: 67,
        duration: '3 months'
      }
    ];

    const result = formatPaymentPlans(plans);
    
    expect(result).toHaveLength(2);
    expect(result[0].formattedAmount).toBe('$199');
    expect(result[0].displayText).toBe('$199 (One-time)');
    expect(result[0].isRecommended).toBe(true);
    
    expect(result[1].formattedAmount).toBe('$67');
    expect(result[1].displayText).toBe('$67/month for 3 months');
    expect(result[1].isRecommended).toBe(false);
  });

  it('should handle invalid input', () => {
    expect(formatPaymentPlans(null)).toEqual([]);
    expect(formatPaymentPlans('invalid')).toEqual([]);
    expect(formatPaymentPlans(undefined)).toEqual([]);
  });

  it('should handle empty array', () => {
    expect(formatPaymentPlans([])).toEqual([]);
  });
});