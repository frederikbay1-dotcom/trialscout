import { BiomarkerProfile, defaultBiomarkerProfile } from "./biomarkers";

export type CancerType = "lung" | "breast" | null;

export type CancerStage = "I" | "II" | "III" | "IV" | null;

export type HealthAnswer = "yes" | "no" | "unknown";

export type ECOGStatus = 0 | 1 | 2 | 3 | 4 | null;

// Refined line of therapy options
export type LineOfTherapy = "first" | "post_targeted" | "post_chemo_immuno" | "later_line" | null;

// Treatment timing
export type TherapyEndDate = "ongoing" | "within_30_days" | "30_90_days" | "over_90_days" | "unknown" | null;

// Best response to last therapy
export type BestResponse = "responding" | "stable" | "progressed" | "unknown" | null;

export type ConfidenceLevel = "high" | "medium" | "low";

// Match confidence for results
export type MatchConfidence = "high" | "medium" | "low";

export interface ExtractedField<T> {
  value: T;
  confidence: ConfidenceLevel;
  source?: string;
}

export interface PriorTreatmentTypes {
  surgery: boolean;
  radiation: boolean;
  medication: boolean;
}

export interface TrialBurden {
  visitsPerMonth: number;
  biopsyRequired: boolean;
  hospitalDays: boolean;
  imagingFrequency?: string;
  burdenScore: "low" | "medium" | "high";
}

export interface TrialStatus {
  recruiting: boolean;
  lastUpdated: string;
  activeSitesNearUser: number;
  dataSource?: string;
  siteVerified?: boolean;
}

// Common exclusion risks
export interface ExclusionRisks {
  priorDrugClass?: string[];
  washoutWindow?: string;
  labThresholds?: string[];
  brainMetastases?: boolean;
}

// What needs to be confirmed
export interface ConfirmationItems {
  items: string[];
}

export interface PatientData {
  // Demographics
  age: number | null;
  sex: "male" | "female" | null;

  // Clinical status
  ecogStatus: ECOGStatus;
  ecogUnknown: boolean; // "I don't know my ECOG status"
  lineOfTherapy: LineOfTherapy;

  // Treatment timing (NEW)
  lastTherapyEndDate: TherapyEndDate;
  bestResponseToLastTherapy: BestResponse;

  // Organ function
  organFunction: {
    liverKidneyIssues: HealthAnswer;
    brainMetastases: HealthAnswer;
    otherActiveCancers: HealthAnswer;
  };

  // Clinical records
  hasPathologyReport: boolean;
  hasOncologyNote: boolean;

  // Extracted fields with confidence
  extractedFields: {
    cancerType?: ExtractedField<CancerType>;
    cancerStage?: ExtractedField<CancerStage>;
    biomarkers?: ExtractedField<string[]>;
    priorTreatments?: ExtractedField<string[]>;
  };

  // Diagnosis
  cancerType: CancerType;
  cancerStage: CancerStage;

  // Prior treatment types (high-level)
  priorTreatmentTypes: PriorTreatmentTypes;

  // Treatment history (medication-specific)
  breastTreatments: {
    endocrineTherapy: boolean | "unsure";
    cdk46Inhibitors: boolean | "unsure";
    antiHer2: boolean | "unsure";
    adcs: boolean | "unsure";
  };

  lungTreatments: {
    immunotherapy: boolean | "unsure";
    targetedTherapy: boolean | "unsure";
    platinumChemo: boolean | "unsure";
  };

  // Biomarkers - legacy string array for backward compatibility
  biomarkers: string[];
  
  // NEW: Structured biomarker profile
  biomarkerProfile: BiomarkerProfile;

  // Travel preferences
  zipCode: string;
  maxTravelDistance: number | null; // in miles

  // UX preferences
  showMismatchedTrials: boolean; // Opt-in to see trials requiring different biomarkers
}

export type EligibilityStatus = "met" | "not_met" | "unknown";

export interface EligibilityCriterion {
  label: string;
  status: EligibilityStatus;
}

export interface MatchReason {
  type: "biomarker" | "stage" | "treatment" | "general";
  text: string;
  matched: boolean;
}

export interface Trial {
  id: string;
  nctNumber: string;
  title: string;
  phase: string;
  eligibilityScore: "possibly_eligible" | "likely_not_eligible";
  sponsor: string;
  location: string;
  summary?: string;
  eligibilityCriteria: EligibilityCriterion[];
  translatedInfo: {
    design: string;
    goal: string;
    whatHappens: string;
    duration: string;
  };
  // Clinical precision fields
  requiredBiomarkers?: string[];
  matchReasons?: MatchReason[];
  burden?: TrialBurden;
  // Backend API sends status as string, not TrialStatus object
  status?: "recruiting" | "active_not_recruiting" | "completed" | TrialStatus;
  last_updated?: string; // Backend field name
  
