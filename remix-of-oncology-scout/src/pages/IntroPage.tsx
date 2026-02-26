import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function IntroPage() {
  const navigate = useNavigate();
  const [showPersona, setShowPersona] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TrialScout</h1>
          <p className="text-xl text-gray-600">
            Enrollment Infrastructure for Clinical Trials
          </p>
        </div>

        <div className="space-y-8">
          {/* Card 1 - The Enrollment Bottleneck */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Enrollment Bottleneck
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              When standard treatment stops working, clinical trials are often
              the last option. But eligibility criteria live in unstructured
              clinical notes, fragmented systems, and dense trial protocols.
            </p>
            <ul className="space-y-3 text-lg text-gray-700">
              <li>
                • ClinicalTrials.gov returns 5,000+ unranked trials in medical
                jargon
              </li>
              <li>
                • 80% of oncology trials fail to meet enrollment targets
              </li>
              <li>
                • Patients and caregivers give up before finding a qualified
                match
              </li>
              <li>
                • Delayed enrollment costs sponsors tens to hundreds of millions
                per drug
              </li>
            </ul>
          </div>

          {/* Card 2 - Our Goal */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Goal
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-3">
              Turn unstructured clinical records into ranked, doctor-ready trial
              matches.
            </p>
            <p className="text-base text-gray-600">
              Sponsor-neutral. Ranked across all indexed trials.
            </p>
          </div>

          {/* Card 3 - Clickable Card (reveals Meet Sarah) */}
          <div 
            onClick={() => setShowPersona(!showPersona)}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            {!showPersona ? (
              <div className="text-center">
                <p className="text-lg text-gray-700 font-medium mb-2">
                  Click to see an example
                </p>
                <p className="text-sm text-gray-600 italic">
                  Meet a patient searching for trials
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Meet Sarah
                </h3>
                <ul className="space-y-2 text-base text-gray-700 mb-6">
                  <li>• 52 years old</li>
                  <li>
                    • Metastatic ER+ / HER2- breast cancer (common late-line
                    subtype)
                  </li>
                  <li>• Failed two prior lines of therapy</li>
                  <li>• Lives in Newark, NJ</li>
                  <li>
                    • Oncologist mentioned trials but provided no clear guidance
                  </li>
                  <li>• Searching at 11 pm after her kids are asleep</li>
                </ul>
                <div className="text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Clear session storage to start fresh
                      sessionStorage.removeItem('trialscout_patient_data');
                      sessionStorage.removeItem('trialscout_current_step');
                      navigate("/");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    See How It Works
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
