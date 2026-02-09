"""
Complete Mock Trial Data for TrialScout Backend
================================================
This file contains all 20 clinical trials for the MVP:
- 10 Breast Cancer Trials (bc_trial_001 through bc_trial_010)
- 10 NSCLC Trials (lung_trial_001 through lung_trial_010)

INSTRUCTIONS FOR SNAPDEV:
1. Place this file at: app/data/mock_trials.py
2. Verify all imports work
3. Test: from app.data.mock_trials import TRIALS
4. Verify: len(TRIALS) == 20
"""

from typing import List
from app.models.trial import (
    Trial,
    EligibilityCriterion,
    PatientBurden,
    ExclusionRisks,
    TranslatedInfo
)

# IMPORTANT: Use mutable list for CRUD operations
TRIALS: List[Trial] = [
    # ========================================================================
    # BREAST CANCER TRIALS (10 trials)
    # ========================================================================
    
    # bc_trial_001
    Trial(
        id="bc_trial_001",
        nct_number="NCT05234567",
        title="DESTINY-Breast06: Trastuzumab Deruxtecan in HER2-Low Metastatic Breast Cancer",
        phase="Phase III",
        sponsor="Daiichi Sankyo",
        status="recruiting",
        location="Memorial Sloan Kettering Cancer Center, New York, NY",
        distance=8,
        cancer_type="breast",
        last_updated="2025-01-15",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "HER2-low (IHC 1+ or IHC 2+/ISH-) status matches",
            "Stage IV breast cancer confirmed",
            "Prior chemotherapy aligns with inclusion",
            "ER-positive status matches criteria"
        ],
        what_to_confirm=[
            "Verify HER2 IHC 1+ or IHC 2+/ISH-negative status",
            "Check LVEF ≥50% requirement",
            "Confirm 21-day washout from last therapy"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="HER2-low breast cancer (IHC 1+ or IHC 2+/ISH-)", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV or locally recurrent inoperable", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior treatment with 1-2 chemotherapy regimens", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG performance status 0-1", met="unknown", category="performance"),
            EligibilityCriterion(criterion="LVEF ≥50%", met="unknown", category="organ_function")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="Prior trastuzumab deruxtecan",
            washout_window="21 days from last systemic therapy",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL",
            brain_mets="Treated and stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="A targeted antibody-drug conjugate that delivers chemotherapy directly to HER2-low cancer cells. Participants receive either T-DXd or physician's choice chemotherapy.",
            goal="To see if trastuzumab deruxtecan works better than standard chemotherapy for HER2-low metastatic breast cancer.",
            what_happens="You'll receive an IV infusion every 3 weeks. Scans every 6 weeks to check tumor response. Blood tests at each visit.",
            duration="Treatment continues as long as it's working and side effects are manageable, typically 12-18 months on average."
        )
    ),
    
    # bc_trial_002
    Trial(
        id="bc_trial_002",
        nct_number="NCT05789234",
        title="Sacituzumab Govitecan vs Chemotherapy in HR+/HER2- Metastatic Breast Cancer (TROPiCS-02)",
        phase="Phase III",
        sponsor="Gilead Sciences",
        status="recruiting",
        location="NYU Langone Health, New York, NY",
        distance=12,
        cancer_type="breast",
        last_updated="2025-01-20",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "ER-positive, HER2-negative status confirmed",
            "Stage IV metastatic breast cancer",
            "Prior endocrine therapy and chemotherapy",
            "ECOG 0-1 aligns with criteria"
        ],
        what_to_confirm=[
            "Confirm ≥2 prior chemotherapy regimens for metastatic disease",
            "Verify no active brain metastases",
            "Check adequate bone marrow function"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="ER+ and/or PR+ breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="HER2-negative (IHC 0/1+ or ISH-)", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Metastatic breast cancer", met=True, category="stage"),
            EligibilityCriterion(criterion="≥2 prior lines of chemotherapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met=True, category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior Trop-2 targeting agents",
            washout_window="14 days from last chemotherapy",
            lab_thresholds="ANC ≥1500/μL, Hemoglobin ≥9 g/dL",
            brain_mets="Untreated or unstable brain metastases excluded"
        ),
        translated_info=TranslatedInfo(
            design="An antibody-drug conjugate that targets TROP-2 protein on cancer cells. Compares sacituzumab govitecan to standard chemotherapy chosen by your doctor.",
            goal="To determine if sacituzumab govitecan extends life longer than standard chemotherapy in hormone receptor-positive, HER2-negative metastatic breast cancer.",
            what_happens="IV infusion on days 1 and 8 of each 21-day cycle. Scans every 2 months. Blood work at each visit to monitor side effects.",
            duration="Treatment continues until disease progression or unacceptable side effects, typically 9-15 months."
        )
    ),
    
    # bc_trial_003
    Trial(
        id="bc_trial_003",
        nct_number="NCT06926868",
        title="Izalontamab Brengitecan vs Chemotherapy in Metastatic Triple-Negative Breast Cancer (IZABRIGHT-01)",
        phase="Phase II/III",
        sponsor="Bristol-Myers Squibb",
        status="recruiting",
        location="Columbia University Medical Center, New York, NY",
        distance=15,
        cancer_type="breast",
        last_updated="2025-02-01",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "Triple-negative breast cancer confirmed",
            "Stage IV metastatic disease",
            "First-line setting matches trial criteria",
            "Not eligible for immunotherapy"
        ],
        what_to_confirm=[
            "Confirm PD-L1 negative or contraindication to immunotherapy",
            "Verify no prior systemic therapy for metastatic disease",
            "Check adequate organ function"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="Triple-negative breast cancer (ER-, PR-, HER2-)", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Locally advanced or metastatic disease", met=True, category="stage"),
            EligibilityCriterion(criterion="Not eligible for anti-PD(L)1 therapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="No prior systemic therapy for metastatic disease", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 9 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior systemic therapy for metastatic TNBC",
            washout_window="Not applicable for first-line",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL, Creatinine clearance ≥50 mL/min",
            brain_mets="Stable, treated brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="A novel bi-specific antibody-drug conjugate targeting both EGFR and HER3 proteins. Compares iza-bren to standard chemotherapy (physician's choice of paclitaxel, nab-paclitaxel, carboplatin/gemcitabine, or capecitabine).",
            goal="To test whether iza-bren works better than standard chemotherapy as first-line treatment for metastatic triple-negative breast cancer in patients not eligible for immunotherapy.",
            what_happens="IV infusion every 3 weeks. Regular blood tests and scans every 9 weeks to monitor response. Side effect management with support medications.",
            duration="Treatment continues as long as cancer doesn't progress and side effects are tolerable, average 8-12 months."
        )
    ),
    
    # bc_trial_004
    Trial(
        id="bc_trial_004",
        nct_number="NCT05456789",
        title="Elacestrant vs Standard Endocrine Therapy in ESR1-Mutant ER+/HER2- Advanced Breast Cancer (EMERALD)",
        phase="Phase III",
        sponsor="Stemline Therapeutics",
        status="recruiting",
        location="Weill Cornell Medicine, New York, NY",
        distance=10,
        cancer_type="breast",
        last_updated="2025-01-25",
        eligibility_score="possibly_eligible",
        match_confidence="medium",
        why_matched=[
            "ER-positive, HER2-negative breast cancer",
            "Advanced/metastatic disease",
            "Prior CDK4/6 inhibitor and endocrine therapy"
        ],
        what_to_confirm=[
            "Confirm ESR1 mutation in ctDNA or tumor tissue",
            "Verify disease progression on prior CDK4/6 inhibitor",
            "Check if 1-2 lines of endocrine therapy received"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="ER+/HER2- breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="ESR1 mutation detected", met="unknown", category="biomarker"),
            EligibilityCriterion(criterion="Advanced or metastatic disease", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior CDK4/6 inhibitor", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="1-2 prior lines of endocrine therapy", met=True, category="treatment_history")
        ],
        burden=PatientBurden(visits_per_month=1, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior selective ER degrader (SERD)",
            washout_window="14 days from prior endocrine therapy",
            lab_thresholds="Standard organ function requirements",
            brain_mets="Stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="An oral selective estrogen receptor degrader (SERD) that works even when cancer has ESR1 mutations. Compares elacestrant to standard hormonal therapy (aromatase inhibitor or fulvestrant).",
            goal="To see if elacestrant works better than standard hormone therapy in patients whose cancer has ESR1 mutations and has grown on a CDK4/6 inhibitor.",
            what_happens="Take one pill daily by mouth. Monthly clinic visits for blood work. Scans every 8 weeks to check response.",
            duration="Continue daily pills as long as cancer is controlled and side effects are manageable, typically 12-24 months."
        )
    ),
    
    # bc_trial_005
    Trial(
        id="bc_trial_005",
        nct_number="NCT05678912",
        title="Datopotamab Deruxtecan in HR+/HER2- or Triple-Negative Metastatic Breast Cancer (TROPION-Breast01)",
        phase="Phase III",
        sponsor="AstraZeneca",
        status="recruiting",
        location="Mount Sinai Hospital, New York, NY",
        distance=9,
        cancer_type="breast",
        last_updated="2025-01-18",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "ER-positive, HER2-negative breast cancer",
            "Metastatic disease requiring chemotherapy",
            "Prior CDK4/6 inhibitor and endocrine therapy",
            "2-3 prior lines of treatment matches criteria"
        ],
        what_to_confirm=[
            "Verify 2-3 prior lines of systemic therapy",
            "Confirm adequate lung function (no ILD history)",
            "Check ECOG performance status 0-1"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="HR+ and HER2- breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Metastatic breast cancer", met=True, category="stage"),
            EligibilityCriterion(criterion="2-3 prior lines of therapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="Prior CDK4/6 inhibitor required", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior TROP-2 ADC",
            washout_window="21 days from last chemotherapy",
            lab_thresholds="ANC ≥1000/μL, normal LFTs",
            brain_mets="Controlled brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="An antibody-drug conjugate targeting TROP-2 protein with a topoisomerase inhibitor payload. Compares dato-DXd to chemotherapy chosen by your physician.",
            goal="To determine if datopotamab deruxtecan is more effective than standard chemotherapy in heavily pre-treated HR+/HER2- metastatic breast cancer.",
            what_happens="IV infusion every 3 weeks. Scans every 6 weeks. Blood tests at each visit. Monitoring for lung symptoms.",
            duration="Treatment continues until disease progression or side effects become too severe, average 10-15 months."
        )
    ),
    
    # bc_trial_006
    Trial(
        id="bc_trial_006",
        nct_number="NCT05123456",
        title="Pembrolizumab + Chemotherapy vs Chemotherapy Alone in PD-L1+ Triple-Negative Breast Cancer (KEYNOTE-355)",
        phase="Phase III",
        sponsor="Merck Sharp & Dohme",
        status="recruiting",
        location="NYU Langone Health, New York, NY",
        distance=12,
        cancer_type="breast",
        last_updated="2025-01-22",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "Triple-negative breast cancer confirmed",
            "PD-L1 positive (CPS ≥10) matches criteria",
            "Metastatic disease, first-line setting",
            "No prior systemic therapy for metastatic disease"
        ],
        what_to_confirm=[
            "Confirm PD-L1 CPS ≥10 by IHC 22C3",
            "Verify no autoimmune conditions",
            "Check adequate organ function"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="Triple-negative breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="PD-L1 CPS ≥10", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Metastatic or locally recurrent inoperable", met=True, category="stage"),
            EligibilityCriterion(criterion="No prior chemotherapy for metastatic disease", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 9 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior anti-PD-1/PD-L1 therapy",
            washout_window="Not applicable for first-line",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL",
            brain_mets="Treated, stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Combines pembrolizumab immunotherapy with standard chemotherapy (paclitaxel, nab-paclitaxel, or carboplatin/gemcitabine). Participants randomly receive either combination or chemotherapy alone.",
            goal="To see if adding immunotherapy to chemotherapy helps patients with PD-L1 positive triple-negative breast cancer live longer.",
            what_happens="IV infusion every 3 weeks (pembrolizumab) plus weekly or bi-weekly chemotherapy. Scans every 9 weeks. Blood work regularly.",
            duration="Chemotherapy for 4-6 cycles, then pembrolizumab alone continues up to 2 years or until progression."
        )
    ),
    
    # bc_trial_007
    Trial(
        id="bc_trial_007",
        nct_number="NCT05891234",
        title="Capivasertib + Fulvestrant in PIK3CA/AKT1/PTEN-Altered HR+/HER2- Breast Cancer (CAPItello-291)",
        phase="Phase III",
        sponsor="AstraZeneca",
        status="recruiting",
        location="Memorial Sloan Kettering Cancer Center, New York, NY",
        distance=8,
        cancer_type="breast",
        last_updated="2025-02-03",
        eligibility_score="possibly_eligible",
        match_confidence="medium",
        why_matched=[
            "ER+/HER2- breast cancer confirmed",
            "Advanced/metastatic disease",
            "Prior aromatase inhibitor therapy"
        ],
        what_to_confirm=[
            "Confirm PIK3CA, AKT1, or PTEN alteration",
            "Verify diabetes control (if diabetic)",
            "Check prior CDK4/6 inhibitor exposure"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="ER+/HER2- breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="PIK3CA, AKT1, or PTEN alteration", met="unknown", category="biomarker"),
            EligibilityCriterion(criterion="Advanced or metastatic disease", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior aromatase inhibitor ± CDK4/6 inhibitor", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-2", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior AKT, PI3K, or mTOR inhibitors",
            washout_window="14 days from prior therapy",
            lab_thresholds="Fasting glucose <126 mg/dL, HbA1c <8%",
            brain_mets="Stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Combines capivasertib (AKT inhibitor) with fulvestrant hormone therapy. Participants with PIK3CA/AKT1/PTEN pathway alterations receive combination or fulvestrant alone.",
            goal="To test if adding an AKT inhibitor to hormone therapy works better than hormone therapy alone in patients with specific genetic alterations.",
            what_happens="Take capivasertib pills 4 days on, 3 days off each week. Fulvestrant injections on days 1, 15, 29, then monthly. Scans every 8 weeks.",
            duration="Treatment continues as long as cancer is controlled. Average 15-20 months for responders."
        )
    ),
    
    # bc_trial_008
    Trial(
        id="bc_trial_008",
        nct_number="NCT05567890",
        title="Tucatinib + Trastuzumab + Capecitabine in HER2+ Brain Metastases (HER2CLIMB-02)",
        phase="Phase II",
        sponsor="Seagen Inc.",
        status="recruiting",
        location="Columbia University Medical Center, New York, NY",
        distance=15,
        cancer_type="breast",
        last_updated="2025-01-28",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "HER2-positive breast cancer",
            "Brain metastases present",
            "Prior trastuzumab and pertuzumab",
            "Metastatic disease requiring treatment"
        ],
        what_to_confirm=[
            "Confirm active or progressing brain metastases",
            "Verify HER2 positivity by IHC 3+ or ISH+",
            "Check neurologic symptoms stability"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="HER2+ breast cancer (IHC 3+ or ISH+)", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Brain metastases (treated or untreated)", met=True, category="metastases"),
            EligibilityCriterion(criterion="Prior trastuzumab-based therapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="Metastatic breast cancer", met=True, category="stage"),
            EligibilityCriterion(criterion="ECOG 0-2", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Brain MRI every 6 weeks, body CT every 9 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="Prior tucatinib allowed",
            washout_window="14 days from last systemic therapy",
            lab_thresholds="ANC ≥1000/μL, adequate liver function",
            brain_mets="Active brain metastases are specifically included"
        ),
        translated_info=TranslatedInfo(
            design="Combines tucatinib (oral HER2 inhibitor that crosses blood-brain barrier) with trastuzumab and capecitabine. Specifically designed for patients with brain metastases.",
            goal="To see how well this triple combination controls brain metastases and extends progression-free survival in HER2+ breast cancer.",
            what_happens="Take tucatinib and capecitabine pills twice daily. Trastuzumab IV infusion every 3 weeks. Brain MRIs every 6 weeks.",
            duration="Treatment continues as long as brain and body disease is controlled, typically 12-18 months."
        )
    ),
    
    # bc_trial_009
    Trial(
        id="bc_trial_009",
        nct_number="NCT05789321",
        title="Rintodestrant (G1T48) vs Physician's Choice in ER+/HER2- Advanced Breast Cancer (persevERA)",
        phase="Phase III",
        sponsor="G1 Therapeutics",
        status="recruiting",
        location="Weill Cornell Medicine, New York, NY",
        distance=10,
        cancer_type="breast",
        last_updated="2025-01-30",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "ER+/HER2- breast cancer",
            "Advanced disease after CDK4/6 inhibitor",
            "2-3 prior lines of therapy",
            "Endocrine resistant disease"
        ],
        what_to_confirm=[
            "Verify prior CDK4/6 inhibitor and 1-2 endocrine therapies",
            "Confirm disease progression on/after last therapy",
            "Check QTc interval <470 msec"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="ER+ and HER2- breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Advanced or metastatic disease", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior CDK4/6 inhibitor required", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="1-2 prior endocrine therapies", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=1, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior oral SERD",
            washout_window="14 days from endocrine therapy",
            lab_thresholds="Standard organ function, QTc <470 msec",
            brain_mets="Stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="An oral selective estrogen receptor degrader (SERD) that maintains activity even after resistance to other hormone therapies. Compares rintodestrant to physician's choice of endocrine therapy.",
            goal="To determine if this oral SERD works better than other hormonal treatments in patients whose cancer has progressed on a CDK4/6 inhibitor.",
            what_happens="Take one pill daily by mouth. Monthly clinic visits. Scans every 8 weeks. EKGs to monitor heart rhythm.",
            duration="Continue daily until disease progression or intolerable side effects, typically 10-18 months."
        )
    ),
    
    # bc_trial_010
    Trial(
        id="bc_trial_010",
        nct_number="NCT05901234",
        title="Neoadjuvant Pembrolizumab + Chemotherapy in High-Risk Early Stage Triple-Negative Breast Cancer (KEYNOTE-522)",
        phase="Phase III",
        sponsor="Merck Sharp & Dohme",
        status="recruiting",
        location="Mount Sinai Hospital, New York, NY",
        distance=9,
        cancer_type="breast",
        last_updated="2025-02-02",
        eligibility_score="likely_not_eligible",
        match_confidence="low",
        why_matched=[
            "Triple-negative breast cancer",
            "Stage II-III disease"
        ],
        what_to_confirm=[
            "This trial is for newly diagnosed, early-stage TNBC before surgery",
            "Requires stage II-III disease (T1c-T4, N0-N2)",
            "Not appropriate for metastatic disease"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="Triple-negative breast cancer", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage II or III (early stage, not metastatic)", met=False, category="stage"),
            EligibilityCriterion(criterion="Tumor size ≥1.5 cm", met="unknown", category="stage"),
            EligibilityCriterion(criterion="Operable disease, surgery planned", met=False, category="treatment_history"),
            EligibilityCriterion(criterion="No prior therapy for breast cancer", met=False, category="treatment_history")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Baseline and pre-surgery", biopsy_required=True, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior treatment for breast cancer",
            washout_window="Not applicable",
            lab_thresholds="Standard organ function",
            brain_mets="No brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Neoadjuvant (before surgery) treatment combining pembrolizumab immunotherapy with standard chemotherapy (carboplatin/paclitaxel followed by AC/EC). Surgery after chemotherapy, then adjuvant pembrolizumab.",
            goal="To see if adding immunotherapy to chemotherapy before surgery increases cure rates in early-stage triple-negative breast cancer.",
            what_happens="12 weeks of weekly chemotherapy + pembrolizumab every 3 weeks, then 4 cycles of AC/EC, then surgery, then 9 cycles of pembrolizumab alone.",
            duration="Total treatment time approximately 12 months (6 months before surgery, 6 months after)."
        )
    ),
    
    # ========================================================================
    # NSCLC TRIALS (10 trials)
    # ========================================================================
    
    # lung_trial_001
    Trial(
        id="lung_trial_001",
        nct_number="NCT05894239",
        title="MARIPOSA-2: Amivantamab + Lazertinib in EGFR-Mutant NSCLC Post-Osimertinib",
        phase="Phase III",
        sponsor="Janssen Research & Development",
        status="recruiting",
        location="Memorial Sloan Kettering Cancer Center, New York, NY",
        distance=8,
        cancer_type="lung",
        last_updated="2025-01-28",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "EGFR-mutant NSCLC (exon 19 deletion or L858R)",
            "Stage IV disease matches trial requirement",
            "Prior osimertinib therapy aligns with inclusion",
            "ECOG 0-1 meets performance criteria"
        ],
        what_to_confirm=[
            "Confirm EGFR mutation type (exon 19 del or L858R required)",
            "Verify disease progression on osimertinib",
            "Check adequate organ function (liver, kidney)"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="EGFR-mutant NSCLC (exon 19 deletion or L858R)", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV or recurrent NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior osimertinib therapy required", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG performance status 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior amivantamab or lazertinib",
            washout_window="14 days from last systemic therapy",
            lab_thresholds="ANC ≥1000/μL, adequate liver function",
            brain_mets="Treated and stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Combines amivantamab (bispecific antibody targeting EGFR and MET) with lazertinib (third-generation EGFR inhibitor). Compares combination vs chemotherapy after osimertinib failure.",
            goal="To determine if amivantamab + lazertinib extends progression-free survival compared to chemotherapy in EGFR-mutant NSCLC patients who progressed on osimertinib.",
            what_happens="IV infusion of amivantamab weekly for 4 weeks, then every 2 weeks. Daily lazertinib pill. Scans every 6 weeks. Blood tests at each visit.",
            duration="Treatment continues until disease progression or intolerable side effects, typically 10-16 months."
        )
    ),
    
    # lung_trial_002
    Trial(
        id="lung_trial_002",
        nct_number="NCT05123457",
        title="FLAURA2: Osimertinib + Chemotherapy vs Osimertinib Alone in First-Line EGFR-Mutant NSCLC",
        phase="Phase III",
        sponsor="AstraZeneca",
        status="recruiting",
        location="NYU Langone Health, New York, NY",
        distance=12,
        cancer_type="lung",
        last_updated="2025-01-25",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "EGFR-mutant NSCLC (exon 19 deletion or L858R)",
            "Stage IV disease, first-line setting",
            "No prior systemic therapy for metastatic disease",
            "ECOG 0-1 meets criteria"
        ],
        what_to_confirm=[
            "Confirm EGFR mutation type via tissue or plasma testing",
            "Verify no prior EGFR TKI therapy",
            "Check adequate bone marrow and organ function"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="EGFR exon 19 deletion or L858R mutation", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="No prior systemic therapy for metastatic disease", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior EGFR TKI",
            washout_window="Not applicable (first-line)",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL",
            brain_mets="Asymptomatic or treated brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Compares osimertinib combined with platinum-based chemotherapy versus osimertinib alone as first-line treatment for EGFR-mutant advanced NSCLC.",
            goal="To determine if adding chemotherapy to osimertinib improves outcomes compared to osimertinib alone in treatment-naive EGFR-mutant NSCLC.",
            what_happens="Daily osimertinib pill. If randomized to combination arm, also receive IV chemotherapy every 3 weeks for 4 cycles. Scans every 6 weeks.",
            duration="Osimertinib continues until progression. Chemotherapy for 4 cycles (12 weeks). Typical total duration 18-24 months."
        )
    ),
    
    # lung_trial_003
    Trial(
        id="lung_trial_003",
        nct_number="NCT05234789",
        title="CodeBreaK 200: Sotorasib vs Docetaxel in KRAS G12C-Mutant NSCLC",
        phase="Phase III",
        sponsor="Amgen",
        status="recruiting",
        location="Columbia University Medical Center, New York, NY",
        distance=15,
        cancer_type="lung",
        last_updated="2025-01-30",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "KRAS G12C mutation confirmed",
            "Stage IV NSCLC",
            "Prior platinum-based chemotherapy",
            "Second-line or later setting"
        ],
        what_to_confirm=[
            "Confirm KRAS G12C mutation by NGS or other validated test",
            "Verify at least one prior line of systemic therapy",
            "Check for uncommon co-mutations that may affect eligibility"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="KRAS G12C mutation", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Locally advanced or metastatic NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior platinum-based chemotherapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior KRAS G12C inhibitor",
            washout_window="21 days from last chemotherapy",
            lab_thresholds="ANC ≥1500/μL, adequate liver/renal function",
            brain_mets="Treated, asymptomatic brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Compares sotorasib (KRAS G12C inhibitor) to docetaxel chemotherapy in patients with KRAS G12C-mutant NSCLC who have received prior therapy.",
            goal="To determine if sotorasib, a targeted therapy for KRAS G12C mutation, is more effective than standard chemotherapy.",
            what_happens="Take sotorasib pills daily by mouth OR receive IV docetaxel every 3 weeks (depending on randomization). Scans every 6 weeks. Blood tests at each visit.",
            duration="Treatment continues until disease progression or intolerable side effects, typically 6-12 months."
        )
    ),
    
    # lung_trial_004
    Trial(
        id="lung_trial_004",
        nct_number="NCT05345890",
        title="CROWN: Lorlatinib vs Crizotinib in Advanced ALK-Positive NSCLC",
        phase="Phase III",
        sponsor="Pfizer",
        status="recruiting",
        location="Weill Cornell Medicine, New York, NY",
        distance=10,
        cancer_type="lung",
        last_updated="2025-02-02",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "ALK-positive NSCLC confirmed",
            "Stage IV or recurrent disease",
            "First-line or post-first-generation ALK TKI",
            "ECOG 0-2 aligns with criteria"
        ],
        what_to_confirm=[
            "Confirm ALK rearrangement by FISH, IHC, or NGS",
            "Verify no prior second or third-generation ALK inhibitors",
            "Check for CNS metastases (allowed but need baseline brain MRI)"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="ALK-positive NSCLC", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV or recurrent NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="No prior second or third-generation ALK TKI", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-2", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=1, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior lorlatinib, alectinib, brigatinib, or ceritinib",
            washout_window="14 days from prior therapy",
            lab_thresholds="ANC ≥1000/μL, adequate liver function",
            brain_mets="CNS metastases allowed (including untreated)"
        ),
        translated_info=TranslatedInfo(
            design="Compares lorlatinib (third-generation ALK inhibitor) to crizotinib (first-generation) in treatment-naive or minimally pre-treated ALK-positive NSCLC.",
            goal="To determine if lorlatinib, which has better brain penetration, is superior to crizotinib in ALK-positive NSCLC, especially for preventing or treating brain metastases.",
            what_happens="Take lorlatinib or crizotinib pills daily. Brain MRI every 8 weeks for first year, then every 12 weeks. Body scans every 8 weeks. Monthly visits initially.",
            duration="Treatment continues until progression, typically 24-36 months for responders."
        )
    ),
    
    # lung_trial_005
    Trial(
        id="lung_trial_005",
        nct_number="NCT05456901",
        title="KEYNOTE-024: Pembrolizumab vs Chemotherapy in PD-L1 High NSCLC",
        phase="Phase III",
        sponsor="Merck Sharp & Dohme",
        status="recruiting",
        location="Mount Sinai Hospital, New York, NY",
        distance=9,
        cancer_type="lung",
        last_updated="2025-01-27",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "PD-L1 TPS ≥50% confirmed",
            "Stage IV NSCLC, no EGFR or ALK alterations",
            "First-line setting",
            "ECOG 0-1 meets criteria"
        ],
        what_to_confirm=[
            "Confirm PD-L1 TPS ≥50% by validated assay (22C3 pharmDx)",
            "Verify absence of EGFR mutations and ALK rearrangements",
            "Check for autoimmune conditions or need for immunosuppression"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="PD-L1 TPS ≥50%", met=True, category="biomarker"),
            EligibilityCriterion(criterion="No EGFR mutations or ALK rearrangements", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="No prior systemic therapy for metastatic disease", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=1, imaging_frequency="Every 9 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior anti-PD-1/PD-L1 therapy",
            washout_window="Not applicable (first-line)",
            lab_thresholds="ANC ≥1500/μL, adequate organ function",
            brain_mets="Treated, stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Compares pembrolizumab immunotherapy alone versus platinum-based chemotherapy in patients with high PD-L1 expression and no EGFR/ALK alterations.",
            goal="To determine if pembrolizumab monotherapy is superior to chemotherapy in first-line treatment of NSCLC with PD-L1 TPS ≥50%.",
            what_happens="IV infusion of pembrolizumab every 3 weeks (30 minutes) OR standard chemotherapy every 3 weeks. Scans every 9 weeks. Blood tests at each visit.",
            duration="Pembrolizumab for up to 2 years or until progression. Chemotherapy typically 4-6 cycles. Average duration 12-18 months."
        )
    ),
    
    # lung_trial_006
    Trial(
        id="lung_trial_006",
        nct_number="NCT05567012",
        title="KEYNOTE-189: Pembrolizumab + Chemotherapy in Non-Squamous NSCLC Without Driver Mutations",
        phase="Phase III",
        sponsor="Merck Sharp & Dohme",
        status="recruiting",
        location="Memorial Sloan Kettering Cancer Center, New York, NY",
        distance=8,
        cancer_type="lung",
        last_updated="2025-02-03",
        eligibility_score="possibly_eligible",
        match_confidence="high",
        why_matched=[
            "Non-squamous NSCLC without EGFR or ALK alterations",
            "Stage IV disease, first-line setting",
            "No prior systemic therapy for metastatic disease",
            "Any PD-L1 expression level accepted"
        ],
        what_to_confirm=[
            "Confirm absence of EGFR mutations, ALK, and ROS1 rearrangements",
            "Verify no contraindications to immunotherapy",
            "Check adequate organ function for chemotherapy"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="Non-squamous NSCLC", met=True, category="histology"),
            EligibilityCriterion(criterion="No EGFR, ALK, or ROS1 alterations", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV or recurrent NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="No prior systemic therapy for metastatic disease", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 9 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior systemic therapy for metastatic disease",
            washout_window="Not applicable (first-line)",
            lab_thresholds="ANC ≥1500/μL, Platelets ≥100,000/μL",
            brain_mets="Treated, stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Combines pembrolizumab immunotherapy with carboplatin and pemetrexed chemotherapy. Compares combination to chemotherapy alone in non-squamous NSCLC without driver mutations.",
            goal="To determine if adding pembrolizumab to standard chemotherapy improves survival in non-squamous NSCLC patients without EGFR, ALK, or ROS1 alterations.",
            what_happens="IV pembrolizumab + carboplatin + pemetrexed every 3 weeks for 4 cycles, then pembrolizumab + pemetrexed maintenance until progression. Scans every 9 weeks.",
            duration="Induction chemotherapy 4 cycles (12 weeks), then maintenance with pembrolizumab + pemetrexed for up to 2 years or until progression. Typical total 12-18 months."
        )
    ),
    
    # lung_trial_007
    Trial(
        id="lung_trial_007",
        nct_number="NCT05678123",
        title="VISION: Tepotinib in MET Exon 14 Skipping NSCLC",
        phase="Phase II",
        sponsor="Merck KGaA",
        status="recruiting",
        location="NYU Langone Health, New York, NY",
        distance=12,
        cancer_type="lung",
        last_updated="2025-01-29",
        eligibility_score="possibly_eligible",
        match_confidence="medium",
        why_matched=[
            "MET exon 14 skipping mutation detected",
            "Stage IV NSCLC",
            "Any line of therapy accepted"
        ],
        what_to_confirm=[
            "Confirm MET exon 14 skipping by NGS or RT-PCR",
            "Verify no prior MET inhibitor therapy",
            "Check for MET amplification (if present, may affect dosing)"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="MET exon 14 skipping mutation", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Stage IV or recurrent NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="Any line of therapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-2", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=1, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior MET inhibitor",
            washout_window="14 days from last systemic therapy",
            lab_thresholds="Adequate liver and renal function",
            brain_mets="Asymptomatic or treated brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Single-arm study of tepotinib, a highly selective MET inhibitor, in patients with MET exon 14 skipping mutations. No comparison arm.",
            goal="To evaluate the efficacy and safety of tepotinib in NSCLC patients with MET exon 14 skipping mutations, a rare but targetable alteration.",
            what_happens="Take tepotinib pills daily by mouth. Scans every 6 weeks. Monthly clinic visits for first 3 months, then every 6 weeks. Blood tests at each visit.",
            duration="Treatment continues until disease progression or intolerable side effects, typically 12-18 months for responders."
        )
    ),
    
    # lung_trial_008
    Trial(
        id="lung_trial_008",
        nct_number="NCT05789235",
        title="TRIDENT-1: Repotrectinib in ROS1-Positive NSCLC",
        phase="Phase II",
        sponsor="Turning Point Therapeutics",
        status="recruiting",
        location="Columbia University Medical Center, New York, NY",
        distance=15,
        cancer_type="lung",
        last_updated="2025-02-01",
        eligibility_score="possibly_eligible",
        match_confidence="medium",
        why_matched=[
            "ROS1 rearrangement confirmed",
            "Stage IV NSCLC",
            "Any line of therapy"
        ],
        what_to_confirm=[
            "Confirm ROS1 rearrangement by FISH, IHC, or NGS",
            "Document prior ROS1 TKI therapy if received",
            "Check for CNS metastases (allowed)"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="ROS1 rearrangement", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Advanced or metastatic NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="Treatment-naive or TKI pre-treated accepted", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-2", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=1, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="Prior ROS1 TKI allowed",
            washout_window="14 days from last therapy",
            lab_thresholds="Adequate bone marrow and organ function",
            brain_mets="CNS metastases allowed (including untreated if asymptomatic)"
        ),
        translated_info=TranslatedInfo(
            design="Single-arm study of repotrectinib, a next-generation ROS1/TRK inhibitor with CNS penetration. Enrolls both TKI-naive and TKI-pretreated patients in separate cohorts.",
            goal="To evaluate repotrectinib's effectiveness in ROS1-positive NSCLC, including patients who progressed on prior ROS1 inhibitors and those with brain metastases.",
            what_happens="Take repotrectinib pills twice daily. Brain MRI and body scans every 8 weeks. Clinic visits monthly initially, then every 8 weeks.",
            duration="Treatment continues until progression or intolerable side effects. Typical duration 18-30 months for responders, including those with CNS disease."
        )
    ),
    
    # lung_trial_009
    Trial(
        id="lung_trial_009",
        nct_number="NCT05890345",
        title="Dabrafenib + Trametinib in BRAF V600E-Mutant NSCLC",
        phase="Phase II",
        sponsor="Novartis",
        status="recruiting",
        location="Weill Cornell Medicine, New York, NY",
        distance=10,
        cancer_type="lung",
        last_updated="2025-01-31",
        eligibility_score="possibly_eligible",
        match_confidence="medium",
        why_matched=[
            "BRAF V600E mutation confirmed",
            "Stage IV NSCLC",
            "Any line of therapy accepted"
        ],
        what_to_confirm=[
            "Confirm BRAF V600E mutation (not non-V600 BRAF)",
            "Verify no prior BRAF or MEK inhibitor",
            "Check cardiac function (LVEF must be adequate)"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="BRAF V600E mutation", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Metastatic NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior systemic therapy required", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-2", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 8 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior BRAF or MEK inhibitor",
            washout_window="14 days from last therapy",
            lab_thresholds="LVEF ≥50%, adequate organ function",
            brain_mets="Treated, stable brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Combines dabrafenib (BRAF inhibitor) with trametinib (MEK inhibitor) to target the MAPK pathway in BRAF V600E-mutant NSCLC. Single-arm study.",
            goal="To evaluate the combination of BRAF and MEK inhibition in NSCLC patients with BRAF V600E mutations, a rare but highly targetable alteration.",
            what_happens="Take dabrafenib pills twice daily and trametinib once daily. Frequent monitoring initially (every 2 weeks for first month), then monthly visits. Scans every 8 weeks.",
            duration="Treatment continues until progression or intolerable side effects. Typical duration 10-18 months for responders."
        )
    ),
    
    # lung_trial_010
    Trial(
        id="lung_trial_010",
        nct_number="NCT05901456",
        title="DESTINY-Lung02: Trastuzumab Deruxtecan in HER2-Mutant NSCLC",
        phase="Phase II",
        sponsor="Daiichi Sankyo",
        status="recruiting",
        location="Mount Sinai Hospital, New York, NY",
        distance=9,
        cancer_type="lung",
        last_updated="2025-02-04",
        eligibility_score="possibly_eligible",
        match_confidence="medium",
        why_matched=[
            "HER2 mutation (not amplification) detected",
            "Stage IV NSCLC",
            "Prior platinum-based chemotherapy"
        ],
        what_to_confirm=[
            "Confirm HER2 mutation by NGS (not HER2 overexpression/amplification)",
            "Verify no prior HER2-targeted therapy",
            "Check LVEF ≥50% and lung function"
        ],
        eligibility_criteria=[
            EligibilityCriterion(criterion="HER2 mutation (not amplification)", met=True, category="biomarker"),
            EligibilityCriterion(criterion="Metastatic NSCLC", met=True, category="stage"),
            EligibilityCriterion(criterion="Prior platinum-based chemotherapy", met=True, category="treatment_history"),
            EligibilityCriterion(criterion="ECOG 0-1", met="unknown", category="performance")
        ],
        burden=PatientBurden(visits_per_month=2, imaging_frequency="Every 6 weeks", biopsy_required=False, hospital_stays=False),
        exclusion_risks=ExclusionRisks(
            prior_drug_exposure="No prior HER2-targeted therapy",
            washout_window="21 days from last chemotherapy",
            lab_thresholds="LVEF ≥50%, adequate pulmonary function",
            brain_mets="Treated, asymptomatic brain metastases allowed"
        ),
        translated_info=TranslatedInfo(
            design="Single-arm study of trastuzumab deruxtecan (T-DXd), an antibody-drug conjugate targeting HER2. Enrolls patients with HER2 mutations (distinct from HER2 amplification).",
            goal="To evaluate T-DXd's effectiveness in NSCLC patients with HER2 mutations, a rare actionable alteration occurring in 2-4% of NSCLC.",
            what_happens="IV infusion of T-DXd every 3 weeks. Scans every 6 weeks. Close monitoring for lung toxicity (interstitial lung disease). Monthly visits.",
            duration="Treatment continues until progression or intolerable side effects. Typical duration 12-20 months for responders. Requires immediate reporting of respiratory symptoms."
        )
    ),
]

