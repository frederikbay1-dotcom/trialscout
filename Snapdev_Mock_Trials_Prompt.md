# Snapdev Prompt: Add Mock Trial Data to Backend

## Objective
Load the complete set of 20 clinical trials (10 breast cancer + 10 NSCLC) into the backend's `app/data/mock_trials.py` file to restore full MVP functionality.

## Context
The backend currently exists but may have incomplete or placeholder trial data. We need to populate it with the exact 20 trials that were designed for the MVP, ensuring perfect alignment with the frontend expectations.

## Data Source
The trial data comes from two sources:
1. **Breast Cancer Trials:** `breast_cancer_trials_lovable.json` (10 trials: bc_trial_001 through bc_trial_010)
2. **NSCLC Trials:** Need to be created based on the pattern (10 trials: lung_trial_001 through lung_trial_010)

---

## Instructions for Snapdev

@workspace Load the complete mock trial data into the backend.

### Step 1: Read the Source Data
First, locate and read `breast_cancer_trials_lovable.json` in the project files. This contains all 10 breast cancer trials.

### Step 2: Understand the Data Structure
Each trial in the JSON has these fields (camelCase):
- `id`, `nctNumber`, `title`, `phase`, `sponsor`, `status`, `location`, `distance`
- `lastUpdated`, `eligibilityScore`, `matchConfidence`
- `whyMatched` (array), `whatToConfirm` (array)
- `eligibilityCriteria` (array of objects)
- `burden` (object), `exclusionRisks` (object), `translatedInfo` (object)

The backend Pydantic models use snake_case, so you'll need to convert field names:
- `nctNumber` → `nct_number`
- `lastUpdated` → `last_updated`
- `eligibilityScore` → `eligibility_score`
- `matchConfidence` → `match_confidence`
- `whyMatched` → `why_matched`
- `whatToConfirm` → `what_to_confirm`
- `eligibilityCriteria` → `eligibility_criteria`
- `visitsPerMonth` → `visits_per_month`
- `imagingFrequency` → `imaging_frequency`
- `biopsyRequired` → `biopsy_required`
- `hospitalStays` → `hospital_stays`
- `priorDrugExposure` → `prior_drug_exposure`
- `washoutWindow` → `washout_window`
- `labThresholds` → `lab_thresholds`
- `brainMets` → `brain_mets`
- `whatHappens` → `what_happens`

### Step 3: Convert JSON to Pydantic Models
Create `app/data/mock_trials.py` with the following structure:

