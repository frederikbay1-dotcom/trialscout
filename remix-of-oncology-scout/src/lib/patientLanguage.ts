// src/lib/patientLanguage.ts

import { Trial } from "@/types/oncology";

/**
 * Converts clinical trial titles to patient-friendly language (5th-6th grade)
 */
export function getPatientFriendlyTitle(trial: Trial): {
  main: string;
  subtitle: string;
} {
  const title = trial.title.toLowerCase();
  const nct = trial.nctNumber;

  // BREAST CANCER TRIALS (20 total)
  
  // Trial 001: DESTINY-Breast06
  if (nct === "NCT05234567" || title.includes("destiny-breast06")) {
    return {
      main: "Targeted Medicine for Low HER2 Breast Cancer",
      subtitle: "For breast cancer with low amounts of a protein called HER2"
    };
  }

  // Trial 002: TROPiCS-02 (Sacituzumab Govitecan)
  if (nct === "NCT05789234" || title.includes("tropics-02")) {
    return {
      main: "New Targeted Therapy vs. Standard Chemotherapy",
      subtitle: "For hormone-positive, HER2-negative breast cancer that has spread"
    };
  }

  // Trial 003: IZABRIGHT-01 (Triple-Negative)
  if (nct === "NCT06926868" || title.includes("izabright")) {
    return {
      main: "New Targeted Medicine vs. Standard Chemotherapy",
      subtitle: "For triple-negative breast cancer (first treatment for spread)"
    };
  }

  // Trial 004: EMERALD (Elacestrant)
  if (nct === "NCT05456789" || title.includes("emerald") || title.includes("elacestrant")) {
    return {
      main: "Daily Pill vs. Hormone Therapy Injection",
      subtitle: "For hormone-positive breast cancer with a specific gene change (ESR1)"
    };
  }

  // Trial 005: TROPION-Breast01 (Datopotamab)
  if (nct === "NCT05678912" || title.includes("tropion-breast")) {
    return {
      main: "New Targeted Medicine vs. Standard Chemotherapy",
      subtitle: "For hormone-positive, HER2-negative breast cancer after several treatments"
    };
  }

  // Trial 006: KEYNOTE-355 (Pembrolizumab + Chemo)
  if (nct === "NCT05123456" || title.includes("keynote-355")) {
    return {
      main: "Immunotherapy Plus Chemotherapy vs. Chemotherapy Alone",
      subtitle: "For triple-negative breast cancer with PD-L1 marker"
    };
  }

  // Trial 007: CAPItello-291 (Capivasertib)
  if (nct === "NCT05891234" || title.includes("capitello")) {
    return {
      main: "Targeted Pill Plus Hormone Therapy",
      subtitle: "For breast cancer with specific gene changes (PIK3CA, AKT1, or PTEN)"
    };
  }

  // Trial 008: HER2CLIMB-02 (Tucatinib for brain mets)
  if (nct === "NCT05567890" || title.includes("her2climb")) {
    return {
      main: "Triple Combination for Brain Metastases",
      subtitle: "For HER2-positive breast cancer that has spread to the brain"
    };
  }

  // Trial 009: persevERA (Rintodestrant)
  if (nct === "NCT05789321" || title.includes("persevera")) {
    return {
      main: "Daily Pill vs. Standard Hormone Therapy",
      subtitle: "For hormone-positive breast cancer after CDK4/6 inhibitor treatment"
    };
  }

  // Trial 010: KEYNOTE-522 (Neoadjuvant - Early Stage)
  if (nct === "NCT05901234" || title.includes("keynote-522")) {
    return {
      main: "Immunotherapy Before Surgery",
      subtitle: "For early-stage triple-negative breast cancer (treatment BEFORE surgery)"
    };
  }

  // Trial 011: MONARCH 2 (Abemaciclib)
  if (nct === "NCT05234890" || title.includes("monarch")) {
    return {
      main: "Targeted Pill Plus Hormone Injection",
      subtitle: "For hormone-positive breast cancer that has spread"
    };
  }

  // Trial 012: DESTINY-Breast10 (HER2-ultralow)
  if (nct === "NCT05456123" || title.includes("destiny-breast10")) {
    return {
      main: "Targeted Medicine for Very Low HER2",
      subtitle: "For breast cancer with very low amounts of HER2 protein"
    };
  }

  // Trial 013: Olaparib + Ceralasertib (BRCA/HRD)
  if (nct === "NCT05678345" || title.includes("olaparib") && title.includes("ceralasertib")) {
    return {
      main: "Two Targeted Pills Working Together",
      subtitle: "For breast cancer with BRCA gene changes or DNA repair problems"
    };
  }

  // Trial 014: SERENA-6 (Camizestrant)
  if (nct === "NCT05789567" || title.includes("serena")) {
    return {
      main: "Daily Pill vs. Monthly Injection",
      subtitle: "For hormone-positive breast cancer after CDK4/6 inhibitor stopped working"
    };
  }

  // Trial 015: DESTINY-Breast09 (T-DXd + Immunotherapy)
  if (nct === "NCT05901567" || title.includes("destiny-breast09")) {
    return {
      main: "Targeted Medicine Plus Immunotherapy",
      subtitle: "For HER2-positive breast cancer that has spread"
    };
  }

  // Trial 016: RIGHT Choice (Ribociclib first-line)
  if (nct === "NCT05123789" || title.includes("right choice")) {
    return {
      main: "Targeted Pill vs. Chemotherapy for Fast-Growing Cancer",
      subtitle: "For hormone-positive breast cancer that needs quick treatment"
    };
  }

  // Trial 017: DESTINY-Breast08 (T-DXd +/- Anastrozole)
  if (nct === "NCT05567234" || title.includes("destiny-breast08")) {
    return {
      main: "Targeted Medicine With or Without Hormone Pill",
      subtitle: "For breast cancer that is both HER2-positive and hormone-positive"
    };
  }

  // Trial 018: OlympiA (Olaparib Adjuvant - Early Stage)
  if (nct === "NCT05234678" || title.includes("olympia")) {
    return {
      main: "Targeted Pill After Surgery and Chemotherapy",
      subtitle: "For early-stage breast cancer with BRCA gene changes (treatment AFTER surgery)"
    };
  }

  // Trial 019: acelERA BC (Giredestrant)
  if (nct === "NCT05678901" || title.includes("acelera")) {
    return {
      main: "Daily Pill vs. Standard Hormone Treatment",
      subtitle: "For hormone-positive breast cancer after multiple treatments"
    };
  }

  // Trial 020: ELAINE 2 (Lasofoxifene + Abemaciclib)
  if (nct === "NCT05901890" || title.includes("elaine")) {
    return {
      main: "Two Daily Pills Working Together",
      subtitle: "For hormone-positive breast cancer with ESR1 gene change"
    };
  }

  // FALLBACK - Generate from existing title
  return generateFallbackTitle(trial.title);
}

