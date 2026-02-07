import { motion } from "framer-motion";
import { CancerStage } from "@/types/oncology";

interface CancerStageSelectorProps {
  value: CancerStage;
  onChange: (stage: CancerStage) => void;
}

const stages: { value: CancerStage; label: string; description: string }[] = [
  { value: "I", label: "Stage I", description: "Early, localized" },
  { value: "II", label: "Stage II", description: "Localized, larger or nearby" },
  { value: "III", label: "Stage III", description: "Regional spread" },
  { value: "IV", label: "Stage IV", description: "Distant spread (metastatic)" },
];

export function CancerStageSelector({ value, onChange }: CancerStageSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stages.map((stage, index) => {
        const isSelected = value === stage.value;
        return (
          <motion.button
            key={stage.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onChange(stage.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              isSelected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <span
              className={`block text-lg font-bold ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {stage.label}
            </span>
            <span className="block text-xs text-muted-foreground mt-1">
              {stage.description}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
