import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Scissors, Zap, Pill } from "lucide-react";
import { PriorTreatmentTypes as PriorTreatmentTypesData } from "@/types/oncology";

interface PriorTreatmentTypesProps {
  values: PriorTreatmentTypesData;
  onChange: (key: keyof PriorTreatmentTypesData, value: boolean) => void;
  showHeader?: boolean;
}

const treatmentOptions = [
  {
    key: "surgery" as const,
    label: "Surgery",
    description: "Tumor removal or biopsy procedures",
    icon: Scissors,
  },
  {
    key: "radiation" as const,
    label: "Radiation",
    description: "External beam or brachytherapy",
    icon: Zap,
  },
  {
    key: "medication" as const,
    label: "Medication",
    description: "Chemotherapy, targeted therapy, or immunotherapy",
    icon: Pill,
  },
];

export function PriorTreatmentTypes({ values, onChange, showHeader = true }: PriorTreatmentTypesProps) {
  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Prior Treatments</h3>
          <p className="text-sm text-muted-foreground">Check all that apply</p>
        </div>
      )}
      {treatmentOptions.map((option, index) => {
        const Icon = option.icon;
        const isChecked = values[option.key];

        return (
          <motion.div
            key={option.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              isChecked
                ? "bg-primary/5 border-primary/30"
                : "bg-card border-border hover:border-primary/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <Checkbox
                id={option.key}
                checked={isChecked}
                onCheckedChange={(checked) => onChange(option.key, checked as boolean)}
              />
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isChecked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Label
                  htmlFor={option.key}
                  className={`font-medium cursor-pointer ${
                    isChecked ? "text-foreground" : "text-foreground"
                  }`}
                >
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
