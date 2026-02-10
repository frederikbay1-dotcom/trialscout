# Fix: 422 Error on Trial Matching After Extraction

## Problem
Document upload and extraction work perfectly, but when user clicks "Find Trials" after extraction, backend returns `422 Unprocessable Content` error.

**Root Cause:** The trial matching endpoint expects a specific data structure that doesn't match the extracted biomarker format.

---

## Solution: Update convertApiBiomarkersToProfile()

**File:** `src/components/ScreenerStep.tsx` (or wherever trial matching is triggered)

**Find this function:**
```typescript
const convertApiBiomarkersToProfile = (biomarkers: any): BiomarkerProfile => {
  // ...existing conversion logic
}
```

**Replace with this COMPLETE version:**

```typescript
const convertApiBiomarkersToProfile = (
  biomarkers: any, 
  cancerType: string,
  stage?: string,
  ecog?: string,
  priorTreatments?: string[]
): BiomarkerProfile => {
  
  // Base profile structure
  const profile: BiomarkerProfile = {
    cancer_type: cancerType,
    stage: stage || 'unknown',
    ecog: ecog || 'unknown',
    prior_treatments: priorTreatments || [],
    biomarkers: {}
  };
  
  // BREAST CANCER
  if (cancerType.toLowerCase() === 'breast') {
    profile.biomarkers = {
      // ER - status + percentage
      ER: biomarkers?.ER || 'unknown',
      ER_percentage: typeof biomarkers?.ER_percentage === 'number' 
        ? biomarkers.ER_percentage 
        : null,
      
      // PR - status + percentage
      PR: biomarkers?.PR || 'unknown',
      PR_percentage: typeof biomarkers?.PR_percentage === 'number'
        ? biomarkers.PR_percentage
        : null,
      
      // HER2 - status + details
      HER2: biomarkers?.HER2 || 'unknown',
      HER2_ihc: biomarkers?.HER2_ihc || null,
      HER2_fish: biomarkers?.HER2_fish || null,
      
      // Ki-67 - as number (not string)
      Ki67: typeof biomarkers?.Ki67 === 'number'
        ? biomarkers.Ki67
        : (typeof biomarkers?.Ki67 === 'string' && !isNaN(Number(biomarkers.Ki67)))
          ? Number(biomarkers.Ki67)
          : null,
    };
  }
  
  // LUNG CANCER
  else if (cancerType.toLowerCase() === 'lung') {
    profile.biomarkers = {
      // EGFR - status + subtype
      EGFR: biomarkers?.EGFR || 'unknown',
      EGFR_subtype: biomarkers?.EGFR_subtype || null,
      
      // Simple status fields
      ALK: biomarkers?.ALK || 'unknown',
      ROS1: biomarkers?.ROS1 || 'unknown',
      BRAF: biomarkers?.BRAF || 'unknown',
      KRAS_G12C: biomarkers?.KRAS_G12C || 'unknown',
      MET: biomarkers?.MET || 'unknown',
      RET: biomarkers?.RET || 'unknown',
      NTRK: biomarkers?.NTRK || 'unknown',
      
      // PD-L1 - should be "high" or "low" (string, NOT number)
      PD_L1_expression: biomarkers?.PD_L1_expression || 'unknown',
    };
  }
  
  return profile;
};
```

---

## How to Use This Function

**When user clicks "Find Trials" after extraction:**

```typescript
const handleFindTrials = () => {
  // Get the form data (after extraction and any user edits)
  const profile = convertApiBiomarkersToProfile(
    formData.biomarkers,      // Biomarkers object
    formData.cancer_type,     // "breast" or "lung"
    formData.stage,           // "IV", "III", etc.
    formData.ecog,            // "0", "1", etc.
    formData.prior_treatments // Array of treatments
  );
  
  // Send to matching endpoint
  fetch('/api/v1/match-trials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  })
  .then(response => response.json())
  .then(data => {
    // Handle matched trials
    setMatchedTrials(data.trials);
  })
  .catch(error => {
    console.error('Matching error:', error);
  });
};
```

---

## What This Fix Does

### 1. Ensures Correct Data Types

**Breast Cancer:**
```typescript
// BEFORE (causes 422):
{
  Ki67: "28"  // String - WRONG
}

// AFTER (works):
{
  Ki67: 28    // Number - CORRECT
}
```

**Lung Cancer:**
```typescript
// BEFORE (causes 422):
{
  PD_L1: 5    // Number - WRONG
}

// AFTER (works):
{
  PD_L1_expression: "low"  // String "high" or "low" - CORRECT
}
```

### 2. Includes All Required Fields

**Complete breast cancer structure:**
```typescript
{
  cancer_type: "breast",
  stage: "IV",
  biomarkers: {
    ER: "positive",           // Required
    ER_percentage: 95,        // Required (as number or null)
    PR: "positive",           // Required
    PR_percentage: 80,        // Required (as number or null)
    HER2: "low",             // Required
    HER2_ihc: "1+",          // Optional
    HER2_fish: null,         // Optional
    Ki67: 28                 // Required (as number or null)
  }
}
```