/**
 * Generates fallback patient-friendly title from clinical title
 */
function generateFallbackTitle(clinicalTitle: string): {
  main: string;
  subtitle: string;
} {
  const lower = clinicalTitle.toLowerCase();
  
  // Detect cancer type first
  const isLungCancer = lower.includes("nsclc") || lower.includes("lung") || lower.includes("non-small cell");
  const isBreastCancer = lower.includes("breast") || lower.includes("her2") || lower.includes("triple-negative") || lower.includes("tnbc");
  
  // LUNG CANCER
  if (isLungCancer) {
    const hasEGFR = lower.includes("egfr");
    const hasALK = lower.includes("alk");
    const hasROS1 = lower.includes("ros1");
    const isMetastatic = lower.includes("metastatic") || lower.includes("stage iv") || lower.includes("advanced");
    
    let main = "New Lung Cancer Treatment Study";
    let subtitle = "For lung cancer";
    
    if (hasEGFR) {
      main = "Targeted Treatment for EGFR-Positive Lung Cancer";
      subtitle = "For lung cancer with EGFR gene change";
    } else if (hasALK) {
      main = "Targeted Treatment for ALK-Positive Lung Cancer";
      subtitle = "For lung cancer with ALK gene rearrangement";
    } else if (hasROS1) {
      main = "Targeted Treatment for ROS1-Positive Lung Cancer";
      subtitle = "For lung cancer with ROS1 gene rearrangement";
    }
    
    if (isMetastatic && !subtitle.includes("that has spread")) {
      subtitle += " that has spread";
    }
    
    return { main, subtitle };
  }
  
  // BREAST CANCER (existing logic)
  const isTripleNegative = lower.includes("triple-negative") || lower.includes("tnbc");
  const isHER2Pos = lower.includes("her2+") || (lower.includes("her2") && lower.includes("positive"));
  const isHER2Low = lower.includes("her2-low");
  const isHRPos = lower.includes("hr+") || lower.includes("er+");
  const isMetastatic = lower.includes("metastatic") || lower.includes("stage iv");
  const isEarlyStage = lower.includes("neoadjuvant") || lower.includes("adjuvant");
  
  let main = "New Cancer Treatment Study";
  let subtitle = isBreastCancer ? "For breast cancer" : "For cancer treatment";
  
  // Customize based on type
  if (isTripleNegative) {
    main = "New Medicine vs. Standard Treatment";
    subtitle = "For triple-negative breast cancer";
  } else if (isHER2Pos) {
    main = "Targeted Medicine for HER2-Positive Cancer";
    subtitle = "For breast cancer with high HER2 protein";
  } else if (isHER2Low) {
    main = "Targeted Medicine for Low HER2 Cancer";
    subtitle = "For breast cancer with low HER2 protein";
  } else if (isHRPos) {
    main = "New Treatment vs. Standard Care";
    subtitle = "For hormone-positive breast cancer";
  }
  
  if (isMetastatic) {
    subtitle += " that has spread";
  } else if (isEarlyStage) {
    subtitle += " (treatment before or after surgery)";
  }
  
  return { main, subtitle };
}

