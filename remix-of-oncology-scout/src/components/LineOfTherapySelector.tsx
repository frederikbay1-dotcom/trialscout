import { LineOfTherapy, TherapyEndDate, BestResponse } from "@/types/oncology";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LineOfTherapySelectorProps {
  value: LineOfTherapy;
  onChange: (line: LineOfTherapy) => void;
  lastTherapyEndDate?: TherapyEndDate;
  onLastTherapyEndDateChange?: (date: TherapyEndDate) => void;
  bestResponse?: BestResponse;
  onBestResponseChange?: (response: BestResponse) => void;
}

const lineOptions: { value: LineOfTherapy; label: string; description: string }[] = [
  { 
    value: "first", 
    label: "First Line (Newly Diagnosed)", 
    description: "No prior systemic therapy for advanced disease" 
  },
  { 
    value: "post_targeted", 
    label: "Progressed on Targeted Therapy", 
    description: "Tried targeted therapy (e.g., EGFR TKI, CDK4/6i) but disease progressed" 
  },
  { 
    value: "post_chemo_immuno", 
    label: "Progressed on Chemo/Immunotherapy", 
    description: "Tried chemotherapy and/or immunotherapy but disease progressed" 
  },
  { 
    value: "later_line", 
    label: "Ran Out of Standard Options", 
    description: "Multiple prior therapies, looking for new options" 
  },
];

const therapyEndOptions: { value: TherapyEndDate; label: string }[] = [
  { value: "ongoing", label: "Currently on treatment" },
  { value: "within_30_days", label: "Within last 30 days" },
  { value: "30_90_days", label: "30-90 days ago" },
  { value: "over_90_days", label: "More than 90 days ago" },
  { value: "unknown", label: "I don't remember" },
];

const bestResponseOptions: { value: BestResponse; label: string }[] = [
  { value: "responding", label: "Responding (tumor shrinking)" },
  { value: "stable", label: "Stable disease (no change)" },
  { value: "progressed", label: "Progressed (tumor growing)" },
  { value: "unknown", label: "I don't know" },
];

export function LineOfTherapySelector({ 
  value, 
  onChange,
  lastTherapyEndDate,
  onLastTherapyEndDateChange,
  bestResponse,
  onBestResponseChange,
}: LineOfTherapySelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-2xl font-semibold text-gray-900 block mb-4">Current Treatment Status</label>
        <p className="text-base text-gray-600 mb-4">Where are you in your cancer treatment journey?</p>
        
        <RadioGroup
          value={value || undefined}
          onValueChange={(val) => onChange(val as LineOfTherapy)}
          className="space-y-3"
        >
          {lineOptions.map((option) => (
            <div
              key={option.value}
              className={cn(
                "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                value === option.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              )}
              onClick={() => onChange(option.value)}
            >
              <RadioGroupItem 
                value={option.value!} 
                id={option.value!}
                className="border-gray-400 data-[state=checked]:border-blue-600 mt-0.5 w-5 h-5"
              />
              <div className="flex-1">
                <Label 
                  htmlFor={option.value!} 
                  className={cn(
                    "cursor-pointer text-base font-medium block",
                    value === option.value ? "text-blue-700" : "text-gray-900"
                  )}
                >
                  {option.label}
                </Label>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Treatment Timing - Only show if not first line */}
      {value && value !== "first" && onLastTherapyEndDateChange && (
        <div className="p-5 bg-gray-50 rounded-xl space-y-5 border border-gray-200">
          <div>
            <label className="text-base font-medium text-gray-900 block mb-3">
              When did your most recent treatment end?
            </label>
            <Select 
              value={lastTherapyEndDate || undefined} 
              onValueChange={(val) => onLastTherapyEndDateChange(val as TherapyEndDate)}
            >
              <SelectTrigger className="w-full max-w-sm bg-white min-h-[48px] text-base">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {therapyEndOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value!} className="py-3">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onBestResponseChange && (
            <div>
              <label className="text-base font-medium text-gray-900 block mb-3">
                What was the best response to your last treatment?
              </label>
              <Select 
                value={bestResponse || undefined} 
                onValueChange={(val) => onBestResponseChange(val as BestResponse)}
              >
                <SelectTrigger className="w-full max-w-sm bg-white min-h-[48px] text-base">
                  <SelectValue placeholder="Select response" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {bestResponseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value!} className="py-3">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
