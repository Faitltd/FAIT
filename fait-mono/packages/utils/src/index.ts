// Export utility functions here
// This file will be the entry point for the utils package

/**
 * Format a currency value
 * @param value The value to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format a date
 * @param date The date to format
 * @param format The format to use (default: 'MM/dd/yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US');
};

// Add more utility functions as needed
