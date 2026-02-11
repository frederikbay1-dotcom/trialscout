# TrialScout Project Structure

## Overview
TrialScout is a clinical trial matching platform with AI-powered document extraction capabilities. The project consists of a React frontend and a FastAPI backend.

## Repository Structure

```
trialscout/
├── remix-of-oncology-scout/          # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── steps/
│   │   │   │   └── ScreenerStep.tsx  # Medical info intake with document upload
│   │   │   ├── FileUploadZone.tsx    # Drag-and-drop upload component
│   │   │   ├── TrialCard.tsx         # Trial display card
│   │   │   └── ui/                   # Shadcn UI components
│   │   ├── pages/
│   │   │   ├── Index.tsx             # Landing page
│   │   │   ├── Walkthrough.tsx       # Multi-step patient intake
│   │   │   └── Privacy.tsx           # Privacy policy
│   │   ├── hooks/
│   │   │   ├── usePatientData.ts     # Patient data state management
│   │   │   └── useTrialMatching.ts   # Trial matching logic
│   │   ├── lib/
│   │   │   ├── api.ts                # API client
│   │   │   └── matchingEngine.ts     # Frontend matching logic
│   │   └── types/
│   │       ├── oncology.ts           # Patient and trial types
│   │       └── biomarkers.ts         # Biomarker types
│   ├── package.json
│   └── vite.config.ts
│
├── trialscout-backend/               # Backend (Python + FastAPI)
│   ├── app/
│   │   ├── main.py                   # FastAPI application entry point
│   │   ├── config.py                 # Configuration (includes ANTHROPIC_API_KEY)
│   │   ├── database.py               # Database connection
│   │   ├── models.py                 # SQLAlchemy models
│   │   ├── schemas.py                # Pydantic schemas
│   │   │
│   │   ├── api/                      # API endpoints
│   │   │   ├── __init__.py
│   │   │   └── extraction.py         # 🆕 Document extraction endpoint
│   │   │
│   │   ├── extractors/               # 🆕 Document processing modules
│   │   │   ├── __init__.py
│   │   │   ├── document_extractor.py # 🆕 PDF/TXT text extraction
│   │   │   └── biomarker_extractor.py# 🆕 Claude API integration
│   │   │
│   │   ├── matching/                 # Trial matching engine
│   │   │   ├── matcher.py
│   │   │   ├── rules.py
│   │   │   └── scorer.py
│   │   │
│   │   └── data/                     # Mock data and constants
│   │       └── mock_trials.py
│   │
│   ├── requirements.txt              # Python dependencies
│   │   # Key additions:
│   │   # - anthropic==0.79.0
│   │   # - PyPDF2==3.0.1
│   │   # - pdfplumber==0.10.3
│   │
│   └── run.py                        # Development server
│
├── Documentation/
│   ├── DOCUMENT_UPLOAD_IMPLEMENTATION_SUMMARY.md  # 🆕 Technical docs
│   ├── DOCUMENT_UPLOAD_TESTING_GUIDE.md          # 🆕 Testing guide
│   ├── INTEGRATION_GUIDE.md
│   └── PROJECT_SUMMARY.md
│
└── Test Files/
    ├── patient_a_breast_pathology.txt
    ├── patient_a_oncology_note.txt
    ├── patient_d_lung_molecular.txt
    └── patient_d_oncology_note.txt
```

## Key Components

### Frontend Architecture

#### 1. Document Upload Flow
```
FileUploadZone.tsx
    ↓ (user uploads file)
POST /api/v1/extract-biomarkers
    ↓ (API returns extracted data)
ScreenerStep.tsx handlers
    ↓ (process and map data)
onUpdatePatientData()
    ↓ (update form state)
Form auto-fills (editable)
```

#### 2. Main Components

**ScreenerStep.tsx** (Medical Information Intake)
- Location: `remix-of-oncology-scout/src/components/steps/ScreenerStep.tsx`
- Features:
  - Two upload zones (Pathology Report, Oncology Note)
  - Auto-fill handlers for extracted data
  - Demographics section (age, sex)
  - Cancer type and stage selectors
  - Blue notification card for extraction confirmation

**FileUploadZone.tsx** (Upload Interface)
- Location: `remix-of-oncology-scout/src/components/FileUploadZone.tsx`
- Features:
  - Drag-and-drop file upload
  - File validation (PDF/TXT, max 10MB)
  - Scanning animation during processing
  - Success/error states

**TrialCard.tsx** (Trial Display)
- Location: `remix-of-oncology-scout/src/components/TrialCard.tsx`
- Features:
  - Match score visualization
  - Cancer-specific labels (Breast/NSCLC)
  - Why matched / What to confirm sections
  - Download brief button

### Backend Architecture

#### 1. Document Processing Pipeline
```
POST /api/v1/extract-biomarkers
    ↓
DocumentExtractor.extract_text()
    ↓ (extracts text from PDF/TXT)
BiomarkerExtractor.extract_biomarkers()
    ↓ (sends to Claude API)
Claude Sonnet 4 processes text
    ↓ (returns structured JSON)
API returns biomarker_data
```

#### 2. Main Modules