```python
"""Mock trial data - 20 trials for MVP (10 breast, 10 NSCLC)"""
from typing import List
from app.models.trial import (
    Trial, 
    EligibilityCriterion, 
    PatientBurden, 
    ExclusionRisks, 
    TranslatedInfo
)

# IMPORTANT: Use mutable list for CRUD operations
TRIALS: List[Trial] = [
    # Breast Cancer Trials (bc_trial_001 through bc_trial_010)
    Trial(
        id="bc_trial_001",
        nct_number="NCT05234567",
        title="DESTINY-Breast06: Trastuzumab Deruxtecan in HER2-Low Metastatic Breast Cancer",
        phase="Phase III",
        sponsor="Daiichi Sankyo",
        status="recruiting",
        location="Memorial Sloan Kettering Cancer Center, New York, NY",
        distance=8,
        cancer_type="breast",  # ADD THIS - not in JSON
        last_updated="2025-01-15",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "HER2-low (IHC 1+ or IHC 2+/ISH-) status matches",
            "Stage IV breast cancer confirmed",
            "Prior chemotherapy aligns with inclusion",
            "ER-positive status matches criteria"
        ],
        what_to_confirm=[
            "Verify HER2 IHC 1+ or IHC 2+/ISH-negative status",
            "Check LVEF ≥50% requirement",
            "Confirm 21-day washout from last therapy"
        ],
        eligibility_criteria=[
            EligibilityCriterion(
                criterion="HER2-low breast cancer (IHC 1+ or IHC 2+/ISH-)",
                met=True,
                category="biomarker"
            ),
            EligibilityCriterion(
                criterion="Stage IV or locally recurrent inoperable",
                met=True,
                category="stage"
            ),
            EligibilityCriterion(
                criterion="Prior treatment with 1-2 chemotherapy regimens",
                met=True,
                category="treatment_history"
            ),
            EligibilityCriterion(
                criterion="ECOG performance status 0-1",
                met="unknown",
                category="performance"
            ),
            EligibilityCriterion(
                criterion="LVEF ≥50%",
                met="unknown",
                category="organ_function"
            )
        ],
        burden=PatientBurden(
            visits_per_month=2,
            imaging_frequency="Every 6 weeks",
            biopsy_required=False,
            hospital_stays=False
        ),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="Prior trastuzumab deruxtecan",
            washout_window="21 days from last systemic therapy",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL",
            brain_mets="Treated and stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="A targeted antibody-drug conjugate that delivers chemotherapy directly to HER2-low cancer cells. Participants receive either T-DXd or physician's choice chemotherapy.",
            goal="To see if trastuzumab deruxtecan works better than standard chemotherapy for HER2-low metastatic breast cancer.",
            what_happens="You'll receive an IV infusion every 3 weeks. Scans every 6 weeks to check tumor response. Blood tests at each visit.",
            duration="Treatment continues as long as it's working and side effects are manageable, typically 12-18 months on average."
        )
    ),
    
    # ... repeat for bc_trial_002 through bc_trial_010
    # (convert all 10 trials from breast_cancer_trials_lovable.json)
    
    # NSCLC Trials (lung_trial_001 through lung_trial_010)
    # See Step 4 for NSCLC trial specifications
]
```

### Step 4: Create NSCLC Trials
Since we don't have a JSON file for NSCLC trials, create 10 trials based on these specifications:

**NSCLC Trial Template:**
```python
Trial(
    id="lung_trial_001",
    nct_number="NCT05894239",
    title="MARIPOSA-2: Amivantamab + Lazertinib in EGFR-Mutant NSCLC Post-Osimertinib",
    phase="Phase III",
    sponsor="Janssen Research & Development",
    status="recruiting",
    location="Memorial Sloan Kettering Cancer Center, New York, NY",
    distance=8,
    cancer_type="lung",  # IMPORTANT
    last_updated="2025-01-28",
    eligibility_score="possibly_eligible",
    match_confidence="high",
    why_matched=[
        "EGFR-mutant NSCLC (exon 19 deletion or L858R)",
        "Stage IV disease matches trial requirement",
        "Prior osimertinib therapy aligns with inclusion",
        "ECOG 0-1 meets performance criteria"
    ],
    what_to_confirm=[
        "Confirm EGFR mutation type (exon 19 del or L858R required)",
        "Verify disease progression on osimertinib",
        "Check adequate organ function (liver, kidney)"
    ],
    eligibility_criteria=[
        EligibilityCriterion(
            criterion="EGFR-mutant NSCLC (exon 19 deletion or L858R)",
            met=True,
            category="biomarker"
        ),
        EligibilityCriterion(
            criterion="Stage IV or recurrent NSCLC",
            met=True,
            category="stage"
        ),
        EligibilityCriterion(
            criterion="Prior osimertinib therapy required",
            met=True,
            category="treatment_history"
        ),
        EligibilityCriterion(
            criterion="ECOG performance status 0-1",
            met="unknown",
            category="performance"
        )
    ],
    burden=PatientBurden(
        visits_per_month=2,
        imaging_frequency="Every 6 weeks",
        biopsy_required=False,
        hospital_stays=False
    ),
    exclusion_risks=ExclusionRisks(
        prior_drug_exposure="No prior amivantamab or lazertinib",
        washout_window="14 days from last systemic therapy",
        lab_thresholds="ANC ≥1000/μL, adequate liver function",
        brain_mets="Treated and stable brain metastases allowed"
    ),
    translated_info=TranslatedInfo(
        design="Combines amivantamab (bispecific antibody targeting EGFR and MET) with lazertinib (third-generation EGFR inhibitor). Compares combination vs chemotherapy after osimertinib failure.",
        goal="To determine if amivantamab + lazertinib extends progression-free survival compared to chemotherapy in EGFR-mutant NSCLC patients who progressed on osimertinib.",
        what_happens="IV infusion of amivantamab weekly for 4 weeks, then every 2 weeks. Daily lazertinib pill. Scans every 6 weeks. Blood tests at each visit.",
        duration="Treatment continues until disease progression or intolerable side effects, typically 10-16 months."
    )
)
```

