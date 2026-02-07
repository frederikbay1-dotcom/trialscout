import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Microscope, ClipboardList, User, Sparkles, AlertCircle, Lock } from "lucide-react";
import { GlassContainer } from "@/components/GlassContainer";
import { FileUploadZone } from "@/components/FileUploadZone";
import { CancerTypeSelector } from "@/components/CancerTypeSelector";
import { CancerStageSelector } from "@/components/CancerStageSelector";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { InlineProgressBar } from "@/components/InlineProgressBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PatientData, CancerType, CancerStage } from "@/types/oncology";
import {
  extractFromPathologyReport,
  extractFromOncologyNote,
  pathologyToPatientData,
  oncologyNoteToPatientData,
} from "@/lib/mockExtraction";

interface ScreenerStepProps {
  patientData: PatientData;
  onUpdatePatientData: (updates: Partial<PatientData>) => void;
}

export function ScreenerStep({
  patientData,
  onUpdatePatientData,
}: ScreenerStepProps) {
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const handlePathologyUpload = () => {
    const extracted = extractFromPathologyReport();
    const updates = pathologyToPatientData(extracted);
    onUpdatePatientData({ ...updates, hasPathologyReport: true });
    setHasAutoFilled(true);
  };

  const handleOncologyUpload = () => {
    const extracted = extractFromOncologyNote();
    const updates = oncologyNoteToPatientData(extracted);
    onUpdatePatientData({ ...updates, hasOncologyNote: true });
    setHasAutoFilled(true);
  };

  const cancerTypeExtracted = patientData.extractedFields?.cancerType;
  const cancerStageExtracted = patientData.extractedFields?.cancerStage;

  return (
    <div className="min-h-screen flex flex-col justify-start pb-32">
      {/* Inline Progress Bar */}
      <InlineProgressBar currentStep={1} totalSteps={3} stepLabel="Medical Info" />

      <div className="py-8 px-4">
        <div className="container max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Medical Information</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Help us understand your situation to find the best matches
            </p>
          </motion.div>

          {/* Demographics */}
          <GlassContainer className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-gray-900">Demographics</h2>
                  {patientData.hasOncologyNote && patientData.age && (
                    <span className="auto-fill-badge">
                      <Sparkles className="w-4 h-4" />
                      ✓ Found in your report
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-600 mt-1">
                  Some trials have specific age or sex requirements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-medium text-gray-900">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={patientData.age || ""}
                  onChange={(e) =>
                    onUpdatePatientData({ age: e.target.value ? parseInt(e.target.value) : null })
                  }
                  className="h-12 text-base"
                  min={18}
                  max={120}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">Sex</Label>
                <RadioGroup
                  value={patientData.sex || ""}
                  onValueChange={(value) => onUpdatePatientData({ sex: value as "male" | "female" })}
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" className="w-5 h-5" />
                    <Label htmlFor="male" className="cursor-pointer text-base">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" className="w-5 h-5" />
                    <Label htmlFor="female" className="cursor-pointer text-base">Female</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </GlassContainer>

          {/* Clinical Records Upload */}
          <GlassContainer className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Clinical Records</h2>
                <p className="text-base text-gray-600">
                  Upload your medical documents for AI-powered data extraction
                </p>
              </div>
              {!hasAutoFilled && (
                <div className="flex items-center gap-2 text-sm font-medium bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-fills your info</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FileUploadZone
                icon={<Microscope className="w-8 h-8" />}
                label="Upload Pathology Report"
                description="PDF, DOC, or image files"
                isUploaded={patientData.hasPathologyReport}
                onUploadComplete={handlePathologyUpload}
              />
              <FileUploadZone
                icon={<ClipboardList className="w-8 h-8" />}
                label="Upload Oncology Note"
                description="Clinical notes from your oncologist"
                isUploaded={patientData.hasOncologyNote}
                onUploadComplete={handleOncologyUpload}
              />
            </div>

            {/* Security note */}
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Encrypted and never shared
            </p>
          </GlassContainer>

          {/* Auto-fill Notice */}
          <AnimatePresence>
            {hasAutoFilled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-medium text-gray-900">
                    Data extracted from your documents
                  </p>
                  <p className="text-base text-gray-600 mt-1 leading-relaxed">
                    We've auto-filled information below based on your clinical records. 
                    Confidence levels indicate extraction accuracy. Please review and correct any inaccuracies.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cancer Type Selection */}
          <GlassContainer className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-semibold text-gray-900">Diagnosis</h2>
                  {patientData.hasPathologyReport && patientData.cancerType && (
                    <span className="auto-fill-badge">
                      <Sparkles className="w-4 h-4" />
                      ✓ Found in your report
                    </span>
                  )}
                  {cancerTypeExtracted && (
                    <ConfidenceIndicator 
                      confidence={cancerTypeExtracted.confidence} 
                      source={cancerTypeExtracted.source}
                    />
                  )}
                </div>
                <p className="text-base text-gray-600 mt-1">
                  Select your primary cancer type
                </p>
              </div>
            </div>
            <CancerTypeSelector
              value={patientData.cancerType}
              onChange={(value: CancerType) => onUpdatePatientData({ cancerType: value })}
            />

            {/* Cancer Stage - shown after type is selected */}
            {patientData.cancerType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="section-divider"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-900">Stage</h3>
                      {patientData.hasPathologyReport && patientData.cancerStage && (
                        <span className="auto-fill-badge">
                          <Sparkles className="w-4 h-4" />
                          ✓ Found in your report
                        </span>
                      )}
                      {cancerStageExtracted && (
                        <ConfidenceIndicator 
                          confidence={cancerStageExtracted.confidence} 
                          source={cancerStageExtracted.source}
                        />
                      )}
                    </div>
                    <p className="text-base text-gray-600 mt-1">
                      What stage is your cancer? This helps narrow down relevant trials.
                    </p>
                  </div>
                </div>
                <CancerStageSelector
                  value={patientData.cancerStage}
                  onChange={(value: CancerStage) => onUpdatePatientData({ cancerStage: value })}
                />
              </motion.div>
            )}
          </GlassContainer>
        </div>
      </div>
    </div>
  );
}
