import { useState, useEffect, useCallback } from "react";
import { PatientData, defaultPatientData, PriorTreatmentTypes, TherapyEndDate, BestResponse } from "@/types/oncology";
import { BiomarkerProfile } from "@/types/biomarkers";

const SESSION_KEY = "oncology_scout_patient_data";
const STEP_KEY = "oncology_scout_current_step";

export function usePatientData() {
  const [patientData, setPatientData] = useState<PatientData>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        // Merge saved data with defaults to ensure new fields are present
        const parsed = JSON.parse(saved);
        return {
          ...defaultPatientData,
          ...parsed,
          organFunction: { ...defaultPatientData.organFunction, ...parsed.organFunction },
          priorTreatmentTypes: { ...defaultPatientData.priorTreatmentTypes, ...parsed.priorTreatmentTypes },
          breastTreatments: { ...defaultPatientData.breastTreatments, ...parsed.breastTreatments },
          lungTreatments: { ...defaultPatientData.lungTreatments, ...parsed.lungTreatments },
          biomarkerProfile: { 
            ...defaultPatientData.biomarkerProfile, 
            ...parsed.biomarkerProfile,
            genetic: { ...defaultPatientData.biomarkerProfile.genetic, ...parsed.biomarkerProfile?.genetic },
            expression: { ...defaultPatientData.biomarkerProfile.expression, ...parsed.biomarkerProfile?.expression },
            hormoneReceptors: { ...defaultPatientData.biomarkerProfile.hormoneReceptors, ...parsed.biomarkerProfile?.hormoneReceptors },
          },
        };
      }
      return defaultPatientData;
    } catch {
      return defaultPatientData;
    }
  });

  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STEP_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Persist patient data to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(patientData));
    } catch (e) {
      console.warn("Failed to save patient data to session storage:", e);
    }
  }, [patientData]);

  // Persist current step
  useEffect(() => {
    try {
      sessionStorage.setItem(STEP_KEY, String(currentStep));
    } catch (e) {
      console.warn("Failed to save step to session storage:", e);
    }
  }, [currentStep]);

  const updatePatientData = useCallback((updates: Partial<PatientData>) => {
    setPatientData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateOrganFunction = useCallback(
    (key: keyof PatientData["organFunction"], value: "yes" | "no" | "unknown") => {
      setPatientData((prev) => ({
        ...prev,
        organFunction: { ...prev.organFunction, [key]: value },
      }));
    },
    []
  );

  const updatePriorTreatmentTypes = useCallback(
    (key: keyof PriorTreatmentTypes, value: boolean) => {
      setPatientData((prev) => ({
        ...prev,
        priorTreatmentTypes: { ...prev.priorTreatmentTypes, [key]: value },
      }));
    },
    []
  );

  const updateBreastTreatments = useCallback(
    (key: keyof PatientData["breastTreatments"], value: boolean | "unsure") => {
      setPatientData((prev) => ({
        ...prev,
        breastTreatments: { ...prev.breastTreatments, [key]: value },
      }));
    },
    []
  );

  const updateLungTreatments = useCallback(
    (key: keyof PatientData["lungTreatments"], value: boolean | "unsure") => {
      setPatientData((prev) => ({
        ...prev,
        lungTreatments: { ...prev.lungTreatments, [key]: value },
      }));
    },
    []
  );

  const updateBiomarkerProfile = useCallback((profile: BiomarkerProfile) => {
    setPatientData((prev) => ({
      ...prev,
      biomarkerProfile: profile,
    }));
  }, []);

  const updateLastTherapyEndDate = useCallback((date: TherapyEndDate) => {
    setPatientData((prev) => ({
      ...prev,
      lastTherapyEndDate: date,
    }));
  }, []);

  const updateBestResponse = useCallback((response: BestResponse) => {
    setPatientData((prev) => ({
      ...prev,
      bestResponseToLastTherapy: response,
    }));
  }, []);

  const toggleBiomarker = useCallback((marker: string) => {
    setPatientData((prev) => ({
      ...prev,
      biomarkers: prev.biomarkers.includes(marker)
        ? prev.biomarkers.filter((m) => m !== marker)
        : [...prev.biomarkers, marker],
    }));
  }, []);

  const resetData = useCallback(() => {
    setPatientData(defaultPatientData);
    setCurrentStep(1);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(STEP_KEY);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    patientData,
    currentStep,
    updatePatientData,
    updateOrganFunction,
    updatePriorTreatmentTypes,
    updateBreastTreatments,
    updateLungTreatments,
    updateBiomarkerProfile,
    updateLastTherapyEndDate,
    updateBestResponse,
    toggleBiomarker,
    resetData,
    goToStep,
    nextStep,
    prevStep,
  };
}
