# Snapdev Prompt: Add NSCLC Matching Logic to Backend

## Objective
Enhance the matching engine to properly handle NSCLC (lung cancer) biomarker matching with the same rigor as breast cancer matching.

## Context
The backend matching engine currently has comprehensive logic for breast cancer biomarkers (ER, PR, HER2) but only basic placeholder logic for NSCLC biomarkers (EGFR, ALK, KRAS, etc.). We need to add complete NSCLC matching rules.

## Reference
- Main spec: `TrialScout_Backend_Spec.md`
- Existing files to modify:
  - `app/matching/rules.py` (add lung-specific exclusion rules)
  - `app/matching/scorer.py` (add lung-specific scoring bonuses)
  - `app/matching/reason_generator.py` (add lung-specific reason generation)

---

## Instructions for Snapdev

@workspace Add comprehensive NSCLC biomarker matching logic to the matching engine.

### Step 1: Enhance `app/matching/rules.py`

Replace the placeholder `check_lung_biomarker_exclusion` function with this complete version:

```python
def check_lung_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """
    Comprehensive lung cancer biomarker exclusion rules.
    
    NSCLC trials are biomarker-specific and mutually exclusive.
    Key principle: Each trial targets ONE specific alteration.
    """
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return None
    
    # Extract trial biomarker requirements from title
    trial_title_lower = trial.title.lower()
    
    # ============================================================
    # 1. EGFR-MUTANT TRIALS
    # ============================================================
    if ("egfr" in trial_title_lower and 
        ("mutation" in trial_title_lower or "mutant" in trial_title_lower)):
        
        # Exclude if patient is EGFR-negative
        if biomarkers.EGFR.status == "absent":
            return "EGFR-mutant trial requires EGFR mutation (patient is EGFR-negative)"
        
        # Some trials require specific EGFR mutations
        if "exon 19" in trial_title_lower or "l858r" in trial_title_lower:
            if biomarkers.EGFR.status == "present":
                patient_mutation = biomarkers.EGFR.mutation
                # If patient has EGFR but wrong subtype
                if patient_mutation and patient_mutation not in ["Exon 19 deletion", "L858R"]:
                    return f"Trial requires exon 19 deletion or L858R (patient has {patient_mutation})"
        
        # T790M-specific trials (third-line, post-resistance)
        if "t790m" in trial_title_lower:
            if biomarkers.EGFR.mutation != "T790M":
                return "Trial requires T790M resistance mutation"
        
        return None
    
    # ============================================================
    # 2. ALK-POSITIVE TRIALS
    # ============================================================
    if "alk" in trial_title_lower and ("positive" in trial_title_lower or 
                                        "rearrangement" in trial_title_lower or
                                        "fusion" in trial_title_lower):
        if biomarkers.ALK == "absent":
            return "ALK-positive trial requires ALK rearrangement (patient is ALK-negative)"
        return None
    
    # ============================================================
    # 3. KRAS TRIALS
    # ============================================================
    if "kras" in trial_title_lower:
        # KRAS G12C-specific trials
        if "g12c" in trial_title_lower:
            if biomarkers.KRAS.status == "absent":
                return "KRAS G12C trial requires KRAS mutation (patient is KRAS-negative)"
            if biomarkers.KRAS.status == "present" and biomarkers.KRAS.mutation != "G12C":
                return f"KRAS G12C trial requires G12C mutation (patient has {biomarkers.KRAS.mutation})"
        # Any KRAS mutation
        elif biomarkers.KRAS.status == "absent":
            return "KRAS-mutant trial requires KRAS mutation (patient is KRAS-negative)"
        return None
    
    # ============================================================
    # 4. ROS1-POSITIVE TRIALS
    # ============================================================
    if "ros1" in trial_title_lower and ("positive" in trial_title_lower or
                                         "rearrangement" in trial_title_lower or
                                         "fusion" in trial_title_lower):
        if biomarkers.ROS1 == "absent":
            return "ROS1-positive trial requires ROS1 rearrangement (patient is ROS1-negative)"
        return None
    
    # ============================================================
    # 5. MET ALTERATION TRIALS
    # ============================================================
    if "met" in trial_title_lower and ("exon 14" in trial_title_lower or
                                        "amplification" in trial_title_lower or
                                        "skipping" in trial_title_lower):
        if biomarkers.MET.status == "absent":
            return "MET-altered trial requires MET alteration (patient is MET-negative)"
        
        # Specific MET alteration type required
        if "exon 14" in trial_title_lower:
            if biomarkers.MET.alteration != "Exon 14 skipping":
                return "Trial requires MET exon 14 skipping"
        return None
    
    # ============================================================
    # 6. BRAF V600E TRIALS
    # ============================================================
    if "braf" in trial_title_lower and ("v600" in trial_title_lower or "v600e" in trial_title_lower):
        if biomarkers.BRAF == "absent":
            return "BRAF V600E trial requires BRAF V600E mutation (patient is BRAF-negative)"
        return None
    
    # ============================================================
    # 7. HER2-MUTANT TRIALS (NSCLC)
    # ============================================================
    # Note: HER2 mutations in NSCLC are different from HER2 amplification in breast cancer
    if "her2" in trial_title_lower and "mutation" in trial_title_lower and patient.cancer_type == "lung":
        # For NSCLC, we don't track HER2 in LungBiomarkers currently
        # This is a limitation - may need to add HER2 field to LungBiomarkers
        # For now, treat as not excluded if we don't have data
        return None
    
    # ============================================================
    # 8. PD-L1 HIGH TRIALS (Immunotherapy)
    # ============================================================
    if "pd-l1" in trial_title_lower or "pdl1" in trial_title_lower:
        # Check for PD-L1 threshold requirements
        if "≥50" in trial.title or ">=50" in trial.title or "high" in trial_title_lower:
            if biomarkers.PDL1.status == "present" and biomarkers.PDL1.percentage is not None:
                if biomarkers.PDL1.percentage < 50:
                    return f"Trial requires PD-L1 ≥50% (patient has {biomarkers.PDL1.percentage}%)"
            # If PD-L1 status unknown, don't exclude (let it be a "what to confirm")
        return None
    
    # ============================================================
    # 9. "NO DRIVER MUTATION" TRIALS
    # ============================================================
    # Some trials explicitly require absence of targetable mutations
    if ("no driver" in trial_title_lower or 
        "driver negative" in trial_title_lower or
        "non-oncogene" in trial_title_lower):
        
        # Check if patient has any actionable alterations
        has_driver = (
            biomarkers.EGFR.status == "present" or
            biomarkers.ALK == "present" or
            biomarkers.ROS1 == "present" or
            biomarkers.BRAF == "present" or
            (biomarkers.KRAS.status == "present" and biomarkers.KRAS.mutation == "G12C") or
            biomarkers.MET.status == "present"
        )
        
        if has_driver:
            return "Trial requires no targetable driver mutations (patient has actionable alteration)"
        return None
    
    # ============================================================
    # 10. MUTUAL EXCLUSIVITY RULES
    # ============================================================
    # If trial is for a specific biomarker but patient has a DIFFERENT driver mutation,
    # this is often (but not always) an exclusion
    
    # ALK trial but patient has EGFR
    if "alk" in trial_title_lower and biomarkers.EGFR.status == "present":
        return "ALK trial typically excludes patients with EGFR mutations"
    
    # EGFR trial but patient has ALK
    if "egfr" in trial_title_lower and biomarkers.ALK == "present":
        return "EGFR trial typically excludes patients with ALK rearrangements"
    
    # KRAS G12C trial but patient has EGFR or ALK (less common but possible)
    if "kras g12c" in trial_title_lower:
        if biomarkers.EGFR.status == "present" or biomarkers.ALK == "present":
            return "KRAS G12C trial typically excludes EGFR/ALK-positive patients"
    
    return None
```

