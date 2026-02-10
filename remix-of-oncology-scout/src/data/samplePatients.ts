import { PatientData } from "@/types/oncology";
import { defaultBiomarkerProfile, BiomarkerState, PDL1Level, HER2Status, EGFRSubtype } from "@/types/biomarkers";

export type SamplePatientKey = "her2_low" | "post_cdk46" | "tnbc" | "egfr";

export const SAMPLE_PATIENTS: Record<SamplePatientKey, PatientData> = {
  her2_low: {
    age: 61,
    sex: "female",
    cancerType: "breast",
    cancerStage: "IV",
    ecogStatus: 1,
    ecogUnknown: false,
    lineOfTherapy: "post_chemo_immuno",
    lastTherapyEndDate: "30_90_days",
    bestResponseToLastTherapy: "progressed",
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "present" as BiomarkerState,
        PR: "present" as BiomarkerState,
        BRCA1_2: "unknown" as BiomarkerState,
        PIK3CA: "unknown" as BiomarkerState,
        ESR1: "unknown" as BiomarkerState,
      },
      expression: {
        PDL1: "unknown" as PDL1Level,
        HER2: "low" as HER2Status,
      },
    },
    breastTreatments: {
      endocrineTherapy: true,
      cdk46Inhibitors: false,
      antiHer2: false,
      adcs: false,
    },
    lungTreatments: {
      immunotherapy: "unsure",
      targetedTherapy: "unsure",
      platinumChemo: "unsure",
    },
    priorTreatmentTypes: { surgery: true, radiation: false, medication: true },
    organFunction: {
      liverKidneyIssues: "no",
      brainMetastases: "no",
      otherActiveCancers: "no",
    },
    biomarkers: ["ER+", "PR+", "HER2-low"],
    hasPathologyReport: false,
    hasOncologyNote: false,
    extractedFields: {},
    zipCode: "10001",
    maxTravelDistance: 50,
    showMismatchedTrials: false,
  },

  post_cdk46: {
    age: 52,
    sex: "female",
    cancerType: "breast",
    cancerStage: "IV",
    ecogStatus: 1,
    ecogUnknown: false,
    lineOfTherapy: "post_targeted",
    lastTherapyEndDate: "30_90_days",
    bestResponseToLastTherapy: "progressed",
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "present" as BiomarkerState,
        PR: "present" as BiomarkerState,
        BRCA1_2: "unknown" as BiomarkerState,
        PIK3CA: "unknown" as BiomarkerState,
        ESR1: "unknown" as BiomarkerState,
      },
      expression: {
        PDL1: "unknown" as PDL1Level,
        HER2: "0" as HER2Status,
      },
    },
    breastTreatments: {
      endocrineTherapy: true,
      cdk46Inhibitors: true,
      antiHer2: false,
      adcs: false,
    },
    lungTreatments: {
      immunotherapy: "unsure",
      targetedTherapy: "unsure",
      platinumChemo: "unsure",
    },
    priorTreatmentTypes: { surgery: true, radiation: true, medication: true },
    organFunction: {
      liverKidneyIssues: "no",
      brainMetastases: "no",
      otherActiveCancers: "no",
    },
    biomarkers: ["ER+", "PR+", "HER2-"],
    hasPathologyReport: false,
    hasOncologyNote: false,
    extractedFields: {},
    zipCode: "10001",
    maxTravelDistance: 50,
    showMismatchedTrials: false,
  },

  tnbc: {
    age: 45,
    sex: "female",
    cancerType: "breast",
    cancerStage: "IV",
    ecogStatus: 0,
    ecogUnknown: false,
    lineOfTherapy: "first",
    lastTherapyEndDate: null,
    bestResponseToLastTherapy: null,
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      hormoneReceptors: {
        ER: "absent" as BiomarkerState,
        PR: "absent" as BiomarkerState,
        BRCA1_2: "unknown" as BiomarkerState,
        PIK3CA: "unknown" as BiomarkerState,
        ESR1: "unknown" as BiomarkerState,
      },
      expression: {
        PDL1: "high" as PDL1Level,
        HER2: "0" as HER2Status,
      },
    },
    breastTreatments: {
      endocrineTherapy: false,
      cdk46Inhibitors: false,
      antiHer2: false,
      adcs: false,
    },
    lungTreatments: {
      immunotherapy: "unsure",
      targetedTherapy: "unsure",
      platinumChemo: "unsure",
    },
    priorTreatmentTypes: { surgery: true, radiation: false, medication: false },
    organFunction: {
      liverKidneyIssues: "no",
      brainMetastases: "no",
      otherActiveCancers: "no",
    },
    biomarkers: ["Triple-Negative", "PD-L1 High"],
    hasPathologyReport: false,
    hasOncologyNote: false,
    extractedFields: {},
    zipCode: "10001",
    maxTravelDistance: 50,
    showMismatchedTrials: false,
  },

  egfr: {
    age: 58,
    sex: "male",
    cancerType: "lung",
    cancerStage: "IV",
    ecogStatus: 1,
    ecogUnknown: false,
    lineOfTherapy: "post_targeted",
    lastTherapyEndDate: "30_90_days",
    bestResponseToLastTherapy: "progressed",
    biomarkerProfile: {
      ...defaultBiomarkerProfile,
      genetic: {
        EGFR: { state: "present" as BiomarkerState, subtype: "exon19_del" as EGFRSubtype },
        ALK: "absent" as BiomarkerState,
        ROS1: "absent" as BiomarkerState,
        BRAF: "absent" as BiomarkerState,
        KRAS_G12C: "absent" as BiomarkerState,
        MET: "unknown" as BiomarkerState,
        RET: "unknown" as BiomarkerState,
        NTRK: "unknown" as BiomarkerState,
      },
      expression: {
        PDL1: "low" as PDL1Level,
        HER2: "unknown" as HER2Status,
      },
    },
    breastTreatments: {
      endocrineTherapy: "unsure",
      cdk46Inhibitors: "unsure",
      antiHer2: "unsure",
      adcs: "unsure",
    },
    lungTreatments: {
      immunotherapy: false,
      targetedTherapy: true,
      platinumChemo: true,
    },
    priorTreatmentTypes: { surgery: false, radiation: true, medication: true },
    organFunction: {
      liverKidneyIssues: "no",
      brainMetastases: "no",
      otherActiveCancers: "no",
    },
    biomarkers: ["EGFR Exon 19 Deletion"],
    hasPathologyReport: false,
    hasOncologyNote: false,
    extractedFields: {},
    zipCode: "10001",
    maxTravelDistance: 50,
    showMismatchedTrials: false,
  },
};

export const SAMPLE_PATIENT_DESCRIPTIONS: Record<SamplePatientKey, {
  name: string;
  subtitle: string;
  description: string;
  highlights: string;
}> = {
  her2_low: {
    name: "Sample Patient A",
    subtitle: "HER2-low Breast Cancer",
    description: "61yo female, Stage IV ER+/PR+/HER2-low breast cancer",
    highlights: "Demonstrates HER2-low interpretation per FDA 2022",
  },
  post_cdk46: {
    name: "Sample Patient B",
    subtitle: "Post-CDK4/6 Inhibitor",
    description: "52yo female, Stage IV ER+/HER2-, progressed on palbociclib",
    highlights: "Demonstrates treatment sequencing logic",
  },
  tnbc: {
    name: "Sample Patient C",
    subtitle: "Triple-Negative First-Line",
    description: "45yo female, Stage IV TNBC, PD-L1 high, first-line",
    highlights: "Demonstrates stage exclusion safety guards",
  },
  egfr: {
    name: "Sample Patient D",
    subtitle: "EGFR+ NSCLC",
    description: "58yo male, Stage IV NSCLC with EGFR exon 19 deletion",
    highlights: "Demonstrates lung cancer matching",
  },
};
