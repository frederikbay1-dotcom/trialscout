import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientData, Trial } from "@/types/oncology";
import { BiomarkerProfileSection } from "./clinician-brief/BiomarkerProfileSection";
import { TreatmentHistorySection } from "./clinician-brief/TreatmentHistorySection";
import { TrialEntrySection } from "./clinician-brief/TrialEntrySection";

interface ClinicianBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientData;
  matchedTrials: Trial[];
}

const DOCTOR_QUESTIONS = [
  "Based on my current health status, am I a good candidate for any of these clinical trials?",
  "What are the potential benefits and risks of participating in these studies compared to standard treatment?",
  "How might participating in a trial affect my current treatment plan?",
  "What is the time commitment required for trial participation (visits, tests, travel)?",
  "Are there any trials that might be more appropriate given my specific biomarkers or treatment history?",
  "What happens if I experience side effects during the trial?",
  "If I don't qualify for these trials, are there other options I should consider?",
  "How would trial participation affect my quality of life?",
];

// Site contact info mapped by trial ID patterns
const SITE_CONTACTS: Record<string, { phone: string; email: string; website: string }> = {
  "nsclc_trial_001": { phone: "(212) 639-2000", email: "clinicaltrials@mskcc.org", website: "www.mskcc.org" },
  "nsclc_trial_002": { phone: "(212) 263-6485", email: "trials@nyulangone.org", website: "nyulangone.org" },
  "nsclc_trial_003": { phone: "(212) 746-2100", email: "trials@weillcornell.org", website: "weillcornell.org" },
  "nsclc_trial_004": { phone: "(212) 241-6500", email: "trials@mountsinai.org", website: "mountsinai.org" },
  "nsclc_trial_005": { phone: "(212) 639-2000", email: "clinicaltrials@mskcc.org", website: "www.mskcc.org" },
  "nsclc_trial_006": { phone: "(212) 639-2000", email: "clinicaltrials@mskcc.org", website: "www.mskcc.org" },
  "nsclc_trial_007": { phone: "(212) 263-6485", email: "trials@nyulangone.org", website: "nyulangone.org" },
  "bc_trial_001": { phone: "(212) 305-5000", email: "trials@cumc.columbia.edu", website: "cumc.columbia.edu" },
  "bc_trial_002": { phone: "(212) 639-2000", email: "clinicaltrials@mskcc.org", website: "www.mskcc.org" },
  "bc_trial_003": { phone: "(212) 263-6485", email: "trials@nyulangone.org", website: "nyulangone.org" },
  "bc_trial_004": { phone: "(212) 746-2100", email: "trials@weillcornell.org", website: "weillcornell.org" },
  "bc_trial_005": { phone: "(212) 263-6485", email: "trials@nyulangone.org", website: "nyulangone.org" },
  "bc_trial_006": { phone: "(212) 305-5000", email: "trials@cumc.columbia.edu", website: "cumc.columbia.edu" },
  "bc_trial_007": { phone: "(212) 241-6500", email: "trials@mountsinai.org", website: "mountsinai.org" },
};

function getECOGLabel(ecog: number | null, unknown: boolean): string {
  if (unknown) return "Unknown (patient unsure)";
  if (ecog === null) return "Not provided";
  return `ECOG ${ecog} - ${getECOGDescription(ecog)}`;
}

function getECOGDescription(ecog: number): string {
  switch (ecog) {
    case 0: return "Fully active";
    case 1: return "Ambulatory, capable of light work";
    case 2: return "Ambulatory >50%, self-care capable";
    case 3: return "Limited self-care, confined >50%";
    case 4: return "Completely disabled";
    default: return "";
  }
}

