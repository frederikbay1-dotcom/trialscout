import { motion } from "framer-motion";
import { CancerType } from "@/types/oncology";

interface BiomarkerSelectorProps {
  cancerType: CancerType;
  selected: string[];
  onToggle: (marker: string) => void;
  showHeader?: boolean;
}

const breastBiomarkers = ["ER+", "PR+", "HER2+", "HER2-low", "BRCA1/2", "PIK3CA", "ESR1", "NTRK"];
const lungBiomarkers = ["EGFR", "ALK", "ROS1", "BRAF", "KRAS G12C", "MET", "RET", "NTRK", "PD-L1 High"];

export function BiomarkerSelector({ cancerType, selected, onToggle, showHeader = true }: BiomarkerSelectorProps) {
  if (!cancerType) return null;

  const biomarkers = cancerType === "breast" ? breastBiomarkers : lungBiomarkers;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Biomarkers</h3>
          <p className="text-sm text-muted-foreground">Select known markers</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {biomarkers.map((marker, index) => (
          <motion.button
            key={marker}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onToggle(marker)}
            className={`biomarker-pill ${
              selected.includes(marker) ? "biomarker-pill-active" : ""
            }`}
          >
            {marker}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
