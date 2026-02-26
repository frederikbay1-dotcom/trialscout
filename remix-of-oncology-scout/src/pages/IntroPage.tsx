import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function IntroPage() {
  const navigate = useNavigate();
  const [showPersona, setShowPersona] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPersona(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              The Enrollment Bottleneck
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              When standard treatment stops working, clinical trials are often
              the last option. But matching patients to complex eligibility
              criteria is fragmented, manual, and overwhelming.
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

          {/* Meet Sarah Panel - Fades in after 2 seconds */}
          <div
            className={`bg-blue-50 rounded-lg border border-blue-200 p-8 transition-all duration-1000 ${
              showPersona
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Meet Sarah
            </h3>
            <ul className="space-y-2 text-base text-gray-700">
              <li>• 52 years old</li>
              <li>• Metastatic ER+ HER2- breast cancer</li>
              <li>• Failed two prior lines of therapy</li>
              <li>• Lives in Newark, NJ</li>
              <li>
                • Oncologist mentioned trials but provided no clear guidance
              </li>
              <li>• Searching at 11 pm after her kids are asleep</li>
            </ul>
          </div>

          {/* Card 2 - Our Goal */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Goal
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Turn unstructured clinical records into ranked, doctor-ready trial
              matches.
            </p>
          </div>

          {/* Card 3 - Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 text-center">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              See How It Works
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
