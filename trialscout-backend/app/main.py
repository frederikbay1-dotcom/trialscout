"""
TrialScout Backend API
FastAPI application for clinical trial matching
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
from pydantic import BaseModel

from app.models.patient import PatientProfile, CancerType
from app.models.trial import Trial, TrialPartialUpdate
from app.models.matching import MatchingResponse
from app.models.trial_db import TrialDB
from app.database import get_db, engine, Base
from app.data.constants import DATASET_VERSION

# Create database tables on startup
Base.metadata.create_all(bind=engine)

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
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint
    
    Returns system status and dataset information
    """
    total_trials = db.query(TrialDB).count()
    return {
        "status": "ok",
        "dataset_version": DATASET_VERSION,
        "last_updated": datetime.now().isoformat(),
        "total_trials": total_trials
    }


@app.get("/api/v1/trials")
async def list_trials(
    cancer_type: Optional[CancerType] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List all trials with optional filtering
    
    Query parameters:
    - cancer_type: Filter by cancer type (breast, lung)
    - limit: Maximum number of records to return
    - offset: Number of records to skip (pagination)
    """
    # Build query
    query = db.query(TrialDB)
    
    # Filter by cancer type if provided
    if cancer_type:
        query = query.filter(TrialDB.cancer_type == cancer_type)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    db_trials = query.offset(offset).limit(limit).all()
    
    # Convert to Trial Pydantic models
    trials = [Trial(**trial.to_dict()) for trial in db_trials]
    
    return {
        "trials": trials,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@app.get("/api/v1/trials/{nct_number}")
async def get_trial(nct_number: str, db: Session = Depends(get_db)):
    """
    Get full details for a specific trial by NCT number
    
    Returns complete trial information
    """
    db_trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    if not db_trial:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    
    trial = Trial(**db_trial.to_dict())
    return {"trial": trial}


@app.post("/api/v1/match", response_model=MatchingResponse)
async def match_patient(patient: PatientProfile, db: Session = Depends(get_db)):
    """
    Match patient profile against available trials
    
    This endpoint implements the rule-based matching algorithm.
    Returns ranked trials with scores, reasons, and confidence levels.
    """
    try:
        # Import here to avoid circular dependency
        from app.matching.matcher import match_trials
        
        # Get all trials from database (matching engine will filter by cancer type)
        db_trials = db.query(TrialDB).all()
        
        # Convert to Trial Pydantic models for matching engine
        trial_objects = [Trial(**trial.to_dict()) for trial in db_trials]
        
        # Call matching engine with database trials
        result = match_trials(patient, trials=trial_objects)
        
        return result
    except Exception as e:
        logger.error(f"Matching error: {e}")
        raise HTTPException(status_code=500, detail=f"Matching engine error: {str(e)}")


@app.post("/api/v1/trials", status_code=201)
async def create_trial(trial: Trial, db: Session = Depends(get_db)):
    """
    Create a new trial
    
    Returns the created trial object
    """
    # Check if trial already exists
    existing = db.query(TrialDB).filter(TrialDB.nct_number == trial.nct_number).first()
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
    
    # Convert to dict and create DB model
    trial_dict = trial.model_dump()
    db_trial = TrialDB(**trial_dict)
    
    # Add to database
    db.add(db_trial)
    db.commit()
    db.refresh(db_trial)
    
    logger.info(f"Created trial: {trial.nct_number}")
    
    return {
        "message": "Trial created successfully",
        "trial": Trial(**db_trial.to_dict())
    }


@app.put("/api/v1/trials/{nct_number}")
async def update_trial(nct_number: str, updated_trial: Trial, db: Session = Depends(get_db)):
    """
    Update trial (full replacement)
    
    Replaces the entire trial object
    """
    # Find trial
    db_trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    
    if not db_trial:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    
    # Ensure NCT number matches
    if updated_trial.nct_number != nct_number:
        raise HTTPException(
            status_code=400,
            detail="NCT number in body must match URL parameter"
        )
    
    # Update fields
    trial_dict = updated_trial.model_dump()
    for key, value in trial_dict.items():
        setattr(db_trial, key, value)
    
    db.commit()
    db.refresh(db_trial)
    
    logger.info(f"Updated trial: {nct_number}")
    
    return {
        "message": "Trial updated successfully",
        "trial": Trial(**db_trial.to_dict())
    }


@app.patch("/api/v1/trials/{nct_number}")
async def partial_update_trial(nct_number: str, updates: TrialPartialUpdate, db: Session = Depends(get_db)):
    """
    Partial update trial
    
    Updates only the specified fields
    """
    # Find trial
    db_trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    
    if not db_trial:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    
    # Apply updates (only non-None fields)
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trial, key, value)
    
    db.commit()
    db.refresh(db_trial)
    
    logger.info(f"Partially updated trial: {nct_number}")
    
    return {
        "message": "Trial updated successfully",
        "trial": Trial(**db_trial.to_dict())
    }


@app.delete("/api/v1/trials/{nct_number}")
async def delete_trial(nct_number: str, db: Session = Depends(get_db)):
    """
    Delete trial
    
    Removes the trial from the system
    """
    # Find trial
    db_trial = db.query(TrialDB).filter(TrialDB.nct_number == nct_number).first()
    
    if not db_trial:
        raise HTTPException(status_code=404, detail=f"Trial {nct_number} not found")
    
    db.delete(db_trial)
    db.commit()
    
    logger.info(f"Deleted trial: {nct_number}")
    
    return {
        "message": "Trial deleted successfully",
        "nct_number": nct_number
    }


class BulkImportRequest(BaseModel):
    trials: List[Trial]


@app.post("/api/v1/trials/bulk")
async def bulk_import_trials(request: BulkImportRequest, db: Session = Depends(get_db)):
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
            existing = db.query(TrialDB).filter(TrialDB.nct_number == trial.nct_number).first()
            if existing:
                skipped += 1
                errors.append({
                    "nct_number": trial.nct_number,
                    "error": "Trial already exists"
                })
                continue
            
            # Convert to dict and create DB model
            trial_dict = trial.model_dump()
            db_trial = TrialDB(**trial_dict)
            
            # Add to database
            db.add(db_trial)
            created += 1
            
        except Exception as e:
            errors.append({
                "nct_number": trial.nct_number,
                "error": str(e)
            })
    
    # Commit all changes
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk import commit failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk import failed: {str(e)}")
    
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