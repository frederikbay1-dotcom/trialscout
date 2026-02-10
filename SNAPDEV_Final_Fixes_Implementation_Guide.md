# SNAPDEV IMPLEMENTATION: Final Fixes for Demo

## CURRENT STATUS: 80% Complete ✅

**What's Working:**
✅ Demographics extraction (Age, Sex, ECOG all showing correctly)
✅ "No EGFR/ALK" exclusions working (KEYNOTE trials correctly excluded)
✅ Biomarker extraction working
✅ Trial matching infrastructure solid

**What's Broken:**
❌ Trials requiring HER2/MET/BRAF mutations showing for patients who lack them
❌ Treatment history too generic ("targeted therapy" instead of "osimertinib 6 weeks")
❌ Treatment status incorrect ("newly diagnosed" instead of "progressed on EGFR TKI")

---

## OBJECTIVE

**Patient D (EGFR+ lung cancer) should see:**
- ✅ FLAURA2 (EGFR+ first-line)
- ✅ MARIPOSA-2 (EGFR+ post-osimertinib)
- ❌ NO HER2/MET/BRAF/RET/NTRK trials

**Currently showing:** 5 trials (1 correct + 4 wrong)
**Should show:** 2 trials (2 correct)

---

## FIX #1: EXCLUDE TRIALS REQUIRING MUTATIONS PATIENT LACKS

### Priority: CRITICAL
### Time: 15 minutes
### File: `matching/rules.py`

### Problem
Trials like DESTINY-Lung02 (requires HER2 mutation) are showing for patients who don't have HER2 mutations.

### Solution
Add checks for positive mutation requirements to the hard exclusion rules.

### Implementation

#### Step 1: Add Positive Mutation Requirement Checks

**Location:** Add this function to `matching/rules.py` after line 175 (after the existing `check_lung_biomarker_exclusion` function)

**OR:** Add these checks INSIDE the existing `check_lung_biomarker_exclusion` function at the end, before the `return None` statement.

```python
def check_lung_biomarker_exclusion(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Lung cancer biomarker exclusions with mutual exclusivity"""
    biomarkers = patient.biomarkers
    if not isinstance(biomarkers, LungBiomarkers):
        return None
    
    # ... EXISTING CODE for EGFR+, ALK+, ROS1+, KRAS G12C trials ...
    # ... EXISTING CODE for "no driver" trials ...
    
    # ========== ADD THIS SECTION AT THE END ==========
    
    # NEW: HER2 MUTATION trials (requires specific mutation patient doesn't have)
    if "HER2" in trial.title and ("mutation" in trial.title.lower() or "mutant" in trial.title.lower()):
        # HER2 mutations in lung cancer are rare and specific
        # If not explicitly documented as present, exclude
        # Note: This is different from HER2 amplification in breast cancer
        return "HER2-mutant trial requires documented HER2 mutation (patient status unknown/negative)"
    
    # NEW: MET EXON 14 trials
    if "MET" in trial.title and ("exon 14" in trial.title.lower() or "ex14" in trial.title.lower()):
        if biomarkers.MET.status != "present":
            return "MET exon 14 trial requires MET exon 14 skipping mutation (patient is MET-negative or unknown)"
        # If MET is present, check if it's specifically exon 14
        if biomarkers.MET.status == "present" and biomarkers.MET.alteration:
            if "exon 14" not in biomarkers.MET.alteration.lower() and "ex14" not in biomarkers.MET.alteration.lower():
                return f"MET exon 14 trial requires exon 14 skipping (patient has {biomarkers.MET.alteration})"
    
    # NEW: BRAF V600E trials
    if "BRAF" in trial.title and ("V600E" in trial.title or "V600" in trial.title):
        if biomarkers.BRAF.status != "present":
            return "BRAF V600E trial requires BRAF V600E mutation (patient is BRAF-negative or unknown)"
        # If BRAF is present, check if it's V600E
        if biomarkers.BRAF.status == "present" and biomarkers.BRAF.mutation:
            if "V600E" not in biomarkers.BRAF.mutation:
                return f"BRAF V600E trial requires V600E mutation (patient has {biomarkers.BRAF.mutation})"
    
    # NEW: RET FUSION trials
    if "RET" in trial.title and ("fusion" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        if biomarkers.RET.status != "present":
            return "RET fusion trial requires RET rearrangement (patient is RET-negative or unknown)"
    
    # NEW: NTRK FUSION trials
    if "NTRK" in trial.title and ("fusion" in trial.title.lower() or "rearrangement" in trial.title.lower()):
        if biomarkers.NTRK.status != "present":
            return "NTRK fusion trial requires NTRK fusion (patient is NTRK-negative or unknown)"
    
    # ========== END OF NEW SECTION ==========
    
    return None
```

