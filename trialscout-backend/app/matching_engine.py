"""
Rule-based matching engine for clinical trials
Based on TrialScout PRD v1.0 specifications
"""

from typing import List, Dict, Any, Tuple
from app.schemas import (
    PatientProfile, MatchedTrial, MatchReason, 
    ConfirmationItem, TrialFullDetail
)
from app.models import Trial


class MatchingEngine:
    """Deterministic rule-based matching engine"""
    
    BASE_SCORE = 85
    
    def __init__(self):
        """Initialize matching engine"""
        pass
    
    def match_trials(
        self, 
        patient_profile: PatientProfile, 
        all_trials: List[TrialFullDetail]
    ) -> List[MatchedTrial]:
        """
        Match patient profile against all trials
        
        Args:
            patient_profile: Patient's clinical profile
            all_trials: List of all available trials
            
        Returns:
            List of matched trials with scores and reasoning
        """
        matched_trials = []
        
        for trial in all_trials:
            # Check hard exclusions
            if self._should_exclude(patient_profile, trial):
                continue
            
            # Calculate match score
            score = self._calculate_score(patient_profile, trial)
            
            # Determine confidence level
            confidence = self._determine_confidence(patient_profile, trial, score)
            
            # Generate matching reasons
            why_matched = self._generate_why_matched(patient_profile, trial)
            
            # Generate confirmation items
            what_to_confirm = self._generate_what_to_confirm(patient_profile, trial)
            
            # Extract patient burden information
            patient_burden = self._extract_patient_burden(trial)
            
            # Create matched trial object
            matched_trial = MatchedTrial(
                trial=trial,
                score=score,
                confidence=confidence,
                why_matched=why_matched,
                what_to_confirm=what_to_confirm,
                patient_burden=patient_burden
            )
            
            matched_trials.append(matched_trial)
        
        # Sort by eligibility score (possibly_eligible first), then by match score
        matched_trials.sort(
            key=lambda x: (
                x.trial.eligibility_score == "possibly_eligible",
                x.score
            ),
            reverse=True
        )
        
        return matched_trials
    
    def _should_exclude(self, patient: PatientProfile, trial: TrialFullDetail) -> bool:
        """
        Check hard exclusion criteria
        
        Returns True if trial should be excluded
        """
        # Cancer type mismatch
        if patient.cancer_type != trial.cancer_type:
            return True
        
        # Stage-specific exclusions
        if patient.stage == "IV":
            # Check if trial is neoadjuvant or adjuvant only
            for criterion in trial.eligibility_criteria:
                if criterion.category == "stage" and criterion.required:
                    if "neoadjuvant" in criterion.criterion.lower() or \
                       "adjuvant" in criterion.criterion.lower():
                        return True
        
        # ECOG exclusions
        if patient.ecog is not None:
            for criterion in trial.eligibility_criteria:
                if criterion.category == "ecog" and criterion.required:
                    # Extract max ECOG from criterion
                    max_ecog = self._extract_max_ecog(criterion.criterion)
                    if max_ecog is not None and patient.ecog > max_ecog:
                        return True
        
        # Biomarker exclusions
        biomarker_exclusion = self._check_biomarker_exclusions(patient, trial)
        if biomarker_exclusion:
            return True
        
        # Prior therapy exclusions
        therapy_exclusion = self._check_therapy_exclusions(patient, trial)
        if therapy_exclusion:
            return True
        
        return False
    
    def _check_biomarker_exclusions(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail
    ) -> bool:
        """Check biomarker-based exclusions"""
        
        for criterion in trial.eligibility_criteria:
            if criterion.category != "biomarker" or not criterion.required:
                continue
            
            criterion_lower = criterion.criterion.lower()
            
            # HER2 exclusions (breast cancer)
            if patient.cancer_type == "breast":
                # HER2+ trial excludes HER2- or HER2-low patients
                if "her2 positive" in criterion_lower or "her2+" in criterion_lower:
                    her2_status = patient.biomarkers.get("HER2")
                    if her2_status and her2_status.status in ["absent", "low"]:
                        return True
                
                # HER2-low trial excludes HER2- or HER2+ patients
                if "her2-low" in criterion_lower or "her2 low" in criterion_lower:
                    her2_status = patient.biomarkers.get("HER2")
                    if her2_status and her2_status.status in ["absent", "positive"]:
                        return True
            
            # EGFR/ALK/ROS1 mutual exclusivity (lung cancer)
            if patient.cancer_type == "lung":
                # EGFR-mutant trials exclude ALK+ or ROS1+
                if "egfr" in criterion_lower and "mutation" in criterion_lower:
                    alk_status = patient.biomarkers.get("ALK")
                    ros1_status = patient.biomarkers.get("ROS1")
                    
                    if (alk_status and alk_status.status == "present") or \
                       (ros1_status and ros1_status.status == "present"):
                        return True
                
                # Check for specific EGFR mutation requirements
                if "exon 19" in criterion_lower or "l858r" in criterion_lower:
                    egfr_status = patient.biomarkers.get("EGFR")
                    if egfr_status and egfr_status.subtype:
                        # If trial requires exon 19 but patient has L858R, exclude
                        if "exon 19" in criterion_lower and "l858r" in egfr_status.subtype.lower():
                            return True
                        # If trial requires L858R but patient has exon 19, exclude
                        if "l858r" in criterion_lower and "exon 19" in egfr_status.subtype.lower():
                            return True
        
        return False
    
    def _check_therapy_exclusions(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail
    ) -> bool:
        """Check prior therapy exclusions"""
        
        for criterion in trial.eligibility_criteria:
            if criterion.category != "treatment_history" or not criterion.required:
                continue
            
            criterion_lower = criterion.criterion.lower()
            
            # Check if patient has received excluded therapies
            for therapy in patient.prior_therapies:
                therapy_lower = therapy.lower()
                
                # Look for "no prior X" patterns
                if "no prior" in criterion_lower and therapy_lower in criterion_lower:
                    return True
        
        return False
    
    def _calculate_score(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail
    ) -> int:
        """
        Calculate match score (85-99 range)
        
        Scoring rules from PRD:
        - Base score: 85 points
        - +5 points: All major biomarkers confirmed match
        - +3 points: ECOG explicitly meets requirement
        - +2 points: Trial location <10 miles
        - +5 points: First-line trial and patient is first-line
        - -5 points: Any "What to Confirm" item present
        """
        score = self.BASE_SCORE
        
        # Biomarker bonus
        if self._all_biomarkers_match(patient, trial):
            score += 5
        
        # ECOG bonus
        if patient.ecog is not None:
            max_ecog = self._get_trial_max_ecog(trial)
            if max_ecog is not None and patient.ecog <= max_ecog:
                score += 3
        
        # Location bonus
        if trial.distance_miles is not None and trial.distance_miles < 10:
            score += 2
        
        # Line of therapy bonus
        if patient.current_line == "first-line":
            if self._is_first_line_trial(trial):
                score += 5
        
        # Penalty for confirmation items
        what_to_confirm = self._generate_what_to_confirm(patient, trial)
        if len(what_to_confirm) > 0:
            score -= 5
        
        # Cap at 99 (never 100 to avoid false certainty)
        return min(score, 99)
    
    def _determine_confidence(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail, 
        score: int
    ) -> str:
        """
        Determine confidence level
        
        Rules from PRD:
        - High: Score ≥95, all major criteria met, ≤1 "What to Confirm" item
        - Medium: Score 90-94, OR ≥2 "What to Confirm" items
        - Low: Score <90, OR critical biomarker unknown
        """
        what_to_confirm = self._generate_what_to_confirm(patient, trial)
        
        # Check for critical unknown biomarkers
        has_critical_unknown = self._has_critical_unknown_biomarker(patient, trial)
        
        if has_critical_unknown or score < 90:
            return "low"
        
        if score >= 95 and len(what_to_confirm) <= 1:
            return "high"
        
        return "medium"
    
    def _generate_why_matched(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail
    ) -> List[MatchReason]:
        """Generate list of reasons why trial matched"""
        reasons = []
        
        # Cancer type and stage match
        reasons.append(MatchReason(
            criterion="Cancer Type",
            met=True,
            description=f"{patient.cancer_type.title()} cancer, Stage {patient.stage}"
        ))
        
        # Biomarker matches
        for criterion in trial.eligibility_criteria:
            if criterion.category == "biomarker" and criterion.required:
                biomarker_name = self._extract_biomarker_name(criterion.criterion)
                if biomarker_name and biomarker_name in patient.biomarkers:
                    status = patient.biomarkers[biomarker_name]
                    if status.status == "present":
                        reasons.append(MatchReason(
                            criterion=biomarker_name,
                            met=True,
                            description=f"{biomarker_name} {status.subtype or 'positive'}"
                        ))
        
        # ECOG match
        if patient.ecog is not None:
            max_ecog = self._get_trial_max_ecog(trial)
            if max_ecog is not None and patient.ecog <= max_ecog:
                reasons.append(MatchReason(
                    criterion="Performance Status",
                    met=True,
                    description=f"ECOG {patient.ecog} (trial allows up to {max_ecog})"
                ))
        
        return reasons[:4]  # Limit to top 4 reasons
    
    def _generate_what_to_confirm(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail
    ) -> List[ConfirmationItem]:
        """Generate list of items to confirm with oncologist"""
        items = []
        
        # ECOG soft downgrade
        if patient.ecog == 2:
            max_ecog = self._get_trial_max_ecog(trial)
            if max_ecog is not None and max_ecog < 2:
                items.append(ConfirmationItem(
                    item="ECOG Performance Status",
                    description="Confirm ECOG eligibility with oncologist (trial requires 0-1)",
                    priority="high"
                ))
        
        # Unknown biomarkers
        for criterion in trial.eligibility_criteria:
            if criterion.category == "biomarker" and criterion.required:
                biomarker_name = self._extract_biomarker_name(criterion.criterion)
                if biomarker_name and biomarker_name in patient.biomarkers:
                    status = patient.biomarkers[biomarker_name]
                    if status.status == "unknown":
                        items.append(ConfirmationItem(
                            item=f"{biomarker_name} Status",
                            description=f"Confirm {biomarker_name} testing results",
                            priority="high"
                        ))
        
        # Washout period
        if len(patient.prior_therapies) > 0:
            items.append(ConfirmationItem(
                item="Washout Period",
                description="Confirm adequate washout from last therapy (typically 14-21 days)",
                priority="medium"
            ))
        
        return items[:3]  # Limit to top 3 items
    
    def _extract_patient_burden(self, trial: TrialFullDetail) -> Dict[str, Any]:
        """Extract patient burden information from trial metadata"""
        burden = {
            "visits_per_month": None,
            "imaging_frequency": None,
            "biopsy_required": None,
            "hospital_stays": None
        }
        
        for metadata in trial.metadata_fields:
            if metadata.field_name == "burden.visitsPerMonth":
                burden["visits_per_month"] = metadata.field_value
            elif metadata.field_name == "burden.imagingFrequency":
                burden["imaging_frequency"] = metadata.field_value
            elif metadata.field_name == "burden.biopsyRequired":
                burden["biopsy_required"] = metadata.field_value.lower() == "true"
            elif metadata.field_name == "burden.hospitalStays":
                burden["hospital_stays"] = metadata.field_value.lower() == "true"
        
        return burden
    
    # Helper methods
    
    def _extract_max_ecog(self, criterion: str) -> int:
        """Extract maximum ECOG from criterion text"""
        criterion_lower = criterion.lower()
        if "ecog 0-1" in criterion_lower or "ecog 0 or 1" in criterion_lower:
            return 1
        elif "ecog 0-2" in criterion_lower or "ecog 0, 1, or 2" in criterion_lower:
            return 2
        elif "ecog 0-3" in criterion_lower:
            return 3
        return None
    
    def _get_trial_max_ecog(self, trial: TrialFullDetail) -> int:
        """Get trial's maximum allowed ECOG"""
        for criterion in trial.eligibility_criteria:
            if criterion.category == "ecog":
                return self._extract_max_ecog(criterion.criterion)
        return None
    
    def _all_biomarkers_match(self, patient: PatientProfile, trial: TrialFullDetail) -> bool:
        """Check if all major biomarkers match"""
        required_biomarkers = []
        
        for criterion in trial.eligibility_criteria:
            if criterion.category == "biomarker" and criterion.required:
                biomarker_name = self._extract_biomarker_name(criterion.criterion)
                if biomarker_name:
                    required_biomarkers.append(biomarker_name)
        
        if not required_biomarkers:
            return False
        
        for biomarker in required_biomarkers:
            if biomarker not in patient.biomarkers:
                return False
            if patient.biomarkers[biomarker].status == "unknown":
                return False
        
        return True
    
    def _has_critical_unknown_biomarker(
        self, 
        patient: PatientProfile, 
        trial: TrialFullDetail
    ) -> bool:
        """Check if any critical biomarker is unknown"""
        for criterion in trial.eligibility_criteria:
            if criterion.category == "biomarker" and criterion.required:
                biomarker_name = self._extract_biomarker_name(criterion.criterion)
                if biomarker_name and biomarker_name in patient.biomarkers:
                    if patient.biomarkers[biomarker_name].status == "unknown":
                        return True
        return False
    
    def _is_first_line_trial(self, trial: TrialFullDetail) -> bool:
        """Check if trial is for first-line therapy"""
        for metadata in trial.metadata_fields:
            if metadata.field_name == "lineOfTherapy":
                return "first" in metadata.field_value.lower()
        return False
    
    def _extract_biomarker_name(self, criterion: str) -> str:
        """Extract biomarker name from criterion text"""
        criterion_upper = criterion.upper()
        
        # Common biomarkers
        biomarkers = ["HER2", "ER", "PR", "EGFR", "ALK", "ROS1", "KRAS", "MET", "PD-L1"]
        
        for biomarker in biomarkers:
            if biomarker in criterion_upper:
                return biomarker
        
        return None