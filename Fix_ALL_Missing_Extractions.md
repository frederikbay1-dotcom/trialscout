# COMPREHENSIVE FIX: Extract Age, Sex, ECOG, and Prior Treatments

## What's Present in Documents But NOT Being Extracted:

### **Patient D Pathology Report Contains:**
```
Date of Birth: 06/22/1967 (Age: 58 years)  ✓
Sex: Male                                   ✓
Clinical indication: "58-year-old male..."  ✓
```

### **Patient D Oncology Note Contains:**
```
Age: 58                                     ✓
ECOG PERFORMANCE STATUS: 1                  ✓
Performance Status: ECOG 1                  ✓

Prior Treatments:
- Started osimertinib (Tagrisso) 80 mg daily  ✓
- Brain: Received stereotactic radiosurgery   ✓
- Dexamethasone 2 mg BID                      ✓
```

### **What Shows in Clinician Brief:**
```
Age: Not provided          ❌
Sex: Not provided          ❌
ECOG: Not provided         ❌
Prior Treatments: Vague    ❌
```

---

## ROOT CAUSE

Your extraction prompt doesn't ask Claude to extract these fields explicitly, so Claude focuses only on biomarkers.

---

## COMPLETE FIX (30 Minutes Total)

### PART 1: Update Backend Extraction Prompt (15 min)

**File:** `app/extractors/biomarker_extractor.py`

**Find the `_build_extraction_prompt` method and completely replace it:**