### Step 2: Add NSCLC-Specific Scoring in `app/matching/scorer.py`

Add this helper function for NSCLC biomarker matching:

```python
def check_lung_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """
    Check if patient's lung biomarkers match trial requirements.
    
    Returns True if the key biomarker matches (high confidence).
    """
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return False
    
    trial_title_lower = trial.title.lower()
    
    # Count confirmed biomarker matches
    matches = 0
    
    # Check each potential biomarker match
    if "egfr" in trial_title_lower:
        if biomarkers.EGFR.status == "present":
            matches += 1
            # Bonus if specific mutation matches
            if biomarkers.EGFR.mutation and (
                ("exon 19" in trial_title_lower and "Exon 19" in biomarkers.EGFR.mutation) or
                ("l858r" in trial_title_lower and "L858R" in biomarkers.EGFR.mutation)
            ):
                matches += 1
    
    if "alk" in trial_title_lower and biomarkers.ALK == "present":
        matches += 1
    
    if "kras" in trial_title_lower and biomarkers.KRAS.status == "present":
        matches += 1
        if "g12c" in trial_title_lower and biomarkers.KRAS.mutation == "G12C":
            matches += 1
    
    if "ros1" in trial_title_lower and biomarkers.ROS1 == "present":
        matches += 1
    
    if "met" in trial_title_lower and biomarkers.MET.status == "present":
        matches += 1
    
    if "braf" in trial_title_lower and biomarkers.BRAF == "present":
        matches += 1
    
    if "pd-l1" in trial_title_lower or "pdl1" in trial_title_lower:
        if biomarkers.PDL1.status == "present":
            matches += 1
            # Extra credit if percentage is known and high
            if biomarkers.PDL1.percentage and biomarkers.PDL1.percentage >= 50:
                matches += 1
    
    # Return true if at least one strong biomarker match
    return matches >= 1
```