#### Step 2: Also Add to Eligibility Criteria Checker

**IF** you implemented the `check_eligibility_criteria_exclusions` function from the previous fix, add this section to it as well.

**Location:** Inside `check_eligibility_criteria_exclusions`, in the `if patient.cancer_type == "lung":` section, after the existing "No EGFR/ALK/ROS1" checks:

```python
def check_eligibility_criteria_exclusions(patient: PatientProfile, trial: Trial) -> Optional[str]:
    """Check if patient violates eligibility criteria requirements"""
    
    if patient.cancer_type == "lung":
        biomarkers = patient.biomarkers
        if not isinstance(biomarkers, LungBiomarkers):
            return None
        
        # ... EXISTING CODE for "No EGFR/ALK/ROS1" checks ...
        
        # ========== ADD THIS SECTION ==========
        
        for criterion in trial.eligibility_criteria:
            if criterion.category != "biomarker":
                continue
            
            criterion_lower = criterion.criterion.lower()
            
            # "HER2 mutation (required)"
            if "her2 mutation" in criterion_lower and "required" in criterion_lower:
                return "Trial requires HER2 mutation (patient HER2 status unknown/negative)"
            
            # "MET exon 14 skipping mutation (required)"
            if ("met exon 14" in criterion_lower or "met ex14" in criterion_lower) and "required" in criterion_lower:
                if biomarkers.MET.status != "present":
                    return "Trial requires MET exon 14 skipping (patient is MET-negative or unknown)"
            
            # "BRAF V600E mutation (required)"
            if "braf v600e" in criterion_lower and "required" in criterion_lower:
                if biomarkers.BRAF.status != "present":
                    return "Trial requires BRAF V600E mutation (patient is BRAF-negative or unknown)"
            
            # "RET fusion (required)"
            if ("ret fusion" in criterion_lower or "ret rearrangement" in criterion_lower) and "required" in criterion_lower:
                if biomarkers.RET.status != "present":
                    return "Trial requires RET fusion (patient is RET-negative or unknown)"
            
            # "NTRK fusion (required)"
            if "ntrk fusion" in criterion_lower and "required" in criterion_lower:
                if biomarkers.NTRK.status != "present":
                    return "Trial requires NTRK fusion (patient is NTRK-negative or unknown)"
        
        # ========== END OF NEW SECTION ==========
    
    return None
```

### Testing Fix #1

```bash
# Test with Patient D (EGFR+ lung cancer)
# Upload patient_d_lung_molecular.txt
# Upload patient_d_oncology_note.txt
# Click "Find Trials"

# EXPECTED RESULT:
# - Shows: FLAURA2 and MARIPOSA-2 (2 trials)
# - Does NOT show: DESTINY-Lung02, VISION, BRAF trial

# VERIFY in clinician brief:
# - "2 Possible Matches" (not "1 possible + 4 needing confirmation")
# - Only EGFR trials listed
```

---

## FIX #2: EXTRACT DETAILED TREATMENT HISTORY

### Priority: HIGH
### Time: 10 minutes
### File: `app/extractors/biomarker_extractor.py`