```python
def _build_extraction_prompt(self, report_text: str, cancer_type: Optional[str]) -> str:
    """Build the extraction prompt based on cancer type."""
    
    # Base instruction
    base_prompt = f"""You are a medical AI assistant that extracts comprehensive clinical information from pathology reports and oncology notes.

Extract ALL the following information from this medical document and return ONLY a valid JSON object (no markdown, no preamble, no backticks).

Document text:
{report_text}

"""
    
    # BREAST CANCER
    if cancer_type and cancer_type.lower() == 'breast':
        base_prompt += """
EXTRACT ALL OF THE FOLLOWING for BREAST CANCER:

Return JSON in this EXACT format:
{
  "cancer_type": "breast",
  
  "patient_demographics": {
    "age": number (e.g., 58) or null,
    "sex": "female" / "male" / "unknown",
    "date_of_birth": "MM/DD/YYYY" or null
  },
  
  "clinical_status": {
    "stage": "I" / "II" / "III" / "IV" / "unknown",
    "ecog": "0" / "1" / "2" / "3" / "4" / "unknown",
    "ecog_description": "Fully active" / "Ambulatory, light work" / etc or null,
    "histology": "ductal" / "lobular" / "mixed" / "unknown",
    "grade": "1" / "2" / "3" / "unknown"
  },
  
  "biomarkers": {
    "ER": {
      "status": "present" / "absent" / "unknown",
      "percentage": number (0-100) or null,
      "confidence": "high" / "medium" / "low"
    },
    "PR": {
      "status": "present" / "absent" / "unknown",
      "percentage": number (0-100) or null,
      "confidence": "high" / "medium" / "low"
    },
    "HER2": {
      "status": "positive" / "negative" / "low" / "equivocal" / "unknown",
      "ihc_score": "0" / "1+" / "2+" / "3+" / null,
      "fish_result": "amplified" / "not amplified" / null,
      "confidence": "high" / "medium" / "low"
    },
    "Ki67_percentage": {
      "value": number (0-100) or null,
      "confidence": "high" / "medium" / "low"
    }
  },
  
  "prior_treatments": [
    {
      "treatment": "surgery" / "lumpectomy" / "mastectomy" / etc,
      "date": "YYYY-MM" or null,
      "details": "Brief description" or null
    },
    {
      "treatment": "chemotherapy" / "paclitaxel" / "doxorubicin" / etc,
      "date": "YYYY-MM" or null,
      "duration": "X months" or null,
      "response": "complete response" / "partial response" / "stable" / "progression" / null
    }
  ]
}

CRITICAL EXTRACTION RULES:
1. AGE: Search for "Age:", "years old", "yo", "y/o", DOB (calculate age if DOB given)
2. SEX: Search for "Sex:", "Male", "Female", "M:", "F:", "Mr.", "Ms.", "Mrs.", gender pronouns
3. ECOG: Search for "ECOG", "Performance Status", "PS", "Karnofsky" (convert to ECOG 0-4)
   - "Fully active" → ECOG 0
   - "Ambulatory" or "light work" → ECOG 1
   - "Self-care only" → ECOG 2
   - "Limited self-care" → ECOG 3
   - "Bedridden" → ECOG 4
4. PRIOR TREATMENTS: Search ENTIRE document for:
   - "surgery", "lumpectomy", "mastectomy", "resection"
   - "chemotherapy", drug names (paclitaxel, doxorubicin, etc.)
   - "radiation", "radiotherapy"
   - "hormone therapy", "tamoxifen", "letrozole", "palbociclib"
   - "targeted therapy", "trastuzumab", "pertuzumab"
   - Extract as structured list with dates and details when available
5. If field not found, set to "unknown" or null (don't omit)
6. Extract from ANYWHERE in document - header, body, treatment history sections
"""
    
    # LUNG CANCER
    elif cancer_type and cancer_type.lower() == 'lung':
        base_prompt += """
EXTRACT ALL OF THE FOLLOWING for LUNG CANCER:

Return JSON in this EXACT format:
{
  "cancer_type": "lung",
  
  "patient_demographics": {
    "age": number (e.g., 58) or null,
    "sex": "female" / "male" / "unknown",
    "date_of_birth": "MM/DD/YYYY" or null
  },
  
  "clinical_status": {
    "stage": "I" / "II" / "III" / "IV" / "IVA" / "IVB" / "unknown",
    "ecog": "0" / "1" / "2" / "3" / "4" / "unknown",
    "ecog_description": "Fully active" / "Ambulatory" / etc or null,
    "histology": "adenocarcinoma" / "squamous cell" / "small cell" / "unknown",
    "metastases_sites": ["brain", "bone", "liver", "adrenal"] or []
  },
  
  "biomarkers": {
    "EGFR": {
      "status": "present" / "absent" / "unknown",
      "mutation": "Exon 19 deletion" / "L858R" / "T790M" / etc or null,
      "vaf": number or null,
      "confidence": "high" / "medium" / "low"
    },
    "ALK": {
      "status": "present" / "absent" / "unknown",
      "confidence": "high" / "medium" / "low"
    },
    "ROS1": {
      "status": "present" / "absent" / "unknown",
      "confidence": "high" / "medium" / "low"
    },
    "BRAF": {
      "status": "present" / "absent" / "unknown",
      "mutation": "V600E" / etc or null,
      "confidence": "high" / "medium" / "low"
    },
    "KRAS_G12C": {
      "status": "present" / "absent" / "unknown",
      "confidence": "high" / "medium" / "low"
    },
    "MET": {
      "status": "present" / "absent" / "unknown",
      "alteration": "exon 14 skipping" / "amplification" / null,
      "confidence": "high" / "medium" / "low"
    },
    "RET": {
      "status": "present" / "absent" / "unknown",
      "fusion": "KIF5B-RET" / etc or null,
      "confidence": "high" / "medium" / "low"
    },
    "NTRK": {
      "status": "present" / "absent" / "unknown",
      "fusion": "NTRK1" / "NTRK2" / "NTRK3" / null,
      "confidence": "high" / "medium" / "low"
    },
    "PD_L1": {
      "percentage": number (0-100) or null,
      "expression": "high" / "low" / "unknown",
      "tps": number or null,
      "confidence": "high" / "medium" / "low"
    }
  },
  
  "prior_treatments": [
    {
      "treatment": "surgery" / "lobectomy" / "pneumonectomy" / etc,
      "date": "YYYY-MM" or null,
      "details": "Brief description" or null
    },
    {
      "treatment": "chemotherapy" / "carboplatin" / "pemetrexed" / etc,
      "date": "YYYY-MM" or null,
      "duration": "X cycles" or "X months" or null,
      "response": "complete response" / "partial response" / "stable" / "progression" / null
    },
    {
      "treatment": "targeted_therapy" / "osimertinib" / "erlotinib" / etc,
      "date": "YYYY-MM" or null,
      "duration": "X months" or null,
      "response": "complete response" / "partial response" / "stable" / "progression" / null
    },
    {
      "treatment": "radiation" / "stereotactic radiosurgery" / etc,
      "date": "YYYY-MM" or null,
      "site": "brain" / "lung" / etc or null
    }
  ]
}

CRITICAL EXTRACTION RULES:
1. AGE: Search for "Age:", "years old", "yo", "y/o", DOB (calculate age if DOB given)
2. SEX: Search for "Sex:", "Male", "Female", "M:", "F:", "Mr.", "Ms.", gender pronouns
3. ECOG: Search for "ECOG", "Performance Status", "PS", descriptions:
   - "Fully active" → ECOG 0
   - "Ambulatory" or "light work" or "capable of" → ECOG 1
   - "Self-care" or "unable to work" → ECOG 2
   - "Limited self-care" → ECOG 3
   - "Bedridden" or "completely disabled" → ECOG 4
4. PRIOR TREATMENTS: Search ENTIRE document for:
   - "surgery", "lobectomy", "pneumonectomy", "resection", "wedge resection"
   - "chemotherapy", drug names (carboplatin, cisplatin, pemetrexed, etoposide, etc.)
   - "targeted therapy", "osimertinib", "Tagrisso", "erlotinib", "Tarceva", "gefitinib", "alectinib", "crizotinib"
   - "radiation", "radiotherapy", "SRS", "stereotactic radiosurgery", "SBRT"
   - "immunotherapy", "pembrolizumab", "Keytruda", "nivolumab", "Opdivo", "atezolizumab"
   - Extract with dates, duration, response when mentioned
   - Create structured list with as much detail as available
5. METASTASES: Look for "brain metastases", "bone metastases", "liver metastases", etc.
6. If field not found, set to "unknown" or null or [] (don't omit)
7. Extract from ANYWHERE in document - header, body, history sections, treatment notes
8. Pay special attention to "HISTORY", "PRIOR TREATMENT", "ONCOLOGIC HISTORY" sections
"""
    
    else:
        # Generic extraction if cancer type unknown
        base_prompt += """
EXTRACT ALL clinical information available:

Return JSON in format:
{
  "cancer_type": "breast" / "lung" / "unknown",
  "patient_demographics": {"age": number or null, "sex": "male"/"female"/"unknown"},
  "clinical_status": {"stage": "I"/"II"/"III"/"IV"/"unknown", "ecog": "0-4"/"unknown"},
  "biomarkers": {},
  "prior_treatments": []
}
"""
    
    return base_prompt
```

