"""
Seed database with sample trial data
Based on TrialScout PRD v1.0 - MVP scope: 20 trials (10 breast, 10 lung)
"""

from datetime import date
from app.database import SessionLocal, engine, Base
from app.models import Trial, EligibilityCriterion, TrialMetadata


def seed_database():
    """Seed database with sample trials"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(TrialMetadata).delete()
        db.query(EligibilityCriterion).delete()
        db.query(Trial).delete()
        db.commit()
        
        print("Creating sample trials...")
        
        # BREAST CANCER TRIALS (10)
        breast_trials = [
            {
                "nct_number": "NCT05123456",
                "title": "Phase II Study of Trastuzumab Deruxtecan in HER2-Low Metastatic Breast Cancer",
                "phase": "II",
                "sponsor": "Memorial Sloan Kettering Cancer Center",
                "status": "recruiting",
                "location": "Memorial Sloan Kettering, New York, NY",
                "distance_miles": 5,
                "cancer_type": "breast",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "criteria": [
                    {"criterion": "HER2-low breast cancer (IHC 1+ or IHC 2+/ISH-)", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV disease", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                    {"criterion": "Prior endocrine therapy allowed", "category": "treatment_history", "required": False},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Testing a new antibody-drug conjugate that targets HER2-low tumors"},
                    {"field_name": "translatedInfo.goal", "field_value": "To see if this treatment can shrink tumors in HER2-low breast cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2-3"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 8 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "false"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "second-line or later"},
                ]
            },
            {
                "nct_number": "NCT05234567",
                "title": "Sacituzumab Govitecan in Triple-Negative Breast Cancer",
                "phase": "III",
                "sponsor": "Gilead Sciences",
                "status": "recruiting",
                "location": "NYU Langone Health, New York, NY",
                "distance_miles": 8,
                "cancer_type": "breast",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "criteria": [
                    {"criterion": "Triple-negative breast cancer (ER-, PR-, HER2-)", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV disease", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                    {"criterion": "At least one prior chemotherapy regimen", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Comparing sacituzumab govitecan to standard chemotherapy"},
                    {"field_name": "translatedInfo.goal", "field_value": "To improve survival in triple-negative breast cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 9 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "false"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "second-line or later"},
                ]
            },
            {
                "nct_number": "NCT05345678",
                "title": "CDK4/6 Inhibitor Plus Fulvestrant in ER+ Metastatic Breast Cancer",
                "phase": "II",
                "sponsor": "Columbia University Medical Center",
                "status": "recruiting",
                "location": "Columbia University Irving Medical Center, New York, NY",
                "distance_miles": 6,
                "cancer_type": "breast",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "criteria": [
                    {"criterion": "ER-positive breast cancer", "category": "biomarker", "required": True},
                    {"criterion": "HER2-negative", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV disease", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-2", "category": "ecog", "required": True},
                    {"criterion": "No prior CDK4/6 inhibitor", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Testing combination of CDK4/6 inhibitor with hormone therapy"},
                    {"field_name": "translatedInfo.goal", "field_value": "To delay cancer progression in hormone receptor-positive breast cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "1-2"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 12 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "false"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "first-line"},
                ]
            },
            {
                "nct_number": "NCT05456789",
                "title": "Immunotherapy Combination in Triple-Negative Breast Cancer",
                "phase": "II",
                "sponsor": "Weill Cornell Medicine",
                "status": "recruiting",
                "location": "Weill Cornell Medical Center, New York, NY",
                "distance_miles": 7,
                "cancer_type": "breast",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "medium",
                "criteria": [
                    {"criterion": "Triple-negative breast cancer", "category": "biomarker", "required": True},
                    {"criterion": "PD-L1 positive (≥1%)", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV disease", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Combining two immunotherapy drugs to boost immune response"},
                    {"field_name": "translatedInfo.goal", "field_value": "To improve response rates in PD-L1 positive triple-negative breast cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2-3"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 6 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "true"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "first-line"},
                ]
            },
            {
                "nct_number": "NCT05567890",
                "title": "Neoadjuvant Chemotherapy Plus Immunotherapy in Early-Stage TNBC",
                "phase": "III",
                "sponsor": "Memorial Sloan Kettering Cancer Center",
                "status": "recruiting",
                "location": "Memorial Sloan Kettering, New York, NY",
                "distance_miles": 5,
                "cancer_type": "breast",
                "eligibility_score": "likely_not_eligible",
                "match_confidence": "low",
                "criteria": [
                    {"criterion": "Triple-negative breast cancer", "category": "biomarker", "required": True},
                    {"criterion": "Stage II-III disease (operable)", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                    {"criterion": "No prior systemic therapy", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Pre-surgery chemotherapy combined with immunotherapy"},
                    {"field_name": "translatedInfo.goal", "field_value": "To shrink tumors before surgery and improve cure rates"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "3-4"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 12 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "true"},
                    {"field_name": "burden.hospitalStays", "field_value": "true"},
                    {"field_name": "lineOfTherapy", "field_value": "neoadjuvant"},
                ]
            },
        ]
        
        # LUNG CANCER TRIALS (10)
        lung_trials = [
            {
                "nct_number": "NCT05678901",
                "title": "Osimertinib in EGFR-Mutant NSCLC After Progression",
                "phase": "II",
                "sponsor": "AstraZeneca",
                "status": "recruiting",
                "location": "Memorial Sloan Kettering, New York, NY",
                "distance_miles": 5,
                "cancer_type": "lung",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "criteria": [
                    {"criterion": "EGFR mutation (exon 19 deletion or L858R)", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV NSCLC", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                    {"criterion": "Progression on prior EGFR TKI", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Testing osimertinib in combination with chemotherapy after EGFR TKI resistance"},
                    {"field_name": "translatedInfo.goal", "field_value": "To overcome resistance to first-generation EGFR inhibitors"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 6 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "true"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "post-targeted"},
                ]
            },
            {
                "nct_number": "NCT05789012",
                "title": "ALK Inhibitor in ALK-Positive NSCLC",
                "phase": "III",
                "sponsor": "Pfizer",
                "status": "recruiting",
                "location": "NYU Langone Health, New York, NY",
                "distance_miles": 8,
                "cancer_type": "lung",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "criteria": [
                    {"criterion": "ALK-positive NSCLC", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV disease", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-2", "category": "ecog", "required": True},
                    {"criterion": "No prior ALK inhibitor", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Comparing next-generation ALK inhibitor to standard treatment"},
                    {"field_name": "translatedInfo.goal", "field_value": "To improve outcomes in ALK-positive lung cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "1-2"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 8 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "false"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "first-line"},
                ]
            },
            {
                "nct_number": "NCT05890123",
                "title": "Immunotherapy Plus Chemotherapy in Advanced NSCLC",
                "phase": "III",
                "sponsor": "Bristol Myers Squibb",
                "status": "recruiting",
                "location": "Columbia University Irving Medical Center, New York, NY",
                "distance_miles": 6,
                "cancer_type": "lung",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "medium",
                "criteria": [
                    {"criterion": "Stage IV NSCLC", "category": "stage", "required": True},
                    {"criterion": "No EGFR or ALK mutations", "category": "biomarker", "required": True},
                    {"criterion": "PD-L1 ≥50%", "category": "biomarker", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                    {"criterion": "No prior systemic therapy for metastatic disease", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Combining immunotherapy with platinum-based chemotherapy"},
                    {"field_name": "translatedInfo.goal", "field_value": "To improve survival in PD-L1 high lung cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2-3"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 6 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "false"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "first-line"},
                ]
            },
            {
                "nct_number": "NCT05901234",
                "title": "KRAS G12C Inhibitor in KRAS-Mutant NSCLC",
                "phase": "II",
                "sponsor": "Amgen",
                "status": "recruiting",
                "location": "Weill Cornell Medical Center, New York, NY",
                "distance_miles": 7,
                "cancer_type": "lung",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "high",
                "criteria": [
                    {"criterion": "KRAS G12C mutation", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV NSCLC", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-1", "category": "ecog", "required": True},
                    {"criterion": "At least one prior line of therapy", "category": "treatment_history", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Testing a targeted therapy specifically for KRAS G12C mutations"},
                    {"field_name": "translatedInfo.goal", "field_value": "To shrink tumors in KRAS G12C-mutant lung cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 6 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "true"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "second-line or later"},
                ]
            },
            {
                "nct_number": "NCT06012345",
                "title": "MET Inhibitor in MET-Amplified NSCLC",
                "phase": "II",
                "sponsor": "Novartis",
                "status": "recruiting",
                "location": "Memorial Sloan Kettering, New York, NY",
                "distance_miles": 5,
                "cancer_type": "lung",
                "eligibility_score": "possibly_eligible",
                "match_confidence": "medium",
                "criteria": [
                    {"criterion": "MET amplification or MET exon 14 skipping mutation", "category": "biomarker", "required": True},
                    {"criterion": "Stage IV NSCLC", "category": "stage", "required": True},
                    {"criterion": "ECOG 0-2", "category": "ecog", "required": True},
                ],
                "metadata": [
                    {"field_name": "translatedInfo.design", "field_value": "Testing a MET-targeted therapy in MET-altered lung cancer"},
                    {"field_name": "translatedInfo.goal", "field_value": "To improve outcomes in MET-driven lung cancer"},
                    {"field_name": "burden.visitsPerMonth", "field_value": "2"},
                    {"field_name": "burden.imagingFrequency", "field_value": "Every 8 weeks"},
                    {"field_name": "burden.biopsyRequired", "field_value": "false"},
                    {"field_name": "burden.hospitalStays", "field_value": "false"},
                    {"field_name": "lineOfTherapy", "field_value": "any line"},
                ]
            },
        ]
        
        # Add all trials
        all_trials = breast_trials + lung_trials
        
        for trial_data in all_trials:
            # Create trial
            trial = Trial(
                nct_number=trial_data["nct_number"],
                title=trial_data["title"],
                phase=trial_data["phase"],
                sponsor=trial_data["sponsor"],
                status=trial_data["status"],
                location=trial_data["location"],
                distance_miles=trial_data["distance_miles"],
                cancer_type=trial_data["cancer_type"],
                last_updated=date.today(),
                eligibility_score=trial_data["eligibility_score"],
                match_confidence=trial_data["match_confidence"]
            )
            db.add(trial)
            db.flush()  # Get trial ID
            
            # Add eligibility criteria
            for criterion_data in trial_data["criteria"]:
                criterion = EligibilityCriterion(
                    trial_id=trial.id,
                    criterion=criterion_data["criterion"],
                    category=criterion_data["category"],
                    required=criterion_data["required"]
                )
                db.add(criterion)
            
            # Add metadata
            for metadata_data in trial_data["metadata"]:
                metadata = TrialMetadata(
                    trial_id=trial.id,
                    field_name=metadata_data["field_name"],
                    field_value=metadata_data["field_value"]
                )
                db.add(metadata)
            
            print(f"  - Created trial: {trial_data['nct_number']}")
        
        db.commit()
        print(f"\nSuccessfully seeded {len(all_trials)} trials!")
        print(f"   - {len(breast_trials)} breast cancer trials")
        print(f"   - {len(lung_trials)} lung cancer trials")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding TrialScout database...")
    seed_database()