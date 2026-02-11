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
- PD_L1: {"status": "present"/"absent"/"unknown", "percentage": number or null}
- Histology: "adenocarcinoma"/"squamous"/etc or "unknown"
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
- Age: Patient age as number, or null if not found
- Sex: "male", "female", or "unknown"
- Current_treatment_status: "newly_diagnosed", "on_treatment", "progressed_on_targeted", "progressed_on_chemo", or "unknown"
- Prior_treatments: List of treatments mentioned (e.g., ["surgery", "chemotherapy", "radiation"])

RETURN FORMAT:
Return ONLY a valid JSON object with this exact structure:

{{
  "cancer_type": "breast|lung|unknown",
  "stage": "string or unknown",
  "ecog": "0|1|2|3|4|unknown",
  "age": number or null,
  "sex": "male|female|unknown",
  "current_treatment_status": "newly_diagnosed|on_treatment|progressed_on_targeted|progressed_on_chemo|unknown",
  "biomarkers": {{
    // For breast cancer:
    "ER": {{"value": "present|absent|unknown", "confidence": "high|medium|low", "details": "optional context string"}},
    "PR": {{"value": "present|absent|unknown", "confidence": "high|medium|low", "details": "optional"}},
    "HER2": {{"value": "positive|low|negative|unknown", "confidence": "high|medium|low", "details": "IHC and FISH results"}},
    "Ki67_percentage": {{"value": number or null, "confidence": "high|medium|low"}},
    
    // For lung cancer:
    "EGFR": {{"status": "present|absent|unknown", "mutation": "string or null", "confidence": "high|medium|low"}},
    "ALK": {{"value": "present|absent|unknown", "confidence": "high|medium|low"}},
    "ROS1": {{"value": "present|absent|unknown", "confidence": "high|medium|low"}},
    "KRAS": {{"status": "present|absent|unknown", "mutation": "string or null", "confidence": "high|medium|low"}},
    "PD_L1": {{"status": "present|absent|unknown", "percentage": number or null, "confidence": "high|medium|low"}}
  }},
  "prior_treatments": ["list", "of", "treatments"],
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