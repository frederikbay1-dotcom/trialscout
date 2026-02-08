/**
 * TrialScout API Client
 * Handles all communication with the backend API
 */

import type {
  PatientProfile,
  MatchResponse,
  TrialFullDetail,
  TrialDetail,
  ClinicianBriefRequest,
  ClinicianBriefResponse,
  HealthResponse,
  APIError,
} from '@/types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Custom API Error class
 */
export class APIClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

/**
 * Fetch wrapper with error handling and timeout
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
  timeoutMs: number = API_TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorDetail = response.statusText;
      let errorMessage = response.statusText;
      
      try {
        const errorData: any = await response.json();
        
        // Handle validation errors (422)
        if (response.status === 422 && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) =>
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          errorMessage = `Validation Error: ${validationErrors}`;
          errorDetail = validationErrors;
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
          errorDetail = errorMessage;
        }
      } catch {
        // If JSON parsing fails, use statusText
      }

      throw new APIClientError(response.status, errorMessage, errorDetail);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof APIClientError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIClientError(408, 'Request timeout', 'The request took too long to complete');
    }

    throw new APIClientError(
      0,
      'Network error',
      'Unable to connect to the server. Please check your connection.'
    );
  }
}

/**
 * Health Check
 * Check backend status and dataset information
 */
export async function checkHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>('/health');
}

/**
 * Match Trials
 * Match patient profile against available trials
 */
export async function matchTrials(
  patientProfile: PatientProfile
): Promise<MatchResponse> {
  return fetchAPI<MatchResponse>(
    '/api/v1/match',
    {
      method: 'POST',
      body: JSON.stringify(patientProfile),
    },
    30000 // 30 second timeout for matching
  );
}

/**
 * Get Trial Details
 * Get full details for a specific trial by NCT number
 */
export async function getTrialDetails(nctId: string): Promise<{ trial: TrialFullDetail }> {
  return fetchAPI<{ trial: TrialFullDetail }>(`/api/v1/trials/${nctId}`);
}

/**
 * List Trials
 * List all trials with optional filtering
 */
export async function listTrials(params?: {
  cancer_type?: 'breast' | 'lung';
  status?: string;
  offset?: number;
  limit?: number;
}): Promise<{ trials: TrialDetail[]; total: number; limit: number; offset: number }> {
  const queryParams = new URLSearchParams();

  if (params?.cancer_type) queryParams.append('cancer_type', params.cancer_type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/v1/trials?${queryString}` : '/api/v1/trials';

  return fetchAPI<{ trials: TrialDetail[]; total: number; limit: number; offset: number }>(endpoint);
}

/**
 * Generate Clinician Brief
 * Generate a PDF brief for the clinician
 */
export async function generateClinicianBrief(
  request: ClinicianBriefRequest
): Promise<ClinicianBriefResponse> {
  return fetchAPI<ClinicianBriefResponse>(
    '/api/brief',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    60000 // 60 second timeout for PDF generation
  );
}

/**
 * Download PDF Helper
 * Download a PDF from base64 string
 */
export function downloadPDF(base64: string, filename: string): void {
  const linkSource = `data:application/pdf;base64,${base64}`;
  const downloadLink = document.createElement('a');
  downloadLink.href = linkSource;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

/**
 * Fetch with Retry
 * Retry failed requests with exponential backoff
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof APIClientError) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Handle rate limiting
        if (error.status === 429) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Retry on server errors (5xx) or network errors
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * API Client Object
 * Convenient object-based API for all endpoints
 */
export const api = {
  health: {
    check: checkHealth,
  },
  trials: {
    match: matchTrials,
    getDetails: getTrialDetails,
    list: listTrials,
  },
  brief: {
    generate: generateClinicianBrief,
    download: downloadPDF,
  },
  utils: {
    retry: fetchWithRetry,
  },
};

export default api;