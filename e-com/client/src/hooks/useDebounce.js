import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a fast-changing value
 * @param {*} value
 * @param {number} delay - milliseconds
 * @returns {*}
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
