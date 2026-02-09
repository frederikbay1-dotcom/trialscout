import { motion } from "framer-motion";
import { FlaskConical, MapPin, Building2, ChevronRight, CheckCircle2, AlertTriangle, Database, Star, Info, Lightbulb, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trial } from "@/types/oncology";
import { MatchResult } from "@/lib/matchingEngine";
import { MedicalTermTooltip } from "@/components/MedicalTermTooltip";
import { MEDICAL_TERM_EXPLANATIONS } from "@/data/medicalTerms";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrialCardProps {
  trial: Trial;
  matchResult?: MatchResult;
  index: number;
  patientBiomarkers?: string[];
  showMismatchWarning?: boolean;
  onLearnMore: () => void;
  onDownloadBrief: () => void;
}

function getBadgeInfo(matchResult?: MatchResult, index: number = 0): {
  text: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
} {
  if (matchResult) {
    // Biomarker mismatch - use neutral language
    if (matchResult.biomarkerMatch === "doesnt_match") {
      return {
        text: "DIFFERENT REQUIREMENTS",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        icon: <Info className="w-4 h-4" />,
      };
    }

    // Likely not eligible - use softer language
    if (matchResult.eligibilityScore === "likely_not_eligible") {
      return {
        text: "MAY NOT MATCH",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: <Info className="w-3 h-3" />,
      };
    }

    // High confidence matches
    if (matchResult.matchConfidence === "high" && matchResult.matchScore >= 90) {
      return {
        text: index === 0 ? "BEST MATCH" : "STRONG MATCH",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        icon: <Star className="w-4 h-4" />,
      };
    }

    if (matchResult.matchConfidence === "high") {
      return {
        text: "STRONG MATCH",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        icon: <Star className="w-4 h-4" />,
      };
    }

    if (matchResult.matchConfidence === "medium") {
      return {
        text: "POSSIBLE MATCH",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: null,
      };
    }

    return {
      text: "NEEDS CONFIRMATION",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      icon: null,
    };
  }

  return {
    text: "POSSIBLY ELIGIBLE",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    icon: <Star className="w-4 h-4" />,
  };
}

function renderReasonWithTooltip(reason: string, idx: number) {
  const needsHER2Tooltip = reason.includes("HER2-low") || reason.includes("IHC 1+");
  const needsCDK46Tooltip = reason.includes("CDK4/6");
  const needsERTooltip = reason.includes("ER+") || reason.includes("ER-positive");

  return (
    <li key={idx} className="flex items-start gap-2 text-base text-gray-700">
      <span className="text-emerald-600 flex-shrink-0 mt-0.5">
        <CheckCircle2 className="w-4 h-4" />
      </span>
      <div className="flex-1">
        {needsHER2Tooltip ? (
          <span>
            Your cancer has{" "}
            <MedicalTermTooltip 
              term="HER2-low status"
              explanation={MEDICAL_TERM_EXPLANATIONS["HER2-low"]}
            />
            , which matches this trial's requirements
          </span>
        ) : needsCDK46Tooltip ? (
          <span>
            Patient received{" "}
            <MedicalTermTooltip 
              term="CDK4/6 inhibitor"
              explanation={MEDICAL_TERM_EXPLANATIONS["CDK4/6 inhibitor"]}
            />
            {" "}therapy as required
          </span>
        ) : needsERTooltip ? (
          <span>
            <MedicalTermTooltip 
              term="ER+ status"
              explanation={MEDICAL_TERM_EXPLANATIONS["ER+"]}
            />
            {" "}confirmed and matches trial criteria
          </span>
        ) : (
          <span>{reason}</span>
        )}
      </div>
    </li>
  );
}

