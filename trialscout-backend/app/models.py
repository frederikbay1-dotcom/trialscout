from sqlalchemy import Column, Integer, String, Text, Boolean, Date, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Trial(Base):
    """Trial model matching PRD database schema"""
    __tablename__ = "trials"
    
    id = Column(Integer, primary_key=True, index=True)
    nct_number = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(Text, nullable=False)
    phase = Column(String(20))
    sponsor = Column(String(255))
    status = Column(String(20))  # recruiting, active_not_recruiting, etc.
    location = Column(String(255))
    distance_miles = Column(Integer)
    cancer_type = Column(String(20))  # 'breast' or 'lung'
    last_updated = Column(Date, nullable=False)
    eligibility_score = Column(String(20))  # 'possibly_eligible' or 'likely_not_eligible'
    match_confidence = Column(String(20))  # 'high', 'medium', 'low'
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    eligibility_criteria = relationship("EligibilityCriterion", back_populates="trial")
    metadata_fields = relationship("TrialMetadata", back_populates="trial")


class EligibilityCriterion(Base):
    """Eligibility criteria for trials"""
    __tablename__ = "eligibility_criteria"
    
    id = Column(Integer, primary_key=True, index=True)
    trial_id = Column(Integer, ForeignKey("trials.id"), nullable=False)
    criterion = Column(Text, nullable=False)
    category = Column(String(50))  # 'biomarker', 'stage', 'treatment_history', etc.
    required = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    trial = relationship("Trial", back_populates="eligibility_criteria")


class TrialMetadata(Base):
    """Additional trial metadata for flexible storage"""
    __tablename__ = "trial_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    trial_id = Column(Integer, ForeignKey("trials.id"), nullable=False)
    field_name = Column(String(100))  # 'translatedInfo.design', 'burden.visitsPerMonth', etc.
    field_value = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    trial = relationship("Trial", back_populates="metadata_fields")