/**
 * Converts clinical match reasons to patient-friendly language
 */
export function translateMatchReason(reason: string): string {
  const lower = reason.toLowerCase();
  
  // LUNG CANCER - EGFR
  if (lower.includes("egfr") && (lower.includes("mutation") || lower.includes("mutant"))) {
    if (lower.includes("exon 19") || lower.includes("l858r")) {
      return "Your cancer has an EGFR gene change (exon 19 deletion or L858R)";
    }
    return "Your cancer has an EGFR gene change";
  }
  
  // LUNG CANCER - ALK, ROS1, etc.
  if (lower.includes("alk") && (lower.includes("positive") || lower.includes("rearrangement"))) {
    return "Your cancer has an ALK gene rearrangement";
  }
  if (lower.includes("ros1") && (lower.includes("positive") || lower.includes("rearrangement"))) {
    return "Your cancer has a ROS1 gene rearrangement";
  }
  if (lower.includes("kras") && lower.includes("mutation")) {
    return "Your cancer has a KRAS gene change";
  }
  if (lower.includes("met") && (lower.includes("exon 14") || lower.includes("amplification"))) {
    return "Your cancer has a MET gene change";
  }
  if (lower.includes("braf") && lower.includes("mutation")) {
    return "Your cancer has a BRAF gene change";
  }
  
  // LUNG CANCER - NSCLC
  if (lower.includes("nsclc") || lower.includes("non-small cell lung")) {
    if (lower.includes("stage iv") || lower.includes("metastatic")) {
      return "Your lung cancer has spread to other parts of your body";
    }
    if (lower.includes("recurrent")) {
      return "Your lung cancer has come back";
    }
    return "Your lung cancer type matches this trial";
  }
  
  // LUNG CANCER - Prior treatments
  if (lower.includes("osimertinib") || lower.includes("tagrisso")) {
    return "You've tried osimertinib (Tagrisso) before";
  }
  if (lower.includes("platinum") && lower.includes("chemotherapy")) {
    return "You've tried platinum-based chemotherapy";
  }
  
  // HORMONE RECEPTORS (Breast)
  if (lower.includes("er+") && lower.includes("pr+")) {
    return "Your cancer responds to hormones (estrogen and progesterone)";
  }
  if (lower.includes("er+") || lower.includes("er-positive")) {
    return "Your cancer responds to estrogen";
  }
  if (lower.includes("pr+") || lower.includes("pr-positive")) {
    return "Your cancer responds to progesterone";
  }
  if (lower.includes("hormone receptor") && lower.includes("positive")) {
    return "Your cancer responds to hormones";
  }
  if (lower.includes("hr+")) {
    return "Your cancer type matches (hormone-positive)";
  }
  
  // HER2 STATUS (Breast)
  if (lower.includes("her2-negative") || (lower.includes("her2") && lower.includes("negative"))) {
    return "Your HER2 status matches (HER2-negative confirmed)";
  }
  if (lower.includes("her2-low") || lower.includes("ihc 1+")) {
    return "Your cancer has low amounts of HER2 protein";
  }
  if (lower.includes("her2+") || lower.includes("her2-positive")) {
    return "Your cancer has high amounts of HER2 protein";
  }
  
  // TRIPLE-NEGATIVE (Breast)
  if (lower.includes("triple-negative") || lower.includes("tnbc")) {
    return "Your cancer is triple-negative (ER-, PR-, HER2-)";
  }
  
  // STAGE / METASTATIC (Generic)
  if (lower.includes("stage iv") || lower.includes("metastatic")) {
    return "Your cancer has spread to other parts of your body";
  }
  if (lower.includes("locally advanced")) {
    return "Your cancer has grown in the area where it started";
  }
  if (lower.includes("recurrent")) {
    return "Your cancer has come back";
  }
  
  // TREATMENT HISTORY (Generic)
  if (lower.includes("cdk4/6") || lower.includes("palbociclib") || lower.includes("ribociclib")) {
    return "You've tried CDK4/6 inhibitor pills (like palbociclib or ribociclib)";
  }
  if (lower.includes("prior endocrine") || lower.includes("hormone therapy")) {
    return "You've tried hormone therapy before";
  }
  if (lower.includes("prior chemotherapy") || lower.includes("≥2 prior") || lower.includes("2-3 prior")) {
    return "You've tried chemotherapy before (at least 2 types)";
  }
  if (lower.includes("prior systemic therapy") || lower.includes("prior treatment")) {
    return "You've had cancer treatment before";
  }
  if (lower.includes("first-line") || lower.includes("no prior systemic")) {
    return "This would be your first treatment for cancer that has spread";
  }
  if (lower.includes("progression") && lower.includes("prior")) {
    return "Your cancer grew during your last treatment";
  }
  
  // PERFORMANCE STATUS (Generic)
  if (lower.includes("ecog 0-1") || lower.includes("ecog 0") || lower.includes("ecog 1")) {
    return "You can do most of your daily activities on your own";
  }
  if (lower.includes("performance status")) {
    return "You're able to take care of yourself";
  }
  
  // BIOMARKERS / MUTATIONS (Generic)
  if (lower.includes("esr1") && lower.includes("mutation")) {
    return "Your cancer has a specific gene change (ESR1 mutation)";
  }
  if (lower.includes("brca") && lower.includes("mutation")) {
    return "You have a BRCA gene change";
  }
  if (lower.includes("pik3ca") || lower.includes("akt1") || lower.includes("pten")) {
    return "Your cancer has specific gene changes (PIK3CA, AKT1, or PTEN pathway)";
  }
  if (lower.includes("pd-l1") && lower.includes("positive")) {
    return "Your cancer has PD-L1 marker";
  }
  if (lower.includes("pd-l1") && lower.includes("negative")) {
    return "Your cancer doesn't have PD-L1 marker";
  }
  if (lower.includes("biomarker") || lower.includes("molecular")) {
    return "Your cancer's genetic profile matches this trial";
  }
  
  // BRAIN METASTASES (Generic)
  if (lower.includes("brain") && lower.includes("metasta")) {
    return "Your cancer has spread to your brain";
  }
  
  // GENERIC SIMPLIFICATIONS
  if (lower.includes("required") || lower.includes("inclusion criteria")) {
    // Remove technical language
    let simplified = reason
      .replace(/\(required\)/gi, "")
      .replace(/inclusion criteria/gi, "")
      .replace(/aligns with/gi, "matches")
      .trim();
    
    if (!simplified.toLowerCase().startsWith("your")) {
      simplified = `Your ${simplified.charAt(0).toLowerCase()}${simplified.slice(1)}`;
    }
    return simplified;
  }
  
  // FALLBACK - Return simplified version
  if (lower.includes("matches") || lower.includes("aligns") || lower.includes("confirmed")) {
    // Extract the main concept before "matches/aligns/confirmed"
    const parts = reason.split(/matches|aligns|confirmed/i);
    if (parts[0]) {
      return `Your ${parts[0].trim().toLowerCase()} fits this trial`;
    }
  }
  
  // Last resort - return original with "Your" prefix if not already there
  if (!lower.startsWith("your")) {
    return `Your ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`;
  }
  
  return reason;
}

