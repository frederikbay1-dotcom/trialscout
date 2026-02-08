# TrialScout Backend API Specification
**FastAPI Backend with Matching Engine & Trial Data**

**Version:** 1.0  
**Date:** February 7, 2025  
**Purpose:** Backend specification for Snapdev to build matching engine API  
**Stack:** Python 3.11+ | FastAPI | Pydantic | No database (in-memory for now)

---

## Overview

This backend provides REST APIs for the TrialScout frontend to:
1. **Match patients to clinical trials** using rule-based matching logic
2. **Serve trial data** (20 mock trials: 10 breast, 10 NSCLC)
3. **Generate clinician briefs** (return structured data for PDF generation)
4. **Health checks** and monitoring

**Key Principles:**
- ✅ **Deterministic matching**: Same input always produces same output
- ✅ **No database (yet)**: All data in-memory (Python dictionaries/lists)
- ✅ **Stateless**: No session management, no user accounts
- ✅ **CORS enabled**: Frontend can call from localhost or trialscout.com
- ✅ **Fast**: <3 seconds for matching endpoint
- ✅ **Type-safe**: Full Pydantic models for all requests/responses

---

## Project Structure

```
trialscout-backend/
├── main.py                    # FastAPI app entry point
├── requirements.txt           # Python dependencies
├── README.md                  # Setup and deployment instructions
├── .env.example              # Environment variables template
├── app/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── patient.py        # PatientProfile, Biomarkers models
│   │   ├── trial.py          # Trial, EligibilityCriterion models
│   │   └── matching.py       # MatchResult, MatchingResponse models
│   ├── data/
│   │   ├── __init__.py
│   │   ├── mock_trials.py    # 20 trial objects (breast + NSCLC)
│   │   └── constants.py      # Thresholds, labels, config
│   ├── matching/
│   │   ├── __init__.py
│   │   ├── matcher.py        # Main matching function
│   │   ├── rules.py          # Hard exclusion rules
│   │   ├── scorer.py         # Score calculation
│   │   └── reason_generator.py  # Generate "why matched" text
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py         # Health check endpoint
│   │   ├── trials.py         # Trial CRUD endpoints
│   │   └── matching.py       # Matching endpoint
│   └── utils/
│       ├── __init__.py
│       └── helpers.py        # Date formatting, distance calc, etc.
└── tests/
    ├── __init__.py
    ├── test_matcher.py       # Unit tests for matching logic
    ├── test_rules.py         # Tests for exclusion rules
    └── test_api.py           # Integration tests for API endpoints
```

---

## Technology Stack

| Component | Technology | Version | Why |
|-----------|-----------|---------|-----|
| **Framework** | FastAPI | 0.109+ | Modern, async, auto-docs, fast |
| **Python** | Python | 3.11+ | Type hints, performance |
| **Validation** | Pydantic | 2.5+ | Data validation, serialization |
| **CORS** | fastapi-cors | Built-in | Enable frontend calls |
| **Testing** | pytest | 7.4+ | Unit and integration tests |
| **Linting** | ruff | 0.1+ | Fast Python linter |

---

## Installation & Setup

### `requirements.txt`

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.26.0
```

### `.env.example`

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://trialscout.com

# Data
DATASET_VERSION=1.0
```

### `README.md` (for Snapdev to generate)

```markdown
# TrialScout Backend API

FastAPI backend for clinical trial matching.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest tests/ -v
```
```

---

## Data Models (Pydantic)

### `app/models/patient.py`

```python
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from enum import Enum

class CancerType(str, Enum):
    BREAST = "breast"
    LUNG = "lung"

class Stage(str, Enum):
    I = "I"
    II = "II"
    III = "III"
    IV = "IV"

class ECOG(str, Enum):
    ZERO = "0"
    ONE = "1"
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    UNKNOWN = "unknown"

class BiomarkerStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    UNKNOWN = "unknown"

class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class LineOfTherapy(str, Enum):
    FIRST = "first"
    POST_TARGETED = "post_targeted"
    LATER_LINE = "later_line"

# Breast cancer biomarkers
class BreastBiomarkers(BaseModel):
    ER: BiomarkerStatus = Field(..., description="Estrogen receptor status")
    PR: BiomarkerStatus = Field(..., description="Progesterone receptor status")
    HER2: Literal["positive", "low", "negative", "unknown"] = Field(..., description="HER2 status")
    Ki67: Optional[int] = Field(None, ge=0, le=100, description="Ki67 percentage")

# Lung cancer biomarkers
class EGFRMutation(BaseModel):
    status: BiomarkerStatus
    mutation: Optional[Literal["Exon 19 deletion", "L858R", "Exon 20 insertion", "T790M", "Other"]] = None

class KRASMutation(BaseModel):
    status: BiomarkerStatus
    mutation: Optional[Literal["G12C", "G12D", "G12V", "Other"]] = None

class METAlteration(BaseModel):
    status: BiomarkerStatus
    alteration: Optional[Literal["Exon 14 skipping", "Amplification"]] = None

class PDL1Expression(BaseModel):
    status: BiomarkerStatus
    percentage: Optional[int] = Field(None, ge=0, le=100, description="TPS (Tumor Proportion Score)")

class LungBiomarkers(BaseModel):
    EGFR: EGFRMutation
    ALK: BiomarkerStatus
    ROS1: BiomarkerStatus
    KRAS: KRASMutation
    MET: METAlteration
    BRAF: BiomarkerStatus
    PDL1: PDL1Expression

# Prior treatment
class PriorTreatment(BaseModel):
    category: Literal["surgery", "radiation", "chemotherapy", "targeted_therapy", "immunotherapy", "hormone_therapy"]
    name: Optional[str] = None  # e.g., "Osimertinib", "Letrozole"
    start_date: Optional[str] = None  # ISO date
    end_date: Optional[str] = None

# Main patient profile
class PatientProfile(BaseModel):
    # Demographics
    age: int = Field(..., ge=18, le=120, description="Patient age")
    sex: Sex
    
    # Cancer details
    cancer_type: CancerType
    stage: Stage
    ecog: ECOG
    
    # Biomarkers (discriminated union based on cancer_type)
    biomarkers: BreastBiomarkers | LungBiomarkers
    
    # Treatment history
    prior_treatments: List[PriorTreatment] = Field(default_factory=list)
    line_of_therapy: LineOfTherapy
    
    class Config:
        json_schema_extra = {
            "example": {
                "age": 52,
                "sex": "female",
                "cancer_type": "breast",
                "stage": "IV",
                "ecog": "1",
                "biomarkers": {
                    "ER": "present",
                    "PR": "present",
                    "HER2": "negative",
                    "Ki67": None
                },
                "prior_treatments": [
                    {
                        "category": "targeted_therapy",
                        "name": "Palbociclib + Letrozole"
                    }
                ],
                "line_of_therapy": "post_targeted"
            }
        }