**Create 10 NSCLC trials covering these scenarios:**

1. **lung_trial_001:** EGFR-mutant post-osimertinib (MARIPOSA-2) - as shown above
2. **lung_trial_002:** First-line EGFR-mutant (Osimertinib vs chemo)
3. **lung_trial_003:** KRAS G12C-mutant (Sotorasib or Adagrasib)
4. **lung_trial_004:** ALK-positive (Lorlatinib second-line)
5. **lung_trial_005:** PD-L1 high (≥50%) first-line immunotherapy
6. **lung_trial_006:** Non-squamous, no driver mutation (chemo + immunotherapy)
7. **lung_trial_007:** MET exon 14 skipping (Tepotinib or Capmatinib)
8. **lung_trial_008:** ROS1-positive (Entrectinib or Repotrectinib)
9. **lung_trial_009:** BRAF V600E-mutant (Dabrafenib + Trametinib)
10. **lung_trial_010:** HER2-mutant (Trastuzumab deruxtecan - T-DXd)

**Key variations for NSCLC trials:**
- **NCT Numbers:** NCT05894239, NCT05123456, NCT05234789, NCT05345890, NCT05456901, NCT05567012, NCT05678123, NCT05789234, NCT05890345, NCT05901456
- **Locations:** Rotate between MSK (8 mi), NYU Langone (12 mi), Columbia (15 mi), Weill Cornell (10 mi), Mount Sinai (9 mi)
- **Phases:** Mix of Phase II and Phase III
- **Biomarker requirements:** Each trial targets specific mutation (EGFR, KRAS, ALK, etc.)

### Step 5: Important Field Mappings

**Fields that MUST be added (not in JSON):**
- `cancer_type`: "breast" or "lung" (required for filtering)

**Fields to convert from camelCase to snake_case:**
- All nested object fields (burden, exclusionRisks, translatedInfo)
- See full mapping in Step 2

**Boolean conversions:**
- JSON has: `"biopsyRequired": false`
- Python needs: `biopsy_required=False`

**"met" field handling:**
- JSON has: `"met": true` or `"met": "unknown"`
- Python needs: `met=True` or `met="unknown"` (note: True is boolean, "unknown" is string)

### Step 6: Validation
After creating the file, verify:

1. **Correct number of trials:**
   ```python
   assert len(TRIALS) == 20
   assert sum(1 for t in TRIALS if t.cancer_type == "breast") == 10
   assert sum(1 for t in TRIALS if t.cancer_type == "lung") == 10
   ```

2. **All NCT numbers unique:**
   ```python
   nct_numbers = [t.nct_number for t in TRIALS]
   assert len(nct_numbers) == len(set(nct_numbers))
   ```

3. **All required fields present:**
   - Every trial has `cancer_type` field
   - All snake_case conversions done
   - All Pydantic models properly instantiated

4. **Test import:**
   ```bash
   cd trialscout-backend
   python -c "from app.data.mock_trials import TRIALS; print(f'Loaded {len(TRIALS)} trials')"
   ```

### Step 7: Test with API Endpoints
Start the server and verify:

```bash
# List all trials
curl http://localhost:8000/api/v1/trials

# Filter by cancer type
curl "http://localhost:8000/api/v1/trials?cancer_type=breast"
curl "http://localhost:8000/api/v1/trials?cancer_type=lung"

# Get specific trial
curl http://localhost:8000/api/v1/trials/NCT05234567
```