  // NEW: Match confidence and confirmations
  matchConfidence?: MatchConfidence;
  matchScore?: number;
  biomarkerMatch?: "matches" | "doesnt_match" | "unknown" | "partial";
  whyMatched?: string[];
  whyCantMatch?: string[];
  whatToConfirm?: string[];
  exclusionRisks?: ExclusionRisks;
}

export const defaultPatientData: PatientData = {
  age: null,
  sex: null,
  ecogStatus: null,
  ecogUnknown: false,
  lineOfTherapy: null,
  lastTherapyEndDate: null,
  bestResponseToLastTherapy: null,
  organFunction: {
    liverKidneyIssues: "unknown",
    brainMetastases: "unknown",
    otherActiveCancers: "unknown",
  },
  hasPathologyReport: false,
  hasOncologyNote: false,
  extractedFields: {},
  cancerType: null,
  cancerStage: null,
  priorTreatmentTypes: {
    surgery: false,
    radiation: false,
    medication: false,
  },
  breastTreatments: {
    endocrineTherapy: "unsure",
    cdk46Inhibitors: "unsure",
    antiHer2: "unsure",
    adcs: "unsure",
  },
  lungTreatments: {
    immunotherapy: "unsure",
    targetedTherapy: "unsure",
    platinumChemo: "unsure",
  },
  biomarkers: [],
  biomarkerProfile: defaultBiomarkerProfile,
  zipCode: "",
  maxTravelDistance: null,
  showMismatchedTrials: false,
};

// Mock trial data has been removed - trials are now fetched from the backend API
// See useTrialMatching hook in src/hooks/useTrialMatching.ts for API integration

// Legacy exports for backward compatibility (empty arrays)
export const LUNG_MOCK_TRIALS: Trial[] = [];
export const BREAST_MOCK_TRIALS: Trial[] = [];
export const MOCK_TRIALS: Trial[] = [];

