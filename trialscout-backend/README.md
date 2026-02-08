# TrialScout Backend API

FastAPI backend for clinical trial matching with rule-based matching engine.

## Overview

This backend provides REST APIs for the TrialScout frontend to:
1. **Match patients to clinical trials** using deterministic rule-based logic
2. **Serve trial data** (in-memory mock data for MVP)
3. **Full CRUD operations** for trial management
4. **Health checks** and monitoring

## Key Features

- ✅ **Deterministic matching**: Same input always produces same output
- ✅ **No database**: All data in-memory (Python lists/dicts)
- ✅ **Stateless**: No session management, no user accounts
- ✅ **CORS enabled**: Frontend can call from localhost or trialscout.com
- ✅ **Fast**: <3 seconds for matching endpoint
- ✅ **Type-safe**: Full Pydantic models for all requests/responses
- ✅ **Full CRUD**: 9 API endpoints including create, update, patch, delete

## Setup

### Prerequisites

- Python 3.11+
- pip

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health & Info
- `GET /health` - Health check with dataset info

### Trial Operations
- `GET /api/v1/trials` - List/filter trials (with pagination)
- `GET /api/v1/trials/{nct}` - Get single trial details
- `POST /api/v1/trials` - Create new trial
- `PUT /api/v1/trials/{nct}` - Update trial (full replacement)
- `PATCH /api/v1/trials/{nct}` - Partial update trial
- `DELETE /api/v1/trials/{nct}` - Delete trial
- `POST /api/v1/trials/bulk` - Bulk import trials

### Matching
- `POST /api/v1/match` - Match patient to trials

## Project Structure

```
trialscout-backend/
├── app/
│   ├── models/
│   │   ├── patient.py        # Patient profile models
│   │   ├── trial.py          # Trial models
│   │   └── matching.py       # Matching result models
│   ├── data/
│   │   ├── mock_trials.py    # In-memory trial data
│   │   └── constants.py      # Configuration constants
│   ├── matching/
│   │   ├── matcher.py        # Main matching function
│   │   ├── rules.py          # Hard exclusion rules
│   │   ├── scorer.py         # Score calculation
│   │   └── reason_generator.py  # Generate match reasons
│   └── main.py               # FastAPI app entry point
├── requirements.txt
├── .env.example
└── README.md
```

## Matching Logic

The matching engine uses deterministic rule-based logic:

### Hard Exclusions
- Cancer type mismatch
- Stage incompatibility (e.g., Stage IV from neoadjuvant trials)
- Biomarker mismatches (e.g., HER2- from HER2+ trials)
- ECOG exclusions (e.g., ECOG 3-4 from ECOG 0-1 trials)
- Prior therapy exclusions

### Scoring (85-99 range)
- Base score: 85 points
- +5: All major biomarkers match
- +3: ECOG explicitly meets requirement
- +2: Trial location <10 miles
- +5: First-line trial and patient is first-line
- -5: Any "what to confirm" items present
- Cap at 99 (never 100 to avoid false certainty)

### Confidence Levels
- **High**: Score ≥95, all major criteria met, ≤1 "what to confirm" item
- **Medium**: Score 90-94, OR ≥2 "what to confirm" items
- **Low**: Score <90, OR critical biomarker unknown

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_matcher.py -v
```

## Development

### Adding New Trials

Edit `app/data/mock_trials.py` and add new Trial objects to the TRIALS list.

### Modifying Matching Rules

- Hard exclusions: `app/matching/rules.py`
- Scoring logic: `app/matching/scorer.py`
- Match reasons: `app/matching/reason_generator.py`

## Environment Variables

See `.env.example` for all available configuration options.

## License

Proprietary - TrialScout