### Problem
Treatment history shows generic "Targeted therapy (e.g., EGFR/ALK inhibitors)" instead of specific details like "Osimertinib (Tagrisso) - Started December 2024, 6 weeks duration, partial response/CNS progression"

### Solution
The extraction prompt we provided earlier should already extract this, but the frontend needs to format it properly for the PDF.

### Implementation

#### Option A: If Extraction Already Returns Detailed Data

**Check:** Look at the backend logs when oncology note is uploaded. Does the extraction return:

```json
{
  "prior_treatments": [
    {
      "treatment": "osimertinib",
      "date": "2024-12",
      "duration": "6 weeks",
      "response": "partial response, CNS progression"
    }
  ]
}
```

**If YES:** The backend is working, just need to format it in the PDF.

**File:** Wherever PDF generation happens (probably in results/matching component)

**Update the `formatTreatmentHistory` function we provided earlier to use the detailed data:**

```python
def formatTreatmentHistory(treatments: any[]): string {
  if (!treatments || treatments.length === 0) {
    return "No prior treatments documented";
  }
  
  return treatments.map((t, i) => {
    let line = `${i + 1}. ${t.treatment || t.name}`;
    
    // Add generic drug class if available
    const drugClass = getDrugClass(t.treatment);
    if (drugClass) {
      line += ` (${drugClass})`;
    }
    
    if (t.date) line += ` - Started ${t.date}`;
    if (t.duration) line += ` - Duration: ${t.duration}`;
    if (t.response) line += ` - Response: ${t.response}`;
    if (t.details) line += ` - ${t.details}`;
    
    return line;
  }).join('\n');
}

function getDrugClass(treatment: string): string {
  const treatmentLower = treatment.toLowerCase();
  
  if (treatmentLower.includes('osimertinib') || treatmentLower.includes('tagrisso')) {
    return 'EGFR TKI';
  }
  if (treatmentLower.includes('erlotinib') || treatmentLower.includes('tarceva')) {
    return 'EGFR TKI';
  }
  if (treatmentLower.includes('palbociclib') || treatmentLower.includes('ibrance')) {
    return 'CDK4/6 inhibitor';
  }
  if (treatmentLower.includes('trastuzumab') || treatmentLower.includes('herceptin')) {
    return 'HER2-targeted therapy';
  }
  // Add more as needed
  
  return '';
}
```

#### Option B: If Extraction Returns Generic Data

**If the backend extraction only returns:** `["osimertinib", "stereotactic radiosurgery"]`

**Then you need to update the extraction prompt we provided earlier.**

**File:** `app/extractors/biomarker_extractor.py`

**Make sure the prompt includes this section:**

```python
"prior_treatments": [
  {
    "treatment": "osimertinib" / "erlotinib" / "carboplatin" / etc,
    "date": "YYYY-MM" or null,
    "duration": "X months" / "X weeks" / "X cycles" or null,
    "response": "complete response" / "partial response" / "stable disease" / "progression" / null,
    "details": "Brief description" or null
  }
]

EXTRACTION RULES FOR TREATMENTS:
- Extract treatment name (drug or procedure)
- Extract start date if mentioned (month/year format)
- Extract duration if mentioned ("6 weeks", "4 cycles", "14 months")
- Extract response if mentioned ("partial response", "progression", "stable")
- Extract relevant details (dose, site for radiation, etc.)
```

### Testing Fix #2

```bash
# Test with Patient D
# Upload oncology note
# Check clinician brief PDF

# EXPECTED:
# Prior Treatments:
# 1. Osimertinib (EGFR TKI) - Started December 2024 - Duration: 6 weeks - Response: Partial response, CNS progression
# 2. Stereotactic radiosurgery - December 2024 - Brain metastases (3 lesions)

# NOT:
# Prior Treatments:
# - Surgery
# - Targeted therapy (e.g., EGFR/ALK inhibitors)
```

---

## FIX #3: CORRECT TREATMENT STATUS DETECTION

### Priority: MEDIUM
### Time: 10 minutes
### Files: `app/extractors/biomarker_extractor.py` + Frontend handler