Then update the main `check_biomarker_match` function to use it:

```python
def check_biomarker_match(patient: PatientProfile, trial: Trial) -> bool:
    """Check if patient's biomarkers match trial requirements"""
    if patient.cancer_type == "breast":
        return check_breast_biomarker_match(patient, trial)
    elif patient.cancer_type == "lung":
        return check_lung_biomarker_match(patient, trial)  # NOW PROPERLY IMPLEMENTED
    return False
```

### Step 3: Enhance `app/matching/reason_generator.py`

Add NSCLC-specific reason generation:

```python
def generate_lung_why_matched(patient: PatientProfile, trial: Trial) -> List[str]:
    """Generate lung cancer-specific match reasons"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return []
    
    reasons = []
    trial_title_lower = trial.title.lower()
    
    # EGFR mutation match
    if "egfr" in trial_title_lower and biomarkers.EGFR.status == "present":
        mutation_detail = f" ({biomarkers.EGFR.mutation})" if biomarkers.EGFR.mutation else ""
        reasons.append(f"EGFR-mutant status{mutation_detail} matches trial requirement")
    
    # ALK rearrangement match
    if "alk" in trial_title_lower and biomarkers.ALK == "present":
        reasons.append("ALK-positive status matches trial requirement")
    
    # KRAS mutation match
    if "kras" in trial_title_lower and biomarkers.KRAS.status == "present":
        if "g12c" in trial_title_lower and biomarkers.KRAS.mutation == "G12C":
            reasons.append("KRAS G12C mutation matches trial requirement")
        else:
            mutation_detail = f" ({biomarkers.KRAS.mutation})" if biomarkers.KRAS.mutation else ""
            reasons.append(f"KRAS-mutant status{mutation_detail} matches trial requirement")
    
    # ROS1 rearrangement match
    if "ros1" in trial_title_lower and biomarkers.ROS1 == "present":
        reasons.append("ROS1-positive status matches trial requirement")
    
    # MET alteration match
    if "met" in trial_title_lower and biomarkers.MET.status == "present":
        alteration = biomarkers.MET.alteration or "MET alteration"
        reasons.append(f"{alteration} matches trial requirement")
    
    # BRAF mutation match
    if "braf" in trial_title_lower and biomarkers.BRAF == "present":
        reasons.append("BRAF V600E mutation matches trial requirement")
    
    # PD-L1 expression match
    if ("pd-l1" in trial_title_lower or "pdl1" in trial_title_lower) and biomarkers.PDL1.status == "present":
        if biomarkers.PDL1.percentage:
            reasons.append(f"PD-L1 expression ({biomarkers.PDL1.percentage}% TPS) matches trial criteria")
        else:
            reasons.append("PD-L1 positive status matches trial criteria")
    
    # Prior therapy alignment
    if "osimertinib" in trial_title_lower.lower():
        # Check if patient has prior osimertinib
        prior_osi = any("osimertinib" in t.name.lower() for t in patient.prior_treatments if t.name)
        if prior_osi:
            reasons.append("Prior osimertinib therapy aligns with inclusion criteria")
    
    # Stage match
    if patient.stage == "IV":
        reasons.append("Stage IV disease matches trial population")
    
    # ECOG match (if known)
    if patient.ecog in ["0", "1"]:
        reasons.append(f"ECOG {patient.ecog} meets performance criteria")
    
    return reasons


def generate_lung_what_to_confirm(patient: PatientProfile, trial: Trial) -> List[str]:
    """Generate lung cancer-specific confirmation items"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return []
    
    confirmations = []
    trial_title_lower = trial.title.lower()
    
    # Check for unknown biomarker statuses
    if biomarkers.EGFR.status == "unknown" and "egfr" in trial_title_lower:
        confirmations.append("Confirm EGFR mutation status with molecular testing")
    
    if biomarkers.ALK == "unknown" and "alk" in trial_title_lower:
        confirmations.append("Confirm ALK rearrangement status with FISH or IHC")
    
    if biomarkers.KRAS.status == "unknown" and "kras" in trial_title_lower:
        confirmations.append("Confirm KRAS mutation status")
    
    if biomarkers.PDL1.status == "unknown" and ("pd-l1" in trial_title_lower or "immunotherapy" in trial_title_lower):
        confirmations.append("Confirm PD-L1 expression level (TPS score)")
    
    # Check for PD-L1 percentage if status is known but percentage is not
    if biomarkers.PDL1.status == "present" and biomarkers.PDL1.percentage is None:
        if "≥50" in trial.title or "high" in trial_title_lower:
            confirmations.append("Verify PD-L1 TPS percentage (trial requires ≥50%)")
    
    # EGFR mutation subtype confirmation
    if biomarkers.EGFR.status == "present" and not biomarkers.EGFR.mutation:
        if "exon 19" in trial_title_lower or "l858r" in trial_title_lower:
            confirmations.append("Confirm specific EGFR mutation type (exon 19 deletion or L858R)")
    
    # Prior therapy confirmation
    if "post-osimertinib" in trial_title_lower or "after osimertinib" in trial_title_lower:
        confirmations.append("Verify disease progression on osimertinib")
    
    # Standard confirmations from trial data
    if trial.exclusion_risks.washout_window:
        confirmations.append(f"Verify {trial.exclusion_risks.washout_window}")
    
    if trial.exclusion_risks.lab_thresholds and "adequate" in trial.exclusion_risks.lab_thresholds.lower():
        confirmations.append(f"Check {trial.exclusion_risks.lab_thresholds.lower()}")
    
    return confirmations[:3]  # Return top 3
```

