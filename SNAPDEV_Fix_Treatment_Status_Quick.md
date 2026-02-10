# SNAPDEV: Fix Treatment Status (10 minutes)

## PROBLEM
"Current Line" shows "First-line (newly diagnosed)" but should show "Progressed on targeted therapy (osimertinib)" based on the detailed treatment history.

## SOLUTION: Update Extraction + Frontend Mapping

---

# PART 1: UPDATE EXTRACTION PROMPT (5 minutes)

## File: `app/extractors/biomarker_extractor.py`

### Find the prompt section that defines `treatment_status`

It should look something like:
```python
"treatment_status": {
  "current_status": "newly_diagnosed" / "progressed_on_targeted" / ...
}
```

### Replace that entire section with this:

```python
"treatment_status": {
  "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
  "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
  "prior_regimen": "drug name" or null,
  "progression_detected": true / false
}

CRITICAL RULES FOR TREATMENT STATUS EXTRACTION:

1. LOOK FOR PROGRESSION KEYWORDS:
   - "progression on [drug]"
   - "progressed after [drug]"
   - "disease progression" + mentions prior therapy
   - "CNS progression" + mentions therapy
   - "tumor growth" + mentions therapy
   - "radiographic progression" + mentions therapy

2. IF PROGRESSION DETECTED:
   a) Identify the drug patient progressed on
   b) Classify drug type:
      - EGFR TKIs: osimertinib, erlotinib, gefitinib, afatinib → "progressed_on_targeted"
      - Other targeted: trastuzumab, palbociclib, alectinib, crizotinib → "progressed_on_targeted"
      - Chemo: carboplatin, paclitaxel, docetaxel, pemetrexed → "progressed_on_chemo"
      - Immunotherapy: pembrolizumab, nivolumab, atezolizumab → "progressed_on_immunotherapy"
   c) Set current_status based on drug type
   d) Set progression_detected: true

3. IF NO PROGRESSION KEYWORDS FOUND:
   a) Look for "newly diagnosed" or "no prior therapy" → "newly_diagnosed"
   b) Otherwise → "unknown"

4. SPECIFIC PATTERNS TO DETECT:
   Pattern: "progression on osimertinib"
   → current_status: "progressed_on_targeted"
   → prior_regimen: "osimertinib"
   → progression_detected: true
   
   Pattern: "CNS progression on first-line osimertinib"
   → current_status: "progressed_on_targeted"
   → prior_regimen: "osimertinib"
   → progression_detected: true
   
   Pattern: "isolated CNS progression" + mentions osimertinib
   → current_status: "progressed_on_targeted"
   → prior_regimen: "osimertinib"
   → progression_detected: true

5. EXAMPLES FROM PATIENT D ONCOLOGY NOTE:
   Text: "disease progression on first-line osimertinib therapy"
   → current_status: "progressed_on_targeted"
   → line_of_therapy: "first_line"
   → prior_regimen: "osimertinib"
   → progression_detected: true
   
   Text: "Isolated CNS progression on osimertinib after only 6 weeks"
   → current_status: "progressed_on_targeted"
   → prior_regimen: "osimertinib"
   → progression_detected: true
```

### Save file and restart backend

---

# PART 2: UPDATE FRONTEND MAPPING (3 minutes)

## File: `src/components/steps/ScreenerStep.tsx`

### Find the `handleOncologyUpload` function

### Look for where treatment_status is processed (or add this section if missing)

