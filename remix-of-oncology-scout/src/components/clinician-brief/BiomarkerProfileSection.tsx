import { PatientData } from "@/types/oncology";
import { BiomarkerProfile } from "@/types/biomarkers";
import { Check, X, HelpCircle } from "lucide-react";

interface BiomarkerProfileSectionProps {
  patientData: PatientData;
}

function getStatusIcon(status: "present" | "absent" | "unknown") {
  switch (status) {
    case "present":
      return <Check className="w-3 h-3 text-green-600 inline-block" />;
    case "absent":
      return <X className="w-3 h-3 text-slate-400 inline-block" />;
    case "unknown":
      return <HelpCircle className="w-3 h-3 text-amber-500 inline-block" />;
  }
}

function getStatusLabel(status: "present" | "absent" | "unknown") {
  switch (status) {
    case "present":
      return "Positive";
    case "absent":
      return "Negative";
    case "unknown":
      return "Unknown";
  }
}

function getStatusClassName(status: "present" | "absent" | "unknown") {
  switch (status) {
    case "present":
      return "text-green-700 bg-green-50";
    case "absent":
      return "text-slate-600 bg-slate-50";
    case "unknown":
      return "text-amber-700 bg-amber-50";
  }
}

export function BiomarkerProfileSection({ patientData }: BiomarkerProfileSectionProps) {
  const profile = patientData.biomarkerProfile;
  const cancerType = patientData.cancerType;

  if (!cancerType) return null;

  if (cancerType === "lung") {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
          Biomarker Profile
        </h2>
        
        {/* Genetic Alterations */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Driver Mutations & Fusions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <BiomarkerItem 
              name="EGFR" 
              status={profile.genetic.EGFR.state} 
              subtype={profile.genetic.EGFR.state === "present" ? profile.genetic.EGFR.subtype : undefined}
            />
            <BiomarkerItem name="ALK" status={profile.genetic.ALK} />
            <BiomarkerItem name="ROS1" status={profile.genetic.ROS1} />
            <BiomarkerItem name="KRAS G12C" status={profile.genetic.KRAS_G12C} />
            <BiomarkerItem name="BRAF" status={profile.genetic.BRAF} />
            <BiomarkerItem name="MET" status={profile.genetic.MET} />
            <BiomarkerItem name="RET" status={profile.genetic.RET} />
            <BiomarkerItem name="NTRK" status={profile.genetic.NTRK} />
          </div>
        </div>

        {/* Expression */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Expression</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1.5 p-2 rounded border border-slate-100">
              <span className="font-medium text-slate-700">PD-L1:</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                profile.expression.PDL1 === "high" 
                  ? "text-green-700 bg-green-50" 
                  : profile.expression.PDL1 === "low" 
                    ? "text-slate-600 bg-slate-50" 
                    : "text-amber-700 bg-amber-50"
              }`}>
                {profile.expression.PDL1 === "high" ? "≥50%" : profile.expression.PDL1 === "low" ? "<50%" : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Testing Note */}
        {hasUnknowns(profile, "lung") && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            ⚠️ Some biomarkers not tested or unknown. Consider comprehensive genomic profiling (e.g., FoundationOne, Guardant360).
          </div>
        )}
      </section>
    );
  }

  // Breast cancer
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
        Biomarker Profile
      </h2>
      
      {/* Hormone Receptors & HER2 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Receptor Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <BiomarkerItem name="ER" status={profile.hormoneReceptors.ER} />
          <BiomarkerItem name="PR" status={profile.hormoneReceptors.PR} />
          <div className="flex items-center gap-1.5 p-2 rounded border border-slate-100">
            <span className="font-medium text-slate-700">HER2:</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              profile.expression.HER2 === "positive" 
                ? "text-green-700 bg-green-50" 
                : profile.expression.HER2 === "low" 
                  ? "text-blue-700 bg-blue-50" 
                  : profile.expression.HER2 === "0"
                    ? "text-slate-600 bg-slate-50"
                    : "text-amber-700 bg-amber-50"
            }`}>
              {profile.expression.HER2 === "positive" ? "3+ (Positive)" 
                : profile.expression.HER2 === "low" ? "Low (1+/2+)" 
                : profile.expression.HER2 === "0" ? "0 (Negative)"
                : "Unknown"}
            </span>
          </div>
        </div>
        
        {/* Subtype Summary */}
        <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
          <span className="font-medium text-slate-700">Subtype: </span>
          <span className="text-slate-600">{getBreastSubtype(profile)}</span>
        </div>
      </div>

      {/* Genetic Alterations */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Genetic Alterations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <BiomarkerItem name="BRCA1/2" status={profile.hormoneReceptors.BRCA1_2} />
          <BiomarkerItem name="PIK3CA" status={profile.hormoneReceptors.PIK3CA} />
          <BiomarkerItem name="ESR1" status={profile.hormoneReceptors.ESR1} />
          <BiomarkerItem name="NTRK" status={profile.genetic.NTRK} />
        </div>
      </div>

      {/* Testing Note */}
      {hasUnknowns(profile, "breast") && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          ⚠️ Some biomarkers not tested or unknown. Discuss with oncologist if additional testing is needed.
        </div>
      )}
    </section>
  );
}

function BiomarkerItem({ 
  name, 
  status, 
  subtype 
}: { 
  name: string; 
  status: "present" | "absent" | "unknown"; 
  subtype?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 p-2 rounded border border-slate-100 ${getStatusClassName(status)}`}>
      {getStatusIcon(status)}
      <span className="font-medium">{name}</span>
      {subtype && subtype !== "unknown" && (
        <span className="text-[10px] text-slate-500">({subtype})</span>
      )}
    </div>
  );
}

function hasUnknowns(profile: BiomarkerProfile, cancerType: "lung" | "breast"): boolean {
  if (cancerType === "lung") {
    return (
      profile.genetic.EGFR.state === "unknown" ||
      profile.genetic.ALK === "unknown" ||
      profile.genetic.ROS1 === "unknown" ||
      profile.expression.PDL1 === "unknown"
    );
  }
  return (
    profile.hormoneReceptors.ER === "unknown" ||
    profile.expression.HER2 === "unknown"
  );
}

function getBreastSubtype(profile: BiomarkerProfile): string {
  const er = profile.hormoneReceptors.ER;
  const pr = profile.hormoneReceptors.PR;
  const her2 = profile.expression.HER2;

  if (er === "unknown" && her2 === "unknown") {
    return "Unknown (awaiting biomarker results)";
  }

  const hrPositive = er === "present" || pr === "present";
  const her2Positive = her2 === "positive";
  const her2Low = her2 === "low";

  if (!hrPositive && !her2Positive && er === "absent") {
    return "Triple-Negative Breast Cancer (TNBC)";
  }
  if (hrPositive && her2Positive) {
    return "HR+/HER2+ (Luminal B-like)";
  }
  if (hrPositive && her2Low) {
    return "HR+/HER2-low";
  }
  if (hrPositive && !her2Positive) {
    return "HR+/HER2- (Luminal A-like)";
  }
  if (!hrPositive && her2Positive) {
    return "HER2-enriched (HR-)";
  }
  
  return "Classification pending";
}