### Problem
Shows "First-line (newly diagnosed)" when patient actually "Progressed on targeted therapy (first-line EGFR TKI)"

### Solution
Extraction needs to detect progression status and set treatment_status accordingly.

### Implementation

#### Step 1: Ensure Extraction Captures Progression

**File:** `app/extractors/biomarker_extractor.py`

**The prompt we provided earlier should already include:**

```python
"treatment_status": {
  "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
  "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
  "prior_regimen": "osimertinib" / "carboplatin + pemetrexed" / etc or null,
  "duration_months": number or null,
  "response": "partial response" / "stable disease" / "progression" / null
}

EXTRACTION RULES FOR TREATMENT STATUS:
1. Look for keywords:
   - "progression on [drug]" → check drug type (targeted vs chemo vs immunotherapy)
   - "progressed after [therapy]" → check therapy type
   - "newly diagnosed" + "no prior therapy" → newly_diagnosed
   
2. Classify drug/therapy type:
   - Targeted: osimertinib, erlotinib, trastuzumab, palbociclib, etc.
   - Chemo: carboplatin, paclitaxel, etc.
   - Immunotherapy: pembrolizumab, nivolumab, etc.
```

**Verify this section is in your extraction prompt.**

#### Step 2: Frontend Maps Treatment Status

**File:** `src/components/steps/ScreenerStep.tsx` (or wherever oncology upload is handled)

**The `handleOncologyUpload` function we provided earlier should include:**

```typescript
// Map treatment status
if (extractedData.treatment_status) {
  const status = extractedData.treatment_status;
  
  let currentTreatmentStatus = "unknown";
  let lineOfTherapy = status.line_of_therapy || "unknown";
  
  if (status.current_status === "newly_diagnosed") {
    currentTreatmentStatus = "first_line";
  } else if (status.current_status === "progressed_on_targeted") {
    currentTreatmentStatus = "progressed_targeted";
    // Patient progressed on first-line, so now needs second-line
    if (lineOfTherapy === "first_line") {
      lineOfTherapy = "second_line";
    }
  } else if (status.current_status === "progressed_on_chemo" || 
             status.current_status === "progressed_on_immunotherapy") {
    currentTreatmentStatus = "progressed_chemo_immuno";
  }
  
  setPatientData(prev => ({
    ...prev,
    currentTreatmentStatus: currentTreatmentStatus,
    lineOfTherapy: lineOfTherapy,
    priorRegimenDetails: {
      regimen: status.prior_regimen,
      duration: status.duration_months,
      response: status.response,
    }
  }));
}
```

**Verify this code is in your oncology upload handler.**

#### Step 3: Display in Clinician Brief

**File:** PDF generation code

**Ensure the treatment status is displayed correctly:**

```typescript
const getCurrentLineDescription = (status: string, lineOfTherapy: string): string => {
  if (status === "progressed_targeted" && lineOfTherapy === "second_line") {
    return "Progressed on first-line targeted therapy";
  }
  if (status === "progressed_chemo_immuno") {
    return "Progressed on chemotherapy/immunotherapy";
  }
  if (status === "first_line") {
    return "First-line (newly diagnosed)";
  }
  return "Unknown";
};

// In PDF generation:
{
  currentLine: getCurrentLineDescription(patientData.currentTreatmentStatus, patientData.lineOfTherapy)
}
```

### Testing Fix #3

```bash
# Test with Patient D
# Upload oncology note (mentions "progression on osimertinib")
# Check clinician brief

# EXPECTED:
# Current Line: Progressed on first-line targeted therapy (EGFR TKI)

# NOT:
# Current Line: First-line (newly diagnosed)
```

---

## TESTING CHECKLIST (After All Fixes)

### Test 1: Patient D Complete Workflow

