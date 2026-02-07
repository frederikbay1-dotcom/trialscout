import { Info, Shield, Lock, Eye } from "lucide-react";

export function GlobalFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Important Medical & Legal Information
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>About This Tool:</strong> This matching tool is for educational and 
                informational purposes only. It does not provide medical advice, diagnosis, or 
                treatment. It does not guarantee trial enrollment or eligibility, and it does not 
                replace consultation with your healthcare provider.
              </p>
              <p>
                <strong>Information Source:</strong> All trial information comes from 
                ClinicalTrials.gov, the official U.S. government registry of clinical trials. 
                Trial details are updated regularly, but eligibility criteria may change. 
                Always verify current requirements with trial staff.
              </p>
              <p>
                <strong>Your Responsibilities:</strong> Discuss all results with your oncologist. 
                Verify eligibility directly with trial coordinators. Review informed consent 
                documents carefully. Ask questions until you fully understand.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span>No Data Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span>HTTPS Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-600" />
            <span>Privacy First</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center pt-6 border-t border-gray-200">
          <p>For educational purposes only. Not medical advice. Consult your healthcare provider.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <a href="/privacy" className="hover:text-gray-700 underline">
              Privacy Policy
            </a>
            <span>•</span>
            <p>Questions? Email: support@oncologyscout.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
