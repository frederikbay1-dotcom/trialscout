import { motion } from "framer-motion";
import { Sparkles, MapPin } from "lucide-react";
import { GlassContainer } from "@/components/GlassContainer";
import { PriorTreatmentTypes } from "@/components/PriorTreatmentTypes";
import { TreatmentHistory } from "@/components/TreatmentHistory";
import { StructuredBiomarkerSelector } from "@/components/StructuredBiomarkerSelector";
import { HealthQuestion } from "@/components/HealthQuestion";
import { TravelPreferences } from "@/components/TravelPreferences";
import { ECOGSelector } from "@/components/ECOGSelector";
import { LineOfTherapySelector } from "@/components/LineOfTherapySelector";
import { InlineProgressBar } from "@/components/InlineProgressBar";
import { PatientData, PriorTreatmentTypes as PriorTreatmentTypesData, ECOGStatus, LineOfTherapy, TherapyEndDate, BestResponse } from "@/types/oncology";
import { BiomarkerProfile } from "@/types/biomarkers";

interface ClinicalDeepDiveStepProps {
  patientData: PatientData;
  onUpdatePatientData: (updates: Partial<PatientData>) => void;
  onUpdatePriorTreatmentTypes: (key: keyof PriorTreatmentTypesData, value: boolean) => void;
  onBreastChange: (key: keyof PatientData["breastTreatments"], value: boolean | "unsure") => void;
  onLungChange: (key: keyof PatientData["lungTreatments"], value: boolean | "unsure") => void;
  onUpdateBiomarkerProfile: (profile: BiomarkerProfile) => void;
  onUpdateOrganFunction: (key: keyof PatientData["organFunction"], value: "yes" | "no" | "unknown") => void;
}