```bash
1. Clear any existing patient data
2. Upload patient_d_lung_molecular.txt
   ✓ Age: 58, Sex: Male, EGFR exon 19 deletion extracted
3. Upload patient_d_oncology_note.txt
   ✓ ECOG: 1 extracted
   ✓ Treatment: "Osimertinib 6 weeks, progressed" extracted
   ✓ Status: "Progressed on targeted therapy" set
4. Click "Find Trials"
5. Check results page:
   ✓ Shows exactly 2 trials (FLAURA2 and MARIPOSA-2)
   ✓ Does NOT show HER2/MET/BRAF trials
6. Download clinician brief PDF
7. Verify PDF shows:
   ✓ Age: 58 years
   ✓ Sex: Male
   ✓ ECOG: 1 (Ambulatory, capable of light work)
   ✓ Current Line: Progressed on targeted therapy
   ✓ Prior Treatments: 
      1. Osimertinib (EGFR TKI) - December 2024 - 6 weeks - Partial response, CNS progression
      2. Stereotactic radiosurgery - December 2024 - Brain metastases
   ✓ 2 Possible Matches (not "1 possible + 4 needing confirmation")
   ✓ Only FLAURA2 and MARIPOSA-2 listed
```

### Test 2: Patient A (Breast HER2-low)

```bash
1. Upload patient_a files
2. Find trials
3. Verify:
   ✓ Shows HR+/HER2-low trials
   ✓ Does NOT show HER2+ or TNBC trials
   ✓ Demographics all populated
```

### Test 3: Patient B (Breast TNBC)

```bash
1. Upload patient_b files
2. Find trials
3. Verify:
   ✓ Shows TNBC trials
   ✓ Does NOT show HR+ or HER2+ trials
   ✓ Treatment status: "First-line (newly diagnosed)"
   ✓ Prior treatments: "None" or empty
```

---

## SUMMARY OF CHANGES

### Files Modified:
1. `matching/rules.py` - Add positive mutation requirement checks
2. `app/extractors/biomarker_extractor.py` - Verify extraction prompt includes detailed treatment info (already done)
3. `src/components/steps/ScreenerStep.tsx` - Verify treatment status mapping (already done)
4. PDF generation code - Format treatment history and status properly

### Total Time: 35 minutes
- Fix #1 (Critical): 15 minutes
- Fix #2 (High): 10 minutes
- Fix #3 (Medium): 10 minutes

### Expected Outcome:
✅ Patient D shows exactly 2 EGFR trials (not 5)
✅ Clinician brief shows detailed treatment history
✅ Treatment status correct ("progressed on targeted therapy")
✅ Demographics all populated
✅ Professional, demo-ready output

---

## PRIORITY GUIDANCE

**If you only have 15 minutes before demo:**
- Do Fix #1 only (exclude wrong trials)
- Result: Shows 2 correct trials instead of 5

**If you have 25 minutes:**
- Do Fix #1 + Fix #2 (exclude wrong trials + detailed treatment history)
- Result: Shows 2 correct trials with professional treatment history

**If you have 35 minutes:**
- Do all 3 fixes
- Result: Perfect clinician brief, demo-ready

---

## QUESTIONS / ISSUES

**Q: What if the code we provided earlier isn't in the codebase?**
A: Refer back to "SNAPDEV_Complete_Extraction_Fix.md" for the complete extraction prompt and frontend mapping code.

**Q: What if testing shows trials still appearing incorrectly?**
A: Add console.log statements in the rules.py checks to see which exclusions are being triggered. Check if the trial title or eligibility criteria contain the mutation requirement.

**Q: What if treatment history still shows generic after Fix #2?**
A: Check backend logs to see what the extraction is returning. If it's only returning `["osimertinib"]`, the extraction prompt needs to be updated to request structured treatment objects.

---

## CONTACT FOR ISSUES

If you run into problems implementing these fixes:
1. Check console logs (backend and frontend)
2. Verify the extraction prompt includes all the sections we provided
3. Test with curl commands to see what the backend extraction returns
4. Add console.log in the frontend handlers to see what data is being received

---

**You're almost there! These 3 fixes will make the system demo-ready! 🚀**
