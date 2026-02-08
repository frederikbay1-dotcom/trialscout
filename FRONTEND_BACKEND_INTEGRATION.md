# Frontend-Backend Integration Guide

## Overview

This document describes the integration between the TrialScout frontend (React/TypeScript) and backend (FastAPI/Python).

## Updated Files

### Backend Changes
1. **New Model Structure**
   - [`trialscout-backend/app/models/patient.py`](trialscout-backend/app/models/patient.py:1) - Patient profile models
   - [`trialscout-backend/app/models/trial.py`](trialscout-backend/app/models/trial.py:1) - Trial models
   - [`trialscout-backend/app/models/matching.py`](trialscout-backend/app/models/matching.py:1) - Matching result models

2. **API Endpoints** (in [`trialscout-backend/app/main.py`](trialscout-backend/app/main.py:1))
   - `GET /health` - Health check
   - `GET /api/v1/trials` - List trials
   - `GET /api/v1/trials/{nct}` - Get trial details
   - `POST /api/v1/match` - Match patient to trials
   - Full CRUD operations (POST, PUT, PATCH, DELETE)

### Frontend Changes
1. **API Client** ([`remix-of-oncology-scout/src/lib/api.ts`](remix-of-oncology-scout/src/lib/api.ts:1))
   - Updated endpoint paths to `/api/v1/*`
   - Updated `/health` endpoint (no `/api` prefix)
   - Updated response handling for new structure

2. **Type Definitions** ([`remix-of-oncology-scout/src/types/api.ts`](remix-of-oncology-scout/src/types/api.ts:1))
   - New biomarker types (`BreastBiomarkers`, `LungBiomarkers`)
   - Updated `PatientProfile` structure
   - Updated `MatchResponse` structure (now uses `matches`, `context`, `stats`)

3. **Hooks** ([`remix-of-oncology-scout/src/hooks/useTrialMatching.ts`](remix-of-oncology-scout/src/hooks/useTrialMatching.ts:1))
   - Updated data transformation for new backend models
   - Updated response field access (`matches` instead of `matched_trials`)

## API Changes Summary

### Endpoint Changes

| Old Endpoint | New Endpoint | Change |
|-------------|--------------|--------|
| `GET /api/health` | `GET /health` | Removed `/api` prefix |
| `POST /api/match` | `POST /api/v1/match` | Added `/v1` version |
| `GET /api/trials/{nct}` | `GET /api/v1/trials/{nct}` | Added `/v1` version |
| `GET /api/trials` | `GET /api/v1/trials` | Added `/v1` version |

### Response Structure Changes

#### Match Response
**Old:**
```json
{
  "matched_trials": [...],
  "total_trials_evaluated": 20,
  "possibly_eligible_count": 5,
  "dataset_version": "1.0",
  "generated_at": "2025-02-07T12:00:00Z"
}
```

**New:**
```json
{
  "matches": [...],
  "context": {
    "patient": {...},
    "dataset_version": "1.0",
    "matched_at": "2025-02-07T12:00:00Z",
    "total_trials": 20
  },
  "stats": {
    "total_trials": 20,
    "possibly_eligible": 5,
    "likely_not_eligible": 10,
    "hard_excluded": 5
  }
}
```

#### Trial Details Response
**Old:**
```json
{
  "id": 1,
  "nct_number": "NCT05234567",
  ...
}
```

**New:**
```json
{
  "trial": {
    "id": "bc_trial_001",
    "nct_number": "NCT05234567",
    ...
  }
}
```

#### List Trials Response
**Old:**
```json
[
  {...},
  {...}
]
```

**New:**
```json
{
  "trials": [...],
  "total": 20,
  "limit": 20,
  "offset": 0
}
```

### Patient Profile Structure Changes

**Old:**
```typescript
{
  cancer_type: 'breast',
  stage: 'IV',
  biomarkers: {
    "HER2": { status: "present", subtype: "positive" },
    "ER": { status: "present" }
  },
  prior_therapies: ["CDK4/6 inhibitor"]
}
```

**New:**
```typescript
{
  age: 52,
  sex: 'female',
  cancer_type: 'breast',
  stage: 'IV',
  ecog: '1',
  biomarkers: {
    ER: 'present',
    PR: 'present',
    HER2: 'negative',
    Ki67: null
  },
  prior_treatments: [
    {
      category: 'targeted_therapy',
      name: 'CDK4/6 inhibitor'
    }
  ],
  line_of_therapy: 'post_targeted'
}
```

## Testing the Integration

### 1. Start Backend
```bash
cd trialscout-backend
python -m app.main
```
Backend runs at: http://localhost:8000

### 2. Start Frontend
```bash
cd remix-of-oncology-scout
npm run dev
```
Frontend runs at: http://localhost:5173

### 3. Test Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "dataset_version": "1.0",
  "last_updated": "2025-02-08T...",
  "total_trials": 4
}
```

### 4. Test Trial Listing
```bash
curl http://localhost:8000/api/v1/trials
```

### 5. Test Matching (via Frontend)
1. Open http://localhost:5173
2. Click "Start Assessment" or "Try with Sample Patient"
3. Complete the intake flow
4. View matched trials on results page

## Environment Configuration

### Backend (`.env`)
```env
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://trialscout.com
DATASET_VERSION=1.0
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK_DATA=false
```

## Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Ensure backend `.env` includes frontend URL in `ALLOWED_ORIGINS`

### Issue: 404 on `/api/health`
**Solution:** Use `/health` instead (no `/api` prefix)

### Issue: Match response fields undefined
**Solution:** Access `response.matches` instead of `response.matched_trials`

### Issue: Trial details not loading
**Solution:** Check response structure - trial data is now in `response.trial` object

## Data Flow

```
Frontend (React)
    ↓
PatientData (frontend types)
    ↓
transformPatientDataToProfile()
    ↓
PatientProfile (API types)
    ↓
POST /api/v1/match
    ↓
Backend (FastAPI)
    ↓
Matching Engine
    ↓
MatchingResponse
    ↓
Frontend receives matches
    ↓
Display results
```

## Next Steps

1. **Add More Trials**: Expand mock data to 20 trials
2. **Error Handling**: Improve error messages and retry logic
3. **Loading States**: Add better loading indicators
4. **Caching**: Implement proper cache invalidation
5. **Testing**: Add integration tests

## Support

- Backend API Docs: http://localhost:8000/docs
- Backend Spec: [`TrialScout_Backend_Spec.md`](TrialScout_Backend_Spec.md:1)
- Backend Summary: [`trialscout-backend/BACKEND_UPDATE_SUMMARY.md`](trialscout-backend/BACKEND_UPDATE_SUMMARY.md:1)