```typescript
const handleOncologyUpload = async (extractedData: any) => {
  console.log('Oncology note extracted data:', extractedData);
  
  // ... existing demographics code ...
  // ... existing clinical status code ...
  // ... existing treatment history code ...
  
  // ========== ADD OR UPDATE THIS SECTION ==========
  
  // Map treatment status
  if (extractedData.treatment_status) {
    const status = extractedData.treatment_status;
    
    console.log('🔍 Extracted treatment status:', status);
    
    let currentTreatmentStatus = "unknown";
    let lineOfTherapy = "unknown";
    
    // Check if progression was detected
    if (status.progression_detected === true || status.current_status?.includes("progressed")) {
      
      // Progressed on targeted therapy
      if (status.current_status === "progressed_on_targeted") {
        currentTreatmentStatus = "progressed_targeted";
        lineOfTherapy = "second_line"; // Patient needs second-line now
        
        console.log('✅ Mapped to: progressed on targeted therapy');
      }
      // Progressed on chemo/immunotherapy
      else if (status.current_status === "progressed_on_chemo" || 
               status.current_status === "progressed_on_immunotherapy") {
        currentTreatmentStatus = "progressed_chemo_immuno";
        lineOfTherapy = "second_line";
        
        console.log('✅ Mapped to: progressed on chemo/immunotherapy');
      }
    }
    // Newly diagnosed
    else if (status.current_status === "newly_diagnosed") {
      currentTreatmentStatus = "first_line";
      lineOfTherapy = "first_line";
      
      console.log('✅ Mapped to: newly diagnosed, first-line');
    }
    
    // Update patient data
    setPatientData(prev => ({
      ...prev,
      currentTreatmentStatus: currentTreatmentStatus,
      lineOfTherapy: lineOfTherapy,
      priorRegimenName: status.prior_regimen,
      progressionDetected: status.progression_detected,
    }));
    
    console.log('📊 Final status:', {
      currentTreatmentStatus,
      lineOfTherapy,
      priorRegimen: status.prior_regimen
    });
  }
  
  // ... rest of function ...
};
```

### Save file

---

# PART 3: UPDATE PDF DISPLAY (2 minutes)

## File: Wherever clinician brief PDF is generated

### Find where "Current Line" is set

### Replace with this helper function and usage:

```typescript
// Add this helper function
function formatCurrentLine(patientData: any): string {
  const status = patientData.currentTreatmentStatus;
  const regimen = patientData.priorRegimenName;
  const progressed = patientData.progressionDetected;
  
  // If progression detected
  if (progressed === true || status?.includes("progressed")) {
    
    // Progressed on targeted therapy
    if (status === "progressed_targeted" || status?.includes("targeted")) {
      if (regimen) {
        // Capitalize first letter of drug name
        const drugName = regimen.charAt(0).toUpperCase() + regimen.slice(1);
        return `Progressed on targeted therapy (${drugName})`;
      }
      return "Progressed on targeted therapy";
    }
    
    // Progressed on chemo/immunotherapy
    if (status === "progressed_chemo_immuno") {
      return "Progressed on chemotherapy/immunotherapy";
    }
    
    // Generic progression
    return "Progressed on prior therapy";
  }
  
  // First-line (newly diagnosed)
  if (status === "first_line") {
    return "First-line (newly diagnosed)";
  }
  
  // Second-line
  if (patientData.lineOfTherapy === "second_line") {
    return "Second-line therapy";
  }
  
  // Default
  return "Treatment line not determined";
}

// In PDF generation, replace:
// OLD:
currentLine: "First-line (newly diagnosed)"

// NEW:
currentLine: formatCurrentLine(patientData)
```

### Save file

---

# TESTING (5 minutes)

## Test 1: Check Backend Extraction

```bash
1. Upload patient_d_oncology_note.txt
2. Check backend logs (terminal where backend is running)
3. Look for extraction output

EXPECTED TO SEE:
{
  "treatment_status": {
    "current_status": "progressed_on_targeted",
    "prior_regimen": "osimertinib",
    "progression_detected": true
  }
}

NOT:
{
  "treatment_status": {
    "current_status": "newly_diagnosed"
  }
}
```

## Test 2: Check Frontend Mapping

```bash
1. Upload patient_d_oncology_note.txt
2. Open browser console (F12)
3. Look for console logs

EXPECTED TO SEE:
🔍 Extracted treatment status: {current_status: "progressed_on_targeted", ...}
✅ Mapped to: progressed on targeted therapy
📊 Final status: {currentTreatmentStatus: "progressed_targeted", lineOfTherapy: "second_line", ...}

NOT:
✅ Mapped to: newly diagnosed, first-line
```

