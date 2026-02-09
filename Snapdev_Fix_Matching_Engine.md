# Snapdev Prompt: Fix Matching Engine Critical Issues

## Context
The matching engine has several critical bugs causing patients to see too few trials:
- NSCLC patients only see 2-3 trials instead of appropriate matches
- Breast cancer patients only see 3 trials instead of 5-7+
- Biomarker exclusion logic has multiple flaws

## Objective
Fix the matching engine to properly exclude/include trials based on biomarker status, with special attention to:
1. EGFR-negative patients being excluded from EGFR+ trials
2. EGFR subtype handling (exon 19 OR L858R, not exclusive)
3. ER/PR status exclusions for breast cancer trials
4. Handling mixed biomarker data structures (string vs object)

---

## Instructions for Snapdev

@workspace Fix the critical bugs in the matching engine at `app/matching_engine.py`

### Critical Issues to Fix:

**Issue #1:** EGFR+ trials are not excluding EGFR-negative patients  
**Issue #2:** EGFR subtype logic treats "exon 19 OR L858R" as mutually exclusive  
**Issue #3:** Missing ER/PR exclusion logic for breast cancer  
**Issue #4:** Biomarker data structure handling is inconsistent  

### Step 1: Add Helper Method for Safe Biomarker Access

Add this new helper method to the `MatchingEngine` class (around line 444, after `_extract_biomarker_name`):

```python
def _get_biomarker_status(self, patient: PatientProfile, biomarker_name: str) -> str:
    """
    Safely extract biomarker status from mixed data structures
    
    Handles three formats:
    1. String: "present", "absent", "unknown"
    2. Dict: {"status": "present", "mutation": "..."}
    3. Object: biomarker.status attribute
    
    Returns: "present", "absent", or "unknown"
    """
    biomarker = patient.biomarkers.get(biomarker_name)
    
    if biomarker is None:
        return "unknown"
    
    # Handle string format: "present", "absent", "unknown"
    if isinstance(biomarker, str):
        return biomarker
    
    # Handle dict format: {"status": "present", "mutation": "..."}
    if isinstance(biomarker, dict):
        return biomarker.get("status", "unknown")
    
    # Handle object with .status attribute
    if hasattr(biomarker, "status"):
        return biomarker.status
    
    return "unknown"

def _get_biomarker_mutation(self, patient: PatientProfile, biomarker_name: str) -> str:
    """
    Safely extract biomarker mutation/subtype details
    
    Returns: mutation string or empty string
    """
    biomarker = patient.biomarkers.get(biomarker_name)
    
    if biomarker is None:
        return ""
    
    # Handle dict format
    if isinstance(biomarker, dict):
        return biomarker.get("mutation", "") or biomarker.get("subtype", "")
    
    # Handle object with attributes
    if hasattr(biomarker, "mutation"):
        return biomarker.mutation or ""
    if hasattr(biomarker, "subtype"):
        return biomarker.subtype or ""
    
    return ""
```

### Step 2: Replace the Entire `_check_biomarker_exclusions` Method

Replace the existing `_check_biomarker_exclusions` method (lines 123-172) with this fixed version:

```python
def _check_biomarker_exclusions(
    self, 
    patient: PatientProfile, 
    trial: TrialFullDetail
) -> bool:
    """
    Check biomarker-based exclusions
    
    Returns True if patient should be excluded from trial
    """
    
    for criterion in trial.eligibility_criteria:
        if criterion.category != "biomarker" or not criterion.required:
            continue
        
        criterion_lower = criterion.criterion.lower()
        
        # ================================================================
        # BREAST CANCER BIOMARKER EXCLUSIONS
        # ================================================================
        if patient.cancer_type == "breast":
            
            # HER2-POSITIVE trials exclude HER2-negative or HER2-low patients
            if "her2 positive" in criterion_lower or "her2+" in criterion_lower or \
               ("her2" in criterion_lower and "positive" in criterion_lower and "low" not in criterion_lower):
                her2_status = self._get_biomarker_status(patient, "HER2")
                if her2_status in ["absent", "low"]:
                    return True
            
            # HER2-LOW trials exclude HER2-negative or HER2-positive patients
            if "her2-low" in criterion_lower or "her2 low" in criterion_lower:
                her2_status = self._get_biomarker_status(patient, "HER2")
                if her2_status in ["absent", "positive"]:
                    return True
            
            # HER2-NEGATIVE trials exclude HER2-positive patients
            if ("her2-negative" in criterion_lower or "her2 negative" in criterion_lower or 
                "her2-" in criterion_lower) and "low" not in criterion_lower:
                her2_status = self._get_biomarker_status(patient, "HER2")
                if her2_status == "positive":
                    return True
            
            # ER-POSITIVE trials exclude ER-negative patients
            if "er+" in criterion_lower or "er positive" in criterion_lower or \
               ("estrogen receptor positive" in criterion_lower):
                er_status = self._get_biomarker_status(patient, "ER")
                if er_status == "absent":
                    return True
            
            # ER-NEGATIVE trials exclude ER-positive patients
            if "er-" in criterion_lower or "er negative" in criterion_lower or \
               ("estrogen receptor negative" in criterion_lower):
                er_status = self._get_biomarker_status(patient, "ER")
                if er_status == "present":
                    return True
            
            # TRIPLE-NEGATIVE trials exclude ER+ or PR+ or HER2+ patients
            if "triple-negative" in criterion_lower or "triple negative" in criterion_lower or \
               "tnbc" in criterion_lower:
                er_status = self._get_biomarker_status(patient, "ER")
                pr_status = self._get_biomarker_status(patient, "PR")
                her2_status = self._get_biomarker_status(patient, "HER2")
                
                # If any receptor is positive, exclude from TNBC trial
                if er_status == "present" or pr_status == "present" or her2_status == "positive":
                    return True
            
            # HR-POSITIVE (ER+ and/or PR+) trials exclude both ER- and PR- patients
            if ("hr+" in criterion_lower or "hormone receptor positive" in criterion_lower or
                "hr positive" in criterion_lower):
                er_status = self._get_biomarker_status(patient, "ER")
                pr_status = self._get_biomarker_status(patient, "PR")
                
                # Exclude if BOTH ER and PR are negative
                if er_status == "absent" and pr_status == "absent":
                    return True
        
        # ================================================================
        # LUNG CANCER (NSCLC) BIOMARKER EXCLUSIONS
        # ================================================================
        if patient.cancer_type == "lung":
            
            # EGFR-MUTANT trials
            if "egfr" in criterion_lower and ("mutation" in criterion_lower or "mutant" in criterion_lower):
                egfr_status = self._get_biomarker_status(patient, "EGFR")
                
                # CRITICAL FIX: Exclude EGFR-negative patients from EGFR+ trials
                if egfr_status != "present":
                    return True
                
                # Check for mutual exclusivity with other driver mutations
                alk_status = self._get_biomarker_status(patient, "ALK")
                ros1_status = self._get_biomarker_status(patient, "ROS1")
                
                # Exclude if patient has ALK or ROS1 (mutually exclusive drivers)
                if alk_status == "present" or ros1_status == "present":
                    return True
                
                # CRITICAL FIX: Handle EGFR subtype requirements properly
                # Most trials accept "exon 19 deletion OR L858R" - NOT mutually exclusive!
                egfr_mutation = self._get_biomarker_mutation(patient, "EGFR").lower()
                
                # Only exclude if trial EXPLICITLY requires ONE specific subtype
                if "exon 19 only" in criterion_lower or "exon 19 deletion only" in criterion_lower:
                    # Trial only wants exon 19, exclude L858R patients
                    if "l858r" in egfr_mutation:
                        return True
                
                if "l858r only" in criterion_lower:
                    # Trial only wants L858R, exclude exon 19 patients
                    if "exon 19" in egfr_mutation:
                        return True
                
                # If trial says "exon 19 deletion or L858R", both are acceptable
                # Do NOT exclude based on subtype
            
            # ALK-POSITIVE trials
            if ("alk" in criterion_lower and "positive" in criterion_lower) or \
               ("alk" in criterion_lower and "rearrangement" in criterion_lower):
                alk_status = self._get_biomarker_status(patient, "ALK")
                
                # Exclude ALK-negative patients
                if alk_status != "present":
                    return True
                
                # Exclude if patient has EGFR (mutually exclusive)
                egfr_status = self._get_biomarker_status(patient, "EGFR")
                if egfr_status == "present":
                    return True
            
            # ROS1-POSITIVE trials
            if ("ros1" in criterion_lower and "positive" in criterion_lower) or \
               ("ros1" in criterion_lower and "rearrangement" in criterion_lower):
                ros1_status = self._get_biomarker_status(patient, "ROS1")
                
                # Exclude ROS1-negative patients
                if ros1_status != "present":
                    return True
                
                # Exclude if patient has EGFR or ALK (mutually exclusive)
                egfr_status = self._get_biomarker_status(patient, "EGFR")
                alk_status = self._get_biomarker_status(patient, "ALK")
                if egfr_status == "present" or alk_status == "present":
                    return True
            
            # KRAS G12C trials
            if "kras" in criterion_lower and "g12c" in criterion_lower:
                kras_status = self._get_biomarker_status(patient, "KRAS")
                kras_mutation = self._get_biomarker_mutation(patient, "KRAS").lower()
                
                # Exclude if KRAS-negative
                if kras_status != "present":
                    return True
                
                # Exclude if KRAS-positive but NOT G12C
                if kras_status == "present" and kras_mutation and "g12c" not in kras_mutation:
                    return True
                
                # Exclude if patient has EGFR or ALK (mutually exclusive)
                egfr_status = self._get_biomarker_status(patient, "EGFR")
                alk_status = self._get_biomarker_status(patient, "ALK")
                if egfr_status == "present" or alk_status == "present":
                    return True
            
            # MET exon 14 skipping trials
            if "met" in criterion_lower and ("exon 14" in criterion_lower or "skipping" in criterion_lower):
                met_status = self._get_biomarker_status(patient, "MET")
                
                # Exclude if MET-negative
                if met_status != "present":
                    return True
            
            # BRAF V600E trials
            if "braf" in criterion_lower and ("v600" in criterion_lower or "v600e" in criterion_lower):
                braf_status = self._get_biomarker_status(patient, "BRAF")
                
                # Exclude if BRAF-negative
                if braf_status != "present":
                    return True
            
            # PD-L1 HIGH trials (≥50%)
            if "pd-l1" in criterion_lower or "pdl1" in criterion_lower:
                # Check for specific threshold requirements
                if "≥50" in criterion.criterion or ">=50" in criterion.criterion or \
                   "≥ 50" in criterion.criterion or ">= 50" in criterion.criterion:
                    
                    pdl1_data = patient.biomarkers.get("PDL1") or patient.biomarkers.get("PD-L1")
                    
                    if pdl1_data:
                        # Extract percentage
                        pdl1_percentage = None
                        if isinstance(pdl1_data, dict):
                            pdl1_percentage = pdl1_data.get("percentage")
                        elif hasattr(pdl1_data, "percentage"):
                            pdl1_percentage = pdl1_data.percentage
                        
                        # Exclude if below threshold
                        if pdl1_percentage is not None and pdl1_percentage < 50:
                            return True
            
            # NO DRIVER MUTATION trials (exclude patients WITH actionable alterations)
            if "no driver" in criterion_lower or "driver negative" in criterion_lower or \
               "no actionable" in criterion_lower:
                
                # Check if patient has any actionable driver mutation
                egfr_status = self._get_biomarker_status(patient, "EGFR")
                alk_status = self._get_biomarker_status(patient, "ALK")
                ros1_status = self._get_biomarker_status(patient, "ROS1")
                braf_status = self._get_biomarker_status(patient, "BRAF")
                
                kras_status = self._get_biomarker_status(patient, "KRAS")
                kras_mutation = self._get_biomarker_mutation(patient, "KRAS").lower()
                has_kras_g12c = kras_status == "present" and "g12c" in kras_mutation
                
                met_status = self._get_biomarker_status(patient, "MET")
                
                # Exclude if patient has ANY actionable driver
                if (egfr_status == "present" or 
                    alk_status == "present" or 
                    ros1_status == "present" or 
                    braf_status == "present" or
                    has_kras_g12c or
                    met_status == "present"):
                    return True
    
    return False
```

