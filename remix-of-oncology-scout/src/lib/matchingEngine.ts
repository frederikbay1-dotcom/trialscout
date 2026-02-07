import { PatientData, Trial, MatchConfidence } from "@/types/oncology";
import { BiomarkerProfile, BiomarkerState, HER2Status, PDL1Level } from "@/types/biomarkers";

// Trial requirements structure
export interface TrialRequirements {
  biomarkers?: {
    HER2?: "positive" | "negative" | "low" | "any";
    ER?: "positive" | "negative" | "any";
    PR?: "positive" | "negative" | "any";
    ESR1?: boolean;
    PIK3CA?: boolean;
    BRCA?: boolean;
    EGFR?: boolean | string[];
    ALK?: boolean;
    ROS1?: boolean;
    KRAS_G12C?: boolean;
    MET?: boolean;
    RET?: boolean;
    BRAF?: boolean;
    NTRK?: boolean;
    PDL1?: "high" | "low" | "any";
    requiresTripleNegative?: boolean;
    requiresCDK46i?: boolean;
  };
  stage?: string[];
  treatmentHistory?: {
    requiresPriorTherapy?: boolean;
    requiresFirstLine?: boolean;
    excludePriorClasses?: string[];
  };
  exclusions?: {
    brainMetsExcluded?: boolean;
    activeBrainMetsExcluded?: boolean;
  };
}

interface BiomarkerEvaluation {
  overallMatch: "matches" | "doesnt_match" | "unknown" | "partial";
  score: number;
  maxScore: number;
  details: BiomarkerDetail[];
}

interface BiomarkerDetail {
  biomarker: string;
  required: string;
  patient: string;
  matches: boolean | "unknown";
  reasoning: string;
}

export interface MatchResult {
  trial: Trial;
  matchScore: number;
  matchConfidence: MatchConfidence;
  eligibilityScore: "possibly_eligible" | "likely_not_eligible";
  biomarkerMatch: "matches" | "doesnt_match" | "unknown" | "partial";
  whyMatched: string[];
  whyCantMatch: string[];
  whatToConfirm: string[];
}

export const TRIAL_REQUIREMENTS: Record<string, TrialRequirements> = {
  // NSCLC Trials
  "nsclc_trial_001": {
    biomarkers: {},
    treatmentHistory: { requiresFirstLine: true },
    stage: ["IV"],
  },
  "nsclc_trial_002": {
    biomarkers: { KRAS_G12C: true },
    stage: ["IV"],
  },
  "nsclc_trial_003": {
    biomarkers: { MET: true },
    stage: ["IV"],
  },
  "nsclc_trial_004": {
    biomarkers: { RET: true },
    stage: ["IV"],
  },
  "nsclc_trial_005": {
    biomarkers: {},
    stage: ["IV"],
  },
  "nsclc_trial_006": {
    biomarkers: { KRAS_G12C: true },
    stage: ["IV"],
  },
  "nsclc_trial_007": {
    biomarkers: { PDL1: "high" },
    stage: ["IV"],
  },
  // Breast Cancer Trials
  "bc_trial_001": {
    biomarkers: { requiresTripleNegative: true },
    stage: ["IV"],
    treatmentHistory: { requiresFirstLine: true },
  },
  "bc_trial_002": {
    biomarkers: { HER2: "low", ER: "positive", requiresCDK46i: true },
    stage: ["IV"],
    treatmentHistory: {
      excludePriorClasses: ["T-DXd", "trastuzumab deruxtecan"]
    }
  },
  "bc_trial_003": {
    biomarkers: { ER: "positive", HER2: "negative", requiresCDK46i: true },
    stage: ["IV"],
  },
  "bc_trial_004": {
    biomarkers: { ER: "positive", HER2: "negative", ESR1: true, requiresCDK46i: true },
    stage: ["IV"],
  },
  "bc_trial_005": {
    biomarkers: { requiresTripleNegative: true, PDL1: "high" },
    stage: ["IV"],
    treatmentHistory: { requiresFirstLine: true },
  },
  "bc_trial_006": {
    biomarkers: { HER2: "positive" },
    stage: ["IV"],
  },
  "bc_trial_007": {
    biomarkers: { requiresTripleNegative: true },
    stage: ["II", "III"],
  },
};

