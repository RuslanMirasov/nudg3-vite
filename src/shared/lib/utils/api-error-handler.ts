import { toast } from 'sonner';
import type { AnyRouter } from '@tanstack/react-router';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Global API error handler for TanStack Router
 */
export function handleApiError(
  error: unknown,
  router: AnyRouter,
  options: {
    skipToast?: boolean;
    onUnauthorized?: () => void;
  } = {}
): void {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 402: {
        if (!options.skipToast) {
          toast.error('Your trial has expired. Please upgrade to continue.');
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirect_after_upgrade', window.location.pathname);
        }

        router.history.push('/subscription/upgrade');
        break;
      }

      case 401: {
        if (options.onUnauthorized) {
          options.onUnauthorized();
        } else if (!options.skipToast) {
          toast.error('Your session has expired. Please log in again.');
        }
        break;
      }

      case 403: {
        if (!options.skipToast) {
          toast.error("You don't have permission to perform this action.");
        }
        break;
      }

      case 404: {
        if (!options.skipToast) {
          toast.error('The requested resource was not found.');
        }
        break;
      }

      case 429: {
        if (!options.skipToast) {
          toast.error('Too many requests. Please try again later.');
        }
        break;
      }

      case 500:
      case 502:
      case 503: {
        if (!options.skipToast) {
          toast.error('Server error. Please try again later.');
        }
        break;
      }

      default: {
        if (!options.skipToast) {
          toast.error(error.message || 'An error occurred. Please try again.');
        }
      }
    }
  } else {
    if (!options.skipToast) {
      toast.error('An unexpected error occurred. Please try again.');
    }
    console.error('Unexpected error:', error);
  }
}

/**
 * Wrap async API call with error handling
 */
export async function withApiErrorHandling<T>(
  apiCall: () => Promise<T>,
  router: AnyRouter,
  options: {
    skipToast?: boolean;
    onUnauthorized?: () => void;
    rethrow?: boolean;
  } = {}
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    handleApiError(error, router, options);

    if (options.rethrow) {
      throw error;
    }

    return null;
  }
}

export { ApiError };
