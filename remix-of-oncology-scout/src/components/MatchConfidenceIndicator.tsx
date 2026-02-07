import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { MatchConfidence } from "@/types/oncology";

interface MatchConfidenceIndicatorProps {
  confidence: MatchConfidence;
  className?: string;
}

const confidenceConfig: Record<MatchConfidence, { 
  label: string; 
  icon: React.ReactNode; 
  className: string;
  description: string;
}> = {
  high: {
    label: "High Match",
    icon: <ShieldCheck className="w-4 h-4" />,
    className: "bg-success/10 text-success border-success/30",
    description: "Strong alignment with trial requirements",
  },
  medium: {
    label: "Medium Match",
    icon: <ShieldQuestion className="w-4 h-4" />,
    className: "bg-warning/10 text-warning-foreground border-warning/30",
    description: "Some criteria need confirmation",
  },
  low: {
    label: "Low Match",
    icon: <ShieldAlert className="w-4 h-4" />,
    className: "bg-destructive/10 text-destructive border-destructive/30",
    description: "Missing key information",
  },
};

export function MatchConfidenceIndicator({ confidence, className }: MatchConfidenceIndicatorProps) {
  const config = confidenceConfig[confidence];

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
          config.className
        )}
      >
        {config.icon}
        {config.label}
      </span>
      <span className="text-[10px] text-muted-foreground pl-1">
        {config.description}
      </span>
    </div>
  );
}
