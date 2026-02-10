# SNAPDEV IMPLEMENTATION: Complete Document Extraction Fix

## OBJECTIVE
Fix AI extraction to capture ALL clinical information present in uploaded documents:
- Age, Sex, ECOG Performance Status
- Detailed prior treatment history
- Current treatment status (treatment journey)

## PROBLEM
Documents contain complete patient information, but extraction only captures biomarkers.

**Evidence:**
- Upload patient_d files → Age: Not provided, Sex: Not provided, ECOG: Not provided
- But documents clearly state: "Age: 58 years", "Sex: Male", "ECOG: 1"

## SOLUTION OVERVIEW
Update 3 components:
1. **Backend extraction prompt** - Tell Claude what to extract (15 min)
2. **Frontend data mapping** - Put extracted data into form fields (10 min)  
3. **PDF generation** - Display demographics in clinician brief (5 min)

**Total time: 30 minutes**

---

# PART 1: BACKEND - Update Extraction Prompt

## File to Edit
`app/extractors/biomarker_extractor.py`

## What to Change
Replace the `_build_extraction_prompt` method completely.

## Complete Replacement Code

```python
def _build_extraction_prompt(self, report_text: str, cancer_type: Optional[str]) -> str:
    """Build the extraction prompt based on cancer type."""
    
    base_prompt = f"""You are a medical AI assistant that extracts comprehensive clinical information from pathology reports and oncology notes.

Extract ALL the following information from this medical document and return ONLY a valid JSON object (no markdown, no preamble, no backticks).

Document text:
{report_text}

"""
    
    if cancer_type and cancer_type.lower() == 'breast':
        base_prompt += """
EXTRACT ALL OF THE FOLLOWING for BREAST CANCER:

Return JSON in this EXACT format:
{{
  "cancer_type": "breast",
  
  "patient_demographics": {{
    "age": number (e.g., 58) or null,
    "sex": "female" / "male" / "unknown",
    "date_of_birth": "MM/DD/YYYY" or null
  }},
  
  "clinical_status": {{
    "stage": "I" / "II" / "III" / "IV" / "unknown",
    "ecog": "0" / "1" / "2" / "3" / "4" / "unknown",
    "ecog_description": "Fully active" / "Ambulatory" / etc or null,
    "histology": "ductal" / "lobular" / "mixed" / "unknown",
    "grade": "1" / "2" / "3" / "unknown"
  }},
  
  "treatment_status": {{
    "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
    "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
    "prior_regimen": "palbociclib + letrozole" / "trastuzumab + pertuzumab" / etc or null,
    "duration_months": number or null,
    "response": "complete response" / "partial response" / "stable disease" / "progression" / null
  }},
  
  "biomarkers": {{
    "ER": {{
      "status": "present" / "absent" / "unknown",
      "percentage": number (0-100) or null,
      "confidence": "high" / "medium" / "low"
    }},
    "PR": {{
      "status": "present" / "absent" / "unknown",
      "percentage": number (0-100) or null,
      "confidence": "high" / "medium" / "low"
    }},
    "HER2": {{
      "status": "positive" / "negative" / "low" / "equivocal" / "unknown",
      "ihc_score": "0" / "1+" / "2+" / "3+" / null,
      "fish_result": "amplified" / "not amplified" / null,
      "confidence": "high" / "medium" / "low"
    }},
    "Ki67_percentage": {{
      "value": number (0-100) or null,
      "confidence": "high" / "medium" / "low"
    }}
  }},
  
  "prior_treatments": [
    {{
      "treatment": "surgery" / "lumpectomy" / "paclitaxel" / etc,
      "date": "YYYY-MM" or null,
      "duration": "X months" / "X cycles" or null,
      "response": "complete response" / "partial response" / "stable disease" / "progression" / null,
      "details": "Brief description" or null
    }}
  ]
}}

CRITICAL EXTRACTION RULES:

1. AGE: Search for "Age:", "years old", "yo", "y/o", DOB (calculate age if DOB given)
   Examples: "Age: 61 years", "(Age: 61)", "61-year-old female", "DOB: 03/15/1964 (Age: 61)"

2. SEX: Search for "Sex:", "Male", "Female", "M:", "F:", "Mr.", "Ms.", "Mrs.", gender pronouns
   Examples: "Sex: Female", "Ms. [Patient]", "she reports", "his diagnosis"

3. ECOG: Search for "ECOG", "Performance Status", "PS", or descriptive phrases
   - "Fully active" / "no restrictions" → ECOG 0
   - "Ambulatory" / "light work" / "capable of" → ECOG 1  
   - "Self-care" / "unable to work" → ECOG 2
   - "Limited self-care" → ECOG 3
   - "Bedridden" / "completely disabled" → ECOG 4

4. TREATMENT STATUS: Look for progression/response keywords
   - "newly diagnosed" + "no prior therapy" → newly_diagnosed
   - "progression on [drug]" → Check drug type (targeted vs chemo vs immunotherapy)
   - "progressed after [therapy]" → Check therapy type
   - "second-line" / "third-line" → Indicates prior progression
   
   Drug classification:
   - Targeted: palbociclib, ribociclib, abemaciclib, trastuzumab, pertuzumab, CDK4/6 inhibitors
   - Chemo: paclitaxel, doxorubicin, cyclophosphamide, docetaxel
   - Immunotherapy: pembrolizumab, nivolumab, atezolizumab

5. PRIOR TREATMENTS: Search ENTIRE document for treatment mentions
   - Surgery: "surgery", "lumpectomy", "mastectomy", "resection"
   - Chemotherapy: "chemotherapy", drug names (paclitaxel, doxorubicin, etc.)
   - Radiation: "radiation", "radiotherapy", "whole breast radiation"
   - Hormone therapy: "tamoxifen", "letrozole", "anastrozole", "palbociclib"
   - Targeted therapy: "trastuzumab", "pertuzumab", "T-DM1"
   
6. Extract from ANYWHERE in document - header, body, history sections, treatment notes

7. If field not found, set to "unknown" or null (don't omit)
"""
    
    elif cancer_type and cancer_type.lower() == 'lung':
        base_prompt += """
EXTRACT ALL OF THE FOLLOWING for LUNG CANCER:

Return JSON in this EXACT format:
{{
  "cancer_type": "lung",
  
  "patient_demographics": {{
    "age": number (e.g., 58) or null,
    "sex": "female" / "male" / "unknown",
    "date_of_birth": "MM/DD/YYYY" or null
  }},
  
  "clinical_status": {{
    "stage": "I" / "II" / "III" / "IV" / "IVA" / "IVB" / "unknown",
    "ecog": "0" / "1" / "2" / "3" / "4" / "unknown",
    "ecog_description": "Fully active" / "Ambulatory" / etc or null,
    "histology": "adenocarcinoma" / "squamous cell" / "small cell" / "unknown",
    "metastases_sites": ["brain", "bone", "liver", "adrenal"] or []
  }},
  
  "treatment_status": {{
    "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
    "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
    "prior_regimen": "osimertinib" / "carboplatin + pemetrexed" / etc or null,
    "duration_months": number or null,
    "response": "complete response" / "partial response" / "stable disease" / "progression" / null
  }},
  
  "biomarkers": {{
    "EGFR": {{
      "status": "present" / "absent" / "unknown",
      "mutation": "Exon 19 deletion" / "L858R" / "T790M" / etc or null,
      "vaf": number or null,
      "confidence": "high" / "medium" / "low"
    }},
    "ALK": {{
      "status": "present" / "absent" / "unknown",
      "confidence": "high" / "medium" / "low"
    }},
    "ROS1": {{
      "status": "present" / "absent" / "unknown",
      "confidence": "high" / "medium" / "low"
    }},
    "BRAF": {{
      "status": "present" / "absent" / "unknown",
      "mutation": "V600E" / etc or null,
      "confidence": "high" / "medium" / "low"
    }},
    "KRAS_G12C": {{
      "status": "present" / "absent" / "unknown",
      "confidence": "high" / "medium" / "low"
    }},
    "MET": {{
      "status": "present" / "absent" / "unknown",
      "alteration": "exon 14 skipping" / "amplification" / null,
      "confidence": "high" / "medium" / "low"
    }},
    "RET": {{
      "status": "present" / "absent" / "unknown",
      "fusion": "KIF5B-RET" / etc or null,
      "confidence": "high" / "medium" / "low"
    }},
    "NTRK": {{
      "status": "present" / "absent" / "unknown",
      "fusion": "NTRK1" / "NTRK2" / "NTRK3" / null,
      "confidence": "high" / "medium" / "low"
    }},
    "PD_L1": {{
      "percentage": number (0-100) or null,
      "expression": "high" / "low" / "unknown",
      "tps": number or null,
      "confidence": "high" / "medium" / "low"
    }}
  }},
  
  "prior_treatments": [
    {{
      "treatment": "surgery" / "lobectomy" / "osimertinib" / "carboplatin" / etc,
      "date": "YYYY-MM" or null,
      "duration": "X months" / "X weeks" / "X cycles" or null,
      "response": "complete response" / "partial response" / "stable disease" / "progression" / null,
      "site": "brain" / "lung" / etc or null,
      "details": "Brief description" or null
    }}
  ]
}}

CRITICAL EXTRACTION RULES:

1. AGE: Search for "Age:", "years old", "yo", "y/o", DOB (calculate age if DOB given)

2. SEX: Search for "Sex:", "Male", "Female", "M:", "F:", "Mr.", "Ms.", gender pronouns

3. ECOG: Search for "ECOG", "Performance Status", "PS", or descriptions
   - "Fully active" → ECOG 0
   - "Ambulatory" / "light work" / "capable of" → ECOG 1
   - "Self-care" / "unable to work" → ECOG 2
   - "Limited self-care" → ECOG 3
   - "Bedridden" → ECOG 4

4. TREATMENT STATUS: Look for progression/response keywords
   - "newly diagnosed" + "no prior therapy" → newly_diagnosed
   - "progression on [drug]" → Check drug type
   - Targeted drugs: osimertinib, erlotinib, gefitinib, alectinib, crizotinib
   - Chemo drugs: carboplatin, cisplatin, pemetrexed, paclitaxel, etoposide
   - Immunotherapy: pembrolizumab, nivolumab, atezolizumab, durvalumab

5. PRIOR TREATMENTS: Search entire document
   - Surgery: "surgery", "lobectomy", "pneumonectomy", "resection"
   - Chemotherapy: drug names (carboplatin, pemetrexed, etc.)
   - Targeted therapy: "osimertinib", "Tagrisso", "erlotinib", "alectinib", etc.
   - Radiation: "radiation", "SRS", "stereotactic radiosurgery", "SBRT"
   - Immunotherapy: "pembrolizumab", "Keytruda", "nivolumab", "Opdivo"

6. METASTASES: Look for "brain metastases", "bone metastases", "liver metastases"

7. Extract from ANYWHERE - header, body, history, treatment sections

8. If field not found, set to "unknown" or null or []
"""
    
    else:
        base_prompt += """
EXTRACT ALL clinical information available:

Return JSON:
{{
  "cancer_type": "breast" / "lung" / "unknown",
  "patient_demographics": {{"age": number or null, "sex": "male"/"female"/"unknown"}},
  "clinical_status": {{"stage": "I-IV"/"unknown", "ecog": "0-4"/"unknown"}},
  "treatment_status": {{"current_status": "unknown"}},
  "biomarkers": {{}},
  "prior_treatments": []
}}
"""
    
    return base_prompt
```

