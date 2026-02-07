"""
TrialScout Backend API
FastAPI application for clinical trial matching
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.config import settings
from app.database import get_db, engine, Base
from app.models import Trial, EligibilityCriterion, TrialMetadata
from app.schemas import (
    PatientProfile, MatchResponse, TrialFullDetail,
    ClinicianBriefRequest, ClinicianBriefResponse,
    HealthResponse, TrialDetail, EligibilityCriterionSchema,
    TrialMetadataSchema
)
from app.matching_engine import MatchingEngine
from app.pdf_generator import ClinicianBriefGenerator

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="TrialScout API",
    description="AI-Powered Clinical Trial Matching for Cancer Patients",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
matching_engine = MatchingEngine()
pdf_generator = ClinicianBriefGenerator()


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "TrialScout API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint
    
    Returns system status and dataset information
    """
    # Count total trials
    total_trials = db.query(Trial).count()
    
    # Get most recent trial update
    latest_trial = db.query(Trial).order_by(Trial.last_updated.desc()).first()
    last_updated = latest_trial.last_updated.isoformat() if latest_trial else "N/A"
    
    return HealthResponse(
        status="ok",
        dataset_version=settings.dataset_version,
        last_updated=last_updated,
        total_trials=total_trials
    )


@app.post("/api/match", response_model=MatchResponse, tags=["Matching"])
async def match_trials(
    patient_profile: PatientProfile,
    db: Session = Depends(get_db)
):
    """
    Match patient profile against available trials
    
    This endpoint implements the rule-based matching algorithm
    as specified in the PRD. It returns ranked trials with:
    - Match scores (85-99 range)
    - Confidence levels (high/medium/low)
    - Reasons why each trial matched
    - Items to confirm with oncologist
    - Patient burden information
    
    Performance target: <3 seconds for 95th percentile
    """
    try:
        # Get all trials for the patient's cancer type
        trials = db.query(Trial).filter(
            Trial.cancer_type == patient_profile.cancer_type
        ).all()
        
        # Convert to full detail objects with relationships
        trials_full = []
        for trial in trials:
            # Get eligibility criteria
            criteria = db.query(EligibilityCriterion).filter(
                EligibilityCriterion.trial_id == trial.id
            ).all()
            
            # Get metadata
            metadata = db.query(TrialMetadata).filter(
                TrialMetadata.trial_id == trial.id
            ).all()
            
            # Create full trial object
            trial_full = TrialFullDetail(
                id=trial.id,
                nct_number=trial.nct_number,
                title=trial.title,
                phase=trial.phase,
                sponsor=trial.sponsor,
                status=trial.status,
                location=trial.location,
                distance_miles=trial.distance_miles,
                cancer_type=trial.cancer_type,
                last_updated=trial.last_updated,
                eligibility_score=trial.eligibility_score,
                match_confidence=trial.match_confidence,
                eligibility_criteria=[
                    EligibilityCriterionSchema(
                        criterion=c.criterion,
                        category=c.category,
                        required=c.required
                    ) for c in criteria
                ],
                metadata_fields=[
                    TrialMetadataSchema(
                        field_name=m.field_name,
                        field_value=m.field_value
                    ) for m in metadata
                ]
            )
            trials_full.append(trial_full)
        
        # Run matching algorithm
        matched_trials = matching_engine.match_trials(patient_profile, trials_full)
        
        # Count possibly eligible trials
        possibly_eligible_count = sum(
            1 for mt in matched_trials 
            if mt.trial.eligibility_score == "possibly_eligible"
        )
        
        return MatchResponse(
            matched_trials=matched_trials,
            total_trials_evaluated=len(trials),
            possibly_eligible_count=possibly_eligible_count,
            dataset_version=settings.dataset_version,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching trials: {str(e)}"
        )


@app.get("/api/trials/{nct_id}", response_model=TrialFullDetail, tags=["Trials"])
async def get_trial_details(nct_id: str, db: Session = Depends(get_db)):
    """
    Get full details for a specific trial by NCT number
    
    Returns complete trial information including:
    - Basic trial details
    - Eligibility criteria
    - Metadata (translated info, patient burden, etc.)
    """
    # Find trial by NCT number
    trial = db.query(Trial).filter(Trial.nct_number == nct_id).first()
    
    if not trial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trial {nct_id} not found"
        )
    
    # Get eligibility criteria
    criteria = db.query(EligibilityCriterion).filter(
        EligibilityCriterion.trial_id == trial.id
    ).all()
    
    # Get metadata
    metadata = db.query(TrialMetadata).filter(
        TrialMetadata.trial_id == trial.id
    ).all()
    
    # Create full trial object
    trial_full = TrialFullDetail(
        id=trial.id,
        nct_number=trial.nct_number,
        title=trial.title,
        phase=trial.phase,
        sponsor=trial.sponsor,
        status=trial.status,
        location=trial.location,
        distance_miles=trial.distance_miles,
        cancer_type=trial.cancer_type,
        last_updated=trial.last_updated,
        eligibility_score=trial.eligibility_score,
        match_confidence=trial.match_confidence,
        eligibility_criteria=[
            EligibilityCriterionSchema(
                criterion=c.criterion,
                category=c.category,
                required=c.required
            ) for c in criteria
        ],
        metadata_fields=[
            TrialMetadataSchema(
                field_name=m.field_name,
                field_value=m.field_value
            ) for m in metadata
        ]
    )
    
    return trial_full


@app.post("/api/brief", response_model=ClinicianBriefResponse, tags=["Brief"])
async def generate_clinician_brief(request: ClinicianBriefRequest):
    """
    Generate clinician brief PDF
    
    Creates a one-page (max 2 pages) professional PDF report
    containing:
    - Patient profile summary
    - Top N matched trials (default 5)
    - Why matched and what to confirm for each trial
    - Disclaimers and version information
    
    Performance target: <5 seconds
    """
    try:
        # Generate PDF as base64
        pdf_base64 = pdf_generator.generate_brief_base64(
            patient_profile=request.patient_profile,
            matched_trials=request.matched_trials,
            top_n=request.top_n,
            dataset_version=settings.dataset_version
        )
        
        # Generate filename
        date_str = datetime.now().strftime("%Y%m%d")
        filename = f"TrialScout_Brief_{date_str}.pdf"
        
        return ClinicianBriefResponse(
            pdf_base64=pdf_base64,
            filename=filename,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating brief: {str(e)}"
        )


@app.get("/api/trials", response_model=List[TrialDetail], tags=["Trials"])
async def list_trials(
    cancer_type: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all trials with optional filtering
    
    Query parameters:
    - cancer_type: Filter by cancer type (breast, lung)
    - status: Filter by recruiting status
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    """
    query = db.query(Trial)
    
    if cancer_type:
        query = query.filter(Trial.cancer_type == cancer_type)
    
    if status:
        query = query.filter(Trial.status == status)
    
    trials = query.offset(skip).limit(limit).all()
    
    return [
        TrialDetail(
            id=t.id,
            nct_number=t.nct_number,
            title=t.title,
            phase=t.phase,
            sponsor=t.sponsor,
            status=t.status,
            location=t.location,
            distance_miles=t.distance_miles,
            cancer_type=t.cancer_type,
            last_updated=t.last_updated,
            eligibility_score=t.eligibility_score,
            match_confidence=t.match_confidence
        ) for t in trials
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)