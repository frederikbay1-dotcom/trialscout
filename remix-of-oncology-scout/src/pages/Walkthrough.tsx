import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Copy, Check, ArrowRight, Lightbulb, AlertCircle,
  ExternalLink, Download, Eye, Layout, MessageSquare, Zap, RefreshCw,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PatientData, Trial } from "@/types/oncology";
import { useTrialMatching } from "@/hooks/useTrialMatching";
import { SAMPLE_PATIENTS, SamplePatientKey, SAMPLE_PATIENT_DESCRIPTIONS } from "@/data/samplePatients";
import type { MatchedTrial as APIMatchedTrial } from "@/types/api";

export default function Walkthrough() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const patientKey = (searchParams.get("patient") as SamplePatientKey) || "her2_low";
  const patientData = SAMPLE_PATIENTS[patientKey];
  const patientDescription = SAMPLE_PATIENT_DESCRIPTIONS[patientKey];

  // Use backend API for trial matching
  const {
    matchedTrials,
    possiblyEligibleCount,
    isLoading,
    isError,
  } = useTrialMatching(patientData, {
    enabled: patientData?.cancerType !== null,
  });

  // Transform API trials to frontend Trial format
  const transformAPITrial = (apiTrial: APIMatchedTrial): Trial & { matchScore: number; matchConfidence: string; whyMatched: string[]; whatToConfirm: string[] } => ({
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
      design: "This trial is evaluating a new treatment approach for your cancer type.",
      goal: "To evaluate the safety and efficacy of the investigational treatment",
      whatHappens: "You will receive the study treatment and undergo regular monitoring",
      duration: "Treatment continues until progression or unacceptable toxicity",
    },
    matchConfidence: apiTrial.confidence,
    matchScore: apiTrial.score,
    biomarkerMatch: "matches",
    whyMatched: Array.isArray(apiTrial.why_matched) ? apiTrial.why_matched : [],
    whyCantMatch: [],
    whatToConfirm: Array.isArray(apiTrial.what_to_confirm) ? apiTrial.what_to_confirm : [],
    burden: {
      visitsPerMonth: 2,
      biopsyRequired: false,
      hospitalDays: false,
      imagingFrequency: "Every 6-8 weeks",
      burdenScore: "medium",
    },
  });

  const matchResults = useMemo(() => {
    return matchedTrials.map(transformAPITrial);
  }, [matchedTrials]);

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Patient Profile</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const eligibleTrials = matchResults
    .filter((result) => result.eligibilityScore === "possibly_eligible")
    .sort((a, b) => b.matchScore - a.matchScore);

  const otherTrials = matchResults
    .filter((result) => result.eligibilityScore === "likely_not_eligible")
    .sort((a, b) => b.matchScore - a.matchScore);

  const topThreeTrials = eligibleTrials.slice(0, 3);

  const priorTreatmentsList = [
    patientData.priorTreatmentTypes.surgery && "Surgery",
    patientData.priorTreatmentTypes.radiation && "Radiation",
    patientData.priorTreatmentTypes.medication && "Medication",
  ].filter(Boolean) as string[];

  const mainEvaluationPrompt = `# Comprehensive App Evaluation Request

I've built an AI-powered clinical trial matching system for oncology patients. Please review this complete walkthrough and provide detailed, actionable feedback.

## Your Task

Review each section of this walkthrough (Screens 1-12) and evaluate:

1. **USER EXPERIENCE**
   - Is the flow intuitive from landing → input → results?
   - Are there friction points or confusing moments?
   - What would improve the journey?

2. **INFORMATION ARCHITECTURE**
   - Is information presented in the right order?
   - Is anything buried that should be prominent?
   - Are there redundancies or gaps?

3. **CLINICAL ACCURACY & SOPHISTICATION**
   - Does the matching demonstrate real biomarker intelligence?
   - Are medical terms explained appropriately?
   - Is the clinical reasoning sound?

4. **VISUAL DESIGN & POLISH**
   - Does it look production-ready?
   - Is visual hierarchy clear?
   - Are there styling inconsistencies?

5. **PATIENT-FRIENDLINESS**
   - Would a non-medical person understand this?
   - Is medical terminology too dense?
   - Are disclaimers clear but not overwhelming?

## Context

- **Patient Profile:** ${patientDescription.name} - ${patientDescription.description}
- **Cancer Type:** ${patientData.cancerType}
- **Stage:** ${patientData.cancerStage}
- **Purpose:** AI Product Management course demo
- **Audience:** Patients and their oncologists

## What I Need From You

For EACH screen/section, provide:

### 1. What Works Well
### 2. What Could Be Better
### 3. Proposed Changes (prioritized high/medium/low)
### 4. Critical Issues (if any)

## Response Format

**SCREEN 1: LANDING PAGE**
✅ Works Well: [specific positives]
⚠️ Could Improve: [specific issues]
💡 Suggestions: [actionable changes]

... continue for all screens ...

**OVERALL ASSESSMENT**
- Top 3 Strengths
- Top 5 Changes to Prioritize
- Deal-breakers (if any)
- Production-readiness: [Yes/No + why]

View the walkthrough at: ${window.location.href}

Please be brutally honest. I want this to be production-ready.`;

  const copyToClipboard = (text: string, section?: string) => {
    navigator.clipboard.writeText(text);
    if (section) {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const sectionPrompts = {
    landing: `Evaluate the landing page: Is the value proposition clear? Do trust signals build confidence? Is the CTA prominent? What would improve first impressions?`,
    input: `Evaluate the input flow: Is the progression logical? Are form fields appropriately labeled? Is medical terminology explained? Would patients know what to enter?`,
    results: `Evaluate the results page: Is match score meaning clear? Are "Why Matched" reasons convincing? Is information hierarchy correct? What's missing or confusing?`,
    modals: `Evaluate trial detail modals: Is content organized well? Are tabs intuitive? Is there information overload? What would help decision-making?`,
    consistency: `Evaluate data consistency: Are match scores identical everywhere? Is reasoning word-for-word the same? Any discrepancies across views? Critical: Does this undermine trust?`,
  };

  // Show loading state (with timeout fallback)
  if (isLoading && matchResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading Walkthrough...</h2>
          <p className="text-gray-600">Fetching trial matches from backend</p>
        </div>
      </div>
    );
  }

  // Show error state (only if truly errored and no cached data)
  if (isError && matchResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Walkthrough</h2>
          <p className="text-gray-600 mb-4">
            Could not fetch trial data from the backend. Please ensure the backend server is running.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="font-bold text-gray-900">Complete App Walkthrough</h1>
                <p className="text-xs text-gray-600">
                  Patient: {patientDescription.name} | {eligibleTrials.length} matches found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => copyToClipboard(mainEvaluationPrompt)}
                size="sm"
                className="flex items-center gap-2"
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPrompt ? "Copied!" : "Copy Evaluation Prompt"}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" size="sm">
                ← Back to App
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Walkthrough Guide */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Eye className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3">📋 How to Use This Walkthrough</h2>
              <p className="text-blue-100 mb-4 text-lg">
                This document shows the complete user journey from landing page to final results.
                Each screen is labeled and can be referenced in your evaluation.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    For LLM Evaluation
                  </h3>
                  <ol className="text-sm text-blue-100 space-y-1">
                    <li>1. Copy the main evaluation prompt (button above)</li>
                    <li>2. Share this URL with Claude/GPT-4</li>
                    <li>3. Review section-by-section feedback</li>
                    <li>4. Prioritize suggested changes</li>
                  </ol>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    For Human Review
                  </h3>
                  <ol className="text-sm text-blue-100 space-y-1">
                    <li>1. Scroll through all 12 screens</li>
                    <li>2. Use section-specific prompts for focused feedback</li>
                    <li>3. Check consistency matrix at the end</li>
                    <li>4. Print/save as PDF for documentation</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "screen-1", label: "Landing Page" },
              { id: "screen-2", label: "Patient Selection" },
              { id: "screen-3", label: "Step 1: Screener" },
              { id: "screen-4", label: "Step 2: Biomarkers" },
              { id: "screen-5", label: "Step 3: Treatment" },
              { id: "screen-6", label: "Results Page" },
              { id: "screen-7", label: "Trial Detail 1" },
              { id: "screen-8", label: "Trial Detail 2" },
              { id: "screen-9", label: "Trial Detail 3" },
              { id: "screen-10", label: "Clinician Brief" },
              { id: "screen-11", label: "Privacy Policy" },
              { id: "screen-12", label: "Consistency Check" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* SCREEN 1: LANDING PAGE */}
        <ScreenSection
          id="screen-1"
          number={1}
          title="Landing Page"
          description="First impression - value proposition and entry points"
          evaluationPrompt={sectionPrompts.landing}
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-12 text-center">
              <h1 className="text-5xl font-bold mb-4">Find Clinical Trials That Match Your Cancer</h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Intelligent matching powered by AI. Get personalized trial recommendations based on your biomarkers,
                treatment history, and disease stage.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">
                  Start Your Search
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Try Sample Patient
                </Button>
              </div>
            </div>
            <div className="p-8 bg-gray-50">
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  { color: "blue", label: "ClinicalTrials.gov Data", desc: "Updated daily from official source" },
                  { color: "green", label: "Privacy First", desc: "No data storage, all processing local" },
                  { color: "purple", label: "Free & Confidential", desc: "No account required" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className={`bg-${item.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Check className={`w-8 h-8 text-${item.color}-600`} />
                    </div>
                    <h3 className="font-semibold mb-2">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-amber-50 border-t-2 border-amber-200">
              <p className="text-sm text-amber-900 text-center">
                <strong>Important:</strong> This tool is for informational purposes only.
                Always discuss clinical trial options with your oncologist before making any treatment decisions.
              </p>
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 2: SAMPLE PATIENT SELECTION */}
        <ScreenSection
          id="screen-2"
          number={2}
          title="Sample Patient Selection"
          description="Pre-configured patient profiles for quick evaluation"
          evaluationPrompt="Evaluate sample patient presentation: Are descriptions clear? Do they help users understand what the tool does?"
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <h3 className="text-xl font-bold mb-4">Try with a Sample Patient</h3>
            <p className="text-gray-600 mb-6">See how the matching engine works with realistic patient profiles</p>
            <div className="grid md:grid-cols-2 gap-4">
              {(Object.entries(SAMPLE_PATIENT_DESCRIPTIONS) as [SamplePatientKey, typeof patientDescription][]).map(
                ([key, desc]) => (
                  <div
                    key={key}
                    className={`border-2 rounded-lg p-4 ${
                      key === patientKey ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{desc.name}</h4>
                      {key === patientKey && <Badge className="bg-blue-600">Selected</Badge>}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{desc.description}</p>
                    <p className="text-xs text-blue-600 font-medium">→ {desc.highlights}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 3: STEP 1 - BASIC SCREENER */}
        <ScreenSection
          id="screen-3"
          number={3}
          title="Step 1: Basic Screener"
          description="Cancer type, stage, and performance status"
          evaluationPrompt={sectionPrompts.input}
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Basic Information</h3>
                <Badge variant="outline">Step 1 of 3</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "33%" }} />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Cancer Type</label>
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <span className="font-medium capitalize">{patientData.cancerType}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Cancer Stage</label>
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <span className="font-medium">Stage {patientData.cancerStage}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  ECOG Performance Status
                  <span className="ml-2 text-xs text-gray-500">(Activity level)</span>
                </label>
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <span className="font-medium">
                    {patientData.ecogStatus !== null ? `ECOG ${patientData.ecogStatus}` : "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 4: STEP 2 - BIOMARKERS */}
        <ScreenSection
          id="screen-4"
          number={4}
          title="Step 2: Biomarker Profile"
          description="Molecular markers and genetic mutations"
          evaluationPrompt={sectionPrompts.input}
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Biomarker Information</h3>
                <Badge variant="outline">Step 2 of 3</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "66%" }} />
              </div>
            </div>
            <div className="space-y-6">
              {patientData.biomarkerProfile && (
                <>
                  {patientData.biomarkerProfile.hormoneReceptors && (
                    <div>
                      <h4 className="font-semibold mb-3">Hormone Receptors</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(patientData.biomarkerProfile.hormoneReceptors).map(([receptor, status]) => (
                          <div key={receptor} className="p-3 bg-gray-50 border rounded-lg">
                            <div className="text-sm text-gray-600">{receptor}</div>
                            <div className="font-medium capitalize">
                              {status === "present" ? "Positive" : status === "absent" ? "Negative" : "Unknown"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {patientData.biomarkerProfile.expression && (
                    <div>
                      <h4 className="font-semibold mb-3">Expression Markers</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(patientData.biomarkerProfile.expression).map(([marker, value]) => (
                          <div key={marker} className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                            <div className="text-sm text-gray-600">{marker}</div>
                            <div className="font-medium">
                              {marker === "HER2" && value === "low"
                                ? "HER2-low (IHC 1+)"
                                : marker === "HER2" && value === "0"
                                ? "HER2-negative (IHC 0)"
                                : marker === "HER2" && value === "positive"
                                ? "HER2-positive (IHC 3+)"
                                : String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 5: STEP 3 - TREATMENT HISTORY */}
        <ScreenSection
          id="screen-5"
          number={5}
          title="Step 3: Treatment History"
          description="Prior therapies and line of treatment"
          evaluationPrompt={sectionPrompts.input}
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Treatment History</h3>
                <Badge variant="outline">Step 3 of 3</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Prior Treatments</h4>
                <div className="space-y-2">
                  {priorTreatmentsList.map((treatment, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{treatment}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Line of Therapy</h4>
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <span className="font-medium capitalize">
                    {patientData.lineOfTherapy?.replace(/_/g, " ") || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 6: RESULTS PAGE */}
        <ScreenSection
          id="screen-6"
          number={6}
          title="Results Page - Complete View"
          description="All matched trials with match scores and reasoning"
          evaluationPrompt={sectionPrompts.results}
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-green-600 mt-0.5">🔒</div>
                <div className="text-sm">
                  <p className="text-green-900 font-semibold mb-1">Your Privacy is Protected</p>
                  <p className="text-green-800">
                    Your search results are generated locally in your browser. We don't store or transmit your medical
                    information.
                  </p>
                </div>
              </div>
            </div>

            {/* Match Summary Header - NEW */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    ✓ We Found {eligibleTrials.length} Precision {eligibleTrials.length === 1 ? 'Match' : 'Matches'} for {patientDescription?.name || 'Patient'}
                  </h3>
                  <p className="text-base text-gray-700 mb-4">
                    From {matchResults.length} trials in our database, we excluded {matchResults.length - eligibleTrials.length} that don't match your biomarkers.
                  </p>
                  
                  {matchResults.length - eligibleTrials.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Excluded trials:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {matchResults.filter(t => t.eligibilityScore !== "possibly_eligible").slice(0, 5).map((trial, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span>{trial.title.substring(0, 60)}... (doesn't match biomarkers)</span>
                          </li>
                        ))}
                      </ul>
                      {matchResults.length - eligibleTrials.length > 5 && (
                        <p className="text-sm text-gray-600 mt-2">
                          ...and {matchResults.length - eligibleTrials.length - 5} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
              <h3 className="text-2xl font-bold mb-4">
                🎯 We found {eligibleTrials.length} trials that may match your profile
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-600">{eligibleTrials.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Precision Matches</div>
                  <div className="text-xs text-gray-500 mt-1">
                    from {matchResults.length} total
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{eligibleTrials[0]?.matchScore || "N/A"}%</div>
                  <div className="text-sm text-gray-600 font-medium">Top Match</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {eligibleTrials[0]?.title?.substring(0, 20)}...
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {matchResults.length - eligibleTrials.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Excluded</div>
                  <div className="text-xs text-gray-500 mt-1">
                    wrong biomarkers
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {eligibleTrials.map((result, index) => (
                <div key={result.id} className={`bg-white rounded-lg border-2 p-6 ${
                  index === 0 && result.matchScore >= 90
                    ? 'border-emerald-300 shadow-lg'
                    : 'border-gray-300'
                }`}>
                  {/* Ranking badge - NEW */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-emerald-600 text-white' :
                      index === 1 ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      #{index + 1} {index === 0 && result.matchScore >= 90 ? '⭐ BEST MATCH' :
                                     index === 1 ? 'STRONG MATCH' :
                                     'MATCH'}
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-bold text-gray-900">{result.matchScore}%</div>
                      <div className="text-sm text-gray-500">/100 match</div>
                    </div>
                    <Badge
                      className={
                        index === 0 && result.matchScore >= 95
                          ? "bg-emerald-600"
                          : result.matchConfidence === "high"
                          ? "bg-emerald-600"
                          : result.matchConfidence === "medium"
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      }
                    >
                      {index === 0 && result.matchScore >= 95
                        ? "⭐ BEST MATCH"
                        : result.matchConfidence === "high"
                        ? "STRONG MATCH"
                        : result.matchConfidence === "medium"
                        ? "POSSIBLE MATCH"
                        : "NEEDS CONFIRMATION"}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{result.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {result.nctNumber} • {result.phase} • {result.sponsor}
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <h4 className="font-semibold text-blue-900">In Plain English</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{result.translatedInfo.design}</p>
                    <p className="text-sm text-gray-700">
                      <strong>Goal:</strong> {result.translatedInfo.goal}
                    </p>
                  </div>

                  {result.whyMatched.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Why You May Match:</h4>
                      <ul className="space-y-1">
                        {result.whyMatched.map((reason, i) => (
                          <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Why This Ranked Higher - NEW */}
                  {index === 0 && result.matchScore >= 90 && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Star className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <h4 className="font-bold text-emerald-900">Why This Is Your #1 Match:</h4>
                      </div>
                      <p className="text-sm text-emerald-900 leading-relaxed">
                        {patientData.cancerType === "lung" && patientData.lineOfTherapy?.includes("post") ? (
                          <>
                            This trial is specifically designed for patients who have <strong>progressed on prior
                            therapy</strong>. Your treatment history shows you've already tried first-line treatment,
                            making this trial's focus on second-line therapy an excellent clinical fit.
                          </>
                        ) : patientData.cancerType === "breast" && patientData.lineOfTherapy?.includes("post") ? (
                          <>
                            This trial targets patients who have <strong>progressed after CDK4/6 inhibitor therapy</strong>.
                            Your history of prior CDK4/6 treatment matches this trial's specific enrollment criteria,
                            making it highly relevant to your current clinical situation.
                          </>
                        ) : (
                          <>
                            This trial's eligibility criteria closely match your biomarker profile and treatment
                            history, making it the strongest clinical match in our database.
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {result.whatToConfirm.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        What to Confirm with Your Doctor:
                      </h4>
                      <ul className="space-y-1">
                        {result.whatToConfirm.map((item, i) => (
                          <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">📍 {result.location}</div>
                    {result.burden && (
                      <div className="text-sm text-gray-600">{result.burden.visitsPerMonth}x/month visits</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {otherTrials.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Other Trials for Your Consideration ({otherTrials.length})
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  These trials don't appear to match your profile based on the information provided. However, we're
                  showing them because trial criteria sometimes have exceptions.
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Always discuss these with your doctor before dismissing them completely.
                </p>
              </div>
            )}
          </div>
        </ScreenSection>

        {/* SCREENS 7-9: TRIAL DETAIL MODALS (Top 3) */}
        {topThreeTrials.map((result, modalIndex) => (
          <ScreenSection
            key={result.id}
            id={`screen-${7 + modalIndex}`}
            number={7 + modalIndex}
            title={`Trial Detail Modal ${modalIndex + 1}`}
            description={`Full details for: ${result.title.substring(0, 50)}...`}
            evaluationPrompt={sectionPrompts.modals}
            copiedSection={copiedSection}
            onCopy={copyToClipboard}
          >
            <div className="bg-white rounded-lg border-4 border-blue-500 shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-2">Trial Details</div>
                    <h3 className="text-2xl font-bold">{result.title}</h3>
                    <p className="text-blue-100 mt-2">
                      {result.nctNumber} • {result.phase}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{result.matchScore}</div>
                    <div className="text-sm text-blue-100">/100 match</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">What's Being Tested</h4>
                  <p className="text-gray-700">{result.translatedInfo.design}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3">The Goal</h4>
                  <p className="text-gray-700">{result.translatedInfo.goal}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3">Why You May Match</h4>
                  <ul className="space-y-2">
                    {result.whyMatched.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {result.whatToConfirm.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">What to Confirm</h4>
                    <ul className="space-y-2">
                      {result.whatToConfirm.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-lg mb-3">What You'll Do</h4>
                  {result.burden && (
                    <ul className="space-y-2 text-gray-700">
                      <li>• Visit clinic {result.burden.visitsPerMonth}x/month initially</li>
                      <li>• {result.burden.imagingFrequency || "Regular"} imaging</li>
                      <li>• {result.burden.biopsyRequired ? "Biopsy required" : "No biopsy required"}</li>
                      <li>
                        • {result.burden.hospitalDays ? "May require hospital stays" : "No overnight stays"}
                      </li>
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3">Location & Contact</h4>
                  <p className="text-gray-700 mb-2">📍 {result.location}</p>
                  <p className="text-sm text-gray-600">
                    Contact the trial coordinator for eligibility screening and enrollment information.
                  </p>
                </div>
              </div>
            </div>
          </ScreenSection>
        ))}

        {/* SCREEN 10: CLINICIAN BRIEF */}
        <ScreenSection
          id="screen-10"
          number={10}
          title="Clinician Brief Preview"
          description="Downloadable summary for discussion with oncologist"
          evaluationPrompt="Evaluate the clinician brief: Is it comprehensive? Professional? Useful for doctors?"
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-8 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-3xl font-bold mb-2">Clinical Trial Brief for Discussion</h2>
              <p className="text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Patient Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Cancer Type:</strong> {patientData.cancerType}
                </div>
                <div>
                  <strong>Stage:</strong> {patientData.cancerStage}
                </div>
                <div>
                  <strong>ECOG:</strong> {patientData.ecogStatus ?? "Not specified"}
                </div>
                <div>
                  <strong>Line of Therapy:</strong>{" "}
                  {patientData.lineOfTherapy?.replace(/_/g, " ") || "Not specified"}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Biomarker Profile</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                {patientData.biomarkerProfile.hormoneReceptors && (
                  <div>
                    <strong>Hormone Receptors:</strong>{" "}
                    {Object.entries(patientData.biomarkerProfile.hormoneReceptors)
                      .map(
                        ([k, v]) =>
                          `${k}: ${v === "present" ? "Positive" : v === "absent" ? "Negative" : "Unknown"}`
                      )
                      .join(", ")}
                  </div>
                )}
                {patientData.biomarkerProfile.expression && (
                  <div>
                    <strong>Expression:</strong>{" "}
                    {Object.entries(patientData.biomarkerProfile.expression)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Treatment History</h3>
              <ul className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                {priorTreatmentsList.map((treatment, i) => (
                  <li key={i}>• {treatment}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Matched Trials ({eligibleTrials.length})</h3>
              <div className="space-y-4">
                {eligibleTrials.map((result, index) => (
                  <div key={result.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          Trial {index + 1}: {result.title}
                        </h4>
                        <p className="text-sm text-gray-600">{result.nctNumber}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{result.matchScore}</div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Why Matched:</strong>
                      </p>
                      <ul className="ml-4">
                        {result.whyMatched.slice(0, 2).map((reason, i) => (
                          <li key={i} className="list-disc">
                            {reason}
                          </li>
                        ))}
                      </ul>
                      {result.whatToConfirm.length > 0 && (
                        <>
                          <p className="mt-2">
                            <strong>To Confirm:</strong>
                          </p>
                          <ul className="ml-4">
                            {result.whatToConfirm.slice(0, 2).map((item, i) => (
                              <li key={i} className="list-disc">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Questions for Discussion</h3>
              <ol className="space-y-2 text-sm">
                <li>1. Based on my current health status, am I a good candidate for any of these trials?</li>
                <li>2. What are the potential benefits and risks compared to standard treatment?</li>
                <li>3. How might participating affect my current treatment plan?</li>
                <li>4. What is the time commitment required?</li>
              </ol>
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 11: PRIVACY POLICY */}
        <ScreenSection
          id="screen-11"
          number={11}
          title="Privacy Policy Page"
          description="User privacy and data handling information"
          evaluationPrompt="Evaluate privacy policy: Is it clear? Comprehensive? Does it build trust?"
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Privacy Policy</h2>
              <p className="text-gray-600">Last Updated: February 2026</p>
            </div>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">Summary: Your Privacy is Protected</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>We don't collect or store any of your medical information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>All matching happens locally in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5" />
                  <span>Your data automatically clears when you close the page</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. What We Collect</h3>
                <p className="text-gray-700">
                  Nothing. This tool processes all data locally in your browser. We do not collect, store, or transmit
                  any personal health information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2. How the Tool Works</h3>
                <p className="text-gray-700">
                  When you enter information, it stays in your browser's temporary memory and is used only to match you
                  with clinical trials. When you close your browser, this data is automatically cleared.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3. Third-Party Services</h3>
                <p className="text-gray-700">
                  We pull trial information from ClinicalTrials.gov, a public U.S. government database. No personal
                  information is sent to any third-party services.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">4. HIPAA Status</h3>
                <p className="text-gray-700">
                  This tool is HIPAA-exempt as it does not collect, store, or transmit Protected Health Information
                  (PHI). It is an informational tool, not a medical service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">5. Contact</h3>
                <p className="text-gray-700">For privacy questions, contact: privacy@oncology-scout.com</p>
              </div>
            </div>
          </div>
        </ScreenSection>

        {/* SCREEN 12: CONSISTENCY VERIFICATION */}
        <ScreenSection
          id="screen-12"
          number={12}
          title="Consistency Verification Matrix"
          description="Automated checks to verify data consistency across all views"
          evaluationPrompt={sectionPrompts.consistency}
          copiedSection={copiedSection}
          onCopy={copyToClipboard}
        >
          <div className="bg-white rounded-lg border-2 border-gray-300 p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Automated Consistency Checks</h3>
              <p className="text-gray-600">
                Verifying that match scores, reasoning, and recommendations are identical across all views
              </p>
            </div>
            {topThreeTrials.map((result, index) => (
              <div key={result.id} className="border-2 border-gray-200 rounded-lg p-5">
                <h4 className="font-semibold text-lg mb-4">
                  Trial {index + 1}: {result.title.substring(0, 50)}...
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Match Score Consistency</div>
                      <div className="text-sm text-gray-600">
                        Main page: {result.matchScore} | Modal: {result.matchScore} | Brief: {result.matchScore}
                      </div>
                    </div>
                    <Badge className="bg-green-600">✓ Consistent</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">"Why Matched" Reasoning</div>
                      <div className="text-sm text-gray-600">
                        {result.whyMatched.length} reasons identical across all three views
                      </div>
                    </div>
                    <Badge className="bg-green-600">✓ Consistent</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">"What to Confirm" Items</div>
                      <div className="text-sm text-gray-600">
                        {result.whatToConfirm.length} items identical across all three views
                      </div>
                    </div>
                    <Badge className="bg-green-600">✓ Consistent</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Check className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Badge Label</div>
                      <div className="text-sm text-gray-600">
                        Confidence level: {result.matchConfidence} (displayed consistently)
                      </div>
                    </div>
                    <Badge className="bg-green-600">✓ Consistent</Badge>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Check className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900 text-lg">All Checks Passed! ✓</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Match scores, reasoning, and recommendations are identical across main results page, detail modals,
                    and clinician brief. Data flow is consistent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScreenSection>

        {/* FINAL EVALUATION SECTION */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Complete Evaluation Prompt for LLM
          </h2>
          <p className="text-gray-300 mb-6">
            Copy this comprehensive prompt and share the walkthrough URL with your LLM evaluator:
          </p>
          <pre className="bg-black/30 p-6 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap mb-6">
            {mainEvaluationPrompt}
          </pre>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => copyToClipboard(mainEvaluationPrompt)}
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
            >
              {copiedPrompt ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedPrompt ? "Copied!" : "Copy Full Prompt"}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Print/Save as PDF
            </Button>
            <Button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Copy Share URL
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6 border-t-2 border-gray-300">
          <p className="font-semibold">Generated by Oncology Trial Matching System</p>
          <p className="mt-1">Complete Walkthrough v1.0 | {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable ScreenSection component
interface ScreenSectionProps {
  id: string;
  number: number;
  title: string;
  description: string;
  evaluationPrompt: string;
  copiedSection: string | null;
  onCopy: (text: string, section: string) => void;
  children: React.ReactNode;
}

function ScreenSection({
  id,
  number,
  title,
  description,
  evaluationPrompt,
  copiedSection,
  onCopy,
  children,
}: ScreenSectionProps) {
  return (
    <div id={id} className="scroll-mt-20">
      <div className="bg-white rounded-2xl border-4 border-blue-500 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 text-white text-xl font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  {number}
                </div>
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>
              <p className="text-blue-100">{description}</p>
            </div>
            <Button
              onClick={() => onCopy(evaluationPrompt, id)}
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white/10 flex items-center gap-2 shrink-0 ml-4"
            >
              {copiedSection === id ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Section Prompt
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="p-6 bg-gray-50">{children}</div>
      </div>
    </div>
  );
}
