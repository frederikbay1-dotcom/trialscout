import { cn } from "@/lib/utils";
import { Calendar, Scissors, Building2 } from "lucide-react";
import { TrialBurden } from "@/types/oncology";

interface TrialBurdenIndicatorProps {
  burden: TrialBurden;
  compact?: boolean;
}

const burdenScoreConfig: Record<TrialBurden["burdenScore"], { label: string; className: string }> = {
  low: { label: "Low Burden", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  medium: { label: "Medium Burden", className: "bg-amber-100 text-amber-800 border-amber-200" },
  high: { label: "High Burden", className: "bg-rose-100 text-rose-800 border-rose-200" },
};

export function TrialBurdenIndicator({ burden, compact = false }: TrialBurdenIndicatorProps) {
  const scoreConfig = burdenScoreConfig[burden.burdenScore];

  if (compact) {
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", scoreConfig.className)}>
        {scoreConfig.label}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold border", scoreConfig.className)}>
        {scoreConfig.label}
      </span>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {burden.visitsPerMonth} visits/month
        </span>
        <span className="flex items-center gap-1">
          <Scissors className="w-3.5 h-3.5" />
          Biopsy: {burden.biopsyRequired ? "Yes" : "No"}
        </span>
        <span className="flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5" />
          Hospital stay: {burden.hospitalDays ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );
}
