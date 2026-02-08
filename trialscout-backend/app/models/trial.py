"""Trial models for clinical trial data"""
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


class TrialPartialUpdate(BaseModel):
    """Partial update model - all fields optional"""
    title: Optional[str] = None
    phase: Optional[Literal["Phase I", "Phase I/II", "Phase II", "Phase II/III", "Phase III"]] = None
    sponsor: Optional[str] = None
    status: Optional[Literal["recruiting", "active_not_recruiting", "completed"]] = None
    location: Optional[str] = None
    distance: Optional[int] = None
    eligibility_score: Optional[Literal["possibly_eligible", "likely_not_eligible"]] = None
    match_confidence: Optional[Literal["high", "medium", "low"]] = None
    eligibility_criteria: Optional[List[EligibilityCriterion]] = None
    burden: Optional[PatientBurden] = None
    exclusion_risks: Optional[ExclusionRisks] = None
    translated_info: Optional[TranslatedInfo] = None
    last_updated: Optional[str] = None