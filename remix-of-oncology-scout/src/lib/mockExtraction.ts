import { PatientData, CancerType, CancerStage, PriorTreatmentTypes, ConfidenceLevel, ExtractedField } from "@/types/oncology";
import { BiomarkerProfile, defaultBiomarkerProfile } from "@/types/biomarkers";

// Simulated extracted data from clinical records
// In a real app, this would come from AI document analysis

// Pathology Report: Diagnosis, Stage, Biomarkers
interface ExtractedPathologyData {
  cancerType: ExtractedField<CancerType>;
  cancerStage: ExtractedField<CancerStage>;
  biomarkers: ExtractedField<string[]>;
  biomarkerProfile: ExtractedField<BiomarkerProfile>;
}

// Oncology Note: Diagnosis, Stage, Prior Treatments, Medication Details
interface ExtractedOncologyData {
  cancerType: ExtractedField<CancerType>;
  cancerStage: ExtractedField<CancerStage>;
  priorTreatmentTypes: PriorTreatmentTypes;
  priorTreatmentsConfidence: ConfidenceLevel;
  lineOfTherapy?: ExtractedField<PatientData["lineOfTherapy"]>;
  breastTreatments?: {
    endocrineTherapy: boolean | "unsure";
    cdk46Inhibitors: boolean | "unsure";
    antiHer2: boolean | "unsure";
    adcs: boolean | "unsure";
  };
  lungTreatments?: {
    immunotherapy: boolean | "unsure";
    targetedTherapy: boolean | "unsure";
    platinumChemo: boolean | "unsure";
  };
}

// ===== DEMO EXTRACTION SCENARIOS =====
// These represent realistic pathology report extractions for demo purposes

interface DemoScenario {
  name: string;
  cancerType: CancerType;
  stage: CancerStage;
  biomarkerStrings: string[];
  biomarkerProfile: BiomarkerProfile;
  description: string;
}

const BREAST_DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: "HR+/HER2- Breast Cancer",
    cancerType: "breast",
    stage: "IV",
    biomarkerStrings: ["ER+", "PR+", "HER2-negative"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "present",
        PR: "present",
        BRCA1_2: "unknown",
        PIK3CA: "unknown",
        ESR1: "unknown",
      },
      expression: {
        ...defaultBiomarkerProfile.expression,
        HER2: "0",
      },
    },
    description: "Hormone receptor-positive, HER2-negative metastatic breast cancer",
  },
  {
    name: "Triple-Negative Breast Cancer",
    cancerType: "breast",
    stage: "IV",
    biomarkerStrings: ["ER-", "PR-", "HER2-negative", "PD-L1 negative"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "absent",
        PR: "absent",
        BRCA1_2: "unknown",
        PIK3CA: "unknown",
        ESR1: "unknown",
      },
      expression: {
        PDL1: "low",
        HER2: "0",
      },
    },
    description: "Triple-negative metastatic breast cancer, not eligible for immunotherapy",
  },
  {
    name: "HER2-Low Breast Cancer",
    cancerType: "breast",
    stage: "IV",
    biomarkerStrings: ["ER+", "PR+", "HER2-low (IHC 1+)"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "present",
        PR: "present",
        BRCA1_2: "unknown",
        PIK3CA: "unknown",
        ESR1: "unknown",
      },
      expression: {
        ...defaultBiomarkerProfile.expression,
        HER2: "low",
      },
    },
    description: "Hormone receptor-positive, HER2-low metastatic breast cancer",
  },
  {
    name: "HER2+ with Brain Metastases",
    cancerType: "breast",
    stage: "IV",
    biomarkerStrings: ["ER+", "PR+", "HER2-positive (3+)"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "present",
        PR: "present",
        BRCA1_2: "unknown",
        PIK3CA: "unknown",
        ESR1: "unknown",
      },
      expression: {
        ...defaultBiomarkerProfile.expression,
        HER2: "positive",
      },
    },
    description: "HER2-positive metastatic breast cancer",
  },
];

