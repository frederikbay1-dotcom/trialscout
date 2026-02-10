# CRITICAL BUG: Matching Logic Not Checking Trial Eligibility Criteria

## PROBLEM IDENTIFIED

Your matching logic has excellent **hard exclusion rules** (rules.py), but these rules only check **trial titles**, not the **actual eligibility criteria** stored in the trial data structure.

### Example of the Bug:

**Patient D:** EGFR+ lung cancer

**Trial:** KEYNOTE-024 (pembrolizumab for PD-L1 high)

**Eligibility criteria in trial data:**
```python
EligibilityCriterion(
    criterion="No EGFR mutations or ALK rearrangements", 
    met=True,  # ❌ BUG: This is hardcoded as True!
    category="biomarker"
)
```

**What happens:**
1. Hard exclusion rules check trial **title** - sees "KEYNOTE-024" (no "EGFR" in title)
2. Rules don't find "No EGFR" in title, so patient passes ✓
3. Trial shows as "Possibly Eligible" ❌ WRONG!
4. Clinician brief shows this trial for EGFR+ patient ❌ WRONG!

**What should happen:**
1. Check eligibility criterion: "No EGFR mutations" + patient has EGFR mutation
2. Hard exclude patient from trial
3. Don't show trial at all

---

## ROOT CAUSE

### Problem 1: Eligibility Criteria Have Hardcoded "met" Values

**File:** Mock trial data (mock_trials.py or wherever trials are defined)

```python
EligibilityCriterion(
    criterion="No EGFR mutations or ALK rearrangements", 
    met=True,  # ❌ This should be calculated dynamically!
    category="biomarker"
)
```

**These "met" values are hardcoded for a specific sample patient, not calculated for each patient!**

### Problem 2: Hard Exclusion Rules Only Check Titles

**File:** `matching/rules.py`

```python
def check_lung_biomarker_exclusion(patient, trial):
    # EGFR+ trials
    if "EGFR" in trial.title and "mutation" in trial.title.lower():
        if biomarkers.EGFR.status == "absent":
            return "EGFR-mutant trial requires EGFR mutation"
```

**This only catches trials with "EGFR" in the title!**

**Trials like KEYNOTE-024 require "No EGFR" but don't have "EGFR" in title → Slip through!**

---

## SOLUTION

You have **two options**:

### OPTION 1: Add Eligibility Criteria Checking to Rules (RECOMMENDED)

**Add a new rule that checks trial eligibility criteria for driver mutation requirements.**

### OPTION 2: Fix Mock Data + Add Eligibility Evaluator

**Remove hardcoded "met" values and calculate them dynamically for each patient.**

---

## IMPLEMENTATION: Option 1 (Quick Fix - 20 minutes)

### Step 1: Add New Hard Exclusion Rule

**File:** `matching/rules.py`

**Add after line 103 (end of check_breast_biomarker_exclusion):**

```python
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
```

### Step 2: Call This New Rule

**File:** `matching/rules.py`

**Update the `is_hard_excluded` function (around line 13):**

```python
def is_hard_excluded(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """
    Check if patient is hard-excluded from trial.
    Returns exclusion reason string if excluded, None if not excluded.
    """
    # Check stage exclusions
    stage_exclusion = check_stage_exclusion(patient, trial)
    if stage_exclusion:
        return stage_exclusion
    
    # Check biomarker exclusions (title-based)
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
    
    return None
```

---

## TESTING THE FIX

### Test 1: Patient D (EGFR+ Lung Cancer)

**Before Fix:**
```
Trials matched: 7
Includes: KEYNOTE-024 (requires no EGFR) ❌ WRONG
Includes: KEYNOTE-189 (requires no EGFR/ALK/ROS1) ❌ WRONG
```

**After Fix:**
```
Trials matched: ~3-4
Hard excluded: KEYNOTE-024 (requires no EGFR)
Hard excluded: KEYNOTE-189 (requires no EGFR/ALK/ROS1)
Only shows: MARIPOSA-2, FLAURA2, other EGFR+ trials ✓ CORRECT
```

### Test 2: Patient with ALK+ Lung Cancer

**Should exclude:**
- All EGFR trials (mutual exclusivity)
- All "no driver" trials
- All PD-L1 high trials (typically require no drivers)

**Should include:**
- ALK-specific trials (alectinib, brigatinib, etc.)

### Test 3: Triple-Negative Breast Cancer (Patient B)

**Before Fix:**
```
Might show HR+/HER2- trials if they don't have "ER-" in title
```

**After Fix:**
```
Excludes all ER+ trials
Excludes all HER2+ trials
Only shows TNBC trials
```

---

## WHY THIS BUG HAPPENED

### Root Cause: Two-Tier System Without Bridge