# Validation function (optional - for testing)
def validate_trials():
    """Validate the TRIALS list"""
    assert len(TRIALS) == 20, f"Expected 20 trials, got {len(TRIALS)}"
    
    breast_count = sum(1 for t in TRIALS if t.cancer_type == "breast")
    lung_count = sum(1 for t in TRIALS if t.cancer_type == "lung")
    
    assert breast_count == 10, f"Expected 10 breast trials, got {breast_count}"
    assert lung_count == 10, f"Expected 10 lung trials, got {lung_count}"
    
    # Check for unique NCT numbers
    nct_numbers = [t.nct_number for t in TRIALS]
    assert len(nct_numbers) == len(set(nct_numbers)), "Duplicate NCT numbers found"
    
    print("✓ All 20 trials validated successfully")
    print(f"  - {breast_count} breast cancer trials")
    print(f"  - {lung_count} NSCLC trials")
    return True

# Run validation if executed directly
if __name__ == "__main__":
    validate_trials()
  
  
def get_trial_by_nct(nct_number: str) -> Trial | None:  
    """Helper function to find trial by NCT number"""  
    return next((t for t in TRIALS if t.nct_number == nct_number), None)  
  
  
def get_trials_by_cancer_type(cancer_type: str) -> List[Trial]:  
    """Helper function to filter trials by cancer type"""  
    return [t for t in TRIALS if t.cancer_type == cancer_type] 