---

### PART 2: Update Frontend Mapping (10 min)

**File:** `src/components/steps/ScreenerStep.tsx`

**Update BOTH handlers:**

#### **Handler 1: Pathology Upload**
```typescript
const handlePathologyUpload = async (extractedData: any) => {
  console.log('Pathology extracted data:', extractedData);
  
  setPatientData(prev => ({
    ...prev,
    
    // Demographics from pathology report
    age: extractedData.patient_demographics?.age || prev.age,
    sex: extractedData.patient_demographics?.sex || prev.sex,
    dateOfBirth: extractedData.patient_demographics?.date_of_birth || prev.dateOfBirth,
    
    // Clinical status
    cancerType: extractedData.cancer_type || prev.cancerType,
    stage: extractedData.clinical_status?.stage || prev.stage,
    ecog: extractedData.clinical_status?.ecog || prev.ecog,
    histology: extractedData.clinical_status?.histology || prev.histology,
    
    // Biomarkers (use existing mapping function)
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

#### **Handler 2: Oncology Upload**
```typescript
const handleOncologyUpload = async (extractedData: any) => {
  console.log('Oncology note extracted data:', extractedData);
  
  // Update demographics (might have age/sex here too)
  const demographicUpdates = {};
  if (extractedData.patient_demographics?.age) {
    demographicUpdates.age = extractedData.patient_demographics.age;
  }
  if (extractedData.patient_demographics?.sex) {
    demographicUpdates.sex = extractedData.patient_demographics.sex;
  }
  
  // Update clinical status
  const clinicalUpdates = {};
  if (extractedData.clinical_status?.stage) {
    clinicalUpdates.stage = extractedData.clinical_status.stage;
  }
  if (extractedData.clinical_status?.ecog) {
    clinicalUpdates.ecog = extractedData.clinical_status.ecog;
  }
  
  // Process prior treatments into structured format
  const treatments = extractedData.prior_treatments || [];
  
  // Extract detailed treatment history
  const treatmentHistory = treatments.map(t => ({
    name: t.treatment,
    date: t.date,
    duration: t.duration,
    response: t.response,
    details: t.details
  }));
  
  // Map to treatment categories (for checkboxes)
  const treatmentCategories = {
    surgery: treatments.some(t => 
      t.treatment.toLowerCase().includes('surgery') ||
      t.treatment.toLowerCase().includes('lobectomy') ||
      t.treatment.toLowerCase().includes('resection') ||
      t.treatment.toLowerCase().includes('lumpectomy') ||
      t.treatment.toLowerCase().includes('mastectomy')
    ),
    
    chemotherapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('chemotherapy') ||
      t.treatment.toLowerCase().includes('carboplatin') ||
      t.treatment.toLowerCase().includes('cisplatin') ||
      t.treatment.toLowerCase().includes('pemetrexed') ||
      t.treatment.toLowerCase().includes('paclitaxel') ||
      t.treatment.toLowerCase().includes('docetaxel') ||
      t.treatment.toLowerCase().includes('etoposide') ||
      t.treatment.toLowerCase().includes('gemcitabine')
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
      t.treatment.toLowerCase().includes('tarceva') ||
      t.treatment.toLowerCase().includes('gefitinib') ||
      t.treatment.toLowerCase().includes('alectinib') ||
      t.treatment.toLowerCase().includes('crizotinib') ||
      t.treatment.toLowerCase().includes('trastuzumab') ||
      t.treatment.toLowerCase().includes('pertuzumab')
    ),
    
    immunotherapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('immunotherapy') ||
      t.treatment.toLowerCase().includes('pembrolizumab') ||
      t.treatment.toLowerCase().includes('keytruda') ||
      t.treatment.toLowerCase().includes('nivolumab') ||
      t.treatment.toLowerCase().includes('opdivo') ||
      t.treatment.toLowerCase().includes('atezolizumab')
    ),
    
    hormone_therapy: treatments.some(t =>
      t.treatment.toLowerCase().includes('hormone') ||
      t.treatment.toLowerCase().includes('endocrine') ||
      t.treatment.toLowerCase().includes('tamoxifen') ||
      t.treatment.toLowerCase().includes('letrozole') ||
      t.treatment.toLowerCase().includes('palbociclib')
    ),
  };
  
  // Update patient data
  setPatientData(prev => ({
    ...prev,
    ...demographicUpdates,
    ...clinicalUpdates,
    
    // Detailed treatment history (for clinician brief)
    treatmentHistory: treatmentHistory,
    
    // Treatment categories (for form checkboxes)
    ...treatmentCategories,
    
    // Raw treatment list (for matching)
    priorTreatmentTypes: treatments.map(t => t.treatment),
  }));
  
  // Show success message
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