Then update the main functions to route to lung-specific logic:

```python
def generate_why_matched(patient: PatientProfile, trial: Trial) -> List[str]:
    """Generate 2-4 specific reasons why trial matched"""
    
    if patient.cancer_type == "lung":
        reasons = generate_lung_why_matched(patient, trial)
    else:
        # Use existing breast logic
        reasons = []
        for criterion in trial.eligibility_criteria:
            if criterion.met is True:
                if criterion.category == "biomarker":
                    reasons.append(f"{criterion.criterion} (required)")
                # ... existing logic
    
    # If <2 reasons, add generic ones
    if len(reasons) < 2:
        reasons.append(f"Stage {patient.stage} matches trial population")
        reasons.append(f"Cancer type ({patient.cancer_type}) matches trial focus")
    
    return reasons[:4]


def generate_what_to_confirm(patient: PatientProfile, trial: Trial) -> List[str]:
    """Generate 1-3 items patient should confirm"""
    
    if patient.cancer_type == "lung":
        confirmations = generate_lung_what_to_confirm(patient, trial)
    else:
        # Use existing breast logic
        confirmations = []
        for criterion in trial.eligibility_criteria:
            if criterion.met == "unknown":
                confirmations.append(f"Confirm {criterion.criterion.lower()}")
        # ... existing logic
    
    return confirmations[:3]
```

