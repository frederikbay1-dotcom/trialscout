# Snapdev Instructions: Implement Document Upload with LLM Extraction

## OBJECTIVE
Add document upload functionality that allows users to upload pathology reports or oncology notes, extract biomarkers using Claude API, and auto-fill the intake form.

---

## PRIORITY: MEDIUM
- **Deadline:** Thursday 6pm (need time for testing)
- **Time estimate:** 4-6 hours implementation
- **Risk:** Medium (new feature, API dependency)
- **Value:** High (impressive demo wow factor)

---

## PREREQUISITES ALREADY DONE

✅ API key configured in `.env` as `ANTHROPIC_API_KEY`
✅ `.gitignore` protects `.env` file
✅ Test documents provided (4 files for testing)

---

## REQUIRED DEPENDENCIES

Install these Python packages:

```bash
pip install anthropic==0.18.1 --break-system-packages
pip install PyPDF2==3.0.1 --break-system-packages
pip install pdfplumber==0.10.3 --break-system-packages
```

**Note:** Use `--break-system-packages` flag as required for this environment.

---

## IMPLEMENTATION STEPS

### ⚠️ CRITICAL REQUIREMENTS - READ FIRST

**The upload feature MUST satisfy these three requirements:**

**1. EXTRACTED DATA MUST PRE-FILL THE FORM**

After user clicks "Looks Good" on extracted biomarkers:
- Regular intake form appears (not a new form, the existing form)
- All relevant fields are pre-populated with extracted values
- Form state is updated with extracted data
- User sees their extracted values in the actual form fields

**Example:**
```
Before extraction: ER field is empty []
After extraction: ER field shows "Positive" [Positive ▼]
```

**2. USER MUST BE ABLE TO SEE ALL PRE-FILLED VALUES**

The form must be visible and navigable:
- Upload interface disappears after "Looks Good"
- Regular intake form becomes visible
- All sections/steps show pre-filled data
- No values are hidden or in a "black box"
- User can scroll through entire form

**Example:**
```
User should see:
Cancer Type: [Breast ▼]           ← Pre-filled
Stage: [IV ▼]                      ← Pre-filled  
ER Status: [Positive ▼]            ← Pre-filled
PR Status: [Positive ▼]            ← Pre-filled
HER2 Status: [Low ▼]              ← Pre-filled
```

**3. USER MUST BE ABLE TO EDIT ANY VALUE**

All form fields must remain fully editable:
- No fields are locked or disabled
- User can click any dropdown and change value
- User can modify text inputs
- User can add/remove items from lists
- Changes persist and affect trial matching

**Example:**
```
User clicks ER dropdown [Positive ▼]
Dropdown opens: [ Positive, Negative, Unknown ]
User selects "Negative"
Field updates: [Negative ▼]
When user clicks "Find Trials", matching uses "Negative" (not "Positive")
```

**WHY THIS MATTERS:**

❌ Bad: User uploads → data extracted → user clicks "Find Trials" → black box
✅ Good: User uploads → data extracted → form pre-fills → **user reviews/edits** → clicks "Find Trials"

The user must have transparency and control over the extracted data!

---

### STEP 1: Create Document Text Extractor

**File:** `app/extractors/document_extractor.py` (NEW FILE)

**Purpose:** Extract text from PDF files and images

**Key functions:**
- `extract_text(file: UploadFile) -> str`
- `_extract_from_text_pdf(content: bytes) -> str`
- `_extract_with_pdfplumber(content: bytes) -> str`

**Implementation details:**
- Use PyPDF2 for initial text extraction
- Fallback to pdfplumber if PyPDF2 fails
- Support .pdf, .txt file types
- Return extracted text as string

**See:** `Implement_LLM_Document_Extraction.md` - Section "Step 3: Create Document Extractor Module" for complete code

---

### STEP 2: Create LLM Biomarker Extractor

**File:** `app/extractors/biomarker_extractor.py` (NEW FILE)

**Purpose:** Send extracted text to Claude API and get structured biomarker data

**Key functions:**
- `extract_biomarkers(report_text: str, cancer_type: Optional[str]) -> Dict[str, Any]`
- `_build_extraction_prompt(report_text: str, cancer_type: Optional[str]) -> str`
- `_parse_response(response_text: str) -> Dict[str, Any]`

**Critical implementation notes:**

**Claude API Configuration:**
```python
import anthropic
from app.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

message = client.messages.create(
    model="claude-sonnet-4-20250514",  # Use this exact model
    max_tokens=3000,
    temperature=0,  # Deterministic for medical data
    messages=[{"role": "user", "content": prompt}]
)
```

