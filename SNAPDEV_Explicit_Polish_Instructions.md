# SNAPDEV: Final Polish - Explicit Implementation Instructions

## CURRENT STATUS: 90% Complete ✅

**What's Working:**
✅ Demographics extraction (Age, Sex, ECOG)
✅ Trial exclusions working (only 2 EGFR trials showing)
✅ Biomarker extraction working
✅ Clinical accuracy restored

**What Needs Polish:**
⚠️ Treatment history too generic ("Targeted therapy" instead of "Osimertinib 6 weeks, progressed")
⚠️ Treatment status incorrect ("First-line (newly diagnosed)" instead of "Progressed on targeted therapy")

---

## TIME REQUIRED: 20 MINUTES TOTAL

- Fix #2 (Treatment History): 10 minutes
- Fix #3 (Treatment Status): 10 minutes

---

# FIX #2: DETAILED TREATMENT HISTORY

## Time: 10 minutes

### STEP 1: Verify Extraction Returns Detailed Data (2 minutes)

**Check backend logs when patient_d_oncology_note.txt is uploaded.**

Look for extraction output. Should return something like:

```json
{
  "prior_treatments": [
    {
      "treatment": "osimertinib",
      "date": "2024-12",
      "duration": "6 weeks",
      "response": "partial response, CNS progression"
    },
    {
      "treatment": "stereotactic radiosurgery",
      "date": "2024-12",
      "site": "brain metastases"
    }
  ]
}
```

**Q: Does extraction return this structure?**

- ✅ YES → Go to Step 2 (Frontend formatting)
- ❌ NO → Go to Step 1B (Update extraction prompt)

---

### STEP 1B: If Extraction Returns Only Simple Array (5 minutes)

**If extraction returns:** `["osimertinib", "stereotactic radiosurgery"]`

**File to edit:** `app/extractors/biomarker_extractor.py`

**Find the section that says:**

```python
"prior_treatments": [ ... ]
```

**Replace it with this EXACT text:**

```python
"prior_treatments": [
  {
    "treatment": "surgery" / "osimertinib" / "carboplatin" / "paclitaxel" / "radiation" / etc,
    "date": "YYYY-MM" or null,
    "duration": "X weeks" / "X months" / "X cycles" or null,
    "response": "partial response" / "stable disease" / "progression" / "complete response" / null,
    "details": "Brief additional context" or null
  }
]

EXTRACTION RULES FOR PRIOR TREATMENTS:
1. Extract drug/procedure name (e.g., "osimertinib", "lumpectomy", "radiation")
2. Extract start date if mentioned (format: "YYYY-MM" like "2024-12")
3. Extract duration if mentioned (e.g., "6 weeks", "4 cycles", "14 months")
4. Extract response/outcome if mentioned (e.g., "partial response", "progression")
5. Extract relevant details (e.g., "brain metastases" for radiation site)
6. If treatment is mentioned but no details, still create entry with just name

EXAMPLE from document:
"Started osimertinib (Tagrisso) 80 mg daily on 12/15/2024"
→ {"treatment": "osimertinib", "date": "2024-12", "details": "Tagrisso 80mg daily"}

"Restaging CT (1/20/2025): Primary tumor 4.2cm → 2.8cm (34% reduction)"
→ Add to previous osimertinib entry: "response": "partial response"

"Brain: Received stereotactic radiosurgery (SRS) to three largest lesions (12/20/2024)"
→ {"treatment": "stereotactic radiosurgery", "date": "2024-12", "site": "brain metastases"}
```

**Save file and restart backend.**

---

### STEP 2: Update Frontend to Store Detailed Treatment History (2 minutes)

**File:** `src/components/steps/ScreenerStep.tsx`

**Find the `handleOncologyUpload` function.**

**Look for the section that processes `prior_treatments`.**

**ADD this code (if not already present):**

```typescript
// Store detailed treatment history for PDF
if (extractedData.prior_treatments && Array.isArray(extractedData.prior_treatments)) {
  const treatments = extractedData.prior_treatments;
  
  // Store both detailed and simplified versions
  setPatientData(prev => ({
    ...prev,
    
    // Detailed treatment history (for PDF)
    treatmentHistory: treatments,
    
    // Simplified treatment names (for matching)
    priorTreatmentTypes: treatments.map(t => 
      typeof t === 'string' ? t : (t.treatment || t.name)
    ),
    
    // ... rest of existing treatment category mapping ...
  }));
}
```

**Save file.**

---

### STEP 3: Format Treatment History in PDF (6 minutes)

**File:** Wherever clinician brief PDF is generated (likely in `src/components/results/` or similar)

**Find where "Prior Treatments Received" is generated.**

**REPLACE the existing code with this:**