### Step 4: Add Test Cases for NSCLC Matching

Add to `tests/test_matcher.py`:

```python
def test_match_egfr_positive_nsclc():
    """Test matching for EGFR-mutant NSCLC patient"""
    patient = PatientProfile(
        age=65,
        sex="female",
        cancer_type="lung",
        stage="IV",
        ecog="1",
        biomarkers=LungBiomarkers(
            EGFR=EGFRMutation(status="present", mutation="Exon 19 deletion"),
            ALK="absent",
            ROS1="absent",
            KRAS=KRASMutation(status="absent"),
            MET=METAlteration(status="absent"),
            BRAF="absent",
            PDL1=PDL1Expression(status="unknown")
        ),
        prior_treatments=[
            PriorTreatment(category="targeted_therapy", name="Osimertinib")
        ],
        line_of_therapy="post_targeted"
    )
    
    result = match_trials(patient)
    
    # Should match EGFR trials
    egfr_matches = [m for m in result.matches if "EGFR" in m.trial.title]
    assert len(egfr_matches) > 0
    
    # Should NOT match ALK trials
    alk_matches = [m for m in result.matches if "ALK" in m.trial.title and "positive" in m.trial.title.lower()]
    assert len(alk_matches) == 0
    
    # Should have high scores for EGFR trials
    if egfr_matches:
        assert egfr_matches[0].score >= 90


def test_exclude_alk_patient_from_egfr_trial():
    """Test mutual exclusivity: ALK+ patient excluded from EGFR trials"""
    patient = PatientProfile(
        age=55,
        sex="male",
        cancer_type="lung",
        stage="IV",
        ecog="1",
        biomarkers=LungBiomarkers(
            EGFR=EGFRMutation(status="absent"),
            ALK="present",  # ALK-positive
            ROS1="absent",
            KRAS=KRASMutation(status="absent"),
            MET=METAlteration(status="absent"),
            BRAF="absent",
            PDL1=PDL1Expression(status="unknown")
        ),
        prior_treatments=[],
        line_of_therapy="first"
    )
    
    result = match_trials(patient)
    
    # ALK+ patient should NOT match EGFR trials
    egfr_matches = [m for m in result.matches if "EGFR" in m.trial.title and "mutation" in m.trial.title.lower()]
    assert len(egfr_matches) == 0


def test_kras_g12c_specific_matching():
    """Test KRAS G12C-specific trial matching"""
    patient = PatientProfile(
        age=62,
        sex="male",
        cancer_type="lung",
        stage="IV",
        ecog="1",
        biomarkers=LungBiomarkers(
            EGFR=EGFRMutation(status="absent"),
            ALK="absent",
            ROS1="absent",
            KRAS=KRASMutation(status="present", mutation="G12C"),
            MET=METAlteration(status="absent"),
            BRAF="absent",
            PDL1=PDL1Expression(status="present", percentage=20)
        ),
        prior_treatments=[
            PriorTreatment(category="chemotherapy", name="Carboplatin + Pemetrexed")
        ],
        line_of_therapy="post_targeted"
    )
    
    result = match_trials(patient)
    
    # Should match KRAS G12C trials
    kras_matches = [m for m in result.matches if "KRAS G12C" in m.trial.title]
    assert len(kras_matches) > 0
    
    # Should have "KRAS G12C mutation matches" in reasons
    if kras_matches:
        assert any("KRAS G12C" in reason for reason in kras_matches[0].why_matched)


def test_pdl1_threshold_exclusion():
    """Test PD-L1 threshold exclusion (requires ≥50%, patient has <50%)"""
    patient = PatientProfile(
        age=58,
        sex="female",
        cancer_type="lung",
        stage="IV",
        ecog="0",
        biomarkers=LungBiomarkers(
            EGFR=EGFRMutation(status="absent"),
            ALK="absent",
            ROS1="absent",
            KRAS=KRASMutation(status="absent"),
            MET=METAlteration(status="absent"),
            BRAF="absent",
            PDL1=PDL1Expression(status="present", percentage=20)  # <50%
        ),
        prior_treatments=[],
        line_of_therapy="first"
    )
    
    result = match_trials(patient)
    
    # Should exclude from high PD-L1 trials (≥50%)
    high_pdl1_matches = [m for m in result.matches 
                         if "PD-L1" in m.trial.title and ("≥50" in m.trial.title or "high" in m.trial.title.lower())]
    assert len(high_pdl1_matches) == 0
```