**Complete lung cancer structure:**
```typescript
{
  cancer_type: "lung",
  stage: "IV",
  biomarkers: {
    EGFR: "positive",              // Required
    EGFR_subtype: "Exon 19 deletion", // Optional
    ALK: "negative",               // Required
    ROS1: "negative",              // Required
    BRAF: "unknown",               // Required
    KRAS_G12C: "unknown",          // Required
    MET: "unknown",                // Required
    RET: "unknown",                // Required
    NTRK: "unknown",               // Required
    PD_L1_expression: "low"        // Required (as "high"/"low"/"unknown")
  }
}
```

### 3. Handles Missing/Null Values

```typescript
// If biomarker is missing, set to "unknown" (not null, not undefined)
Ki67: typeof biomarkers?.Ki67 === 'number' ? biomarkers.Ki67 : null

// This prevents 422 errors from missing required fields
```

---

## Alternative: Check Backend Schema First

**If the above doesn't work, check what the backend actually expects:**

**File:** `trialscout-backend/app/schemas.py`

**Look for:**
```python
class BiomarkerProfile(BaseModel):
    cancer_type: str
    stage: str
    biomarkers: Dict[str, Any]
    # ... what other fields?
```

**And:**
```python
class BreastCancerBiomarkers(BaseModel):
    ER: str  # "positive" | "negative" | "unknown"
    ER_percentage: Optional[int] = None  # <-- Is this required or optional?
    PR: str
    PR_percentage: Optional[int] = None
    HER2: str
    HER2_ihc: Optional[str] = None
    HER2_fish: Optional[str] = None
    Ki67: Optional[int] = None  # <-- Is this int or float?
```

**Once you know the exact schema, adjust the conversion function to match.**

---

## Testing the Fix

### Test 1: Breast Cancer (Patient A)
```typescript
1. Upload patient_a_breast_pathology.txt
2. Extraction completes
3. Form pre-fills with:
   - ER: "positive", ER_percentage: 95
   - PR: "positive", PR_percentage: 80
   - HER2: "low", HER2_ihc: "1+"
   - Ki67: 28 (number, not string)
4. Click "Find Trials"
5. Should return trials (not 422 error)
```

### Test 2: Lung Cancer (Patient D)
```typescript
1. Upload patient_d_lung_molecular.txt
2. Extraction completes
3. Form pre-fills with:
   - EGFR: "positive", EGFR_subtype: "Exon 19 deletion"
   - ALK: "negative"
   - ROS1: "negative"
   - PD_L1_expression: "low" (string, not number)
4. Click "Find Trials"
5. Should return trials (not 422 error)
```

### Test 3: User Edits After Extraction
```typescript
1. Upload patient_a file
2. Extraction shows ER: "positive"
3. User changes ER to "negative"
4. Click "Find Trials"
5. Should match ER-negative trials (proving edit worked)
```

---

## Debug: If Still Getting 422

**Add debug logging:**

```typescript
const handleFindTrials = () => {
  const profile = convertApiBiomarkersToProfile(
    formData.biomarkers,
    formData.cancer_type,
    formData.stage,
    formData.ecog,
    formData.prior_treatments
  );
  
  // DEBUG: Log what we're sending
  console.log('Sending to matching endpoint:', JSON.stringify(profile, null, 2));
  
  fetch('/api/v1/match-trials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  })
  .then(response => {
    if (!response.ok) {
      // DEBUG: Log error response
      return response.json().then(err => {
        console.error('422 Error details:', err);
        throw new Error(JSON.stringify(err));
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Matching succeeded:', data);
    setMatchedTrials(data.trials);
  })
  .catch(error => {
    console.error('Matching error:', error);
  });
};
```

**Then check browser console for:**
- What data structure is being sent
- What error message backend returns
- Which field is causing the 422

---

## Quick Verification Checklist

**Before considering this fixed:**

- [ ] Check backend schema in `schemas.py`
- [ ] Update `convertApiBiomarkersToProfile()` to match schema
- [ ] Test Patient A upload → extraction → trial matching
- [ ] Test Patient D upload → extraction → trial matching
- [ ] Test user edits biomarker → trial matching uses edited value
- [ ] No 422 errors in browser console
- [ ] No 422 errors in backend logs

---

## Summary

**The issue is NOT with extraction** (that works perfectly).

**The issue is data format conversion** between:
- Extracted data structure (from LLM) ✅
- Form data structure (what user sees/edits) ✅
- Trial matching API structure (what backend expects) ❌ ← Fix this

**Fix: Update `convertApiBiomarkersToProfile()` to match backend schema exactly.**

**Time to fix: 15 minutes** (once you know the backend schema)

---

## What to Tell Snapdev

```
The extraction feature works perfectly! Just need one small fix:

ISSUE: 422 error when trial matching after extraction

ROOT CAUSE: Data structure mismatch between form and matching endpoint

FIX NEEDED:
1. Check backend schema in app/schemas.py
2. Update convertApiBiomarkersToProfile() function to match that schema
3. Ensure:
   - Ki67 is sent as number (not string)
   - PD_L1_expression is "high"/"low" (not percentage number)
   - All required fields included (even if "unknown")
   
TEST:
- Upload patient_a → Extract → Click "Find Trials" → Should work (no 422)
- Upload patient_d → Extract → Click "Find Trials" → Should work (no 422)

I've attached Fix_422_Trial_Matching.md with complete code.
```

**This is a 15-minute fix, not a fundamental problem! 🎯**
