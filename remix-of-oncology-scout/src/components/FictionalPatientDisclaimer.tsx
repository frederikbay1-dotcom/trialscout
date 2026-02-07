import { Info } from "lucide-react";

export function FictionalPatientDisclaimer() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 italic">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Note:</strong> These are fictional example patients created for demonstration 
          purposes only. They do not represent real individuals or actual patient data.
        </p>
      </div>
    </div>
  );
}
