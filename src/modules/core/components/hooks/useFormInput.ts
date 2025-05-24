/**
 * useFormInput Hook
 * 
 * This hook provides form input functionality for form components.
 */

import { useState, useCallback, ChangeEvent } from 'react';

export interface UseFormInputOptions<T> {
  /** Initial value */
  initialValue?: T;
  /** Validation function */
  validate?: (value: T) => string | null;
  /** Transform function for input value */
  transform?: (value: any) => T;
  /** Callback when value changes */
  onChange?: (value: T) => void;
}

/**
 * Hook for form inputs
 * 
 * @param options - Form input options
 * @returns Form input state and handlers
 * 
 * @example
 * ```tsx
 * const { value, error, touched, handleChange, handleBlur, setValue } = useFormInput({
 *   initialValue: '',
 *   validate: (value) => value ? null : 'This field is required',
 *   onChange: (value) => console.log('Value changed:', value)
 * });
 * 
 * return (
 *   <div>
 *     <input
 *       value={value}
 *       onChange={handleChange}
 *       onBlur={handleBlur}
 *     />
 *     {touched && error && <div className="error">{error}</div>}
 *   </div>
 * );
 * ```
 */
export function useFormInput<T = string>({
  initialValue,
  validate,
  transform,
  onChange
}: UseFormInputOptions<T> = {}) {
  const [value, setValue] = useState<T>(initialValue as T);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Transform input value
  const transformValue = useCallback((inputValue: any): T => {
    if (transform) {
      return transform(inputValue);
    }
    return inputValue as T;
  }, [transform]);

  // Validate value
  const validateValue = useCallback((valueToValidate: T): string | null => {
    if (validate) {
      return validate(valueToValidate);
    }
    return null;
  }, [validate]);

  // Handle input change
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | T) => {
    let newValue: T;
    
    // Check if the event is an input event or a direct value
    if (e && typeof e === 'object' && 'target' in e) {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      newValue = transformValue(target.value);
    } else {
      newValue = transformValue(e);
    }
    
    setValue(newValue);
    
    if (touched) {
      setError(validateValue(newValue));
    }
    
    if (onChange) {
      onChange(newValue);
    }
  }, [transformValue, validateValue, touched, onChange]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    if (!touched) {
      setTouched(true);
    }
    setError(validateValue(value));
  }, [validateValue, value, touched]);

  // Update value directly
  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    
    if (touched) {
      setError(validateValue(newValue));
    }
    
    if (onChange) {
      onChange(newValue);
    }
  }, [validateValue, touched, onChange]);

  // Reset the input
  const reset = useCallback(() => {
    setValue(initialValue as T);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    handleChange,
    handleBlur,
    setValue: updateValue,
    reset
  };
}

export default useFormInput;