export class TrialMatchingEngine {
  matchPatientToTrial(patient: PatientData, trial: Trial): MatchResult {
    const requirements = TRIAL_REQUIREMENTS[trial.id] || {};
    const biomarkerEval = this.evaluateBiomarkers(patient, requirements);
    const stageMatch = this.evaluateStage(patient, requirements);
    const treatmentEval = this.evaluateTreatmentHistory(patient, requirements);
    return this.calculateOverallMatch(trial, biomarkerEval, stageMatch, treatmentEval);
  }

  private evaluateBiomarkers(
    patient: PatientData,
    requirements: TrialRequirements
  ): BiomarkerEvaluation {
    const result: BiomarkerEvaluation = {
      overallMatch: "matches",
      score: 0,
      maxScore: 0,
      details: [],
    };

    const reqs = requirements.biomarkers;
    if (!reqs || Object.keys(reqs).length === 0) {
      result.overallMatch = "matches";
      result.score = 100;
      return result;
    }

    const profile = patient.biomarkerProfile;
    const cancerType = patient.cancerType;

    if (cancerType === "breast") {
      if (reqs.requiresTripleNegative) {
        result.maxScore += 40;
        const isTripleNegative = this.checkTripleNegative(profile);
        if (isTripleNegative === true) {
          result.score += 40;
          result.details.push({
            biomarker: "Triple-Negative Status",
            required: "ER-, PR-, HER2-",
            patient: "Triple-negative confirmed",
            matches: true,
            reasoning: "Triple-negative breast cancer confirmed",
          });
        } else if (isTripleNegative === "unknown") {
          result.score += 20;
          result.details.push({
            biomarker: "Triple-Negative Status",
            required: "ER-, PR-, HER2-",
            patient: "Unknown",
            matches: "unknown",
            reasoning: "Triple-negative status needs confirmation",
          });
        } else {
          result.details.push({
            biomarker: "Triple-Negative Status",
            required: "ER-, PR-, HER2-",
            patient: "Not triple-negative",
            matches: false,
            reasoning: "Patient is not triple-negative (has ER+, PR+, or HER2+)",
          });
        }
      }

      if (reqs.HER2 && reqs.HER2 !== "any") {
        result.maxScore += 30;
        const her2Match = this.checkHER2Status(profile.expression.HER2, reqs.HER2);
        result.details.push(her2Match);
        if (her2Match.matches === true) result.score += 30;
        else if (her2Match.matches === "unknown") result.score += 15;
      }

      if (reqs.ER && reqs.ER !== "any") {
        result.maxScore += 25;
        const erMatch = this.checkHormoneReceptor(profile.hormoneReceptors.ER, reqs.ER, "ER");
        result.details.push(erMatch);
        if (erMatch.matches === true) result.score += 25;
        else if (erMatch.matches === "unknown") result.score += 12;
      }

      if (reqs.ESR1) {
        result.maxScore += 25;
        const esr1Match = this.checkMutation(profile.hormoneReceptors.ESR1, "ESR1");
        result.details.push(esr1Match);
        if (esr1Match.matches === true) result.score += 25;
        else if (esr1Match.matches === "unknown") result.score += 12;
      }
    }

    if (cancerType === "lung") {
      if (reqs.KRAS_G12C) {
        result.maxScore += 35;
        const krasMatch = this.checkMutation(profile.genetic.KRAS_G12C, "KRAS G12C");
        result.details.push(krasMatch);
        if (krasMatch.matches === true) result.score += 35;
        else if (krasMatch.matches === "unknown") result.score += 15;
      }

      if (reqs.MET) {
        result.maxScore += 35;
        const metMatch = this.checkMutation(profile.genetic.MET, "MET");
        result.details.push(metMatch);
        if (metMatch.matches === true) result.score += 35;
        else if (metMatch.matches === "unknown") result.score += 15;
      }

      if (reqs.RET) {
        result.maxScore += 35;
        const retMatch = this.checkMutation(profile.genetic.RET, "RET");
        result.details.push(retMatch);
        if (retMatch.matches === true) result.score += 35;
        else if (retMatch.matches === "unknown") result.score += 15;
      }

      if (reqs.ALK) {
        result.maxScore += 35;
        const alkMatch = this.checkMutation(profile.genetic.ALK, "ALK");
        result.details.push(alkMatch);
        if (alkMatch.matches === true) result.score += 35;
        else if (alkMatch.matches === "unknown") result.score += 15;
      }

      if (reqs.PDL1 && reqs.PDL1 !== "any") {
        result.maxScore += 25;
        const pdl1Match = this.checkPDL1(profile.expression.PDL1, reqs.PDL1);
        result.details.push(pdl1Match);
        if (pdl1Match.matches === true) result.score += 25;
        else if (pdl1Match.matches === "unknown") result.score += 12;
      }
    }

    if (result.maxScore === 0) {
      result.overallMatch = "matches";
      result.score = 100;
    } else {
      const matchPercentage = (result.score / result.maxScore) * 100;
      const hasDefiniteMismatch = result.details.some(d => d.matches === false);
      const allUnknown = result.details.every(d => d.matches === "unknown");

      if (hasDefiniteMismatch) {
        result.overallMatch = "doesnt_match";
      } else if (matchPercentage >= 80) {
        result.overallMatch = "matches";
      } else if (allUnknown) {
        result.overallMatch = "unknown";
      } else if (matchPercentage >= 50) {
        result.overallMatch = "partial";
      } else {
        result.overallMatch = "doesnt_match";
      }
    }

    return result;
  }

