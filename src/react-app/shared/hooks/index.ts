// Shared React hooks used across multiple features

import { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingState, Coordinates } from '../types';
import { getCurrentLocation } from '../utils';

/**
 * Hook for managing loading states
 */
export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: initialState,
  });

  const startLoading = useCallback(() => {
    setLoading({ isLoading: true, error: undefined });
  }, []);

  const stopLoading = useCallback(() => {
    setLoading({ isLoading: false });
  }, []);

  const setError = useCallback((error: string) => {
    setLoading({ isLoading: false, error });
  }, []);

  return {
    loading,
    startLoading,
    stopLoading,
    setError,
  };
}

/**
 * Hook for managing user's current location
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    location,
    error,
    isLoading,
    getLocation,
  };
}

/**
 * Hook for managing local storage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook for managing form state
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => {
      return (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
      };
    },
    [values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    reset,
    setError,
  };
}

/**
 * Hook for managing API calls
 */
export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'API call failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall, ...dependencies]
  );

  return {
    data,
    error,
    isLoading,
    execute,
  };
}

/**
 * Hook for managing modal state
 */
export function useModal(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook for managing pagination
 */
export function usePagination(initialPage: number = 1, initialLimit: number = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage((prev) => prev - 1);
    }
  }, [hasPrevPage]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

/**
 * Hook for managing file uploads
 */
export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...fileArray]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress({});
  }, []);

  const uploadFiles = useCallback(
    async (uploadFunction: (file: File) => Promise<string>) => {
      setUploading(true);
      const results: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${file.name}-${i}`;
        
        try {
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
          const result = await uploadFunction(file);
          results.push(result);
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress((prev) => ({ ...prev, [fileId]: -1 }));
        }
      }

      setUploading(false);
      return results;
    },
    [files]
  );

  return {
    files,
    uploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  };
}

/**
 * Hook for managing window size
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook for managing scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  dependencies: any[] = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callbackRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key]);
}

/**
 * Hook for managing click outside
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}