function getOrganStatus(value: string) {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "Unknown";
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

  // Separate trials using the EXACT same logic as TrialCard.tsx getBadgeInfo()
  // Updated to show all trial categories in separate sections
  const allPossiblyEligible = matchedTrials.filter(t => t.eligibilityScore === "possibly_eligible");
  
  // "POSSIBLE MATCH" = medium confidence (lines 71-78 in TrialCard.tsx)
  const possibleMatches = allPossiblyEligible
    .filter(t => t.matchConfidence === "medium")
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  // "NEEDS CONFIRMATION" = low confidence or undefined (lines 80-85 in TrialCard.tsx)
  const needsConfirmation = allPossiblyEligible
    .filter(t => t.matchConfidence !== "high" && t.matchConfidence !== "medium")
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  // "STRONG MATCH" / "BEST MATCH" = high confidence (lines 52-68 in TrialCard.tsx)
  const strongMatches = allPossiblyEligible
    .filter(t => t.matchConfidence === "high")
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  const likelyNotEligible = matchedTrials.filter(t => t.eligibilityScore === "likely_not_eligible");

  // Get top 3 for executive summary (from strong matches first, then possible matches)
  const topTrials = [...strongMatches, ...possibleMatches].slice(0, 3);

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
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden print-document-container"
        >
          {/* Modal Header (not printed) */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden no-print">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
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

          {/* Document Content */}
          <div className="p-8 overflow-y-auto max-h-[75vh] print:max-h-none print:overflow-visible print:p-0">
            <div className="document-formal max-w-none">
              {/* Letterhead */}
              <div className="text-center border-b border-slate-300 pb-6 mb-6">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Oncology Scout
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Clinical Trial Matching Report
                </p>
              </div>

              {/* Date and Reference */}
              <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <p className="text-slate-600">Date: {currentDate}</p>
                  <p className="text-slate-600">
                    Reference: OS-{Date.now().toString(36).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">CONFIDENTIAL</p>
                  <p className="text-slate-600">Patient Clinical Summary</p>
                </div>
              </div>

              {/* Executive Summary */}
              <section className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">Executive Summary</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-slate-700">
                    {strongMatches.length > 0 && (
                      <><strong>{strongMatches.length} Strong Match{strongMatches.length !== 1 ? "es" : ""}</strong></>
                    )}
                    {strongMatches.length > 0 && possibleMatches.length > 0 && <span> + </span>}
                    {possibleMatches.length > 0 && (
                      <><strong>{possibleMatches.length} Possible Match{possibleMatches.length !== 1 ? "es" : ""}</strong></>
                    )}
                    {(strongMatches.length > 0 || possibleMatches.length > 0) && needsConfirmation.length > 0 && (
                      <span className="text-slate-600"> + {needsConfirmation.length} needing confirmation</span>
                    )}
                    {needsConfirmation.length > 0 && strongMatches.length === 0 && possibleMatches.length === 0 && (
                      <><strong>{needsConfirmation.length} Trial{needsConfirmation.length !== 1 ? "s" : ""} Needing Confirmation</strong></>
                    )}
                    {likelyNotEligible.length > 0 && (
                      <span className="text-slate-500"> ({likelyNotEligible.length} additional trials may not match)</span>
                    )}
                  </p>
                  {topTrials.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                      {topTrials.map((trial) => (
                        <li key={trial.id} className="text-slate-800">
                          <span className="font-semibold">{trial.title}</span>
                          <span className="text-slate-600 block pl-5 text-xs mt-0.5">
                            Match confidence: {trial.matchConfidence || "Medium"}. 
                            {trial.burden && ` ${trial.burden.burdenScore} patient burden.`}
                            {trial.whyMatched && trial.whyMatched.length > 0 && ` ${trial.whyMatched[0]}.`}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-slate-600 italic">No trials with "Possibly Eligible" status found.</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    * All matches require verification by the trial site coordinator
                  </p>
                </div>
              </section>

              {/* Patient Demographics */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Patient Demographics
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Age</p>
                    <p className="font-medium text-slate-800">
                      {patientData.age ? `${patientData.age} years` : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Sex</p>
                    <p className="font-medium text-slate-800 capitalize">
                      {patientData.sex || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Primary Diagnosis</p>
                    <p className="font-medium text-slate-800">
                      {patientData.cancerType === "breast"
                        ? "Breast Cancer"
                        : patientData.cancerType === "lung"
                        ? "Non-Small Cell Lung Cancer (NSCLC)"
                        : "Not specified"}
                      {patientData.cancerStage && ` - Stage ${patientData.cancerStage}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">ECOG Performance Status</p>
                    <p className="font-medium text-slate-800">
                      {getECOGLabel(patientData.ecogStatus, patientData.ecogUnknown)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Biomarker Profile - NEW detailed section */}
              <BiomarkerProfileSection patientData={patientData} />

              {/* Treatment History - NEW detailed section */}
              <TreatmentHistorySection patientData={patientData} />

              {/* Organ Function */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Clinical Status
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Liver/Kidney Dysfunction</span>
                    <span className={`font-medium ${
                      patientData.organFunction.liverKidneyIssues === "yes" 
                        ? "text-red-700" 
                        : patientData.organFunction.liverKidneyIssues === "no" 
                          ? "text-green-700" 
                          : "text-amber-600"
                    }`}>
                      {getOrganStatus(patientData.organFunction.liverKidneyIssues)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Brain Metastases</span>
                    <span className={`font-medium ${
                      patientData.organFunction.brainMetastases === "yes" 
                        ? "text-red-700" 
                        : patientData.organFunction.brainMetastases === "no" 
                          ? "text-green-700" 
                          : "text-amber-600"
                    }`}>
                      {getOrganStatus(patientData.organFunction.brainMetastases)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Other Active Cancers</span>
                    <span className={`font-medium ${
                      patientData.organFunction.otherActiveCancers === "yes" 
                        ? "text-red-700" 
                        : patientData.organFunction.otherActiveCancers === "no" 
                          ? "text-green-700" 
                          : "text-amber-600"
                    }`}>
                      {getOrganStatus(patientData.organFunction.otherActiveCancers)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Travel Preferences */}
              {(patientData.zipCode || patientData.maxTravelDistance) && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                    Location & Travel
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">ZIP Code</p>
                      <p className="font-medium text-slate-800">
                        {patientData.zipCode || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Max Travel Distance</p>
                      <p className="font-medium text-slate-800">
                        {patientData.maxTravelDistance
                          ? `${patientData.maxTravelDistance} miles`
                          : "Any distance"}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Strong Match Trials */}
              {strongMatches.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-emerald-300 pb-2">
                    Strong Match Trials ({strongMatches.length})
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    These trials have high confidence matches based on your profile.
                  </p>
                  <div className="space-y-4">
                    {strongMatches.map((trial, index) => (
                      <TrialEntrySection
                        key={trial.id}
                        trial={trial}
                        index={index}
                        contact={SITE_CONTACTS[trial.id]}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Possible Match Trials */}
              {possibleMatches.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-blue-300 pb-2">
                    Possible Match Trials ({possibleMatches.length})
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    These trials have medium confidence matches. Review carefully with your oncologist.
                  </p>
                  <div className="space-y-4">
                    {possibleMatches.map((trial, index) => (
                      <TrialEntrySection
                        key={trial.id}
                        trial={trial}
                        index={strongMatches.length + index}
                        contact={SITE_CONTACTS[trial.id]}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Trials Needing Confirmation */}
              {needsConfirmation.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-amber-300 pb-2">
                    Trials Needing Confirmation ({needsConfirmation.length})
                  </h2>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <p className="text-sm text-amber-900">
                      <strong>⚠️ Important:</strong> These trials require additional verification with your oncologist.
                      They have lower confidence matches or need more information to determine eligibility.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {needsConfirmation.map((trial, index) => (
                      <TrialEntrySection
                        key={trial.id}
                        trial={trial}
                        index={strongMatches.length + possibleMatches.length + index}
                        contact={SITE_CONTACTS[trial.id]}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Likely Not Eligible Trials */}
              {likelyNotEligible.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                    Other Trials (May Not Match) ({likelyNotEligible.length})
                  </h2>
                  <p className="text-sm text-slate-600 mb-4 italic">
                    These trials have eligibility concerns but may still be worth discussing with the oncologist.
                  </p>
                  <div className="space-y-4 opacity-80">
                    {likelyNotEligible.map((trial, index) => (
                      <TrialEntrySection
                        key={trial.id}
                        trial={trial}
                        index={strongMatches.length + possibleMatches.length + needsConfirmation.length + index}
                        contact={SITE_CONTACTS[trial.id]}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Questions for Your Doctor */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Questions to Ask Your Doctor
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-800">
                  {DOCTOR_QUESTIONS.map((question, index) => (
                    <li key={index} className="pl-2">
                      {question}
                    </li>
                  ))}
                </ol>
              </section>

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-slate-300 text-center text-xs text-slate-500">
                <p>
                  This report is generated for informational purposes only and does not
                  constitute medical advice.
                </p>
                <p className="mt-1">
                  Clinical trial eligibility should be verified with the study team.
                </p>
                <p className="mt-2 text-slate-400">
                  Report generated: {currentDate} | Data freshness: Within 7 days
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
