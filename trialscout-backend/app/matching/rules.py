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
    
    # NEW: Check eligibility criteria exclusions
    criteria_exclusion = check_eligibility_criteria_exclusions(patient, trial)
    if criteria_exclusion:
        return criteria_exclusion
    
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
    
    # HER2-LOW TRIALS EXCLUSION
    # Clinical definition:
    # - HER2-low = IHC 1+ or IHC 2+/ISH-
    # - HER2 IHC 0 = negative (NOT low)
    # - HER2 IHC 3+ or ISH+ = positive (NOT low)
    
    trial_title_lower = trial.title.lower()
    
    # Get HER2 status as string and lowercase for comparison
    her2_status_str = str(biomarkers.HER2).lower() if biomarkers.HER2 else "unknown"
    
    # Check if this is a HER2-low specific trial (by title)
    if "her2-low" in trial_title_lower or "her2 low" in trial_title_lower:
        
        # Exclude if patient is HER2 IHC 0 (negative)
        if "0" in her2_status_str or "negative" in her2_status_str:
            return "HER2-low trial requires HER2-low status (IHC 1+ or IHC 2+/ISH-), patient is HER2 IHC 0 (negative)"
        
        # Exclude if patient is HER2-positive (IHC 3+ or amplified)
        if "3+" in her2_status_str or "positive" in her2_status_str or "amplified" in her2_status_str:
            return "HER2-low trial requires HER2-low status (IHC 1+ or IHC 2+/ISH-), patient is HER2-positive"
        
        # If patient is HER2 "1+" or "2+/ISH-" or "low", they qualify (don't exclude)
        # If HER2 is unknown, don't exclude (will appear in "What to Confirm")
    
    # ALSO check eligibility criteria (in case title doesn't say "HER2-low")
    for criterion in trial.eligibility_criteria:
        if criterion.category == "biomarker":
            criterion_text = criterion.criterion.lower()
            
            # Look for HER2-low requirement
            if "her2-low" in criterion_text or ("her2" in criterion_text and "low" in criterion_text):
                if "required" in criterion_text or "ihc 1+" in criterion_text or "ihc 2+" in criterion_text:
                    
                    # Exclude HER2 IHC 0 patients
                    if "0" in her2_status_str or "negative" in her2_status_str:
                        return "Trial requires HER2-low (IHC 1+), patient is HER2 IHC 0"
                    
                    # Exclude HER2-positive patients
                    if "3+" in her2_status_str or "positive" in her2_status_str:
                        return "Trial requires HER2-low, patient is HER2-positive"
    
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


