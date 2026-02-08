"""
TrialScout Backend API
FastAPI application for clinical trial matching
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
from pydantic import BaseModel

from app.models.patient import PatientProfile, CancerType
from app.models.trial import Trial, TrialPartialUpdate
from app.models.matching import MatchingResponse
from app.data.mock_trials import TRIALS, get_trial_by_nct
from app.data.constants import DATASET_VERSION

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="TrialScout API",
    description="Clinical trial matching engine for cancer patients",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - Allow all localhost ports for development
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
if allowed_origins == ["*"]:
    # In development, allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Must be False when allow_origins is ["*"]
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # In production, use specific origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TrialScout API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns system status and dataset information
    """
    return {
        "status": "ok",
        "dataset_version": DATASET_VERSION,
        "last_updated": datetime.now().isoformat(),
        "total_trials": len(TRIALS)
    }


@app.get("/api/v1/trials")
async def list_trials(
    cancer_type: Optional[CancerType] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    List all trials with optional filtering
    
    Query parameters:
    - cancer_type: Filter by cancer type (breast, lung)
    - limit: Maximum number of records to return
    - offset: Number of records to skip (pagination)
    """
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


@app.get("/api/v1/trials/{nct_number}")
async def get_trial(nct_number: str):
    """
    Get full details for a specific trial by NCT number
    
    Returns complete trial information
    """
    trial = get_trial_by_nct(nct_number)
    if not trial:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    return {"trial": trial}


@app.post("/api/v1/match", response_model=MatchingResponse)
async def match_patient(patient: PatientProfile):
    """
    Match patient profile against available trials
    
    This endpoint implements the rule-based matching algorithm.
    Returns ranked trials with scores, reasons, and confidence levels.
    """
    try:
        # Import here to avoid circular dependency
        from app.matching.matcher import match_trials
        
        # Call matching engine
        result = match_trials(patient)
        return result
    except Exception as e:
        logger.error(f"Matching error: {e}")
        raise HTTPException(status_code=500, detail=f"Matching engine error: {str(e)}")


@app.post("/api/v1/trials", status_code=201)
async def create_trial(trial: Trial):
    """
    Create a new trial
    
    Returns the created trial object
    """
    # Check if trial already exists
    existing = get_trial_by_nct(trial.nct_number)
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


@app.put("/api/v1/trials/{nct_number}")
async def update_trial(nct_number: str, updated_trial: Trial):
    """
    Update trial (full replacement)
    
    Replaces the entire trial object
    """
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


@app.patch("/api/v1/trials/{nct_number}")
async def partial_update_trial(nct_number: str, updates: TrialPartialUpdate):
    """
    Partial update trial
    
    Updates only the specified fields
    """
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


@app.delete("/api/v1/trials/{nct_number}")
async def delete_trial(nct_number: str):
    """
    Delete trial
    
    Removes the trial from the system
    """
    global TRIALS
    
    # Find and remove trial
    for i, trial in enumerate(TRIALS):
        if trial.nct_number == nct_number:
            TRIALS.pop(i)
            logger.info(f"Deleted trial: {nct_number}")
            
            return {
                "message": "Trial deleted successfully",
                "nct_number": nct_number
            }
    
    raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")


class BulkImportRequest(BaseModel):
    trials: List[Trial]


@app.post("/api/v1/trials/bulk")
async def bulk_import_trials(request: BulkImportRequest):
    """
    Bulk import trials
    
    Imports multiple trials at once
    """
    created = 0
    skipped = 0
    errors = []
    
    for trial in request.trials:
        try:
            # Check if exists
            existing = get_trial_by_nct(trial.nct_number)
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("API_DEBUG", "True") == "True"
    )