const LUNG_DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: "EGFR-Mutant NSCLC",
    cancerType: "lung",
    stage: "IV",
    biomarkerStrings: ["EGFR Exon 19 Deletion", "PD-L1 Low (5%)"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      genetic: {
        ...defaultBiomarkerProfile.genetic,
        EGFR: { state: "present", subtype: "exon19_del" },
        ALK: "absent",
        ROS1: "absent",
      },
      expression: {
        PDL1: "low",
        HER2: "unknown",
      },
    },
    description: "EGFR-mutant non-small cell lung cancer (adenocarcinoma)",
  },
  {
    name: "KRAS G12C NSCLC",
    cancerType: "lung",
    stage: "IV",
    biomarkerStrings: ["KRAS G12C", "PD-L1 High (60%)"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      genetic: {
        ...defaultBiomarkerProfile.genetic,
        EGFR: { state: "absent", subtype: "unknown" },
        ALK: "absent",
        KRAS_G12C: "present",
      },
      expression: {
        PDL1: "high",
        HER2: "unknown",
      },
    },
    description: "KRAS G12C-mutant NSCLC with high PD-L1 expression",
  },
  {
    name: "MET-Altered NSCLC",
    cancerType: "lung",
    stage: "IV",
    biomarkerStrings: ["MET Exon 14 Skipping", "PD-L1 Unknown"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      genetic: {
        ...defaultBiomarkerProfile.genetic,
        EGFR: { state: "absent", subtype: "unknown" },
        ALK: "absent",
        MET: "present",
      },
      expression: {
        PDL1: "unknown",
        HER2: "unknown",
      },
    },
    description: "MET-altered NSCLC (exon 14 skipping mutation)",
  },
  {
    name: "RET Fusion NSCLC",
    cancerType: "lung",
    stage: "IV",
    biomarkerStrings: ["RET Fusion", "PD-L1 Low (10%)"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      genetic: {
        ...defaultBiomarkerProfile.genetic,
        EGFR: { state: "absent", subtype: "unknown" },
        ALK: "absent",
        RET: "present",
      },
      expression: {
        PDL1: "low",
        HER2: "unknown",
      },
    },
    description: "RET fusion-positive NSCLC",
  },
  {
    name: "PD-L1 High NSCLC (No Driver)",
    cancerType: "lung",
    stage: "IV",
    biomarkerStrings: ["EGFR Negative", "ALK Negative", "PD-L1 High (70%)"],
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      genetic: {
        ...defaultBiomarkerProfile.genetic,
        EGFR: { state: "absent", subtype: "unknown" },
        ALK: "absent",
        ROS1: "absent",
        KRAS_G12C: "absent",
      },
      expression: {
        PDL1: "high",
        HER2: "unknown",
      },
    },
    description: "NSCLC with high PD-L1 expression, no actionable driver mutations",
  },
];

// Track which scenario was last used for each cancer type to cycle through them
let breastScenarioIndex = 0;
let lungScenarioIndex = 0;

// Generate high confidence for demo documents
function demoConfidence(): ConfidenceLevel {
  return "high";
}

// Mock pathology report extraction - NOW POPULATES BIOMARKER PROFILE
export function extractFromPathologyReport(): ExtractedPathologyData {
  // Randomly select cancer type for demo (or could be based on file content in real app)
  const isBreast = Math.random() > 0.5;
  
  let scenario: DemoScenario;
  
  if (isBreast) {
    scenario = BREAST_DEMO_SCENARIOS[breastScenarioIndex % BREAST_DEMO_SCENARIOS.length];
    breastScenarioIndex++;
  } else {
    scenario = LUNG_DEMO_SCENARIOS[lungScenarioIndex % LUNG_DEMO_SCENARIOS.length];
    lungScenarioIndex++;
  }
  
  return {
    cancerType: {
      value: scenario.cancerType,
      confidence: demoConfidence(),
      source: "Pathology Report, page 1 - Diagnosis"
    },
    cancerStage: {
      value: scenario.stage,
      confidence: demoConfidence(),
      source: "Pathology Report, page 2 - Staging"
    },
    biomarkers: {
      value: scenario.biomarkerStrings,
      confidence: demoConfidence(),
      source: "Pathology Report, page 3 - Biomarker Analysis"
    },
    biomarkerProfile: {
      value: scenario.biomarkerProfile,
      confidence: demoConfidence(),
      source: "Pathology Report, pages 3-5 - Molecular Testing Results"
    },
  };
}

