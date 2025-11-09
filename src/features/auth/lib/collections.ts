/**
 * Collections API Client
 *
 * Handles collection workflow operations including triggering collections,
 * checking status, and retrieving history.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ==================== Types ====================

export interface CollectionTriggerResponse {
  collection_run_id: string;
  langgraph_run_id: string;
  workspace_id: string;
  status: 'triggered' | 'running' | 'completed' | 'failed';
  message?: string;
}

export interface CollectionStatusResponse {
  run_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  collection_run_id?: string;
  workspace_id?: string;
  progress?: {
    completed_tasks?: number;
    failed_tasks?: number;
    responses_collected?: number;
  };
  error?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionHistoryItem {
  collection_run_id: string;
  workspace_id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  prompt_count: number;
  provider_count: number;
  response_count: number;
  source?: string;
}

export interface CollectionHistoryResponse {
  workspace_id: string;
  collections: CollectionHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== Error Handling ====================

export class CollectionApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'CollectionApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Request failed';
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();

      // Backend returns detail as object with message field, or as string
      if (typeof errorData.detail === 'object' && errorData.detail?.message) {
        errorMessage = errorData.detail.message;
        errorCode = errorData.detail.error_code;
      } else {
        errorMessage = errorData.detail || errorData.message || errorMessage;
        errorCode = errorData.code;
      }
    } catch {
      // If response isn't JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new CollectionApiError(response.status, errorMessage, errorCode);
  }

  return response.json();
}

// ==================== Retry Logic ====================

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Retry a fetch request with exponential backoff for 503 errors
 *
 * This handles cases where the LangGraph server is temporarily unavailable
 * due to cold starts or temporary overload.
 */
async function fetchWithRetry(url: string, fetchOptions: RequestInit, retryOptions: RetryOptions = {}): Promise<Response> {
  const { maxRetries = 5, initialDelayMs = 1000, maxDelayMs = 30000, backoffMultiplier = 2 } = retryOptions;

  let lastError: Error | null = null;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // If not a 503 error, return immediately (let handleResponse deal with other errors)
      if (response.status !== 503) {
        return response;
      }

      // If this is the last attempt, return the 503 response
      if (attempt === maxRetries) {
        return response;
      }

      // Log retry attempt
      console.warn(
        `[CollectionsAPI] LangGraph server temporarily unavailable (503), ` + `retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Exponential backoff with max delay cap
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    } catch (error) {
      // Network errors or fetch failures
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt === maxRetries) {
        throw lastError;
      }

      console.warn(`[CollectionsAPI] Network error, retrying in ${delayMs}ms ` + `(attempt ${attempt + 1}/${maxRetries}): ${lastError.message}`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Max retries exceeded');
}

// ==================== API Functions ====================

export const collectionsApi = {
  /**
   * Trigger a synchronous collection for onboarding
   *
   * This waits for the collection to complete and returns the real
   * collection_run_id from the database. Used during onboarding flow
   * where users need immediate feedback.
   *
   * Typical duration: 5-10 minutes
   *
   * Includes retry logic for 503 errors (LangGraph server temporarily unavailable)
   */
  async triggerOnboardingCollection(token: string, workspaceId: string): Promise<CollectionTriggerResponse> {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/workspace/${workspaceId}/collections/trigger`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      {
        maxRetries: 5,
        initialDelayMs: 2000, // Start with 2 seconds
        maxDelayMs: 30000, // Cap at 30 seconds
        backoffMultiplier: 2, // Double the delay each time
      }
    );

    return handleResponse<CollectionTriggerResponse>(response);
  },

  /**
   * Trigger an asynchronous collection for manual refresh
   *
   * This returns immediately after triggering the workflow without
   * waiting for completion. Use getCollectionStatus() to poll for updates.
   *
   * Used for manual "Refresh Data" operations in the dashboard.
   */
  async triggerManualCollection(token: string, workspaceId: string): Promise<CollectionTriggerResponse> {
    const response = await fetch(`${API_BASE_URL}/collections/trigger`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
      }),
    });

    return handleResponse<CollectionTriggerResponse>(response);
  },

  /**
   * Get the status of a running or completed collection
   *
   * Poll this endpoint to track collection progress.
   * Returns current status, progress information, and collection_run_id when available.
   *
   * @param runId - The LangGraph run ID returned from trigger endpoints
   */
  async getCollectionStatus(token: string, runId: string): Promise<CollectionStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/collections/${runId}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<CollectionStatusResponse>(response);
  },

  /**
   * Get the latest collection run for a workspace
   *
   * This is optimized for onboarding polling where we don't have a
   * collection_run_id yet but need to detect when collection starts/completes.
   *
   * @param token - Auth token
   * @param workspaceId - The workspace to get latest collection for
   * @returns Latest collection status
   */
  async getLatestCollection(token: string, workspaceId: string): Promise<CollectionStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/collections/latest`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<CollectionStatusResponse>(response);
  },

  /**
   * Get collection history for a workspace
   *
   * Returns a paginated list of past collection runs with their status and metrics.
   *
   * @param workspaceId - The workspace to get history for
   * @param page - Page number (0-based)
   * @param limit - Items per page (default 10, max 100)
   */
  async getCollectionHistory(token: string, workspaceId: string, page: number = 0, limit: number = 10): Promise<CollectionHistoryResponse> {
    const offset = page * limit;
    const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/collections/history?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<CollectionHistoryResponse>(response);
  },

  /**
   * Helper: Poll collection status until completion
   *
   * Polls the status endpoint at regular intervals until the collection
   * reaches a terminal state (completed, failed, partial).
   *
   * @param token - Auth token
   * @param runId - LangGraph run ID
   * @param onProgress - Callback for progress updates
   * @param pollInterval - Milliseconds between polls (default 3000)
   * @param timeout - Maximum time to wait in milliseconds (default 600000 = 10 minutes)
   * @returns Final status response
   */
  async pollCollectionStatus(
    token: string,
    runId: string,
    onProgress?: (status: CollectionStatusResponse) => void,
    pollInterval: number = 3000,
    timeout: number = 600000
  ): Promise<CollectionStatusResponse> {
    const startTime = Date.now();

    while (true) {
      const status = await this.getCollectionStatus(token, runId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check for terminal states
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'partial') {
        return status;
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new CollectionApiError(408, `Collection timed out after ${timeout / 1000} seconds`, 'TIMEOUT');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  },
};
