"""Generate human-readable match reasons"""
from app.models.patient import PatientProfile, BreastBiomarkers, LungBiomarkers
from app.models.trial import Trial
from typing import List


def generate_why_matched(patient: PatientProfile, trial: Trial) -> List[str]:
    """
    Generate 2-4 specific reasons why trial matched.
    Priority: biomarkers > stage > ECOG > treatment history
    """
    reasons = []
    
    # Check each criterion that was met
    for criterion in trial.eligibility_criteria:
        if criterion.met is True:
            # Format reason with context
            if criterion.category == "biomarker":
                reasons.append(f"{criterion.criterion} (required)")
            elif criterion.category == "stage":
                reasons.append(f"{criterion.criterion} matches trial requirement")
            elif criterion.category == "performance":
                reasons.append(f"{criterion.criterion} meets performance criteria")
            elif criterion.category == "treatment_history":
                reasons.append(f"{criterion.criterion} aligns with inclusion criteria")
    
    # If <2 reasons, add generic ones
    if len(reasons) < 2:
        reasons.append(f"Stage {patient.stage} matches trial population")
        reasons.append(f"Cancer type ({patient.cancer_type}) matches trial focus")
    
    # Return top 4 reasons
    return reasons[:4]


def generate_what_to_confirm(patient: PatientProfile, trial: Trial) -> List[str]:
    """
    Generate 1-3 items patient should confirm with oncologist.
    Focus on "unknown" criteria and trial-specific requirements.
    """
    confirmations = []
    
    # Check for unknown criteria
    for criterion in trial.eligibility_criteria:
        if criterion.met == "unknown":
            confirmations.append(f"Confirm {criterion.criterion.lower()}")
    
    # Add trial-specific confirmations from exclusion_risks
    if trial.exclusion_risks.washout_window and "days" in trial.exclusion_risks.washout_window:
        confirmations.append(f"Verify {trial.exclusion_risks.washout_window}")
    
    if trial.exclusion_risks.lab_thresholds:
        confirmations.append(f"Check lab requirements: {trial.exclusion_risks.lab_thresholds}")
    
    # NEW: Add treatment history confirmation
    # Check eligibility criteria for treatment history requirements
    for criterion in trial.eligibility_criteria:
        if criterion.category == "treatment_history":
            if "prior lines" in criterion.criterion.lower() or "prior therapies" in criterion.criterion.lower():
                confirmations.append(f"Verify {criterion.criterion.lower()}")
                break  # Only add once
    
    # NEW: Add prior drug exposure confirmation if relevant
    if trial.exclusion_risks.prior_drug_exposure and "no prior" in trial.exclusion_risks.prior_drug_exposure.lower():
        confirmations.append(f"Confirm no prior exposure to excluded drugs")
    
    # Return top 3
    return confirmations[:3]