**Prompt Design:**
- Request JSON-only output (no markdown, no preamble)
- Specify exact biomarker fields for breast cancer (ER, PR, HER2, Ki67)
- Specify exact biomarker fields for lung cancer (EGFR, ALK, ROS1, PD-L1, KRAS)
- Include confidence scores (high/medium/low) for each biomarker
- Handle "unknown" values gracefully

**Expected JSON Output:**
```json
{
  "cancer_type": "breast",
  "stage": "IV",
  "biomarkers": {
    "ER": {"value": "present", "confidence": "high", "details": "95% positive"},
    "PR": {"value": "present", "confidence": "high", "details": "80% positive"},
    "HER2": {"value": "low", "confidence": "high", "details": "IHC 1+"}
  },
  "prior_treatments": ["surgery", "chemotherapy"],
  "extraction_notes": "Any important notes"
}
```

**See:** `Implement_LLM_Document_Extraction.md` - Section "Step 4: Create LLM Biomarker Extractor" for complete code

---

### STEP 3: Update Config to Read API Key

**File:** `app/config.py`

**Add to Settings class:**
```python
class Settings(BaseSettings):
    # Existing settings...
    allowed_origins: str = "*"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_debug: bool = True
    dataset_version: str = "1.0"
    
    # ADD THIS:
    anthropic_api_key: str  # Required, no default
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**Test it loads:**
```bash
python -c "from app.config import settings; print(settings.anthropic_api_key[:20])"
# Should print: sk-ant-api03-xxxxx
```

---

### STEP 4: Create API Endpoint

**File:** `app/api/extraction.py` (NEW FILE)

**Purpose:** FastAPI endpoint to handle file uploads and return extracted biomarkers

**Endpoint:**
```python
@router.post("/api/v1/extract-biomarkers")
async def extract_biomarkers(
    file: UploadFile = File(...),
    cancer_type: Optional[str] = Form(None)
)
```

**Request format:**
- Method: POST
- Content-Type: multipart/form-data
- Fields:
  - `file`: PDF or text file (max 10MB)
  - `cancer_type`: "breast" or "lung" (optional hint)

**Response format:**
```json
{
  "success": true,
  "biomarker_data": {
    "cancer_type": "breast",
    "biomarkers": {...},
    "stage": "IV",
    "prior_treatments": [...]
  },
  "raw_text": "First 1000 chars...",
  "processing_time_seconds": 3.2
}
```

**Error handling:**
- Validate file type (PDF, TXT only)
- Validate file size (max 10MB)
- Handle text extraction failures
- Handle API failures with retry logic
- Return 400 for invalid input
- Return 500 for processing errors

**See:** `Implement_LLM_Document_Extraction.md` - Section "Step 5: Create API Endpoint" for complete code

---

### STEP 5: Add Router to Main App

**File:** `app/main.py`

**Add this import:**
```python
from app.api.extraction import router as extraction_router
```

**Add this line (where other routers are included):**
```python
app.include_router(extraction_router)
```

**Verify it works:**
```bash
# Start server
python run.py

