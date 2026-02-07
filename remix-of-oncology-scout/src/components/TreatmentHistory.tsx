import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CancerType, PatientData } from "@/types/oncology";

interface TreatmentHistoryProps {
  cancerType: CancerType;
  breastTreatments: PatientData["breastTreatments"];
  lungTreatments: PatientData["lungTreatments"];
  onBreastChange: (key: keyof PatientData["breastTreatments"], value: boolean | "unsure") => void;
  onLungChange: (key: keyof PatientData["lungTreatments"], value: boolean | "unsure") => void;
  hasAutoFilled?: boolean;
}

interface TreatmentOption {
  key: string;
  label: string;
  description: string;
}

const breastOptions: TreatmentOption[] = [
  { key: "endocrineTherapy", label: "Endocrine Therapy", description: "e.g., Tamoxifen, Letrozole, Anastrozole" },
  { key: "cdk46Inhibitors", label: "CDK4/6 Inhibitors", description: "e.g., Ibrance, Kisqali, Verzenio" },
  { key: "antiHer2", label: "Anti-HER2 Therapy", description: "e.g., Herceptin, Perjeta, Kadcyla" },
  { key: "adcs", label: "Antibody-Drug Conjugates", description: "e.g., Enhertu, Trodelvy" },
];

const lungOptions: TreatmentOption[] = [
  { key: "immunotherapy", label: "Immunotherapy", description: "e.g., Keytruda, Opdivo, Tecentriq" },
  { key: "targetedTherapy", label: "Targeted Therapy", description: "e.g., Tagrisso, Alecensa, Lorbrena" },
  { key: "platinumChemo", label: "Platinum Chemotherapy", description: "e.g., Cisplatin, Carboplatin + Pemetrexed" },
];

function TreatmentItem({
  option,
  value,
  onChange,
  index,
}: {
  option: TreatmentOption;
  value: boolean | "unsure";
  onChange: (value: boolean | "unsure") => void;
  index: number;
}) {
  const isUnsure = value === "unsure";
  const isChecked = value === true;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isUnsure
          ? "bg-muted/50 border-muted opacity-60"
          : isChecked
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id={option.key}
            checked={isChecked}
            disabled={isUnsure}
            onCheckedChange={(checked) => onChange(checked as boolean)}
            className="mt-1"
          />
          <div>
            <Label
              htmlFor={option.key}
              className={`font-medium cursor-pointer ${isUnsure ? "text-muted-foreground" : "text-foreground"}`}
            >
              {option.label}
            </Label>
            <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs ${isUnsure ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
            Unsure
          </span>
          <Switch
            checked={isUnsure}
            onCheckedChange={(checked) => onChange(checked ? "unsure" : false)}
            className="data-[state=checked]:bg-muted-foreground"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function TreatmentHistory({
  cancerType,
  breastTreatments,
  lungTreatments,
  onBreastChange,
  onLungChange,
  hasAutoFilled,
}: TreatmentHistoryProps) {
  if (!cancerType) return null;

  const options = cancerType === "breast" ? breastOptions : lungOptions;
  const treatments = cancerType === "breast" ? breastTreatments : lungTreatments;

  const handleItemChange = (key: string, value: boolean | "unsure") => {
    if (cancerType === "breast") {
      onBreastChange(key as keyof PatientData["breastTreatments"], value);
    } else {
      onLungChange(key as keyof PatientData["lungTreatments"], value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Medication Details</h3>
          <p className="text-sm text-muted-foreground">Check all that apply</p>
        </div>
        {hasAutoFilled && (
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
            Auto-filled
          </span>
        )}
      </div>
      {options.map((option, index) => (
        <TreatmentItem
          key={option.key}
          option={option}
          value={treatments[option.key as keyof typeof treatments]}
          onChange={(value) => handleItemChange(option.key, value)}
          index={index}
        />
      ))}
    </motion.div>
  );
}
