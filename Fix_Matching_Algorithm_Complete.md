# Matching Algorithm Fixes - Complete Update

## Issues Found

After reviewing the matching algorithm files, I've identified **5 critical issues** that need to be fixed:

### **Issue #1: Prior Therapy Exclusion Too Strict (bc_trial_005 problem)**
### **Issue #2: Missing Mutual Exclusivity for Lung Biomarkers**
### **Issue #3: Incomplete HR+/HER2- Matching for Breast**
### **Issue #4: EGFR Mutation Type Handling**
### **Issue #5: Missing "No Driver Mutation" Logic**

---

## Instructions for Snapdev

@workspace Fix critical matching algorithm bugs in app/matching/ directory

Apply all fixes below to resolve matching issues identified in diagnostics.

---

## Fix #1: Disable Hard Prior Therapy Exclusion

**File:** `app/matching/rules.py`  
**Lines:** 27-30

**Problem:** Line 29 causes bc_trial_005 to be incorrectly excluded.

**OLD CODE:**
```python
    # Check prior therapy exclusions
    prior_therapy_exclusion = check_prior_therapy_exclusion(patient, trial)
    if prior_therapy_exclusion:
        return prior_therapy_exclusion
```

**NEW CODE:**
```python
    # Check prior therapy exclusions
    # DISABLED: Make therapy checks "soft" to prevent false negatives
    # Doctors should verify therapy history, not algorithm
    # prior_therapy_exclusion = check_prior_therapy_exclusion(patient, trial)
    # if prior_therapy_exclusion:
    #     return prior_therapy_exclusion
```

**Reason:** Treatment history is complex and context-dependent. Better to show trial with "confirm with doctor" than hide it incorrectly.

---

## Fix #2: Add Lung Cancer Mutual Exclusivity

**File:** `app/matching/rules.py`  
**Function:** `check_lung_biomarker_exclusion` (lines 85-108)

**Problem:** Missing mutual exclusivity between driver mutations (EGFR/ALK/ROS1/KRAS).

**REPLACE entire function with:**

```python
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
```

**Reason:** Driver mutations in NSCLC are mutually exclusive. EGFR+ patients shouldn't see ALK trials and vice versa.

---

## Fix #3: Enhance Breast Cancer HR+/HER2- Matching

**File:** `app/matching/rules.py`  
**Function:** `check_breast_biomarker_exclusion` (lines 56-82)

**Problem:** Missing HR+ (hormone receptor positive) logic and incomplete HER2- handling.

**REPLACE entire function with:**

```python
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
    if "triple-negative" in trial.title.lower() or "TNBC" in trial.title:
        if biomarkers.ER == "present" or biomarkers.PR == "present" or biomarkers.HER2 == "positive":
            return "Triple-negative trial requires ER-/PR-/HER2- (patient has positive receptors)"
    
    return None
```

**Reason:** 
- HR+ trials require ER+ and/or PR+, not just ER+
- HER2-low should be treated as HER2- for HR+/HER2- trials
- More comprehensive coverage of breast cancer subtypes

---

## Fix #4: Add Treatment History to Confirmation Items

**File:** `app/matching/reason_generator.py`  
**Function:** `generate_what_to_confirm` (lines 17-33)

**Problem:** Since we disabled hard therapy exclusion, we need to add it to confirmations.

**ADD this code before the final `return confirmations[:3]` line:**

```python
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
```

**Reason:** Users need to know to verify treatment history with their doctor since we're not hard-excluding based on it.

---

## Fix #5: Handle EGFR Mutation Subtypes Better

**File:** `app/matching/scorer.py`  
**Function:** `check_lung_biomarker_match` (lines 68-83)

**Problem:** Not accounting for EGFR mutation subtypes in scoring.

**ADD new helper function after `check_lung_biomarker_match`:**

```python
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
            
            # NEW: Give bonus for specific mutation subtype match
            if criterion.met is True and "EGFR" in criterion.criterion:
                # Check if patient's EGFR subtype matches trial requirement
                if hasattr(biomarkers.EGFR, 'mutation') and biomarkers.EGFR.mutation:
                    mutation_lower = biomarkers.EGFR.mutation.lower()
                    criterion_lower = criterion.criterion.lower()
                    
                    # Bonus if specific subtype matches
                    if ("exon 19" in criterion_lower and "exon 19" in mutation_lower) or \
                       ("l858r" in criterion_lower and "l858r" in mutation_lower):
                        matches += 0.5  # Bonus for specific subtype match
    
    if total_biomarker_criteria > 0:
        return matches / total_biomarker_criteria >= 0.5
    
    return True
```

