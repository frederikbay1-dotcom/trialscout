import { ECOGStatus } from "@/types/oncology";
import { HelpCircle, Info } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ECOGSelectorProps {
  value: ECOGStatus;
  onChange: (status: ECOGStatus) => void;
  ecogUnknown?: boolean;
  onEcogUnknownChange?: (unknown: boolean) => void;
}

const ecogOptions: { value: string; label: string; description: string }[] = [
  { value: "0", label: "ECOG 0", description: "Fully active, no restrictions" },
  { value: "1", label: "ECOG 1", description: "Light work possible, restricted strenuous activity" },
  { value: "2", label: "ECOG 2", description: "Up and about >50% of waking hours, self-care capable" },
  { value: "3", label: "ECOG 3", description: "Limited self-care, confined to bed/chair >50% of time" },
  { value: "4", label: "ECOG 4", description: "Completely disabled, no self-care" },
];

export function ECOGSelector({ value, onChange, ecogUnknown, onEcogUnknownChange }: ECOGSelectorProps) {
  const handleChange = (val: string) => {
    onChange(parseInt(val) as ECOGStatus);
    if (onEcogUnknownChange) {
      onEcogUnknownChange(false);
    }
  };

  const handleUnknownChange = (checked: boolean) => {
    if (onEcogUnknownChange) {
      onEcogUnknownChange(checked);
      if (checked) {
        onChange(null);
      }
    }
  };

  const getDisplayValue = () => {
    if (ecogUnknown || value === null) return undefined;
    return String(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-2xl font-semibold text-gray-900">ECOG Performance Status</label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-gray-500 hover:text-gray-700 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-white text-gray-900 border border-gray-200 shadow-lg">
              <p className="text-sm">Doctors use this to measure your daily activity level. Ask your care team if unsure.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Helper Text */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-base text-gray-700">
          <strong>How are you feeling day-to-day?</strong> If you can care for yourself fully and do light work, you're likely ECOG 0-1. Most clinical trials require ECOG 0-1.
        </p>
      </div>
      
      <Select 
        value={getDisplayValue()} 
        onValueChange={handleChange}
        disabled={ecogUnknown}
      >
        <SelectTrigger className={`w-full max-w-md bg-white border-gray-300 min-h-[48px] text-base ${ecogUnknown ? 'opacity-50' : ''}`}>
          <SelectValue placeholder="Select your performance status" />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 z-50">
          {ecogOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="py-3">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{option.label}</span>
                <span className="text-sm text-gray-600">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* I don't know checkbox */}
      {onEcogUnknownChange && (
        <div className="flex items-center space-x-3 pt-2">
          <Checkbox 
            id="ecog-unknown" 
            checked={ecogUnknown}
            onCheckedChange={handleUnknownChange}
            className="w-5 h-5"
          />
          <Label 
            htmlFor="ecog-unknown" 
            className="text-base text-gray-600 cursor-pointer"
          >
            I don't know my ECOG status
          </Label>
        </div>
      )}
    </div>
  );
}
