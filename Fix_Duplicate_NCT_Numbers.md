# Fix Duplicate NCT Numbers in mock_trials.py

## Issue Found
Two NCT numbers are duplicated in the mock trials file:

1. **NCT05789234** - Used by both bc_trial_002 AND lung_trial_008
2. **NCT05123456** - Used by both bc_trial_006 AND lung_trial_002

## Fix Required

### Change #1: lung_trial_008 (line ~826)

**FIND:**
```python
# lung_trial_008
Trial(
    id="lung_trial_008",
    nct_number="NCT05789234",  # ❌ DUPLICATE - conflicts with bc_trial_002
    title="TRIDENT-1: Repotrectinib in ROS1-Positive NSCLC",
```

**REPLACE WITH:**
```python
# lung_trial_008
Trial(
    id="lung_trial_008",
    nct_number="NCT05789235",  # ✓ FIXED - changed to unique number
    title="TRIDENT-1: Repotrectinib in ROS1-Positive NSCLC",
```

### Change #2: lung_trial_002 (line ~549)

**FIND:**
```python
# lung_trial_002
Trial(
    id="lung_trial_002",
    nct_number="NCT05123456",  # ❌ DUPLICATE - conflicts with bc_trial_006
    title="FLAURA2: Osimertinib + Chemotherapy vs Osimertinib Alone in First-Line EGFR-Mutant NSCLC",
```

**REPLACE WITH:**
```python
# lung_trial_002
Trial(
    id="lung_trial_002",
    nct_number="NCT05123457",  # ✓ FIXED - changed to unique number
    title="FLAURA2: Osimertinib + Chemotherapy vs Osimertinib Alone in First-Line EGFR-Mutant NSCLC",
```

---

## Instructions for Snapdev

@workspace Fix duplicate NCT numbers in app/data/mock_trials.py

**Task:**
Replace the two duplicate NCT numbers with unique ones:

1. Line ~826: Change `lung_trial_008` NCT number from "NCT05789234" to "NCT05789235"
2. Line ~549: Change `lung_trial_002` NCT number from "NCT05123456" to "NCT05123457"

**Verification:**
After making changes, run the validation function:
```bash
python -m app.data.mock_trials
```

**Expected output:**
```
✓ All 20 trials validated successfully
  - 10 breast cancer trials
  - 10 NSCLC trials
```

If validation fails with "Duplicate NCT numbers found", the duplicates were not fixed correctly.

---

## Summary

**Current state:**
- 20 trials total
- 18 unique NCT numbers (2 duplicates)

**After fix:**
- 20 trials total
- 20 unique NCT numbers ✓

**Changes:**
- lung_trial_008: NCT05789234 → NCT05789235
- lung_trial_002: NCT05123456 → NCT05123457

These are simple increments that maintain the NCT number pattern while ensuring uniqueness.