### Step 3: Update All Biomarker Status Checks Throughout the File

**Find and replace these patterns:**

**OLD Pattern 1:**
```python
her2_status = patient.biomarkers.get("HER2")
if her2_status and her2_status.status in ["absent", "low"]:
```

**NEW Pattern 1:**
```python
her2_status = self._get_biomarker_status(patient, "HER2")
if her2_status in ["absent", "low"]:
```

**OLD Pattern 2:**
```python
alk_status = patient.biomarkers.get("ALK")
if (alk_status and alk_status.status == "present"):
```

**NEW Pattern 2:**
```python
alk_status = self._get_biomarker_status(patient, "ALK")
if alk_status == "present":
```

**Apply this pattern to ALL biomarker checks in:**
- `_generate_why_matched` method (lines 269-307)
- `_has_critical_unknown_biomarker` method (lines 412-424)
- Any other methods that access `patient.biomarkers`

### Step 4: Test the Fixed Matching Engine

After making the changes, test with these patient profiles:

**Test 1: EGFR+ NSCLC Patient**
```python
patient = {
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
        "MET": {"status": "absent"},
        "BRAF": "absent",
        "PDL1": {"status": "unknown"}
    },
    "prior_therapies": [],
    "line_of_therapy": "first"
}
```

**Expected Result:** 2 EGFR trials (lung_trial_001, lung_trial_002)

