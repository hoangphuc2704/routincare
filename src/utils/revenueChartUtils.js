/**
 * Utility functions for Revenue Dashboard
 */

/**
 * Format number to VND currency
 * @param {number} value - The value to format
 * @param {boolean} showSymbol - Whether to show VND symbol (default: true)
 * @returns {string} - Formatted currency string
 */
export const formatVND = (value, showSymbol = true) => {
  if (value === null || value === undefined) return '0 ₫';

  const num = Number(value);
  if (isNaN(num)) return '0 ₫';

  const symbol = showSymbol ? ' ₫' : '';
  return (
    new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + symbol
  );
};

/**
 * Format number to short format (1K, 1M, 1B)
 * @param {number} value - The value to format
 * @returns {string} - Formatted short number
 */
export const formatShortNumber = (value) => {
  if (value === null || value === undefined) return '0';

  const num = Number(value);
  if (isNaN(num)) return '0';

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get date range for query parameters
 * @param {string} range - Range type: '7days', '30days', '1year'
 * @returns {object} - { from, to } date strings in YYYY-MM-DD format
 */
export const getDateRange = (range) => {
  const today = new Date();
  const from = new Date();

  let daysBack = 7;
  if (range === '30days') daysBack = 30;
  if (range === '1year') daysBack = 365;

  from.setDate(today.getDate() - daysBack);

  const formatDate = (date) => date.toISOString().split('T')[0];

  return {
    from: formatDate(from),
    to: formatDate(today),
  };
};

/**
 * Parse month string to display format
 * @param {string} monthStr - Month in 'YYYY-MM' format
 * @returns {string} - Formatted month like 'Jan 2026'
 */
export const parseMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month) - 1);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Get contrasting text color for dark backgrounds
 * @returns {string} - Hex color code
 */
export const getDarkThemeColors = {
  primary: '#3b82f6', // blue-500
  secondary: '#10b981', // green-500
  accent: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  warning: '#f97316', // orange-500
  success: '#22c55e', // green-500
  text: '#f3f4f6', // gray-100
  textSecondary: '#d1d5db', // gray-300
  bg: '#111827', // gray-900
  bgCard: '#1f2937', // gray-800
};

/**
 * Get ApexCharts default theme colors
 * @returns {object} - Color configurations
 */
export const getChartColors = () => ({
  series: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  background: '#111827',
  text: '#f3f4f6',
  gridLine: '#374151',
});

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 15) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};