  private checkTripleNegative(profile: BiomarkerProfile): boolean | "unknown" {
    const er = profile.hormoneReceptors.ER;
    const pr = profile.hormoneReceptors.PR;
    const her2 = profile.expression.HER2;

    if (er === "absent" && pr === "absent" && (her2 === "0" || her2 === "unknown")) {
      return true;
    }
    if (er === "present" || pr === "present" || her2 === "positive" || her2 === "low") {
      return false;
    }
    return "unknown";
  }

  private checkHER2Status(
    patientHER2: HER2Status,
    required: "positive" | "negative" | "low"
  ): BiomarkerDetail {
    if (patientHER2 === "unknown") {
      return {
        biomarker: "HER2",
        required: required,
        patient: "unknown",
        matches: "unknown",
        reasoning: "HER2 status not provided - IHC testing required",
      };
    }

    let matches: boolean;
    let reasoning: string;

    switch (required) {
      case "positive":
        matches = patientHER2 === "positive";
        reasoning = matches
          ? "Patient is HER2-positive (IHC 3+ or IHC 2+/ISH+), matches trial requirement"
          : `Patient is HER2-${patientHER2}, does not match HER2-positive requirement`;
        break;
        
      case "negative":
        // HER2-negative should be IHC 0 ONLY
        matches = patientHER2 === "0";
        reasoning = matches
          ? "Patient is HER2-negative (IHC 0), matches trial requirement"
          : `Patient is HER2-${patientHER2}, does not match HER2-negative (IHC 0) requirement`;
        break;
        
      case "low":
        // HER2-low per FDA 2022: IHC 1+ OR IHC 2+/ISH-
        matches = patientHER2 === "low";
        
        if (matches) {
          reasoning = "Patient is HER2-low (IHC 1+ or IHC 2+/ISH-), matches trial requirement per FDA 2022 guidance for T-DXd eligibility";
        } else if (patientHER2 === "0") {
          reasoning = "Patient is HER2-negative (IHC 0), which does not meet HER2-low criteria. HER2-low requires IHC 1+ or IHC 2+/ISH-.";
        } else if (patientHER2 === "positive") {
          reasoning = "Patient is HER2-positive, which exceeds HER2-low threshold. HER2-low trials are for IHC 1+ or IHC 2+/ISH-, not HER2-positive disease.";
        } else {
          reasoning = `Patient is HER2-${patientHER2}, does not match HER2-low requirement`;
        }
        break;
        
      default:
        matches = false;
        reasoning = "Unable to determine HER2 match";
    }

    return {
      biomarker: "HER2",
      required,
      patient: patientHER2,
      matches,
      reasoning,
    };
  }

  private checkHormoneReceptor(
    patientStatus: BiomarkerState,
    required: "positive" | "negative",
    name: string
  ): BiomarkerDetail {
    if (patientStatus === "unknown") {
      return {
        biomarker: name,
        required: required,
        patient: "unknown",
        matches: "unknown",
        reasoning: name + " status not provided - testing required",
      };
    }

    const patientIsPositive = patientStatus === "present";
    const requiresPositive = required === "positive";
    const matches = patientIsPositive === requiresPositive;

    return {
      biomarker: name,
      required,
      patient: patientIsPositive ? "positive" : "negative",
      matches,
      reasoning: matches
        ? "Patient is " + name + "-" + (patientIsPositive ? "positive" : "negative") + ", matches trial requirement"
        : "Patient is " + name + "-" + (patientIsPositive ? "positive" : "negative") + ", does not match " + name + "-" + required + " requirement",
    };
  }

