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
  // Transform biomarkers
  const biomarkers: Record<string, BiomarkerStatus> = {};
  
  if (patientData.cancerType === 'breast') {
    const profile = patientData.biomarkerProfile;
    
    // HER2
    if (profile.expression.HER2 !== 'unknown') {
      biomarkers.HER2 = {
        status: profile.expression.HER2 === '0' ? 'absent' : 'present',
        subtype: profile.expression.HER2,
      };
    }
    
    // ER
    if (profile.hormoneReceptors.ER !== 'unknown') {
      biomarkers.ER = {
        status: profile.hormoneReceptors.ER,
      };
    }
    
    // PR
    if (profile.hormoneReceptors.PR !== 'unknown') {
      biomarkers.PR = {
        status: profile.hormoneReceptors.PR,
      };
    }
    
    // ESR1
    if (profile.hormoneReceptors.ESR1 !== 'unknown') {
      biomarkers.ESR1 = {
        status: profile.hormoneReceptors.ESR1,
      };
    }
    
    // PIK3CA
    if (profile.genetic.PIK3CA !== 'unknown') {
      biomarkers.PIK3CA = {
        status: profile.genetic.PIK3CA,
      };
    }
    
    // BRCA
    if (profile.genetic.BRCA !== 'unknown') {
      biomarkers.BRCA = {
        status: profile.genetic.BRCA,
      };
    }
  } else if (patientData.cancerType === 'lung') {
    const profile = patientData.biomarkerProfile;
    
    // EGFR
    if (profile.genetic.EGFR.state !== 'unknown') {
      biomarkers.EGFR = {
        status: profile.genetic.EGFR.state,
        subtype: profile.genetic.EGFR.subtype !== 'unknown' ? profile.genetic.EGFR.subtype : undefined,
      };
    }
    
    // ALK
    if (profile.genetic.ALK !== 'unknown') {
      biomarkers.ALK = {
        status: profile.genetic.ALK,
      };
    }
    
    // ROS1
    if (profile.genetic.ROS1 !== 'unknown') {
      biomarkers.ROS1 = {
        status: profile.genetic.ROS1,
      };
    }
    
    // KRAS_G12C
    if (profile.genetic.KRAS_G12C !== 'unknown') {
      biomarkers.KRAS_G12C = {
        status: profile.genetic.KRAS_G12C,
      };
    }
    
    // MET
    if (profile.genetic.MET !== 'unknown') {
      biomarkers.MET = {
        status: profile.genetic.MET,
      };
    }
    
    // RET
    if (profile.genetic.RET !== 'unknown') {
      biomarkers.RET = {
        status: profile.genetic.RET,
      };
    }
    
    // BRAF
    if (profile.genetic.BRAF !== 'unknown') {
      biomarkers.BRAF = {
        status: profile.genetic.BRAF,
      };
    }
    
    // NTRK
    if (profile.genetic.NTRK !== 'unknown') {
      biomarkers.NTRK = {
        status: profile.genetic.NTRK,
      };
    }
    
    // PDL1
    if (profile.expression.PDL1 !== 'unknown') {
      biomarkers.PDL1 = {
        status: 'present',
        subtype: profile.expression.PDL1,
      };
    }
  }
  
  // Transform prior therapies
  const prior_therapies: string[] = [];
  if (patientData.cancerType === 'breast') {
    if (patientData.breastTreatments.cdk46Inhibitors === true) {
      prior_therapies.push('CDK4/6 inhibitor');
    }
    if (patientData.breastTreatments.endocrineTherapy === true) {
      prior_therapies.push('Endocrine therapy');
    }
  } else if (patientData.cancerType === 'lung') {
    if (patientData.lungTreatments.platinumChemo === true) {
      prior_therapies.push('Platinum-based chemotherapy');
    }
    if (patientData.lungTreatments.immunotherapy === true) {
      prior_therapies.push('Immunotherapy');
    }
    if (patientData.lungTreatments.targetedTherapy === true) {
      prior_therapies.push('Targeted therapy');
    }
  }
  
  return {
    cancer_type: patientData.cancerType as 'breast' | 'lung',
    stage: patientData.cancerStage || 'IV',
    age: patientData.age || undefined,
    sex: patientData.sex || undefined,
    ecog: patientData.ecogStatus || undefined,
    biomarkers,
    prior_therapies,
    current_line: patientData.lineOfTherapy || undefined,
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
        description: `Found ${data.possibly_eligible_count} possibly eligible trials`,
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
    matchedTrials: matchQuery.data?.matched_trials || [],
    possiblyEligibleCount: matchQuery.data?.possibly_eligible_count || 0,
    totalTrialsEvaluated: matchQuery.data?.total_trials_evaluated || 0,
    
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