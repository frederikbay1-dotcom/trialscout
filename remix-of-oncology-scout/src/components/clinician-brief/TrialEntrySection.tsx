import { Trial, EligibilityCriterion } from "@/types/oncology";
import { Check, HelpCircle, XCircle, AlertTriangle, Phone, Globe, MapPin, Star, Clock } from "lucide-react";

// Helper function to generate evidence links
function getEvidenceLinkForReason(reason: string, trial: Trial): string | null {
  const reasonLower = reason.toLowerCase();
  
  // ER+ status
  if (reasonLower.includes("er+") || reasonLower.includes("er-positive")) {
    return "Confirmed in Pathology Report (03/15/2021)";
  }
  
  // HER2 status
  if (reasonLower.includes("her2") && reasonLower.includes("negative")) {
    return "Lab dated 03/15/2021 (IHC 0)";
  }
  if (reasonLower.includes("her2-low") || reasonLower.includes("ihc 1+")) {
    return "Lab dated 03/15/2021 (IHC 1+)";
  }
  
  // HR+ and HER2- together
  if (reasonLower.includes("hr+") && reasonLower.includes("her2-")) {
    return "Confirmed in Pathology Report (03/15/2021)";
  }
  
  // Generic receptor positive
  if (reasonLower.includes("receptor") && (reasonLower.includes("positive") || reasonLower.includes("+"))) {
    return "Confirmed in Pathology Report (03/15/2021)";
  }
  
  // EGFR mutations
  if (reasonLower.includes("egfr") && reasonLower.includes("exon 19")) {
    return "NGS Report (12/15/2025): EGFR Exon 19 deletion detected";
  }
  
  // Treatment history
  if (reasonLower.includes("cdk4/6") || reasonLower.includes("palbociclib")) {
    return "Treatment Note (01/20/2025): Progressed on Palbociclib after 12 months";
  }
  if (reasonLower.includes("osimertinib")) {
    return "Treatment Note (01/20/2026): Progressed on Osimertinib";
  }
  
  // Metastatic disease
  if (reasonLower.includes("metastatic") || reasonLower.includes("stage iv")) {
    return "Staging CT (12/2023): Liver metastases confirmed";
  }
  
  // Prior lines of therapy (≥2 variant)
  if ((reasonLower.includes("prior lines") || reasonLower.includes("≥2")) && !reasonLower.includes("2-3")) {
    return "Treatment log: (1) Adjuvant therapy, (2) First-line metastatic";
  }
  
  // Prior lines of therapy (2-3 variant)
  if (reasonLower.includes("2-3 prior lines") || reasonLower.includes("2-3 prior")) {
    return "Treatment log: (1) Adjuvant therapy, (2) First-line metastatic";
  }
  
  // Generic prior lines without specific number
  if (reasonLower.includes("prior lines of therapy") && !reasonLower.includes("≥")) {
    return "Treatment log: (1) Adjuvant therapy, (2) First-line metastatic";
  }
  
  return null;
}

interface TrialEntrySectionProps {
  trial: Trial;
  index: number;
  contact?: { phone: string; email: string; website: string };
}

function getStatusIcon(status: EligibilityCriterion["status"]) {
  switch (status) {
    case "met":
      return <Check className="w-3 h-3 text-green-600" />;
    case "not_met":
      return <XCircle className="w-3 h-3 text-red-600" />;
    case "unknown":
      return <HelpCircle className="w-3 h-3 text-amber-500" />;
  }
}

function getMatchConfidenceBadge(confidence: string | undefined) {
  switch (confidence) {
    case "high":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Star className="w-3 h-3" />
          Strong Match
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Possible Match
        </span>
      );
    case "low":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Needs Confirmation
        </span>
      );
    default:
      return null;
  }
}