```

### `app/models/trial.py`

```python
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from app.models.patient import CancerType

class EligibilityCriterion(BaseModel):
    criterion: str = Field(..., description="Human-readable criterion")
    met: bool | Literal["unknown"] = Field(..., description="Whether patient meets this criterion")
    category: Literal[
        "biomarker", "stage", "treatment_history", "performance", 
        "organ_function", "metastases", "demographics", 
        "disease_characteristics", "histology"
    ]

class PatientBurden(BaseModel):
    visits_per_month: int = Field(..., ge=0, le=10)
    imaging_frequency: str = Field(..., description="e.g., 'Every 6 weeks'")
    biopsy_required: bool
    hospital_stays: bool

class ExclusionRisks(BaseModel):
    prior_drug_exposure: str = Field(..., description="e.g., 'No prior osimertinib'")
    washout_window: str = Field(..., description="e.g., '14 days from last chemotherapy'")
    lab_thresholds: str = Field(..., description="e.g., 'ANC ≥1500/μL'")
    brain_mets: str = Field(..., description="e.g., 'Stable brain metastases allowed'")

class TranslatedInfo(BaseModel):
    design: str = Field(..., description="What's being tested (plain English)")
    goal: str = Field(..., description="The trial's objective")
    what_happens: str = Field(..., description="What patients will do")
    duration: str = Field(..., description="How long treatment lasts")

class Trial(BaseModel):
    # Basic info
    id: str = Field(..., description="Unique trial ID (e.g., 'bc_trial_001')")
    nct_number: str = Field(..., pattern=r"NCT\d{8}", description="ClinicalTrials.gov NCT number")
    title: str
    phase: Literal["Phase I", "Phase I/II", "Phase II", "Phase II/III", "Phase III"]
    sponsor: str
    status: Literal["recruiting", "active_not_recruiting", "completed"] = "recruiting"
    
    # Location
    location: str = Field(..., description="Hospital name, City, State")
    distance: int = Field(..., ge=0, description="Miles from patient (for NYC: 8-20)")
    
    # Cancer type
    cancer_type: CancerType
    
    # Eligibility (pre-computed from trial data, not from patient)
    eligibility_score: Literal["possibly_eligible", "likely_not_eligible"]
    match_confidence: Literal["high", "medium", "low"]
    
    # Matching reasons (generated dynamically by matcher)
    why_matched: List[str] = Field(default_factory=list)
    what_to_confirm: List[str] = Field(default_factory=list)
    
    # Detailed eligibility
    eligibility_criteria: List[EligibilityCriterion]
    
    # Patient burden
    burden: PatientBurden
    
    # Exclusions
    exclusion_risks: ExclusionRisks
    
    # Plain-language info
    translated_info: TranslatedInfo
    
    # Metadata
    last_updated: str = Field(..., description="ISO date")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "bc_trial_001",
                "nct_number": "NCT05234567",
                "title": "DESTINY-Breast06: Trastuzumab Deruxtecan in HER2-Low",
                "phase": "Phase III",
                "sponsor": "Daiichi Sankyo",
                "status": "recruiting",
                "location": "Memorial Sloan Kettering Cancer Center, New York, NY",
                "distance": 8,
                "cancer_type": "breast",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "eligibility_criteria": [],
                "burden": {
                    "visits_per_month": 2,
                    "imaging_frequency": "Every 6 weeks",
                    "biopsy_required": False,
                    "hospital_stays": False
                },
                "exclusion_risks": {
                    "prior_drug_exposure": "No prior T-DXd",
                    "washout_window": "21 days from last therapy",
                    "lab_thresholds": "ANC ≥1500/μL",
                    "brain_mets": "Stable brain metastases allowed"
                },
                "translated_info": {
                    "design": "An antibody-drug conjugate targeting HER2-low cancer cells",
                    "goal": "To see if T-DXd works better than standard chemotherapy",
                    "what_happens": "IV infusion every 3 weeks, scans every 6 weeks",
                    "duration": "Treatment continues as long as it's working, typically 12-18 months"
                },
                "last_updated": "2025-01-15"
            }
        }
```

### `app/models/matching.py`

```python
from pydantic import BaseModel, Field
from typing import List
from app.models.trial import Trial
from app.models.patient import PatientProfile

class MatchResult(BaseModel):
    trial: Trial
    score: int = Field(..., ge=85, le=99, description="Match score (85-99, never 100)")
    confidence: Literal["high", "medium", "low"]
    why_matched: List[str] = Field(..., description="2-4 specific reasons")
    what_to_confirm: List[str] = Field(..., description="1-3 items to verify")
    excluded_by: Optional[str] = Field(None, description="If hard-excluded, reason why")

class MatchingContext(BaseModel):
    patient: PatientProfile
    dataset_version: str = "1.0"
    matched_at: str = Field(..., description="ISO timestamp")
    total_trials: int

class MatchingStats(BaseModel):
    total_trials: int
    possibly_eligible: int
    likely_not_eligible: int
    hard_excluded: int

