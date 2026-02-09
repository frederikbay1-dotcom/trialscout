# Snapdev Diagnostic Guide: Verify Trial Matching Results

## Context
Sample Patient A (ER+/PR+/HER2-low breast cancer) is showing 5 matching trials, but should show 6-7 trials. We need to verify:
1. All 10 breast trials are in the database
2. Matching engine returns all appropriate matches
3. Frontend displays status correctly

## Objective
Run systematic checks to identify why only 5 trials are showing and fix any issues found.

---

## Instructions for Snapdev

@workspace Run diagnostics on trial matching system to identify and fix issues.

### Step 1: Verify Database Contains All Trials

**Run these commands in terminal:**

```bash
# Check total trials in database
curl http://localhost:8000/api/v1/trials | jq '.total'
# Expected: 20

# Check breast cancer trials
curl http://localhost:8000/api/v1/trials?cancer_type=breast | jq '.total'
# Expected: 10

# Check lung cancer trials
curl http://localhost:8000/api/v1/trials?cancer_type=lung | jq '.total'
# Expected: 10

# List all breast trial NCT numbers
curl http://localhost:8000/api/v1/trials?cancer_type=breast | jq '.trials[].nct_number'
```

**Expected breast trial NCT numbers (10 total):**
```
NCT05234567  (bc_trial_001 - DESTINY-Breast06)
NCT05789234  (bc_trial_002 - Sacituzumab Govitecan)
NCT06926868  (bc_trial_003 - Izalontamab TNBC)
NCT05456789  (bc_trial_004 - Elacestrant)
NCT05678912  (bc_trial_005 - Datopotamab Deruxtecan)
NCT05123456  (bc_trial_006 - Pembrolizumab TNBC)
NCT05891234  (bc_trial_007 - Capivasertib)
NCT05567890  (bc_trial_008 - Tucatinib HER2+ Brain Mets)
NCT05789321  (bc_trial_009 - Rintodestrant)
NCT05901234  (bc_trial_010 - Neoadjuvant TNBC)
```

**❌ If count is less than 10:**
→ Problem: Database not fully seeded
→ Solution: Run `python -m app.data.seed_database` again

**❌ If duplicate NCT errors:**
→ Problem: Duplicate NCT numbers still exist
→ Solution: Apply the NCT number fixes from Fix_Duplicate_NCT_Numbers.md

---

### Step 2: Test Matching API Directly

**Create test file:** `test_patient_a.json`

```json
{
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
    "CDK4/6 inhibitor",
    "Aromatase inhibitor"
  ],
  "line_of_therapy": "post_targeted"
}
```

**Run matching API:**

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d @test_patient_a.json | jq '.'
```

**Check the response:**

```bash
# Get match statistics
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d @test_patient_a.json | jq '.stats'
```

**Expected output:**
```json
{
  "total_trials": 10,
  "possibly_eligible": 6-7,
  "likely_not_eligible": 3-4,
  "hard_excluded": 0
}
```

**❌ If total_trials < 10:**
→ Problem: Database missing trials
→ Solution: Reseed database

**❌ If possibly_eligible = 5:**
→ Problem: Matching engine excluding valid trials
→ Solution: Check matching engine logs (Step 3)

**✅ If possibly_eligible = 6-7:**
→ Backend is correct! Issue is in frontend display (Step 4)

---

### Step 3: Check Which Trials Are Returned

**Get full list of matched trials:**

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d @test_patient_a.json | jq '.matches[].trial | {id, nct_number, title, eligibility_score}'
```

**Expected to see these trials for ER+/PR+/HER2-low patient:**

1. ✅ **bc_trial_001** (NCT05234567) - DESTINY-Breast06 (HER2-low)
2. ✅ **bc_trial_002** (NCT05789234) - Sacituzumab Govitecan (HR+/HER2-)
3. ✅ **bc_trial_004** (NCT05456789) - Elacestrant (ER+/HER2-)
4. ✅ **bc_trial_005** (NCT05678912) - Datopotamab Deruxtecan (HR+/HER2-)
5. ✅ **bc_trial_007** (NCT05891234) - Capivasertib (ER+/HER2-)
6. ✅ **bc_trial_009** (NCT05789321) - Rintodestrant (ER+/HER2-)
7. ⚠️ **bc_trial_011** - Abemaciclib (if exists in dataset)

**Should NOT see:**