  private checkMutation(
    patientStatus: BiomarkerState,
    mutationName: string
  ): BiomarkerDetail {
    if (patientStatus === "unknown") {
      return {
        biomarker: mutationName,
        required: "present",
        patient: "unknown",
        matches: "unknown",
        reasoning: mutationName + " status unknown - genomic testing required",
      };
    }

    const matches = patientStatus === "present";

    return {
      biomarker: mutationName,
      required: "present",
      patient: patientStatus === "present" ? "present" : "absent",
      matches,
      reasoning: matches
        ? "Patient has " + mutationName + " mutation, matches trial requirement"
        : "Patient does not have " + mutationName + " mutation",
    };
  }

  private checkPDL1(
    patientPDL1: PDL1Level,
    required: "high" | "low"
  ): BiomarkerDetail {
    if (patientPDL1 === "unknown") {
      return {
        biomarker: "PD-L1",
        required: required,
        patient: "unknown",
        matches: "unknown",
        reasoning: "PD-L1 expression not provided - testing required",
      };
    }

    const matches = patientPDL1 === required;

    return {
      biomarker: "PD-L1",
      required,
      patient: patientPDL1,
      matches,
      reasoning: matches
        ? "Patient is PD-L1 " + patientPDL1 + ", matches trial requirement"
        : "Patient is PD-L1 " + patientPDL1 + ", does not match PD-L1 " + required + " requirement",
    };
  }

  private evaluateTreatmentHistory(
    patient: PatientData,
    requirements: TrialRequirements
  ): { matches: boolean | "unknown"; score: number; details: string[] } {
    const details: string[] = [];
    let matches: boolean | "unknown" = true;
    let score = 0;

    // Check CDK4/6 inhibitor requirement (breast cancer)
    if (patient.cancerType === "breast" && requirements.biomarkers?.requiresCDK46i) {
      const hasCDK46i = patient.breastTreatments.cdk46Inhibitors === true;
      
      if (hasCDK46i) {
        details.push("Patient received CDK4/6 inhibitor therapy as required");
        score += 15;
      } else if (patient.breastTreatments.cdk46Inhibitors === "unsure") {
        details.push("CDK4/6 inhibitor exposure unknown - confirm treatment history");
        matches = "unknown";
        score += 7;
      } else {
        details.push("Trial requires prior CDK4/6 inhibitor; patient has not received one");
        matches = false;
      }
    }
    
    // Check for prior drug class exclusions
    if (requirements.treatmentHistory?.excludePriorClasses) {
      const excludedClasses = requirements.treatmentHistory.excludePriorClasses;
      if (excludedClasses.includes("T-DXd") || excludedClasses.includes("trastuzumab deruxtecan")) {
        details.push("Verify patient has not received trastuzumab deruxtecan (T-DXd) previously");
      }
    }

    // Check prior immunotherapy exclusion (lung cancer)
    if (patient.cancerType === "lung" && requirements.treatmentHistory?.excludePriorClasses?.includes("PD-1/PD-L1")) {
      const hasImmuno = patient.lungTreatments.immunotherapy === true;
      
      if (hasImmuno) {
        details.push("Patient received prior immunotherapy; trial excludes prior PD-1/PD-L1 therapy");
        matches = false;
      } else if (patient.lungTreatments.immunotherapy === "unsure") {
        details.push("Prior immunotherapy status unknown - confirm treatment history");
        matches = "unknown";
      } else {
        details.push("No prior PD-1/PD-L1 therapy as required");
        score += 10;
      }
    }

    return { matches, score, details };
  }

