import { PatientData } from "@/types/oncology";

interface TreatmentHistorySectionProps {
  patientData: PatientData;
}

function formatCurrentLine(patientData: PatientData): string {
  const status = patientData.currentTreatmentStatus;
  const regimen = patientData.priorRegimenName;
  const progressed = patientData.progressionDetected;
  
  // If progression detected
  if (progressed === true || status?.includes("progressed")) {
    
    // Progressed on targeted therapy
    if (status === "progressed_targeted" || status?.includes("targeted")) {
      if (regimen) {
        // Capitalize first letter of drug name
        const drugName = regimen.charAt(0).toUpperCase() + regimen.slice(1);
        return `Progressed on targeted therapy (${drugName})`;
      }
      return "Progressed on targeted therapy";
    }
    
    // Progressed on chemo/immunotherapy
    if (status === "progressed_chemo_immuno") {
      return "Progressed on chemotherapy/immunotherapy";
    }
    
    // Generic progression
    return "Progressed on prior therapy";
  }
  
  // First-line (newly diagnosed)
  if (status === "first_line") {
    return "First-line (newly diagnosed)";
  }
  
  // Fallback to legacy line of therapy mapping
  switch (patientData.lineOfTherapy) {
    case "first": return "First-line (newly diagnosed)";
    case "post_targeted": return "Progressed on targeted therapy";
    case "post_chemo_immuno": return "Progressed on chemo/immunotherapy";
    case "later_line": return "Later-line (multiple prior therapies)";
    default: return "Treatment line not determined";
  }
}

// Helper function to identify drug class
function identifyDrugClass(treatment: string): string {
  if (!treatment) return '';
  
  const treatmentLower = treatment.toLowerCase();
  
  // EGFR TKIs
  if (treatmentLower.includes('osimertinib') || treatmentLower.includes('tagrisso')) {
    return 'EGFR TKI';
  }
  if (treatmentLower.includes('erlotinib') || treatmentLower.includes('tarceva')) {
    return 'EGFR TKI';
  }
  if (treatmentLower.includes('gefitinib') || treatmentLower.includes('iressa')) {
    return 'EGFR TKI';
  }
  
  // CDK4/6 inhibitors
  if (treatmentLower.includes('palbociclib') || treatmentLower.includes('ibrance')) {
    return 'CDK4/6 inhibitor';
  }
  if (treatmentLower.includes('ribociclib') || treatmentLower.includes('kisqali')) {
    return 'CDK4/6 inhibitor';
  }
  if (treatmentLower.includes('abemaciclib') || treatmentLower.includes('verzenio')) {
    return 'CDK4/6 inhibitor';
  }
  
  // HER2-targeted
  if (treatmentLower.includes('trastuzumab') || treatmentLower.includes('herceptin')) {
    return 'HER2-targeted';
  }
  if (treatmentLower.includes('pertuzumab') || treatmentLower.includes('perjeta')) {
    return 'HER2-targeted';
  }
  
  // Chemotherapy
  if (treatmentLower.includes('paclitaxel') || treatmentLower.includes('taxol')) {
    return 'Chemotherapy';
  }
  if (treatmentLower.includes('carboplatin') || treatmentLower.includes('cisplatin')) {
    return 'Chemotherapy';
  }
  
  return '';
}

// Helper function to format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // If format is YYYY-MM
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  
  return dateStr;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
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
    // NEW: Use detailed treatment history if available
    if (patientData.treatmentHistory && Array.isArray(patientData.treatmentHistory) && patientData.treatmentHistory.length > 0) {
      return patientData.treatmentHistory.map((t, index) => {
        // Handle both string format and object format
        if (typeof t === 'string') {
          return `${index + 1}. ${capitalizeFirstLetter(t)}`;
        }
        
        // If it's an object with details
        let line = `${index + 1}. ${capitalizeFirstLetter(t.treatment || t.name || 'Unknown treatment')}`;
        
        // Add drug class if we can identify it
        const drugClass = identifyDrugClass(t.treatment || t.name);
        if (drugClass) {
          line += ` (${drugClass})`;
        }
        
        // Add date
        if (t.date) {
          line += ` - ${formatDate(t.date)}`;
        }
        
        // Add duration
        if (t.duration) {
          line += ` - Duration: ${t.duration}`;
        }
        
        // Add response
        if (t.response) {
          line += ` - Response: ${capitalizeFirstLetter(t.response)}`;
        }
        
        // Add details/site
        if (t.details) {
          line += ` - ${t.details}`;
        }
        if (t.site) {
          line += ` - Site: ${t.site}`;
        }
        
        return line;
      });
    }
    
    // FALLBACK: Use legacy treatment categories
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
              {formatCurrentLine(patientData)}
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
            <div className="space-y-1 text-slate-800">
              {treatments.map((treatment, i) => (
                <div key={i} className="text-sm leading-relaxed">{treatment}</div>
              ))}
            </div>
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
