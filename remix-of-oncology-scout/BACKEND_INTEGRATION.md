# Backend Integration Guide

This document explains how the TrialScout frontend connects to the backend API.

## Overview

The frontend has been integrated with the FastAPI backend to enable real-time trial matching using actual clinical trial data.

## Architecture

```
Frontend (React/TypeScript)
    ↓
API Client Layer (src/lib/api.ts)
    ↓
Backend API (FastAPI - Port 8000)
    ↓
Database (SQLite with trial data)
```

## Key Files

### 1. Type Definitions
- **`src/types/api.ts`**: TypeScript interfaces matching backend schemas
  - `PatientProfile`: Patient data structure for API
  - `MatchResponse`: Trial matching results
  - `MatchedTrial`: Individual trial match with scoring
  - `ClinicianBriefRequest/Response`: PDF generation

### 2. API Client
- **`src/lib/api.ts`**: Complete API client with all endpoints
  - `matchTrials()`: Match patient to trials
  - `getTrialDetails()`: Get specific trial info
  - `listTrials()`: Browse all trials
  - `generateClinicianBrief()`: Create PDF report
  - `checkHealth()`: Backend health check

### 3. React Hooks
- **`src/hooks/useTrialMatching.ts`**: Custom hooks for trial matching
  - `useTrialMatching()`: Main hook for matching trials
  - `useClinicianBrief()`: Hook for PDF generation
  - `useBackendHealth()`: Backend status monitoring

## Environment Configuration

### Development
Create `.env` file in `remix-of-oncology-scout/`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK_DATA=false
```

### Production
```env
VITE_API_BASE_URL=https://api.trialscout.com
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK_DATA=false
```

## Usage Examples

### 1. Matching Trials in a Component

```typescript
import { useTrialMatching } from '@/hooks/useTrialMatching';

function TrialResults({ patientData }: { patientData: PatientData }) {
  const {
    matchedTrials,
    possiblyEligibleCount,
    isLoading,
    error,
    rematch
  } = useTrialMatching(patientData);

  if (isLoading) return <div>Finding trials...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Found {possiblyEligibleCount} possibly eligible trials</h2>
      {matchedTrials.map(match => (
        <TrialCard key={match.trial.nct_number} match={match} />
      ))}
    </div>
  );
}
```

### 2. Generating Clinician Brief

```typescript
import { useClinicianBrief } from '@/hooks/useTrialMatching';

function DownloadButton({ patientData, matchedTrials }) {
  const { generateBrief, isGenerating } = useClinicianBrief();

  const handleDownload = async () => {
    await generateBrief(patientData, matchedTrials, 5);
  };

  return (
    <button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </button>
  );
}
```

### 3. Checking Backend Health

```typescript
import { useBackendHealth } from '@/hooks/useTrialMatching';

function HealthIndicator() {
  const { data, isError } = useBackendHealth();

  if (isError) return <div>Backend offline</div>;
  if (!data) return <div>Checking...</div>;

  return (
    <div>
      Backend: {data.status}
      <br />
      Trials: {data.total_trials}
      <br />
      Version: {data.dataset_version}
    </div>
  );
}
```

## Data Transformation

The frontend automatically transforms data between formats:

### Frontend → Backend
```typescript
// Frontend PatientData
{
  cancerType: 'breast',
  cancerStage: 'IV',
  biomarkerProfile: {
    hormoneReceptors: { ER: 'present', PR: 'present' },
    expression: { HER2: 'low' }
  }
}

// Transformed to Backend PatientProfile
{
  cancer_type: 'breast',
  stage: 'IV',
  biomarkers: {
    ER: { status: 'present' },
    PR: { status: 'present' },
    HER2: { status: 'present', subtype: 'low' }
  }
}
```

## Error Handling

The API client includes comprehensive error handling:

```typescript
try {
  const results = await api.trials.match(profile);
} catch (error) {
  if (error instanceof APIClientError) {
    if (error.status === 429) {
      // Rate limit exceeded
    } else if (error.status === 500) {
      // Server error
    } else {
      // Other API error
    }
  } else {
    // Network error
  }
}
```

## Starting the Backend

### Prerequisites
1. Python 3.8+
2. Install dependencies: `pip install -r requirements.txt`
3. Set up `.env` file in `trialscout-backend/`

### Run Backend
```bash
cd trialscout-backend
python run.py
```

Backend will start on `http://localhost:8000`

### Verify Backend
1. Open `http://localhost:8000/docs` for API documentation
2. Check health: `http://localhost:8000/api/health`

## Testing the Integration

### 1. Start Backend
```bash
cd trialscout-backend
python run.py
```

### 2. Start Frontend
```bash
cd remix-of-oncology-scout
npm run dev
```

### 3. Test Flow
1. Navigate to `http://localhost:5173`
2. Complete patient profile
3. Click "Find Trials"
4. Verify trials load from backend
5. Download clinician brief

## Troubleshooting

### Backend Not Connecting
- Check backend is running: `http://localhost:8000/api/health`
- Verify CORS settings in backend `.env`
- Check frontend `.env` has correct `VITE_API_BASE_URL`

### No Trials Returned
- Verify backend has seed data: Check `/api/trials` endpoint
- Run seed script: `python -m app.seed_data`
- Check patient profile matches trial criteria

### PDF Generation Fails
- Verify ReportLab is installed: `pip install reportlab`
- Check backend logs for errors
- Ensure adequate disk space

## Performance Considerations

- **Caching**: Trial matches are cached for 5 minutes
- **Timeouts**: 30s for matching, 60s for PDF generation
- **Rate Limiting**: Backend limits to 100 requests/hour/IP
- **Retry Logic**: Automatic retry with exponential backoff

## Security Notes

- No authentication required for MVP
- All data processed client-side and in-memory
- No PHI stored on backend
- CORS restricted to known origins

## Next Steps

1. **Production Deployment**
   - Deploy backend to cloud provider
   - Update `VITE_API_BASE_URL` to production URL
   - Enable HTTPS
   - Add authentication if needed

2. **Monitoring**
   - Add error tracking (Sentry)
   - Monitor API performance
   - Track match success rates

3. **Enhancements**
   - Add caching layer (Redis)
   - Implement user accounts
   - Add trial bookmarking
   - Enable email notifications

## Support

For integration issues:
1. Check backend logs
2. Review browser console for errors
3. Verify network requests in DevTools
4. Consult API documentation at `/docs`

---

**Last Updated**: February 7, 2025
**API Version**: 1.0.0