def check_eligibility_criteria_exclusions(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """
    Check if patient violates any eligibility criteria that require
    ABSENCE of certain biomarkers (e.g., "No EGFR mutations").
    
    This catches trials that don't have exclusions in their title.
    """
    if patient.cancer_type == "lung":
        biomarkers = patient.biomarkers
        if not isinstance(biomarkers, LungBiomarkers):
            return None
        
        # Check each eligibility criterion
        for criterion in trial.eligibility_criteria:
            if criterion.category != "biomarker":
                continue
            
            criterion_lower = criterion.criterion.lower()
            
            # "No EGFR mutations" requirement
            if ("no egfr" in criterion_lower or "egfr-negative" in criterion_lower or
                "without egfr" in criterion_lower):
                if biomarkers.EGFR.status == "present":
                    return "Trial requires no EGFR mutations (patient is EGFR-positive)"
            
            # "No ALK rearrangements" requirement
            if ("no alk" in criterion_lower or "alk-negative" in criterion_lower or
                "without alk" in criterion_lower):
                if biomarkers.ALK == "present":
                    return "Trial requires no ALK rearrangements (patient is ALK-positive)"
            
            # "No ROS1 rearrangements" requirement
            if ("no ros1" in criterion_lower or "ros1-negative" in criterion_lower or
                "without ros1" in criterion_lower):
                if biomarkers.ROS1 == "present":
                    return "Trial requires no ROS1 rearrangements (patient is ROS1-positive)"
            
            # "No EGFR/ALK/ROS1" combined requirement
            if "no egfr" in criterion_lower and "alk" in criterion_lower:
                if biomarkers.EGFR.status == "present":
                    return "Trial requires no EGFR/ALK alterations (patient is EGFR-positive)"
                if biomarkers.ALK == "present":
                    return "Trial requires no EGFR/ALK alterations (patient is ALK-positive)"
            
            # "No EGFR/ALK/ROS1" triple requirement
            if ("no egfr" in criterion_lower and "alk" in criterion_lower and "ros1" in criterion_lower):
                if biomarkers.EGFR.status == "present":
                    return "Trial requires no driver mutations (patient is EGFR-positive)"
                if biomarkers.ALK == "present":
                    return "Trial requires no driver mutations (patient is ALK-positive)"
                if biomarkers.ROS1 == "present":
                    return "Trial requires no driver mutations (patient is ROS1-positive)"
            
            # "No driver mutations" or "driver-negative" requirement
            if ("no driver" in criterion_lower or "driver-negative" in criterion_lower or
                "driver negative" in criterion_lower):
                if biomarkers.EGFR.status == "present":
                    return "Trial requires no driver mutations (patient is EGFR-positive)"
                if biomarkers.ALK == "present":
                    return "Trial requires no driver mutations (patient is ALK-positive)"
                if biomarkers.ROS1 == "present":
                    return "Trial requires no driver mutations (patient is ROS1-positive)"
                if biomarkers.KRAS.status == "present" and biomarkers.KRAS.mutation == "G12C":
                    return "Trial requires no driver mutations (patient is KRAS G12C-positive)"
            
            # NEW: "HER2 mutation (required)"
            if "her2 mutation" in criterion_lower and "required" in criterion_lower:
                return "Trial requires HER2 mutation (patient HER2 status not available for lung cancer)"
            
            # NEW: "MET exon 14 skipping mutation (required)"
            if ("met exon 14" in criterion_lower or "met ex14" in criterion_lower) and "required" in criterion_lower:
                if biomarkers.MET.status != "present":
                    return "Trial requires MET exon 14 skipping (patient is MET-negative)"
                # If MET is present, check if it's specifically exon 14
                if biomarkers.MET.status == "present":
                    if not biomarkers.MET.alteration or "exon 14" not in biomarkers.MET.alteration.lower():
                        return f"Trial requires MET exon 14 skipping (patient MET status: {biomarkers.MET.alteration or 'unspecified'})"
            
            # NEW: "BRAF V600E mutation (required)"
            if "braf v600e" in criterion_lower and "required" in criterion_lower:
                if biomarkers.BRAF != "present":
                    return "Trial requires BRAF V600E mutation (patient is BRAF-negative)"
            
            # NEW: "RET fusion (required)"
            if ("ret fusion" in criterion_lower or "ret rearrangement" in criterion_lower) and "required" in criterion_lower:
                return "Trial requires RET fusion (patient RET status not available)"
            
            # NEW: "NTRK fusion (required)"
            if "ntrk fusion" in criterion_lower and "required" in criterion_lower:
                return "Trial requires NTRK fusion (patient NTRK status not available)"
    
    elif patient.cancer_type == "breast":
        biomarkers = patient.biomarkers
        if not isinstance(biomarkers, BreastBiomarkers):
            return None
        
        # Check for HER2 requirements in eligibility criteria
        for criterion in trial.eligibility_criteria:
            if criterion.category != "biomarker":
                continue
            
            criterion_lower = criterion.criterion.lower()
            
            # "HER2-negative" or "No HER2" requirement
            if ("her2-negative" in criterion_lower or "her2 negative" in criterion_lower or
                "no her2" in criterion_lower):
                if biomarkers.HER2 == "positive":
                    return "Trial requires HER2-negative status (patient is HER2-positive)"
            
            # "ER-positive" requirement
            if ("er-positive" in criterion_lower or "er positive" in criterion_lower or
                "er+" in criterion_lower):
                if biomarkers.ER == "absent":
                    return "Trial requires ER-positive status (patient is ER-negative)"
            
            # "Triple-negative" requirement
            if "triple-negative" in criterion_lower or "tnbc" in criterion_lower:
                if biomarkers.ER == "present" or biomarkers.PR == "present" or biomarkers.HER2 == "positive":
                    return "Trial requires triple-negative status (patient has positive receptors)"
    
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
    
    # NEW: HER2 MUTATION trials (requires specific mutation patient doesn't have)
    # HER2 is not in LungBiomarkers model, so any HER2-mutant trial should be excluded
    if "HER2" in trial.title and ("mutation" in trial.title.lower() or "mutant" in trial.title.lower()):
        return "HER2-mutant trial requires documented HER2 mutation (patient HER2 status not available for lung cancer)"
    
    # NEW: MET EXON 14 trials
    if "MET" in trial.title and ("exon 14" in trial.title.lower() or "ex14" in trial.title.lower() or "Exon 14" in trial.title):
        if biomarkers.MET.status != "present":
            return "MET exon 14 trial requires MET exon 14 skipping mutation (patient is MET-negative)"
        # If MET is present, check if it's specifically exon 14
        if biomarkers.MET.status == "present":
            if not biomarkers.MET.alteration or "exon 14" not in biomarkers.MET.alteration.lower():
                return f"MET exon 14 trial requires exon 14 skipping (patient MET status: {biomarkers.MET.alteration or 'unspecified'})"
    
    # NEW: BRAF V600E trials
    if "BRAF" in trial.title and ("V600E" in trial.title or "V600" in trial.title):
        if biomarkers.BRAF != "present":
            return "BRAF V600E trial requires BRAF V600E mutation (patient is BRAF-negative)"
    
    # NEW: RET FUSION trials
    # RET is not in LungBiomarkers model, so any RET fusion trial should be excluded
    if "RET" in trial.title and ("fusion" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        return "RET fusion trial requires RET rearrangement (patient RET status not available)"
    
    # NEW: NTRK FUSION trials
    # NTRK is not in LungBiomarkers model, so any NTRK fusion trial should be excluded
    if "NTRK" in trial.title and ("fusion" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        return "NTRK fusion trial requires NTRK fusion (patient NTRK status not available)"
    
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