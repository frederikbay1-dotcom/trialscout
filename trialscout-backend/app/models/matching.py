"""Matching result models"""
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from app.models.trial import Trial
from app.models.patient import PatientProfile


class MatchResult(BaseModel):
    trial: Trial
    score: int = Field(..., ge=85, le=99, description="Match score (85-99, never 100)")
    confidence: Literal["high", "medium", "low"]
    why_matched: List[str] = Field(..., description="2-4 specific reasons")
    what_to_confirm: List[str] = Field(..., description="1-3 items to verify")
    excluded_by: Optional[str] = Field(None, description="If hard-excluded, reason why")


class MatchingContext(BaseModel):
    patient: PatientProfile
    dataset_version: str = "1.0"
    matched_at: str = Field(..., description="ISO timestamp")
    total_trials: int


class MatchingStats(BaseModel):
    total_trials: int
    possibly_eligible: int
    likely_not_eligible: int
    hard_excluded: int


class MatchingResponse(BaseModel):
    matches: List[MatchResult] = Field(..., description="Sorted: possibly_eligible first, then by score")
    context: MatchingContext
    stats: MatchingStats

    class Config:
        json_schema_extra = {
            "example": {
                "matches": [
                    {
                        "trial": {},  # Full trial object
                        "score": 97,
                        "confidence": "high",
                        "why_matched": [
                            "ER-positive status matches (required)",
                            "Stage IV matches trial requirement",
                            "ECOG 0-1 meets performance criteria"
                        ],
                        "what_to_confirm": [
                            "Verify HER2 testing was done within 6 months",
                            "Confirm adequate washout from last therapy"
                        ]
                    }
                ],
                "context": {
                    "patient": {},  # Full patient profile
                    "dataset_version": "1.0",
                    "matched_at": "2025-02-07T12:00:00Z",
                    "total_trials": 20
                },
                "stats": {
                    "total_trials": 20,
                    "possibly_eligible": 5,
                    "likely_not_eligible": 10,
                    "hard_excluded": 5
                }
            }
        }