Expected results:
- GET /api/v1/trials returns 20 trials
- Filter by breast returns 10 trials
- Filter by lung returns 10 trials
- All trials have proper formatting

---

## Complete Example: Converting One Trial

**From JSON (breast_cancer_trials_lovable.json):**
```json
{
  "id": "bc_trial_002",
  "nctNumber": "NCT05789234",
  "title": "Sacituzumab Govitecan vs Chemotherapy in HR+/HER2- Metastatic Breast Cancer",
  "phase": "Phase III",
  "sponsor": "Gilead Sciences",
  "status": "recruiting",
  "location": "NYU Langone Health, New York, NY",
  "distance": 12,
  "lastUpdated": "2025-01-20",
  "eligibilityScore": "possibly_eligible",
  "matchConfidence": "high",
  "burden": {
    "visitsPerMonth": 2,
    "imagingFrequency": "Every 8 weeks",
    "biopsyRequired": false,
    "hospitalStays": false
  }
}
```

**To Python (mock_trials.py):**
```python
Trial(
    id="bc_trial_002",
    nct_number="NCT05789234",  # camelCase → snake_case
    title="Sacituzumab Govitecan vs Chemotherapy in HR+/HER2- Metastatic Breast Cancer",
    phase="Phase III",
    sponsor="Gilead Sciences",
    status="recruiting",
    location="NYU Langone Health, New York, NY",
    distance=12,
    cancer_type="breast",  # ADD THIS
    last_updated="2025-01-20",  # camelCase → snake_case
    eligibility_score="possibly_eligible",  # camelCase → snake_case
    match_confidence="high",  # camelCase → snake_case
    # ... all other fields converted similarly
    burden=PatientBurden(
        visits_per_month=2,  # camelCase → snake_case
        imaging_frequency="Every 8 weeks",  # camelCase → snake_case
        biopsy_required=False,  # camelCase → snake_case, lowercase boolean
        hospital_stays=False  # camelCase → snake_case, lowercase boolean
    ),
    # ... rest of fields
)
```

---

## NSCLC Trial Specifications (10 Trials)

Create these 10 trials with the following key characteristics:

### 1. lung_trial_001: MARIPOSA-2 (Post-Osimertinib)
- **NCT:** NCT05894239
- **Biomarker:** EGFR exon 19 deletion or L858R
- **Line:** Post-osimertinib (second-line+)
- **Treatment:** Amivantamab + Lazertinib
- **Eligibility score:** possibly_eligible

### 2. lung_trial_002: First-Line EGFR+ 
- **NCT:** NCT05123456
- **Biomarker:** EGFR exon 19 deletion or L858R
- **Line:** First-line
- **Treatment:** Osimertinib vs platinum-based chemo
- **Eligibility score:** possibly_eligible

### 3. lung_trial_003: KRAS G12C
- **NCT:** NCT05234789
- **Biomarker:** KRAS G12C mutation
- **Line:** Second-line+
- **Treatment:** Sotorasib vs docetaxel
- **Eligibility score:** possibly_eligible

### 4. lung_trial_004: ALK-Positive
- **NCT:** NCT05345890
- **Biomarker:** ALK rearrangement
- **Line:** Post-crizotinib or post-alectinib
- **Treatment:** Lorlatinib
- **Eligibility score:** possibly_eligible

### 5. lung_trial_005: PD-L1 High (First-Line)
- **NCT:** NCT05456901
- **Biomarker:** PD-L1 ≥50% (no EGFR/ALK)
- **Line:** First-line
- **Treatment:** Pembrolizumab vs chemo
- **Eligibility score:** possibly_eligible

### 6. lung_trial_006: Non-Squamous, No Driver
- **NCT:** NCT05567012
- **Biomarker:** No driver mutation
- **Line:** First-line
- **Treatment:** Carboplatin + Pemetrexed + Pembrolizumab
- **Eligibility score:** possibly_eligible

