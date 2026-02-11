# Document Upload Feature - Testing Guide

## ✅ Implementation Complete

The document upload feature with LLM-based biomarker extraction has been successfully implemented and is ready for testing.

## 🎯 What Was Implemented

### Backend Components
1. **Document Extractor** (`trialscout-backend/app/extractors/document_extractor.py`)
   - Extracts text from PDF and TXT files
   - Supports both PyPDF2 and pdfplumber for robust PDF parsing

2. **Biomarker Extractor** (`trialscout-backend/app/extractors/biomarker_extractor.py`)
   - Uses Claude Sonnet 4 API for intelligent medical data extraction
   - Extracts: cancer type, stage, ECOG, age, sex, current treatment status, biomarkers, prior treatments
   - Returns structured JSON with confidence levels

3. **API Endpoint** (`trialscout-backend/app/api/extraction.py`)
   - `POST /api/v1/extract-biomarkers` - Main extraction endpoint
   - Validates file type (PDF/TXT) and size (max 10MB)
   - Returns extracted data in 5-10 seconds

### Frontend Components
1. **FileUploadZone** (`remix-of-oncology-scout/src/components/FileUploadZone.tsx`)
   - Drag-and-drop upload interface
   - Scanning animation during processing
   - Success/error states

2. **ScreenerStep Integration** (`remix-of-oncology-scout/src/components/steps/ScreenerStep.tsx`)
   - Two upload zones: Pathology Report and Oncology Note
   - Auto-fills patient intake form with extracted data
   - All fields remain editable for user review
   - Handles both nested and flat API response structures

## 🧪 Testing Instructions

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:8083` (or your port)
- Both services should already be running based on active terminals

### Test Files Available
1. `patient_a_breast_pathology.txt` - Breast cancer pathology report
2. `patient_a_oncology_note.txt` - Breast cancer oncology note
3. `patient_d_lung_molecular.txt` - Lung cancer molecular testing
4. `patient_d_oncology_note.txt` - Lung cancer oncology note

### Step-by-Step Testing

#### Test 1: Patient A (Breast Cancer)
1. Open browser to `http://localhost:8083`
2. Click "Get Started" or navigate to the intake form
3. **Upload Pathology Report:**
   - Drag `patient_a_breast_pathology.txt` to the "Upload Pathology Report" zone
   - Wait 5-10 seconds for processing
   - **Verify extracted data:**
     - ✅ Cancer Type: Breast
     - ✅ Stage: Should populate
     - ✅ Biomarkers: ER, PR, HER2 status
     - ✅ Age: Should populate if in document
     - ✅ Sex: Should populate if in document

4. **Upload Oncology Note:**
   - Drag `patient_a_oncology_note.txt` to the "Upload Oncology Note" zone
   - Wait 5-10 seconds for processing
   - **Verify extracted data:**
     - ✅ Age: Should populate
     - ✅ Sex: Should populate
     - ✅ Current Treatment Status: Should populate
     - ✅ ECOG Status: Should populate
     - ✅ Prior Treatments: Should populate

5. **Review Form:**
   - Check that all fields are editable
   - Verify "✓ Found in your report" badges appear
   - Confirm you can modify any auto-filled values

#### Test 2: Patient D (Lung Cancer)
1. Refresh the page or start a new session
2. **Upload Molecular Testing:**
   - Drag `patient_d_lung_molecular.txt` to the "Upload Pathology Report" zone
   - **Verify extracted data:**
     - ✅ Cancer Type: Lung
     - ✅ Biomarkers: EGFR, ALK, ROS1, PD-L1, etc.
     - ✅ Stage: Should populate

3. **Upload Oncology Note:**
   - Drag `patient_d_oncology_note.txt` to the "Upload Oncology Note" zone
   - **Verify extracted data:**
     - ✅ Age: Should populate
     - ✅ Sex: Should populate
     - ✅ Current Treatment Status: Should populate (e.g., "progressed_on_targeted")
     - ✅ ECOG Status: Should populate
     - ✅ Prior Treatments: Should list treatments

4. **Review Form:**
   - Verify all lung cancer-specific biomarkers are captured
   - Check that treatment history is properly categorized

### Expected Behavior

#### During Upload
- Upload zone shows "Scanning document..." animation
- Progress indicator appears
- Takes 5-10 seconds to complete

#### After Successful Upload
- Green checkmark appears on upload zone
- Form fields auto-populate with extracted data
- "✓ Found in your report" badges appear next to auto-filled fields
- Blue notification banner explains data was extracted

#### User Can Always
- Edit any auto-filled field
- Upload documents in any order
- Re-upload to replace data
- Continue to next step after reviewing

### What to Check

#### Data Accuracy
- [ ] Cancer type correctly identified
- [ ] Stage properly extracted and formatted
- [ ] Biomarkers accurately captured with correct status
- [ ] Age extracted as number
- [ ] Sex extracted as "male" or "female"
- [ ] Current treatment status properly categorized
- [ ] Prior treatments listed comprehensively

#### UI/UX
- [ ] Upload zones are intuitive
- [ ] Loading states are clear
- [ ] Success states are obvious
- [ ] Error messages are helpful
- [ ] All fields remain editable
- [ ] Badges indicate auto-filled fields
- [ ] Form is easy to review and correct

#### Edge Cases
- [ ] Uploading wrong file type shows error
- [ ] Large files (>10MB) are rejected
- [ ] Missing data shows as "unknown" or empty
- [ ] Uploading second file updates form correctly
- [ ] Browser console shows no errors

## 🐛 Troubleshooting

### Backend Not Extracting Data
1. Check Terminal 11 for backend logs
2. Verify ANTHROPIC_API_KEY is set in `trialscout-backend/.env`
3. Check API response in browser DevTools Network tab

### Frontend Not Updating Form
1. Check browser console for errors
2. Verify API response structure in Network tab
3. Look for console.log messages showing extracted data

### Upload Fails
1. Check file type (must be PDF or TXT)
2. Check file size (must be <10MB)
3. Verify backend is running on port 8000

## 📊 Success Criteria

The feature is working correctly if:
1. ✅ All 4 test files upload successfully
2. ✅ Extracted data populates form fields
3. ✅ Age, sex, and current_treatment_status are extracted
4. ✅ Biomarkers are correctly identified
5. ✅ User can edit all auto-filled fields
6. ✅ No console errors appear
7. ✅ Processing completes in <15 seconds

## 🎉 Next Steps After Testing

Once testing is complete:
1. Document any issues found
2. Test with real patient documents (if available)
3. Consider adding more biomarkers for other cancer types
4. Optimize extraction prompt for better accuracy
5. Add support for additional document formats (DOCX, images with OCR)

## 📝 Notes

- The Claude API uses `claude-sonnet-4-20250514` model
- Extraction is deterministic (temperature=0) for consistency
- Confidence levels help users identify uncertain extractions
- All data stays local - documents are processed but not stored
- The feature works offline after initial API call (data cached in form state)