export function ClinicalDeepDiveStep({
  patientData,
  onUpdatePatientData,
  onUpdatePriorTreatmentTypes,
  onBreastChange,
  onLungChange,
  onUpdateBiomarkerProfile,
  onUpdateOrganFunction,
}: ClinicalDeepDiveStepProps) {
  const hasAutoFilledTreatments = patientData.hasOncologyNote && 
    (patientData.priorTreatmentTypes.surgery || 
     patientData.priorTreatmentTypes.radiation || 
     patientData.priorTreatmentTypes.medication);
  
  const hasAutoFilledBiomarkers = patientData.hasPathologyReport && 
    patientData.biomarkers.length > 0;

  const handleECOGChange = (status: ECOGStatus) => {
    onUpdatePatientData({ ecogStatus: status });
  };

  const handleECOGUnknownChange = (unknown: boolean) => {
    onUpdatePatientData({ ecogUnknown: unknown });
  };

  const handleLineOfTherapyChange = (line: LineOfTherapy) => {
    onUpdatePatientData({ lineOfTherapy: line });
  };

  const handleLastTherapyEndDateChange = (date: TherapyEndDate) => {
    onUpdatePatientData({ lastTherapyEndDate: date });
  };

  const handleBestResponseChange = (response: BestResponse) => {
    onUpdatePatientData({ bestResponseToLastTherapy: response });
  };

  return (
    <div className="min-h-screen flex flex-col justify-start pb-32">
      {/* Inline Progress Bar */}
      <InlineProgressBar currentStep={2} totalSteps={3} stepLabel="Clinical Details" />

      <div className="py-8 px-4">
        <div className="container max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Clinical Details</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tell us about your treatment history and preferences
            </p>
          </motion.div>

          {/* ECOG Performance Status */}
          <GlassContainer className="p-6 md:p-8">
            <ECOGSelector
              value={patientData.ecogStatus}
              onChange={handleECOGChange}
              ecogUnknown={patientData.ecogUnknown}
              onEcogUnknownChange={handleECOGUnknownChange}
            />
          </GlassContainer>

          {/* Line of Therapy with Treatment Timing */}
          <GlassContainer className="p-6 md:p-8">
            <LineOfTherapySelector
              value={patientData.lineOfTherapy}
              onChange={handleLineOfTherapyChange}
              lastTherapyEndDate={patientData.lastTherapyEndDate}
              onLastTherapyEndDateChange={handleLastTherapyEndDateChange}
              bestResponse={patientData.bestResponseToLastTherapy}
              onBestResponseChange={handleBestResponseChange}
            />
          </GlassContainer>

          {/* Prior Treatment Types */}
          <GlassContainer className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-gray-900">Prior Treatments</h2>
                  {hasAutoFilledTreatments && (
                    <span className="auto-fill-badge">
                      <Sparkles className="w-4 h-4" />
                      ✓ Found in your report
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-600 mt-1">
                  Select all types of treatment you've received
                </p>
              </div>
            </div>
            <PriorTreatmentTypes
              values={patientData.priorTreatmentTypes}
              onChange={onUpdatePriorTreatmentTypes}
              showHeader={false}
            />
          </GlassContainer>

          {/* Medication-specific treatments */}
          {patientData.priorTreatmentTypes.medication && patientData.cancerType && (
            <GlassContainer className="p-6 md:p-8">
              <TreatmentHistory
                cancerType={patientData.cancerType}
                breastTreatments={patientData.breastTreatments}
                lungTreatments={patientData.lungTreatments}
                onBreastChange={onBreastChange}
                onLungChange={onLungChange}
                hasAutoFilled={patientData.hasOncologyNote}
              />
            </GlassContainer>
          )}

          {/* Structured Biomarkers */}
          {patientData.cancerType && (
            <GlassContainer className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-gray-900">Biomarker Profile</h2>
                    {hasAutoFilledBiomarkers && (
                      <span className="auto-fill-badge">
                        <Sparkles className="w-4 h-4" />
                        ✓ Found in your report
                      </span>
                    )}
                  </div>
                  <p className="text-base text-gray-600 mt-1">
                    Set the status for each biomarker based on your testing results
                  </p>
                </div>
              </div>
              
              {/* Biomarker Explanation Callout */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-1">About Biomarkers</h4>
                <p className="text-sm text-gray-700">
                  Biomarkers are genetic changes in your cancer that determine which treatments will work best. 
                  Your pathology report should list which biomarkers you have.
                </p>
              </div>
              
              <StructuredBiomarkerSelector
                cancerType={patientData.cancerType}
                profile={patientData.biomarkerProfile}
                onUpdateProfile={onUpdateBiomarkerProfile}
                showHeader={false}
              />
            </GlassContainer>
          )}

          {/* Health Check Questions */}
          <GlassContainer className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Health Check</h2>
              <p className="text-base text-gray-600 mt-1">
                These questions help determine eligibility for certain trials
              </p>
            </div>

            <div className="space-y-6">
              <HealthQuestion
                question="Has a doctor told you your liver or kidneys aren't working well?"
                value={patientData.organFunction.liverKidneyIssues}
                onChange={(value) => onUpdateOrganFunction("liverKidneyIssues", value)}
                delay={0}
              />
              <HealthQuestion
                question="Has cancer spread to your brain (Brain Metastases)?"
                value={patientData.organFunction.brainMetastases}
                onChange={(value) => onUpdateOrganFunction("brainMetastases", value)}
                delay={0.1}
              />
              <HealthQuestion
                question="Do you have any other active cancers?"
                value={patientData.organFunction.otherActiveCancers}
                onChange={(value) => onUpdateOrganFunction("otherActiveCancers", value)}
                delay={0.2}
              />
            </div>
          </GlassContainer>

          {/* Travel Preferences */}
          <GlassContainer className="p-6 md:p-8">
            <TravelPreferences
              zipCode={patientData.zipCode}
              maxTravelDistance={patientData.maxTravelDistance}
              onZipCodeChange={(value) => onUpdatePatientData({ zipCode: value })}
              onDistanceChange={(value) => onUpdatePatientData({ maxTravelDistance: value })}
            />
          </GlassContainer>
        </div>
      </div>
    </div>
  );
}
