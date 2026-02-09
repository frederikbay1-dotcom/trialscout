import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp, Database, Download, Info, RefreshCw, Mail, Clipboard, Shield, Layout, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrialCard } from "@/components/TrialCard";
import { LearnMoreModal } from "@/components/LearnMoreModal";
import { ClinicianBriefModal } from "@/components/ClinicianBriefModal";
import { InlineProgressBar } from "@/components/InlineProgressBar";
import { PatientData, Trial } from "@/types/oncology";
import { Checkbox as CheckboxUI } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTrialMatching } from "@/hooks/useTrialMatching";
import { useProfileChangeDetection } from "@/hooks/useProfileChangeDetection";
import type { MatchedTrial as APIMatchedTrial } from "@/types/api";

interface ResultsStepProps {
  patientData: PatientData;
  onReset: () => void;
}

export function ResultsStep({ patientData, onReset }: ResultsStepProps) {
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showOtherTrials, setShowOtherTrials] = useState(false);
  const [acknowledgedMismatch, setAcknowledgedMismatch] = useState(false);
  
  const { hasProfileChanges, isRematching, confirmReMatch, resetDetection } = useProfileChangeDetection(patientData);
  
  // Use backend API for trial matching
  const {
    matchedTrials,
    possiblyEligibleCount,
    totalTrialsEvaluated,
    isLoading,
    isError,
    error,
    rematch,
  } = useTrialMatching(patientData, {
    enabled: patientData.cancerType !== null,
  });
  
  useEffect(() => {
    resetDetection();
  }, [resetDetection]);

  // Transform API trials to frontend Trial format
  const transformAPITrial = (apiTrial: APIMatchedTrial): Trial => ({
    id: apiTrial.trial.nct_number,
    nctNumber: apiTrial.trial.nct_number,
    title: apiTrial.trial.title,
    phase: apiTrial.trial.phase || "Unknown",
    eligibilityScore: "possibly_eligible",
    sponsor: apiTrial.trial.sponsor || "Unknown",
    location: apiTrial.trial.location || "Multiple locations",
    summary: "",
    eligibilityCriteria: [],
    translatedInfo: {
      design: apiTrial.trial.translated_info?.design || "This trial is evaluating a new treatment approach.",
      goal: apiTrial.trial.translated_info?.goal || "To evaluate the safety and efficacy of the investigational treatment",
      whatHappens: apiTrial.trial.translated_info?.what_happens || "You will receive the study treatment and undergo regular monitoring",
      duration: apiTrial.trial.translated_info?.duration || "Treatment continues until progression or unacceptable toxicity",
    },
    matchConfidence: apiTrial.confidence,
    matchScore: apiTrial.score,
    biomarkerMatch: "matches",
    whyMatched: apiTrial.why_matched || [],
    whyCantMatch: [],
    whatToConfirm: apiTrial.what_to_confirm || [],
    status: apiTrial.trial.status,
    last_updated: apiTrial.trial.last_updated,
    burden: {
      visitsPerMonth: apiTrial.trial.burden?.visits_per_month || 2,
      biopsyRequired: apiTrial.trial.burden?.biopsy_required || false,
      hospitalDays: apiTrial.trial.burden?.hospital_stays || false,
      imagingFrequency: apiTrial.trial.burden?.imaging_frequency || "Every 6-8 weeks",
      burdenScore: "medium",
    },
  });

  const eligibleTrials = useMemo(() => {
    return matchedTrials
      .filter(trial => trial.confidence !== "low")
      .sort((a, b) => {
        const confidenceOrder = { high: 0, medium: 1, low: 2 };
        const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
        if (confDiff !== 0) return confDiff;
        return b.score - a.score;
      })
      .map(transformAPITrial);
  }, [matchedTrials]);

  const otherTrials = useMemo(() => {
    return matchedTrials
      .filter(trial => trial.confidence === "low")
      .sort((a, b) => b.score - a.score)
      .map(transformAPITrial);
  }, [matchedTrials]);

  const eligibleCount = possiblyEligibleCount;
  // Pass ALL trials to the brief modal (both eligible and other trials)
  const matchedTrialsForBrief = [...eligibleTrials, ...otherTrials];

  // Handle profile changes
  const handleRematch = async () => {
    await rematch(patientData);
    confirmReMatch();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center pb-32">
        <InlineProgressBar currentStep={3} totalSteps={3} stepLabel="Your Matches" />
        <div className="flex flex-col items-center gap-4 mt-12">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-lg text-gray-700">Finding matching trials...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col justify-start pb-32">
        <InlineProgressBar currentStep={3} totalSteps={3} stepLabel="Your Matches" />
        <div className="py-8 px-4">
          <div className="container max-w-3xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Unable to Load Trial Matches
                  </h3>
                  <p className="text-red-800 mb-4">
                    {error?.message || "We encountered an error while searching for matching trials. Please try again."}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => rematch(patientData)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={onReset}
                      variant="outline"
                      className="border-red-300"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-start pb-32">
      <InlineProgressBar currentStep={3} totalSteps={3} stepLabel="Your Matches" />

      {/* Privacy Reminder */}
      <div className="px-4 mt-4">
        <div className="container max-w-3xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-900 font-semibold mb-1">
                  🔒 Your Privacy is Protected
                </p>
                <p className="text-green-800">
                  Your search results are generated locally in your browser. We don't store or 
                  transmit your medical information. This data will be automatically cleared when 
                  you close this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-4">
        <div className="container max-w-3xl mx-auto space-y-6">
          {/* Encouragement Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {eligibleCount > 0 
                ? `We found ${eligibleCount} trial${eligibleCount > 1 ? 's' : ''} that may match your profile`
                : "We didn't find trials that exactly match your profile"
              }
            </h2>
            {eligibleCount > 0 && (
              <p className="text-gray-700 mb-4 text-base leading-relaxed">
                Each offers a different treatment approach that your doctor can help you evaluate.
              </p>
            )}
            <Button 
              onClick={() => setShowBriefModal(true)}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 font-medium min-h-[48px] px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report for Your Doctor
            </Button>
          </motion.div>

          {/* Important Disclaimer Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-900">
                  <strong>Important:</strong> These are preliminary matches only. Your doctor must confirm 
                  eligibility and determine if a trial is appropriate for you. This tool does not provide 
                  medical advice or guarantee enrollment.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Match Score Legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-6"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Understanding Your Match Scores
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-20 h-9 bg-green-100 border-2 border-green-400 rounded flex items-center justify-center font-bold text-green-800 text-sm flex-shrink-0">
                  95-100
                </div>
                <div>
                  <div className="font-semibold text-sm">Strong Potential Match</div>
                  <div className="text-sm text-gray-600">
                    You appear to meet most initial requirements. High likelihood of eligibility pending verification.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-20 h-9 bg-yellow-100 border-2 border-yellow-400 rounded flex items-center justify-center font-bold text-yellow-800 text-sm flex-shrink-0">
                  80-94
                </div>
                <div>
                  <div className="font-semibold text-sm">Good Potential Match</div>
                  <div className="text-sm text-gray-600">
                    You meet key criteria. Some items need confirmation with your doctor.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-20 h-9 bg-orange-100 border-2 border-orange-400 rounded flex items-center justify-center font-bold text-orange-800 text-sm flex-shrink-0">
                  65-79
                </div>
                <div>
                  <div className="font-semibold text-sm">Possible Match</div>
                  <div className="text-sm text-gray-600">
                    You match some criteria. Discuss with your doctor about potential exceptions.
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <strong>Note:</strong> Match scores are preliminary only. Trial coordinators make final eligibility 
              determinations. Your doctor should review these results with you.
            </div>
          </motion.div>

          {/* Profile Updated Alert */}
          <AnimatePresence>
            {hasProfileChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Profile Updated</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        You've made changes that may affect your trial matches.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRematch}
                    disabled={isRematching || isLoading}
                    className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 min-h-[44px] px-5 font-medium"
                  >
                    {isRematching || isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Matches
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions Bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {eligibleCount} Possibly Eligible
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  {totalTrialsEvaluated} Total Evaluated
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 min-h-[44px] border-gray-300">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={onReset} className="flex-1 sm:flex-none gap-2 min-h-[44px] border-gray-300">
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    let key = 'her2_low';
                    if (patientData.biomarkerProfile?.expression?.HER2 === 'low') key = 'her2_low';
                    else if (patientData.breastTreatments?.cdk46Inhibitors === true) key = 'post_cdk46';
                    else if (patientData.cancerType === 'lung') key = 'egfr';
                    else if (
                      patientData.biomarkerProfile?.hormoneReceptors?.ER === 'absent' &&
                      patientData.biomarkerProfile?.hormoneReceptors?.PR === 'absent' &&
                      patientData.biomarkerProfile?.expression?.HER2 === '0'
                    ) key = 'tnbc';
                    window.open(`/walkthrough?patient=${key}`, '_blank');
                  }}
                  className="flex-1 sm:flex-none gap-2 min-h-[44px] border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700"
                >
                  <Layout className="w-4 h-4" />
                  Walkthrough
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State for no possibly eligible trials */}
          {eligibleCount === 0 && otherTrials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-8 text-center"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                We didn't find trials that exactly match your current profile
              </h3>
              <p className="text-gray-600 mb-6">
                This doesn't mean there aren't options. Here's what you can do:
              </p>
              <div className="space-y-3 max-w-sm mx-auto">
                <Button 
                  onClick={() => setShowOtherTrials(true)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 min-h-[48px]"
                >
                  View {otherTrials.length} trials that are close matches
                </Button>
                <Button 
                  onClick={() => setShowBriefModal(true)}
                  variant="outline"
                  className="w-full border-2 border-gray-300 min-h-[48px]"
                >
                  Download results to discuss with your doctor
                </Button>
                <a href="#" className="block text-blue-600 hover:underline text-sm mt-2">
                  Contact a clinical trial navigator
                </a>
              </div>
            </motion.div>
          )}

          {/* Matched Trial Cards */}
          <div className="space-y-6">
            {eligibleTrials.map((trial, index) => (
              <TrialCard
                key={trial.id}
                trial={trial}
                matchResult={{
                  trial,
                  matchScore: trial.matchScore || 0,
                  matchConfidence: trial.matchConfidence || "medium",
                  eligibilityScore: trial.eligibilityScore,
                  biomarkerMatch: trial.biomarkerMatch || "unknown",
                  whyMatched: trial.whyMatched || [],
                  whyCantMatch: trial.whyCantMatch || [],
                  whatToConfirm: trial.whatToConfirm || [],
                }}
                index={index}
                patientBiomarkers={patientData.biomarkers}
                onLearnMore={() => setSelectedTrial(trial)}
                onDownloadBrief={() => setShowBriefModal(true)}
              />
            ))}
          </div>

          {/* Complete Empty State */}
          {eligibleCount === 0 && otherTrials.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                We didn't find trials that exactly match your current profile
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                This doesn't mean there aren't options. Here's what you can do:
              </p>
              <div className="space-y-3 max-w-sm mx-auto">
                <Button 
                  onClick={() => setShowBriefModal(true)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 min-h-[48px]"
                >
                  Download results to discuss with your doctor
                </Button>
                <Button onClick={onReset} variant="outline" className="w-full border-2 border-gray-300 min-h-[48px]">
                  Adjust your profile and try again
                </Button>
                <a href="#" className="block text-blue-600 hover:underline text-sm mt-2">
                  Contact a clinical trial navigator
                </a>
              </div>
            </div>
          )}

          {/* Other Trials Section */}
          {otherTrials.length > 0 && (
            <div className="mt-12">
              <button
                onClick={() => setShowOtherTrials(!showOtherTrials)}
                className="w-full text-left"
              >
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:bg-blue-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Other Trials for Your Consideration ({otherTrials.length})
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        These trials don't appear to match your profile based on the information provided. 
                        However, we're showing them because trial criteria sometimes have exceptions, and 
                        your doctor may have additional information.
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        Always discuss these with your doctor before dismissing them completely.
                      </p>
                    </div>
                    <ChevronDown 
                      className={`w-6 h-6 text-blue-600 transition-transform flex-shrink-0 ml-4 ${
                        showOtherTrials ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </div>
              </button>
              
              {showOtherTrials && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-6"
                >
                  {!acknowledgedMismatch && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckboxUI
                          id="acknowledge-mismatch"
                          checked={acknowledgedMismatch}
                          onCheckedChange={(checked) => setAcknowledgedMismatch(checked as boolean)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor="acknowledge-mismatch" 
                            className="text-base font-medium text-blue-800 cursor-pointer"
                          >
                            I understand these may not match my profile
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            These trials may require different biomarkers or criteria. 
                            They may still be relevant if your testing is incomplete or results are pending.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {acknowledgedMismatch && (
                    <div className="space-y-6 opacity-75">
                      {otherTrials.map((trial, index) => (
                        <TrialCard
                          key={trial.id}
                          trial={trial}
                          matchResult={{
                            trial,
                            matchScore: trial.matchScore || 0,
                            matchConfidence: trial.matchConfidence || "low",
                            eligibilityScore: trial.eligibilityScore,
                            biomarkerMatch: trial.biomarkerMatch || "doesnt_match",
                            whyMatched: trial.whyMatched || [],
                            whyCantMatch: trial.whyCantMatch || [],
                            whatToConfirm: trial.whatToConfirm || [],
                          }}
                          index={index}
                          patientBiomarkers={patientData.biomarkers}
                          showMismatchWarning
                          onLearnMore={() => setSelectedTrial(trial)}
                          onDownloadBrief={() => setShowBriefModal(true)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mt-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clipboard className="w-6 h-6 text-blue-600" />
              What Happens Next?
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Review with Your Oncologist</h4>
                  <p className="text-gray-700 mb-3">
                    Print or email these results to share with your doctor. They can confirm you meet 
                    eligibility requirements and help you decide if a trial is right for you.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowBriefModal(true)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF Summary
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email to Myself
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Contact Trial Sites</h4>
                  <p className="text-gray-700">
                    Once your doctor agrees a trial may be appropriate, call the trial coordinator. 
                    Mention the NCT number and ask about the screening process. Trial coordinators will 
                    answer your questions and review eligibility in detail.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Expect the Screening Process</h4>
                  <p className="text-gray-700 mb-2">
                    <strong>Timeline:</strong> Usually 2-4 weeks
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li>Initial phone screening (30 minutes)</li>
                    <li>Review of medical records</li>
                    <li>In-person screening visit (2-4 hours)</li>
                    <li>Required tests (blood work, scans, etc.)</li>
                    <li>Final eligibility determination</li>
                  </ul>
                  <p className="text-sm text-amber-800 mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                    <strong>Note:</strong> Not everyone who screens will be eligible. This is normal and expected.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">Important Reminder:</strong> This tool provides 
                educational information only. It does not provide medical advice or guarantee trial 
                enrollment. Your healthcare team should guide all treatment decisions.
              </p>
            </div>
          </div>

          {/* Data Source Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                <strong>Data Source:</strong> Trial data sourced from ClinicalTrials.gov and refreshed daily. 
                Recruiting status may change and must be confirmed with the trial site. 
                Last sync: {new Date().toLocaleDateString()}.
              </p>
            </div>
          </motion.div>

          {/* Privacy Reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 rounded-xl p-4 text-center"
          >
            <p className="text-base text-gray-600">
              🔒 Your data remains in your browser session. Closing this tab will clear all information.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <LearnMoreModal
        trial={selectedTrial}
        onClose={() => setSelectedTrial(null)}
      />

      <ClinicianBriefModal
        isOpen={showBriefModal}
        onClose={() => setShowBriefModal(false)}
        patientData={patientData}
        matchedTrials={matchedTrialsForBrief}
      />
    </div>
  );
}
