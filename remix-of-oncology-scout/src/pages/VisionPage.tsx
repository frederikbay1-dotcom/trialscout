import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function VisionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/team")}
            className="hover:bg-blue-100 transition-colors"
          >
            View Team & Execution
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">TrialScout</h1>
          <p className="text-xl text-gray-600">
            Enrollment Infrastructure for Clinical Trials
          </p>
        </div>

        {/* Two-Column Grid: Where We Are / Where We're Going */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Where We Are */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Where We Are
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Live product with clinical text extraction
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Biomarker and staging normalization working
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  20 structured oncology trials indexed
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Early pilot discussions with NYC cancer centers
                </span>
              </li>
            </ul>
          </div>

          {/* Right Column - Where We're Going */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Where We're Going
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">One-click referral routing</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Enrollment conversion tracking
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Expand to 100+ structured trials
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  25 sponsored trials across 2 metro areas
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Go-to-Market Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
            Go-to-Market: 3-Phase Approach
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-700 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-gray-900 font-medium">Phase 1</p>
                <p className="text-gray-600">
                  Pilot with cancer centers to validate match precision and referral conversion — tracking eligibility alignment, physician acceptance, and downstream enrollment.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-700 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-gray-900 font-medium">Phase 2</p>
                <p className="text-gray-600">
                  Sponsors pay per structured trial plus per confirmed enrollment.
                </p>
                <p className="text-gray-600 mt-2">
                  All indexed trials remain visible and ranked neutrally across the platform. For participating sponsors, we enable referral routing — connecting qualified patients directly to participating sites and tracking conversion.
                </p>
                <p className="text-gray-600 mt-2">
                  Sponsors pay for infrastructure and confirmed enrollment, not for ranking or placement.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-700 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-gray-900 font-medium">Phase 3</p>
                <p className="text-gray-600">
                  Scale to 25 sponsored trials across 2 metro areas, with referral routing and conversion tracking integrated end-to-end.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Model Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
            Revenue Model
          </h2>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-2xl font-bold text-gray-900">
                $5K–10K
                <span className="block text-sm font-normal text-gray-600">
                  per structured trial
                </span>
              </div>
              <div className="text-3xl text-gray-400">+</div>
              <div className="text-2xl font-bold text-gray-900">
                $2K
                <span className="block text-sm font-normal text-gray-600">
                  per confirmed enrollment
                </span>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-4 mt-4">
              <p className="text-gray-600">
                Designed to align incentives around confirmed enrollment rather than impressions or outreach volume.
              </p>
            </div>
          </div>
        </div>

        {/* Why This Works Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-blue-300">
            Why This Works
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Market Failure</p>
              <p className="text-gray-700">
                80% of oncology trials miss enrollment targets.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Economic Impact</p>
              <p className="text-gray-700">
                Enrollment delays cost sponsors tens to hundreds of millions per
                drug.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Our Advantage</p>
              <p className="text-gray-700">
                AI-structured patient-to-protocol matching. Reduces manual screening burden and improves referral precision.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Wedge Strategy</p>
              <p className="text-gray-700">
                Doctor-ready brief → Referral routing → Enrollment
                infrastructure.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