// Allow forcing a specific scenario for testing
export function extractFromPathologyReportWithScenario(
  cancerType: "breast" | "lung", 
  scenarioIndex: number
): ExtractedPathologyData {
  const scenarios = cancerType === "breast" ? BREAST_DEMO_SCENARIOS : LUNG_DEMO_SCENARIOS;
  const scenario = scenarios[scenarioIndex % scenarios.length];
  
  return {
    cancerType: {
      value: scenario.cancerType,
      confidence: demoConfidence(),
      source: "Pathology Report, page 1 - Diagnosis"
    },
    cancerStage: {
      value: scenario.stage,
      confidence: demoConfidence(),
      source: "Pathology Report, page 2 - Staging"
    },
    biomarkers: {
      value: scenario.biomarkerStrings,
      confidence: demoConfidence(),
      source: "Pathology Report, page 3 - Biomarker Analysis"
    },
    biomarkerProfile: {
      value: scenario.biomarkerProfile,
      confidence: demoConfidence(),
      source: "Pathology Report, pages 3-5 - Molecular Testing Results"
    },
  };
}

// Mock oncology note extraction - Diagnosis, Stage, Prior Treatments, Medication Details
export function extractFromOncologyNote(): ExtractedOncologyData {
  // Simulate random extraction for demo purposes
  const isBreast = Math.random() > 0.5;
  
  const baseData: ExtractedOncologyData = {
    cancerType: {
      value: isBreast ? "breast" : "lung",
      confidence: demoConfidence(),
      source: "Oncology Note, paragraph 1 - History"
    },
    cancerStage: {
      value: "IV", // Default to Stage IV for metastatic setting
      confidence: demoConfidence(),
      source: "Oncology Note, paragraph 2 - Current Status"
    },
    priorTreatmentTypes: {
      surgery: true,
      radiation: false,
      medication: true,
    },
    priorTreatmentsConfidence: demoConfidence(),
    lineOfTherapy: {
      value: "post_chemo_immuno",
      confidence: "medium" as ConfidenceLevel,
      source: "Oncology Note - Treatment Summary"
    },
  };

  // Add medication details based on cancer type
  if (isBreast) {
    baseData.breastTreatments = {
      endocrineTherapy: true,
      cdk46Inhibitors: true,
      antiHer2: false,
      adcs: false,
    };
  } else {
    baseData.lungTreatments = {
      immunotherapy: true,
      targetedTherapy: false,
      platinumChemo: true,
    };
  }

  return baseData;
}

// Convert pathology data to patient data updates - NOW INCLUDES BIOMARKER PROFILE
export function pathologyToPatientData(extracted: ExtractedPathologyData): Partial<PatientData> {
  return {
    cancerType: extracted.cancerType.value,
    cancerStage: extracted.cancerStage.value,
    biomarkers: extracted.biomarkers.value,
    biomarkerProfile: extracted.biomarkerProfile.value,
    extractedFields: {
      cancerType: extracted.cancerType,
      cancerStage: extracted.cancerStage,
      biomarkers: extracted.biomarkers,
    },
  };
}

// Convert oncology note data to patient data updates
export function oncologyNoteToPatientData(extracted: ExtractedOncologyData): Partial<PatientData> {
  const updates: Partial<PatientData> = {
    cancerType: extracted.cancerType.value,
    cancerStage: extracted.cancerStage.value,
    priorTreatmentTypes: extracted.priorTreatmentTypes,
    extractedFields: {
      cancerType: extracted.cancerType,
      cancerStage: extracted.cancerStage,
    },
  };

  // Include line of therapy if extracted
  if (extracted.lineOfTherapy) {
    updates.lineOfTherapy = extracted.lineOfTherapy.value;
  }

  // Only include medication details if medication is selected as a prior treatment
  if (extracted.priorTreatmentTypes.medication) {
    if (extracted.cancerType.value === "breast" && extracted.breastTreatments) {
      updates.breastTreatments = extracted.breastTreatments;
    } else if (extracted.cancerType.value === "lung" && extracted.lungTreatments) {
      updates.lungTreatments = extracted.lungTreatments;
    }
  }

  return updates;
}

// Helper to get scenario descriptions for UI hints
export function getAvailableScenarios(cancerType: "breast" | "lung"): string[] {
  const scenarios = cancerType === "breast" ? BREAST_DEMO_SCENARIOS : LUNG_DEMO_SCENARIOS;
  return scenarios.map(s => s.name);
}