---

# PART 2: FRONTEND - Update Data Mapping

## File to Edit
`src/components/steps/ScreenerStep.tsx`

## What to Change
Update both `handlePathologyUpload` and `handleOncologyUpload` functions.

## Code to Add/Update

### Handler 1: Pathology Upload

```typescript
const handlePathologyUpload = async (extractedData: any) => {
  console.log('Pathology extracted data:', extractedData);
  
  setPatientData(prev => ({
    ...prev,
    
    // DEMOGRAPHICS (NEW!)
    age: extractedData.patient_demographics?.age || prev.age,
    sex: extractedData.patient_demographics?.sex || prev.sex,
    dateOfBirth: extractedData.patient_demographics?.date_of_birth || prev.dateOfBirth,
    
    // CLINICAL STATUS (NEW!)
    cancerType: extractedData.cancer_type || prev.cancerType,
    stage: extractedData.clinical_status?.stage || prev.stage,
    ecog: extractedData.clinical_status?.ecog || prev.ecog,
    histology: extractedData.clinical_status?.histology || prev.histology,
    grade: extractedData.clinical_status?.grade || prev.grade,
    
    // BIOMARKERS (existing, keep as is)
    biomarkers: {
      ...prev.biomarkers,
      ...mapExtractedBiomarkers(extractedData.biomarkers, extractedData.cancer_type)
    },
  }));
  
  toast.success('✓ Demographics and biomarkers extracted from pathology report', {
    duration: 3000
  });
};
```