/**
 * Converts clinical "what to confirm" items to patient-friendly language
 */
export function translateConfirmationItem(item: string): string {
  const lower = item.toLowerCase();
  
  // LUNG CANCER - EGFR/Biomarker Testing
  if (lower.includes("egfr") && (lower.includes("mutation") || lower.includes("testing"))) {
    return "Confirm your EGFR gene change with testing";
  }
  if (lower.includes("alk") || lower.includes("ros1") || lower.includes("molecular testing")) {
    return "Confirm your cancer's genetic profile with testing";
  }
  
  // LUNG CANCER - Prior osimertinib
  if (lower.includes("osimertinib") || lower.includes("tagrisso")) {
    return "Confirm you've tried osimertinib (Tagrisso) before";
  }
  
  // HER2 TESTING (Breast)
  if (lower.includes("her2") && (lower.includes("ihc") || lower.includes("ish"))) {
    return "Check your HER2 level with a special test";
  }
  
  // MUTATION TESTING (Generic)
  if (lower.includes("esr1") && lower.includes("mutation")) {
    return "Test for ESR1 gene change in your blood or tumor";
  }
  if (lower.includes("brca") && lower.includes("mutation")) {
    return "Confirm you have a BRCA gene change";
  }
  if (lower.includes("biomarker") || lower.includes("molecular")) {
    return "Confirm your cancer's genetic profile";
  }
  
  // PRIOR TREATMENT LINES
  if (lower.includes("≥2 prior") || lower.includes("2-3 prior") || lower.includes("prior lines")) {
    return "Make sure you've had at least 2 types of cancer treatment";
  }
  if (lower.includes("≥1 prior") || lower.includes("at least 1 prior")) {
    return "Make sure you've had at least 1 type of cancer treatment";
  }
  if (lower.includes("no prior") && lower.includes("metastatic")) {
    return "Make sure you haven't had treatment for cancer that has spread";
  }
  if (lower.includes("prior systemic therapy")) {
    return "Confirm what cancer treatments you've had before";
  }
  
  // WASHOUT PERIODS
  if (lower.includes("washout") || lower.includes("days from last") || lower.includes("weeks from")) {
    const match = lower.match(/(\d+)\s*(day|week)/);
    if (match) {
      const num = match[1];
      const unit = match[2] === "week" ? "weeks" : "days";
      return `Wait ${num} ${unit} after your last cancer treatment`;
    }
    return "Wait the required time after your last cancer treatment";
  }
  
  // LAB VALUES - BLOOD COUNTS
  if (lower.includes("anc") || lower.includes("white blood") || lower.includes("neutrophil")) {
    return "Make sure your white blood cells are at a healthy level";
  }
  if (lower.includes("platelets")) {
    return "Make sure your blood cells that stop bleeding are high enough";
  }
  if (lower.includes("hemoglobin") || lower.includes("hgb")) {
    return "Make sure your red blood cells are at a good level";
  }
  if (lower.includes("bone marrow") || lower.includes("adequate hematologic") || lower.includes("lab requirements")) {
    return "Make sure your blood counts are healthy enough";
  }
  
  // HEART FUNCTION
  if (lower.includes("lvef") || lower.includes("heart") || lower.includes("cardiac")) {
    return "Make sure your heart is pumping well (at least 50%)";
  }
  
  // LIVER/KIDNEY
  if (lower.includes("liver function") || lower.includes("lft") || lower.includes("hepatic")) {
    return "Make sure your liver is working well";
  }
  if (lower.includes("kidney") || lower.includes("renal") || lower.includes("creatinine")) {
    return "Make sure your kidneys are working well";
  }
  
  // LUNG FUNCTION
  if (lower.includes("lung") || lower.includes("ild") || lower.includes("pulmonary") || lower.includes("pneumonitis")) {
    return "Make sure you don't have lung problems";
  }
  
  // BRAIN METASTASES
  if (lower.includes("brain") && lower.includes("metasta")) {
    if (lower.includes("no") || lower.includes("not")) {
      return "Make sure cancer hasn't spread to your brain";
    }
    return "Check that brain metastases are stable and treated";
  }
  
  // PERFORMANCE STATUS
  if (lower.includes("ecog") || lower.includes("performance status")) {
    return "Make sure you can do most daily activities on your own";
  }
  
  // PD-L1 STATUS
  if (lower.includes("pd-l1")) {
    if (lower.includes("positive") || lower.includes("≥")) {
      return "Test for PD-L1 marker (needs to be positive)";
    } else if (lower.includes("negative")) {
      return "Test for PD-L1 marker (needs to be negative)";
    }
    return "Test for PD-L1 marker in your cancer";
  }
  
  // DISEASE PROGRESSION
  if (lower.includes("progression")) {
    return "Make sure your cancer grew during your last treatment";
  }
  
  // MEASURABLE DISEASE
  if (lower.includes("measurable disease") || lower.includes("recist")) {
    return "Make sure your cancer can be measured on scans";
  }
  
  // FALLBACK - Simplify verbs
  let result = item;
  result = result.replace(/^Verify\s+/i, "Make sure ");
  result = result.replace(/^Confirm\s+/i, "Check that ");
  result = result.replace(/^Check\s+/i, "Check that ");
  result = result.replace(/\(required\)/gi, "");
  result = result.replace(/aligns with inclusion criteria/gi, "");
  result = result.trim();
  
  return result;
}

