"""Main matching engine"""
from typing import List
from app.models.patient import PatientProfile
from app.models.trial import Trial
from app.models.matching import MatchingResponse, MatchResult, MatchingContext, MatchingStats
from app.data.constants import DATASET_VERSION
from app.matching.rules import is_hard_excluded
from app.matching.scorer import calculate_score, determine_confidence
from app.matching.reason_generator import generate_why_matched, generate_what_to_confirm
from datetime import datetime


def match_trials(patient: PatientProfile, trials: List[Trial] = None) -> MatchingResponse:
    """
    Match patient to clinical trials using rule-based logic.
    
    Args:
        patient: Patient profile to match
        trials: List of trials to match against (if None, uses mock data for backward compatibility)
    
    Returns trials sorted by:
    1. Eligibility score (possibly_eligible first)
    2. Match score (high to low)
    """
    # For backward compatibility, import TRIALS if not provided
    if trials is None:
        from app.data.mock_trials import TRIALS
        trials = TRIALS
    
    matches = []
    hard_excluded_count = 0
    
    for trial in trials:
        # Skip if wrong cancer type
        if trial.cancer_type != patient.cancer_type:
            hard_excluded_count += 1
            continue
        
        # Check hard exclusions
        exclusion_reason = is_hard_excluded(patient, trial)
        if exclusion_reason:
            hard_excluded_count += 1
            continue
        
        # Calculate match score
        score = calculate_score(patient, trial)
        confidence = determine_confidence(score, patient, trial)
        
        # Generate reasons
        why_matched = generate_why_matched(patient, trial)
        what_to_confirm = generate_what_to_confirm(patient, trial)
        
        matches.append(MatchResult(
            trial=trial,
            score=score,
            confidence=confidence,
            why_matched=why_matched,
            what_to_confirm=what_to_confirm
        ))
    
    # Sort: possibly_eligible first, then by score descending
    matches.sort(
        key=lambda m: (
            m.trial.eligibility_score != "possibly_eligible",  # False < True, so possibly_eligible comes first
            -m.score  # Descending score
        )
    )
    
    # Calculate stats
    possibly_eligible = sum(1 for m in matches if m.trial.eligibility_score == "possibly_eligible")
    likely_not_eligible = len(matches) - possibly_eligible
    
    return MatchingResponse(
        matches=matches,
        context=MatchingContext(
            patient=patient,
            dataset_version=DATASET_VERSION,
            matched_at=datetime.utcnow().isoformat() + "Z",
            total_trials=len(trials)
        ),
        stats=MatchingStats(
            total_trials=len(trials),
            possibly_eligible=possibly_eligible,
            likely_not_eligible=likely_not_eligible,
            hard_excluded=hard_excluded_count
        )
    )