### Handler 2: Oncology Upload

```typescript
const handleOncologyUpload = async (extractedData: any) => {
  console.log('Oncology note extracted data:', extractedData);
  
  // 1. DEMOGRAPHICS (might be in oncology note too)
  const demographicUpdates = {};
  if (extractedData.patient_demographics?.age) {
    demographicUpdates.age = extractedData.patient_demographics.age;
  }
  if (extractedData.patient_demographics?.sex) {
    demographicUpdates.sex = extractedData.patient_demographics.sex;
  }
  
  // 2. CLINICAL STATUS (ECOG, stage, etc.)
  const clinicalUpdates = {};
  if (extractedData.clinical_status?.stage) {
    clinicalUpdates.stage = extractedData.clinical_status.stage;
  }
  if (extractedData.clinical_status?.ecog) {
    clinicalUpdates.ecog = extractedData.clinical_status.ecog;
  }
  if (extractedData.clinical_status?.metastases_sites) {
    clinicalUpdates.metastasesSites = extractedData.clinical_status.metastases_sites;
  }
  
  // 3. TREATMENT STATUS (NEW!)
  const treatmentStatusUpdates = {};
  if (extractedData.treatment_status) {
    const status = extractedData.treatment_status.current_status;
    
    if (status === "newly_diagnosed") {
      treatmentStatusUpdates.currentTreatmentStatus = "first_line";
    } else if (status === "progressed_on_targeted") {
      treatmentStatusUpdates.currentTreatmentStatus = "progressed_targeted";
    } else if (status === "progressed_on_chemo" || status === "progressed_on_immunotherapy") {
      treatmentStatusUpdates.currentTreatmentStatus = "progressed_chemo_immuno";
    }
    
    treatmentStatusUpdates.priorRegimenDetails = {
      regimen: extractedData.treatment_status.prior_regimen,
      duration: extractedData.treatment_status.duration_months,
      response: extractedData.treatment_status.response,
    };
  }
  
  // 4. PRIOR TREATMENTS (map to categories)
  const treatments = extractedData.prior_treatments || [];
  
  const treatmentCategories = {
    surgery: treatments.some(t => 
      t.treatment.toLowerCase().includes('surgery') ||
      t.treatment.toLowerCase().includes('lobectomy') ||
      t.treatment.toLowerCase().includes('lumpectomy') ||
      t.treatment.toLowerCase().includes('mastectomy') ||
      t.treatment.toLowerCase().includes('resection')
    ),
    
    chemotherapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('chemotherapy') ||
      t.treatment.toLowerCase().includes('carboplatin') ||
      t.treatment.toLowerCase().includes('cisplatin') ||
      t.treatment.toLowerCase().includes('pemetrexed') ||
      t.treatment.toLowerCase().includes('paclitaxel') ||
      t.treatment.toLowerCase().includes('docetaxel') ||
      t.treatment.toLowerCase().includes('doxorubicin') ||
      t.treatment.toLowerCase().includes('cyclophosphamide')
    ),
    
    radiation: treatments.some(t =>
      t.treatment.toLowerCase().includes('radiation') ||
      t.treatment.toLowerCase().includes('radiotherapy') ||
      t.treatment.toLowerCase().includes('srs') ||
      t.treatment.toLowerCase().includes('sbrt') ||
      t.treatment.toLowerCase().includes('radiosurgery')
    ),
    
    targeted_therapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('targeted') ||
      t.treatment.toLowerCase().includes('osimertinib') ||
      t.treatment.toLowerCase().includes('tagrisso') ||
      t.treatment.toLowerCase().includes('erlotinib') ||
      t.treatment.toLowerCase().includes('trastuzumab') ||
      t.treatment.toLowerCase().includes('pertuzumab') ||
      t.treatment.toLowerCase().includes('palbociclib') ||
      t.treatment.toLowerCase().includes('ribociclib') ||
      t.treatment.toLowerCase().includes('cdk4/6')
    ),
    
    immunotherapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('immunotherapy') ||
      t.treatment.toLowerCase().includes('pembrolizumab') ||
      t.treatment.toLowerCase().includes('keytruda') ||
      t.treatment.toLowerCase().includes('nivolumab') ||
      t.treatment.toLowerCase().includes('opdivo')
    ),
    
    hormone_therapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('hormone') ||
      t.treatment.toLowerCase().includes('endocrine') ||
      t.treatment.toLowerCase().includes('tamoxifen') ||
      t.treatment.toLowerCase().includes('letrozole') ||
      t.treatment.toLowerCase().includes('anastrozole')
    ),
  };
  
  // 5. UPDATE PATIENT DATA
  setPatientData(prev => ({
    ...prev,
    ...demographicUpdates,
    ...clinicalUpdates,
    ...treatmentStatusUpdates,
    
    // Treatment categories (for checkboxes)
    ...treatmentCategories,
    
    // Detailed treatment history (for clinician brief)
    treatmentHistory: treatments,
    
    // Raw treatment list (for matching)
    priorTreatmentTypes: treatments.map(t => t.treatment),
  }));
  
  // 6. SHOW SUCCESS MESSAGE
  const treatmentCount = Object.values(treatmentCategories).filter(Boolean).length;
  if (treatmentCount > 0) {
    toast.success(
      `✓ Extracted ${treatmentCount} treatment categories and clinical status`,
      { duration: 3000 }
    );
  } else {
    toast.success('✓ Clinical status extracted from oncology note', {
      duration: 3000
    });
  }
};
```

