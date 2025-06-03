import { DefaultValue } from "recoil";


const parseStoredValue = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Error parsing stored value:', error);
    return null;
  }
};

// Helper function to safely stringify data
const stringifyValue = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error stringifying value:', error);
    return null;
  }
};

// Local storage persistence effect
export const localPersistEffect = ({ onSet, setSelf, node }) => {
  try {
    // Load initial value from localStorage
    const storedValue = localStorage.getItem(node.key);
    
    if (storedValue != null) {
      const parsedValue = parseStoredValue(storedValue);
      if (parsedValue !== null) {
        setSelf(parsedValue);
      }
    }

    // Subscribe to changes and sync with localStorage
    onSet((newValue) => {
      try {
        if (newValue instanceof DefaultValue) {
          localStorage.removeItem(node.key);
        } else {
          const serializedValue = stringifyValue(newValue);
          if (serializedValue !== null) {
            localStorage.setItem(node.key, serializedValue);
          }
        }
      } catch (error) {
        console.error(`Storage error for key "${node.key}":`, error);
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded. State changes will not persist.');
        }
      }
    });
  } catch (error) {
    console.error(`Error initializing persist effect for key "${node.key}":`, error);
  }
};