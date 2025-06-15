/**
 * Utility for composing CSS classes
 * 
 * This utility helps with composing CSS classes for components.
 */

/**
 * Compose CSS classes
 * 
 * @param classes - Array of class names or objects
 * @returns Combined class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * composeClasses('btn', 'btn-primary');
 * // => 'btn btn-primary'
 * 
 * // With conditional classes
 * composeClasses('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled });
 * // => 'btn btn-primary' (if isPrimary is true and isDisabled is false)
 * 
 * // With undefined or null values
 * composeClasses('btn', undefined, null, 'btn-lg');
 * // => 'btn btn-lg'
 * ```
 */
export function composeClasses(...classes: (string | Record<string, boolean> | undefined | null)[]): string {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') {
        return cls;
      } else if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

export default composeClasses;
