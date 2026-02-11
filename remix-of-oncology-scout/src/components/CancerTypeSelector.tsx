import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { CancerType } from "@/types/oncology";

interface CancerTypeSelectorProps {
  value: CancerType;
  onChange: (value: CancerType) => void;
}

const cancerTypes: { value: CancerType; label: string; description: string }[] = [
  {
    value: "lung",
    label: "Lung Cancer (NSCLC)",
    description: "Non-small cell lung cancer",
  },
  {
    value: "breast",
    label: "Breast Cancer",
    description: "All subtypes including HR+, HER2+, TNBC",
  },
];

export function CancerTypeSelector({ value, onChange }: CancerTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cancerTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`selection-tile text-left ${
            value === type.value ? "selection-tile-active" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                value === type.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{type.label}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
