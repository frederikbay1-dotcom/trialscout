import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function IntroPage() {
  const navigate = useNavigate();

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
          {/* Card 1 - The Problem */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              The Problem
            </h2>
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-900 mb-2">For Patients:</p>
                <p className="text-lg text-gray-700">
                  No patient-friendly tools to find and understand relevant
                  trials—resulting in patients missing potentially life-saving
                  treatment options
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">For Pharma:</p>
                <p className="text-lg text-gray-700">
                  80% of clinical trials fail to meet enrollment targets and
                  delays cost tens to hundreds of millions per drug
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 - Our Solution */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Our Solution
            </h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li>
                • AI document extraction (30-minute form → 30-second upload)
              </li>
              <li>• Precision matching with explainability</li>
              <li>• 5th-6th grade reading level (accessible to patients)</li>
              <li>• Enrollment-as-a-service for sponsors</li>
            </ul>
          </div>

          {/* Card 3 - Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              We Built TrialScout to Fix This
            </h2>
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