/**
 * Converts trial design/goal to patient-friendly language
 */
export function getPatientFriendlyExplanation(trial: Trial): {
  whatIsIt: string;
  goal: string;
  whatHappens: string;
  howLong: string;
} {
  const nct = trial.nctNumber;
  const existing = trial.translatedInfo;
  
  // Check for trial-specific explanations first
  const specific = getTrialSpecificExplanation(nct);
  if (specific) {
    return specific;
  }
  
  // Return patient-friendly versions or fall back to existing
  return {
    whatIsIt: simplifyDesign(existing?.design || "", nct),
    goal: simplifyGoal(existing?.goal || "", nct),
    whatHappens: simplifyWhatHappens(existing?.whatHappens || "", nct),
    howLong: simplifyDuration(existing?.duration || "", nct)
  };
}

/**
 * Get trial-specific patient-friendly explanations
 */
function getTrialSpecificExplanation(nct: string): {
  whatIsIt: string;
  goal: string;
  whatHappens: string;
  howLong: string;
} | null {
  
  // CAPItello-291 (Capivasertib + Fulvestrant)
  if (nct === "NCT05891234") {
    return {
      whatIsIt: "This study combines two medicines: a daily pill (capivasertib) with a monthly hormone shot (fulvestrant). The pill helps block signals that tell cancer cells to grow. This combination may work better than hormone therapy alone.",
      goal: "To see if adding the daily pill to hormone therapy helps the cancer stay under control longer than hormone therapy by itself.",
      whatHappens: "You'll take pills at home every day and come in once a month for a hormone shot. You'll have regular check-ups and scans to see how the cancer is responding.",
      howLong: "You'll keep getting treatment as long as it's working and you're not having bad side effects. Most people stay on treatment for several months."
    };
  }
  
  // TROPiCS-02 (Sacituzumab Govitecan)
  if (nct === "NCT05789234") {
    return {
      whatIsIt: "This study tests a targeted medicine called sacituzumab govitecan. It works like a smart delivery truck - it finds cancer cells and delivers chemotherapy directly to them, which may cause fewer side effects than regular chemotherapy.",
      goal: "To see if this targeted medicine works better than standard chemotherapy for hormone-positive breast cancer that has spread.",
      whatHappens: "You'll come to the clinic for IV treatments (medicine through a needle in your arm). You'll have regular blood tests and scans to check how the cancer is responding.",
      howLong: "Treatment is given in cycles. You'll continue as long as the medicine is working and you're tolerating it well."
    };
  }
  
  // DESTINY-Breast06 (T-DXd for HER2-low)
  if (nct === "NCT05234567") {
    return {
      whatIsIt: "This study tests a targeted medicine for cancers with low amounts of HER2 protein. The medicine finds cancer cells with HER2 and delivers chemotherapy directly to them.",
      goal: "To see if this targeted medicine works better than standard chemotherapy for breast cancer with low HER2 levels.",
      whatHappens: "You'll come to the clinic every 3 weeks for IV treatments. You'll have regular scans to see if the cancer is shrinking.",
      howLong: "You'll keep getting treatment as long as it's working and you're not having serious side effects."
    };
  }
  
  // KEYNOTE-355 (Pembrolizumab + Chemo)
  if (nct === "NCT05123456") {
    return {
      whatIsIt: "This study combines immunotherapy (pembrolizumab) with chemotherapy. The immunotherapy helps your immune system recognize and attack cancer cells, while chemotherapy kills cancer cells directly.",
      goal: "To see if adding immunotherapy to chemotherapy helps people live longer than chemotherapy alone.",
      whatHappens: "You'll come to the clinic for IV treatments every 3 weeks. You'll have regular blood tests and scans to monitor how you're doing.",
      howLong: "Treatment continues as long as it's working. Most people receive treatment for several months to a year or more."
    };
  }
  
  // EMERALD (Elacestrant)
  if (nct === "NCT05456789") {
    return {
      whatIsIt: "This study tests a daily pill (elacestrant) that blocks hormones from helping cancer grow. It's designed to work even when cancer has become resistant to other hormone treatments.",
      goal: "To see if this daily pill works better than standard hormone therapy for cancers with a specific gene change (ESR1 mutation).",
      whatHappens: "You'll take pills at home every day. You'll come in for regular check-ups and scans to see how the cancer is responding.",
      howLong: "You'll continue taking the pills as long as they're working and you're not having bad side effects."
    };
  }
  
  return null;
}