class MatchingResponse(BaseModel):
    matches: List[MatchResult] = Field(..., description="Sorted: possibly_eligible first, then by score")
    context: MatchingContext
    stats: MatchingStats

    class Config:
        json_schema_extra = {
            "example": {
                "matches": [
                    {
                        "trial": {},  # Full trial object
                        "score": 97,
                        "confidence": "high",
                        "why_matched": [
                            "ER-positive status matches (required)",
                            "Stage IV matches trial requirement",
                            "ECOG 0-1 meets performance criteria"
                        ],
                        "what_to_confirm": [
                            "Verify HER2 testing was done within 6 months",
                            "Confirm adequate washout from last therapy"
                        ]
                    }
                ],
                "context": {
                    "patient": {},  # Full patient profile
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
        }
```

---

## API Endpoints

### Complete API Overview

The backend provides **9 REST API endpoints** organized into 3 categories:

| Category | Method | Endpoint | Purpose | Auth Required |
|----------|--------|----------|---------|---------------|
| **Health** | GET | `/health` | Service health check | No |
| **Read** | GET | `/api/v1/trials` | List/filter trials (with pagination) | No |
| **Read** | GET | `/api/v1/trials/{nct}` | Get single trial details | No |
| **Matching** | POST | `/api/v1/match` | Match patient to trials | No |
| **Create** | POST | `/api/v1/trials` | Create new trial | No* |
| **Update** | PUT | `/api/v1/trials/{nct}` | Update trial (full replacement) | No* |
| **Update** | PATCH | `/api/v1/trials/{nct}` | Partial update trial | No* |
| **Delete** | DELETE | `/api/v1/trials/{nct}` | Delete trial | No* |
| **Admin** | POST | `/api/v1/trials/bulk` | Bulk import trials | No* |

**\*Note:** Authentication will be added in V2. For MVP, CRUD endpoints are unprotected (use with caution in production).

---

### 1. Health Check

**GET** `/health`

**Response:** `200 OK`

```json
{
  "status": "ok",
  "dataset_version": "1.0",
  "last_updated": "2025-02-07",
  "total_trials": 20
}
```

**Implementation:**
```python
# app/api/health.py
from fastapi import APIRouter
from app.data.mock_trials import TRIALS
from app.data.constants import DATASET_VERSION
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "dataset_version": DATASET_VERSION,
        "last_updated": datetime.now().isoformat(),
        "total_trials": len(TRIALS)
    }
```

---

### 2. List All Trials

**GET** `/api/v1/trials`

**Query Parameters:**
- `cancer_type` (optional): "breast" or "lung"
- `limit` (optional, default=20): Max trials to return
- `offset` (optional, default=0): Pagination offset

**Response:** `200 OK`

```json
{
  "trials": [...],  // Array of Trial objects
  "total": 20,
  "limit": 20,
  "offset": 0
}
```

**Implementation:**
```python
# app/api/trials.py
from fastapi import APIRouter, Query
from typing import Optional
from app.models.patient import CancerType
from app.data.mock_trials import TRIALS

router = APIRouter()

@router.get("/api/v1/trials")
async def list_trials(
    cancer_type: Optional[CancerType] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    # Filter by cancer type if provided
    filtered = TRIALS
    if cancer_type:
        filtered = [t for t in TRIALS if t.cancer_type == cancer_type]
    
    # Pagination
    paginated = filtered[offset:offset+limit]
    
    return {
        "trials": paginated,
        "total": len(filtered),
        "limit": limit,
        "offset": offset
    }
```

---

### 3. Get Single Trial

**GET** `/api/v1/trials/{nct_number}`

**Path Parameters:**
- `nct_number`: NCT ID (e.g., "NCT05234567")

**Response:** `200 OK` or `404 Not Found`

```json
{
  "trial": {...}  // Full Trial object
}
```

**Implementation:**
```python
@router.get("/api/v1/trials/{nct_number}")
async def get_trial(nct_number: str):
    trial = next((t for t in TRIALS if t.nct_number == nct_number), None)
    if not trial:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    return {"trial": trial}
```

---

### 4. Match Patient to Trials (Core Endpoint)

**POST** `/api/v1/match`

**Request Body:** `PatientProfile`

```json
{
  "age": 52,
  "sex": "female",
  "cancer_type": "breast",
  "stage": "IV",
  "ecog": "1",
  "biomarkers": {
    "ER": "present",
    "PR": "present",
    "HER2": "negative"
  },
  "prior_treatments": [
    {
      "category": "targeted_therapy",
      "name": "Palbociclib + Letrozole"
    }
  ],
  "line_of_therapy": "post_targeted"
}
```

**Response:** `200 OK` - `MatchingResponse`

**Implementation:**
```python
# app/api/matching.py
from fastapi import APIRouter, HTTPException
from app.models.patient import PatientProfile
from app.models.matching import MatchingResponse
from app.matching.matcher import match_trials
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/v1/match", response_model=MatchingResponse)
async def match_patient(patient: PatientProfile):
    try:
        # Call matching engine
        result = match_trials(patient)
        return result
    except Exception as e:
        logger.error(f"Matching error: {e}")
        raise HTTPException(status_code=500, detail="Matching engine error")
```

---

### 5. Create Trial (CRUD - CREATE)

**POST** `/api/v1/trials`

**Request Body:** `Trial` (without `why_matched` and `what_to_confirm` - those are generated by matcher)

```json
{
  "id": "bc_trial_021",
  "nct_number": "NCT05999999",
  "title": "New Trial Title",
  "phase": "Phase II",
  "sponsor": "Example Pharma",
  "status": "recruiting",
  "location": "NYU Langone Health, New York, NY",
  "distance": 12,
  "cancer_type": "breast",
  "eligibility_score": "possibly_eligible",
  "match_confidence": "high",
  "eligibility_criteria": [...],
  "burden": {...},
  "exclusion_risks": {...},
  "translated_info": {...},
  "last_updated": "2025-02-07"
}
```

**Response:** `201 Created`

```json
{
  "message": "Trial created successfully",
  "trial": {...}  // Full created trial
}
```

**Errors:**
- `400 Bad Request` - Invalid trial data or validation error
- `409 Conflict` - Trial with NCT number already exists

**Implementation:**
```python
# app/api/trials.py (add to existing router)

@router.post("/api/v1/trials", status_code=201)
async def create_trial(trial: Trial):
    # Check if trial already exists
    existing = next((t for t in TRIALS if t.nct_number == trial.nct_number), None)
    if existing:
        raise HTTPException(
            status_code=409, 
            detail=f"Trial {trial.nct_number} already exists"
        )
    
    # Validate NCT number format
    if not trial.nct_number.startswith("NCT"):
        raise HTTPException(
            status_code=400,
            detail="NCT number must start with 'NCT' followed by 8 digits"
        )
    
    # Add to trials list (in-memory for now)
    TRIALS.append(trial)
    
    logger.info(f"Created trial: {trial.nct_number}")
    
    return {
        "message": "Trial created successfully",
        "trial": trial
    }
```

---

### 6. Update Trial (CRUD - UPDATE - Full Replacement)

**PUT** `/api/v1/trials/{nct_number}`

**Path Parameters:**
- `nct_number`: NCT ID (e.g., "NCT05234567")

**Request Body:** Complete `Trial` object (replaces existing)

**Response:** `200 OK`

```json
{
  "message": "Trial updated successfully",
  "trial": {...}  // Updated trial
}
```

**Errors:**
- `404 Not Found` - Trial doesn't exist
- `400 Bad Request` - Invalid trial data

**Implementation:**
```python
@router.put("/api/v1/trials/{nct_number}")
async def update_trial(nct_number: str, updated_trial: Trial):
    # Find trial
    for i, trial in enumerate(TRIALS):
        if trial.nct_number == nct_number:
            # Ensure NCT number matches
            if updated_trial.nct_number != nct_number:
                raise HTTPException(
                    status_code=400,
                    detail="NCT number in body must match URL parameter"
                )
            
            # Replace trial
            TRIALS[i] = updated_trial
            logger.info(f"Updated trial: {nct_number}")
            
            return {
                "message": "Trial updated successfully",
                "trial": updated_trial
            }
    
    raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
```

---

### 7. Partial Update Trial (CRUD - UPDATE - Partial)

**PATCH** `/api/v1/trials/{nct_number}`

**Path Parameters:**
- `nct_number`: NCT ID

**Request Body:** Partial trial data (only fields to update)

```json
{
  "status": "completed",
  "last_updated": "2025-02-08"
}
```

**Response:** `200 OK`

```json
{
  "message": "Trial updated successfully",
  "trial": {...}  // Updated trial with changes applied
}
```

**Implementation:**
```python
from pydantic import BaseModel
from typing import Optional, List

class TrialPartialUpdate(BaseModel):
    """Partial update model - all fields optional"""
    title: Optional[str] = None
    phase: Optional[str] = None
    sponsor: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    distance: Optional[int] = None
    eligibility_score: Optional[str] = None
    match_confidence: Optional[str] = None
    eligibility_criteria: Optional[List[EligibilityCriterion]] = None
    burden: Optional[PatientBurden] = None
    exclusion_risks: Optional[ExclusionRisks] = None
    translated_info: Optional[TranslatedInfo] = None
    last_updated: Optional[str] = None

@router.patch("/api/v1/trials/{nct_number}")
async def partial_update_trial(nct_number: str, updates: TrialPartialUpdate):
    # Find trial
    for i, trial in enumerate(TRIALS):
        if trial.nct_number == nct_number:
            # Apply updates (only non-None fields)
            update_data = updates.dict(exclude_unset=True)
            updated_trial = trial.copy(update=update_data)
            
            TRIALS[i] = updated_trial
            logger.info(f"Partially updated trial: {nct_number}")
            
            return {
                "message": "Trial updated successfully",
                "trial": updated_trial
            }
    
    raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
```

---

### 8. Delete Trial (CRUD - DELETE)

**DELETE** `/api/v1/trials/{nct_number}`

**Path Parameters:**
- `nct_number`: NCT ID

**Response:** `200 OK`

```json
{
  "message": "Trial deleted successfully",
  "nct_number": "NCT05234567"
}
```

**Errors:**
- `404 Not Found` - Trial doesn't exist

**Implementation:**
```python
@router.delete("/api/v1/trials/{nct_number}")
async def delete_trial(nct_number: str):
    global TRIALS
    
    # Find and remove trial
    for i, trial in enumerate(TRIALS):
        if trial.nct_number == nct_number:
            deleted_trial = TRIALS.pop(i)
            logger.info(f"Deleted trial: {nct_number}")
            
            return {
                "message": "Trial deleted successfully",
                "nct_number": nct_number
            }
    
    raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
```

---

### 9. Bulk Import Trials (BONUS - Admin Utility)

**POST** `/api/v1/trials/bulk`

**Request Body:** Array of `Trial` objects

```json
{
  "trials": [
    {...},  // Trial 1
    {...},  // Trial 2
    // ... more trials
  ]
}
```

**Response:** `200 OK`

```json
{
  "message": "Bulk import completed",
  "created": 15,
  "skipped": 3,
  "errors": [
    {
      "nct_number": "NCT05999999",
      "error": "Trial already exists"
    }
  ]
}
```

**Implementation:**
```python
from pydantic import BaseModel

class BulkImportRequest(BaseModel):
    trials: List[Trial]

@router.post("/api/v1/trials/bulk")
async def bulk_import_trials(request: BulkImportRequest):
    created = 0
    skipped = 0
    errors = []
    
    for trial in request.trials:
        try:
            # Check if exists
            existing = next((t for t in TRIALS if t.nct_number == trial.nct_number), None)
            if existing:
                skipped += 1
                errors.append({
                    "nct_number": trial.nct_number,
                    "error": "Trial already exists"
                })
                continue
            
            # Add trial
            TRIALS.append(trial)
            created += 1
            
        except Exception as e:
            errors.append({
                "nct_number": trial.nct_number,
                "error": str(e)
            })
    
    logger.info(f"Bulk import: {created} created, {skipped} skipped")
    
    return {
        "message": "Bulk import completed",
        "created": created,
        "skipped": skipped,
        "errors": errors
    }
```

---

## Matching Engine Logic

### `app/matching/matcher.py`

```python
"""Main matching engine"""
from app.models.patient import PatientProfile
from app.models.matching import MatchingResponse, MatchResult, MatchingContext, MatchingStats
from app.data.mock_trials import TRIALS
from app.data.constants import DATASET_VERSION
from app.matching.rules import is_hard_excluded
from app.matching.scorer import calculate_score, determine_confidence
from app.matching.reason_generator import generate_why_matched, generate_what_to_confirm
from datetime import datetime

def match_trials(patient: PatientProfile) -> MatchingResponse:
    """
    Match patient to clinical trials using rule-based logic.
    
    Returns trials sorted by:
    1. Eligibility score (possibly_eligible first)
    2. Match score (high to low)
    """
    matches = []
    hard_excluded_count = 0
    
    for trial in TRIALS:
        # Skip if wrong cancer type
        if trial.cancer_type != patient.cancer_type:
            hard_excluded_count += 1
            continue
        
        # Check hard exclusions
        exclusion_reason = is_hard_excluded(patient, trial)
        if exclusion_reason:
            hard_excluded_count += 1
            continue
        
        # Calculate match score
        score = calculate_score(patient, trial)
        confidence = determine_confidence(score, patient, trial)
        
        # Generate reasons
        why_matched = generate_why_matched(patient, trial)
        what_to_confirm = generate_what_to_confirm(patient, trial)
        
        matches.append(MatchResult(
            trial=trial,
            score=score,
            confidence=confidence,
            why_matched=why_matched,
            what_to_confirm=what_to_confirm
        ))
    
    # Sort: possibly_eligible first, then by score descending
    matches.sort(
        key=lambda m: (
            m.trial.eligibility_score != "possibly_eligible",  # False < True, so possibly_eligible comes first
            -m.score  # Descending score
        )
    )
    
    # Calculate stats
    possibly_eligible = sum(1 for m in matches if m.trial.eligibility_score == "possibly_eligible")
    likely_not_eligible = len(matches) - possibly_eligible
    
    return MatchingResponse(
        matches=matches,
        context=MatchingContext(
            patient=patient,
            dataset_version=DATASET_VERSION,
            matched_at=datetime.utcnow().isoformat() + "Z",
            total_trials=len(TRIALS)
        ),
        stats=MatchingStats(
            total_trials=len(TRIALS),
            possibly_eligible=possibly_eligible,
            likely_not_eligible=likely_not_eligible,
            hard_excluded=hard_excluded_count
        )
    )
```

### `app/matching/rules.py`

```python
"""Hard exclusion rules for matching"""
from app.models.patient import PatientProfile, BreastBiomarkers, LungBiomarkers
from app.models.trial import Trial
from typing import Optional

def is_hard_excluded(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """
    Check if patient is hard-excluded from trial.
    Returns exclusion reason string if excluded, None if not excluded.
    """
    # Check stage exclusions
    stage_exclusion = check_stage_exclusion(patient, trial)
    if stage_exclusion:
        return stage_exclusion
    
    # Check biomarker exclusions (depends on cancer type)
    biomarker_exclusion = check_biomarker_exclusion(patient, trial)
    if biomarker_exclusion:
        return biomarker_exclusion
    
    # Check ECOG exclusions
    ecog_exclusion = check_ecog_exclusion(patient, trial)
    if ecog_exclusion:
        return ecog_exclusion
    
    # Check prior therapy exclusions
    prior_therapy_exclusion = check_prior_therapy_exclusion(patient, trial)
    if prior_therapy_exclusion:
        return prior_therapy_exclusion
    
    return None

def check_stage_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check if patient stage excludes them from trial"""
    # Stage IV patients excluded from neoadjuvant/adjuvant trials
    if patient.stage == "IV":
        if "neoadjuvant" in trial.title.lower():
            return "Stage IV patient excluded from neoadjuvant trial"
        if "adjuvant" in trial.title.lower() and "metastatic" not in trial.title.lower():
            return "Stage IV patient excluded from adjuvant-only trial"
    
    return None

def check_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check if patient biomarkers exclude them from trial"""
    if patient.cancer_type == "breast":
        return check_breast_biomarker_exclusion(patient, trial)
    elif patient.cancer_type == "lung":
        return check_lung_biomarker_exclusion(patient, trial)
    return None

def check_breast_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Breast cancer biomarker exclusions"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, BreastBiomarkers):
        return None
    
    # HER2+ trials exclude HER2-negative or HER2-low
    if "HER2-positive" in trial.title or "HER2+" in trial.title:
        if biomarkers.HER2 in ["negative", "low"]:
            return f"HER2+ trial requires HER2-positive status (patient is {biomarkers.HER2})"
    
    # HER2-low trials exclude HER2-negative or HER2-positive
    if "HER2-low" in trial.title.lower() or "HER2 low" in trial.title.lower():
        if biomarkers.HER2 in ["negative", "positive"]:
            return f"HER2-low trial requires HER2-low status (patient is {biomarkers.HER2})"
    
    # ER+ trials exclude ER-negative
    if "ER+" in trial.title or "hormone receptor" in trial.title.lower():
        if biomarkers.ER == "absent":
            return "ER+ trial requires ER-positive status (patient is ER-negative)"
    
    # Triple-negative trials exclude ER+ or HER2+
    if "triple-negative" in trial.title.lower() or "TNBC" in trial.title:
        if biomarkers.ER == "present" or biomarkers.PR == "present" or biomarkers.HER2 == "positive":
            return "Triple-negative trial requires ER-, PR-, HER2- (patient has positive receptors)"
    
    return None

def check_lung_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Lung cancer biomarker exclusions"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return None
    
    # EGFR+ trials exclude EGFR-negative
    if "EGFR" in trial.title and "mutation" in trial.title.lower():
        if biomarkers.EGFR.status == "absent":
            return "EGFR-mutant trial requires EGFR mutation (patient is EGFR-negative)"
    
    # ALK+ trials exclude ALK-negative
    if "ALK" in trial.title and ("positive" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        if biomarkers.ALK == "absent":
            return "ALK+ trial requires ALK rearrangement (patient is ALK-negative)"
    
    # KRAS G12C trials exclude other KRAS mutations
    if "KRAS G12C" in trial.title:
        if biomarkers.KRAS.status == "present" and biomarkers.KRAS.mutation != "G12C":
            return f"KRAS G12C trial requires G12C mutation (patient has {biomarkers.KRAS.mutation})"
        if biomarkers.KRAS.status == "absent":
            return "KRAS G12C trial requires KRAS mutation (patient is KRAS-negative)"
    
    return None

def check_ecog_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check ECOG performance status exclusions"""
    # If patient ECOG is unknown, do NOT exclude (treat as neutral)
    if patient.ecog == "unknown":
        return None
    
    # ECOG 3-4 patients excluded from ECOG 0-1 trials
    # (This is a simplified check - in production, parse eligibility_criteria)
    if patient.ecog in ["3", "4"]:
        # Check if trial requires ECOG 0-1 (look in eligibility criteria)
        for criterion in trial.eligibility_criteria:
            if "ECOG" in criterion.criterion and ("0-1" in criterion.criterion or "0 or 1" in criterion.criterion):
                return f"ECOG {patient.ecog} patient excluded from ECOG 0-1 trial"
    
    return None

def check_prior_therapy_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check prior therapy exclusions"""
    # Extract drug names from prior treatments
    prior_drug_names = [t.name.lower() for t in patient.prior_treatments if t.name]
    
    # Check trial's prior drug exposure exclusions
    exclusion_text = trial.exclusion_risks.prior_drug_exposure.lower()
    
    # Common exclusions
    exclusion_drugs = {
        "osimertinib": "osimertinib",
        "t-dxd": "trastuzumab deruxtecan",
        "enhertu": "trastuzumab deruxtecan",
        "palbociclib": "palbociclib",
        "ribociclib": "ribociclib",
        "abemaciclib": "abemaciclib"
    }
    
    for drug_key, drug_name in exclusion_drugs.items():
        if f"no prior {drug_key}" in exclusion_text:
            if any(drug_key in prior for prior in prior_drug_names):
                return f"Trial excludes patients with prior {drug_name} (patient has prior exposure)"
    
    return None
```

### `app/matching/scorer.py`

```python
"""Calculate match scores"""
from app.models.patient import PatientProfile, BreastBiomarkers, LungBiomarkers
from app.models.trial import Trial

def calculate_score(patient: PatientProfile, trial: Trial) -> int:
    """
    Calculate match score (85-99, never 100 to avoid false certainty).
    
    Scoring rules:
    - Base: 85 points
    - +5: All major biomarkers match
    - +3: ECOG explicitly meets requirement
    - +2: Trial location <10 miles
    - +5: First-line trial and patient is first-line
    - -5: Any "what to confirm" items present
    """
    score = 85  # Base score
    
    # +5 for biomarker match
    if check_biomarker_match(patient, trial):
        score += 5
    
    # +3 for ECOG match (if ECOG is not unknown)
    if patient.ecog != "unknown" and check_ecog_match(patient, trial):
        score += 3
    
    # +2 for close location (<10 miles)
    if trial.distance < 10:
        score += 2
    
    # +5 for line of therapy match
    if check_line_match(patient, trial):
        score += 5
    
    # -5 for unknowns/confirmations needed
    # (We'll calculate this in reason_generator and pass count here - simplified for now)
    # For now, subtract 5 if any eligibility criterion is "unknown"
    unknown_count = sum(1 for c in trial.eligibility_criteria if c.met == "unknown")
    if unknown_count > 0:
        score -= 5
    
    # Cap at 99 (never 100)
    return min(score, 99)

def check_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient's biomarkers match trial requirements"""
    if patient.cancer_type == "breast":
        return check_breast_biomarker_match(patient, trial)
    elif patient.cancer_type == "lung":
        return check_lung_biomarker_match(patient, trial)
    return False

def check_breast_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Breast cancer biomarker matching"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, BreastBiomarkers):
        return False
    
    # Check for matches in eligibility criteria
    matches = 0
    total_biomarker_criteria = 0
    
    for criterion in trial.eligibility_criteria:
        if criterion.category == "biomarker":
            total_biomarker_criteria += 1
            if criterion.met is True:
                matches += 1
    
    # If ≥50% of biomarker criteria met, consider it a match
    if total_biomarker_criteria > 0:
        return matches / total_biomarker_criteria >= 0.5
    
    return True  # If no biomarker criteria, assume match

def check_lung_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Lung cancer biomarker matching"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return False
    
    # Similar logic to breast
    matches = 0
    total_biomarker_criteria = 0
    
    for criterion in trial.eligibility_criteria:
        if criterion.category == "biomarker":
            total_biomarker_criteria += 1
            if criterion.met is True:
                matches += 1
    
    if total_biomarker_criteria > 0:
        return matches / total_biomarker_criteria >= 0.5
    
    return True

def check_ecog_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient ECOG meets trial requirement"""
    # Look for ECOG criterion in trial
    for criterion in trial.eligibility_criteria:
        if criterion.category == "performance" and "ECOG" in criterion.criterion:
            return criterion.met is True
    return False

def check_line_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient's line of therapy matches trial"""
    # Simplified: Check if trial title mentions "first-line" and patient is first-line
    if patient.line_of_therapy == "first":
        if "first-line" in trial.title.lower() or "1L" in trial.title:
            return True
    return False

def determine_confidence(score: int, patient: PatientProfile, trial: Trial) -> str:
    """Determine match confidence based on score and data completeness"""
    # High confidence: score ≥95, all major criteria known
    if score >= 95:
        unknown_count = sum(1 for c in trial.eligibility_criteria if c.met == "unknown")
        if unknown_count <= 1:
            return "high"
    
    # Low confidence: score <90 or many unknowns
    if score < 90:
        return "low"
    
    unknown_count = sum(1 for c in trial.eligibility_criteria if c.met == "unknown")
    if unknown_count >= 3:
        return "low"
    
    # Medium confidence: everything else
    return "medium"
```

### `app/matching/reason_generator.py`

```python
"""Generate human-readable match reasons"""
from app.models.patient import PatientProfile, BreastBiomarkers, LungBiomarkers
from app.models.trial import Trial
from typing import List

def generate_why_matched(patient: PatientProfile, trial: Trial) -> List[str]:
    """
    Generate 2-4 specific reasons why trial matched.
    Priority: biomarkers > stage > ECOG > treatment history
    """
    reasons = []
    
    # Check each criterion that was met
    for criterion in trial.eligibility_criteria:
        if criterion.met is True:
            # Format reason with context
            if criterion.category == "biomarker":
                reasons.append(f"{criterion.criterion} (required)")
            elif criterion.category == "stage":
                reasons.append(f"{criterion.criterion} matches trial requirement")
            elif criterion.category == "performance":
                reasons.append(f"{criterion.criterion} meets performance criteria")
            elif criterion.category == "treatment_history":
                reasons.append(f"{criterion.criterion} aligns with inclusion criteria")
    
    # If <2 reasons, add generic ones
    if len(reasons) < 2:
        reasons.append(f"Stage {patient.stage} matches trial population")
        reasons.append(f"Cancer type ({patient.cancer_type}) matches trial focus")
    
    # Return top 4 reasons
    return reasons[:4]

def generate_what_to_confirm(patient: PatientProfile, trial: Trial) -> List[str]:
    """
    Generate 1-3 items patient should confirm with oncologist.
    Focus on "unknown" criteria and trial-specific requirements.
    """
    confirmations = []
    
    # Check for unknown criteria
    for criterion in trial.eligibility_criteria:
        if criterion.met == "unknown":
            confirmations.append(f"Confirm {criterion.criterion.lower()}")
    
    # Add trial-specific confirmations from exclusion_risks
    if trial.exclusion_risks.washout_window and "days" in trial.exclusion_risks.washout_window:
        confirmations.append(f"Verify {trial.exclusion_risks.washout_window}")
    
    if trial.exclusion_risks.lab_thresholds:
        confirmations.append(f"Check lab requirements: {trial.exclusion_risks.lab_thresholds}")
    
    # Return top 3
    return confirmations[:3]
```

---

## Main Application Entry Point

### `main.py`

```python
"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, trials, matching
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="TrialScout API",
    description="Clinical trial matching engine for cancer patients",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(trials.router, tags=["Trials"])
app.include_router(matching.router, tags=["Matching"])

@app.get("/")
async def root():
    return {
        "message": "TrialScout API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("API_DEBUG", "True") == "True"
    )
```

---

## Mock Trial Data

### `app/data/mock_trials.py`

**NOTE:** This file should contain the 20 trial objects from the JSON we created earlier. Here's the structure:

```python
"""Mock trial data (20 trials: 10 breast, 10 NSCLC)"""
from app.models.trial import Trial, EligibilityCriterion, PatientBurden, ExclusionRisks, TranslatedInfo
from typing import List

# NOTE: Snapdev should import the trial data from breast_cancer_trials_lovable.json
# and convert it to Trial Pydantic model instances.

# IMPORTANT: Use a mutable list (not tuple) to support CRUD operations
TRIALS: List[Trial] = [
    Trial(
        id="bc_trial_001",
        nct_number="NCT05234567",
        title="DESTINY-Breast06: Trastuzumab Deruxtecan in HER2-Low Metastatic Breast Cancer",
        phase="Phase III",
        sponsor="Daiichi Sankyo",
        status="recruiting",
        location="Memorial Sloan Kettering Cancer Center, New York, NY",
        distance=8,
        cancer_type="breast",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        eligibility_criteria=[
            EligibilityCriterion(
                criterion="HER2-low breast cancer (IHC 1+ or IHC 2+/ISH-)",
                met=True,
                category="biomarker"
            ),
            # ... more criteria
        ],
        burden=PatientBurden(
            visits_per_month=2,
            imaging_frequency="Every 6 weeks",
            biopsy_required=False,
            hospital_stays=False
        ),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior trastuzumab deruxtecan",
            washout_window="21 days from last systemic therapy",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL",
            brain_mets="Treated and stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="A targeted antibody-drug conjugate that delivers chemotherapy directly to HER2-low cancer cells.",
            goal="To see if trastuzumab deruxtecan works better than standard chemotherapy for HER2-low metastatic breast cancer.",
            what_happens="You'll receive an IV infusion every 3 weeks. Scans every 6 weeks to check tumor response.",
            duration="Treatment continues as long as it's working and side effects are manageable, typically 12-18 months on average."
        ),
        last_updated="2025-01-15"
    ),
    # ... 19 more trials (bc_trial_002 through lung_trial_010)
]

def get_trial_by_nct(nct_number: str) -> Trial | None:
    """Helper function to find trial by NCT number"""
    return next((t for t in TRIALS if t.nct_number == nct_number), None)

def get_trials_by_cancer_type(cancer_type: str) -> List[Trial]:
    """Helper function to filter trials by cancer type"""
    return [t for t in TRIALS if t.cancer_type == cancer_type]
```

**Snapdev should:**
1. Read `breast_cancer_trials_lovable.json` from the project files
2. Parse each trial JSON object
3. Convert to `Trial` Pydantic model
4. Store in `TRIALS` list (make it a **mutable list**, not tuple, to support CRUD)
5. Add 10 NSCLC trials (similar structure, different biomarkers)

**IMPORTANT for CRUD:** 
- `TRIALS` must be a Python list (not tuple) to support append/pop operations
- Import as `from app.data.mock_trials import TRIALS` in API endpoints
- Use `global TRIALS` in DELETE endpoint to reassign after pop()

---

## Testing

### `tests/test_matcher.py`

```python
"""Unit tests for matching engine"""
import pytest
from app.models.patient import PatientProfile, BreastBiomarkers, BiomarkerStatus
from app.matching.matcher import match_trials
from app.data.mock_trials import TRIALS

def test_match_breast_cancer_patient():
    """Test matching for breast cancer patient"""
    patient = PatientProfile(
        age=52,
        sex="female",
        cancer_type="breast",
        stage="IV",
        ecog="1",
        biomarkers=BreastBiomarkers(
            ER="present",
            PR="present",
            HER2="negative"
        ),
        prior_treatments=[],
        line_of_therapy="first"
    )
    
    result = match_trials(patient)
    
    # Assertions
    assert len(result.matches) > 0
    assert result.stats.total_trials == len(TRIALS)
    assert all(m.trial.cancer_type == "breast" for m in result.matches)
    assert all(85 <= m.score <= 99 for m in result.matches)

def test_her2_positive_exclusion():
    """Test that HER2-negative patient is excluded from HER2+ trials"""
    patient = PatientProfile(
        age=45,
        sex="female",
        cancer_type="breast",
        stage="IV",
        ecog="1",
        biomarkers=BreastBiomarkers(
            ER="present",
            PR="present",
            HER2="negative"  # HER2-negative
        ),
        prior_treatments=[],
        line_of_therapy="first"
    )
    
    result = match_trials(patient)
    
    # Should not match HER2+ trials
    her2_positive_matches = [m for m in result.matches if "HER2+" in m.trial.title or "HER2-positive" in m.trial.title]
    assert len(her2_positive_matches) == 0

# Add 20+ more test cases covering:
# - Stage exclusions (Stage IV from neoadjuvant)
# - ECOG exclusions (ECOG 3 from ECOG 0-1 trials)
# - Biomarker exclusions (ER+ from TNBC trials)
# - Score calculation
# - Sorting (possibly_eligible first, then by score)
```

### `tests/test_crud.py`

```python
"""Tests for CRUD operations"""
import pytest
from fastapi.testclient import TestClient
from main import app
from app.data.mock_trials import TRIALS
from app.models.trial import Trial

client = TestClient(app)

def test_create_trial():
    """Test creating a new trial"""
    new_trial = {
        "id": "test_trial_001",
        "nct_number": "NCT09999999",
        "title": "Test Trial",
        "phase": "Phase II",
        "sponsor": "Test Sponsor",
        "status": "recruiting",
        "location": "Test Hospital, New York, NY",
        "distance": 10,
        "cancer_type": "breast",
        "eligibility_score": "possibly_eligible",
        "match_confidence": "high",
        "eligibility_criteria": [],
        "burden": {
            "visits_per_month": 2,
            "imaging_frequency": "Every 6 weeks",
            "biopsy_required": False,
            "hospital_stays": False
        },
        "exclusion_risks": {
            "prior_drug_exposure": "None",
            "washout_window": "14 days",
            "lab_thresholds": "Standard",
            "brain_mets": "Allowed"
        },
        "translated_info": {
            "design": "Test design",
            "goal": "Test goal",
            "what_happens": "Test what happens",
            "duration": "Test duration"
        },
        "last_updated": "2025-02-07"
    }
    
    response = client.post("/api/v1/trials", json=new_trial)
    assert response.status_code == 201
    assert response.json()["message"] == "Trial created successfully"
    assert response.json()["trial"]["nct_number"] == "NCT09999999"

def test_create_duplicate_trial():
    """Test that creating duplicate trial returns 409"""
    # Use existing trial NCT
    existing_nct = TRIALS[0].nct_number
    
    duplicate_trial = {
        "id": "duplicate_001",
        "nct_number": existing_nct,  # Duplicate!
        "title": "Duplicate Trial",
        # ... other fields
    }
    
    response = client.post("/api/v1/trials", json=duplicate_trial)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_update_trial():
    """Test updating an existing trial"""
    nct = TRIALS[0].nct_number
    
    # Get current trial
    response = client.get(f"/api/v1/trials/{nct}")
    trial = response.json()["trial"]
    
    # Update status
    trial["status"] = "completed"
    
    response = client.put(f"/api/v1/trials/{nct}", json=trial)
    assert response.status_code == 200
    assert response.json()["trial"]["status"] == "completed"

def test_partial_update_trial():
    """Test partial update (PATCH)"""
    nct = TRIALS[0].nct_number
    
    updates = {
        "status": "active_not_recruiting",
        "last_updated": "2025-02-08"
    }
    
    response = client.patch(f"/api/v1/trials/{nct}", json=updates)
    assert response.status_code == 200
    assert response.json()["trial"]["status"] == "active_not_recruiting"
    assert response.json()["trial"]["last_updated"] == "2025-02-08"

def test_delete_trial():
    """Test deleting a trial"""
    # First create a trial to delete
    test_trial = {...}  # Full trial object
    client.post("/api/v1/trials", json=test_trial)
    
    # Delete it
    response = client.delete(f"/api/v1/trials/{test_trial['nct_number']}")
    assert response.status_code == 200
    assert response.json()["message"] == "Trial deleted successfully"
    
    # Verify it's gone
    response = client.get(f"/api/v1/trials/{test_trial['nct_number']}")
    assert response.status_code == 404

def test_bulk_import():
    """Test bulk import endpoint"""
    trials = [
        {...},  # Trial 1
        {...},  # Trial 2
    ]
    
    response = client.post("/api/v1/trials/bulk", json={"trials": trials})
    assert response.status_code == 200
    assert response.json()["created"] >= 0
    assert response.json()["skipped"] >= 0
```

---

## Snapdev Prompt

**Copy this prompt into Snapdev:**

```
@workspace Create a FastAPI backend for TrialScout clinical trial matching with full CRUD APIs.

Context:
- I have a specification file: TrialScout_Backend_Spec.md
- I have trial data: breast_cancer_trials_lovable.json (in project files)
- Backend should be in a separate directory: trialscout-backend/

Requirements:
1. Follow the project structure exactly as specified in the spec
2. Use Python 3.11+, FastAPI, Pydantic v2
3. Implement all Pydantic models (patient.py, trial.py, matching.py)
4. Implement ALL 9 API endpoints:
   - GET /health (health check)
   - GET /api/v1/trials (list/filter trials with pagination)
   - GET /api/v1/trials/{nct_number} (get single trial)
   - POST /api/v1/match (core matching endpoint)
   - POST /api/v1/trials (CREATE trial - CRUD)
   - PUT /api/v1/trials/{nct_number} (UPDATE trial - full replacement)
   - PATCH /api/v1/trials/{nct_number} (PARTIAL UPDATE trial)
   - DELETE /api/v1/trials/{nct_number} (DELETE trial)
   - POST /api/v1/trials/bulk (bulk import utility)
5. Implement matching engine:
   - matcher.py (main function)
   - rules.py (hard exclusions)
   - scorer.py (score calculation 85-99)
   - reason_generator.py (generate "why matched" and "what to confirm")
6. Load trial data from breast_cancer_trials_lovable.json into mock_trials.py
   - IMPORTANT: Use a mutable Python list (not tuple) for TRIALS variable to support CRUD
7. Add 10 placeholder NSCLC trials (use similar structure, different biomarkers)
8. Enable CORS for http://localhost:3000, http://localhost:5173
9. Write tests:
   - test_matcher.py (5+ matching tests)
   - test_crud.py (8+ CRUD operation tests)
10. Create requirements.txt, .env.example, README.md

CRUD Implementation Notes:
- POST /api/v1/trials: Check for duplicate NCT numbers (return 409 if exists)
- PUT /api/v1/trials/{nct_number}: Full replacement, NCT in body must match URL
- PATCH /api/v1/trials/{nct_number}: Partial update using TrialPartialUpdate model
- DELETE /api/v1/trials/{nct_number}: Use global TRIALS and list.pop()
- All CRUD endpoints should log actions with logging.info()

Matching Rules (from spec):
- Matching is deterministic (same input → same output)
- Match scores are 85-99 (never 100)
- Sort results: possibly_eligible first, then by score descending
- ECOG "unknown" is NOT an exclusion (treat as neutral)
- Hard exclusions: Stage IV from neoadjuvant, HER2 mismatch, EGFR mismatch, ECOG 3-4 from ECOG 0-1

Validation:
- NCT numbers must start with "NCT" followed by 8 digits
- All Pydantic models have proper validation
- Return appropriate HTTP status codes (200, 201, 400, 404, 409, 500)

Deliverables:
- Complete backend in trialscout-backend/ directory
- All files match spec structure
- FastAPI runs on http://localhost:8000
- Swagger docs at http://localhost:8000/docs show all 9 endpoints
- All tests pass: pytest tests/ -v
- CRUD operations work via Swagger UI

Start by:
1. Creating the project structure
2. Implementing models (with validation)
3. Implementing mock_trials.py (mutable list)
4. Implementing all API endpoints (including CRUD)
5. Implementing matching logic
6. Writing tests
7. Testing CRUD via Swagger UI
```

---

**End of Backend Specification**

This spec is ready for Snapdev to build your backend! Let me know if you need any adjustments.
