export interface BiomarkerHelperData {
  title: string;
  whereToFind: string[];
  documentNames?: string[];
  whoToAsk?: string;
  example?: string;
  reportSection?: string;
}

export const biomarkerHelpers: Record<string, BiomarkerHelperData> = {
  her2: {
    title: "HER2 Status",
    whereToFind: [
      "Check your pathology report from your biopsy or surgery",
      "Look for 'HER2' followed by 'IHC' (immunohistochemistry) or 'ISH/FISH' (genetic test)",
      "Results are usually reported as '0', '1+', '2+', or '3+' for IHC",
    ],
    documentNames: [
      "Pathology Report",
      "Immunohistochemistry Results",
      "Biomarker Testing Report",
    ],
    reportSection: "Immunohistochemistry (IHC) or Receptor Status",
    example: "HER2: IHC 1+ (low positive) or HER2: 0 (negative)",
    whoToAsk: "Call your oncologist's office and ask for your 'HER2 receptor status' or 'HER2 IHC result'",
  },

  hormoneReceptors: {
    title: "Hormone Receptor Status (ER/PR)",
    whereToFind: [
      "Check the same pathology report that shows HER2 status",
      "Look for 'ER' (Estrogen Receptor) and 'PR' (Progesterone Receptor)",
      "Results shown as 'positive', 'negative', or percentage (e.g., '85%')",
    ],
    documentNames: [
      "Pathology Report",
      "Immunohistochemistry Report",
    ],
    reportSection: "Hormone Receptor Status or Immunohistochemistry",
    example: "ER: Positive (90%), PR: Positive (75%)",
    whoToAsk: "Ask your doctor's office for 'hormone receptor status' or 'ER/PR status'",
  },

  pdl1: {
    title: "PD-L1 Expression",
    whereToFind: [
      "Check your biomarker testing or immunotherapy screening report",
      "Look for 'PD-L1' followed by a percentage or 'CPS' (Combined Positive Score)",
      "May also see 'TPS' (Tumor Proportion Score)",
    ],
    documentNames: [
      "PD-L1 Testing Report",
      "Immunotherapy Biomarker Panel",
    ],
    reportSection: "PD-L1 Expression or Immunotherapy Biomarkers",
    example: "PD-L1 CPS: 15 (high expression) or PD-L1 TPS: <1% (negative)",
    whoToAsk: "Ask if you've had 'PD-L1 testing' or 'immunotherapy biomarker testing'",
  },

  egfr: {
    title: "EGFR Mutation",
    whereToFind: [
      "Check your molecular testing or genomic profiling report",
      "Look for 'EGFR' in the mutations section",
      "Common mutations: 'Exon 19 deletion' or 'L858R' (exon 21)",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Genomic Profile Report",
      "Next-Generation Sequencing (NGS) Report",
    ],
    reportSection: "Detected Mutations or Genomic Alterations",
    example: "EGFR Exon 19 deletion detected or EGFR: Negative (no mutations)",
    whoToAsk: "Ask if you've had 'molecular testing', 'genomic profiling', or 'NGS testing'",
  },

  alk: {
    title: "ALK Fusion",
    whereToFind: [
      "Check your molecular testing report (same as EGFR)",
      "Look for 'ALK' or 'ALK fusion' or 'ALK rearrangement'",
      "Usually reported as 'positive' or 'negative'",
    ],
    documentNames: [
      "Molecular Testing Report",
      "ALK FISH Test",
    ],
    reportSection: "Fusion Genes or Structural Alterations",
    example: "ALK fusion: Positive or ALK: Not detected",
    whoToAsk: "Ask if you've been tested for 'ALK fusion' or 'ALK rearrangement'",
  },

  ros1: {
    title: "ROS1 Fusion",
    whereToFind: [
      "Check molecular testing report (same document as EGFR/ALK)",
      "Look for 'ROS1' or 'ROS1 fusion' or 'ROS1 rearrangement'",
      "Less commonly tested than EGFR/ALK",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Genomic Profile Report",
    ],
    reportSection: "Fusion Genes or Rearrangements",
    example: "ROS1 fusion: Detected or ROS1: Negative",
    whoToAsk: "Ask if you've been tested for 'ROS1 fusion' - it may not have been tested yet",
  },

  kras: {
    title: "KRAS Mutation",
    whereToFind: [
      "Check molecular testing report",
      "Look for 'KRAS' in the mutations section",
      "Common mutations: G12C, G12D, G12V",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Genomic Profile Report",
    ],
    reportSection: "Point Mutations or Single Nucleotide Variants",
    example: "KRAS G12C mutation detected or KRAS: Wild-type (no mutation)",
    whoToAsk: "Ask about 'KRAS mutation status' from your genomic testing",
  },

  brca: {
    title: "BRCA1/BRCA2 Mutation",
    whereToFind: [
      "Check genetic testing report (this may be germline/hereditary testing)",
      "Look for 'BRCA1' or 'BRCA2'",
      "May be in 'tumor testing' or 'hereditary cancer panel'",
    ],
    documentNames: [
      "Genetic Test Results",
      "Hereditary Cancer Panel",
      "Germline Testing Report",
    ],
    reportSection: "Pathogenic Variants or Mutations Detected",
    example: "BRCA1: Pathogenic mutation detected or BRCA1/2: Negative",
    whoToAsk: "Ask if you've had 'BRCA testing' or 'hereditary cancer genetic testing'",
  },

  braf: {
    title: "BRAF Mutation",
    whereToFind: [
      "Check molecular testing or genomic profiling report",
      "Look for 'BRAF' in the mutations section",
      "Most common mutation: V600E",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Genomic Profile Report",
    ],
    reportSection: "Detected Mutations or Genomic Alterations",
    example: "BRAF V600E mutation detected or BRAF: Wild-type",
    whoToAsk: "Ask about 'BRAF mutation status' from your molecular testing",
  },

  met: {
    title: "MET Alteration",
    whereToFind: [
      "Check molecular testing report",
      "Look for 'MET amplification' or 'MET exon 14 skipping'",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Genomic Profile Report",
    ],
    reportSection: "Amplifications or Structural Alterations",
    example: "MET exon 14 skipping detected or MET: No alteration",
    whoToAsk: "Ask about 'MET testing' from your genomic profiling results",
  },

  ret: {
    title: "RET Fusion",
    whereToFind: [
      "Check molecular testing report",
      "Look for 'RET fusion' or 'RET rearrangement'",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Genomic Profile Report",
    ],
    reportSection: "Fusion Genes or Rearrangements",
    example: "RET fusion: Detected or RET: Negative",
    whoToAsk: "Ask if you've been tested for 'RET fusion'",
  },

  ntrk: {
    title: "NTRK Fusion",
    whereToFind: [
      "Check comprehensive genomic profiling report",
      "Look for 'NTRK1', 'NTRK2', or 'NTRK3' fusions",
      "Rare but tested in broad genomic panels",
    ],
    documentNames: [
      "Genomic Profile Report",
      "Comprehensive Biomarker Panel",
    ],
    reportSection: "Fusion Genes",
    example: "NTRK fusion: Detected or NTRK: No fusion identified",
    whoToAsk: "Ask if your genomic test included 'NTRK fusion testing'",
  },

  pik3ca: {
    title: "PIK3CA Mutation",
    whereToFind: [
      "Check molecular testing or tumor genomic report",
      "Look for 'PIK3CA' in the mutations section",
      "Common in ER-positive breast cancers",
    ],
    documentNames: [
      "Molecular Testing Report",
      "Tumor Genomic Profile",
    ],
    reportSection: "Detected Mutations",
    example: "PIK3CA H1047R mutation detected or PIK3CA: Wild-type",
    whoToAsk: "Ask about 'PIK3CA mutation testing' - important for treatment decisions",
  },

  esr1: {
    title: "ESR1 Mutation",
    whereToFind: [
      "Check liquid biopsy (blood test) or tumor molecular testing",
      "Look for 'ESR1' mutations",
      "Often detected after endocrine therapy resistance",
    ],
    documentNames: [
      "Liquid Biopsy Report",
      "Circulating Tumor DNA (ctDNA) Report",
      "Molecular Testing Report",
    ],
    reportSection: "Resistance Mutations or ctDNA Results",
    example: "ESR1 D538G mutation detected or ESR1: Wild-type",
    whoToAsk: "Ask if you've had 'liquid biopsy' or 'ESR1 mutation testing'",
  },
};