---

# PART 3: PDF GENERATION - Update Clinician Brief

## File to Edit
Wherever you generate the clinician brief PDF (probably in results/matching component)

## What to Add

### Helper Function

```typescript
const getEcogDescription = (ecog: string): string => {
  const descriptions = {
    "0": "Fully active",
    "1": "Symptomatic, ambulatory",
    "2": "Symptomatic, in bed <50% of day",
    "3": "Symptomatic, in bed >50% of day",
    "4": "Bedridden",
  };
  return descriptions[ecog] || "";
};

const formatTreatmentHistory = (treatments: any[]): string => {
  if (!treatments || treatments.length === 0) {
    return "No prior treatments documented";
  }
  
  return treatments.map((t, i) => {
    let line = `${i + 1}. ${t.treatment}`;
    if (t.date) line += ` (${t.date})`;
    if (t.duration) line += ` - Duration: ${t.duration}`;
    if (t.response) line += ` - Response: ${t.response}`;
    if (t.details) line += ` - ${t.details}`;
    return line;
  }).join('\n');
};
```

### Update Demographics Section

```typescript
const generateClinicianBrief = (patientData, matchedTrials) => {
  return {
    // PATIENT DEMOGRAPHICS (UPDATED!)
    demographics: {
      age: patientData.age ? `${patientData.age} years` : "Not provided",
      sex: patientData.sex 
        ? patientData.sex.charAt(0).toUpperCase() + patientData.sex.slice(1) 
        : "Not provided",
      ecog: patientData.ecog
        ? `${patientData.ecog} (${getEcogDescription(patientData.ecog)})`
        : "Not provided",
      diagnosis: `${patientData.cancerType} Stage ${patientData.stage || 'unknown'}`,
    },
    
    // TREATMENT HISTORY (UPDATED!)
    treatmentHistory: formatTreatmentHistory(patientData.treatmentHistory),
    
    // ... rest of brief (biomarkers, trials, etc.)
  };
};
```