  private evaluateStage(
    patient: PatientData,
    requirements: TrialRequirements
  ): { matches: boolean | "unknown"; reasoning: string } {
    if (!requirements.stage || requirements.stage.length === 0) {
      return { matches: true, reasoning: "No stage requirement" };
    }

    if (!patient.cancerStage) {
      return { matches: "unknown", reasoning: "Cancer stage not provided" };
    }

    // Safety check 1: Neoadjuvant/adjuvant trials (Stage II-III) should NOT match metastatic patients
    const isEarlyStage = (requirements.stage.includes("II") || requirements.stage.includes("III")) && 
                         !requirements.stage.includes("IV");
    if (isEarlyStage && patient.cancerStage === "IV") {
      const trialType = requirements.treatmentHistory?.requiresFirstLine ? "neoadjuvant (pre-surgery)" : "early-stage";
      return {
        matches: false,
        reasoning: `This is a ${trialType} trial for Stage II-III disease. Patient has metastatic disease (Stage IV) and is not eligible.`
      };
    }

    // Safety check 2: Metastatic trials should NOT match early stage
    const requiresMetastatic = requirements.stage.includes("IV") && requirements.stage.length === 1;
    if (requiresMetastatic && (patient.cancerStage === "I" || patient.cancerStage === "II" || patient.cancerStage === "III")) {
      return {
        matches: false,
        reasoning: `This trial requires metastatic disease (Stage IV). Patient has Stage ${patient.cancerStage} disease.`
      };
    }

    const matches = requirements.stage.includes(patient.cancerStage);

    return {
      matches,
      reasoning: matches
        ? `Stage ${patient.cancerStage} matches trial requirement`
        : `Stage ${patient.cancerStage} does not match trial requirement (requires ${requirements.stage.join(" or ")})`,
    };
  }

  private calculateOverallMatch(
    trial: Trial,
    biomarkerEval: BiomarkerEvaluation,
    stageMatch: { matches: boolean | "unknown"; reasoning: string },
    treatmentEval: { matches: boolean | "unknown"; score: number; details: string[] }
  ): MatchResult {
    const whyMatched: string[] = [];
    const whyCantMatch: string[] = [];
    const whatToConfirm: string[] = [];

    // Existing biomarker logic
    if (biomarkerEval.overallMatch === "doesnt_match") {
      biomarkerEval.details
        .filter(d => d.matches === false)
        .forEach(d => whyCantMatch.push(d.reasoning));
    }

    // Existing stage logic
    if (stageMatch.matches === false) {
      whyCantMatch.push(stageMatch.reasoning);
    }

    biomarkerEval.details
      .filter(d => d.matches === true)
      .forEach(d => whyMatched.push(d.reasoning));

    if (stageMatch.matches === true) {
      whyMatched.push(stageMatch.reasoning);
    }

    biomarkerEval.details
      .filter(d => d.matches === "unknown")
      .forEach(d => whatToConfirm.push(d.reasoning));

    if (stageMatch.matches === "unknown") {
      whatToConfirm.push(stageMatch.reasoning);
    }

    // NEW: Add treatment evaluation details
    treatmentEval.details.forEach(detail => {
      if (treatmentEval.matches === true) {
        whyMatched.push(detail);
      } else if (treatmentEval.matches === "unknown") {
        whatToConfirm.push(detail);
      } else if (treatmentEval.matches === false) {
        whyCantMatch.push(detail);
      }
    });

    let baseScore = 50;

    if (biomarkerEval.overallMatch === "matches") {
      baseScore += 35;
    } else if (biomarkerEval.overallMatch === "partial") {
      baseScore += 15;
    } else if (biomarkerEval.overallMatch === "unknown") {
      baseScore += 20;
    } else {
      baseScore -= 30;
    }

    if (stageMatch.matches === true) {
      baseScore += 15;
    } else if (stageMatch.matches === "unknown") {
      baseScore += 5;
    } else {
      baseScore -= 20;
    }

    // NEW: Add treatment score
    baseScore += treatmentEval.score;
    
    // If treatment doesn't match, penalize
    if (treatmentEval.matches === false) {
      baseScore -= 20;
    }

    const finalScore = Math.max(10, Math.min(99, baseScore));

    let matchConfidence: MatchConfidence;
    let eligibilityScore: "possibly_eligible" | "likely_not_eligible";

    if (whyCantMatch.length > 0) {
      matchConfidence = "low";
      eligibilityScore = "likely_not_eligible";
    } else if (biomarkerEval.overallMatch === "matches" && stageMatch.matches === true && treatmentEval.matches !== false) {
      matchConfidence = "high";
      eligibilityScore = "possibly_eligible";
    } else if (biomarkerEval.overallMatch === "unknown" || stageMatch.matches === "unknown" || treatmentEval.matches === "unknown") {
      matchConfidence = "medium";
      eligibilityScore = "possibly_eligible";
    } else {
      matchConfidence = "medium";
      eligibilityScore = "possibly_eligible";
    }

    return {
      trial,
      matchScore: finalScore,
      matchConfidence,
      eligibilityScore,
      biomarkerMatch: biomarkerEval.overallMatch,
      whyMatched,
      whyCantMatch,
      whatToConfirm,
    };
  }
}

export const matchingEngine = new TrialMatchingEngine();
