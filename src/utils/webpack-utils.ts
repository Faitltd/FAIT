/**
 * Utility functions specifically for webpack bundling
 * This demonstrates code splitting and dynamic imports
 */

/**
 * Dynamically loads a large library only when needed
 * This is a pattern that works well with webpack's code splitting
 */
export const loadChartLibrary = async () => {
  // Dynamic import will be code-split by webpack
  const { Chart } = await import('chart.js/auto');
  return Chart;
};

/**
 * Format a number as a file size (KB, MB, etc.)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculate bundle efficiency score (example metric)
 */
export const calculateBundleEfficiency = (
  totalSize: number,
  codeSize: number,
  dependencies: number
): number => {
  // This is just an example formula
  const codeRatio = codeSize / totalSize;
  const dependencyFactor = 1 - (dependencies / 100);
  
  // Score from 0-100
  return Math.round((codeRatio * 0.7 + dependencyFactor * 0.3) * 100);
};

/**
 * Example of tree-shakable utility functions
 * Webpack will only include the functions that are actually used
 */
export const arrayUtils = {
  /**
   * Get unique items from an array
   */
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],
  
  /**
   * Group array items by a key
   */
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  },
  
  /**
   * Chunk array into smaller arrays of specified size
   */
  chunk: <T>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }
};
