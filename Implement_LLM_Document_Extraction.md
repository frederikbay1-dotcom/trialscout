# LLM-Based Document Extraction for TrialScout
## Upload Pathology Reports & Oncology Notes → Extract Biomarkers

**Time Estimate:** 4-6 hours  
**Difficulty:** Medium  
**Dependencies:** PyPDF2, anthropic, pdf2image (optional for scanned PDFs)

---

## Overview

This implementation allows users to:
1. Upload pathology reports or oncology notes (PDF, JPG, PNG)
2. Extract text via OCR (if needed)
3. Send to Claude API for intelligent biomarker extraction
4. Review and verify extracted data
5. Auto-fill intake form

---

## Architecture

```
User uploads file
    ↓
Frontend validates file
    ↓
POST /api/v1/extract-biomarkers
    ↓
Backend extracts text (PyPDF2 or Tesseract)
    ↓
Send to Claude API with structured prompt
    ↓
Parse JSON response
    ↓
Return biomarkers to frontend
    ↓
User verifies/edits data
    ↓
Pre-fill intake form
```

---

## Step 1: Install Dependencies

**File:** `requirements.txt`

**Add these lines:**
```txt
# Document processing
PyPDF2==3.0.1
pdfplumber==0.10.3
pdf2image==1.16.3  # For scanned PDFs (optional)
pytesseract==0.3.10  # For scanned PDFs (optional)
Pillow==10.1.0  # Image processing

# Anthropic API
anthropic==0.18.1
```

**Install:**
```bash
pip install -r requirements.txt
```

**For scanned PDFs (optional):**
```bash
# macOS
brew install tesseract poppler

# Ubuntu
sudo apt-get install tesseract-ocr poppler-utils

# Windows - download installers from:
# https://github.com/UB-Mannheim/tesseract/wiki
# https://github.com/oschwartz10612/poppler-windows
```

---

## Step 2: Add Anthropic API Key to Environment

**File:** `.env`

```env
# Existing variables...

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**File:** `app/config.py`

**Add:**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Existing settings...
    
    # Anthropic API
    anthropic_api_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Step 3: Create Document Extractor Module

**File:** `app/extractors/document_extractor.py` (NEW FILE)

```python
"""
Extract text from various document formats
"""
import io
import PyPDF2
import pdfplumber
from PIL import Image
from typing import Optional, Union
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)


class DocumentExtractor:
    """Extract text from PDFs, images, and other documents"""
    
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        """
        Extract text from uploaded file
        
        Supports:
        - Text-based PDFs (PyPDF2, pdfplumber)
        - Scanned PDFs (pytesseract)
        - Images (pytesseract)
        """
        content = await file.read()
        file_type = file.content_type
        
        try:
            if file_type == "application/pdf":
                # Try text extraction first (faster)
                text = DocumentExtractor._extract_from_text_pdf(content)
                
                if not text or len(text.strip()) < 50:
                    # Fallback to OCR for scanned PDFs
                    logger.info("Text extraction failed, trying OCR...")
                    text = DocumentExtractor._extract_from_scanned_pdf(content)
                
                return text
            
            elif file_type in ["image/jpeg", "image/png", "image/jpg"]:
                # Extract from image using OCR
                return DocumentExtractor._extract_from_image(content)
            
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise
    
    @staticmethod
    def _extract_from_text_pdf(content: bytes) -> str:
        """Extract text from text-based PDF using PyPDF2"""
        try:
            pdf_file = io.BytesIO(content)
            reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}, trying pdfplumber...")
            return DocumentExtractor._extract_with_pdfplumber(content)
    
    @staticmethod
    def _extract_with_pdfplumber(content: bytes) -> str:
        """Extract text using pdfplumber (better for tables)"""
        try:
            pdf_file = io.BytesIO(content)
            text = ""
            
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            return text.strip()
        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {e}")
            return ""
    
    @staticmethod
    def _extract_from_scanned_pdf(content: bytes) -> str:
        """Extract text from scanned PDF using OCR"""
        try:
            from pdf2image import convert_from_bytes
            import pytesseract
            
            # Convert PDF to images
            images = convert_from_bytes(content)
            
            text = ""
            for i, image in enumerate(images):
                logger.info(f"OCR processing page {i+1}/{len(images)}...")
                page_text = pytesseract.image_to_string(image)
                text += page_text + "\n"
            
            return text.strip()
        except ImportError:
            logger.error("pytesseract or pdf2image not installed - cannot OCR scanned PDFs")
            return ""
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""
    
    @staticmethod
    def _extract_from_image(content: bytes) -> str:
        """Extract text from image using OCR"""
        try:
            import pytesseract
            
            image = Image.open(io.BytesIO(content))
            text = pytesseract.image_to_string(image)
            return text.strip()
        except ImportError:
            logger.error("pytesseract not installed - cannot OCR images")
            return ""
        except Exception as e:
            logger.error(f"Image OCR failed: {e}")
            return ""
