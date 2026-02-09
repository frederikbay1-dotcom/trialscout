"""SQLAlchemy models for clinical trials"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class TrialDB(Base):
    """Database model for clinical trials"""
    __tablename__ = "trials"
    
    # Primary key
    id = Column(String, primary_key=True)  # e.g., "bc_trial_001"
    
    # Core trial information
    nct_number = Column(String, unique=True, nullable=False, index=True)
    title = Column(Text, nullable=False)
    phase = Column(String, nullable=False)  # e.g., "Phase III"
    sponsor = Column(String, nullable=False)
    status = Column(String, nullable=False)  # e.g., "recruiting"
    
    # Location and distance
    location = Column(String, nullable=False)
    distance = Column(Integer, nullable=False)  # Miles from patient
    
    # Cancer type
    cancer_type = Column(String, nullable=False, index=True)  # "breast" or "lung"
    
    # Dates
    last_updated = Column(String, nullable=False)  # ISO date string
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Matching metadata (from mock data)
    eligibility_score = Column(String, nullable=False)  # "possibly_eligible" or "likely_not_eligible"
    match_confidence = Column(String, nullable=False)  # "high", "medium", "low"
    
    # Complex nested data stored as JSON
    why_matched = Column(JSON, nullable=False)  # List[str]
    what_to_confirm = Column(JSON, nullable=False)  # List[str]
    eligibility_criteria = Column(JSON, nullable=False)  # List[dict]
    burden = Column(JSON, nullable=False)  # dict
    exclusion_risks = Column(JSON, nullable=False)  # dict
    translated_info = Column(JSON, nullable=False)  # dict
    
    def __repr__(self):
        return f"<Trial(nct='{self.nct_number}', title='{self.title[:50]}...')>"
    
    def to_dict(self):
        """Convert to dictionary matching Trial schema"""
        return {
            "id": self.id,
            "nct_number": self.nct_number,
            "title": self.title,
            "phase": self.phase,
            "sponsor": self.sponsor,
            "status": self.status,
            "location": self.location,
            "distance": self.distance,
            "cancer_type": self.cancer_type,
            "last_updated": self.last_updated,
            "eligibility_score": self.eligibility_score,
            "match_confidence": self.match_confidence,
            "why_matched": self.why_matched,
            "what_to_confirm": self.what_to_confirm,
            "eligibility_criteria": self.eligibility_criteria,
            "burden": self.burden,
            "exclusion_risks": self.exclusion_risks,
            "translated_info": self.translated_info
        }