```typescript
// Helper function to format treatment history
function formatTreatmentHistory(treatments: any[]): string {
  if (!treatments || treatments.length === 0) {
    return "No prior treatments documented";
  }
  
  // Handle both formats: array of strings OR array of objects
  const formattedLines = treatments.map((t, index) => {
    // If it's just a string
    if (typeof t === 'string') {
      return `${index + 1}. ${capitalizeFirstLetter(t)}`;
    }
    
    // If it's an object with details
    let line = `${index + 1}. ${capitalizeFirstLetter(t.treatment || t.name || 'Unknown treatment')}`;
    
    // Add drug class if we can identify it
    const drugClass = identifyDrugClass(t.treatment || t.name);
    if (drugClass) {
      line += ` (${drugClass})`;
    }
    
    // Add date
    if (t.date) {
      line += ` - ${formatDate(t.date)}`;
    }
    
    // Add duration
    if (t.duration) {
      line += ` - Duration: ${t.duration}`;
    }
    
    // Add response
    if (t.response) {
      line += ` - Response: ${capitalizeFirstLetter(t.response)}`;
    }
    
    // Add details/site
    if (t.details) {
      line += ` - ${t.details}`;
    }
    if (t.site) {
      line += ` - Site: ${t.site}`;
    }
    
    return line;
  });
  
  return formattedLines.join('\n');
}

// Helper: Capitalize first letter
function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper: Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // If format is YYYY-MM
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  
  return dateStr;
}

// Helper: Identify drug class
function identifyDrugClass(treatment: string): string {
  if (!treatment) return '';
  
  const treatmentLower = treatment.toLowerCase();
  
  // EGFR TKIs
  if (treatmentLower.includes('osimertinib') || treatmentLower.includes('tagrisso')) {
    return 'EGFR TKI';
  }
  if (treatmentLower.includes('erlotinib') || treatmentLower.includes('tarceva')) {
    return 'EGFR TKI';
  }
  if (treatmentLower.includes('gefitinib') || treatmentLower.includes('iressa')) {
    return 'EGFR TKI';
  }
  
  // CDK4/6 inhibitors
  if (treatmentLower.includes('palbociclib') || treatmentLower.includes('ibrance')) {
    return 'CDK4/6 inhibitor';
  }
  if (treatmentLower.includes('ribociclib') || treatmentLower.includes('kisqali')) {
    return 'CDK4/6 inhibitor';
  }
  if (treatmentLower.includes('abemaciclib') || treatmentLower.includes('verzenio')) {
    return 'CDK4/6 inhibitor';
  }
  
  // HER2-targeted
  if (treatmentLower.includes('trastuzumab') || treatmentLower.includes('herceptin')) {
    return 'HER2-targeted';
  }
  if (treatmentLower.includes('pertuzumab') || treatmentLower.includes('perjeta')) {
    return 'HER2-targeted';
  }
  
  // Chemotherapy
  if (treatmentLower.includes('paclitaxel') || treatmentLower.includes('taxol')) {
    return 'Chemotherapy';
  }
  if (treatmentLower.includes('carboplatin') || treatmentLower.includes('cisplatin')) {
    return 'Chemotherapy';
  }
  
  return '';
}

// In PDF generation, use this function:
const treatmentHistoryText = formatTreatmentHistory(patientData.treatmentHistory || patientData.priorTreatmentTypes || []);
```

**Then in the PDF template where it says "Prior Treatments Received", replace with:**

```typescript
{
  priorTreatments: treatmentHistoryText
}
```

**Save file.**

---

### STEP 4: Test Fix #2 (2 minutes)

```bash
1. Clear patient data
2. Upload patient_d_lung_molecular.txt
3. Upload patient_d_oncology_note.txt
4. Click "Find Trials"
5. Download clinician brief
6. Check "Prior Treatments Received" section

EXPECTED OUTPUT:
1. Osimertinib (EGFR TKI) - Dec 2024 - Duration: 6 weeks - Response: Partial response, CNS progression
2. Stereotactic radiosurgery - Dec 2024 - Site: Brain metastases

NOT:
- Surgery
- Targeted therapy (e.g., EGFR/ALK inhibitors)
```

---

# FIX #3: CORRECT TREATMENT STATUS

## Time: 10 minutes

### STEP 1: Update Extraction to Capture Progression Status (3 minutes)

**File:** `app/extractors/biomarker_extractor.py`

**Find the section for `treatment_status` in the extraction prompt.**

**Ensure it includes this text:**

