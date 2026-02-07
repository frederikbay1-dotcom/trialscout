import { PatientData } from "@/types/oncology";

interface TreatmentHistorySectionProps {
  patientData: PatientData;
}

function getLineOfTherapyLabel(line: string | null): string {
  switch (line) {
    case "first": return "First-line (newly diagnosed)";
    case "post_targeted": return "Progressed on targeted therapy";
    case "post_chemo_immuno": return "Progressed on chemo/immunotherapy";
    case "later_line": return "Later-line (multiple prior therapies)";
    default: return "Not specified";
  }
}

function getTherapyEndDateLabel(date: string | null): string {
  switch (date) {
    case "ongoing": return "Currently on treatment";
    case "within_30_days": return "Within last 30 days";
    case "30_90_days": return "30-90 days ago";
    case "over_90_days": return "More than 90 days ago";
    case "unknown": return "Unknown";
    default: return "Not specified";
  }
}

function getBestResponseLabel(response: string | null): string {
  switch (response) {
    case "responding": return "Responding (tumor shrinking)";
    case "stable": return "Stable disease";
    case "progressed": return "Progressed (tumor growing)";
    case "unknown": return "Unknown";
    default: return "Not specified";
  }
}

export function TreatmentHistorySection({ patientData }: TreatmentHistorySectionProps) {
  const getTreatmentList = () => {
    const treatments: string[] = [];
    
    if (patientData.priorTreatmentTypes.surgery) {
      treatments.push("Surgery");
    }
    if (patientData.priorTreatmentTypes.radiation) {
      treatments.push("Radiation therapy");
    }
    
    if (patientData.priorTreatmentTypes.medication) {
      if (patientData.cancerType === "breast") {
        const bt = patientData.breastTreatments;
        if (bt.endocrineTherapy === true) treatments.push("Endocrine therapy (e.g., letrozole, tamoxifen)");
        if (bt.cdk46Inhibitors === true) treatments.push("CDK4/6 inhibitors (e.g., palbociclib, ribociclib)");
        if (bt.antiHer2 === true) treatments.push("Anti-HER2 therapy (e.g., trastuzumab, pertuzumab)");
        if (bt.adcs === true) treatments.push("Antibody-drug conjugates (e.g., T-DXd, T-DM1)");
      } else {
        const lt = patientData.lungTreatments;
        if (lt.immunotherapy === true) treatments.push("Immunotherapy (e.g., pembrolizumab, nivolumab)");
        if (lt.targetedTherapy === true) treatments.push("Targeted therapy (e.g., EGFR/ALK inhibitors)");
        if (lt.platinumChemo === true) treatments.push("Platinum-based chemotherapy");
      }
    }
    
    return treatments;
  };

  const treatments = getTreatmentList();
  const hasAnyTreatment = patientData.priorTreatmentTypes.surgery || 
    patientData.priorTreatmentTypes.radiation || 
    patientData.priorTreatmentTypes.medication;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
        Treatment History
      </h2>
      
      <div className="space-y-4 text-sm">
        {/* Current Line of Therapy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Current Line</p>
            <p className="font-medium text-slate-800">
              {getLineOfTherapyLabel(patientData.lineOfTherapy)}
            </p>
          </div>
          
          {patientData.lineOfTherapy && patientData.lineOfTherapy !== "first" && (
            <>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Last Treatment Ended</p>
                <p className="font-medium text-slate-800">
                  {getTherapyEndDateLabel(patientData.lastTherapyEndDate)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Best Response */}
        {patientData.lineOfTherapy && patientData.lineOfTherapy !== "first" && patientData.bestResponseToLastTherapy && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Best Response to Last Treatment</p>
            <p className="font-medium text-slate-800">
              {getBestResponseLabel(patientData.bestResponseToLastTherapy)}
            </p>
          </div>
        )}

        {/* Prior Treatments List */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Prior Treatments Received</p>
          {treatments.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-slate-800">
              {treatments.map((treatment, i) => (
                <li key={i}>{treatment}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600 italic">
              {hasAnyTreatment ? "Treatment types not specified" : "No prior systemic treatment reported"}
            </p>
          )}
        </div>

        {/* Washout Warning */}
        {patientData.lastTherapyEndDate === "within_30_days" && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            ⚠️ Recent treatment within 30 days may affect trial eligibility. Many trials require 21-28 day washout periods.
          </div>
        )}
      </div>
    </section>
  );
}
