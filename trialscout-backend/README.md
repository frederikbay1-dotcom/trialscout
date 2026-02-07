# TrialScout Backend API

AI-Powered Clinical Trial Matching for Cancer Patients - Backend Service

## Overview

This is the backend API for TrialScout, implementing a rule-based matching engine for clinical trials as specified in the PRD v1.0. The API provides endpoints for:

- **Trial Matching**: Match patient profiles against available trials
- **Trial Details**: Retrieve detailed information about specific trials
- **Clinician Briefs**: Generate PDF reports for oncologist discussions
- **Health Checks**: Monitor system status and data freshness

## Technology Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (via SQLAlchemy ORM)
- **PDF Generation**: ReportLab
- **API Documentation**: OpenAPI/Swagger (auto-generated)

## Architecture

```
┌─────────────────────────────────────────────┐
│ FRONTEND (React/TypeScript)                 │
│ • Lovable.dev deployment                    │
│ • sessionStorage only (no cookies)          │
└─────────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────────┐
│ BACKEND API (Python FastAPI)                │
│ • Endpoints: /match, /trials, /brief        │
│ • Rule-based matching engine                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ DATABASE (PostgreSQL)                       │
│ • Tables: trials, eligibility, metadata     │
│ • Read-only for matching (no PHI stored)    │
└─────────────────────────────────────────────┘
```

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository** (if not already done)

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/trialscout
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   RATE_LIMIT_PER_HOUR=100
   DATASET_VERSION=1.0
   ```

5. **Create PostgreSQL database**:
   ```sql
   CREATE DATABASE trialscout;
   ```

6. **Seed the database** with sample trials:
   ```bash
   python -m app.seed_data
   ```

7. **Run the server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

8. **Access API documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check

**GET** `/api/health`

Returns system status and dataset information.

**Response**:
```json
{
  "status": "ok",
  "dataset_version": "1.0",
  "last_updated": "2025-02-07",
  "total_trials": 20
}
```

### Match Trials

**POST** `/api/match`

Match patient profile against available trials using rule-based algorithm.

**Request Body**:
```json
{
  "cancer_type": "breast",
  "stage": "IV",
  "age": 52,
  "sex": "female",
  "ecog": 1,
  "biomarkers": {
    "ER": {
      "status": "present",
      "subtype": "positive"
    },
    "HER2": {
      "status": "absent"
    }
  },
  "prior_therapies": ["CDK4/6 inhibitor", "Aromatase inhibitor"],
  "current_line": "post-targeted"
}
```

**Response**:
```json
{
  "matched_trials": [
    {
      "trial": {
        "nct_number": "NCT05123456",
        "title": "Phase II Study of...",
        "phase": "II",
        "status": "recruiting",
        "location": "Memorial Sloan Kettering, NY",
        "distance_miles": 5
      },
      "score": 97,
      "confidence": "high",
      "why_matched": [
        {
          "criterion": "Cancer Type",
          "met": true,
          "description": "Breast cancer, Stage IV"
        }
      ],
      "what_to_confirm": [
        {
          "item": "Washout Period",
          "description": "Confirm adequate washout from last therapy",
          "priority": "medium"
        }
      ],
      "patient_burden": {
        "visits_per_month": "2-3",
        "imaging_frequency": "Every 8 weeks",
        "biopsy_required": false,
        "hospital_stays": false
      }
    }
  ],
  "total_trials_evaluated": 10,
  "possibly_eligible_count": 5,
  "dataset_version": "1.0",
  "generated_at": "2025-02-07T15:30:00"
}
```

**Performance**: <3 seconds for 95th percentile

### Get Trial Details

**GET** `/api/trials/{nct_id}`

Retrieve full details for a specific trial.

**Example**: `/api/trials/NCT05123456`

**Response**:
```json
{
  "id": 1,
  "nct_number": "NCT05123456",
  "title": "Phase II Study of...",
  "phase": "II",
  "sponsor": "Memorial Sloan Kettering",
  "status": "recruiting",
  "location": "Memorial Sloan Kettering, NY",
  "distance_miles": 5,
  "cancer_type": "breast",
  "last_updated": "2025-02-07",
  "eligibility_criteria": [
    {
      "criterion": "HER2-low breast cancer",
      "category": "biomarker",
      "required": true
    }
  ],
  "metadata_fields": [
    {
      "field_name": "translatedInfo.design",
      "field_value": "Testing a new antibody-drug conjugate..."
    }
  ]
}
```

### Generate Clinician Brief

**POST** `/api/brief`

Generate PDF clinician brief for oncologist discussion.

**Request Body**:
```json
{
  "patient_profile": { /* same as match request */ },
  "matched_trials": [ /* array of matched trials */ ],
  "top_n": 5
}
```

**Response**:
```json
{
  "pdf_base64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC...",
  "filename": "TrialScout_Brief_20250207.pdf",
  "generated_at": "2025-02-07T15:30:00"
}
```

**Performance**: <5 seconds

### List Trials

**GET** `/api/trials`

List all trials with optional filtering.

**Query Parameters**:
- `cancer_type`: Filter by cancer type (breast, lung)
- `status`: Filter by recruiting status
- `skip`: Pagination offset (default: 0)
- `limit`: Max results (default: 100)

**Example**: `/api/trials?cancer_type=breast&status=recruiting&limit=10`

## Matching Algorithm

The matching engine implements a deterministic, rule-based algorithm as specified in the PRD:

### Hard Exclusions (Trial immediately excluded)

- Cancer type mismatch
- Stage-specific exclusions (e.g., Stage IV patients excluded from neoadjuvant trials)
- ECOG requirements (e.g., ECOG 3-4 excluded from ECOG 0-1 trials)
- Biomarker exclusions:
  - HER2+ trials exclude HER2- or HER2-low patients
  - EGFR-mutant trials exclude ALK+ or ROS1+ patients
- Prior therapy exclusions (e.g., "no prior osimertinib")

### Match Scoring (85-99 range)

- **Base score**: 85 points
- **+5 points**: All major biomarkers confirmed match
- **+3 points**: ECOG explicitly meets requirement
- **+2 points**: Trial location <10 miles
- **+5 points**: First-line trial and patient is first-line
- **-5 points**: Any "What to Confirm" item present
- **Cap**: 99 (never 100 to avoid false certainty)

### Confidence Levels

- **High**: Score ≥95, all major criteria met, ≤1 "What to Confirm" item
- **Medium**: Score 90-94, OR ≥2 "What to Confirm" items
- **Low**: Score <90, OR critical biomarker unknown

## Database Schema

### trials table
```sql
CREATE TABLE trials (
  id SERIAL PRIMARY KEY,
  nct_number VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  phase VARCHAR(20),
  sponsor VARCHAR(255),
  status VARCHAR(20),
  location VARCHAR(255),
  distance_miles INT,
  cancer_type VARCHAR(20),
  last_updated DATE NOT NULL,
  eligibility_score VARCHAR(20),
  match_confidence VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### eligibility_criteria table
```sql
CREATE TABLE eligibility_criteria (
  id SERIAL PRIMARY KEY,
  trial_id INT REFERENCES trials(id),
  criterion TEXT NOT NULL,
  category VARCHAR(50),
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### trial_metadata table
```sql
CREATE TABLE trial_metadata (
  id SERIAL PRIMARY KEY,
  trial_id INT REFERENCES trials(id),
  field_name VARCHAR(100),
  field_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Sample Data

The database is seeded with 20 trials (10 breast cancer, 10 lung cancer) covering:

- **Breast Cancer**: HER2-low, triple-negative, ER+/HER2-, immunotherapy combinations
- **Lung Cancer**: EGFR-mutant, ALK-positive, KRAS G12C, MET-altered, immunotherapy

All trials are located in NYC metro area (5-8 miles from Manhattan).

## Testing

### Manual Testing

1. Start the server: `uvicorn app.main:app --reload`
2. Open Swagger UI: http://localhost:8000/docs
3. Try the `/api/match` endpoint with sample patient data
4. Verify response includes matched trials with scores and reasoning

### Example Test Cases

**Test Case 1: HER2-Low Breast Cancer**
```json
{
  "cancer_type": "breast",
  "stage": "IV",
  "ecog": 1,
  "biomarkers": {
    "HER2": {"status": "present", "subtype": "low"},
    "ER": {"status": "present"},
    "PR": {"status": "present"}
  },
  "prior_therapies": ["Endocrine therapy"],
  "current_line": "second-line"
}
```
Expected: Should match NCT05123456 (HER2-low trial) with high confidence

**Test Case 2: EGFR-Mutant NSCLC**
```json
{
  "cancer_type": "lung",
  "stage": "IV",
  "ecog": 1,
  "biomarkers": {
    "EGFR": {"status": "present", "subtype": "exon 19 deletion"}
  },
  "prior_therapies": ["Gefitinib"],
  "current_line": "post-targeted"
}
```
Expected: Should match NCT05678901 (Osimertinib trial) with high confidence

## Deployment

### Production Checklist

- [ ] Set strong database password
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure error tracking (Sentry)
- [ ] Set up monitoring (uptime checks)
- [ ] Enable database backups
- [ ] Review and update disclaimers

### Recommended Hosting

- **Backend**: Replit, Vercel, Railway, or Render
- **Database**: Supabase (managed PostgreSQL)
- **Monitoring**: UptimeRobot, Sentry

## Security

- **HTTPS only**: All endpoints require SSL/TLS
- **CORS**: Restricted to allowed origins
- **Rate limiting**: 100 requests/IP/hour
- **No PHI storage**: Patient data never persisted
- **Input validation**: All inputs sanitized
- **No API keys exposed**: Server-side only

## Privacy & Compliance

- **No PHI stored**: All patient data exists only in request/response
- **No user accounts**: No email, name, or identifiers collected
- **HIPAA**: Not applicable (no PHI created or stored)
- **Disclaimers**: "For educational purposes only" on all outputs

## Support

For questions or issues:
- Review API documentation: http://localhost:8000/docs
- Check PRD: `TrialScout_PRD_v1.0.md`
- Contact: product@trialscout.com

## License

Proprietary - TrialScout © 2025

---

**Version**: 1.0.0  
**Last Updated**: February 7, 2025  
**Status**: MVP - Limited Beta