**Tier 1: Hard Exclusion Rules** (rules.py)
- Checks trial **titles** for biomarker requirements
- Fast, but incomplete

**Tier 2: Eligibility Criteria** (in trial data)
- Contains **actual** requirements
- But has hardcoded "met" values (not dynamic)

**Missing Bridge:**
- No code checks if patient violates criteria in Tier 2
- Hard exclusions only use Tier 1

**Result:**
- Trials that require "No EGFR" in eligibility criteria but don't have "EGFR" in title slip through

---

## IMPACT ANALYSIS

### Trials Affected (Lung Cancer):

**KEYNOTE-024** (pembrolizumab monotherapy)
- Requires: "No EGFR mutations or ALK rearrangements"
- Currently shown to: EGFR+ patients ❌
- Should show to: Driver-negative, PD-L1 high patients only ✓

**KEYNOTE-189** (pembrolizumab + chemo)
- Requires: "No EGFR, ALK, or ROS1 alterations"
- Currently shown to: EGFR+ patients ❌
- Should show to: Driver-negative NSCLC only ✓

**DESTINY-Lung02** (T-DXd for HER2 mutations)
- Requires: "HER2 mutation (not amplification)"
- Currently shown to: EGFR+ patients (if HER2 unknown) ❌
- Should show to: HER2-mutant NSCLC only ✓

**VISION** (tepotinib for MET exon 14)
- Requires: "MET exon 14 skipping mutation"
- Currently shown to: EGFR+ patients (if MET unknown) ❌
- Should show to: MET exon 14+ patients only ✓

### Trials Affected (Breast Cancer):

**Potentially some HR+/HER2- trials that don't have explicit "ER+" in title**

---

## PRIORITY: CRITICAL

**This is a clinical accuracy issue that affects:**
- ❌ Patient safety (showing inappropriate trials)
- ❌ Demo credibility (showing wrong matches)
- ❌ Regulatory compliance (incorrect matching = liability)

**Severity:** HIGH
- Wrong trials shown to patients
- Could waste patient/doctor time
- Could give false hope

**Effort to fix:** LOW (20 minutes)
**Risk:** LOW (only adds checks, doesn't change existing logic)

---

## IMPLEMENTATION STEPS

1. **Add `check_eligibility_criteria_exclusions` function** to rules.py (10 min)
2. **Call it from `is_hard_excluded`** (2 min)
3. **Test with Patient D** (5 min)
4. **Test with all 4 patients** (3 min)

**Total time: 20 minutes**

---

## ALTERNATIVE: Quick Patch (5 Minutes)

If you can't implement full solution before demo, add this quick check:

```python
# In check_lung_biomarker_exclusion, after line 103:

# Quick check for "No EGFR/ALK" in eligibility criteria
for criterion in trial.eligibility_criteria:
    if criterion.category == "biomarker":
        crit_lower = criterion.criterion.lower()
        if "no egfr" in crit_lower and biomarkers.EGFR.status == "present":
            return "Trial requires no EGFR mutations (patient is EGFR+)"
        if "no alk" in crit_lower and biomarkers.ALK == "present":
            return "Trial requires no ALK rearrangements (patient is ALK+)"
```

This catches the most common cases (KEYNOTE trials).

---

## SUCCESS CRITERIA

After implementing fix:

✅ Patient D (EGFR+) does NOT see KEYNOTE-024 or KEYNOTE-189
✅ Patient D only sees EGFR-specific trials (MARIPOSA-2, FLAURA2)
✅ Clinician brief shows 3-4 trials, not 7
✅ No trials with "No EGFR mutations" in eligibility show for EGFR+ patients
✅ Mutual exclusivity still enforced (EGFR+ doesn't see ALK trials)

---

## SNAPDEV INSTRUCTIONS

```
CRITICAL FIX: Matching logic not checking eligibility criteria

FILE: matching/rules.py
FUNCTION: Add check_eligibility_criteria_exclusions()
TIME: 20 minutes

PROBLEM: 
Trials like KEYNOTE-024 require "No EGFR mutations" in eligibility 
criteria, but don't have "EGFR" in title. Current rules only check 
titles, so EGFR+ patients see these trials incorrectly.

FIX:
Add new function that checks eligibility criteria text for biomarker 
requirements. Call from is_hard_excluded().

CODE: See complete implementation in this document (Step 1 + Step 2)

TEST:
- Patient D (EGFR+) should NOT see KEYNOTE-024 or KEYNOTE-189
- Should only see ~3-4 trials, not 7
- Clinician brief should only show EGFR-specific trials

PRIORITY: Critical for demo - affects clinical accuracy
```

---

**Your matching logic structure is excellent - this is just closing a gap between title-based rules and criteria-based requirements! 🎯**
