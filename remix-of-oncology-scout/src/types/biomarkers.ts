// Biomarker state: present, absent, or unknown
export type BiomarkerState = "present" | "absent" | "unknown";

// EGFR subtypes
export type EGFRSubtype = "exon19_del" | "l858r" | "exon20_ins" | "t790m" | "other" | "unknown";

// PD-L1 expression levels
export type PDL1Level = "low" | "high" | "unknown";

// HER2 status
export type HER2Status = "0" | "low" | "positive" | "unknown";

// Structured biomarker for genetic alterations
export interface GeneticBiomarker {
  name: string;
  state: BiomarkerState;
  subtype?: EGFRSubtype; // Only for EGFR
}

// Structured biomarker for expression/scoring
export interface ExpressionBiomarker {
  name: string;
  level: PDL1Level | HER2Status | "unknown";
}

// Complete biomarker profile
export interface BiomarkerProfile {
  // Genetic alterations and fusions (Lung Cancer)
  genetic: {
    EGFR: { state: BiomarkerState; subtype: EGFRSubtype };
    ALK: BiomarkerState;
    ROS1: BiomarkerState;
    BRAF: BiomarkerState;
    KRAS_G12C: BiomarkerState;
    MET: BiomarkerState;
    RET: BiomarkerState;
    NTRK: BiomarkerState;
  };
  // Expression and scoring
  expression: {
    PDL1: PDL1Level;
    HER2: HER2Status;
  };
  // Breast cancer specific
  hormoneReceptors: {
    ER: BiomarkerState;
    PR: BiomarkerState;
    BRCA1_2: BiomarkerState;
    PIK3CA: BiomarkerState;
    ESR1: BiomarkerState;
  };
}

// Default biomarker profile with all unknowns
export const defaultBiomarkerProfile: BiomarkerProfile = {
  genetic: {
    EGFR: { state: "unknown", subtype: "unknown" },
    ALK: "unknown",
    ROS1: "unknown",
    BRAF: "unknown",
    KRAS_G12C: "unknown",
    MET: "unknown",
    RET: "unknown",
    NTRK: "unknown",
  },
  expression: {
    PDL1: "unknown",
    HER2: "unknown",
  },
  hormoneReceptors: {
    ER: "unknown",
    PR: "unknown",
    BRCA1_2: "unknown",
    PIK3CA: "unknown",
    ESR1: "unknown",
  },
};

// Helper to convert biomarker profile to display strings
export function getBiomarkerSummary(profile: BiomarkerProfile, cancerType: "lung" | "breast"): string[] {
  const summary: string[] = [];
  
  if (cancerType === "lung") {
    // Genetic alterations
    if (profile.genetic.EGFR.state === "present") {
      const subtypeLabels: Record<EGFRSubtype, string> = {
        exon19_del: "EGFR Exon 19 Deletion",
        l858r: "EGFR L858R",
        exon20_ins: "EGFR Exon 20 Insertion",
        t790m: "EGFR T790M",
        other: "EGFR Other",
        unknown: "EGFR (subtype unknown)",
      };
      summary.push(subtypeLabels[profile.genetic.EGFR.subtype]);
    }
    if (profile.genetic.ALK === "present") summary.push("ALK");
    if (profile.genetic.ROS1 === "present") summary.push("ROS1");
    if (profile.genetic.BRAF === "present") summary.push("BRAF");
    if (profile.genetic.KRAS_G12C === "present") summary.push("KRAS G12C");
    if (profile.genetic.MET === "present") summary.push("MET");
    if (profile.genetic.RET === "present") summary.push("RET");
    if (profile.genetic.NTRK === "present") summary.push("NTRK");
    
    // Expression
    if (profile.expression.PDL1 === "high") summary.push("PD-L1 High");
    if (profile.expression.PDL1 === "low") summary.push("PD-L1 Low");
  } else {
    // Breast cancer
    if (profile.hormoneReceptors.ER === "present") summary.push("ER+");
    if (profile.hormoneReceptors.PR === "present") summary.push("PR+");
    
    if (profile.expression.HER2 === "positive") summary.push("HER2+");
    else if (profile.expression.HER2 === "low") summary.push("HER2-low");
    
    if (profile.hormoneReceptors.BRCA1_2 === "present") summary.push("BRCA1/2");
    if (profile.hormoneReceptors.PIK3CA === "present") summary.push("PIK3CA");
    if (profile.hormoneReceptors.ESR1 === "present") summary.push("ESR1");
    if (profile.genetic.NTRK === "present") summary.push("NTRK");
  }
  
  return summary;
}

// Check if any biomarker has uncertain state
export function hasUnknownBiomarkers(profile: BiomarkerProfile, cancerType: "lung" | "breast"): boolean {
  if (cancerType === "lung") {
    return (
      profile.genetic.EGFR.state === "unknown" ||
      profile.genetic.ALK === "unknown" ||
      profile.genetic.ROS1 === "unknown" ||
      profile.expression.PDL1 === "unknown"
    );
  } else {
    return (
      profile.hormoneReceptors.ER === "unknown" ||
      profile.expression.HER2 === "unknown"
    );
  }
}
