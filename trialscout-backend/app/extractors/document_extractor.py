"""
Extract text from various document formats
"""
import io
import PyPDF2
import pdfplumber
from typing import Optional
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)


class DocumentExtractor:
    """Extract text from PDFs and text files"""
    
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        """
        Extract text from uploaded file
        
        Supports:
        - Text-based PDFs (PyPDF2, pdfplumber)
        - Plain text files
        """
        content = await file.read()
        file_type = file.content_type
        
        try:
            if file_type == "application/pdf":
                # Try text extraction first (faster)
                text = DocumentExtractor._extract_from_text_pdf(content)
                
                if not text or len(text.strip()) < 50:
                    # Fallback to pdfplumber for better table handling
                    logger.info("PyPDF2 extraction minimal, trying pdfplumber...")
                    text = DocumentExtractor._extract_with_pdfplumber(content)
                
                return text
            
            elif file_type in ["text/plain", "application/txt"]:
                # Extract from plain text file
                return content.decode('utf-8', errors='ignore')
            
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
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
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