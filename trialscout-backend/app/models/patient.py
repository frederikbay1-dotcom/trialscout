"""Patient profile models for clinical trial matching"""
from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional, List, Union, Any
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
    mutation: Optional[str] = None
    
    @field_validator('mutation', mode='before')
    @classmethod
    def validate_mutation(cls, v):
        """Normalize EGFR mutation values"""
        if v is None or v == '' or v == 'unknown':
            return None
        
        # Normalize to accepted values
        v_str = str(v).strip()
        v_lower = v_str.lower()
        
        if 'exon 19' in v_lower or 'ex19' in v_lower or 'e19' in v_lower:
            return "Exon 19 deletion"
        elif 'l858r' in v_lower:
            return "L858R"
        elif 'exon 20' in v_lower or 'ex20' in v_lower or 'e20' in v_lower:
            return "Exon 20 insertion"
        elif 't790m' in v_lower:
            return "T790M"
        elif v_str in ["Exon 19 deletion", "L858R", "Exon 20 insertion", "T790M", "Other"]:
            return v_str
        else:
            return "Other"


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
    
    # Biomarkers (will be validated based on cancer_type)
    biomarkers: Union[BreastBiomarkers, LungBiomarkers, Any]
    
    # Treatment history
    prior_treatments: List[PriorTreatment] = Field(default_factory=list)
    line_of_therapy: Optional[str] = Field(default="later_line", description="Line of therapy")
    
    @field_validator('biomarkers', mode='before')
    @classmethod
    def validate_biomarkers(cls, v, info):
        """Validate biomarkers based on cancer_type"""
        if not info.data:
            return v
            
        cancer_type = info.data.get('cancer_type')
        
        if cancer_type == CancerType.BREAST or cancer_type == 'breast':
            # Validate as BreastBiomarkers
            return BreastBiomarkers(**v) if isinstance(v, dict) else v
        elif cancer_type == CancerType.LUNG or cancer_type == 'lung':
            # Validate as LungBiomarkers
            return LungBiomarkers(**v) if isinstance(v, dict) else v
        
        return v
    
    @field_validator('line_of_therapy', mode='before')
    @classmethod
    def validate_line_of_therapy(cls, v):
        """Validate and normalize line_of_therapy"""
        if v is None or v == '':
            return "later_line"
        
        # Handle string values
        if isinstance(v, str):
            v_lower = v.lower().replace('-', '_').replace(' ', '_')
            if v_lower in ['first', 'first_line']:
                return "first"
            elif v_lower in ['post_targeted', 'posttargeted', 'post_cdk46', 'second_line']:
                return "post_targeted"
            elif v_lower in ['later_line', 'laterline', 'third_line', 'later']:
                return "later_line"
            # If it's already a valid value, return it
            if v_lower in ['first', 'post_targeted', 'later_line']:
                return v_lower
        
        # Default to later_line for any unrecognized value
        return "later_line"
    
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