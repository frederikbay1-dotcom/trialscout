/**
 * API Types for TrialScout Backend Integration
 * Based on backend models (patient.py, trial.py, matching.py)
 */

// Patient Profile Types
export interface BiomarkerStatus {
  status: 'present' | 'absent' | 'unknown';
  subtype?: string;
}

// Breast cancer biomarkers
export interface BreastBiomarkers {
  ER: 'present' | 'absent' | 'unknown';
  PR: 'present' | 'absent' | 'unknown';
  HER2: 'positive' | 'low' | 'negative' | 'unknown';
  Ki67?: number;
}

// Lung cancer biomarkers
export interface EGFRMutation {
  status: 'present' | 'absent' | 'unknown';
  mutation?: 'Exon 19 deletion' | 'L858R' | 'Exon 20 insertion' | 'T790M' | 'Other';
}

export interface KRASMutation {
  status: 'present' | 'absent' | 'unknown';
  mutation?: 'G12C' | 'G12D' | 'G12V' | 'Other';
}

export interface METAlteration {
  status: 'present' | 'absent' | 'unknown';
  alteration?: 'Exon 14 skipping' | 'Amplification';
}

export interface PDL1Expression {
  status: 'present' | 'absent' | 'unknown';
  percentage?: number;
}

export interface LungBiomarkers {
  EGFR: EGFRMutation;
  ALK: 'present' | 'absent' | 'unknown';
  ROS1: 'present' | 'absent' | 'unknown';
  KRAS: KRASMutation;
  MET: METAlteration;
  BRAF: 'present' | 'absent' | 'unknown';
  PDL1: PDL1Expression;
}

export interface PriorTreatment {
  category: 'surgery' | 'radiation' | 'chemotherapy' | 'targeted_therapy' | 'immunotherapy' | 'hormone_therapy';
  name?: string;
  start_date?: string;
  end_date?: string;
}

export interface PatientProfile {
  age: number;
  sex: 'male' | 'female' | 'other';
  cancer_type: 'breast' | 'lung';
  stage: 'I' | 'II' | 'III' | 'IV';
  ecog: '0' | '1' | '2' | '3' | '4' | 'unknown';
  biomarkers: BreastBiomarkers | LungBiomarkers;
  prior_treatments: PriorTreatment[];
  line_of_therapy: 'first' | 'post_targeted' | 'later_line';
}

// Trial Types
export interface EligibilityCriterion {
  criterion: string;
  met: boolean | 'unknown';
  category: 'biomarker' | 'stage' | 'treatment_history' | 'performance' | 'organ_function' | 'metastases' | 'demographics' | 'disease_characteristics' | 'histology';
}

export interface PatientBurden {
  visits_per_month: number;
  imaging_frequency: string;
  biopsy_required: boolean;
  hospital_stays: boolean;
}

export interface ExclusionRisks {
  prior_drug_exposure: string;
  washout_window: string;
  lab_thresholds: string;
  brain_mets: string;
}

export interface TranslatedInfo {
  design: string;
  goal: string;
  what_happens: string;
  duration: string;
}

export interface Trial {
  id: string;
  nct_number: string;
  title: string;
  phase: 'Phase I' | 'Phase I/II' | 'Phase II' | 'Phase II/III' | 'Phase III';
  sponsor: string;
  status: 'recruiting' | 'active_not_recruiting' | 'completed';
  location: string;
  distance: number;
  cancer_type: 'breast' | 'lung';
  eligibility_score: 'possibly_eligible' | 'likely_not_eligible';
  match_confidence: 'high' | 'medium' | 'low';
  why_matched: string[];
  what_to_confirm: string[];
  eligibility_criteria: EligibilityCriterion[];
  burden: PatientBurden;
  exclusion_risks: ExclusionRisks;
  translated_info: TranslatedInfo;
  last_updated: string;
}

export type TrialDetail = Trial;
export type TrialFullDetail = Trial;

// Matching Result Types
export interface MatchResult {
  trial: Trial;
  score: number; // 85-99
  confidence: 'high' | 'medium' | 'low';
  why_matched: string[];
  what_to_confirm: string[];
  excluded_by?: string;
}

export interface MatchingContext {
  patient: PatientProfile;
  dataset_version: string;
  matched_at: string;
  total_trials: number;
}

export interface MatchingStats {
  total_trials: number;
  possibly_eligible: number;
  likely_not_eligible: number;
  hard_excluded: number;
}

export interface MatchResponse {
  matches: MatchResult[];
  context: MatchingContext;
  stats: MatchingStats;
}

// Legacy type aliases for backward compatibility
export type MatchedTrial = MatchResult;

// Clinician Brief Types (not yet implemented in new backend)
export interface ClinicianBriefRequest {
  patient_profile: PatientProfile;
  matched_trials: MatchResult[];
  top_n?: number; // 1-10, default 5
}

export interface ClinicianBriefResponse {
  pdf_base64: string;
  filename: string;
  generated_at: string;
}

// Health Check Type
export interface HealthResponse {
  status: string;
  dataset_version: string;
  last_updated: string;
  total_trials: number;
}

// API Error Type
export interface APIError {
  detail: string;
}