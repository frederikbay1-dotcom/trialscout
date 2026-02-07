import { motion } from "framer-motion";
import { CancerType } from "@/types/oncology";
import { 
  BiomarkerProfile, 
  BiomarkerState, 
  EGFRSubtype, 
  PDL1Level, 
  HER2Status 
} from "@/types/biomarkers";
import { HelpCircle, Check, X, CircleDot, FileText } from "lucide-react";
import { BiomarkerHelper } from "@/components/BiomarkerHelper";
import { biomarkerHelpers } from "@/data/biomarkerHelpers";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StructuredBiomarkerSelectorProps {
  cancerType: CancerType;
  profile: BiomarkerProfile;
  onUpdateProfile: (profile: BiomarkerProfile) => void;
  showHeader?: boolean;
}

// 3-state button for present/absent/unknown
function BiomarkerStateButton({
  name,
  state,
  onChange,
  tooltip,
}: {
  name: string;
  state: BiomarkerState;
  onChange: (state: BiomarkerState) => void;
  tooltip?: string;
}) {
  const cycleState = () => {
    const nextState: Record<BiomarkerState, BiomarkerState> = {
      unknown: "present",
      present: "absent",
      absent: "unknown",
    };
    onChange(nextState[state]);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={cycleState}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm",
              state === "present" && "bg-emerald-50 border-emerald-400 text-emerald-800",
              state === "absent" && "bg-rose-50 border-rose-300 text-rose-700",
              state === "unknown" && "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            {state === "present" && <Check className="w-4 h-4" />}
            {state === "absent" && <X className="w-4 h-4" />}
            {state === "unknown" && <CircleDot className="w-4 h-4 text-slate-400" />}
            <span>{name}</span>
          </button>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// State legend
function StateLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-emerald-700" />
        </span>
        Present
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-rose-50 border border-rose-300 flex items-center justify-center">
          <X className="w-2.5 h-2.5 text-rose-600" />
        </span>
        Absent
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center">
          <CircleDot className="w-2.5 h-2.5 text-slate-400" />
        </span>
        Unknown
      </span>
      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        Click to cycle states
      </span>
    </div>
  );
}

