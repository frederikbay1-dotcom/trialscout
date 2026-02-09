"""Hard exclusion rules for matching"""
from app.models.patient import PatientProfile, BreastBiomarkers, LungBiomarkers
from app.models.trial import Trial
from typing import Optional


def is_hard_excluded(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """
    Check if patient is hard-excluded from trial.
    Returns exclusion reason string if excluded, None if not excluded.
    """
    # Check stage exclusions
    stage_exclusion = check_stage_exclusion(patient, trial)
    if stage_exclusion:
        return stage_exclusion
    
    # Check biomarker exclusions (depends on cancer type)
    biomarker_exclusion = check_biomarker_exclusion(patient, trial)
    if biomarker_exclusion:
        return biomarker_exclusion
    
    # Check ECOG exclusions
    ecog_exclusion = check_ecog_exclusion(patient, trial)
    if ecog_exclusion:
        return ecog_exclusion
    
    # Check prior therapy exclusions
    # DISABLED: Make therapy checks "soft" to prevent false negatives
    # Doctors should verify therapy history, not algorithm
    # prior_therapy_exclusion = check_prior_therapy_exclusion(patient, trial)
    # if prior_therapy_exclusion:
    #     return prior_therapy_exclusion
    
    return None


def check_stage_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check if patient stage excludes them from trial"""
    # Stage IV patients excluded from neoadjuvant/adjuvant trials
    if patient.stage == "IV":
        if "neoadjuvant" in trial.title.lower():
            return "Stage IV patient excluded from neoadjuvant trial"
        if "adjuvant" in trial.title.lower() and "metastatic" not in trial.title.lower():
            return "Stage IV patient excluded from adjuvant-only trial"
    
    return None


def check_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check if patient biomarkers exclude them from trial"""
    if patient.cancer_type == "breast":
        return check_breast_biomarker_exclusion(patient, trial)
    elif patient.cancer_type == "lung":
        return check_lung_biomarker_exclusion(patient, trial)
    return None


def check_breast_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Breast cancer biomarker exclusions"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, BreastBiomarkers):
        return None
    
    # HER2-POSITIVE trials exclude HER2-negative or HER2-low
    if "HER2-positive" in trial.title or "HER2+" in trial.title:
        if biomarkers.HER2 in ["negative", "low"]:
            return f"HER2+ trial requires HER2-positive status (patient is {biomarkers.HER2})"
    
    # HER2-LOW trials exclude HER2-negative or HER2-positive
    if "HER2-low" in trial.title.lower() or "HER2 low" in trial.title.lower():
        if biomarkers.HER2 in ["negative", "positive"]:
            return f"HER2-low trial requires HER2-low status (patient is {biomarkers.HER2})"
    
    # HER2-NEGATIVE trials (HR+/HER2-) - treat HER2-low as HER2-negative for HR+ trials
    if ("HER2-" in trial.title or "HER2 -" in trial.title or "HER2-negative" in trial.title.lower()) and \
       ("HR+" in trial.title or "ER+" in trial.title or "hormone receptor" in trial.title.lower()):
        # For HR+/HER2- trials, HER2-low is acceptable (counts as HER2-)
        if biomarkers.HER2 == "positive":
            return "HR+/HER2- trial excludes HER2-positive patients"
    
    # ER-POSITIVE trials exclude ER-negative
    if "ER+" in trial.title or "ER-positive" in trial.title:
        if biomarkers.ER == "absent":
            return "ER+ trial requires ER-positive status (patient is ER-negative)"
    
    # ER-NEGATIVE trials exclude ER-positive
    if "ER-" in trial.title or "ER-negative" in trial.title:
        if biomarkers.ER == "present":
            return "ER- trial requires ER-negative status (patient is ER-positive)"
    
    # HR+ (Hormone Receptor Positive) trials require ER+ and/or PR+
    if "HR+" in trial.title or "HR-positive" in trial.title or "hormone receptor positive" in trial.title.lower():
        if biomarkers.ER == "absent" and biomarkers.PR == "absent":
            return "HR+ trial requires ER+ and/or PR+ (patient is ER-/PR-)"
    
    # TRIPLE-NEGATIVE trials exclude ER+, PR+, or HER2+
    # BUT: Skip if trial also accepts HR+ patients (indicated by "HR+" or "or" in title)
    if ("triple-negative" in trial.title.lower() or "TNBC" in trial.title) and \
       not ("HR+" in trial.title or " or " in trial.title):
        if biomarkers.ER == "present" or biomarkers.PR == "present" or biomarkers.HER2 == "positive":
            return "Triple-negative trial requires ER-/PR-/HER2- (patient has positive receptors)"
    
    return None


def check_lung_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Lung cancer biomarker exclusions with mutual exclusivity"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return None
    
    # EGFR+ trials
    if "EGFR" in trial.title and "mutation" in trial.title.lower():
        # Exclude EGFR-negative patients
        if biomarkers.EGFR.status == "absent":
            return "EGFR-mutant trial requires EGFR mutation (patient is EGFR-negative)"
        
        # Mutual exclusivity: Exclude if patient has ALK or ROS1
        if biomarkers.ALK == "present":
            return "EGFR trial excludes ALK-positive patients (mutually exclusive drivers)"
        if biomarkers.ROS1 == "present":
            return "EGFR trial excludes ROS1-positive patients (mutually exclusive drivers)"
    
    # ALK+ trials
    if "ALK" in trial.title and ("positive" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        # Exclude ALK-negative patients
        if biomarkers.ALK == "absent":
            return "ALK+ trial requires ALK rearrangement (patient is ALK-negative)"
        
        # Mutual exclusivity: Exclude if patient has EGFR or ROS1
        if biomarkers.EGFR.status == "present":
            return "ALK trial excludes EGFR-positive patients (mutually exclusive drivers)"
        if biomarkers.ROS1 == "present":
            return "ALK trial excludes ROS1-positive patients (mutually exclusive drivers)"
    
    # ROS1+ trials
    if "ROS1" in trial.title and ("positive" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        # Exclude ROS1-negative patients
        if biomarkers.ROS1 == "absent":
            return "ROS1+ trial requires ROS1 rearrangement (patient is ROS1-negative)"
        
        # Mutual exclusivity: Exclude if patient has EGFR or ALK
        if biomarkers.EGFR.status == "present":
            return "ROS1 trial excludes EGFR-positive patients (mutually exclusive drivers)"
        if biomarkers.ALK == "present":
            return "ROS1 trial excludes ALK-positive patients (mutually exclusive drivers)"
    
    # KRAS G12C trials
    if "KRAS G12C" in trial.title or "KRAS-G12C" in trial.title:
        # Exclude non-G12C KRAS mutations
        if biomarkers.KRAS.status == "present" and biomarkers.KRAS.mutation != "G12C":
            return f"KRAS G12C trial requires G12C mutation (patient has {biomarkers.KRAS.mutation})"
        if biomarkers.KRAS.status == "absent":
            return "KRAS G12C trial requires KRAS mutation (patient is KRAS-negative)"
        
        # Mutual exclusivity: Exclude if patient has EGFR or ALK
        if biomarkers.EGFR.status == "present":
            return "KRAS G12C trial excludes EGFR-positive patients (mutually exclusive drivers)"
        if biomarkers.ALK == "present":
            return "KRAS G12C trial excludes ALK-positive patients (mutually exclusive drivers)"
    
    # "No driver mutation" trials (exclude patients WITH actionable alterations)
    if "no driver" in trial.title.lower() or "driver negative" in trial.title.lower():
        if biomarkers.EGFR.status == "present":
            return "No-driver trial excludes EGFR-positive patients"
        if biomarkers.ALK == "present":
            return "No-driver trial excludes ALK-positive patients"
        if biomarkers.ROS1 == "present":
            return "No-driver trial excludes ROS1-positive patients"
        if biomarkers.KRAS.status == "present" and biomarkers.KRAS.mutation == "G12C":
            return "No-driver trial excludes KRAS G12C-positive patients"
    
    return None


def check_ecog_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check ECOG performance status exclusions"""
    # If patient ECOG is unknown, do NOT exclude (treat as neutral)
    if patient.ecog == "unknown":
        return None
    
    # ECOG 3-4 patients excluded from ECOG 0-1 trials
    if patient.ecog in ["3", "4"]:
        # Check if trial requires ECOG 0-1 (look in eligibility criteria)
        for criterion in trial.eligibility_criteria:
            if "ECOG" in criterion.criterion and ("0-1" in criterion.criterion or "0 or 1" in criterion.criterion):
                return f"ECOG {patient.ecog} patient excluded from ECOG 0-1 trial"
    
    return None


def check_prior_therapy_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check prior therapy exclusions"""
    # Extract drug names from prior treatments
    prior_drug_names = [t.name.lower() if t.name else "" for t in patient.prior_treatments]
    
    # Check trial's prior drug exposure exclusions
    exclusion_text = trial.exclusion_risks.prior_drug_exposure.lower()
    
    # Common exclusions
    exclusion_drugs = {
        "osimertinib": "osimertinib",
        "t-dxd": "trastuzumab deruxtecan",
        "enhertu": "trastuzumab deruxtecan",
        "palbociclib": "palbociclib",
        "ribociclib": "ribociclib",
        "abemaciclib": "abemaciclib"
    }
    
    for drug_key, drug_name in exclusion_drugs.items():
        if f"no prior {drug_key}" in exclusion_text:
            if any(drug_key in prior for prior in prior_drug_names):
                return f"Trial excludes patients with prior {drug_name} (patient has prior exposure)"
    
    return None