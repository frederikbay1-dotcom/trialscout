import { Trial, EligibilityCriterion } from "@/types/oncology";
import { Check, HelpCircle, XCircle, AlertTriangle, Phone, Globe, MapPin, Star, Clock } from "lucide-react";

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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-500 text-sm font-medium">#{index + 1}</span>
            {getMatchConfidenceBadge(trial.matchConfidence)}
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

      {/* Why Matched */}
      {trial.whyMatched && trial.whyMatched.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 border border-green-100 rounded text-xs">
          <p className="font-medium text-green-800 mb-1">Why This Matched:</p>
          <ul className="list-disc list-inside text-green-700 space-y-0.5">
            {trial.whyMatched.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
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
