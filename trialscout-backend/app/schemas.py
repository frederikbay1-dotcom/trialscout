from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date


# Patient Profile Schemas
class BiomarkerStatus(BaseModel):
    """Biomarker status (present, absent, unknown)"""
    status: str = Field(..., description="present, absent, or unknown")
    subtype: Optional[str] = Field(None, description="Specific subtype if applicable")


class PatientProfile(BaseModel):
    """Patient profile for matching"""
    cancer_type: str = Field(..., description="breast or lung")
    stage: str = Field(..., description="I, II, III, or IV")
    age: Optional[int] = None
    sex: Optional[str] = None
    ecog: Optional[int] = Field(None, ge=0, le=4, description="ECOG performance status 0-4")
    
    # Biomarkers
    biomarkers: Dict[str, BiomarkerStatus] = Field(default_factory=dict)
    
    # Treatment history
    prior_therapies: List[str] = Field(default_factory=list)
    current_line: Optional[str] = Field(None, description="first-line, post-targeted, later-line")
    
    # Location (for distance calculation)
    location_zip: Optional[str] = None


# Trial Schemas
class TrialBase(BaseModel):
    """Base trial information"""
    nct_number: str
    title: str
    phase: Optional[str] = None
    sponsor: Optional[str] = None
    status: str
    location: Optional[str] = None
    distance_miles: Optional[int] = None
    cancer_type: str
    last_updated: date


class TrialDetail(TrialBase):
    """Detailed trial information"""
    id: int
    eligibility_score: Optional[str] = None
    match_confidence: Optional[str] = None
    
    class Config:
        from_attributes = True


class EligibilityCriterionSchema(BaseModel):
    """Eligibility criterion"""
    criterion: str
    category: str
    required: bool
    
    class Config:
        from_attributes = True


class TrialMetadataSchema(BaseModel):
    """Trial metadata field"""
    field_name: str
    field_value: str
    
    class Config:
        from_attributes = True


class TrialFullDetail(TrialDetail):
    """Full trial details with criteria and metadata"""
    eligibility_criteria: List[EligibilityCriterionSchema] = []
    metadata_fields: List[TrialMetadataSchema] = []
    
    class Config:
        from_attributes = True


# Matching Result Schemas
class MatchReason(BaseModel):
    """Reason why a trial matched"""
    criterion: str
    met: bool
    description: str


class ConfirmationItem(BaseModel):
    """Item to confirm with oncologist"""
    item: str
    description: str
    priority: str = Field(..., description="high, medium, or low")


class MatchedTrial(BaseModel):
    """Trial with matching information"""
    trial: TrialDetail
    score: int = Field(..., ge=0, le=99, description="Match score 0-99")
    confidence: str = Field(..., description="high, medium, or low")
    why_matched: List[MatchReason]
    what_to_confirm: List[ConfirmationItem]
    patient_burden: Dict[str, Any] = Field(
        default_factory=dict,
        description="visits_per_month, imaging_frequency, biopsy_required, hospital_stays"
    )


class MatchResponse(BaseModel):
    """Response from matching endpoint"""
    matched_trials: List[MatchedTrial]
    total_trials_evaluated: int
    possibly_eligible_count: int
    dataset_version: str
    generated_at: str


# Clinician Brief Schemas
class ClinicianBriefRequest(BaseModel):
    """Request to generate clinician brief"""
    patient_profile: PatientProfile
    matched_trials: List[MatchedTrial]
    top_n: int = Field(default=5, ge=1, le=10, description="Number of top trials to include")


class ClinicianBriefResponse(BaseModel):
    """Response with PDF brief"""
    pdf_base64: str
    filename: str
    generated_at: str


# Health Check Schema
class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    dataset_version: str
    last_updated: str
    total_trials: int