### 7. lung_trial_007: MET Exon 14 Skipping
- **NCT:** NCT05678123
- **Biomarker:** MET exon 14 skipping mutation
- **Line:** Any line
- **Treatment:** Tepotinib or Capmatinib
- **Eligibility score:** possibly_eligible

### 8. lung_trial_008: ROS1-Positive
- **NCT:** NCT05789234
- **Biomarker:** ROS1 rearrangement
- **Line:** Any line
- **Treatment:** Entrectinib vs crizotinib
- **Eligibility score:** possibly_eligible

### 9. lung_trial_009: BRAF V600E
- **NCT:** NCT05890345
- **Biomarker:** BRAF V600E mutation
- **Line:** Any line
- **Treatment:** Dabrafenib + Trametinib
- **Eligibility score:** possibly_eligible

### 10. lung_trial_010: HER2-Mutant
- **NCT:** NCT05901456
- **Biomarker:** HER2 mutation (not amplification)
- **Line:** Post-platinum
- **Treatment:** Trastuzumab deruxtecan (T-DXd)
- **Eligibility score:** possibly_eligible

**Common fields for all NSCLC trials:**
- `cancer_type`: "lung"
- `status`: "recruiting"
- `match_confidence`: "high" (for 1-7), "medium" (for 8-10, rarer mutations)
- `phase`: Mix of "Phase II" and "Phase III"
- `distance`: 8-15 miles (NYC metro)

---

## Verification Checklist

After implementation:
- [ ] File `app/data/mock_trials.py` exists
- [ ] Contains exactly 20 Trial objects
- [ ] 10 breast cancer trials (bc_trial_001 to bc_trial_010)
- [ ] 10 NSCLC trials (lung_trial_001 to lung_trial_010)
- [ ] All trials have `cancer_type` field ("breast" or "lung")
- [ ] All camelCase fields converted to snake_case
- [ ] All NCT numbers unique
- [ ] All Pydantic models properly instantiated
- [ ] File imports without errors: `from app.data.mock_trials import TRIALS`
- [ ] Server starts: `uvicorn main:app --reload`
- [ ] API returns 20 trials: `GET /api/v1/trials`
- [ ] Filtering works: `GET /api/v1/trials?cancer_type=breast` returns 10
- [ ] Matching endpoint works with trial data

---

## Common Issues & Solutions

### Issue: Import errors
**Error:** `ImportError: cannot import name 'Trial'`
**Fix:** Ensure all models imported at top:
```python
from app.models.trial import Trial, EligibilityCriterion, PatientBurden, ExclusionRisks, TranslatedInfo
```

### Issue: Pydantic validation errors
**Error:** `ValidationError: X field required`
**Fix:** Check all required fields are present. Common missing fields:
- `cancer_type` (must add manually)
- All fields in nested objects (burden, exclusion_risks, translated_info)

### Issue: Boolean conversion
**Error:** `"false" is not a valid boolean`
**Fix:** Use Python boolean: `False` not `"false"`

### Issue: "met" field type confusion
**Error:** `"unknown" is not a valid boolean`
**Fix:** The `met` field accepts `bool | Literal["unknown"]`:
```python
met=True  # Boolean for confirmed
met=False  # Boolean for not met
met="unknown"  # String for unknown status
```

---

## Expected Output

When complete, your `mock_trials.py` should:
- Be ~2000-2500 lines long
- Have this structure:
  ```python
  TRIALS: List[Trial] = [
      Trial(...),  # bc_trial_001
      Trial(...),  # bc_trial_002
      # ... 8 more breast trials
      Trial(...),  # lung_trial_001
      Trial(...),  # lung_trial_002
      # ... 8 more lung trials
  ]
  ```
- Import successfully
- Power all API endpoints with real trial data

---

**START IMPLEMENTATION**

Please proceed with:
1. Reading `breast_cancer_trials_lovable.json`
2. Converting all 10 breast trials to Python Trial objects
3. Creating 10 NSCLC trials following the specifications above
4. Saving to `app/data/mock_trials.py`
5. Testing the import and API endpoints