### Step 5: Verification

After implementing, verify:

1. **Test EGFR patient matching:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/match \
     -H "Content-Type: application/json" \
     -d '{
       "age": 65,
       "sex": "female",
       "cancer_type": "lung",
       "stage": "IV",
       "ecog": "1",
       "biomarkers": {
         "EGFR": {"status": "present", "mutation": "Exon 19 deletion"},
         "ALK": "absent",
         "ROS1": "absent",
         "KRAS": {"status": "absent"},
         "MET": {"status": "absent"},
         "BRAF": "absent",
         "PDL1": {"status": "unknown"}
       },
       "prior_treatments": [{"category": "targeted_therapy", "name": "Osimertinib"}],
       "line_of_therapy": "post_targeted"
     }'
   ```
   
   **Expected:** Should match EGFR trials, exclude ALK/KRAS trials

2. **Test ALK patient:**
   ```bash
   # Change biomarkers to: "ALK": "present", "EGFR": {"status": "absent"}
   ```
   
   **Expected:** Should match ALK trials, exclude EGFR trials

3. **Test KRAS G12C patient:**
   ```bash
   # Set: "KRAS": {"status": "present", "mutation": "G12C"}
   ```
   
   **Expected:** Should match KRAS G12C trial

4. **Run tests:**
   ```bash
   pytest tests/test_matcher.py -v -k "nsclc or egfr or alk or kras"
   ```

---

## Key NSCLC Matching Principles

### 1. Mutual Exclusivity
NSCLC driver mutations are typically **mutually exclusive**:
- EGFR+ → excludes from ALK, ROS1, KRAS trials
- ALK+ → excludes from EGFR, ROS1 trials
- KRAS+ → excludes from EGFR, ALK trials

### 2. Biomarker Specificity
Unlike breast cancer (where ER+/HER2- patients can have variations), NSCLC trials are highly specific:
- "EGFR exon 19 deletion or L858R" = only those two subtypes
- "KRAS G12C" = only G12C, not G12D or G12V
- "ALK-positive" = ALK rearrangement detected by FISH/NGS

### 3. PD-L1 Thresholds
Immunotherapy trials have strict PD-L1 cutoffs:
- ≥50% (high) → first-line monotherapy
- ≥1% (any) → combination therapy
- <1% (negative) → often excluded from single-agent immunotherapy

### 4. Prior Therapy Context
Many NSCLC trials specify prior therapy:
- "Post-osimertinib" → requires prior osimertinib exposure
- "First-line" → no prior systemic therapy for metastatic disease
- "TKI-naive" → no prior tyrosine kinase inhibitor

---

## Expected Outcomes

After implementing this NSCLC matching logic:

✅ **EGFR+ patients** match EGFR trials, excluded from ALK/KRAS  
✅ **ALK+ patients** match ALK trials, excluded from EGFR  
✅ **KRAS G12C patients** match KRAS G12C trials specifically  
✅ **PD-L1 high patients** match immunotherapy trials  
✅ **"No driver" patients** match non-targeted therapy trials  
✅ **Mutual exclusivity** properly enforced  
✅ **Why matched** reasons specific to biomarker  
✅ **What to confirm** prompts for unknown biomarkers  

---

## Summary

This adds:
- ✅ 150+ lines of NSCLC exclusion logic (`rules.py`)
- ✅ 80+ lines of NSCLC scoring logic (`scorer.py`)
- ✅ 120+ lines of NSCLC reason generation (`reason_generator.py`)
- ✅ 100+ lines of NSCLC test cases (`test_matcher.py`)
- ✅ **Total: ~450 lines of comprehensive NSCLC matching**

**START IMPLEMENTATION**

Please add these enhancements to the matching engine to achieve parity between breast and lung cancer matching logic.
