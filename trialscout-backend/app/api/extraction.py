"""
API endpoints for document extraction
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from app.extractors.document_extractor import DocumentExtractor
from app.extractors.biomarker_extractor import BiomarkerExtractor
import logging
import time

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
        file: PDF or text file (max 10MB)
        cancer_type: Optional hint - "breast" or "lung"
    
    Returns:
        {
            "success": true,
            "biomarker_data": {...},
            "raw_text": "extracted text from document",
            "processing_time_seconds": 3.2
        }
    """
    start_time = time.time()
    
    # Validate file type
    allowed_types = ["application/pdf", "text/plain", "text/txt"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, TXT"
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