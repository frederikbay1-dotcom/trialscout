"""Calculate match scores"""
from app.models.patient import PatientProfile, BreastBiomarkers, LungBiomarkers
from app.models.trial import Trial


def calculate_score(patient: PatientProfile, trial: Trial) -> int:
    """
    Calculate match score (85-99, never 100 to avoid false certainty).
    
    Scoring rules:
    - Base: 85 points
    - +5: All major biomarkers match
    - +3: ECOG explicitly meets requirement
    - +2: Trial location <10 miles
    - +5: First-line trial and patient is first-line
    - -5: Any "what to confirm" items present
    """
    score = 85  # Base score
    
    # +5 for biomarker match
    if check_biomarker_match(patient, trial):
        score += 5
    
    # +3 for ECOG match (if ECOG is not unknown)
    if patient.ecog != "unknown" and check_ecog_match(patient, trial):
        score += 3
    
    # +2 for close location (<10 miles)
    if trial.distance < 10:
        score += 2
    
    # +5 for line of therapy match
    if check_line_match(patient, trial):
        score += 5
    
    # -5 for unknowns/confirmations needed
    unknown_count = sum(1 for c in trial.eligibility_criteria if c.met == "unknown")
    if unknown_count > 0:
        score -= 5
    
    # Cap at 99 (never 100)
    return min(score, 99)


def check_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient's biomarkers match trial requirements"""
    if patient.cancer_type == "breast":
        return check_breast_biomarker_match(patient, trial)
    elif patient.cancer_type == "lung":
        return check_lung_biomarker_match(patient, trial)
    return False


def check_breast_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Breast cancer biomarker matching"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, BreastBiomarkers):
        return False
    
    # Check for matches in eligibility criteria
    matches = 0
    total_biomarker_criteria = 0
    
    for criterion in trial.eligibility_criteria:
        if criterion.category == "biomarker":
            total_biomarker_criteria += 1
            if criterion.met is True:
                matches += 1
    
    # If ≥50% of biomarker criteria met, consider it a match
    if total_biomarker_criteria > 0:
        return matches / total_biomarker_criteria >= 0.5
    
    return True  # If no biomarker criteria, assume match


def check_lung_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Lung cancer biomarker matching"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return False
    
    # Similar logic to breast
    matches = 0
    total_biomarker_criteria = 0
    
    for criterion in trial.eligibility_criteria:
        if criterion.category == "biomarker":
            total_biomarker_criteria += 1
            if criterion.met is True:
                matches += 1
    
    if total_biomarker_criteria > 0:
        return matches / total_biomarker_criteria >= 0.5
    
    return True


def check_ecog_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient ECOG meets trial requirement"""
    # Look for ECOG criterion in trial
    for criterion in trial.eligibility_criteria:
        if criterion.category == "performance" and "ECOG" in criterion.criterion:
            return criterion.met is True
    return False


def check_line_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient's line of therapy matches trial"""
    # Simplified: Check if trial title mentions "first-line" and patient is first-line
    if patient.line_of_therapy == "first":
        if "first-line" in trial.title.lower() or "1L" in trial.title:
            return True
    return False


def determine_confidence(score: int, patient: PatientProfile, trial: Trial) -> str:
    """Determine match confidence based on score and data completeness"""
    # High confidence: score ≥95, all major criteria known
    if score >= 95:
        unknown_count = sum(1 for c in trial.eligibility_criteria if c.met == "unknown")
        if unknown_count <= 1:
            return "high"
    
    # Low confidence: score <90 or many unknowns
    if score < 90:
        return "low"
    
    unknown_count = sum(1 for c in trial.eligibility_criteria if c.met == "unknown")
    if unknown_count >= 3:
        return "low"
    
    # Medium confidence: everything else
    return "medium"