```python
"treatment_status": {
  "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
  "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
  "prior_regimen": "osimertinib" / "carboplatin + pemetrexed" / etc or null,
  "duration_months": number or null,
  "response": "partial response" / "stable disease" / "progression" / null
}

CRITICAL EXTRACTION RULES FOR TREATMENT STATUS:

1. IDENTIFY KEYWORDS:
   - "newly diagnosed" + "no prior therapy" → newly_diagnosed
   - "progression on [drug name]" → extract drug name, classify type
   - "progressed after [therapy]" → extract therapy, classify type
   - "disease progression" + mentions therapy → progressed
   
2. CLASSIFY THERAPY TYPE:
   Targeted drugs: osimertinib, erlotinib, gefitinib, alectinib, crizotinib,
                   trastuzumab, pertuzumab, palbociclib, ribociclib
   Chemo drugs: carboplatin, cisplatin, paclitaxel, docetaxel, pemetrexed
   Immunotherapy: pembrolizumab, nivolumab, atezolizumab, durvalumab
   
3. EXAMPLES:
   "progression on first-line osimertinib therapy"
   → current_status: "progressed_on_targeted"
   → prior_regimen: "osimertinib"
   → line_of_therapy: "first_line"
   
   "newly diagnosed metastatic NSCLC, no prior systemic therapy"
   → current_status: "newly_diagnosed"
   → line_of_therapy: "first_line"
```

**Save and restart backend.**

---

### STEP 2: Update Frontend to Map Treatment Status (3 minutes)

**File:** `src/components/steps/ScreenerStep.tsx`

**Find the `handleOncologyUpload` function.**

**ADD this code section (if not already present):**

```typescript
// Map treatment status from extraction
if (extractedData.treatment_status) {
  const status = extractedData.treatment_status;
  
  console.log('Extracted treatment status:', status); // DEBUG
  
  let currentTreatmentStatus = "unknown";
  let effectiveLineOfTherapy = status.line_of_therapy || "unknown";
  
  // Map status to form values
  if (status.current_status === "newly_diagnosed") {
    currentTreatmentStatus = "first_line";
    effectiveLineOfTherapy = "first_line";
  } 
  else if (status.current_status === "progressed_on_targeted") {
    currentTreatmentStatus = "progressed_targeted";
    
    // If progressed on first-line, patient now needs second-line
    if (effectiveLineOfTherapy === "first_line") {
      effectiveLineOfTherapy = "second_line";
    }
  } 
  else if (status.current_status === "progressed_on_chemo" || 
           status.current_status === "progressed_on_immunotherapy") {
    currentTreatmentStatus = "progressed_chemo_immuno";
  }
  
  // Update patient data
  setPatientData(prev => ({
    ...prev,
    currentTreatmentStatus: currentTreatmentStatus,
    lineOfTherapy: effectiveLineOfTherapy,
    priorRegimenDetails: {
      regimen: status.prior_regimen,
      duration: status.duration_months,
      response: status.response,
    },
  }));
  
  console.log('Mapped to:', currentTreatmentStatus, effectiveLineOfTherapy); // DEBUG
}
```

**Save file.**

---

### STEP 3: Update PDF to Display Correct Status (2 minutes)

**File:** Wherever PDF is generated

**ADD this helper function:**

```typescript
function getCurrentLineDescription(patientData: any): string {
  const status = patientData.currentTreatmentStatus;
  const line = patientData.lineOfTherapy;
  const regimen = patientData.priorRegimenDetails?.regimen;
  
  // Progressed on targeted therapy
  if (status === "progressed_targeted") {
    if (regimen) {
      return `Progressed on targeted therapy (${regimen})`;
    }
    return "Progressed on targeted therapy";
  }
  
  // Progressed on chemo/immunotherapy
  if (status === "progressed_chemo_immuno") {
    if (regimen) {
      return `Progressed on chemotherapy/immunotherapy (${regimen})`;
    }
    return "Progressed on chemotherapy/immunotherapy";
  }
  
  // First-line (newly diagnosed)
  if (status === "first_line" || line === "first_line") {
    return "First-line (newly diagnosed)";
  }
  
  // Second-line
  if (line === "second_line") {
    return "Second-line therapy";
  }
  
  // Third-line or beyond
  if (line === "third_line_plus") {
    return "Third-line or later";
  }
  
  return "Treatment line unknown";
}
```

**In PDF generation, replace:**

```typescript
// OLD:
currentLine: patientData.lineOfTherapy || "Unknown"

// NEW:
currentLine: getCurrentLineDescription(patientData)
```

**Save file.**

---

### STEP 4: Test Fix #3 (2 minutes)

```bash
1. Clear patient data
2. Upload patient_d_oncology_note.txt (which mentions "progression on osimertinib")
3. Check console logs for: "Extracted treatment status: ..." and "Mapped to: ..."
4. Click "Find Trials"
5. Download clinician brief
6. Check "Current Line" field

EXPECTED:
Current Line: Progressed on targeted therapy (osimertinib)

NOT:
Current Line: First-line (newly diagnosed)
```

