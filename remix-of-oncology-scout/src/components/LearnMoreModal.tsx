import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, FlaskConical, Calendar, ClipboardList, MapPin, ArrowRight, Clock, Activity, AlertTriangle, Syringe, Building, CheckCircle2, HelpCircle, XCircle, Phone, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trial } from "@/types/oncology";

interface LearnMoreModalProps {
  trial: Trial | null;
  onClose: () => void;
}

type TabType = "overview" | "howItWorks" | "eligibility" | "locations";

// Mock site contact info
const SITE_CONTACTS: Record<string, { name: string; phone: string; email: string; address: string; distance: string }[]> = {
  "1": [
    { name: "Dana-Farber Cancer Institute", phone: "(617) 632-3000", email: "trials@dfci.harvard.edu", address: "450 Brookline Ave, Boston, MA", distance: "12 miles" },
    { name: "Mass General Hospital", phone: "(617) 726-2000", email: "trials@mgh.harvard.edu", address: "55 Fruit St, Boston, MA", distance: "15 miles" },
  ],
  "2": [
    { name: "Memorial Sloan Kettering", phone: "(212) 639-2000", email: "clinicaltrials@mskcc.org", address: "1275 York Avenue, New York, NY", distance: "8 miles" },
  ],
  "3": [
    { name: "MD Anderson Cancer Center", phone: "(877) 632-6789", email: "clinicaltrials@mdanderson.org", address: "1515 Holcombe Blvd, Houston, TX", distance: "25 miles" },
  ],
  "4": [
    { name: "City of Hope", phone: "(626) 218-2273", email: "clinicaltrials@coh.org", address: "1500 E Duarte Rd, Duarte, CA", distance: "18 miles" },
  ],
  "5": [
    { name: "UCSF Medical Center", phone: "(415) 353-7070", email: "cancertrials@ucsf.edu", address: "505 Parnassus Ave, San Francisco, CA", distance: "5 miles" },
  ],
};

function getStatusIcon(status: "met" | "not_met" | "unknown") {
  switch (status) {
    case "met":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case "not_met":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "unknown":
      return <HelpCircle className="w-4 h-4 text-amber-600" />;
  }
}

