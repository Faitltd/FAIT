/**
 * Utility for composing component styles
 * 
 * This utility helps with composing inline styles for components.
 */

import React from 'react';

/**
 * Compose inline styles
 * 
 * @param styles - Array of style objects
 * @returns Combined style object
 * 
 * @example
 * ```tsx
 * // Basic usage
 * composeStyles({ color: 'red' }, { fontSize: '16px' });
 * // => { color: 'red', fontSize: '16px' }
 * 
 * // With conditional styles
 * composeStyles(
 *   { color: 'blue' },
 *   isPrimary && { backgroundColor: 'primary' },
 *   isLarge && { fontSize: '20px' }
 * );
 * // => { color: 'blue', backgroundColor: 'primary' } (if isPrimary is true and isLarge is false)
 * 
 * // With undefined or null values
 * composeStyles({ color: 'red' }, undefined, null, { fontSize: '16px' });
 * // => { color: 'red', fontSize: '16px' }
 * ```
 */
export function composeStyles(...styles: (React.CSSProperties | undefined | null | false)[]): React.CSSProperties {
  return styles.filter(Boolean).reduce((acc, style) => {
    return { ...acc, ...style };
  }, {});
}

export default composeStyles;
