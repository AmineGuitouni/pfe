import { useCallback, useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state from localStorage or fallback to initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Remove storedValue from dependency array to prevent infinite updates
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Use a function update to avoid needing storedValue as a dependency
      setStoredValue((currentStoredValue) => {
        const valueToStore = value instanceof Function ? value(currentStoredValue) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.log(error);
    }
  }, [key]); // Only depend on key

  // Also make removeValue a callback with proper dependency
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.log(error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;