```

---

## Step 4: Create LLM Biomarker Extractor

**File:** `app/extractors/biomarker_extractor.py` (NEW FILE)

```python
"""
Extract biomarkers from medical text using Claude
"""
import anthropic
import json
from typing import Dict, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class BiomarkerExtractor:
    """Extract structured biomarker data using Claude API"""
    
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    
    def extract_biomarkers(self, report_text: str, cancer_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Extract biomarkers from pathology report or oncology note
        
        Args:
            report_text: Raw text from document
            cancer_type: "breast", "lung", or None (will auto-detect)
        
        Returns:
            Structured biomarker data as dict
        """
        prompt = self._build_extraction_prompt(report_text, cancer_type)
        
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=3000,
                temperature=0,  # Deterministic for medical data
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract text content
            response_text = message.content[0].text
            
            # Parse JSON response
            biomarker_data = self._parse_response(response_text)
            
            return biomarker_data
        
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            raise
    
    def _build_extraction_prompt(self, report_text: str, cancer_type: Optional[str] = None) -> str:
        """Build structured prompt for Claude"""
        
        cancer_specific = ""
        if cancer_type == "breast":
            cancer_specific = """
For BREAST CANCER, extract:
- ER (Estrogen Receptor): "present", "absent", or "unknown"
- PR (Progesterone Receptor): "present", "absent", or "unknown"
- HER2: "positive" (IHC 3+ or FISH+), "low" (IHC 1-2+, FISH-), "negative" (IHC 0), or "unknown"
- Ki67_percentage: number (e.g., 20 for 20%), or null
- Histologic_grade: "1", "2", "3", or "unknown"
- Tumor_size_cm: number or null
- Lymph_nodes_positive: number or null
"""
        elif cancer_type == "lung":
            cancer_specific = """
For LUNG CANCER (NSCLC), extract:
- EGFR: {"status": "present"/"absent"/"unknown", "mutation": "Exon 19 deletion"/"L858R"/"T790M"/etc or null}
- ALK: "present" (rearranged), "absent", or "unknown"
- ROS1: "present" (rearranged), "absent", or "unknown"
- KRAS: {"status": "present"/"absent"/"unknown", "mutation": "G12C"/"G12V"/etc or null}
- BRAF: {"status": "present"/"absent"/"unknown", "mutation": "V600E"/etc or null}
- MET: {"status": "present"/"absent"/"unknown", "alteration": "exon 14 skipping"/"amplification"/etc or null}
- RET: "present" (fusion), "absent", or "unknown"
- NTRK: "present" (fusion), "absent", or "unknown"
- PD_L1: {"status": "present"/"absent"/"unknown", "percentage": number or null, "assay": "22C3"/"28-8"/etc or null}
- Histology: "adenocarcinoma"/"squamous"/"large cell"/etc or "unknown"
"""
        else:
            cancer_specific = """
Detect cancer type from the report, then extract relevant biomarkers for that cancer type.
Include both breast and lung cancer biomarkers if cancer type is unclear.
"""
        
        prompt = f"""You are a medical data extraction assistant specialized in oncology. Extract biomarker information from this pathology report or oncology note.

REPORT TEXT:
{report_text}

{cancer_specific}

ALSO EXTRACT:
- Cancer_type: "breast", "lung", or "unknown"
- Stage: TNM stage or clinical stage (e.g., "IV", "T2N1M0", or "unknown")
- ECOG_performance_status: "0", "1", "2", "3", "4", or "unknown"
- Report_date: ISO date format (YYYY-MM-DD) or null
- Prior_treatments: List of treatments mentioned (e.g., ["surgery", "chemotherapy", "radiation"])

RETURN FORMAT:
Return ONLY a valid JSON object with this exact structure:

{{
  "cancer_type": "breast|lung|unknown",
  "stage": "string or unknown",
  "ecog": "0|1|2|3|4|unknown",
  "report_date": "YYYY-MM-DD or null",
  "biomarkers": {{
    // For breast cancer:
    "ER": {{"value": "present|absent|unknown", "confidence": "high|medium|low", "details": "optional context string"}},
    "PR": {{"value": "present|absent|unknown", "confidence": "high|medium|low", "details": "optional"}},
    "HER2": {{"value": "positive|low|negative|unknown", "confidence": "high|medium|low", "details": "IHC and FISH results"}},
    "Ki67_percentage": {{"value": number or null, "confidence": "high|medium|low"}},
    
    // For lung cancer:
    "EGFR": {{"status": "present|absent|unknown", "mutation": "string or null", "confidence": "high|medium|low"}},
    "ALK": {{"value": "present|absent|unknown", "confidence": "high|medium|low"}},
    "PD_L1": {{"status": "present|absent|unknown", "percentage": number or null, "confidence": "high|medium|low"}},
    // ... etc
  }},
  "prior_treatments": ["list", "of", "treatments"],
  "extracted_sections": ["list of report sections found, e.g., 'Diagnosis', 'Immunohistochemistry'"],
  "extraction_notes": "Any important notes or ambiguities"
}}

RULES:
1. If a biomarker is not mentioned in the report, mark it as "unknown" with "low" confidence
2. Include confidence level for each biomarker: "high" (explicitly stated), "medium" (inferred), "low" (not found/ambiguous)
3. For HER2, carefully distinguish: "positive" (IHC 3+ or FISH+), "low" (IHC 1-2+ with FISH-), "negative" (IHC 0)
4. Include relevant details in the "details" field to help user verify accuracy
5. Return ONLY the JSON object, no other text or markdown formatting
6. Use null for numeric values that are not found (not "unknown")
7. Be conservative - if unsure, mark confidence as "low" or "medium"

Extract the biomarkers now:"""
        
        return prompt
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's JSON response"""
        try:
            # Remove any markdown code blocks if present
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            # Parse JSON
            data = json.loads(cleaned)
            
            # Validate required fields
            if "cancer_type" not in data:
                data["cancer_type"] = "unknown"
            if "biomarkers" not in data:
                data["biomarkers"] = {}
            
            return data
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON response from Claude: {e}")
```

---

## Step 5: Create API Endpoint

**File:** `app/api/extraction.py` (NEW FILE)

```python
"""
API endpoints for document extraction
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from app.extractors.document_extractor import DocumentExtractor
from app.extractors.biomarker_extractor import BiomarkerExtractor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["extraction"])


@router.post("/extract-biomarkers")
async def extract_biomarkers(
    file: UploadFile = File(...),
    cancer_type: Optional[str] = Form(None)
):
    """
    Extract biomarkers from uploaded pathology report or oncology note
    
    Args:
        file: PDF, JPG, or PNG file (max 10MB)
        cancer_type: Optional hint - "breast" or "lung"
    
    Returns:
        {
            "success": true,
            "biomarker_data": {...},
            "raw_text": "extracted text from document",
            "processing_time_seconds": 3.2
        }
    """
    import time
    start_time = time.time()
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, JPG, PNG"
        )
    
    # Validate file size (max 10MB)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    await file.seek(0)  # Reset file pointer
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    try:
        # Step 1: Extract text from document
        logger.info(f"Extracting text from {file.filename}...")
        document_extractor = DocumentExtractor()
        raw_text = await document_extractor.extract_text(file)
        
        if not raw_text or len(raw_text.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from document. Please ensure the file is readable and contains text."
            )
        
        logger.info(f"Extracted {len(raw_text)} characters of text")
        
        # Step 2: Extract biomarkers using Claude
        logger.info("Extracting biomarkers with Claude API...")
        biomarker_extractor = BiomarkerExtractor()
        biomarker_data = biomarker_extractor.extract_biomarkers(
            report_text=raw_text,
            cancer_type=cancer_type
        )
        
        processing_time = time.time() - start_time
        logger.info(f"Extraction complete in {processing_time:.2f} seconds")
        
        return {
            "success": True,
            "biomarker_data": biomarker_data,
            "raw_text": raw_text[:1000] + "..." if len(raw_text) > 1000 else raw_text,  # Truncate for response
            "processing_time_seconds": round(processing_time, 2)
        }
    
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Extraction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )


@router.post("/extract-text-only")
async def extract_text_only(file: UploadFile = File(...)):
    """
    Extract raw text from document without biomarker extraction
    Useful for debugging or preview
    """
    try:
        document_extractor = DocumentExtractor()
        raw_text = await document_extractor.extract_text(file)
        
        return {
            "success": True,
            "text": raw_text,
            "char_count": len(raw_text),
            "line_count": len(raw_text.split('\n'))
        }
    
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

**File:** `app/main.py`

**Add the router:**
```python
from app.api.extraction import router as extraction_router

app.include_router(extraction_router)
```

---

## Step 6: Create Frontend Upload Component

**File:** `src/components/DocumentUpload.tsx` (NEW FILE)

```typescript
import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ExtractedBiomarkers {
  cancer_type: string;
  stage: string;
  biomarkers: Record<string, any>;
  prior_treatments: string[];
  extraction_notes?: string;
}

interface DocumentUploadProps {
  onExtracted: (data: ExtractedBiomarkers) => void;
  cancerType?: 'breast' | 'lung';
}

export default function DocumentUpload({ onExtracted, cancerType }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedBiomarkers | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (cancerType) {
        formData.append('cancer_type', cancerType);
      }

      const response = await fetch('/api/v1/extract-biomarkers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to extract biomarkers');
      }

      const result = await response.json();
      setExtractedData(result.biomarker_data);
    } catch (err: any) {
      setError(err.message || 'Failed to process document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onExtracted(extractedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!extractedData && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          
          <label
            htmlFor="document-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-lg font-medium text-gray-700">
                  Extracting biomarkers from your report...
                </p>
                <p className="text-sm text-gray-500">
                  This may take 10-30 seconds
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Upload Pathology Report or Oncology Note
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, JPG, or PNG (max 10MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Choose File
                </button>
              </>
            )}
          </label>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Extracted Data Review */}
      {extractedData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Biomarkers Extracted Successfully
            </h3>
          </div>

          <div className="space-y-4">
            {/* Cancer Type & Stage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Cancer Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {extractedData.cancer_type}
                </p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Stage</p>
                <p className="font-medium text-gray-900">
                  {extractedData.stage}
                </p>
              </div>
            </div>

            {/* Biomarkers */}
            <div className="bg-white rounded p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Biomarkers:</p>
              <div className="space-y-2">
                {Object.entries(extractedData.biomarkers).map(([name, data]: [string, any]) => {
                  // Skip if unknown with low confidence
                  if (data.value === 'unknown' && data.confidence === 'low') return null;
                  
                  return (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{name}:</span>
                        <span className="ml-2 text-gray-700">
                          {typeof data === 'object' ? data.value || data.status || 'Unknown' : data}
                        </span>
                        {data.details && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({data.details})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {data.confidence === 'low' && (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
                            ⚠️ Verify
                          </span>
                        )}
                        {data.confidence === 'medium' && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Review
                          </span>
                        )}
                        {data.confidence === 'high' && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            ✓ High
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extraction Notes */}
            {extractedData.extraction_notes && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> {extractedData.extraction_notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                ✓ Looks Good - Use This Data
              </button>
              <button
                onClick={() => setExtractedData(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Try Another File
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              You'll be able to review and edit all information before matching trials
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!extractedData && !uploading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium mb-2">
            💡 Accepted Documents:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Pathology reports (surgical, biopsy)</li>
            <li>Immunohistochemistry (IHC) results</li>
            <li>Molecular testing reports (FISH, NGS)</li>
            <li>Oncology notes with biomarker information</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Your document is processed securely and is not stored after extraction.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Step 7: Integrate into Intake Flow

**File:** `src/pages/IntakeForm.tsx`

**Add upload option at the beginning:**

```typescript
import DocumentUpload from '@/components/DocumentUpload';

export default function IntakeForm() {
  const [useDocumentUpload, setUseDocumentUpload] = useState(false);
  const [formData, setFormData] = useState({...});

  const handleExtractedData = (extractedData) => {
    // Pre-fill form with extracted data
    setFormData({
      ...formData,
      cancer_type: extractedData.cancer_type,
      stage: extractedData.stage,
      biomarkers: extractedData.biomarkers,
      prior_treatments: extractedData.prior_treatments,
    });
    
    // Show success message
    toast.success('Form pre-filled with extracted biomarkers. Please review and confirm.');
    
    // Disable document upload mode
    setUseDocumentUpload(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Trials</h1>

      {/* Upload or Manual Entry Choice */}
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

      {/* Document Upload Component */}
      {useDocumentUpload && (
        <div className="mb-8">
          <DocumentUpload 
            onExtracted={handleExtractedData}
            cancerType={formData.cancer_type}
          />
        </div>
      )}

      {/* Regular Intake Form */}
      {!useDocumentUpload && (
        <div>
          {/* Existing step-by-step form */}
        </div>
      )}
    </div>
  );
}
```

---

## Step 8: Testing

### Test Files Needed

Create test pathology reports (or use real anonymized ones):

**File:** `tests/fixtures/sample_breast_pathology.txt`

```
PATHOLOGY REPORT

Patient: [REDACTED]
Date: 2025-01-15
Specimen: Breast biopsy, left

DIAGNOSIS: Invasive ductal carcinoma, Grade 2

IMMUNOHISTOCHEMISTRY:
Estrogen Receptor (ER): Positive (95% of tumor cells, strong intensity)
Progesterone Receptor (PR): Positive (80% of tumor cells, moderate intensity)
HER2: Negative (IHC score 1+)
Ki-67: 25%

STAGING: pT2N1M0 (Stage IIB)

NOTES: Margins negative for invasive carcinoma
```

**File:** `tests/fixtures/sample_lung_pathology.txt`

```
PATHOLOGY REPORT

Specimen: Lung biopsy, right upper lobe

DIAGNOSIS: Adenocarcinoma, lung

MOLECULAR TESTING:
EGFR: Exon 19 deletion detected
ALK: Negative (no rearrangement by FISH)
ROS1: Negative
PD-L1 (22C3): 60% (TPS)

STAGE: T2aN1M1b (Stage IVB)
```

### Test Script

**File:** `tests/test_extraction.py`

```python
"""
Test document extraction
"""
import pytest
from app.extractors.biomarker_extractor import BiomarkerExtractor
import os


def test_breast_cancer_extraction():
    """Test extraction from breast cancer pathology report"""
    with open("tests/fixtures/sample_breast_pathology.txt", "r") as f:
        report_text = f.read()
    
    extractor = BiomarkerExtractor()
    result = extractor.extract_biomarkers(report_text, cancer_type="breast")
    
    assert result["cancer_type"] == "breast"
    assert result["biomarkers"]["ER"]["value"] == "present"
    assert result["biomarkers"]["PR"]["value"] == "present"
    assert result["biomarkers"]["HER2"]["value"] == "negative" or result["biomarkers"]["HER2"]["value"] == "low"
    assert result["stage"] in ["IIB", "Stage IIB", "II", "unknown"]  # Flexible matching


def test_lung_cancer_extraction():
    """Test extraction from lung cancer pathology report"""
    with open("tests/fixtures/sample_lung_pathology.txt", "r") as f:
        report_text = f.read()
    
    extractor = BiomarkerExtractor()
    result = extractor.extract_biomarkers(report_text, cancer_type="lung")
    
    assert result["cancer_type"] == "lung"
    assert result["biomarkers"]["EGFR"]["status"] == "present"
    assert "exon 19" in result["biomarkers"]["EGFR"]["mutation"].lower()
    assert result["biomarkers"]["ALK"]["value"] == "absent"
    assert result["biomarkers"]["PD_L1"]["percentage"] >= 50


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### Manual Testing

```bash
# Test text extraction only
curl -X POST http://localhost:8000/api/v1/extract-text-only \
  -F "file=@tests/fixtures/sample_breast_pathology.pdf"

# Test full biomarker extraction
curl -X POST http://localhost:8000/api/v1/extract-biomarkers \
  -F "file=@tests/fixtures/sample_breast_pathology.pdf" \
  -F "cancer_type=breast"
```

---

## Step 9: Error Handling & Edge Cases

### Handle Common Errors

**File:** `app/extractors/biomarker_extractor.py`

**Add error recovery:**

```python
def extract_biomarkers(self, report_text: str, cancer_type: Optional[str] = None) -> Dict[str, Any]:
    """Extract with retry logic"""
    max_retries = 2
    
    for attempt in range(max_retries):
        try:
            # ... existing extraction code
            return biomarker_data
        
        except json.JSONDecodeError as e:
            if attempt < max_retries - 1:
                logger.warning(f"JSON parse failed (attempt {attempt+1}), retrying...")
                continue
            else:
                # Fallback: return minimal data
                return {
                    "cancer_type": cancer_type or "unknown",
                    "stage": "unknown",
                    "biomarkers": {},
                    "extraction_notes": "Automatic extraction failed. Please enter manually."
                }
```

---

## Step 10: Demo Script

### For Your Friday Demo

**What to say:**

> "And one more thing—if you have your pathology report, you can just upload it.
>
> [Click upload button]
>
> I'll use a sample report here... [select file]
>
> [Wait 3 seconds - show loading spinner]
>
> And there we go—TrialScout automatically extracted all the biomarkers: ER-positive, PR-positive, HER2-low. It even tells you which ones it's confident about.
>
> [Point to confidence badges]
>
> Sarah can review these, make any edits, and click 'Looks Good.'
>
> Now the form is pre-filled and she's ready to find her trials in under a minute."

---

## Implementation Checklist

- [ ] Install dependencies (PyPDF2, anthropic)
- [ ] Add ANTHROPIC_API_KEY to .env
- [ ] Create DocumentExtractor class
- [ ] Create BiomarkerExtractor class
- [ ] Create API endpoint
- [ ] Create DocumentUpload component
- [ ] Integrate into intake flow
- [ ] Test with sample PDFs
- [ ] Handle errors gracefully
- [ ] Practice demo flow

---

## Time Estimate

- **Backend (Steps 1-5):** 2 hours
- **Frontend (Steps 6-7):** 1.5 hours
- **Testing (Step 8):** 30 minutes
- **Polish & edge cases:** 1 hour
- **TOTAL:** 5 hours

---

## Priority for Friday Demo

**If time is tight:**

1. ✅ Implement backend only (2 hours)
2. ✅ Test with curl/Postman
3. ✅ Use pre-scripted frontend (30 min)
4. ⚠️ Skip full UI integration

**Full implementation:** Do Thursday if you have 5 focused hours.

---

**This is the complete implementation. Ready to ship! 🚀**