**Test 2: ER+/HER2-low Breast Cancer Patient**
```python
patient = {
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
    "prior_therapies": ["CDK4/6 inhibitor", "Aromatase inhibitor"],
    "line_of_therapy": "post_targeted"
}
```

**Expected Result:** 5-7 breast cancer trials (bc_trial_001, bc_trial_002, bc_trial_004, bc_trial_005, bc_trial_009, etc.)

### Step 5: Verify API Response

After fixing, test the matching endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d @test_patient.json | jq '.stats'
```

**Expected stats for EGFR+ patient:**
```json
{
  "total_trials": 10,
  "possibly_eligible": 2,
  "likely_not_eligible": 8,
  "hard_excluded": 0
}
```

**Expected stats for ER+/HER2-low breast patient:**
```json
{
  "total_trials": 10,
  "possibly_eligible": 5-7,
  "likely_not_eligible": 3-5,
  "hard_excluded": 0
}
```

---

## Summary of Changes

### **What's Being Fixed:**

1. ✅ **Added safe biomarker access helpers** - Handle string, dict, and object formats
2. ✅ **Fixed EGFR-negative exclusion** - EGFR+ trials now properly exclude EGFR- patients
3. ✅ **Fixed EGFR subtype logic** - "exon 19 OR L858R" no longer mutually exclusive
4. ✅ **Added ER/PR exclusions** - Breast trials now properly filter by hormone receptor status
5. ✅ **Added triple-negative logic** - TNBC trials exclude ER+, PR+, or HER2+ patients
6. ✅ **Added HR+ logic** - HR+ trials require ER+ and/or PR+
7. ✅ **Fixed all driver mutation mutual exclusivity** - EGFR/ALK/ROS1/KRAS properly exclude each other
8. ✅ **Added PD-L1 threshold checking** - Trials requiring ≥50% properly exclude lower values
9. ✅ **Added "no driver mutation" logic** - Properly excludes patients with actionable alterations

### **Expected Improvements:**

**Before:**
- NSCLC EGFR+ patient: 3 trials shown (incorrect)
- Breast ER+/HER2-low patient: 3 trials shown (too few)

**After:**
- NSCLC EGFR+ patient: 2 trials shown (correct - only EGFR trials)
- Breast ER+/HER2-low patient: 5-7 trials shown (correct - all HR+/HER2- or HER2-low trials)

---

## Troubleshooting

**If tests still fail after fixes:**

1. **Check biomarker data structure in database:**
   - Query a trial: `GET /api/v1/trials/{nct_number}`
   - Verify eligibility_criteria format
   - Ensure "required" field is present and accurate

2. **Check patient biomarker format:**
   - Log `patient.biomarkers` in matching engine
   - Verify it matches expected structure

3. **Add debug logging:**
```python
def _check_biomarker_exclusions(self, patient, trial):
    print(f"\n=== Checking {trial.nct_number} ===")
    print(f"Patient biomarkers: {patient.biomarkers}")
    
    for criterion in trial.eligibility_criteria:
        if criterion.category == "biomarker":
            print(f"Criterion: {criterion.criterion}")
            print(f"Required: {criterion.required}")
    
    # ... rest of method
```

4. **Verify trial count in database:**
```bash
curl http://localhost:8000/api/v1/trials?cancer_type=breast | jq '.total'
curl http://localhost:8000/api/v1/trials?cancer_type=lung | jq '.total'
```

Should return 10 each (or more if you loaded all 20 breast trials).

---

## Final Verification Checklist

After implementing fixes:

- [ ] Code compiles without errors
- [ ] EGFR+ patient matches only EGFR trials (2 trials)
- [ ] ALK+ patient matches only ALK trials (1 trial)
- [ ] ER+/HER2-low patient matches 5-7 breast trials
- [ ] Triple-negative patient matches only TNBC trials
- [ ] No AttributeError on biomarker.status
- [ ] API response includes correct stats
- [ ] Frontend shows increased trial counts

---

**Implementation Time Estimate:** 30-45 minutes

**START IMPLEMENTATION**

Please implement these fixes to the matching engine and report back with test results.