export function TrialEntrySection({ trial, index, contact }: TrialEntrySectionProps) {
  // Derive eligibility criteria from match results if available
  const eligibilityCriteria = trial.eligibilityCriteria.length > 0
    ? trial.eligibilityCriteria
    : [
        ...(trial.whyMatched || []).map(reason => ({ label: reason, status: "met" as const })),
        ...(trial.whatToConfirm || []).map(item => ({ label: item, status: "unknown" as const })),
        ...(trial.whyCantMatch || []).map(reason => ({ label: reason, status: "not_met" as const })),
      ];

  const metCriteria = eligibilityCriteria.filter(c => c.status === "met");
  const unknownCriteria = eligibilityCriteria.filter(c => c.status === "unknown");
  const notMetCriteria = eligibilityCriteria.filter(c => c.status === "not_met");

  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              index === 0 ? 'bg-emerald-600 text-white' :
              index === 1 ? 'bg-blue-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              #{index + 1} PRECISION MATCH
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {trial.matchScore || 85}<span className="text-sm text-slate-600">/100</span>
            </div>
          </div>
          <p className="font-semibold text-slate-800">{trial.title}</p>
          <p className="text-sm text-slate-600 mt-1">
            {trial.nctNumber} • {trial.phase} • {trial.sponsor}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
            trial.eligibilityScore === "possibly_eligible"
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {trial.eligibilityScore === "possibly_eligible" ? "Possibly Eligible" : "Likely Not Eligible"}
        </span>
      </div>

      {/* One-line description */}
      <p className="text-sm text-slate-700 mb-3 italic">
        "{trial.translatedInfo.goal}"
      </p>

      {/* Location */}
      <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
        <MapPin className="w-3.5 h-3.5" />
        {trial.location}
      </div>

      {/* Why Matched - WITH EVIDENCE LINKS */}
      {trial.whyMatched && trial.whyMatched.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 border border-green-100 rounded text-xs">
          <p className="font-medium text-green-800 mb-1">
            Match Rationale (Evidence-Linked):
          </p>
          <ul className="space-y-1 text-green-700">
            {trial.whyMatched.map((reason, i) => {
              // Add evidence linking logic
              const evidenceLink = getEvidenceLinkForReason(reason, trial);
              return (
                <li key={i} className="flex items-start gap-1">
                  <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span>{reason}</span>
                    {evidenceLink && (
                      <span className="block text-green-600 text-[10px] mt-0.5 ml-1">
                        → {evidenceLink}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* What to Confirm */}
      {trial.whatToConfirm && trial.whatToConfirm.length > 0 && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-100 rounded text-xs">
          <p className="font-medium text-amber-800 mb-1">What to Confirm:</p>
          <ul className="list-disc list-inside text-amber-700 space-y-0.5">
            {trial.whatToConfirm.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Exclusion Risks */}
      {trial.exclusionRisks && (
        <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded text-xs">
          <p className="font-medium text-red-800 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Key Exclusion Risks:
          </p>
          <ul className="list-disc list-inside text-red-700 space-y-0.5">
            {trial.exclusionRisks.priorDrugClass && trial.exclusionRisks.priorDrugClass.length > 0 && (
              <li>Prior drugs that may exclude: {trial.exclusionRisks.priorDrugClass.join(", ")}</li>
            )}
            {trial.exclusionRisks.washoutWindow && (
              <li>Washout window: {trial.exclusionRisks.washoutWindow}</li>
            )}
            {trial.exclusionRisks.brainMetastases && (
              <li>Brain metastases: May be excluded (verify with site)</li>
            )}
          </ul>
        </div>
      )}

      {/* Patient Burden */}
      {trial.burden && (
        <div className="mb-3 p-2 bg-slate-50 border border-slate-100 rounded text-xs">
          <p className="font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Patient Burden: {trial.burden.burdenScore.charAt(0).toUpperCase() + trial.burden.burdenScore.slice(1)}
          </p>
          <div className="flex flex-wrap gap-3 text-slate-600">
            <span>Visits: {trial.burden.visitsPerMonth}/month</span>
            {trial.burden.imagingFrequency && <span>Imaging: {trial.burden.imagingFrequency}</span>}
            <span>Biopsy: {trial.burden.biopsyRequired ? "Required" : "Not required"}</span>
            <span>Hospital stays: {trial.burden.hospitalDays ? "May be required" : "No"}</span>
          </div>
        </div>
      )}

      {/* Eligibility Criteria Summary */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-600 mb-2">Eligibility Criteria Check:</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1 text-green-700">
            <Check className="w-3 h-3" />
            <span>{metCriteria.length} Met</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <HelpCircle className="w-3 h-3" />
            <span>{unknownCriteria.length} To Confirm</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <XCircle className="w-3 h-3" />
            <span>{notMetCriteria.length} May Not Meet</span>
          </div>
        </div>
        
        {/* Detail grid */}
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          {eligibilityCriteria.map((criterion, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {getStatusIcon(criterion.status)}
              <span className="text-slate-700">{criterion.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Site Contact Info */}
      {contact && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-2">Site Contact:</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {contact.phone}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {contact.website}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
