/**
 * Utility for filtering component props
 * 
 * This utility helps with filtering props for components.
 */

/**
 * Filter props by keys
 * 
 * @param props - Props object
 * @param keys - Array of keys to include
 * @returns Filtered props object
 * 
 * @example
 * ```tsx
 * // Include only specific props
 * filterProps({ id: 'btn', className: 'btn', onClick: () => {} }, ['id', 'className']);
 * // => { id: 'btn', className: 'btn' }
 * ```
 */
export function filterProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    if (key in props) {
      acc[key] = props[key];
    }
    return acc;
  }, {} as Pick<T, K>);
}

/**
 * Omit props by keys
 * 
 * @param props - Props object
 * @param keys - Array of keys to exclude
 * @returns Filtered props object
 * 
 * @example
 * ```tsx
 * // Exclude specific props
 * omitProps({ id: 'btn', className: 'btn', onClick: () => {} }, ['onClick']);
 * // => { id: 'btn', className: 'btn' }
 * ```
 */
export function omitProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...props };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Split props by keys
 * 
 * @param props - Props object
 * @param keys - Array of keys to include in the first object
 * @returns Tuple of [included props, excluded props]
 * 
 * @example
 * ```tsx
 * // Split props into two objects
 * splitProps({ id: 'btn', className: 'btn', onClick: () => {} }, ['id', 'className']);
 * // => [{ id: 'btn', className: 'btn' }, { onClick: () => {} }]
 * ```
 */
export function splitProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: K[]
): [Pick<T, K>, Omit<T, K>] {
  const included = filterProps(props, keys);
  const excluded = omitProps(props, keys);
  return [included, excluded];
}

export default {
  filterProps,
  omitProps,
  splitProps
};
