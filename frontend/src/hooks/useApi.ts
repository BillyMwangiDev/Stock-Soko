/**
 * useApi Hook
 * Custom hook for consistent API error handling and loading states
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options?: {
    showErrorAlert?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiCall(...args);
        setState({ data: result, loading: false, error: null });
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || err?.message || 'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });

        if (options?.showErrorAlert !== false) {
          Alert.alert('Error', errorMessage);
        }

        if (options?.onError) {
          options.onError(errorMessage);
        }

        return null;
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

/**
 * useApiMutation Hook
 * For create/update/delete operations
 */
export function useApiMutation<T = any, P = any>(
  apiCall: (params: P) => Promise<T>,
  options?: {
    showSuccessAlert?: boolean;
    successMessage?: string;
    showErrorAlert?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiCall(params);
        setState({ data: result, loading: false, error: null });

        if (options?.showSuccessAlert) {
          Alert.alert('Success', options.successMessage || 'Operation completed successfully');
        }

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.detail || err?.message || 'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });

        if (options?.showErrorAlert !== false) {
          Alert.alert('Error', errorMessage);
        }

        if (options?.onError) {
          options.onError(errorMessage);
        }

        return null;
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    mutate,
    reset,
  };
}

/**
 * useApiQuery Hook
 * For GET operations with automatic execution
 */
export function useApiQuery<T = any>(
  apiCall: () => Promise<T>,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (): Promise<T | null> => {
    if (options?.enabled === false) {
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });

      if (options?.onError) {
        options.onError(errorMessage);
      }

      return null;
    }
  }, [apiCall, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