# Check endpoint appears in docs
# Visit: http://localhost:8000/docs
# Should see POST /api/v1/extract-biomarkers
```

---

### STEP 6: Create Frontend Upload Component

**File:** `src/components/DocumentUpload.tsx` (NEW FILE)

**Purpose:** UI component for uploading documents and displaying extracted biomarkers

**Key features:**
- File input (accepts .pdf, .txt)
- File type/size validation (max 10MB)
- Upload progress indicator
- Loading state with status messages
- Display extracted biomarkers with confidence badges
- **Visual indicator that values came from AI extraction**
- **Allow user to review and confirm accuracy**
- **Show which values have high vs low confidence**
- "Looks Good" button to accept data (proceeds to form)
- "Try Another File" button to restart
- **"Edit Manually" button to skip to form without accepting**

**State management:**
```typescript
const [uploading, setUploading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [extractedData, setExtractedData] = useState<ExtractedBiomarkers | null>(null);
```

**Loading states:**
```typescript
// Show progressive messages during upload
const statusMessages = [
  { delay: 0, message: "Uploading document..." },
  { delay: 1000, message: "Reading pathology report..." },
  { delay: 3000, message: "Analyzing biomarkers with AI..." },
  { delay: 6000, message: "Finalizing results..." }
];
```

**Upload handler:**
```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    setError('Please upload a PDF or text file');
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    setError('File is too large. Maximum size is 10MB');
    return;
  }

  setUploading(true);
  setError(null);

  const formData = new FormData();
  formData.append('file', file);
  if (cancerType) {
    formData.append('cancer_type', cancerType);
  }

  try {
    const response = await fetch('/api/v1/extract-biomarkers', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract biomarkers');
    }

    const result = await response.json();
    setExtractedData(result.biomarker_data);
  } catch (err: any) {
    setError(err.message || 'Failed to process document');
  } finally {
    setUploading(false);
  }
};
```

**Confidence badge display:**
```typescript
{data.confidence === 'high' && (
  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
    ✓ High Confidence
  </span>
)}
{data.confidence === 'medium' && (
  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
    Review
  </span>
)}
{data.confidence === 'low' && (
  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
    ⚠️ Verify
  </span>
)}
```

**See:** `Implement_LLM_Document_Extraction.md` - Section "Step 6: Create Frontend Upload Component" for complete code

---

### STEP 7: Integrate into Intake Form

**File:** `src/pages/IntakeForm.tsx` (MODIFY EXISTING)

**CRITICAL INTEGRATION REQUIREMENTS:**

1. ✅ **Extracted data MUST pre-fill form fields**
2. ✅ **User MUST be able to see pre-filled values**
3. ✅ **User MUST be able to edit/override any value**
4. ✅ **Form MUST remain fully functional after extraction**

**Implementation approach:**

**After extraction completes:**
- Switch from "upload mode" to "review mode"
- Show the regular intake form with fields pre-filled
- All fields remain editable (not locked)
- User can change any value before submitting
- Clear indication that values came from extraction (not manual entry)

---

**Add at the beginning of the form:**

**Import:**
```typescript
import DocumentUpload from '@/components/DocumentUpload';
```

**Add state:**
```typescript
const [useDocumentUpload, setUseDocumentUpload] = useState(false);
```

**Add upload/manual choice UI:**
```typescript
<div className="mb-8 bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold mb-4">How would you like to start?</h2>
  
  <div className="grid grid-cols-2 gap-4">
    <button
      onClick={() => setUseDocumentUpload(true)}
      className={`p-6 border-2 rounded-lg transition ${
        useDocumentUpload 
          ? 'border-blue-600 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
      <p className="font-medium text-gray-900">Upload Report</p>
      <p className="text-sm text-gray-600 mt-1">
        We'll extract your biomarkers automatically
      </p>
    </button>

    <button
      onClick={() => setUseDocumentUpload(false)}
      className={`p-6 border-2 rounded-lg transition ${
        !useDocumentUpload 
          ? 'border-blue-600 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <Edit3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
      <p className="font-medium text-gray-900">Enter Manually</p>
      <p className="text-sm text-gray-600 mt-1">
        Fill out the form step by step
      </p>
    </button>
  </div>
</div>
```

**Add document upload section:**
```typescript
{useDocumentUpload && (
  <div className="mb-8">
    <DocumentUpload 
      onExtracted={handleExtractedData}
      cancerType={formData.cancer_type}
    />
  </div>
)}
```

**Add extraction handler (CRITICAL - This Makes the Upload Actually Work):**
```typescript
const handleExtractedData = (extractedData: ExtractedBiomarkers) => {
  // STEP 1: Map extracted data to form fields
  const updatedFormData = {
    ...formData,
    
    // Basic info
    cancer_type: extractedData.cancer_type || formData.cancer_type,
    stage: extractedData.stage || formData.stage,
    
    // Biomarkers - CRITICAL: Map the extracted biomarker structure to your form structure
    biomarkers: {
      ...formData.biomarkers,
      
      // Breast cancer biomarkers
      ER: extractedData.biomarkers?.ER?.value || formData.biomarkers?.ER,
      PR: extractedData.biomarkers?.PR?.value || formData.biomarkers?.PR,
      HER2: extractedData.biomarkers?.HER2?.value || formData.biomarkers?.HER2,
      Ki67: extractedData.biomarkers?.Ki67_percentage?.value || formData.biomarkers?.Ki67,
      
      // Lung cancer biomarkers
      EGFR: extractedData.biomarkers?.EGFR?.status || formData.biomarkers?.EGFR,
      EGFR_mutation: extractedData.biomarkers?.EGFR?.mutation || formData.biomarkers?.EGFR_mutation,
      ALK: extractedData.biomarkers?.ALK?.value || formData.biomarkers?.ALK,
      ROS1: extractedData.biomarkers?.ROS1?.value || formData.biomarkers?.ROS1,
      PD_L1: extractedData.biomarkers?.PD_L1?.percentage || formData.biomarkers?.PD_L1,
      KRAS: extractedData.biomarkers?.KRAS?.status || formData.biomarkers?.KRAS,
    },
    
    // Treatment history
    prior_treatments: extractedData.prior_treatments || formData.prior_treatments,
    
    // ECOG if extracted
    ecog: extractedData.ecog || formData.ecog,
  };
  
  // STEP 2: Update form state
  setFormData(updatedFormData);
  
  // STEP 3: Show success message with instruction to review
  toast.success('✓ Biomarkers extracted! Please review the pre-filled values below and make any corrections.', {
    duration: 5000,
  });
  
  // STEP 4: Switch back to manual entry mode so user can SEE and EDIT the pre-filled values
  setUseDocumentUpload(false);
  
  // STEP 5: Scroll to the top of the form so user sees the pre-filled fields
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**CRITICAL NOTES:**

1. **Biomarker Mapping:** The extraction returns nested objects like `{ER: {value: "present", confidence: "high"}}` but your form likely expects simple values like `{ER: "present"}`. The handler extracts the `.value` property.

2. **Fallback Values:** Always use `|| formData.biomarkers?.ER` as fallback to preserve any existing values if extraction fails.

3. **User Can Edit:** By switching to `setUseDocumentUpload(false)`, the form becomes editable and the user can review/modify all values.

4. **Clear Feedback:** Toast message tells user to review the values, making it clear this is NOT final.

**See:** `Implement_LLM_Document_Extraction.md` - Section "Step 7: Integrate into Intake Flow"

---

## TESTING REQUIREMENTS

### Backend Testing (Required Before Moving to Frontend)

**Test 1: API key loads correctly**
```bash
python -c "from app.config import settings; print(f'API key: {settings.anthropic_api_key[:20]}...')"

# Expected output:
# API key: sk-ant-api03-xxxxx...
```

**Test 2: Text extraction works**
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_a_breast_pathology.txt" \
  -F "cancer_type=breast"

# Expected: JSON response in 3-5 seconds with biomarkers
```

**Test 3: Breast cancer extraction accuracy**
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_a_breast_pathology.txt" \
  -F "cancer_type=breast" | jq '.biomarker_data.biomarkers'

# Expected output includes:
# ER: "present" (95%)
# PR: "present" (80%)
# HER2: "low" (IHC 1+)
```

**Test 4: Lung cancer extraction accuracy**
```bash
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@patient_d_lung_molecular.txt" \
  -F "cancer_type=lung" | jq '.biomarker_data.biomarkers'

# Expected output includes:
# EGFR: "present" with "Exon 19 deletion"
# ALK: "absent"
# ROS1: "absent"
# PD_L1: 5%
```

**Test 5: Error handling**
```bash
# Test invalid file type
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@test.jpg"

# Expected: 400 error with message about unsupported file type
```

**Test 6: Processing time**
Run each test file 3 times and record timing:
- patient_a_breast_pathology.txt: Should be 3-5 seconds
- patient_d_lung_molecular.txt: Should be 4-6 seconds
- If over 10 seconds, investigate Claude API latency

---

### Frontend Testing (After Backend Works)

**Test 1: Upload UI appears**
- Navigate to intake form
- Verify "Upload Report" vs "Enter Manually" choice appears
- Click "Upload Report" button
- Verify file upload interface shows

**Test 2: File validation**
- Try uploading a .jpg file → Should show error "Please upload a PDF or text file"
- Try uploading 15MB file → Should show error "File is too large"
- Upload valid .txt file → Should proceed

**Test 3: Loading states**
- Upload patient_a_breast_pathology.txt
- Verify loading spinner appears
- Verify status messages update:
  - "Uploading document..."
  - "Reading pathology report..."
  - "Analyzing biomarkers with AI..."

**Test 4: Results display**
- After extraction completes, verify:
  - Biomarkers display correctly (ER+, PR+, HER2-low)
  - Confidence badges show ("High Confidence" for explicit values)
  - Cancer type detected correctly ("Breast")
  - Stage detected correctly ("IV")

**Test 5: Form pre-fill (CRITICAL)**
- Click "Looks Good" button
- **Verify upload interface disappears**
- **Verify regular intake form is now visible**
- Verify form fields are pre-filled with extracted values:
  - Cancer type: Breast ✓
  - Stage: IV ✓
  - ER: Positive ✓
  - PR: Positive ✓
  - HER2: Low ✓
- **Verify all fields are EDITABLE** (not locked/disabled)
- **Try changing ER from Positive to Negative**
- **Verify the change is saved** (field updates)
- **Change it back to Positive**
- This confirms user can override extracted values

**Test 6: User can edit extracted values (CRITICAL)**
- After extraction, try editing each biomarker field
- Change ER from "Positive" to "Negative" 
- Verify change is reflected in form state
- Change it back to "Positive"
- Try changing Stage from "IV" to "III"
- Verify change works
- This proves user has full control over extracted data

**Test 7: Trial matching after upload and edit**
- After form pre-fills, click "Find Trials"
- Verify it matches the same trials as Sample Patient A
- Should show 5-6 trials
- Match scores should be similar

---

## ERROR HANDLING REQUIREMENTS

**Handle these scenarios gracefully:**

1. **API key missing:**
   - Error: "ANTHROPIC_API_KEY not found in environment"
   - Suggestion: "Check .env file configuration"

2. **API key invalid:**
   - Error: "Invalid Anthropic API key"
   - Suggestion: "Verify key at https://console.anthropic.com"

3. **File too large:**
   - Error: "File exceeds 10MB limit"
   - Suggestion: "Please upload a smaller file"

4. **Unsupported file type:**
   - Error: "Unsupported file type: [type]"
   - Suggestion: "Please upload PDF or text file"

5. **Text extraction failed:**
   - Error: "Could not extract text from document"
   - Suggestion: "File may be scanned or corrupted. Try text-based PDF."

6. **Claude API timeout:**
   - Error: "Request timed out"
   - Suggestion: "Please try again"

7. **Claude API rate limit:**
   - Error: "API rate limit exceeded"
   - Suggestion: "Please wait a moment and try again"

8. **Malformed response:**
   - Error: "Could not parse AI response"
   - Suggestion: "Please try uploading again or enter manually"

9. **No biomarkers found:**
   - Warning: "Could not detect biomarkers in document"
   - Suggestion: "Please verify this is a pathology report and try manual entry"

---

## PERFORMANCE REQUIREMENTS

**Target metrics:**

- **Text extraction:** < 1 second for text-based PDFs
- **Claude API call:** 2-5 seconds (network dependent)
- **Total processing time:** 3-6 seconds end-to-end
- **File size limit:** 10MB maximum
- **Supported formats:** PDF, TXT

**If extraction takes > 10 seconds:**
- Check network latency to Claude API
- Verify file is text-based (not scanned image)
- Consider adding timeout warnings in UI

---

## UI/UX REQUIREMENTS

**Loading experience:**
- Show spinner immediately on upload
- Display progressive status messages every 2-3 seconds
- Never show static "Loading..." for more than 3 seconds
- Keep user informed of progress

**Results display:**
- Show all extracted biomarkers, even with low confidence
- Use color-coded confidence badges:
  - Green "High Confidence" for explicit values
  - Blue "Review" for inferred values
  - Amber "Verify" for uncertain values
- Allow user to edit any value before accepting
- Provide "Try Another File" option to restart

**Error recovery:**
- Show clear error messages (not technical jargon)
- Provide actionable suggestions ("Try a different file", "Enter manually")
- Always offer manual entry as fallback
- Never block user from proceeding

---

## SECURITY REQUIREMENTS

**File upload security:**
- Validate file type server-side (don't trust client)
- Enforce 10MB size limit server-side
- Scan for malicious content (if possible)
- Delete uploaded files after processing (don't store)

**API key security:**
- NEVER expose API key to frontend
- Keep API calls server-side only
- Log API errors but not full responses (may contain PHI)
- Rate limit endpoint to prevent abuse

**Data privacy:**
- Don't log extracted biomarkers (may be PHI)
- Don't store uploaded files
- Don't cache API responses containing medical data
- Follow HIPAA guidelines for any patient data handling

---

## DEPLOYMENT CHECKLIST

**Before considering this feature "done":**

- [ ] Backend endpoint responds correctly
- [ ] All 4 test files extract accurately
- [ ] Processing time < 6 seconds consistently
- [ ] Frontend upload UI works
- [ ] Loading states display properly
- [ ] Extracted data displays correctly
- [ ] Form pre-fill works
- [ ] Trial matching works after extraction
- [ ] Error handling tested for all scenarios
- [ ] No console errors or warnings
- [ ] API key is never exposed to frontend
- [ ] .env file is gitignored
- [ ] Code is commented and documented

---

## TESTING FILES PROVIDED

**Use these for testing:**

1. **patient_a_breast_pathology.txt**
   - Cancer: Breast (ER+/PR+/HER2-low)
   - Expected extraction time: 3-4 seconds
   - Expected accuracy: 100%

2. **patient_a_oncology_note.txt**
   - Cancer: Breast, treatment history
   - Expected extraction time: 4-5 seconds
   - Expected accuracy: 100%

3. **patient_d_lung_molecular.txt**
   - Cancer: Lung (EGFR+, ALK-, ROS1-)
   - Expected extraction time: 4-6 seconds
   - Expected accuracy: 100%

4. **patient_d_oncology_note.txt**
   - Cancer: Lung, progression on osimertinib
   - Expected extraction time: 4-6 seconds
   - Expected accuracy: 100%

**All test files are in the project directory.**

---

## COMMON ISSUES & SOLUTIONS

**Issue: "Module 'anthropic' not found"**
```bash
Solution: pip install anthropic==0.18.1 --break-system-packages
```

**Issue: "ANTHROPIC_API_KEY not found"**
```bash
Solution: 
1. Check .env file has ANTHROPIC_API_KEY=sk-ant-...
2. Verify app/config.py loads from .env
3. Restart server after adding key
```

**Issue: "Authentication failed"**
```bash
Solution:
1. Verify API key is correct (check anthropic.com)
2. Make sure key starts with sk-ant-api03-
3. Check for extra spaces or quotes in .env
```

**Issue: "Extraction takes > 10 seconds"**
```bash
Solution:
1. Check internet connection
2. Verify Claude API status
3. Use shorter test files for debugging
```

**Issue: "Wrong biomarkers extracted"**
```bash
Solution:
1. Check cancer_type parameter is passed correctly
2. Verify prompt in biomarker_extractor.py
3. Review Claude response in logs
4. Adjust prompt if needed
```

---

## SUCCESS CRITERIA

**This feature is complete when:**

✅ User can upload a pathology report (PDF or TXT)
✅ System extracts text and sends to Claude API
✅ Claude returns structured biomarker data in 3-6 seconds
✅ Frontend displays extracted data with confidence scores
✅ User can review, edit, and confirm extracted data
✅ **After clicking "Looks Good", form pre-fills with extracted values**
✅ **All form fields remain editable after pre-fill**
✅ **User can modify any extracted value before submitting**
✅ **Clear visual indication that values came from extraction (not manual entry)**
✅ Trial matching works correctly with extracted data
✅ Trial matching works correctly if user modifies extracted data
✅ All 4 test files extract with 100% accuracy
✅ Error handling works for all failure scenarios
✅ No security issues (API key protected, files not stored)

**CRITICAL TEST:**
1. Upload file → Extract biomarkers → Click "Looks Good"
2. Form shows with pre-filled values
3. Change ER from "Positive" to "Negative"
4. Click "Find Trials"
5. Results should match a DIFFERENT patient profile (proving user edit worked)
6. Change ER back to "Positive"
7. Click "Find Trials" again
8. Results should match original profile (proving changes are respected)

---

## PRIORITY NOTES

**If running short on time, implement in this order:**

**Phase 1 (Minimum Viable):**
1. Backend text extraction (document_extractor.py)
2. Backend LLM extraction (biomarker_extractor.py)
3. API endpoint (extraction.py)
4. Test with curl - verify it works

**Phase 2 (UI):**
5. Frontend upload component (DocumentUpload.tsx)
6. Basic file validation
7. Display extracted results
8. Test in browser

**Phase 3 (Integration):**
9. Integrate into intake form
10. Form pre-fill logic
11. Full end-to-end testing

**Phase 4 (Polish):**
12. Progressive loading states
13. Confidence badges
14. Error handling refinement
15. Edge case testing

**If you only complete Phase 1-2, you can still demo it via curl during presentation.**

---

## FINAL NOTES

**This is an OPTIONAL feature for Friday demo.**

**If it works:** Huge wow factor, shows technical sophistication

**If it doesn't work:** Demo is still strong without it

**Don't let this break existing functionality.** If you encounter issues, keep the existing app working and add this as a separate feature branch.

**Test thoroughly before Friday.** A broken demo feature is worse than no feature.

Good luck! 🚀
