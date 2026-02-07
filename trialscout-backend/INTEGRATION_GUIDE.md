# TrialScout Backend Integration Guide

This guide explains how to integrate the TrialScout backend API with your frontend application.

## Base URL

**Development**: `http://localhost:8000`  
**Production**: `https://your-domain.com` (to be configured)

## Authentication

No authentication required for MVP. All endpoints are publicly accessible with rate limiting (100 requests/IP/hour).

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)

Update `CORS_ORIGINS` in `.env` for production domains.

## Frontend Integration Examples

### 1. Match Patient to Trials

```typescript
// types.ts
interface PatientProfile {
  cancer_type: 'breast' | 'lung';
  stage: 'I' | 'II' | 'III' | 'IV';
  age?: number;
  sex?: string;
  ecog?: number;
  biomarkers: {
    [key: string]: {
      status: 'present' | 'absent' | 'unknown';
      subtype?: string;
    };
  };
  prior_therapies: string[];
  current_line?: string;
}

interface MatchedTrial {
  trial: {
    nct_number: string;
    title: string;
    phase: string;
    status: string;
    location: string;
    distance_miles: number;
  };
  score: number;
  confidence: 'high' | 'medium' | 'low';
  why_matched: Array<{
    criterion: string;
    met: boolean;
    description: string;
  }>;
  what_to_confirm: Array<{
    item: string;
    description: string;
    priority: string;
  }>;
  patient_burden: {
    visits_per_month?: string;
    imaging_frequency?: string;
    biopsy_required?: boolean;
    hospital_stays?: boolean;
  };
}

interface MatchResponse {
  matched_trials: MatchedTrial[];
  total_trials_evaluated: number;
  possibly_eligible_count: number;
  dataset_version: string;
  generated_at: string;
}

// api.ts
const API_BASE_URL = 'http://localhost:8000';

export async function matchTrials(
  patientProfile: PatientProfile
): Promise<MatchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientProfile),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Usage in React component
import { useState } from 'react';
import { matchTrials } from './api';

function TrialMatcher() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResponse | null>(null);

  const handleMatch = async (profile: PatientProfile) => {
    setLoading(true);
    try {
      const data = await matchTrials(profile);
      setResults(data);
    } catch (error) {
      console.error('Error matching trials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Matching trials...</p>}
      {results && (
        <div>
          <h2>Found {results.possibly_eligible_count} possibly eligible trials</h2>
          {results.matched_trials.map((match) => (
            <TrialCard key={match.trial.nct_number} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Get Trial Details

```typescript
interface TrialDetail {
  id: number;
  nct_number: string;
  title: string;
  phase: string;
  sponsor: string;
  status: string;
  location: string;
  distance_miles: number;
  cancer_type: string;
  last_updated: string;
  eligibility_criteria: Array<{
    criterion: string;
    category: string;
    required: boolean;
  }>;
  metadata_fields: Array<{
    field_name: string;
    field_value: string;
  }>;
}

export async function getTrialDetails(nctId: string): Promise<TrialDetail> {
  const response = await fetch(`${API_BASE_URL}/api/trials/${nctId}`);
  
  if (!response.ok) {
    throw new Error(`Trial not found: ${nctId}`);
  }
  
  return response.json();
}

// Usage
const trialDetails = await getTrialDetails('NCT05123456');
```

### 3. Generate Clinician Brief

```typescript
interface ClinicianBriefRequest {
  patient_profile: PatientProfile;
  matched_trials: MatchedTrial[];
  top_n?: number; // default: 5
}

interface ClinicianBriefResponse {
  pdf_base64: string;
  filename: string;
  generated_at: string;
}

export async function generateClinicianBrief(
  request: ClinicianBriefRequest
): Promise<ClinicianBriefResponse> {
  const response = await fetch(`${API_BASE_URL}/api/brief`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to generate brief');
  }

  return response.json();
}

// Download PDF helper
export function downloadPDF(base64: string, filename: string) {
  const linkSource = `data:application/pdf;base64,${base64}`;
  const downloadLink = document.createElement('a');
  downloadLink.href = linkSource;
  downloadLink.download = filename;
  downloadLink.click();
}