- ❌ **bc_trial_003** (TNBC trial - patient is ER+)
- ❌ **bc_trial_006** (TNBC trial - patient is ER+)
- ❌ **bc_trial_008** (HER2+ with brain mets - patient is HER2-low)
- ❌ **bc_trial_010** (Neoadjuvant/early stage - patient is Stage IV)

**❌ If missing bc_trial_005 (Datopotamab):**
→ Problem: Matching engine incorrectly excluding
→ Check matching engine biomarker logic
→ Verify trial has correct eligibility_criteria

---

### Step 4: Check Frontend Display Issues

**Issue A: Only showing 5 trials when backend returns more**

Check frontend code where trials are displayed:

```typescript
// File: src/components/TrialResults.tsx or similar

// Look for pagination or limit
const displayedTrials = matches.slice(0, 5);  // ❌ BAD: Hard limit

// Should be:
const displayedTrials = matches;  // ✅ GOOD: Show all matches
```

**Issue B: All trials showing "Not Recruiting"**

Check status display logic:

```typescript
// ❌ BAD: Hardcoded
<Badge>Not Recruiting</Badge>

// ❌ BAD: Wrong mapping
{trial.status === "recruiting" ? "Not Recruiting" : "Recruiting"}

// ✅ GOOD: Correct mapping
{trial.status === "recruiting" ? "Recruiting" : "Not Recruiting"}

// ✅ GOOD: Proper status display
<Badge variant={trial.status === "recruiting" ? "success" : "secondary"}>
  {trial.status === "recruiting" ? "Recruiting" : "Not Recruiting"}
</Badge>
```

---

### Step 5: Verify Individual Missing Trial

**If bc_trial_005 (Datopotamab Deruxtecan) is missing:**

```bash
# Check if trial exists in database
curl http://localhost:8000/api/v1/trials/NCT05678912

# Expected response:
{
  "trial": {
    "nct_number": "NCT05678912",
    "title": "Datopotamab Deruxtecan in HR+/HER2-...",
    "cancer_type": "breast",
    ...
  }
}
```

**❌ If 404 Not Found:**
→ Problem: Trial not in database
→ Check mock_trials.py has bc_trial_005
→ Reseed database

**✅ If trial exists:**
→ Check why matching engine excludes it

**Verify trial's eligibility criteria:**

```bash
curl http://localhost:8000/api/v1/trials/NCT05678912 | jq '.trial.eligibility_criteria'
```

**Should show:**
```json
[
  {
    "criterion": "HR+ and HER2- breast cancer",
    "met": true,
    "category": "biomarker"
  },
  {
    "criterion": "Metastatic breast cancer",
    "met": true,
    "category": "stage"
  },
  ...
]
```

**❌ If criterion is "Triple-negative" or "HER2-positive":**
→ Problem: Wrong trial data loaded
→ Verify mock_trials.py has correct bc_trial_005 data

---

### Step 6: Add Debug Logging to Matching Engine

**Temporarily add logging to see what's happening:**

**File:** `app/matching_engine.py`

**In `match_trials` method, add:**

```python
def match_trials(self, patient_profile, all_trials):
    matched_trials = []
    
    print(f"\n=== MATCHING DEBUG ===")
    print(f"Patient: {patient_profile.cancer_type}, Stage {patient_profile.stage}")
    print(f"Biomarkers: ER={patient_profile.biomarkers.get('ER')}, PR={patient_profile.biomarkers.get('PR')}, HER2={patient_profile.biomarkers.get('HER2')}")
    print(f"Total trials to evaluate: {len(all_trials)}")
    
    excluded_count = 0
    for trial in all_trials:
        # Check hard exclusions
        if self._should_exclude(patient_profile, trial):
            excluded_count += 1
            print(f"  ❌ EXCLUDED: {trial.nct_number} - {trial.title[:50]}")
            continue
        
        print(f"  ✅ MATCHED: {trial.nct_number} - {trial.title[:50]}")
        
        # ... rest of matching logic
    
    print(f"\nResults: {len(matched_trials)} matched, {excluded_count} excluded")
    print("===================\n")
    
    return matched_trials
```

**Run matching again and check server logs:**

```bash
# In terminal where server is running, you'll see:
=== MATCHING DEBUG ===
Patient: breast, Stage IV
Biomarkers: ER=present, PR=present, HER2=low
Total trials to evaluate: 10
  ✅ MATCHED: NCT05234567 - DESTINY-Breast06...
  ✅ MATCHED: NCT05789234 - Sacituzumab Govitecan...
  ❌ EXCLUDED: NCT06926868 - Izalontamab TNBC... (patient is ER+, trial requires TNBC)
  ✅ MATCHED: NCT05456789 - Elacestrant...
  ❌ EXCLUDED: NCT05678912 - Datopotamab... (WHY???)
  ...
Results: 5 matched, 5 excluded
```