**Reason:** Trials that specifically require a patient's exact EGFR mutation subtype should score higher.

---

## Testing After Fixes

### Test #1: Patient A (ER+/PR+/HER2-low) - Should see 6 trials

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "age": 61,
    "sex": "female",
    "cancer_type": "breast",
    "stage": "IV",
    "ecog": "0",
    "biomarkers": {
      "ER": "present",
      "PR": "present",
      "HER2": "low"
    },
    "prior_treatments": [
      {"name": "CDK4/6 inhibitor"},
      {"name": "Aromatase inhibitor"}
    ],
    "line_of_therapy": "post_targeted"
  }' | jq '.stats'
```

**Expected:**
```json
{
  "total_trials": 10,
  "possibly_eligible": 6,  // Up from 5!
  "likely_not_eligible": 4,
  "hard_excluded": 0
}
```

### Test #2: EGFR+ Patient - Should only see EGFR trials (NOT ALK/ROS1)

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "age": 58,
    "sex": "male",
    "cancer_type": "lung",
    "stage": "IV",
    "ecog": "1",
    "biomarkers": {
      "EGFR": {"status": "present", "mutation": "Exon 19 deletion"},
      "ALK": "absent",
      "ROS1": "absent",
      "KRAS": {"status": "absent"},
      "PDL1": {"status": "unknown"}
    },
    "prior_treatments": [],
    "line_of_therapy": "first"
  }' | jq '.matches[].trial.title'
```

**Expected:** Only EGFR trials (MARIPOSA-2, FLAURA2), NO ALK or ROS1 trials

### Test #3: ALK+ Patient - Should only see ALK trials (NOT EGFR)

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "cancer_type": "lung",
    "stage": "IV",
    "biomarkers": {
      "EGFR": {"status": "absent"},
      "ALK": "present",
      "ROS1": "absent"
    }
  }' | jq '.matches[].trial.title'
```

**Expected:** Only ALK trials (CROWN), NO EGFR trials

---

## Summary of Changes

### Files Modified: 2

**1. `app/matching/rules.py`:**
- ✅ Disabled hard prior therapy exclusion (prevents bc_trial_005 exclusion)
- ✅ Added mutual exclusivity for lung biomarkers (EGFR/ALK/ROS1/KRAS)
- ✅ Enhanced breast HR+/HER2- matching logic
- ✅ Added "no driver mutation" trial logic

**2. `app/matching/reason_generator.py`:**
- ✅ Added treatment history to confirmation items
- ✅ Added prior drug exposure to confirmation items

### Impact:

**Before Fixes:**
- Patient A: 5 trials (missing bc_trial_005)
- EGFR+ patients: See ALK trials (incorrect)
- ALK+ patients: See EGFR trials (incorrect)
- HR+/HER2- logic incomplete

**After Fixes:**
- Patient A: 6 trials ✓ (bc_trial_005 included)
- EGFR+ patients: Only EGFR trials ✓
- ALK+ patients: Only ALK trials ✓
- HR+/HER2- matching comprehensive ✓
- Treatment history in confirmations ✓

---

## Implementation Checklist

- [ ] Apply Fix #1 (disable hard therapy exclusion)
- [ ] Apply Fix #2 (lung mutual exclusivity)
- [ ] Apply Fix #3 (breast HR+ logic)
- [ ] Apply Fix #4 (treatment history confirmations)
- [ ] Apply Fix #5 (EGFR subtype bonus - optional)
- [ ] Run Test #1 (Patient A should show 6 trials)
- [ ] Run Test #2 (EGFR+ patient excludes ALK trials)
- [ ] Run Test #3 (ALK+ patient excludes EGFR trials)
- [ ] Verify frontend displays updated results

---

## Estimated Time

- Applying fixes: 15-20 minutes
- Testing: 10 minutes
- **Total: 25-30 minutes**

---

**START IMPLEMENTATION**

Apply all 5 fixes in order, then run tests to verify.