// Usage in React component
async function handleDownloadBrief() {
  try {
    const brief = await generateClinicianBrief({
      patient_profile: patientProfile,
      matched_trials: matchedTrials,
      top_n: 5,
    });
    
    downloadPDF(brief.pdf_base64, brief.filename);
  } catch (error) {
    console.error('Error generating brief:', error);
  }
}
```

### 4. Health Check

```typescript
interface HealthResponse {
  status: string;
  dataset_version: string;
  last_updated: string;
  total_trials: number;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
}

// Usage - check on app startup
useEffect(() => {
  checkHealth().then((health) => {
    console.log('Backend status:', health.status);
    console.log('Dataset version:', health.dataset_version);
  });
}, []);
```

### 5. List All Trials

```typescript
interface ListTrialsParams {
  cancer_type?: 'breast' | 'lung';
  status?: string;
  skip?: number;
  limit?: number;
}

export async function listTrials(
  params: ListTrialsParams = {}
): Promise<TrialDetail[]> {
  const queryParams = new URLSearchParams();
  
  if (params.cancer_type) queryParams.append('cancer_type', params.cancer_type);
  if (params.status) queryParams.append('status', params.status);
  if (params.skip) queryParams.append('skip', params.skip.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/api/trials?${queryParams.toString()}`
  );
  
  return response.json();
}

// Usage
const breastTrials = await listTrials({ 
  cancer_type: 'breast', 
  status: 'recruiting' 
});
```

## Error Handling

```typescript
// Create a custom error handler
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        error.detail || response.statusText
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Network error: Unable to reach API');
  }
}

// Usage with error handling
try {
  const results = await matchTrials(profile);
  setResults(results);
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 429) {
      showError('Rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      showError('Server error. Please try again.');
    } else {
      showError(error.message);
    }
  } else {
    showError('Unable to connect to server. Please check your connection.');
  }
}
```

## Rate Limiting

The API enforces rate limiting:
- **Limit**: 100 requests per IP per hour
- **Response**: HTTP 429 (Too Many Requests)
- **Retry**: Wait for rate limit reset (check `Retry-After` header)

```typescript
// Handle rate limiting
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      
      return response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## Performance Considerations

1. **Caching**: Cache trial details and health check responses
2. **Debouncing**: Debounce match requests during form input
3. **Loading States**: Show loading indicators for API calls
4. **Error Boundaries**: Wrap API calls in error boundaries
5. **Timeouts**: Set reasonable timeouts (30s for match, 60s for PDF)

```typescript
// Example with timeout
async function matchTrialsWithTimeout(
  profile: PatientProfile,
  timeoutMs = 30000
): Promise<MatchResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal: controller.signal,
    });
    
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
```

## Testing

```typescript
// Mock API for testing
export const mockAPI = {
  matchTrials: async (profile: PatientProfile): Promise<MatchResponse> => {
    return {
      matched_trials: [
        {
          trial: {
            nct_number: 'NCT05123456',
            title: 'Test Trial',
            phase: 'II',
            status: 'recruiting',
            location: 'Test Hospital',
            distance_miles: 5,
          },
          score: 97,
          confidence: 'high',
          why_matched: [],
          what_to_confirm: [],
          patient_burden: {},
        },
      ],
      total_trials_evaluated: 10,
      possibly_eligible_count: 5,
      dataset_version: '1.0',
      generated_at: new Date().toISOString(),
    };
  },
};

// Use in tests
import { mockAPI } from './mockAPI';

test('displays matched trials', async () => {
  const results = await mockAPI.matchTrials(testProfile);
  expect(results.matched_trials).toHaveLength(1);
});
```

## Environment Configuration

```typescript
// config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiTimeout: 30000,
  maxRetries: 3,
};

// .env.development
VITE_API_BASE_URL=http://localhost:8000

// .env.production
VITE_API_BASE_URL=https://api.trialscout.com
```

## Support

For integration issues:
1. Check API documentation: http://localhost:8000/docs
2. Verify CORS configuration
3. Check network tab for request/response details
4. Review backend logs for errors

---

**Last Updated**: February 7, 2025  
**API Version**: 1.0.0