## Test 3: Check PDF Output

```bash
1. Click "Find Trials"
2. Download clinician brief
3. Check "Current Line" field

EXPECTED:
Current Line: Progressed on targeted therapy (Osimertinib)

NOT:
Current Line: First-line (newly diagnosed)
```

---

# TROUBLESHOOTING

## If backend extraction still shows "newly_diagnosed"

**Problem:** Extraction prompt not updated or not detecting "progression on osimertinib" keywords

**Fix:**
1. Check if prompt was saved correctly
2. Restart backend server
3. Add debug logging to extraction:
   ```python
   print(f"Document text contains 'progression': {'progression' in report_text.lower()}")
   print(f"Document text contains 'osimertinib': {'osimertinib' in report_text.lower()}")
   ```

## If frontend mapping shows wrong status

**Problem:** Status not being mapped correctly in handleOncologyUpload

**Fix:**
1. Check console logs - do you see "🔍 Extracted treatment status: ..."?
2. Check if extractedData.treatment_status exists
3. Add more console.logs:
   ```typescript
   console.log('Raw extracted data:', extractedData);
   console.log('Treatment status object:', extractedData.treatment_status);
   console.log('Current status value:', extractedData.treatment_status?.current_status);
   console.log('Progression detected:', extractedData.treatment_status?.progression_detected);
   ```

## If PDF still shows "First-line (newly diagnosed)"

**Problem:** formatCurrentLine not being called or patientData doesn't have the fields

**Fix:**
1. Check if patientData.progressionDetected is set
2. Add console.log before PDF generation:
   ```typescript
   console.log('Patient data for PDF:', {
     currentTreatmentStatus: patientData.currentTreatmentStatus,
     lineOfTherapy: patientData.lineOfTherapy,
     priorRegimenName: patientData.priorRegimenName,
     progressionDetected: patientData.progressionDetected
   });
   ```

---

# EXPECTED FINAL RESULT

## Patient D Clinician Brief Should Show:

```
Treatment History
Current Line: Progressed on targeted therapy (Osimertinib)

Prior Treatments Received:
1. Osimertinib (EGFR TKI) - Dec 2024 - Duration: 6 weeks - Response: Partial response
   - Tagrisso 80mg daily, excellent systemic response but CNS progression
2. Stereotactic radiosurgery - Dec 2024 - Response: Stable disease
   - SRS to 3 lesions, 20 Gy x 1 fraction per lesion, good local control
   - Site: brain
3. Dexamethasone - Dec 2024 - Duration: 4 weeks
   - 2mg BID for peritumoral edema, tapered off by 1/10/2025
   - Site: brain
```

**Key change:** "First-line (newly diagnosed)" → "Progressed on targeted therapy (Osimertinib)"

---

# TIME BREAKDOWN

- Part 1 (Extraction prompt): 5 minutes
- Part 2 (Frontend mapping): 3 minutes
- Part 3 (PDF display): 2 minutes
- Testing: 5 minutes

**Total: 15 minutes**

---

# KEY KEYWORDS TO DETECT

The extraction should detect these patterns from Patient D's oncology note:

✅ "disease progression on first-line osimertinib therapy"
✅ "progression on osimertinib"
✅ "progressed on osimertinib"
✅ "Isolated CNS progression on osimertinib"
✅ "CNS progression" + "osimertinib" in same document

All of these should trigger:
- current_status: "progressed_on_targeted"
- progression_detected: true

---

# SUCCESS CRITERIA

After this fix, Patient D should show:
✅ Current Line: "Progressed on targeted therapy (Osimertinib)"
✅ NOT: "First-line (newly diagnosed)"

Console logs should show:
✅ "🔍 Extracted treatment status: {current_status: 'progressed_on_targeted', ...}"
✅ "✅ Mapped to: progressed on targeted therapy"

---

**This completes the polish! After this fix, the system will be 98% demo-ready! 🎯**