export function TrialCard({ 
  trial, 
  matchResult,
  index, 
  patientBiomarkers = [],
  showMismatchWarning = false,
  onLearnMore, 
  onDownloadBrief 
}: TrialCardProps) {
  const matchScore = matchResult?.matchScore ?? 70;
  const isPossiblyEligible = matchResult 
    ? matchResult.eligibilityScore === "possibly_eligible" && matchResult.biomarkerMatch !== "doesnt_match"
    : trial.eligibilityScore === "possibly_eligible";
  
  const badge = getBadgeInfo(matchResult, index);
  
  const whyMatched = matchResult?.whyMatched ?? trial.whyMatched ?? [];
  const whyCantMatch = matchResult?.whyCantMatch ?? [];
  const whatToConfirm = matchResult?.whatToConfirm ?? trial.whatToConfirm ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 hover:shadow-lg transition-shadow"
    >
      {/* Header with match score and progress bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <span className="text-3xl font-bold text-gray-900">{matchScore}</span>
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm mb-2">Score Breakdown:</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Biomarker match:</span>
                      <span className="font-medium">{Math.round(matchScore * 0.4)}/40</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Treatment history:</span>
                      <span className="font-medium">{Math.round(matchScore * 0.3)}/30</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Disease stage:</span>
                      <span className="font-medium">{Math.round(matchScore * 0.2)}/20</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Practical factors:</span>
                      <span className="font-medium">{Math.round(matchScore * 0.1)}/10</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{matchScore}/100</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    Your doctor will verify full eligibility.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex-1">
            <span className="text-sm text-gray-500">/100 match</span>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isPossiblyEligible ? 'bg-emerald-500' : 'bg-blue-400'
                }`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>
        </div>
        <span className={`${badge.bgColor} ${badge.textColor} text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0`}>
          {badge.icon}
          {badge.text}
        </span>
      </div>

      {/* Title and metadata */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">{trial.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <FlaskConical className="w-4 h-4" />
            {trial.phase}
          </span>
          <span>•</span>
          <span className={trial.status === "recruiting" ? "text-emerald-600 font-medium" : "text-amber-600"}>
            {trial.status === "recruiting" ? "Actively Recruiting" : "Not Recruiting"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {trial.sponsor}
          </span>
        </div>
      </div>

      {/* In Plain English */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <h4 className="font-semibold text-blue-900">In Plain English</h4>
        </div>
        <p className="text-sm text-gray-700">
          {trial.translatedInfo.design}
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Goal:</strong> {trial.translatedInfo.goal}
        </p>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-base text-gray-700">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span>{trial.location}</span>
        {/* Site count removed - not available in new backend API */}
      </div>

      {/* Why You Match - with medical term tooltips */}
      {whyMatched.length > 0 && isPossiblyEligible && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Why You May Match:</h4>
          <ul className="space-y-1.5">
            {whyMatched.map((reason, i) => renderReasonWithTooltip(reason, i))}
          </ul>
        </div>
      )}

      {/* Why This May Not Match - softer styling */}
      {whyCantMatch.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Why This May Not Match:
          </h4>
          <ul className="space-y-1">
            {whyCantMatch.map((reason, i) => (
              <li key={i} className="text-base text-gray-700">• {reason}</li>
            ))}
          </ul>
          {matchResult?.eligibilityScore === "likely_not_eligible" && (
            <p className="mt-3 text-sm text-blue-800 font-medium">
              💡 Should you still ask about it? Discuss with your doctor if your staging is uncertain or you're considering different treatment approaches.
            </p>
          )}
        </div>
      )}

      {/* What You'll Do (Patient Burden) */}
      {trial.burden && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-2">What You'll Do:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Visit clinic {trial.burden.visitsPerMonth}x/month initially</li>
            <li>• {trial.burden.imagingFrequency || "Q6W"} imaging</li>
            <li>• {trial.burden.biopsyRequired ? "Biopsy required" : "No biopsy required"}</li>
            <li>• {trial.burden.hospitalDays ? "May require hospital stays" : "No overnight hospital stays"}</li>
          </ul>
        </div>
      )}

      {/* What to Confirm */}
      {whatToConfirm.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            What to Confirm with Your Doctor:
          </h4>
          <ul className="space-y-1">
            {whatToConfirm.map((item, i) => (
              <li key={i} className="text-base text-gray-700">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Biomarker mismatch warning (legacy - softened) */}
      {showMismatchWarning && whyCantMatch.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-blue-800">Different requirements: </span>
            <span className="text-blue-700">
              This trial may require biomarkers different from your profile. Discuss with your doctor.
            </span>
          </div>
        </div>
      )}

      {/* Data source */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          {trial.nctNumber}
        </span>
        <span>•</span>
        <span>Updated: {trial.last_updated || "Recently"}</span>
        {false && (
          <>
            <span>•</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Site verified
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={onLearnMore}
          className="w-full sm:flex-1 bg-blue-600 text-white hover:bg-blue-700 font-medium min-h-[48px] px-6 py-3 rounded-lg"
        >
          See Full Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          onClick={onDownloadBrief}
          variant="outline"
          className="w-full sm:w-auto px-6 py-3 min-h-[48px] border-2 border-gray-300 bg-white hover:bg-gray-50 font-medium rounded-lg"
        >
          Download Brief
        </Button>
      </div>
    </motion.div>
  );
}