### PART 3: Update Clinician Brief Generation (5 min)

**File:** Wherever PDF generation happens

**Update demographics section:**

```typescript
const generateClinicianBrief = (patientData, matchedTrials) => {
  // Helper function for ECOG description
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
  
  return {
    // Patient Demographics
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
    
    // Treatment History (detailed)
    treatmentHistory: patientData.treatmentHistory || [],
    
    // Or if you want formatted text:
    priorTreatmentsText: formatTreatmentHistory(patientData.treatmentHistory),
    
    // ... rest of brief
  };
};

// Helper to format treatment history
const formatTreatmentHistory = (treatments: any[]): string => {
  if (!treatments || treatments.length === 0) {
    return "No prior treatments documented";
  }
  
  return treatments.map((t, i) => {
    let line = `${i + 1}. ${t.name}`;
    if (t.date) line += ` (${t.date})`;
    if (t.duration) line += ` - ${t.duration}`;
    if (t.response) line += ` - ${t.response}`;
    return line;
  }).join('\n');
};
```

---

## Testing Checklist

### Test 1: Pathology Report Extraction
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_d_lung_molecular.txt" \
  -F "cancer_type=lung"
```

**Expected output:**
```json
{
  "patient_demographics": {
    "age": 58,
    "sex": "male",
    "date_of_birth": "06/22/1967"
  },
  "clinical_status": {
    "stage": "IV",
    "ecog": "unknown",
    "histology": "adenocarcinoma"
  },
  "biomarkers": {
    "EGFR": {
      "status": "present",
      "mutation": "Exon 19 deletion",
      "vaf": 38.4
    }
  },
  "prior_treatments": []
}
```

### Test 2: Oncology Note Extraction
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_d_oncology_note.txt" \
  -F "cancer_type=lung"
```

