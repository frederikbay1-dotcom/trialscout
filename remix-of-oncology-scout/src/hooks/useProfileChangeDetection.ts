import { useState, useEffect, useRef, useCallback } from "react";
import { PatientData } from "@/types/oncology";
import { BiomarkerProfile } from "@/types/biomarkers";

// Fields that affect trial matching
interface MatchingRelevantFields {
  cancerType: PatientData["cancerType"];
  cancerStage: PatientData["cancerStage"];
  biomarkerProfile: BiomarkerProfile;
  ecogStatus: PatientData["ecogStatus"];
  ecogUnknown: boolean;
  lineOfTherapy: PatientData["lineOfTherapy"];
  organFunction: PatientData["organFunction"];
  priorTreatmentTypes: PatientData["priorTreatmentTypes"];
  breastTreatments: PatientData["breastTreatments"];
  lungTreatments: PatientData["lungTreatments"];
}

function extractRelevantFields(patientData: PatientData): MatchingRelevantFields {
  return {
    cancerType: patientData.cancerType,
    cancerStage: patientData.cancerStage,
    biomarkerProfile: patientData.biomarkerProfile,
    ecogStatus: patientData.ecogStatus,
    ecogUnknown: patientData.ecogUnknown,
    lineOfTherapy: patientData.lineOfTherapy,
    organFunction: patientData.organFunction,
    priorTreatmentTypes: patientData.priorTreatmentTypes,
    breastTreatments: patientData.breastTreatments,
    lungTreatments: patientData.lungTreatments,
  };
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }
  
  return true;
}

export function useProfileChangeDetection(patientData: PatientData) {
  const [lastMatchedProfile, setLastMatchedProfile] = useState<MatchingRelevantFields | null>(null);
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [isRematching, setIsRematching] = useState(false);
  
  // Track the initial snapshot when results are first viewed
  const hasInitialized = useRef(false);

  // Initialize with current profile on first render
  useEffect(() => {
    if (!hasInitialized.current) {
      setLastMatchedProfile(extractRelevantFields(patientData));
      hasInitialized.current = true;
    }
  }, [patientData]);

  // Detect changes when patient data updates
  useEffect(() => {
    if (!lastMatchedProfile) return;
    
    const currentFields = extractRelevantFields(patientData);
    const hasChanges = !deepEqual(currentFields, lastMatchedProfile);
    
    setHasProfileChanges(hasChanges);
  }, [patientData, lastMatchedProfile]);

  // Function to mark matches as updated (user clicked "Update Matches")
  const confirmReMatch = useCallback(async () => {
    setIsRematching(true);
    
    // Simulate re-matching delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update the snapshot to current state
    setLastMatchedProfile(extractRelevantFields(patientData));
    setHasProfileChanges(false);
    setIsRematching(false);
  }, [patientData]);

  // Reset function for when user navigates away and back
  const resetDetection = useCallback(() => {
    setLastMatchedProfile(extractRelevantFields(patientData));
    setHasProfileChanges(false);
    hasInitialized.current = true;
  }, [patientData]);

  return {
    hasProfileChanges,
    isRematching,
    confirmReMatch,
    resetDetection,
  };
}
