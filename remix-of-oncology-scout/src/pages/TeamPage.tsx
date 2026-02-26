import { ArrowLeft, ArrowRight, User, Target, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/vision")}
          className="mb-6 hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vision
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Team & Execution
          </h1>
          <p className="text-xl text-gray-600">
            Building the enrollment infrastructure for clinical trials
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Founder */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Founder
            </h2>
            <div className="mb-4">
              <p className="text-xl font-semibold text-gray-900">Frederik Bay</p>
              <p className="text-lg text-gray-700">Founder & CEO</p>
              <p className="text-base text-gray-600 italic">
                Ph.D. Physics, Yale University
              </p>
            </div>
            <div className="mt-6">
              <p className="font-medium text-gray-900 mb-3">
                Background Highlights
              </p>
              <ul className="space-y-3 text-lg text-gray-700 leading-relaxed">
                <li>
                  • VP & Head of Strategy, Pfizer Global Innovative Pharma ($15B
                  business)
                </li>
                <li>
                  • General Manager, Healthcare at Adobe (4x revenue growth to
                  $400M ARR business)
                </li>
                <li>• Head of Enterprise Strategy, WebMD</li>
                <li>
                  • McKinsey & BCG consultant (pharma & healthcare focus)
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Next Hires */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Next Hires (with funding)
            </h2>
            <div className="space-y-6">
              {/* Role 1 */}
              <div className="flex items-start gap-4">
                <User className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Head of Clinical Operations
                  </p>
                  <ul className="space-y-2 text-lg text-gray-700 leading-relaxed">
                    <li>• Trial coordinator background</li>
                    <li>• Manage PI relationships at cancer centers</li>
                    <li>• Generate pilot case studies showing conversion</li>
                  </ul>
                </div>
              </div>

              {/* Role 2 */}
              <div className="flex items-start gap-4">
                <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Pharma Sales Lead
                  </p>
                  <ul className="space-y-2 text-lg text-gray-700 leading-relaxed">
                    <li>• Sold to pharma sponsors before</li>
                    <li>• Close enrollment-as-a-service deals</li>
                    <li>• Leverage founder's network for warm intros</li>
                  </ul>
                </div>
              </div>

              {/* Role 3 */}
              <div className="flex items-start gap-4">
                <Code className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    ML Engineer
                  </p>
                  <ul className="space-y-2 text-lg text-gray-700 leading-relaxed">
                    <li>• Build conversion prediction models</li>
                    <li>• Scale matching algorithm</li>
                    <li>• Own AI/ML infrastructure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: The Founder Advantage */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Why This Background Matters
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Deep Pharma Network
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Executive relationships at major pharma sponsors from years as
                  Pfizer VP-level strategist and Adobe Healthcare GM
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Proven Healthcare Go-to-Market
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Closed $400M+ in enterprise deals at Adobe with pharma and
                  health systems
                </p>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate("/vision")}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vision
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