---

# TESTING CHECKLIST

After implementing all 3 parts, test with each patient:

## Test 1: Patient A (Breast HER2-low)
```bash
# Backend test
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_a_breast_pathology.txt" \
  -F "cancer_type=breast"

# Expected: age: 61, sex: "female", ER+, PR+, HER2 low
```

**Frontend test:**
1. Upload patient_a_breast_pathology.txt
2. Check form shows: Age: 61, Sex: Female
3. Upload patient_a_oncology_note.txt  
4. Check form shows: ECOG: 1, Prior treatments populated
5. Click "Find Trials"
6. Download clinician brief
7. Verify PDF shows: Age: 61 years, Sex: Female, ECOG: 1 (Symptomatic, ambulatory)

---

## Test 2: Patient B (Breast TNBC)
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_b_tnbc_pathology.txt" \
  -F "cancer_type=breast"

# Expected: age: 56, sex: "female", ER-, PR-, HER2 0, Ki-67 78%
```

**Frontend test:**
1. Upload pathology → Age: 56, Sex: Female extracted
2. Upload oncology note → ECOG: 1, Prior treatments: [] (none - treatment naïve)
3. Current Treatment Status: Auto-selects "First Line (Newly Diagnosed)"
4. Clinician brief shows "No prior treatments documented"

---

## Test 3: Patient C (Breast HER2+)
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_c_her2pos_oncology_note.txt" \
  -F "cancer_type=breast"

# Expected: Extensive prior treatments extracted
```

