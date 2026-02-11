import { usePatientData } from "@/hooks/usePatientData";
import { StepNavigation } from "@/components/StepNavigation";
import { LandingStep } from "@/components/steps/LandingStep";
import { ScreenerStep } from "@/components/steps/ScreenerStep";
import { ClinicalDeepDiveStep } from "@/components/steps/ClinicalDeepDiveStep";
import { ResultsStep } from "@/components/steps/ResultsStep";
import { GlobalFooter } from "@/components/GlobalFooter";
import { AnimatePresence, motion } from "framer-motion";
import { SAMPLE_PATIENTS, SamplePatientKey } from "@/data/samplePatients";

const Index = () => {
  const {
    patientData,
    currentStep,
    updatePatientData,
    updateOrganFunction,
    updatePriorTreatmentTypes,
    updateBreastTreatments,
    updateLungTreatments,
    updateBiomarkerProfile,
    resetData,
    goToStep,
    nextStep,
    prevStep,
  } = usePatientData();

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return patientData.cancerType !== null;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleTrySample = (patientKey: SamplePatientKey) => {
    const sampleData = SAMPLE_PATIENTS[patientKey];
    // Load all patient data at once via updatePatientData (accepts Partial<PatientData>)
    updatePatientData({
      age: sampleData.age,
      sex: sampleData.sex,
      cancerType: sampleData.cancerType,
      cancerStage: sampleData.cancerStage,
      ecogStatus: sampleData.ecogStatus,
      lineOfTherapy: sampleData.lineOfTherapy,
      biomarkers: sampleData.biomarkers,
      biomarkerProfile: sampleData.biomarkerProfile,
      breastTreatments: sampleData.breastTreatments,
      lungTreatments: sampleData.lungTreatments,
      priorTreatmentTypes: sampleData.priorTreatmentTypes,
      organFunction: sampleData.organFunction,
    });
    goToStep(2);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LandingStep onStart={nextStep} onTrySample={handleTrySample} />;
      case 2:
        return (
          <ScreenerStep
            patientData={patientData}
            onUpdatePatientData={updatePatientData}
          />
        );
      case 3:
        return (
          <ClinicalDeepDiveStep
            patientData={patientData}
            onUpdatePatientData={updatePatientData}
            onUpdatePriorTreatmentTypes={updatePriorTreatmentTypes}
            onBreastChange={updateBreastTreatments}
            onLungChange={updateLungTreatments}
            onUpdateBiomarkerProfile={updateBiomarkerProfile}
            onUpdateOrganFunction={updateOrganFunction}
          />
        );
      case 4:
        return <ResultsStep patientData={patientData} onReset={resetData} />;
      default:
        return <LandingStep onStart={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 mesh-gradient">
        {renderStep()}

      {currentStep > 1 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={4}
          onBack={prevStep}
          onNext={nextStep}
          nextLabel={currentStep === 3 ? "Find Trials" : currentStep === 4 ? "" : "Continue"}
          nextDisabled={!canProceedFromStep(currentStep)}
        />
      )}
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default Index;
