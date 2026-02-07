import { AlertTriangle } from "lucide-react";

interface BiomarkerMismatchBannerProps {
  requiredBiomarkers: string[];
  patientBiomarkers: string[];
}

export function BiomarkerMismatchBanner({ requiredBiomarkers, patientBiomarkers }: BiomarkerMismatchBannerProps) {
  const missingBiomarkers = requiredBiomarkers.filter(
    (required) => !patientBiomarkers.some(
      (patient) => patient.toLowerCase().includes(required.toLowerCase()) || 
                   required.toLowerCase().includes(patient.toLowerCase())
    )
  );

  if (missingBiomarkers.length === 0) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm">
      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-medium text-rose-800">Biomarker mismatch: </span>
        <span className="text-rose-700">
          This trial requires <strong>{missingBiomarkers.join(", ")}</strong>. 
          Your profile indicates: {patientBiomarkers.length > 0 ? patientBiomarkers.join(", ") : "No biomarkers selected"}.
        </span>
      </div>
    </div>
  );
}
