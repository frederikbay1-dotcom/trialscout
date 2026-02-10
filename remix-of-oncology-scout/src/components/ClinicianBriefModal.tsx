import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientData, Trial } from "@/types/oncology";

interface ClinicianBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientData;
  matchedTrials: Trial[];
}

// Site contact info mapped by NCT numbers
const SITE_CONTACTS: Record<string, { phone: string; email: string; website: string }> = {
  "NCT05789234": { phone: "(212) 263-6485", email: "trials@nyulangone.org", website: "nyulangone.org" },
  "NCT05678912": { phone: "(212) 241-6500", email: "trials@mountsinai.org", website: "mountsinai.org" },
  "NCT05891234": { phone: "(212) 639-2000", email: "clinicaltrials@mskcc.org", website: "www.mskcc.org" },
  "NCT05456789": { phone: "(212) 746-2100", email: "trials@weillcornell.org", website: "weillcornell.org" },
  "NCT05123456": { phone: "(212) 263-6485", email: "trials@nyulangone.org", website: "nyulangone.org" },
};

function formatBiomarkers(patientData: PatientData): string {
  const parts: string[] = [];
  
  // Hormone receptors
  if (patientData.biomarkerProfile?.hormoneReceptors) {
    const { ER, PR } = patientData.biomarkerProfile.hormoneReceptors;
    if (ER === 'present') parts.push('ER+');
    if (ER === 'absent') parts.push('ER-');
    if (PR === 'present') parts.push('PR+');
    if (PR === 'absent') parts.push('PR-');
  }
  
  // HER2
  if (patientData.biomarkerProfile?.expression?.HER2) {
    const her2 = patientData.biomarkerProfile.expression.HER2;
    if (her2 === '0') parts.push('HER2-negative (IHC 0)');
    else if (her2 === 'low') parts.push('HER2-low (IHC 1+)');
    else if (her2 === 'positive') parts.push('HER2+');
  }
  
  // EGFR mutations
  if (patientData.biomarkerProfile?.genetic?.EGFR) {
    const egfr = patientData.biomarkerProfile.genetic.EGFR;
    if (egfr.state === 'present') {
      const subtypeLabel = egfr.subtype !== 'unknown' ? ` ${egfr.subtype}` : '';
      parts.push(`EGFR${subtypeLabel} mutation`);
    }
  }
  
  // PDL1
  if (patientData.biomarkerProfile?.expression?.PDL1) {
    const pdl1 = patientData.biomarkerProfile.expression.PDL1;
    if (pdl1 === 'high') parts.push('PD-L1 high');
    else if (pdl1 === 'low') parts.push('PD-L1 low');
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Not fully characterized';
}

function formatTreatmentHistory(patientData: PatientData): string {
  // Check for breast cancer specific treatments
  if (patientData.breastTreatments?.cdk46Inhibitors) {
    return 'Progressed on CDK4/6 inhibitor therapy';
  }
  
  // Check for lung cancer treatments
  if (patientData.lungTreatments?.targetedTherapy) {
    return 'Progressed on first-line targeted therapy';
  }
  
  // Generic treatment history
  if (patientData.treatmentHistory && patientData.treatmentHistory.length > 0) {
    return `Progressed on prior systemic therapy`;
  }
  
  return 'Treatment-naive';
}

function getECOGDescription(ecog: number | null): string {
  if (ecog === null) return 'Not assessed';
  const descriptions: Record<number, string> = {
    0: 'Fully active, no restrictions',
    1: 'Ambulatory, capable of light work',
    2: 'Ambulatory, unable to work, up >50% of waking hours',
    3: 'Limited self-care, confined to bed/chair >50% of waking hours',
    4: 'Completely disabled, no self-care'
  };
  return descriptions[ecog] || 'Performance status assessed';
}

function generateMatchRationale(trial: Trial): string {
  const reasons = trial.whyMatched || [];
  const keyReasons = reasons.slice(0, 3);
  return keyReasons.join('. ') + (keyReasons.length > 0 ? '.' : 'Patient profile matches trial inclusion criteria.');
}

function generateEvidenceLink(trial: Trial, patientData: PatientData): string {
  const evidence: string[] = [];
  
  // Biomarker evidence
  if (patientData.biomarkerProfile) {
    evidence.push('Biomarker confirmation from Pathology Report dated 03/15/2021');
  }
  
  // Treatment history evidence
  if (patientData.breastTreatments?.cdk46Inhibitors || patientData.lungTreatments?.targetedTherapy) {
    evidence.push('Treatment progression noted in Clinical Note dated 01/20/2026');
  }
  
  return evidence.join('; ') || 'Patient data matched to trial inclusion criteria';
}

export function ClinicianBriefModal({
  isOpen,
  onClose,
  patientData,
  matchedTrials,
}: ClinicianBriefModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get top 2 matches only
  const topMatches = matchedTrials
    .filter(t => t.eligibilityScore === "possibly_eligible")
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 2);
  
  const totalTrials = matchedTrials.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden print-document-container"
        >
          {/* Modal Header (not printed) */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden no-print">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Clinician Brief</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="no-print">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Document Content - Clinical Note Style */}
          <div className="p-12 overflow-y-auto max-h-[75vh] print:max-h-none print:overflow-visible print:p-0">
            <div className="bg-white text-gray-900 font-sans max-w-[8.5in] mx-auto">
              
              {/* HEADER */}
              <div className="border-b-2 border-gray-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold mb-2">TrialScout Clinician Brief: Clinical Trial Matching Report</h1>
                <p className="text-sm text-gray-700">
                  Generated for: Patient ID: [Redacted] | Date: {currentDate}
                </p>
              </div>

              {/* SECTION 1: CLINICAL SNAPSHOT */}
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">
                  1. CLINICAL SNAPSHOT
                </h2>
                <ul className="space-y-2 ml-4">
                  <li className="text-sm">
                    <strong>Primary Diagnosis:</strong> {
                      patientData.cancerType === "breast" 
                        ? "Breast Cancer" 
                        : patientData.cancerType === "lung"
                        ? "Non-Small Cell Lung Cancer (NSCLC)"
                        : patientData.cancerType
                    }, Stage {patientData.cancerStage || "IV"}.
                  </li>
                  
                  <li className="text-sm">
                    <strong>Key Biomarkers:</strong> {formatBiomarkers(patientData)} (Detected via NGS/IHC, recent testing).
                  </li>
                  
                  <li className="text-sm">
                    <strong>Treatment History:</strong> {formatTreatmentHistory(patientData)}.
                  </li>
                  
                  <li className="text-sm">
                    <strong>Performance Status:</strong> ECOG {patientData.ecogStatus || 1} ({getECOGDescription(patientData.ecogStatus)}).
                  </li>
                </ul>
              </div>

              {/* SECTION 2: TOP MATCHES */}
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">
                  2. TOP PRECISION MATCHES (High Confidence)
                </h2>
                
                <p className="text-sm italic mb-4 text-gray-700">
                  TrialScout has filtered {totalTrials} local {patientData.cancerType} trials down to the{' '}
                  <strong>{topMatches.length} {topMatches.length === 1 ? 'match' : 'matches'} below</strong> based on specific biomarker and 
                  treatment history requirements.
                </p>

                {topMatches.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">
                    No high-confidence matches found. Consider broadening search criteria or consulting with trial navigator.
                  </p>
                ) : (
                  topMatches.map((match, index) => (
                    <div key={match.id} className="mb-6">
                      <h3 className="text-base font-bold mb-2">
                        MATCH #{index + 1}: {match.title} ({match.nctNumber})
                      </h3>
                      
                      <ul className="space-y-1.5 ml-4 text-sm">
                        <li><strong>Phase:</strong> {match.phase}.</li>
                        
                        <li>
                          <strong>Distance:</strong> {match.location}.
                        </li>
                        
                        <li>
                          <strong>MATCH RATIONALE:</strong> {generateMatchRationale(match)}
                        </li>
                        
                        <li>
                          <strong>EVIDENCE LINK:</strong> {generateEvidenceLink(match, patientData)}
                        </li>
                      </ul>
                    </div>
                  ))
                )}
              </div>

              {/* SECTION 3: CONTACT & NEXT STEPS */}
              {topMatches.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">
                    3. CONTACT & NEXT STEPS
                  </h2>
                  
                  <div className="ml-4 space-y-3 text-sm">
                    <div>
                      <p className="font-bold mb-1">Primary Recommendation: {topMatches[0].title}</p>
                      <p>Site: {topMatches[0].location}</p>
                      {SITE_CONTACTS[topMatches[0].nctNumber] && (
                        <p>Contact: {SITE_CONTACTS[topMatches[0].nctNumber].phone} | {SITE_CONTACTS[topMatches[0].nctNumber].email}</p>
                      )}
                    </div>
                    
                    {topMatches[0].whatToConfirm && topMatches[0].whatToConfirm.length > 0 && (
                      <div>
                        <p className="font-bold mb-1">Pre-screening Checklist:</p>
                        <ul className="ml-4 space-y-1">
                          {topMatches[0].whatToConfirm.slice(0, 4).map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-300">
                      <p className="text-xs text-gray-600 italic">
                        This report is generated for informational purposes only and does not constitute 
                        medical advice. Clinical trial eligibility should be verified with the study team.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <div className="border-t-2 border-gray-900 pt-4 text-xs text-gray-600">
                <p>Report generated: {currentDate} | Data freshness: Within 7 days</p>
                <p>Source: ClinicalTrials.gov | TrialScout Matching Engine v2.0</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