export function StructuredBiomarkerSelector({
  cancerType,
  profile,
  onUpdateProfile,
  showHeader = true,
}: StructuredBiomarkerSelectorProps) {
  if (!cancerType) return null;

  const updateGeneticBiomarker = (key: keyof BiomarkerProfile["genetic"], value: BiomarkerState) => {
    if (key === "EGFR") {
      onUpdateProfile({
        ...profile,
        genetic: {
          ...profile.genetic,
          EGFR: { ...profile.genetic.EGFR, state: value },
        },
      });
    } else {
      onUpdateProfile({
        ...profile,
        genetic: { ...profile.genetic, [key]: value },
      });
    }
  };

  const updateEGFRSubtype = (subtype: EGFRSubtype) => {
    onUpdateProfile({
      ...profile,
      genetic: {
        ...profile.genetic,
        EGFR: { ...profile.genetic.EGFR, subtype },
      },
    });
  };

  const updatePDL1 = (level: PDL1Level) => {
    onUpdateProfile({
      ...profile,
      expression: { ...profile.expression, PDL1: level },
    });
  };

  const updateHER2 = (status: HER2Status) => {
    onUpdateProfile({
      ...profile,
      expression: { ...profile.expression, HER2: status },
    });
  };

  const updateHormoneReceptor = (key: keyof BiomarkerProfile["hormoneReceptors"], value: BiomarkerState) => {
    onUpdateProfile({
      ...profile,
      hormoneReceptors: { ...profile.hormoneReceptors, [key]: value },
    });
  };

  if (cancerType === "lung") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {showHeader && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">Biomarker Profile</h3>
            <p className="text-sm text-muted-foreground">Select status for each marker</p>
          </div>
        )}
        
        <StateLegend />

        {/* Help Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-2">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Need help finding your test results?
              </p>
              <p className="text-xs text-blue-800">
                Click the <HelpCircle className="w-3.5 h-3.5 inline text-blue-600" /> icon next to any section to see where to find this info in your medical records.
              </p>
            </div>
          </div>
        </div>

        {/* Genetic Alterations Section */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Genetic Alterations & Fusions
            <BiomarkerHelper {...biomarkerHelpers.egfr} />
          </h4>
          
          {/* EGFR with subtype selector */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <BiomarkerStateButton
                name="EGFR"
                state={profile.genetic.EGFR.state}
                onChange={(state) => updateGeneticBiomarker("EGFR", state)}
                tooltip="Epidermal Growth Factor Receptor mutation"
              />
              
              {profile.genetic.EGFR.state === "present" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-muted-foreground">Subtype:</span>
                  <Select
                    value={profile.genetic.EGFR.subtype}
                    onValueChange={(val) => updateEGFRSubtype(val as EGFRSubtype)}
                  >
                    <SelectTrigger className="w-48 h-9 bg-background">
                      <SelectValue placeholder="Select subtype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exon19_del">Exon 19 Deletion</SelectItem>
                      <SelectItem value="l858r">L858R</SelectItem>
                      <SelectItem value="exon20_ins">Exon 20 Insertion</SelectItem>
                      <SelectItem value="t790m">T790M</SelectItem>
                      <SelectItem value="other">Other / Rare</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </div>
          </div>

          {/* Other genetic alterations */}
          <div className="flex flex-wrap gap-2">
            <BiomarkerStateButton
              name="ALK"
              state={profile.genetic.ALK}
              onChange={(state) => updateGeneticBiomarker("ALK", state)}
              tooltip="ALK rearrangement"
            />
            <BiomarkerStateButton
              name="ROS1"
              state={profile.genetic.ROS1}
              onChange={(state) => updateGeneticBiomarker("ROS1", state)}
              tooltip="ROS1 rearrangement"
            />
            <BiomarkerStateButton
              name="BRAF"
              state={profile.genetic.BRAF}
              onChange={(state) => updateGeneticBiomarker("BRAF", state)}
              tooltip="BRAF mutation"
            />
            <BiomarkerStateButton
              name="KRAS G12C"
              state={profile.genetic.KRAS_G12C}
              onChange={(state) => updateGeneticBiomarker("KRAS_G12C", state)}
              tooltip="KRAS G12C mutation"
            />
            <BiomarkerStateButton
              name="MET"
              state={profile.genetic.MET}
              onChange={(state) => updateGeneticBiomarker("MET", state)}
              tooltip="MET amplification or exon 14 skip"
            />
            <BiomarkerStateButton
              name="RET"
              state={profile.genetic.RET}
              onChange={(state) => updateGeneticBiomarker("RET", state)}
              tooltip="RET fusion"
            />
            <BiomarkerStateButton
              name="NTRK"
              state={profile.genetic.NTRK}
              onChange={(state) => updateGeneticBiomarker("NTRK", state)}
              tooltip="NTRK fusion"
            />
          </div>
        </div>

        {/* Expression Section */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Expression & Scoring
            <BiomarkerHelper {...biomarkerHelpers.pdl1} />
          </h4>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">PD-L1:</span>
              <Select value={profile.expression.PDL1} onValueChange={(val) => updatePDL1(val as PDL1Level)}>
                <SelectTrigger className="w-32 h-9 bg-background">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  <SelectItem value="high">High (≥50%)</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Breast Cancer biomarkers
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Biomarker Profile</h3>
          <p className="text-sm text-muted-foreground">Select status for each marker</p>
        </div>
      )}
      
      <StateLegend />

      {/* Help Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-2">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Need help finding your test results?
            </p>
            <p className="text-xs text-blue-800">
              Click the <HelpCircle className="w-3.5 h-3.5 inline text-blue-600" /> icon next to any section to see where to find this info in your medical records.
            </p>
          </div>
        </div>
      </div>

      {/* Hormone Receptors */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Hormone Receptors
          <BiomarkerHelper {...biomarkerHelpers.hormoneReceptors} />
        </h4>
        <div className="flex flex-wrap gap-2">
          <BiomarkerStateButton
            name="ER"
            state={profile.hormoneReceptors.ER}
            onChange={(state) => updateHormoneReceptor("ER", state)}
            tooltip="Estrogen Receptor"
          />
          <BiomarkerStateButton
            name="PR"
            state={profile.hormoneReceptors.PR}
            onChange={(state) => updateHormoneReceptor("PR", state)}
            tooltip="Progesterone Receptor"
          />
        </div>
      </div>

      {/* HER2 Status */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          HER2 Status
          <BiomarkerHelper {...biomarkerHelpers.her2} />
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">HER2:</span>
          <Select value={profile.expression.HER2} onValueChange={(val) => updateHER2(val as HER2Status)}>
            <SelectTrigger className="w-36 h-9 bg-background">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 (Negative)</SelectItem>
              <SelectItem value="low">Low (1+, 2+ ISH-)</SelectItem>
              <SelectItem value="positive">Positive (3+)</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Genetic Alterations */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Genetic Alterations
          <BiomarkerHelper {...biomarkerHelpers.brca} />
        </h4>
        <div className="flex flex-wrap gap-2">
          <BiomarkerStateButton
            name="BRCA1/2"
            state={profile.hormoneReceptors.BRCA1_2}
            onChange={(state) => updateHormoneReceptor("BRCA1_2", state)}
            tooltip="BRCA1 or BRCA2 germline mutation"
          />
          <BiomarkerStateButton
            name="PIK3CA"
            state={profile.hormoneReceptors.PIK3CA}
            onChange={(state) => updateHormoneReceptor("PIK3CA", state)}
            tooltip="PIK3CA mutation"
          />
          <BiomarkerStateButton
            name="ESR1"
            state={profile.hormoneReceptors.ESR1}
            onChange={(state) => updateHormoneReceptor("ESR1", state)}
            tooltip="ESR1 mutation"
          />
          <BiomarkerStateButton
            name="NTRK"
            state={profile.genetic.NTRK}
            onChange={(state) => updateGeneticBiomarker("NTRK", state)}
            tooltip="NTRK fusion"
          />
        </div>
      </div>
    </motion.div>
  );
}