**Expected output:**
```json
{
  "patient_demographics": {
    "age": 58,
    "sex": "male"
  },
  "clinical_status": {
    "stage": "IV",
    "ecog": "1",
    "ecog_description": "ambulatory, capable of light work",
    "metastases_sites": ["brain", "bone"]
  },
  "prior_treatments": [
    {
      "treatment": "osimertinib",
      "date": "2024-12",
      "duration": "6 weeks",
      "response": "partial response"
    },
    {
      "treatment": "stereotactic radiosurgery",
      "date": "2024-12",
      "site": "brain"
    }
  ]
}
```

### Test 3: Complete Workflow
```
1. Upload patient_d_lung_molecular.txt
   → Age: 58, Sex: Male extracted
   → Biomarkers extracted
   
2. Upload patient_d_oncology_note.txt
   → ECOG: 1 extracted
   → Prior treatments: Osimertinib, SRS extracted
   → Treatment checkboxes populate
   
3. Click "Find Trials"
4. Download clinician brief
5. Check PDF shows:
   Age: 58 years ✓
   Sex: Male ✓
   ECOG: 1 (Symptomatic, ambulatory) ✓
   
   Treatment History:
   1. Osimertinib (2024-12) - 6 weeks - Partial response ✓
   2. Stereotactic radiosurgery (2024-12) - Brain ✓
```

---

## Priority: CRITICAL

**This affects:**
- Clinician brief (looks unprofessional)
- Trial matching accuracy (ECOG in every trial)
- Demo credibility (investors will notice)

**Time: 30 minutes**
**Impact: High**
**Fix before: Friday demo**

---

## Expected Result

**Before Fix:**
```
Patient Demographics:
Age: Not provided
Sex: Not provided
ECOG: Not provided

Prior Treatments:
- Surgery
- Targeted therapy (e.g., EGFR/ALK inhibitors)
```

**After Fix:**
```
Patient Demographics:
Age: 58 years
Sex: Male
ECOG Performance Status: 1 (Symptomatic, ambulatory)
Primary Diagnosis: NSCLC Stage IV

Prior Treatment History:
1. Osimertinib (December 2024) - 6 weeks duration - Partial response
2. Stereotactic radiosurgery (December 2024) - Brain metastases
3. Dexamethasone 2mg BID (December 2024-January 2025) - Supportive care
```

**Much more professional and actionable! 🎯**
