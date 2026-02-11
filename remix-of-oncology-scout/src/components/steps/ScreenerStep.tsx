import { useState } from "react";
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
import { PatientData, CancerType, CancerStage, ECOGStatus } from "@/types/oncology";
import { BiomarkerProfile, BiomarkerState, EGFRSubtype, defaultBiomarkerProfile } from "@/types/biomarkers";
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

  // Helper function to convert API biomarker format to frontend BiomarkerProfile
  const convertApiBiomarkersToProfile = (apiBiomarkers: any): BiomarkerProfile => {
    const profile: BiomarkerProfile = JSON.parse(JSON.stringify(defaultBiomarkerProfile));
    
    if (!apiBiomarkers || typeof apiBiomarkers !== 'object') {
      return profile;
    }

    // Helper to convert API status to BiomarkerState
    const toBiomarkerState = (value: any): BiomarkerState => {
      if (!value || typeof value !== 'string') return "unknown";
      const normalized = value.toLowerCase();
      if (normalized === "positive" || normalized === "present" || normalized === "detected") return "present";
      if (normalized === "negative" || normalized === "absent" || normalized === "not detected") return "absent";
      return "unknown";
    };

    // Helper to convert EGFR subtype
    const toEGFRSubtype = (subtype: any): EGFRSubtype => {
      if (!subtype || typeof subtype !== 'string') return "unknown";
      const normalized = subtype.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized.includes("exon19") || normalized.includes("e19")) return "exon19_del";
      if (normalized.includes("l858r")) return "l858r";
      if (normalized.includes("exon20") || normalized.includes("e20")) return "exon20_ins";
      if (normalized.includes("t790m")) return "t790m";
      if (normalized === "unknown") return "unknown";
      return "other";
    };

    // Process each biomarker from API
    Object.entries(apiBiomarkers).forEach(([key, data]: [string, any]) => {
      if (!data || typeof data !== 'object') return;
      
      const normalizedKey = key.toUpperCase().replace(/[^A-Z0-9_]/g, '');
      const value = data.value || data.status;
      const state = toBiomarkerState(value);

      // Map to genetic alterations
      if (normalizedKey === "EGFR") {
        profile.genetic.EGFR = {
          state,
          subtype: toEGFRSubtype(data.subtype || data.mutation)
        };
      } else if (normalizedKey === "ALK") {
        profile.genetic.ALK = state;
      } else if (normalizedKey === "ROS1") {
        profile.genetic.ROS1 = state;
      } else if (normalizedKey === "BRAF") {
        profile.genetic.BRAF = state;
      } else if (normalizedKey === "KRAS" || normalizedKey === "KRASG12C" || normalizedKey === "KRAS_G12C") {
        profile.genetic.KRAS_G12C = state;
      } else if (normalizedKey === "MET") {
        profile.genetic.MET = state;
      } else if (normalizedKey === "RET") {
        profile.genetic.RET = state;
      } else if (normalizedKey === "NTRK") {
        profile.genetic.NTRK = state;
      }
      // Map to expression markers
      else if (normalizedKey === "PDL1" || normalizedKey === "PD-L1" || normalizedKey === "PD_L1") {
        // PD-L1 can come as percentage (number) or status (string)
        if (typeof data.percentage === 'number') {
          // Store as "high" (≥50%) or "low" (<50%) for display
          profile.expression.PDL1 = data.percentage >= 50 ? "high" : "low";
        } else 
        if (value && typeof value === 'string') {
          const normalized = value.toLowerCase();
          if (normalized.includes("high") || normalized.includes(">50") || normalized.includes("≥50")) {
            profile.expression.PDL1 = "high";
          } else if (normalized.includes("low") || normalized.includes("<50")) {
            profile.expression.PDL1 = "low";
          }
        }
      } else if (normalizedKey === "HER2") {
        if (value && typeof value === 'string') {
          const normalized = value.toLowerCase();
          if (normalized.includes("3+") || normalized === "positive") {
            profile.expression.HER2 = "positive";
          } else if (normalized.includes("1+") || normalized.includes("2+") || normalized.includes("low")) {
            profile.expression.HER2 = "low";
          } else if (normalized === "0" || normalized === "negative") {
            profile.expression.HER2 = "0";
          }
        }
      }
      // Map to hormone receptors (breast cancer)
      else if (normalizedKey === "ER") {
        profile.hormoneReceptors.ER = state;
      } else if (normalizedKey === "PR") {
        profile.hormoneReceptors.PR = state;
      } else if (normalizedKey === "BRCA1" || normalizedKey === "BRCA2" || normalizedKey === "BRCA1_2" || normalizedKey === "BRCA") {
        profile.hormoneReceptors.BRCA1_2 = state;
      } else if (normalizedKey === "PIK3CA") {
        profile.hormoneReceptors.PIK3CA = state;
      } else if (normalizedKey === "ESR1") {
        profile.hormoneReceptors.ESR1 = state;
      }
    });

    return profile;
  };

  const handlePathologyUpload = (extractedData?: any) => {
    if (extractedData) {
      // Real API extraction
      console.log('🔬 Pathology Report - Raw API Response:', extractedData);
      console.log('🔬 Age:', extractedData.age);
      console.log('🔬 Sex:', extractedData.sex);
      console.log('🔬 Current Treatment Status:', extractedData.current_treatment_status);
      
      const updates: Partial<PatientData> = {
        hasPathologyReport: true,
      };
      
      // Extract patient demographics (age, sex) - support both nested and flat structure
      const demographics = extractedData.patient_demographics || extractedData;
      console.log('📊 Demographics object:', demographics);
      
      if (demographics.age && typeof demographics.age === 'number') {
        updates.age = demographics.age;
        console.log('✅ Setting age to:', demographics.age);
      } else {
        console.log('❌ Age not found or invalid type:', demographics.age, typeof demographics.age);
      }
      
      if (demographics.sex && typeof demographics.sex === 'string') {
        const sex = demographics.sex.toLowerCase();
        if (sex === 'male' || sex === 'female') {
          updates.sex = sex as 'male' | 'female';
          console.log('✅ Setting sex to:', sex);
        } else {
          console.log('❌ Sex value not male/female:', sex);
        }
      } else {
        console.log('❌ Sex not found or invalid type:', demographics.sex, typeof demographics.sex);
      }
      
      // Extract clinical status (stage, ECOG, histology)
      if (extractedData.clinical_status) {
        const clinical = extractedData.clinical_status;
        
        // Stage
        if (clinical.stage && typeof clinical.stage === 'string') {
          let stage = clinical.stage.replace(/^Stage\s+/i, '').trim();
          stage = stage.replace(/[ABC]$/i, '');
          if (stage && ['I', 'II', 'III', 'IV'].includes(stage)) {
            updates.cancerStage = stage as CancerStage;
          }
        }
        
        // ECOG (will be used in next step)
        if (clinical.ecog && typeof clinical.ecog === 'string' && clinical.ecog !== 'unknown') {
          // Convert string to number for ECOGStatus type
          const ecogNum = parseInt(clinical.ecog, 10);
          if (!isNaN(ecogNum) && ecogNum >= 0 && ecogNum <= 4) {
            updates.ecogStatus = ecogNum as ECOGStatus;
            console.log('✅ Setting ECOG status to:', ecogNum);
          }
        }
      }
      
      // Also check for ECOG at top level (flat structure)
      if (extractedData.ecog && typeof extractedData.ecog === 'string' && extractedData.ecog !== 'unknown' && !updates.ecogStatus) {
        const ecogNum = parseInt(extractedData.ecog, 10);
        if (!isNaN(ecogNum) && ecogNum >= 0 && ecogNum <= 4) {
          updates.ecogStatus = ecogNum as ECOGStatus;
          console.log('✅ Setting ECOG status (from top level) to:', ecogNum);
        }
      }
      
      // Map API response to PatientData (legacy fields)
      if (extractedData.cancer_type) {
        updates.cancerType = extractedData.cancer_type as CancerType;
      }
      if (extractedData.stage && !updates.cancerStage) {
        // Fallback to legacy stage field if clinical_status.stage not found
        const stageStr = typeof extractedData.stage === 'string' ? extractedData.stage : String(extractedData.stage);
        let stage = stageStr.replace(/^Stage\s+/i, '').trim();
        stage = stage.replace(/[ABC]$/i, '');
        updates.cancerStage = stage as CancerStage;
      }
      if (extractedData.biomarkers) {
        // Convert API biomarker format to frontend BiomarkerProfile structure
        const biomarkerProfile = convertApiBiomarkersToProfile(extractedData.biomarkers);
        updates.biomarkerProfile = biomarkerProfile;
        
        // Also create legacy string array for backward compatibility
        const biomarkerStrings: string[] = [];
        Object.entries(extractedData.biomarkers).forEach(([key, data]: [string, any]) => {
          if (data && typeof data === 'object') {
            const value = data.value || data.status;
            if (value && typeof value === 'string' && value !== 'unknown') {
              const subtypeStr = data.subtype && typeof data.subtype === 'string' ? ` (${data.subtype})` : '';
              biomarkerStrings.push(`${key}: ${value}${subtypeStr}`);
            }
          }
        });
        updates.biomarkers = biomarkerStrings;
      }
      
      console.log('📤 Pathology - Final updates object:', updates);
      onUpdatePatientData(updates);
      setHasAutoFilled(true);
    } else {
      // Fallback to mock extraction
      const extracted = extractFromPathologyReport();
      const updates = pathologyToPatientData(extracted);
      onUpdatePatientData({ ...updates, hasPathologyReport: true });
      setHasAutoFilled(true);
    }
  };

  const handleOncologyUpload = (extractedData?: any) => {
    if (extractedData) {
      // Real API extraction
      console.log('📋 Oncology Note - Raw API Response:', extractedData);
      console.log('📋 Age:', extractedData.age);
      console.log('📋 Sex:', extractedData.sex);
      console.log('📋 Current Treatment Status:', extractedData.current_treatment_status);
      
      const updates: Partial<PatientData> = {
        hasOncologyNote: true,
      };
      
      // Extract patient demographics (age, sex) - support both nested and flat structure
      const demographics = extractedData.patient_demographics || extractedData;
      console.log('📊 Demographics object:', demographics);
      console.log('📊 Current patientData.age:', patientData.age);
      console.log('📊 Current patientData.sex:', patientData.sex);
      
      if (demographics.age && typeof demographics.age === 'number' && !patientData.age) {
        updates.age = demographics.age;
        console.log('✅ Setting age to:', demographics.age);
      } else {
        console.log('❌ Age not set. Reasons: age=', demographics.age, 'type=', typeof demographics.age, 'already has age=', !!patientData.age);
      }
      
      if (demographics.sex && typeof demographics.sex === 'string' && !patientData.sex) {
        const sex = demographics.sex.toLowerCase();
        if (sex === 'male' || sex === 'female') {
          updates.sex = sex as 'male' | 'female';
          console.log('✅ Setting sex to:', sex);
        } else {
          console.log('❌ Sex value not male/female:', sex);
        }
      } else {
        console.log('❌ Sex not set. Reasons: sex=', demographics.sex, 'type=', typeof demographics.sex, 'already has sex=', !!patientData.sex);
      }
      
      // Extract clinical status (stage, ECOG)
      if (extractedData.clinical_status) {
        const clinical = extractedData.clinical_status;
        
        // Stage
        if (clinical.stage && typeof clinical.stage === 'string') {
          let stage = clinical.stage.replace(/^Stage\s+/i, '').trim();
          stage = stage.replace(/[ABC]$/i, '');
          if (stage && ['I', 'II', 'III', 'IV'].includes(stage)) {
            updates.cancerStage = stage as CancerStage;
          }
        }
        
        // ECOG - this is critical for oncology notes
        if (clinical.ecog && typeof clinical.ecog === 'string' && clinical.ecog !== 'unknown') {
          // Convert string to number for ECOGStatus type
          const ecogNum = parseInt(clinical.ecog, 10);
          if (!isNaN(ecogNum) && ecogNum >= 0 && ecogNum <= 4) {
            updates.ecogStatus = ecogNum as ECOGStatus;
            console.log('✅ Setting ECOG status to:', ecogNum);
          }
        }
      }
      
      // Also check for ECOG at top level (flat structure)
      if (extractedData.ecog && typeof extractedData.ecog === 'string' && extractedData.ecog !== 'unknown' && !updates.ecogStatus) {
        const ecogNum = parseInt(extractedData.ecog, 10);
        if (!isNaN(ecogNum) && ecogNum >= 0 && ecogNum <= 4) {
          updates.ecogStatus = ecogNum as ECOGStatus;
          console.log('✅ Setting ECOG status (from top level) to:', ecogNum);
        }
      }
      
      // Extract treatment status (line of therapy) - support both nested and flat structure
      const treatmentStatus = extractedData.treatment_status || extractedData.current_treatment_status;
      
      if (treatmentStatus) {
        console.log('🔍 Extracted treatment status:', treatmentStatus);
        
        let currentTreatmentStatus = "unknown";
        let lineOfTherapy = "unknown";
        
        // Handle flat structure (current_treatment_status at top level)
        if (typeof treatmentStatus === 'string') {
          const status = treatmentStatus.toLowerCase();
          
          if (status === "progressed_on_targeted") {
            currentTreatmentStatus = "progressed_targeted";
            lineOfTherapy = "second_line";
            console.log('✅ Mapped to: progressed on targeted therapy');
          } else if (status === "progressed_on_chemo" || status === "progressed_on_immunotherapy") {
            currentTreatmentStatus = "progressed_chemo_immuno";
            lineOfTherapy = "second_line";
            console.log('✅ Mapped to: progressed on chemo/immunotherapy');
          } else if (status === "newly_diagnosed") {
            currentTreatmentStatus = "first_line";
            lineOfTherapy = "first_line";
            console.log('✅ Mapped to: newly diagnosed, first-line');
          } else if (status === "on_treatment") {
            currentTreatmentStatus = "on_treatment";
            lineOfTherapy = "first_line";
            console.log('✅ Mapped to: currently on treatment');
          }
          
          updates.currentTreatmentStatus = currentTreatmentStatus;
          updates.lineOfTherapy = lineOfTherapy === "first_line" ? "first" :
                                  lineOfTherapy === "second_line" ? "post_targeted" :
                                  null;
        }
        // Handle nested structure (treatment_status object)
        else if (typeof treatmentStatus === 'object') {
          const status = treatmentStatus;
          
          // Check if progression was detected
          if (status.progression_detected === true || status.current_status?.includes("progressed")) {
            
            // Progressed on targeted therapy
            if (status.current_status === "progressed_on_targeted") {
              currentTreatmentStatus = "progressed_targeted";
              lineOfTherapy = "second_line";
              console.log('✅ Mapped to: progressed on targeted therapy');
            }
            // Progressed on chemo/immunotherapy
            else if (status.current_status === "progressed_on_chemo" ||
                     status.current_status === "progressed_on_immunotherapy") {
              currentTreatmentStatus = "progressed_chemo_immuno";
              lineOfTherapy = "second_line";
              console.log('✅ Mapped to: progressed on chemo/immunotherapy');
            }
          }
          // Newly diagnosed
          else if (status.current_status === "newly_diagnosed") {
            currentTreatmentStatus = "first_line";
            lineOfTherapy = "first_line";
            console.log('✅ Mapped to: newly diagnosed, first-line');
          }
          
          updates.currentTreatmentStatus = currentTreatmentStatus;
          updates.lineOfTherapy = lineOfTherapy === "first_line" ? "first" :
                                  lineOfTherapy === "second_line" ? "post_targeted" :
                                  null;
          updates.priorRegimenName = status.prior_regimen;
          updates.progressionDetected = status.progression_detected;
        }
        
        console.log('📊 Final status:', {
          currentTreatmentStatus: updates.currentTreatmentStatus,
          lineOfTherapy: updates.lineOfTherapy,
          priorRegimen: updates.priorRegimenName,
          progressionDetected: updates.progressionDetected
        });
      }
      
      // Map API response to PatientData (legacy fields)
      if (extractedData.cancer_type) {
        updates.cancerType = extractedData.cancer_type as CancerType;
      }
      if (extractedData.stage && !updates.cancerStage) {
        // Fallback to legacy stage field
        const stageStr = typeof extractedData.stage === 'string' ? extractedData.stage : String(extractedData.stage);
        let stage = stageStr.replace(/^Stage\s+/i, '').trim();
        stage = stage.replace(/[ABC]$/i, '');
        if (stage && ['I', 'II', 'III', 'IV'].includes(stage)) {
          updates.cancerStage = stage as CancerStage;
        }
      }
      
      // Map prior treatments from array to specific fields
      if (extractedData.prior_treatments && Array.isArray(extractedData.prior_treatments)) {
        const treatments = extractedData.prior_treatments;
        
        console.log('Processing prior treatments:', treatments);
        
        // Store detailed treatment history for PDF (NEW)
        updates.treatmentHistory = treatments;
        
        // Helper function to check if treatment array contains any of the keywords
        const hasAnyTreatment = (keywords: string[]): boolean => {
          return treatments.some(t => {
            // Handle both string format and object format {treatment: "...", date: "...", etc}
            let treatmentText = '';
            if (typeof t === 'string') {
              treatmentText = t.toLowerCase();
            } else if (t && typeof t === 'object') {
              // Check treatment, name, category, details fields
              treatmentText = [t.treatment, t.name, t.category, t.details].filter(Boolean).join(' ').toLowerCase();
            }
            return keywords.some(keyword => treatmentText.includes(keyword));
          });
        };
        
        // Map to high-level treatment categories
        const surgery = hasAnyTreatment(['surgery', 'resection', 'lumpectomy', 'mastectomy', 'lobectomy']);
        const radiation = hasAnyTreatment(['radiation', 'radiotherapy', 'xrt', 'sbrt', 'imrt']);
        const chemotherapy = hasAnyTreatment([
          'chemotherapy', 'chemo', 'paclitaxel', 'taxol', 'carboplatin', 'cisplatin',
          'docetaxel', 'gemcitabine', 'pemetrexed', 'etoposide'
        ]);
        const immunotherapy = hasAnyTreatment([
          'immunotherapy', 'pembrolizumab', 'keytruda', 'nivolumab', 'opdivo',
          'atezolizumab', 'durvalumab', 'tecentriq'
        ]);
        const targetedTherapy = hasAnyTreatment([
          'targeted', 'trastuzumab', 'herceptin', 'pertuzumab', 'perjeta',
          'osimertinib', 'tagrisso', 'erlotinib', 'tarceva', 'gefitinib',
          'iressa', 'alectinib', 'crizotinib', 'lorbrena'
        ]);
        const hormoneTherapy = hasAnyTreatment([
          'hormone', 'endocrine', 'tamoxifen', 'letrozole', 'femara',
          'anastrozole', 'arimidex', 'exemestane', 'fulvestrant', 'faslodex'
        ]);
        const cdk46 = hasAnyTreatment([
          'palbociclib', 'ibrance', 'ribociclib', 'kisqali', 'abemaciclib', 'verzenio'
        ]);
        const adc = hasAnyTreatment([
          'enhertu', 'kadcyla', 'trodelvy', 'trastuzumab deruxtecan', 'ado-trastuzumab',
          'sacituzumab'
        ]);
        
        updates.priorTreatmentTypes = {
          surgery,
          radiation,
          medication: chemotherapy || targetedTherapy || immunotherapy || hormoneTherapy,
        };
        
        // Map to cancer-specific treatment fields based on cancer type
        const cancerType = extractedData.cancer_type || patientData.cancerType;
        
        if (cancerType === 'breast') {
          updates.breastTreatments = {
            endocrineTherapy: hormoneTherapy,
            cdk46Inhibitors: cdk46,
            antiHer2: hasAnyTreatment(['trastuzumab', 'herceptin', 'pertuzumab', 'perjeta']),
            adcs: adc,
          };
        } else if (cancerType === 'lung') {
          updates.lungTreatments = {
            immunotherapy,
            targetedTherapy,
            platinumChemo: hasAnyTreatment(['carboplatin', 'cisplatin', 'platinum']),
          };
        }
        
        console.log('Mapped treatment categories:', {
          priorTreatmentTypes: updates.priorTreatmentTypes,
          breastTreatments: updates.breastTreatments,
          lungTreatments: updates.lungTreatments,
        });
      } else {
        console.log('No prior treatments found or not in array format');
      }
      
      console.log('📤 Oncology - Final updates object:', updates);
      onUpdatePatientData(updates);
      setHasAutoFilled(true);
    } else {
      // Fallback to mock extraction
      const extracted = extractFromOncologyNote();
      const updates = oncologyNoteToPatientData(extracted);
      onUpdatePatientData({ ...updates, hasOncologyNote: true });
      setHasAutoFilled(true);
    }
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
          <div className="text-center mb-4">
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Medical Information</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Help us understand your situation to find the best matches
            </p>
          </div>

          {/* Clinical Records Upload */}
          <GlassContainer className="p-6 md:p-8 min-h-[380px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Clinical Records</h2>
                <p className="text-base text-gray-600">
                  Upload your medical documents for AI-powered data extraction
                </p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full w-[180px] justify-center ${
                hasAutoFilled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{hasAutoFilled ? 'Data extracted' : 'Auto-fills your info'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FileUploadZone
                icon={<Microscope className="w-8 h-8" />}
                label="Upload Pathology Report"
                description="PDF or TXT files"
                isUploaded={patientData.hasPathologyReport}
                onUploadComplete={handlePathologyUpload}
                cancerType={patientData.cancerType || undefined}
              />
              <FileUploadZone
                icon={<ClipboardList className="w-8 h-8" />}
                label="Upload Oncology Note"
                description="PDF or TXT files"
                isUploaded={patientData.hasOncologyNote}
                onUploadComplete={handleOncologyUpload}
                cancerType={patientData.cancerType || undefined}
              />
            </div>

            {/* Security note */}
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Encrypted and never shared
            </p>
          </GlassContainer>

          {/* Auto-fill Notice - Permanent info box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl min-h-[140px]">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-medium text-gray-900">
                {hasAutoFilled ? "Data extracted from your documents" : "Upload documents for auto-fill"}
              </p>
              <p className="text-base text-gray-600 mt-1 leading-relaxed">
                {hasAutoFilled
                  ? "We've auto-filled information below based on your clinical records. Confidence levels indicate extraction accuracy. Please review and correct any inaccuracies."
                  : "Upload your pathology report or oncology note above to automatically extract and fill in your medical information. You can review and edit all extracted data before proceeding."}
              </p>
            </div>
          </div>

          {/* Demographics */}
          <GlassContainer className="p-6 md:p-8 min-h-[240px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Demographics</h2>
                <p className="text-base text-gray-600">
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

          {/* Cancer Type Selection */}
          <GlassContainer className="p-6 md:p-8 min-h-[500px]">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Diagnosis</h2>
              <p className="text-base text-gray-600">
                Select your primary cancer type
              </p>
            </div>
            <CancerTypeSelector
              value={patientData.cancerType}
              onChange={(value: CancerType) => onUpdatePatientData({ cancerType: value })}
            />

            {/* Cancer Stage - always visible to prevent jitter */}
            <div className="section-divider">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Stage</h3>
                <p className="text-base text-gray-600">
                  {patientData.cancerType
                    ? "What stage is your cancer? This helps narrow down relevant trials."
                    : "Select a cancer type above first, then choose your stage."}
                </p>
              </div>
              <div className={!patientData.cancerType ? "opacity-50 pointer-events-none" : ""}>
                <CancerStageSelector
                  value={patientData.cancerStage}
                  onChange={(value: CancerStage) => onUpdatePatientData({ cancerStage: value })}
                />
              </div>
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
}