**This will show exactly which trials are being excluded and why!**

---

### Step 7: Check for Biomarker Data Structure Issues

**Problem:** Matching engine might not be reading biomarkers correctly

**Test:**

```bash
# Send request with explicit biomarker structure
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "age": 61,
    "sex": "female",
    "cancer_type": "breast",
    "stage": "IV",
    "ecog": "0",
    "biomarkers": {
      "ER": {"status": "present"},
      "PR": {"status": "present"},
      "HER2": {"status": "low"}
    },
    "prior_treatments": ["CDK4/6 inhibitor"],
    "line_of_therapy": "post_targeted"
  }' | jq '.stats'
```

**Try different format:**

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
    "prior_treatments": ["CDK4/6 inhibitor"],
    "line_of_therapy": "post_targeted"
  }' | jq '.stats'
```

**If one format returns more trials than the other:**
→ Problem: Biomarker parsing inconsistency
→ Solution: Apply matching engine fix (Snapdev_Fix_Matching_Engine.md)

---

## Summary of Checks

### Checklist:

- [ ] **Step 1:** Database has all 20 trials (10 breast, 10 lung)
- [ ] **Step 2:** Matching API returns 6-7 possibly_eligible for Patient A
- [ ] **Step 3:** bc_trial_005 (Datopotamab) appears in matched trials
- [ ] **Step 4:** Frontend shows all matched trials (not limited to 5)
- [ ] **Step 5:** Trial status shows "Recruiting" not "Not Recruiting"
- [ ] **Step 6:** Debug logging reveals any exclusion issues
- [ ] **Step 7:** Biomarker data structure is consistent

---

## Expected Final Results

**After all fixes, Patient A should see:**

```
✓ 6-7 Possibly Eligible Trials
  1. DESTINY-Breast06 (HER2-low)
  2. Sacituzumab Govitecan (HR+/HER2-)
  3. Datopotamab Deruxtecan (HR+/HER2-) ← Currently missing
  4. Elacestrant (ESR1-mutant, ER+/HER2-)
  5. Capivasertib (PIK3CA-altered, ER+/HER2-)
  6. Rintodestrant (ER+/HER2-)
  7. [Potentially more depending on dataset]

✓ 3-4 Likely Not Eligible
  - TNBC trials (patient is ER+)
  - HER2+ trials (patient is HER2-low)
  - Early-stage trials (patient is Stage IV)

✓ All trials show "Recruiting" status
```

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Only 5 trials in database | Not fully seeded | `python -m app.data.seed_database` |
| API returns 5 but should return 7 | Matching engine issue | Apply matching engine fixes |
| API returns 7 but UI shows 5 | Frontend pagination | Remove hardcoded limit |
| All show "Not Recruiting" | Frontend mapping bug | Fix status display logic |
| Duplicate NCT error | NCT numbers not fixed | Apply duplicate fix |
| bc_trial_005 missing | Trial data incorrect | Verify mock_trials.py |

---

## Files to Reference

If issues found, refer to:
- `Snapdev_Fix_Matching_Engine.md` - Fix biomarker exclusion logic
- `Fix_Duplicate_NCT_Numbers.md` - Fix duplicate NCT numbers
- `Snapdev_SQL_Database_Setup.md` - Database setup and seeding

---

## Reporting Results

After running all checks, report findings in this format:

```
DIAGNOSTIC RESULTS:

Step 1 - Database Check:
✓ Total trials: 20
✓ Breast trials: 10
✓ Lung trials: 10
✓ All expected NCT numbers present

Step 2 - API Matching:
✓ API returns 7 possibly_eligible trials
Issue: Frontend only shows 5

Step 3 - Trials Returned:
✓ bc_trial_001: included
✓ bc_trial_002: included
❌ bc_trial_005: MISSING - excluded by matching engine
✓ bc_trial_004: included
...

Step 4 - Frontend Display:
Issue: Status hardcoded as "Not Recruiting"
Issue: Pagination limited to first 5 trials

RECOMMENDED FIXES:
1. Fix frontend pagination (remove slice(0,5))
2. Fix status display mapping
3. Debug why bc_trial_005 is excluded
```

---

**START DIAGNOSTICS**

Run these checks in order and report findings after each step.
