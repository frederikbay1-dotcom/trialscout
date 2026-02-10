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
        """Build comprehensive extraction prompt for Claude"""
        
        base_prompt = f"""You are a medical AI assistant that extracts comprehensive clinical information from pathology reports and oncology notes.

Extract ALL the following information from this medical document and return ONLY a valid JSON object (no markdown, no preamble, no backticks).

Document text:
{report_text}

"""
        
        if cancer_type and cancer_type.lower() == 'breast':
            base_prompt += """
EXTRACT ALL OF THE FOLLOWING for BREAST CANCER:

Return JSON in this EXACT format:
{
  "cancer_type": "breast",
  
  "patient_demographics": {
    "age": number (e.g., 58) or null,
    "sex": "female" / "male" / "unknown",
    "date_of_birth": "MM/DD/YYYY" or null
  },
  
  "clinical_status": {
    "stage": "I" / "II" / "III" / "IV" / "unknown",
    "ecog": "0" / "1" / "2" / "3" / "4" / "unknown",
    "ecog_description": "Fully active" / "Ambulatory" / etc or null,
    "histology": "ductal" / "lobular" / "mixed" / "unknown",
    "grade": "1" / "2" / "3" / "unknown"
  },
  
  "treatment_status": {
    "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
    "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
    "prior_regimen": "palbociclib + letrozole" / "trastuzumab + pertuzumab" / etc or null,
    "duration_months": number or null,
    "response": "complete response" / "partial response" / "stable disease" / "progression" / null
  },
  
  "biomarkers": {
    "ER": {"status": "present" / "absent" / "unknown", "percentage": number or null, "confidence": "high" / "medium" / "low"},
    "PR": {"status": "present" / "absent" / "unknown", "percentage": number or null, "confidence": "high" / "medium" / "low"},
    "HER2": {"status": "positive" / "negative" / "low" / "unknown", "ihc_score": "0" / "1+" / "2+" / "3+" / null, "confidence": "high" / "medium" / "low"},
    "Ki67_percentage": {"value": number or null, "confidence": "high" / "medium" / "low"}
  },
  
  "prior_treatments": [
    {"treatment": "surgery" / "lumpectomy" / "paclitaxel" / etc, "date": "YYYY-MM" or null, "duration": "X months" or null, "response": "CR" / "PR" / "SD" / "PD" / null, "details": "string" or null}
  ]
}

CRITICAL EXTRACTION RULES:
1. AGE: Search for "Age:", "years old", "yo", "y/o", DOB (calculate age if DOB given)
2. SEX: Search for "Sex:", "Male", "Female", "M:", "F:", "Mr.", "Ms.", "Mrs.", gender pronouns
3. ECOG: Search for "ECOG", "Performance Status", "PS"
   - "Fully active" → ECOG 0
   - "Ambulatory" / "light work" → ECOG 1
   - "Self-care" / "unable to work" → ECOG 2
4. TREATMENT STATUS: Look for progression/response keywords
   - "newly diagnosed" + "no prior therapy" → newly_diagnosed
   - "progression on [drug]" → Check drug type (targeted vs chemo vs immunotherapy)
   - Drug classification: palbociclib/ribociclib/trastuzumab = targeted, paclitaxel/doxorubicin = chemo
5. PRIOR TREATMENTS: Search ENTIRE document for surgery, chemotherapy, radiation, hormone therapy, targeted therapy
6. Extract from ANYWHERE - header, body, history sections, treatment notes
7. If field not found, set to "unknown" or null (don't omit)
"""
        
        elif cancer_type and cancer_type.lower() == 'lung':
            base_prompt += """
EXTRACT ALL OF THE FOLLOWING for LUNG CANCER:

Return JSON in this EXACT format:
{
  "cancer_type": "lung",
  
  "patient_demographics": {
    "age": number (e.g., 58) or null,
    "sex": "female" / "male" / "unknown",
    "date_of_birth": "MM/DD/YYYY" or null
  },
  
  "clinical_status": {
    "stage": "I" / "II" / "III" / "IV" / "IVA" / "IVB" / "unknown",
    "ecog": "0" / "1" / "2" / "3" / "4" / "unknown",
    "ecog_description": "Fully active" / "Ambulatory" / etc or null,
    "histology": "adenocarcinoma" / "squamous cell" / "small cell" / "unknown",
    "metastases_sites": ["brain", "bone", "liver", "adrenal"] or []
  },
  
  "treatment_status": {
    "current_status": "newly_diagnosed" / "progressed_on_targeted" / "progressed_on_chemo" / "progressed_on_immunotherapy" / "unknown",
    "line_of_therapy": "first_line" / "second_line" / "third_line_plus" / "unknown",
    "prior_regimen": "drug name" or null,
    "progression_detected": true / false
  },
  
  "biomarkers": {
    "EGFR": {"status": "present" / "absent" / "unknown", "mutation": "Exon 19 deletion" / "L858R" / etc or null, "confidence": "high" / "medium" / "low"},
    "ALK": {"status": "present" / "absent" / "unknown", "confidence": "high" / "medium" / "low"},
    "ROS1": {"status": "present" / "absent" / "unknown", "confidence": "high" / "medium" / "low"},
    "BRAF": {"status": "present" / "absent" / "unknown", "mutation": "V600E" / etc or null, "confidence": "high" / "medium" / "low"},
    "KRAS_G12C": {"status": "present" / "absent" / "unknown", "confidence": "high" / "medium" / "low"},
    "MET": {"status": "present" / "absent" / "unknown", "alteration": "exon 14 skipping" / "amplification" / null, "confidence": "high" / "medium" / "low"},
    "RET": {"status": "present" / "absent" / "unknown", "fusion": "KIF5B-RET" / etc or null, "confidence": "high" / "medium" / "low"},
    "NTRK": {"status": "present" / "absent" / "unknown", "fusion": "NTRK1" / etc or null, "confidence": "high" / "medium" / "low"},
    "PD_L1": {"percentage": number or null, "expression": "high" / "low" / "unknown", "confidence": "high" / "medium" / "low"}
  },
  
  "prior_treatments": [
    {
      "treatment": "surgery" / "osimertinib" / "carboplatin" / "paclitaxel" / "radiation" / etc,
      "date": "YYYY-MM" or null,
      "duration": "X weeks" / "X months" / "X cycles" or null,
      "response": "partial response" / "stable disease" / "progression" / "complete response" / null,
      "site": "brain" / "lung" / etc or null,
      "details": "Brief additional context" or null
    }
  ]
}

CRITICAL EXTRACTION RULES:
1. AGE: Search for "Age:", "years old", "yo", "y/o", DOB (calculate age if DOB given)
2. SEX: Search for "Sex:", "Male", "Female", "M:", "F:", "Mr.", gender pronouns
3. ECOG: Search for "ECOG", "Performance Status", "PS"
   - "Fully active" → ECOG 0
   - "Ambulatory" / "capable of" → ECOG 1
   - "Self-care" / "unable to work" → ECOG 2
4. TREATMENT STATUS - CRITICAL FOR CLINICAL ACCURACY:
   
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
5. PRIOR TREATMENTS - EXTRACT DETAILED INFORMATION:
   a) Extract drug/procedure name (e.g., "osimertinib", "lobectomy", "stereotactic radiosurgery")
   b) Extract start date if mentioned (format: "YYYY-MM" like "2024-12")
   c) Extract duration if mentioned (e.g., "6 weeks", "4 cycles", "14 months")
   d) Extract response/outcome if mentioned (e.g., "partial response", "progression", "stable disease")
   e) Extract relevant details (e.g., dose "80mg daily", site "brain metastases")
   f) If treatment mentioned but no details, still create entry with just name
   
   EXAMPLES:
   "Started osimertinib (Tagrisso) 80 mg daily on 12/15/2024"
   → {"treatment": "osimertinib", "date": "2024-12", "details": "Tagrisso 80mg daily"}
   
   "Restaging CT (1/20/2025): Primary tumor 4.2cm → 2.8cm (34% reduction)"
   → Add to previous osimertinib entry: "response": "partial response"
   
   "Brain: Received stereotactic radiosurgery (SRS) to three largest lesions (12/20/2024)"
   → {"treatment": "stereotactic radiosurgery", "date": "2024-12", "site": "brain metastases", "details": "3 lesions"}
   
6. METASTASES: Look for "brain metastases", "bone metastases", etc.
7. Extract from ANYWHERE - header, body, history, treatment sections
8. If field not found, set to "unknown" or null or []
"""
        
        else:
            base_prompt += """
EXTRACT ALL clinical information available:

Return JSON:
{
  "cancer_type": "breast" / "lung" / "unknown",
  "patient_demographics": {"age": number or null, "sex": "male"/"female"/"unknown"},
  "clinical_status": {"stage": "I-IV"/"unknown", "ecog": "0-4"/"unknown"},
  "treatment_status": {"current_status": "unknown"},
  "biomarkers": {},
  "prior_treatments": []
}
"""
        
        return base_prompt
    
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