/**
 * API Types for TrialScout Backend Integration
 * Based on backend schemas.py
 */

// Patient Profile Types
export interface BiomarkerStatus {
  status: 'present' | 'absent' | 'unknown';
  subtype?: string;
}

export interface PatientProfile {
  cancer_type: 'breast' | 'lung';
  stage: 'I' | 'II' | 'III' | 'IV';
  age?: number;
  sex?: string;
  ecog?: number; // 0-4
  biomarkers: Record<string, BiomarkerStatus>;
  prior_therapies: string[];
  current_line?: string; // 'first-line' | 'post-targeted' | 'later-line'
  location_zip?: string;
}

// Trial Types
export interface TrialBase {
  nct_number: string;
  title: string;
  phase?: string;
  sponsor?: string;
  status: string;
  location?: string;
  distance_miles?: number;
  cancer_type: string;
  last_updated: string;
}

export interface TrialDetail extends TrialBase {
  id: number;
  eligibility_score?: string;
  match_confidence?: string;
}

export interface EligibilityCriterion {
  criterion: string;
  category: string;
  required: boolean;
}

export interface TrialMetadata {
  field_name: string;
  field_value: string;
}

export interface TrialFullDetail extends TrialDetail {
  eligibility_criteria: EligibilityCriterion[];
  metadata_fields: TrialMetadata[];
}

// Matching Result Types
export interface MatchReason {
  criterion: string;
  met: boolean;
  description: string;
}

export interface ConfirmationItem {
  item: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PatientBurden {
  visits_per_month?: string;
  imaging_frequency?: string;
  biopsy_required?: boolean;
  hospital_stays?: boolean;
}

export interface MatchedTrial {
  trial: TrialDetail;
  score: number; // 0-99
  confidence: 'high' | 'medium' | 'low';
  why_matched: MatchReason[];
  what_to_confirm: ConfirmationItem[];
  patient_burden: PatientBurden;
}

export interface MatchResponse {
  matched_trials: MatchedTrial[];
  total_trials_evaluated: number;
  possibly_eligible_count: number;
  dataset_version: string;
  generated_at: string;
}

// Clinician Brief Types
export interface ClinicianBriefRequest {
  patient_profile: PatientProfile;
  matched_trials: MatchedTrial[];
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