function simplifyDesign(text: string, nct: string): string {
  const lower = text.toLowerCase();
  
  // LUNG CANCER - Bispecific antibodies
  if (lower.includes("bispecific antibody") && (lower.includes("egfr") || lower.includes("met"))) {
    return "This study tests a medicine that targets two proteins on cancer cells (EGFR and MET). It works like a smart weapon that finds cancer cells and helps your immune system attack them.";
  }
  
  // LUNG CANCER - EGFR TKIs
  if (lower.includes("third-generation egfr inhibitor") || (lower.includes("egfr inhibitor") && lower.includes("lazertinib"))) {
    return "This study tests newer pills that target the EGFR gene change in your cancer. These pills are designed to work even after other EGFR medicines stop working.";
  }
  
  // AKT inhibitors (like capivasertib)
  if (lower.includes("akt inhibitor") || lower.includes("capivasertib")) {
    return "This study tests a daily pill that blocks signals telling cancer cells to grow. It's combined with hormone therapy to make the treatment work better.";
  }
  
  // PIK3CA/AKT1/PTEN pathway
  if (lower.includes("pik3ca") || lower.includes("akt1") || lower.includes("pten")) {
    return "This study tests medicine for cancers with specific gene changes that affect how cells grow. The medicine blocks these growth signals.";
  }
  
  // Antibody-drug conjugates
  if (lower.includes("antibody-drug conjugate") || lower.includes("adc")) {
    return "This study tests a medicine that works like a guided delivery truck. It brings cancer-fighting drugs straight to cancer cells while avoiding healthy cells.";
  }
  
  // CDK4/6 inhibitors
  if (lower.includes("cdk4/6")) {
    return "This study tests pills that slow down how fast cancer cells grow and divide. These pills are taken along with hormone therapy.";
  }
  
  // PARP inhibitors
  if (lower.includes("parp") || lower.includes("olaparib")) {
    return "This study tests pills that stop cancer cells from repairing their DNA. This works especially well for cancers with BRCA gene changes.";
  }
  
  // Immunotherapy
  if (lower.includes("immunotherapy") || lower.includes("pembrolizumab") || lower.includes("pd-l1")) {
    return "This study tests medicine that helps your immune system recognize and attack cancer cells. It's like taking the brakes off your immune system.";
  }
  
  // Oral SERDs
  if (lower.includes("serd") || lower.includes("estrogen receptor degrader")) {
    return "This study tests a daily pill that blocks hormones from helping cancer grow. It works even when cancer has become resistant to other hormone treatments.";
  }
  
  // Generic simplification
  return text
    .replace(/bispecific antibody targeting EGFR and MET/gi, "medicine that targets two proteins (EGFR and MET) on cancer cells")
    .replace(/bispecific antibody/gi, "medicine that targets two proteins on cancer cells")
    .replace(/third-generation EGFR inhibitor/gi, "newer EGFR-targeted pill")
    .replace(/EGFR inhibitor/gi, "EGFR-targeted pill")
    .replace(/antibody-drug conjugate/gi, "targeted cancer medicine")
    .replace(/ADC/g, "targeted medicine")
    .replace(/AKT inhibitor/gi, "medicine that blocks cancer growth signals")
    .replace(/PIK3CA\/AKT1\/PTEN pathway alterations/gi, "specific gene changes")
    .replace(/genetic alterations/gi, "gene changes")
    .replace(/IV infusion/g, "medicine through a needle in your arm")
    .replace(/metastatic/gi, "cancer that has spread")
    .replace(/NSCLC/g, "lung cancer")
    .replace(/tumor response/gi, "cancer shrinking")
    .replace(/progression-free survival/gi, "time before cancer grows")
    .replace(/overall survival/gi, "how long people live")
    .replace(/participants/gi, "people in the study")
    .replace(/patients/gi, "people")
    .replace(/compares combination vs/gi, "compares getting both medicines versus")
    .replace(/vs chemotherapy/gi, "versus chemotherapy")
    .replace(/after osimertinib failure/gi, "after osimertinib stopped working")
    .replace(/receive combination/gi, "get both medicines together")
    .replace(/fulvestrant alone/gi, "hormone therapy by itself");
}