**Frontend test:**
1. Upload files → Demographics + extensive treatment history extracted
2. Current Treatment Status: Auto-selects "Progressed on Targeted Therapy"
3. Clinician brief shows detailed treatment history with dates and responses

---

## Test 4: Patient D (Lung EGFR+)
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_d_lung_molecular.txt" \
  -F "cancer_type=lung"

# Expected: age: 58, sex: "male", EGFR exon 19 del
```

**Frontend test:**
1. Upload pathology → Age: 58, Sex: Male, EGFR+ extracted
2. Upload oncology → ECOG: 1, Osimertinib + SRS extracted
3. Current Treatment Status: Auto-selects "Progressed on Targeted Therapy"
4. Clinician brief complete with all demographics

---

# SUCCESS CRITERIA

✅ Upload pathology report → Age, Sex extracted
✅ Upload oncology note → ECOG, treatment history extracted
✅ Prior treatment checkboxes auto-populate correctly
✅ Current Treatment Status auto-selects when possible
✅ Clinician brief PDF shows:
   - Age: X years (not "Not provided")
   - Sex: Male/Female (not "Not provided")
   - ECOG: X (Description) (not "Not provided")
   - Detailed treatment history with dates/responses

✅ Works for all 4 test patients (A, B, C, D)
✅ Works for both breast and lung cancer
✅ Handles treatment-naïve patients correctly
✅ Handles extensively pre-treated patients correctly

---

# ESTIMATED TIME

- Backend (Part 1): 15 minutes (copy/paste + test)
- Frontend (Part 2): 10 minutes (copy/paste + verify field names)
- PDF (Part 3): 5 minutes (add helper functions)

**Total: 30 minutes**

---

# FILES TO PROVIDE TO SNAPDEV

Include these test files so Snapdev can verify:
1. patient_a_breast_pathology.txt
2. patient_a_oncology_note.txt
3. patient_b_tnbc_pathology.txt
4. patient_b_tnbc_oncology_note.txt
5. patient_c_her2pos_pathology.txt
6. patient_c_her2pos_oncology_note.txt
7. patient_d_lung_molecular.txt
8. patient_d_oncology_note.txt

---

# TROUBLESHOOTING

**If demographics don't extract:**
- Check backend logs - is extraction returning the data?
- Add console.log in frontend to see what's being received
- Verify field names match between extraction and form

**If treatment checkboxes don't populate:**
- Check field name mapping (surgery vs hasSurgery vs priorSurgery)
- Verify form state is updating (React DevTools)
- Check that treatment detection keywords are working

**If clinician brief shows "Not provided":**
- Verify patientData has the demographics fields
- Check PDF generation is reading from correct fields
- Test with console.log before PDF generation

---

# PRIORITY: CRITICAL

This affects:
- Demo credibility (blank demographics look unprofessional)
- Trial matching accuracy (ECOG in every trial)
- Clinical sophistication demonstration
- Investor/advisor perception

**Fix before Friday demo!**
