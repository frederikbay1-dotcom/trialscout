# Document Upload Feature - Testing Guide

## Overview
The document upload feature is now fully implemented with AI-powered extraction using Claude Sonnet 4. This guide will help you test the feature with the provided test documents.

## What Was Fixed
**Problem:** Blank page appeared after uploading documents and advancing to the next screen.

**Root Cause:** Data structure mismatch between API response format and frontend `BiomarkerProfile` type.

**Solution:** Added `convertApiBiomarkersToProfile()` function in `ScreenerStep.tsx` that properly maps API biomarker data to the frontend's structured format.

## Test Files Available
1. `patient_a_breast_pathology.txt` - Breast cancer pathology report
2. `patient_a_oncology_note.txt` - Breast cancer oncology note
3. `patient_d_lung_molecular.txt` - Lung cancer molecular testing report
4. `patient_d_oncology_note.txt` - Lung cancer oncology note

## Testing Steps

### Test 1: Breast Cancer Patient (Patient A)
1. **Navigate to the app:** Open http://localhost:8083 in your browser
2. **Start the walkthrough:** Click "Get Started" or navigate to the intake form
3. **Upload pathology report:**
   - Click "Upload Pathology Report"
   - Select `patient_a_breast_pathology.txt`
   - Wait 6-10 seconds for extraction
   - Verify green checkmark appears
4. **Check auto-filled data:**
   - Cancer Type should show "Breast"
   - Stage should show "IV"
   - Biomarkers should be extracted (ER+, PR+, HER2-low, etc.)
5. **Click "Next" to advance to Clinical Details**
6. **Verify no blank page:**
   - Page should load successfully
   - Biomarker Profile section should display
   - Extracted biomarkers should be pre-filled
7. **Upload oncology note:**
   - Go back to Medical Info step
   - Upload `patient_a_oncology_note.txt`
   - Verify prior treatments are extracted

### Test 2: Lung Cancer Patient (Patient D)
1. **Start a new session** (refresh page or clear data)
2. **Upload molecular report:**
   - Select `patient_d_lung_molecular.txt`
   - Wait for extraction
3. **Verify lung cancer data:**
   - Cancer Type: "Lung"
   - Stage: "IV"
   - Biomarkers: EGFR Exon 19 deletion should be detected
4. **Advance to Clinical Details**
5. **Verify biomarker profile:**
   - EGFR should show as "Present" with "Exon 19 Deletion" subtype
   - Other biomarkers should show as tested/absent
6. **Upload oncology note:**
   - Upload `patient_d_oncology_note.txt`
   - Verify treatment history extraction

### Test 3: Error Handling
1. **Try uploading invalid file:**
   - Upload a non-PDF/TXT file
   - Verify error message appears
2. **Try uploading without selecting file:**
   - Click upload button without file
   - Verify appropriate feedback

## Expected Extraction Times
- **Pathology reports:** 6-8 seconds
- **Oncology notes:** 7-10 seconds
- **Molecular reports:** 6-8 seconds

## What to Look For

### ✅ Success Indicators
- Green checkmark appears after upload
- "✓ Found in your report" badges appear on auto-filled fields
- Cancer type and stage are correctly identified
- Biomarkers are properly extracted and formatted
- No blank page when advancing to Clinical Details
- Biomarker Profile section displays correctly with pre-filled values
- Prior treatments are extracted from oncology notes

### ❌ Failure Indicators
- Upload takes longer than 15 seconds
- No checkmark appears after upload
- Blank page when clicking "Next"
- Console errors in browser DevTools
- Biomarkers not appearing in Clinical Details step
- Data not persisting between steps

## Troubleshooting

### If you see a blank page:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Look for errors related to `biomarkerProfile` or `BiomarkerProfile`
4. Verify the fix was applied by checking `ScreenerStep.tsx` has the `convertApiBiomarkersToProfile` function

### If extraction fails:
1. Check backend terminal for errors
2. Verify Claude API key is set in `.env`
3. Check backend logs for "Extraction complete" message
4. Verify file format is PDF or TXT

### If data doesn't auto-fill:
1. Check browser console for API errors
2. Verify backend is running on port 8000
3. Check CORS settings in backend
4. Verify the extraction response in Network tab

## Backend Logs to Monitor
Watch Terminal 2 (backend) for these log messages:
```
INFO:app.api.extraction:Processing file: patient_a_breast_pathology.txt
INFO:app.api.extraction:Extracted text length: XXXX characters
INFO:app.api.extraction:Extraction complete in X.XX seconds
```

## Frontend Console Logs
Watch browser console for:
```
Extracted data from API: {cancer_type: "breast", stage: "IV", biomarkers: {...}}
```

## API Response Format
The backend returns biomarkers in this format:
```json
{
  "cancer_type": "breast",
  "stage": "IV",
  "biomarkers": {
    "ER": {"value": "positive"},
    "PR": {"value": "positive"},
    "HER2": {"value": "low"},
    "EGFR": {"value": "positive", "subtype": "exon19_del"}
  }
}
```

The frontend converts this to:
```typescript
{
  genetic: {
    EGFR: { state: "present", subtype: "exon19_del" },
    ALK: "unknown",
    // ...
  },
  expression: {
    PDL1: "unknown",
    HER2: "low"
  },
  hormoneReceptors: {
    ER: "present",
    PR: "present",
    // ...
  }
}
```

## Key Files Modified
1. **Backend:**
   - `trialscout-backend/app/extractors/document_extractor.py` - Text extraction
   - `trialscout-backend/app/extractors/biomarker_extractor.py` - Claude API integration
   - `trialscout-backend/app/api/extraction.py` - API endpoint

2. **Frontend:**
   - `remix-of-oncology-scout/src/components/FileUploadZone.tsx` - File upload UI
   - `remix-of-oncology-scout/src/components/steps/ScreenerStep.tsx` - Data mapping (includes fix)

## Success Criteria
✅ All 4 test documents upload successfully  
✅ Extraction completes in under 15 seconds  
✅ Data auto-fills correctly for both cancer types  
✅ No blank page when advancing to Clinical Details  
✅ Biomarker Profile displays with correct pre-filled values  
✅ Prior treatments extracted from oncology notes  
✅ User can review and modify extracted data  

## Next Steps After Testing
Once testing is complete and successful:
1. Test with real patient documents (if available)
2. Verify extraction accuracy with medical team
3. Add more comprehensive error handling
4. Consider adding extraction confidence scores to UI
5. Implement document preview feature
6. Add ability to re-upload/replace documents

## Support
If you encounter issues:
1. Check both backend and frontend terminals for errors
2. Review browser console for JavaScript errors
3. Verify all dependencies are installed
4. Ensure Claude API key is valid and has credits
5. Check that both services are running (backend on 8000, frontend on 8083)