function simplifyGoal(text: string, nct: string): string {
  return text
    .replace(/To test if adding an AKT inhibitor/gi, "To see if adding this medicine")
    .replace(/To determine if/gi, "To find out if")
    .replace(/To evaluate/gi, "To see if")
    .replace(/To assess/gi, "To check if")
    .replace(/amivantamab \+ lazertinib/gi, "this combination")
    .replace(/extends progression-free survival compared to/gi, "gives more time before cancer grows compared to")
    .replace(/progression-free survival/gi, "time before cancer grows")
    .replace(/in EGFR-mutant NSCLC patients who progressed on osimertinib/gi, "for people with lung cancer that has an EGFR gene change, after osimertinib stopped working")
    .replace(/EGFR-mutant NSCLC/gi, "lung cancer with EGFR gene change")
    .replace(/who progressed on osimertinib/gi, "after osimertinib stopped working")
    .replace(/works better than/gi, "is better than")
    .replace(/extends life longer/gi, "helps people live longer")
    .replace(/improves progression-free survival/gi, "gives more time before cancer grows")
    .replace(/compared to/gi, "versus")
    .replace(/in patients with/gi, "for people with")
    .replace(/in patients with specific genetic alterations/gi, "for people with certain gene changes")
    .replace(/metastatic/gi, "cancer that has spread")
    .replace(/NSCLC/g, "lung cancer");
}

