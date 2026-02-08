/**
 * Custom hook for trial matching with backend API integration
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PatientData } from '@/types/oncology';
import type {
  PatientProfile,
  MatchResponse,
  MatchedTrial as APIMatchedTrial,
  BiomarkerStatus,
} from '@/types/api';
import { api, APIClientError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

/**
 * Transform frontend PatientData to backend PatientProfile
 */
function transformPatientDataToProfile(patientData: PatientData): PatientProfile {
  const profile = patientData.biomarkerProfile;
  
  // Transform biomarkers based on cancer type
  let biomarkers: any;
  
  if (patientData.cancerType === 'breast') {
    biomarkers = {
      ER: profile.hormoneReceptors.ER || 'unknown',
      PR: profile.hormoneReceptors.PR || 'unknown',
      HER2: profile.expression.HER2 === '0' ? 'negative' :
            profile.expression.HER2 === 'low' ? 'low' :
            profile.expression.HER2 === 'positive' ? 'positive' : 'unknown',
      Ki67: undefined,
    };
  } else if (patientData.cancerType === 'lung') {
    biomarkers = {
      EGFR: {
        status: profile.genetic.EGFR.state || 'unknown',
        mutation: profile.genetic.EGFR.subtype !== 'unknown' ? profile.genetic.EGFR.subtype : undefined,
      },
      ALK: profile.genetic.ALK || 'unknown',
      ROS1: profile.genetic.ROS1 || 'unknown',
      KRAS: {
        status: profile.genetic.KRAS_G12C || 'unknown',
        mutation: profile.genetic.KRAS_G12C === 'present' ? 'G12C' : undefined,
      },
      MET: {
        status: profile.genetic.MET || 'unknown',
        alteration: undefined,
      },
      BRAF: profile.genetic.BRAF || 'unknown',
      PDL1: {
        status: profile.expression.PDL1 !== 'unknown' ? 'present' : 'unknown',
        percentage: profile.expression.PDL1 !== 'unknown' ? parseInt(profile.expression.PDL1) : undefined,
      },
    };
  }
  
  // Transform prior therapies
  const prior_treatments: any[] = [];
  if (patientData.cancerType === 'breast') {
    if (patientData.breastTreatments.cdk46Inhibitors === true) {
      prior_treatments.push({
        category: 'targeted_therapy',
        name: 'CDK4/6 inhibitor',
      });
    }
    if (patientData.breastTreatments.endocrineTherapy === true) {
      prior_treatments.push({
        category: 'hormone_therapy',
        name: 'Endocrine therapy',
      });
    }
  } else if (patientData.cancerType === 'lung') {
    if (patientData.lungTreatments.platinumChemo === true) {
      prior_treatments.push({
        category: 'chemotherapy',
        name: 'Platinum-based chemotherapy',
      });
    }
    if (patientData.lungTreatments.immunotherapy === true) {
      prior_treatments.push({
        category: 'immunotherapy',
        name: 'Immunotherapy',
      });
    }
    if (patientData.lungTreatments.targetedTherapy === true) {
      prior_treatments.push({
        category: 'targeted_therapy',
        name: 'Targeted therapy',
      });
    }
  }
  
  return {
    age: patientData.age || 50,
    sex: (patientData.sex || 'female') as 'male' | 'female' | 'other',
    cancer_type: patientData.cancerType as 'breast' | 'lung',
    stage: patientData.cancerStage || 'IV',
    ecog: (patientData.ecogStatus?.toString() || 'unknown') as '0' | '1' | '2' | '3' | '4' | 'unknown',
    biomarkers,
    prior_treatments,
    line_of_therapy: (patientData.lineOfTherapy || 'later_line') as 'first' | 'post_targeted' | 'later_line',
  };
}

export interface UseTrialMatchingOptions {
  enabled?: boolean;
  onSuccess?: (data: MatchResponse) => void;
  onError?: (error: APIClientError) => void;
}

export function useTrialMatching(
  patientData: PatientData,
  options: UseTrialMatchingOptions = {}
) {
  const [isMatching, setIsMatching] = useState(false);

  // Query for matching trials
  const matchQuery = useQuery({
    queryKey: ['trial-matches', patientData],
    queryFn: async () => {
      const profile = transformPatientDataToProfile(patientData);
      return api.trials.match(profile);
    },
    enabled: options.enabled !== false && patientData.cancerType !== null,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for re-matching
  const matchMutation = useMutation({
    mutationFn: async (data: PatientData) => {
      const profile = transformPatientDataToProfile(data);
      return api.trials.match(profile);
    },
    onSuccess: (data) => {
      toast({
        title: 'Matches Updated',
        description: `Found ${data.stats.possibly_eligible} possibly eligible trials`,
      });
      options.onSuccess?.(data);
    },
    onError: (error: APIClientError) => {
      toast({
        title: 'Error Matching Trials',
        description: error.message || 'Failed to match trials. Please try again.',
        variant: 'destructive',
      });
      options.onError?.(error);
    },
  });

  const rematch = useCallback(
    async (data?: PatientData) => {
      setIsMatching(true);
      try {
        await matchMutation.mutateAsync(data || patientData);
      } finally {
        setIsMatching(false);
      }
    },
    [matchMutation, patientData]
  );

  return {
    // Data
    matchResponse: matchQuery.data,
    matchedTrials: matchQuery.data?.matches || [],
    possiblyEligibleCount: matchQuery.data?.stats.possibly_eligible || 0,
    totalTrialsEvaluated: matchQuery.data?.stats.total_trials || 0,
    
    // Status
    isLoading: matchQuery.isLoading || isMatching,
    isError: matchQuery.isError,
    error: matchQuery.error as APIClientError | null,
    
    // Actions
    rematch,
    refetch: matchQuery.refetch,
  };
}

/**
 * Hook for generating clinician brief
 */
export function useClinicianBrief() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBrief = useCallback(
    async (patientData: PatientData, matchedTrials: APIMatchedTrial[], topN: number = 5) => {
      setIsGenerating(true);
      try {
        const profile = transformPatientDataToProfile(patientData);
        const response = await api.brief.generate({
          patient_profile: profile,
          matched_trials: matchedTrials,
          top_n: topN,
        });
        
        // Download the PDF
        api.brief.download(response.pdf_base64, response.filename);
        
        toast({
          title: 'Brief Generated',
          description: 'Your clinician brief has been downloaded',
        });
        
        return response;
      } catch (error) {
        const apiError = error as APIClientError;
        toast({
          title: 'Error Generating Brief',
          description: apiError.message || 'Failed to generate brief. Please try again.',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    generateBrief,
    isGenerating,
  };
}

/**
 * Hook for checking backend health
 */
export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: () => api.health.check(),
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
  });
}