**extraction.py** (API Endpoint)
- Location: `trialscout-backend/app/api/extraction.py`
- Endpoint: `POST /api/v1/extract-biomarkers`
- Parameters:
  - `file`: PDF or TXT file (required)
  - `cancer_type`: Optional hint ("breast" or "lung")
- Response:
  ```json
  {
    "success": true,
    "biomarker_data": {
      "cancer_type": "lung",
      "stage": "IV",
      "ecog": "1",
      "age": 65,
      "sex": "male",
      "current_treatment_status": "progressed_on_targeted",
      "biomarkers": {...},
      "prior_treatments": [...]
    },
    "processing_time_seconds": 5.72
  }
  ```

**document_extractor.py** (Text Extraction)
- Location: `trialscout-backend/app/extractors/document_extractor.py`
- Methods:
  - `extract_text(file)`: Main extraction method
  - `_extract_from_text_pdf()`: PyPDF2 extraction
  - `_extract_with_pdfplumber()`: Fallback extraction
- Supports: PDF (text-based), TXT files

**biomarker_extractor.py** (AI Extraction)
- Location: `trialscout-backend/app/extractors/biomarker_extractor.py`
- Model: `claude-sonnet-4-20250514`
- Temperature: 0 (deterministic)
- Extracts:
  - Demographics: age, sex
  - Clinical: cancer_type, stage, ECOG
  - Treatment: current_treatment_status, prior_treatments
  - Biomarkers: ER, PR, HER2, EGFR, ALK, ROS1, PD-L1, etc.
  - Confidence levels for each field

## Data Flow

### 1. Document Upload to Form Auto-Fill
```
User uploads document
    ↓
Frontend: FileUploadZone validates file
    ↓
Frontend: POST to /api/v1/extract-biomarkers
    ↓
Backend: DocumentExtractor extracts text
    ↓
Backend: BiomarkerExtractor sends to Claude
    ↓
Backend: Returns structured JSON
    ↓
Frontend: ScreenerStep.handlePathologyUpload() or handleOncologyUpload()
    ↓
Frontend: convertApiBiomarkersToProfile() maps data
    ↓
Frontend: onUpdatePatientData() updates form state
    ↓
User sees auto-filled form (all fields editable)
```

### 2. Trial Matching Flow
```
User completes intake form
    ↓
Frontend: POST to /api/v1/match
    ↓
Backend: Matching engine scores trials
    ↓
Backend: Returns ranked trial list
    ↓
Frontend: Displays TrialCard components
    ↓
User reviews matches and downloads briefs
```

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/trialscout

# Claude API (Required for document extraction)
ANTHROPIC_API_KEY=sk-ant-...

# Server
PORT=8000
```

### Frontend (.env)
```bash
# API endpoint
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Backend
```bash
cd trialscout-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
Server runs on: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend
```bash
cd remix-of-oncology-scout
npm install
npm run dev
```
App runs on: `http://localhost:8083` (or assigned port)

## Key Technologies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **React Router** - Navigation

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Anthropic Claude** - LLM for extraction
- **PyPDF2** - PDF text extraction
- **pdfplumber** - PDF parsing fallback
- **Pydantic** - Data validation

## Recent Additions (Document Upload Feature)

### New Files
1. `trialscout-backend/app/extractors/document_extractor.py`
2. `trialscout-backend/app/extractors/biomarker_extractor.py`
3. `trialscout-backend/app/api/extraction.py`
4. `DOCUMENT_UPLOAD_IMPLEMENTATION_SUMMARY.md`
5. `DOCUMENT_UPLOAD_TESTING_GUIDE.md`

### Modified Files
1. `remix-of-oncology-scout/src/components/steps/ScreenerStep.tsx`
   - Added handlePathologyUpload() and handleOncologyUpload()
   - Added convertApiBiomarkersToProfile()
   - Repositioned blue notification card

2. `remix-of-oncology-scout/src/components/TrialCard.tsx`
   - Added cancer-specific trial labels

3. `trialscout-backend/requirements.txt`
   - Added anthropic==0.79.0
   - Added PyPDF2==3.0.1
   - Added pdfplumber==0.10.3

## Testing

### Test Files Location
- `patient_a_breast_pathology.txt` - Breast cancer pathology
- `patient_a_oncology_note.txt` - Breast cancer oncology note
- `patient_d_lung_molecular.txt` - Lung cancer molecular testing
- `patient_d_oncology_note.txt` - Lung cancer oncology note

### Testing Guide
See: `DOCUMENT_UPLOAD_TESTING_GUIDE.md`

## Git Repository
- **URL**: https://github.com/frederikbay1-dotcom/trialscout.git
- **Branch**: master
- **Latest Commit**: 6d8f12a - "feat: Implement document upload with LLM biomarker extraction"

## Performance Metrics
- **Document Upload**: <1 second
- **Text Extraction**: <1 second
- **Claude API Processing**: 5-10 seconds
- **Total Processing Time**: 5-10 seconds
- **Form Auto-Fill**: Instant
- **Trial Matching**: 1-2 seconds

## Security Considerations
- Files processed in memory (not stored)
- HTTPS encryption for API calls
- ANTHROPIC_API_KEY stored in environment variables
- File size limit: 10MB
- Allowed file types: PDF, TXT only
- No PHI stored on servers