---

# COMPLETE TESTING CHECKLIST

## After Both Fixes (5 minutes)

### Test with Patient D Complete Workflow

```bash
1. CLEAR ALL PATIENT DATA

2. Upload patient_d_lung_molecular.txt
   ✓ Verify: Age 58, Sex Male, EGFR exon 19 del extracted
   
3. Upload patient_d_oncology_note.txt
   ✓ Verify: ECOG 1 extracted
   ✓ Check console: "Extracted treatment status: progressed_on_targeted"
   ✓ Check console: "Mapped to: progressed_targeted second_line"
   
4. Click "Find Trials"
   ✓ Verify: Shows exactly 2 trials (FLAURA2, MARIPOSA-2)
   ✓ Verify: No HER2/MET/BRAF trials
   
5. Download clinician brief PDF
   
6. VERIFY PDF CONTAINS:

   Demographics:
   ✓ Age: 58 years
   ✓ Sex: Male
   ✓ ECOG: 1 (Ambulatory, capable of light work)
   
   Treatment History:
   ✓ Current Line: Progressed on targeted therapy (osimertinib)
   
   Prior Treatments:
   ✓ 1. Osimertinib (EGFR TKI) - Dec 2024 - Duration: 6 weeks - Response: Partial response, CNS progression
   ✓ 2. Stereotactic radiosurgery - Dec 2024 - Site: Brain metastases
   
   Trials:
   ✓ 1 Possible Match + 1 Needing Confirmation (2 total)
   ✓ Trial #1: FLAURA2
   ✓ Trial #2: MARIPOSA-2
   ✓ No other trials listed
```

---

# TROUBLESHOOTING

## If Treatment History Still Generic After Fix #2

**Check:**
1. Did extraction return detailed objects? (Check backend logs)
2. Is treatmentHistory being stored in patientData? (Check React DevTools)
3. Is formatTreatmentHistory function being called? (Add console.log)

**Quick debug:**
```typescript
// In PDF generation, add:
console.log('Patient treatment history:', patientData.treatmentHistory);
console.log('Formatted:', formatTreatmentHistory(patientData.treatmentHistory));
```

---

## If Treatment Status Still Wrong After Fix #3

**Check:**
1. Did extraction return treatment_status? (Check backend logs after upload)
2. Did frontend map it correctly? (Check console logs for "Extracted treatment status")
3. Is getCurrentLineDescription being called? (Add console.log)

**Quick debug:**
```typescript
// In handleOncologyUpload, add:
console.log('Raw extracted data:', extractedData);
console.log('Treatment status object:', extractedData.treatment_status);
```

---

# EXPECTED FINAL RESULT

## Patient D Clinician Brief Should Show:

```
Executive Summary
1 Possible Match + 1 Needing Confirmation

Patient Demographics
Age: 58 years
Sex: Male
ECOG: 1 (Ambulatory, capable of light work)

Treatment History
Current Line: Progressed on targeted therapy (osimertinib)

Prior Treatments Received:
1. Osimertinib (EGFR TKI) - Dec 2024 - Duration: 6 weeks - Response: Partial response, CNS progression
2. Stereotactic radiosurgery - Dec 2024 - Site: Brain metastases

Possible Match Trials (1):
#1 FLAURA2 [full details]

Trials Needing Confirmation (1):
#2 MARIPOSA-2 [full details]
```

---

# TIME BREAKDOWN

- Fix #2 Step 1: Check extraction (2 min)
- Fix #2 Step 1B: Update extraction if needed (5 min)
- Fix #2 Step 2: Frontend storage (2 min)
- Fix #2 Step 3: PDF formatting (6 min)
- Fix #2 Step 4: Testing (2 min)
**Subtotal Fix #2: 10-15 minutes**

- Fix #3 Step 1: Update extraction (3 min)
- Fix #3 Step 2: Frontend mapping (3 min)
- Fix #3 Step 3: PDF display (2 min)
- Fix #3 Step 4: Testing (2 min)
**Subtotal Fix #3: 10 minutes**

- Complete testing: 5 minutes

**TOTAL: 25-30 minutes**

---

# CONTACT IF ISSUES

If something doesn't work:
1. Check console logs (frontend + backend)
2. Verify extraction is returning expected data structure
3. Add console.log statements to trace data flow
4. Test with simple console.log in PDF generation to see what data is available

**Remember: Fix #1 (critical trial exclusions) is already working! These are polish fixes to make the demo even better.**

---

**After these fixes, the system will be 98% demo-ready with professional treatment history and accurate clinical status! 🚀**