/* DEPRECATED: Mock trial data removed
// The following mock data has been moved to the backend database
// Lung Cancer Trials (NSCLC - 7 trials)
export const LUNG_MOCK_TRIALS_DEPRECATED: Trial[] = [
  {
    id: "nsclc_trial_001",
    nctNumber: "NCT06246110",
    title: "EIK1001 + Pembrolizumab + Chemotherapy in Stage 4 NSCLC",
    phase: "Phase II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Eikon Therapeutics",
    location: "Memorial Sloan Kettering Cancer Center, New York, NY",
    summary: "A Phase 2 study of a novel compound combined with pembrolizumab immunotherapy and chemotherapy for first-line treatment of stage IV NSCLC.",
    requiredBiomarkers: [],
    matchConfidence: "high",
    whyMatched: [
      "Stage IV NSCLC confirmed",
      "No prior systemic therapy for metastatic disease",
      "ECOG 0-1 performance status",
      "No specific biomarker required (broad eligibility)"
    ],
    whatToConfirm: [
      "Verify ECOG performance status 0-1",
      "Confirm adequate organ function (ANC ≥1500/μL, platelets ≥100,000/μL)",
      "Check for active brain metastases (treated/stable allowed)"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior systemic therapy for metastatic NSCLC"],
      washoutWindow: "Not applicable (first-line)",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥100,000/μL", "Normal liver/kidney function"],
      brainMetastases: false
    },
    matchReasons: [
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "treatment", text: "First-line treatment setting", matched: true },
      { type: "general", text: "No biomarker requirement (broad eligibility)", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Stage IV NSCLC", status: "met" },
      { label: "No prior systemic therapy for advanced disease", status: "met" },
      { label: "ECOG performance status 0-1", status: "unknown" },
      { label: "Adequate bone marrow function", status: "unknown" },
    ],
    translatedInfo: {
      design: "Combines a novel investigational drug (EIK1001) with pembrolizumab immunotherapy and standard chemotherapy. Designed for patients who haven't received systemic treatment for their metastatic lung cancer yet.",
      goal: "To see if adding EIK1001 to standard immunotherapy plus chemotherapy is safe and effective as first-line treatment for advanced NSCLC.",
      whatHappens: "You'll receive IV infusions every 3 weeks (EIK1001 + pembrolizumab + chemotherapy). Scans every 6 weeks to check tumor response. Blood tests at each visit to monitor side effects.",
      duration: "Chemotherapy typically for 4-6 cycles (12-18 weeks), then EIK1001 + pembrolizumab continue until disease progression. Average treatment duration 9-15 months.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-04",
      activeSitesNearUser: 3,
    },
  },
  {
    id: "nsclc_trial_002",
    nctNumber: "NCT06881784",
    title: "Daraxonrasib vs Docetaxel in RAS-Mutated NSCLC (RASolve 301)",
    phase: "Phase III",
    eligibilityScore: "possibly_eligible",
    sponsor: "Revolution Medicines",
    location: "NYU Langone Health, New York, NY",
    summary: "A randomized Phase III study comparing a novel RAS(ON) inhibitor to standard chemotherapy in patients with RAS-mutated NSCLC.",
    requiredBiomarkers: ["KRAS G12C"],
    matchConfidence: "medium",
    whyMatched: [
      "Stage IV NSCLC confirmed",
      "Prior systemic therapy aligns with inclusion",
      "RAS mutation testing may qualify you"
    ],
    whatToConfirm: [
      "Confirm RAS mutation status (G12C, G12X, or other RAS mutations)",
      "Verify progression on prior platinum-based therapy",
      "Check ECOG performance status 0-1"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior RAS(ON) inhibitor therapy"],
      washoutWindow: "21 days from prior systemic therapy",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥100,000/μL", "Creatinine ≤1.5x ULN"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "biomarker", text: "Requires RAS mutation confirmation", matched: true },
      { type: "treatment", text: "Post-platinum therapy setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Stage IV NSCLC", status: "met" },
      { label: "RAS mutation confirmed", status: "unknown" },
      { label: "Prior platinum-based chemotherapy", status: "unknown" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A randomized study comparing daraxonrasib (a new RAS-targeted pill) to standard docetaxel chemotherapy. The computer randomly assigns you to one treatment or the other.",
      goal: "To determine if targeting RAS mutations directly works better than standard chemotherapy for patients whose cancer has this specific genetic change.",
      whatHappens: "If assigned to daraxonrasib: daily oral pill. If assigned to docetaxel: IV infusion every 3 weeks. Both groups get scans every 6 weeks.",
      duration: "Treatment continues until disease progression or unacceptable side effects, typically 6-12 months.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-01",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "nsclc_trial_003",
    nctNumber: "NCT04077099",
    title: "REGN5093 for MET-Altered Advanced NSCLC",
    phase: "Phase I/II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Regeneron Pharmaceuticals",
    location: "Weill Cornell Medicine, New York, NY",
    summary: "A Phase I/II study of a novel MET inhibitor in patients with MET-altered advanced NSCLC, including MET exon 14 skipping and MET amplification.",
    requiredBiomarkers: ["MET"],
    matchConfidence: "medium",
    whyMatched: [
      "Stage IV NSCLC confirmed",
      "MET alterations are actionable targets",
      "Multiple treatment lines allowed"
    ],
    whatToConfirm: [
      "Confirm MET alteration (exon 14 skipping mutation or amplification)",
      "Verify NGS or FISH testing has been completed",
      "Check adequate organ function"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior MET inhibitor (may be allowed in some cohorts)"],
      washoutWindow: "14 days from prior systemic therapy",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥100,000/μL", "ALT/AST ≤3x ULN"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "biomarker", text: "Requires MET alteration confirmation", matched: true },
      { type: "general", text: "Novel targeted therapy approach", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Advanced NSCLC", status: "met" },
      { label: "MET exon 14 skipping or amplification", status: "unknown" },
      { label: "Adequate organ function", status: "unknown" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A study testing a new drug that specifically targets MET alterations in lung cancer. This is an early-phase study evaluating safety and effectiveness.",
      goal: "To find the right dose of REGN5093 and see how well it works for patients whose lung cancer has MET genetic changes.",
      whatHappens: "You'll receive REGN5093 (exact schedule depends on study phase). Regular blood tests, scans every 6-8 weeks, and close monitoring for side effects.",
      duration: "Treatment continues as long as you're benefiting, typically 6-18 months depending on response.",
    },
    burden: {
      visitsPerMonth: 3,
      biopsyRequired: true,
      hospitalDays: false,
      imagingFrequency: "Every 6-8 weeks",
      burdenScore: "medium",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-28",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "nsclc_trial_004",
    nctNumber: "NCT05443126",
    title: "EP0031 for RET Fusion-Positive NSCLC",
    phase: "Phase I/II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Ellipses Pharma",
    location: "Mount Sinai Hospital, New York, NY",
    summary: "A Phase I/II study of a novel RET inhibitor in patients with RET fusion-positive NSCLC.",
    requiredBiomarkers: ["RET"],
    matchConfidence: "high",
    whyMatched: [
      "Stage IV NSCLC confirmed",
      "RET fusions are actionable targets",
      "Prior therapy allowed"
    ],
    whatToConfirm: [
      "Confirm RET fusion via NGS or FISH testing",
      "Verify specific fusion partner if known",
      "Check ECOG performance status"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior RET inhibitor (selpercatinib or pralsetinib)"],
      washoutWindow: "14 days from prior therapy",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥75,000/μL", "Normal liver function"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "biomarker", text: "Requires RET fusion confirmation", matched: true },
      { type: "treatment", text: "Prior RET inhibitor may be allowed", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Advanced NSCLC", status: "met" },
      { label: "RET fusion confirmed", status: "unknown" },
      { label: "ECOG performance status 0-2", status: "met" },
      { label: "Adequate organ function", status: "unknown" },
    ],
    translatedInfo: {
      design: "A study testing a new next-generation RET inhibitor designed to work even if you've had prior RET-targeted therapy.",
      goal: "To find the best dose of EP0031 and measure how well it shrinks tumors in patients with RET fusion-positive lung cancer.",
      whatHappens: "Daily oral pill. Blood tests every 1-2 weeks initially, then less frequently. Scans every 8 weeks.",
      duration: "Treatment continues as long as you're benefiting, potentially years for good responders.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: true,
      hospitalDays: false,
      imagingFrequency: "Every 8 weeks",
      burdenScore: "medium",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-03",
      activeSitesNearUser: 1,
    },
  },
  {
    id: "nsclc_trial_005",
    nctNumber: "NCT05657873",
    title: "Liver SABR + Immunotherapy for Metastatic NSCLC",
    phase: "Phase II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Memorial Sloan Kettering Cancer Center",
    location: "Memorial Sloan Kettering Cancer Center, New York, NY",
    summary: "A Phase II study combining stereotactic ablative radiation (SABR) to liver metastases with immunotherapy for metastatic NSCLC.",
    requiredBiomarkers: [],
    matchConfidence: "high",
    whyMatched: [
      "Stage IV NSCLC with liver metastases",
      "Immunotherapy-eligible status",
      "Oligometastatic disease approach"
    ],
    whatToConfirm: [
      "Confirm presence of liver metastases",
      "Verify liver lesions are amenable to SABR",
      "Check if currently on or eligible for immunotherapy"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior liver radiation"],
      washoutWindow: "Not specified (coordination with current therapy)",
      labThresholds: ["Adequate liver function", "Bilirubin ≤2x ULN"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "general", text: "Oligometastatic treatment approach", matched: true },
      { type: "treatment", text: "Can be combined with current immunotherapy", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Metastatic NSCLC", status: "met" },
      { label: "Liver metastases present", status: "unknown" },
      { label: "Eligible for/receiving immunotherapy", status: "unknown" },
      { label: "1-5 liver lesions amenable to SABR", status: "unknown" },
    ],
    translatedInfo: {
      design: "A study testing whether adding precise radiation to liver tumors can improve outcomes when combined with immunotherapy. No randomization—everyone receives the same treatment.",
      goal: "To see if targeting liver metastases with high-dose radiation while continuing immunotherapy can improve cancer control.",
      whatHappens: "3-5 radiation sessions over 1-2 weeks, then continue your immunotherapy regimen. Scans every 8-12 weeks.",
      duration: "Radiation is completed in 1-2 weeks. Immunotherapy continues per standard schedule (typically 12-24 months).",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 8-12 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-25",
      activeSitesNearUser: 1,
    },
  },
  {
    id: "nsclc_trial_006",
    nctNumber: "NCT06162221",
    title: "RAS(ON) Inhibitors Platform Study in Advanced NSCLC",
    phase: "Phase I/II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Revolution Medicines",
    location: "Columbia University Medical Center, New York, NY",
    summary: "A platform study testing multiple RAS(ON) inhibitors as monotherapy or in combinations for RAS-mutated advanced NSCLC.",
    requiredBiomarkers: ["KRAS G12C"],
    matchConfidence: "medium",
    whyMatched: [
      "Stage IV NSCLC confirmed",
      "Multiple RAS mutation types may qualify",
      "Platform design offers multiple treatment options"
    ],
    whatToConfirm: [
      "Confirm specific RAS mutation type (KRAS G12C, G12D, G12V, etc.)",
      "Verify prior treatment history",
      "Check eligibility for specific study arm"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior RAS(ON) inhibitor (arm-specific)"],
      washoutWindow: "21 days from prior systemic therapy",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥100,000/μL", "Adequate liver function"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "biomarker", text: "Requires specific RAS mutation", matched: true },
      { type: "general", text: "Platform study with multiple treatment options", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Advanced NSCLC", status: "met" },
      { label: "RAS mutation confirmed", status: "unknown" },
      { label: "Prior systemic therapy", status: "unknown" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A platform study testing different RAS-targeting drugs. Your specific RAS mutation determines which treatment arm you may join.",
      goal: "To find effective treatments for different types of RAS mutations in lung cancer and test combination approaches.",
      whatHappens: "Treatment depends on study arm—may be single drug or combination. Daily or twice-daily oral medications. Scans every 6-8 weeks.",
      duration: "Treatment continues while benefiting, typically 6-18 months depending on response.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: true,
      hospitalDays: false,
      imagingFrequency: "Every 6-8 weeks",
      burdenScore: "medium",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-30",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "nsclc_trial_007",
    nctNumber: "NCT04988295",
    title: "Immunotherapy + Targeted Therapy Combination in PD-L1+ NSCLC",
    phase: "Phase II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Academic Consortium",
    location: "NYU Langone Health, New York, NY",
    summary: "A Phase II study combining PD-1 inhibitor immunotherapy with a novel targeted agent for PD-L1 positive stage IV NSCLC.",
    requiredBiomarkers: ["PD-L1 High"],
    matchConfidence: "high",
    whyMatched: [
      "Stage IV NSCLC confirmed",
      "PD-L1 positive status matches",
      "First-line treatment setting"
    ],
    whatToConfirm: [
      "Confirm PD-L1 TPS ≥50% (high expression)",
      "Verify no EGFR/ALK alterations (if required)",
      "Check ECOG performance status 0-1"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior PD-1/PD-L1 inhibitor therapy"],
      washoutWindow: "28 days from prior therapy",
      labThresholds: ["ANC ≥1500/μL", "Normal thyroid function", "No autoimmune disease"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "biomarker", text: "Matches PD-L1 High expression", matched: true },
      { type: "stage", text: "Matches Stage IV NSCLC", matched: true },
      { type: "treatment", text: "First-line treatment setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Stage IV NSCLC", status: "met" },
      { label: "PD-L1 TPS ≥50%", status: "unknown" },
      { label: "No prior immunotherapy", status: "met" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A study testing a new combination of immunotherapy with a targeted drug. Everyone receives the same treatment—no placebo group.",
      goal: "To see if adding a targeted therapy to immunotherapy works better than immunotherapy alone for PD-L1 high lung cancer.",
      whatHappens: "IV immunotherapy every 3 weeks plus daily oral targeted therapy. Scans every 6 weeks. Regular blood tests to monitor side effects.",
      duration: "Immunotherapy continues for up to 2 years. Targeted therapy continues until progression.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-02",
      activeSitesNearUser: 3,
    },
  },
];

// Breast Cancer Trials (7 trials)
export const BREAST_MOCK_TRIALS_DEPRECATED: Trial[] = [
  {
    id: "bc_trial_001",
    nctNumber: "NCT06926868",
    title: "Izalontamab Brengitecan vs Chemotherapy in Metastatic Triple-Negative Breast Cancer (IZABRIGHT-Breast01)",
    phase: "Phase II/III",
    eligibilityScore: "possibly_eligible",
    sponsor: "Bristol-Myers Squibb",
    location: "Columbia University Medical Center, New York, NY",
    summary: "A randomized Phase II/III study comparing a novel bi-specific ADC (EGFR/HER3) to chemotherapy in first-line metastatic triple-negative breast cancer patients not eligible for immunotherapy.",
    requiredBiomarkers: [],
    matchConfidence: "high",
    whyMatched: [
      "Triple-negative breast cancer confirmed",
      "Stage IV metastatic disease",
      "First-line setting matches trial criteria",
      "Not eligible for immunotherapy (PD-L1 negative or contraindication)"
    ],
    whatToConfirm: [
      "Confirm PD-L1 negative or contraindication to immunotherapy",
      "Verify no prior systemic therapy for metastatic disease",
      "Check adequate organ function"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior systemic therapy for metastatic TNBC"],
      washoutWindow: "Not applicable for first-line",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥100,000/μL", "Creatinine clearance ≥50 mL/min"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "biomarker", text: "Matches triple-negative status (ER-, PR-, HER2-)", matched: true },
      { type: "stage", text: "Matches metastatic setting", matched: true },
      { type: "treatment", text: "First-line treatment setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Triple-negative breast cancer (ER-, PR-, HER2-)", status: "met" },
      { label: "Locally advanced or metastatic disease", status: "met" },
      { label: "Not eligible for anti-PD(L)1 therapy", status: "unknown" },
      { label: "No prior systemic therapy for metastatic disease", status: "met" },
      { label: "ECOG 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A novel bi-specific antibody-drug conjugate targeting both EGFR and HER3 proteins. Compares iza-bren to standard chemotherapy (physician's choice of paclitaxel, nab-paclitaxel, carboplatin/gemcitabine, or capecitabine).",
      goal: "To test whether iza-bren works better than standard chemotherapy as first-line treatment for metastatic triple-negative breast cancer in patients not eligible for immunotherapy.",
      whatHappens: "IV infusion every 3 weeks. Regular blood tests and scans every 9 weeks to monitor response. Side effect management with support medications.",
      duration: "Treatment continues as long as cancer doesn't progress and side effects are tolerable, average 8-12 months.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 9 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-01",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "bc_trial_002",
    nctNumber: "NCT05234567",
    title: "Trastuzumab Deruxtecan in HER2-Low Metastatic Breast Cancer (DESTINY-Breast06)",
    phase: "Phase III",
    eligibilityScore: "possibly_eligible",
    sponsor: "Daiichi Sankyo",
    location: "Memorial Sloan Kettering Cancer Center, New York, NY",
    summary: "A landmark Phase III study comparing trastuzumab deruxtecan (T-DXd) to physician's choice chemotherapy in HER2-low metastatic breast cancer.",
    requiredBiomarkers: ["HER2-low"],
    matchConfidence: "high",
    whyMatched: [
      "HER2-low status (IHC 1+ or 2+/ISH-) confirmed",
      "ER+ breast cancer matches target population",
      "Prior chemotherapy aligns with inclusion",
      "3 sites recruiting near your location"
    ],
    whatToConfirm: [
      "Confirm HER2 IHC score (1+ or 2+/ISH-)",
      "Verify ECOG performance status 0-1",
      "Check baseline cardiac function (LVEF ≥50%)"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior T-DXd", "Prior HER2-directed ADC"],
      washoutWindow: "21 days from prior chemotherapy",
      labThresholds: ["LVEF ≥50%", "No ILD history"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "biomarker", text: "Matches HER2-low status", matched: true },
      { type: "biomarker", text: "Matches ER+ status", matched: true },
      { type: "treatment", text: "Post-chemotherapy setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "HER2-low breast cancer (IHC 1+ or 2+/ISH-)", status: "met" },
      { label: "ER+ status", status: "met" },
      { label: "Prior chemotherapy for metastatic disease", status: "unknown" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A randomized study comparing T-DXd (an antibody-drug conjugate that targets HER2-low cancer cells) to physician's choice chemotherapy.",
      goal: "To prove that T-DXd works better than standard chemotherapy for patients with HER2-low breast cancer.",
      whatHappens: "IV infusion every 3 weeks. Cardiac monitoring with echocardiograms. Scans every 6 weeks to check tumor response.",
      duration: "Treatment continues until progression, typically 8-18 months for responders.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-28",
      activeSitesNearUser: 3,
    },
  },
  {
    id: "bc_trial_003",
    nctNumber: "NCT05789234",
    title: "Sacituzumab Govitecan in HR+/HER2- Metastatic Breast Cancer (TROPiCS-02)",
    phase: "Phase III",
    eligibilityScore: "possibly_eligible",
    sponsor: "Gilead Sciences",
    location: "NYU Langone Health, New York, NY",
    summary: "A Phase III study of sacituzumab govitecan (TROP-2 targeting ADC) versus chemotherapy in heavily pretreated HR+/HER2- metastatic breast cancer.",
    requiredBiomarkers: ["ER+"],
    matchConfidence: "high",
    whyMatched: [
      "HR+/HER2- status confirmed",
      "Prior endocrine and chemotherapy align with inclusion",
      "Heavily pretreated setting matches",
      "2 sites recruiting nearby"
    ],
    whatToConfirm: [
      "Confirm ≥2 prior chemotherapy lines for metastatic disease",
      "Verify prior endocrine therapy and CDK4/6 inhibitor",
      "Check ECOG performance status 0-1"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior sacituzumab govitecan", "Prior TROP-2 directed therapy"],
      washoutWindow: "21 days from prior chemotherapy",
      labThresholds: ["ANC ≥1500/μL", "Platelets ≥100,000/μL", "No active diarrhea"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "biomarker", text: "Matches HR+/HER2- status", matched: true },
      { type: "treatment", text: "Heavily pretreated (≥2 chemo lines)", matched: true },
      { type: "stage", text: "Matches metastatic setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "HR+/HER2- metastatic breast cancer", status: "met" },
      { label: "≥2 prior chemotherapy regimens for metastatic disease", status: "unknown" },
      { label: "Prior endocrine therapy", status: "met" },
      { label: "Prior CDK4/6 inhibitor", status: "unknown" },
    ],
    translatedInfo: {
      design: "A randomized study comparing sacituzumab govitecan (a TROP-2 targeting antibody-drug conjugate) to physician's choice single-agent chemotherapy.",
      goal: "To prove that sacituzumab govitecan helps patients live longer and with better quality of life than standard chemotherapy.",
      whatHappens: "IV infusion on days 1 and 8 of each 21-day cycle. Scans every 6-8 weeks. Close monitoring for GI side effects.",
      duration: "Treatment continues until progression, average 6-12 months.",
    },
    burden: {
      visitsPerMonth: 3,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6-8 weeks",
      burdenScore: "medium",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-25",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "bc_trial_004",
    nctNumber: "NCT05456789",
    title: "Elacestrant in ESR1-Mutant ER+/HER2- Advanced Breast Cancer (EMERALD)",
    phase: "Phase III",
    eligibilityScore: "possibly_eligible",
    sponsor: "Stemline Therapeutics",
    location: "Weill Cornell Medicine, New York, NY",
    summary: "A Phase III study of oral SERD elacestrant versus standard endocrine therapy in ESR1-mutant ER+/HER2- advanced breast cancer.",
    requiredBiomarkers: ["ER+", "ESR1"],
    matchConfidence: "medium",
    whyMatched: [
      "ER+ status confirmed",
      "ESR1 mutation targets resistance mechanism",
      "Post-CDK4/6 inhibitor setting aligns"
    ],
    whatToConfirm: [
      "Confirm ESR1 mutation via ctDNA or tissue testing",
      "Verify prior CDK4/6 inhibitor and endocrine therapy",
      "Check liver function baseline"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior oral SERD", "Prior fulvestrant (allowed in some cases)"],
      washoutWindow: "14 days from prior endocrine therapy",
      labThresholds: ["ALT/AST ≤3x ULN", "No active liver disease"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "biomarker", text: "Matches ER+ status", matched: true },
      { type: "biomarker", text: "Requires ESR1 mutation confirmation", matched: true },
      { type: "treatment", text: "Post-CDK4/6 inhibitor setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "ER+/HER2- metastatic breast cancer", status: "met" },
      { label: "ESR1 mutation confirmed", status: "unknown" },
      { label: "Prior CDK4/6 inhibitor", status: "unknown" },
      { label: "1-2 prior lines of endocrine therapy", status: "met" },
    ],
    translatedInfo: {
      design: "A randomized study comparing elacestrant (a new oral pill that blocks estrogen signaling) to standard hormone therapy like fulvestrant.",
      goal: "To prove that elacestrant works better for patients whose cancer developed ESR1 mutations—a common resistance mechanism.",
      whatHappens: "Daily oral pill. Monthly clinic visits for blood tests. Scans every 8 weeks.",
      duration: "Treatment continues until progression, average 8-16 months for responders.",
    },
    burden: {
      visitsPerMonth: 1,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 8 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-02",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "bc_trial_005",
    nctNumber: "NCT05123456",
    title: "Pembrolizumab + Chemotherapy in PD-L1+ Triple-Negative Breast Cancer (KEYNOTE-355)",
    phase: "Phase III",
    eligibilityScore: "possibly_eligible",
    sponsor: "Merck Sharp & Dohme",
    location: "NYU Langone Health, New York, NY",
    summary: "A Phase III study of pembrolizumab combined with chemotherapy versus chemotherapy alone in first-line PD-L1 positive triple-negative metastatic breast cancer.",
    requiredBiomarkers: [],
    matchConfidence: "high",
    whyMatched: [
      "Triple-negative breast cancer confirmed",
      "PD-L1 positive (CPS ≥10) matches target population",
      "First-line metastatic setting"
    ],
    whatToConfirm: [
      "Confirm PD-L1 CPS ≥10 via validated assay",
      "Verify no prior systemic therapy for metastatic disease",
      "Check ECOG performance status 0-1"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior PD-1/PD-L1 inhibitor therapy", "Prior systemic therapy for metastatic TNBC"],
      washoutWindow: "Not applicable (first-line)",
      labThresholds: ["ANC ≥1500/μL", "Normal thyroid function", "No autoimmune disease"],
      brainMetastases: true
    },
    matchReasons: [
      { type: "biomarker", text: "Matches triple-negative status", matched: true },
      { type: "biomarker", text: "Requires PD-L1 CPS ≥10 confirmation", matched: true },
      { type: "treatment", text: "First-line metastatic setting", matched: true },
    ],
    eligibilityCriteria: [
      { label: "Triple-negative breast cancer", status: "met" },
      { label: "PD-L1 CPS ≥10", status: "unknown" },
      { label: "No prior therapy for metastatic disease", status: "met" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A randomized study where half receive pembrolizumab (immunotherapy) plus chemotherapy, and half receive chemotherapy alone with placebo.",
      goal: "To prove that adding immunotherapy to chemotherapy helps patients with PD-L1 positive triple-negative breast cancer live longer.",
      whatHappens: "IV pembrolizumab every 3 weeks plus chemotherapy (nab-paclitaxel or paclitaxel/gemcitabine/carboplatin). Scans every 6 weeks.",
      duration: "Pembrolizumab for up to 2 years. Chemotherapy typically 4-6 months, then maintenance if responding.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6 weeks",
      burdenScore: "low",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-30",
      activeSitesNearUser: 3,
    },
  },
  {
    id: "bc_trial_006",
    nctNumber: "NCT05567890",
    title: "Tucatinib + Trastuzumab + Capecitabine for HER2+ Breast Cancer with Brain Metastases (HER2CLIMB-02)",
    phase: "Phase II",
    eligibilityScore: "possibly_eligible",
    sponsor: "Seagen Inc.",
    location: "Columbia University Medical Center, New York, NY",
    summary: "A Phase II study of triple combination therapy specifically for HER2+ breast cancer patients with brain metastases.",
    requiredBiomarkers: ["HER2+"],
    matchConfidence: "high",
    whyMatched: [
      "HER2+ status confirmed",
      "Brain metastases present—specifically targeted by this trial",
      "Prior HER2-directed therapy aligns"
    ],
    whatToConfirm: [
      "Confirm HER2+ status (IHC 3+ or ISH positive)",
      "Verify brain metastases via MRI",
      "Check prior trastuzumab and pertuzumab exposure"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior tucatinib"],
      washoutWindow: "14 days from prior systemic therapy",
      labThresholds: ["Adequate liver function", "No leptomeningeal disease"],
      brainMetastases: false
    },
    matchReasons: [
      { type: "biomarker", text: "Matches HER2+ status", matched: true },
      { type: "general", text: "Specifically designed for brain metastases", matched: true },
      { type: "treatment", text: "Prior HER2-directed therapy", matched: true },
    ],
    eligibilityCriteria: [
      { label: "HER2+ breast cancer (IHC 3+ or ISH+)", status: "met" },
      { label: "Brain metastases (active or stable)", status: "unknown" },
      { label: "Prior trastuzumab and pertuzumab", status: "unknown" },
      { label: "ECOG performance status 0-1", status: "unknown" },
    ],
    translatedInfo: {
      design: "A single-arm study where everyone receives the triple combination of tucatinib, trastuzumab, and capecitabine—specifically designed for brain metastases.",
      goal: "To show that this combination can shrink both brain and body tumors in HER2+ breast cancer patients with CNS involvement.",
      whatHappens: "Tucatinib pills twice daily, IV trastuzumab every 3 weeks, and capecitabine pills on a 2 weeks on/1 week off schedule. Brain MRI every 6-9 weeks.",
      duration: "Treatment continues as long as benefiting, potentially 12-24+ months for good responders.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6-9 weeks",
      burdenScore: "medium",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-02-03",
      activeSitesNearUser: 2,
    },
  },
  {
    id: "bc_trial_007",
    nctNumber: "NCT05901234",
    title: "Neoadjuvant Pembrolizumab + Chemotherapy in High-Risk Early Stage TNBC (KEYNOTE-522)",
    phase: "Phase III",
    eligibilityScore: "likely_not_eligible",
    sponsor: "Merck Sharp & Dohme",
    location: "Mount Sinai Hospital, New York, NY",
    summary: "A Phase III study of pembrolizumab combined with chemotherapy before and after surgery for high-risk early stage triple-negative breast cancer.",
    requiredBiomarkers: [],
    matchConfidence: "low",
    whyMatched: [
      "Triple-negative breast cancer confirmed"
    ],
    whatToConfirm: [
      "This trial is for EARLY STAGE (stage II-III) disease BEFORE surgery",
      "Verify you have not had surgery yet for this cancer",
      "Confirm stage II or III disease (not metastatic)"
    ],
    exclusionRisks: {
      priorDrugClass: ["Prior systemic therapy for this breast cancer", "Prior PD-1/PD-L1 therapy"],
      washoutWindow: "Not applicable",
      labThresholds: ["ANC ≥1500/μL", "Normal thyroid function"],
      brainMetastases: false
    },
    matchReasons: [
      { type: "biomarker", text: "Matches triple-negative status", matched: true },
      { type: "stage", text: "Requires early stage (II-III), not metastatic", matched: false },
      { type: "treatment", text: "Pre-surgical (neoadjuvant) setting", matched: false },
    ],
    eligibilityCriteria: [
      { label: "Triple-negative breast cancer", status: "met" },
      { label: "Stage II or III disease", status: "not_met" },
      { label: "No prior systemic therapy", status: "met" },
      { label: "Planned surgical resection", status: "not_met" },
    ],
    translatedInfo: {
      design: "A study for patients who will have surgery. You receive immunotherapy + chemotherapy BEFORE surgery, then continue immunotherapy AFTER surgery.",
      goal: "To improve cure rates for high-risk early stage triple-negative breast cancer by adding immunotherapy to standard treatment.",
      whatHappens: "8 cycles of chemotherapy + pembrolizumab before surgery (about 6 months), surgery, then 9 more cycles of pembrolizumab (about 9 months).",
      duration: "Total treatment about 15-18 months including surgery and all therapy.",
    },
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: true,
      hospitalDays: true,
      imagingFrequency: "Every 12 weeks",
      burdenScore: "high",
    },
    status: {
      recruiting: true,
      lastUpdated: "2025-01-20",
      activeSitesNearUser: 1,
    },
  },
];
*/