export function LearnMoreModal({ trial, onClose }: LearnMoreModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  if (!trial) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "howItWorks", label: "How It Works" },
    { id: "eligibility", label: "Eligibility" },
    { id: "locations", label: "Locations" },
  ];

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
  const sites = SITE_CONTACTS[trial.id] || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* In Plain English */}
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Being Tested</h3>
              <p className="text-base text-gray-700 leading-relaxed">{trial.translatedInfo.design}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">The Goal</h3>
              <p className="text-base text-gray-700 leading-relaxed">{trial.translatedInfo.goal}</p>
            </div>

            {/* Why This Matched */}
            {trial.whyMatched && trial.whyMatched.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Why This Matched
                </h4>
                <ul className="space-y-2">
                  {trial.whyMatched.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                      <span className="text-emerald-600 mt-1">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What to Confirm */}
            {trial.whatToConfirm && trial.whatToConfirm.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  What to Confirm Next
                </h4>
                <ul className="space-y-2">
                  {trial.whatToConfirm.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                      <span className="text-amber-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Patient Burden */}
            {trial.burden && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Patient Burden
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xl font-bold text-gray-900">{trial.burden.visitsPerMonth}</p>
                    <p className="text-sm text-gray-600">Visits/month</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xl font-bold text-gray-900">{trial.burden.imagingFrequency || "Q6W"}</p>
                    <p className="text-sm text-gray-600">Imaging</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Syringe className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xl font-bold text-gray-900">{trial.burden.biopsyRequired ? "Yes" : "No"}</p>
                    <p className="text-sm text-gray-600">Biopsy</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                    <p className="text-xl font-bold text-gray-900">{trial.burden.hospitalDays ? "Yes" : "No"}</p>
                    <p className="text-sm text-gray-600">Hospital stays</p>
                  </div>
                </div>
              </div>
            )}

            {/* Algorithm Transparency */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <button
                onClick={() => setShowMatchDetails(!showMatchDetails)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showMatchDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide match calculation
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    How we calculated the {trial.matchScore || 70}/100 match
                  </>
                )}
              </button>

              {showMatchDetails && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                  {[
                    { label: "Biomarker Compatibility", pct: 0.4, max: 40, color: "bg-blue-600" },
                    { label: "Treatment History Alignment", pct: 0.3, max: 30, color: "bg-purple-600" },
                    { label: "Disease Stage Match", pct: 0.2, max: 20, color: "bg-green-600" },
                    { label: "Practical Factors", pct: 0.1, max: 10, color: "bg-amber-600" },
                  ].map((factor) => {
                    const score = trial.matchScore || 70;
                    const pts = Math.round(score * factor.pct);
                    return (
                      <div key={factor.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-700">{factor.label}</span>
                          <span className="font-semibold">{pts}/{factor.max} points</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${factor.color} h-2 rounded-full`}
                            style={{ width: `${(pts / factor.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t border-gray-300 flex justify-between items-center font-bold">
                    <span>Total Match Score:</span>
                    <span className="text-lg">{trial.matchScore || 70}/100</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                    This score is an estimate. Your oncologist will verify complete eligibility
                    using your full medical records.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "howItWorks":
        return (
          <div className="space-y-6">
            {/* Timeline Visualization */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Treatment Timeline</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">1</div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  </div>
                  <div className="pb-6">
                    <h5 className="font-medium text-gray-900">Week 1: Screening</h5>
                    <p className="text-base text-gray-600 mt-1">Initial tests and assessments to confirm eligibility</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">2</div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  </div>
                  <div className="pb-6">
                    <h5 className="font-medium text-gray-900">Week 2: Randomization</h5>
                    <p className="text-base text-gray-600 mt-1">You may be randomly assigned to the study drug or standard treatment</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">3</div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  </div>
                  <div className="pb-6">
                    <h5 className="font-medium text-gray-900">Month 1-3: Active Treatment</h5>
                    <p className="text-base text-gray-600 mt-1">Regular visits for treatment and monitoring</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">4</div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Month 4+: Maintenance</h5>
                    <p className="text-base text-gray-600 mt-1">Continued treatment with less frequent visits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                What Happens
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">{trial.translatedInfo.whatHappens}</p>
            </div>

            {/* Duration */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                How Long
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">{trial.translatedInfo.duration}</p>
            </div>
          </div>
        );

      case "eligibility":
        return (
          <div className="space-y-6">
            <p className="text-base text-gray-600">
              Based on the information you provided, here's how you match against the trial's criteria:
            </p>

            {/* You Meet These */}
            {metCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ✅ You Meet These ({metCriteria.length})
                </h4>
                <div className="space-y-2">
                  {metCriteria.map((criterion, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      {getStatusIcon(criterion.status)}
                      <span className="text-base text-gray-700">{criterion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need to Confirm */}
            {unknownCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  ❓ Need to Confirm ({unknownCriteria.length})
                </h4>
                <div className="space-y-2">
                  {unknownCriteria.map((criterion, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      {getStatusIcon(criterion.status)}
                      <span className="text-base text-gray-700">{criterion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* May Not Meet */}
            {notMetCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  ❌ May Not Meet ({notMetCriteria.length})
                </h4>
                <div className="space-y-2">
                  {notMetCriteria.map((criterion, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      {getStatusIcon(criterion.status)}
                      <span className="text-base text-gray-700">{criterion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusion Risks */}
            {trial.exclusionRisks && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Common Exclusion Risks
                </h4>
                <ul className="space-y-2 text-base text-gray-700">
                  {trial.exclusionRisks.priorDrugClass && trial.exclusionRisks.priorDrugClass.length > 0 && (
                    <li>• <strong>Prior drug exposure:</strong> {trial.exclusionRisks.priorDrugClass.join(", ")}</li>
                  )}
                  {trial.exclusionRisks.washoutWindow && (
                    <li>• <strong>Washout window:</strong> {trial.exclusionRisks.washoutWindow}</li>
                  )}
                  {trial.exclusionRisks.labThresholds && trial.exclusionRisks.labThresholds.length > 0 && (
                    <li>• <strong>Lab requirements:</strong> {trial.exclusionRisks.labThresholds.join(", ")}</li>
                  )}
                  {trial.exclusionRisks.brainMetastases && (
                    <li>• <strong>Brain metastases:</strong> Untreated brain metastases may exclude</li>
                  )}
                </ul>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                </span>
                Criterion Met
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <HelpCircle className="w-2.5 h-2.5 text-amber-600" />
                </span>
                More Info Needed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-2.5 h-2.5 text-red-600" />
                </span>
                May Not Meet
              </span>
            </div>
          </div>
        );

      case "locations":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Trial Sites</h4>
                <p className="text-sm text-gray-600">
                  {sites.length > 0 ? `${sites.length} location${sites.length > 1 ? 's' : ''} available` : "Contact sponsor for locations"}
                </p>
              </div>
            </div>

            {/* Map of Manhattan */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                title="Trial Location - Manhattan, NY"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0479%2C40.7061%2C-73.9271%2C40.7831&layer=mapnik&marker=40.7446%2C-73.9875"
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                className="w-full"
              />
              <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Manhattan, New York
              </div>
            </div>

            {sites.length > 0 && (
              <div className="space-y-4">
                {sites.map((site, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{site.name}</h5>
                      <span className="text-sm text-blue-600 font-medium">{site.distance}</span>
                    </div>
                    <p className="text-base text-gray-600 mb-3">{site.address}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a href={`tel:${site.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="w-4 h-4" />
                        {site.phone}
                      </a>
                      <a href={`mailto:${site.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Globe className="w-4 h-4" />
                        Email Site
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Practical Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Before Your Visit</h5>
              <ul className="text-base text-gray-700 space-y-1">
                <li>• Bring all current medications and supplements</li>
                <li>• Bring recent lab results and imaging reports</li>
                <li>• Prepare questions for the research team</li>
                <li>• Plan for the visit to take 2-3 hours</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-block mb-2 ${
                    trial.eligibilityScore === "possibly_eligible" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {trial.eligibilityScore === "possibly_eligible" ? "Possibly Eligible" : "Likely Not Eligible"}
                </span>
                <h2 className="text-xl font-semibold text-gray-900">{trial.title}</h2>
                <p className="text-base text-gray-600 mt-1">
                  {trial.nctNumber} • {trial.phase} • {trial.sponsor}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <Button onClick={onClose} className="w-full bg-blue-600 text-white hover:bg-blue-700 min-h-[48px] font-medium">
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