function simplifyWhatHappens(text: string, nct: string): string {
  return text
    .replace(/IV infusion/g, "medicine through a needle in your arm")
    .replace(/Scans/g, "Pictures (like X-rays)")
    .replace(/tumor response/gi, "if the cancer is shrinking")
    .replace(/monitor/gi, "check for")
    .replace(/Blood work/gi, "Blood tests");
}

function simplifyDuration(text: string, nct: string): string {
  return text
    .replace(/Treatment continues until disease progression/gi, "You'll keep getting treatment as long as it's working")
    .replace(/or unacceptable side effects/gi, "and you're not having bad side effects")
    .replace(/typically/gi, "usually")
    .replace(/on average/gi, "for most people");
}

/**
 * Get logistics with icons for visual display
 */
export interface LogisticsDisplay {
  distance: string;
  visits: string;
  treatment: string;
  biopsy: string;
  overnight: string;
}

export function formatLogistics(trial: Trial): LogisticsDisplay {
  const burden = trial.burden;
  
  return {
    distance: trial.location
      ? `📍 ${trial.location}`
      : "📍 Location in NYC area",
    
    visits: burden?.visitsPerMonth
      ? `📅 ${burden.visitsPerMonth} visits per month`
      : "📅 Regular visits",
    
    treatment: getTreatmentTypeDisplay(trial),
    
    biopsy: burden?.biopsyRequired
      ? "🔬 Biopsy needed"
      : "🔬 No biopsy needed",
    
    overnight: burden?.hospitalDays
      ? "🏥 May need hospital stays"
      : "🏠 No overnight stays"
  };
}

function getTreatmentTypeDisplay(trial: Trial): string {
  const design = (trial.translatedInfo?.design || "").toLowerCase();
  const title = trial.title.toLowerCase();
  
  if (design.includes("oral") || title.includes("oral") || 
      design.includes("pill") || design.includes("tablet")) {
    return "💊 Daily pills";
  }
  
  if (design.includes("iv") || design.includes("infusion") || 
      title.includes("infusion")) {
    return "💉 IV infusion";
  }
  
  if (design.includes("injection") || design.includes("fulvestrant")) {
    return "💉 Injection";
  }
  
  return "💊 Medicine treatment";
}