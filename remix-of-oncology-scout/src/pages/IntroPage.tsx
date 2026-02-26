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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              The Problem
            </h2>
            <p className="text-lg font-medium text-gray-800 mb-4">
              When standard treatment isn't working, trials can be a
              lifeline—but finding one is nearly impossible
            </p>
            <ul className="space-y-3 text-lg text-gray-700">
              <li>
                • ClinicalTrials.gov: 5,000 unranked results in medical jargon
              </li>
              <li>
                • Trial matching services: Create awareness but don't help with
                understanding or enrollment
              </li>
              <li>
                • Most people—patients and their loved ones—give up
              </li>
              <li>• Treatments that could work go unused</li>
            </ul>
          </div>

          {/* Card 2 - Our Goal */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Goal
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Make clinical trials accessible to everyone who could
              benefit—whether you're searching for yourself or someone you care
              about.
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
