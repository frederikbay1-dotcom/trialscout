import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { ConfidenceLevel } from "@/types/oncology";

interface ConfidenceIndicatorProps {
  confidence: ConfidenceLevel;
  source?: string;
  className?: string;
}

const confidenceConfig: Record<ConfidenceLevel, { 
  label: string; 
  icon: React.ReactNode; 
  className: string;
}> = {
  high: {
    label: "✓ Confirmed",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  medium: {
    label: "⚠️ Please review",
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  low: {
    label: "⚠️ Please verify",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function ConfidenceIndicator({ confidence, source, className }: ConfidenceIndicatorProps) {
  const config = confidenceConfig[confidence];

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
          config.className
        )}
      >
        {config.icon}
        {config.label}
      </span>
      {source && (
        <span className="text-[10px] text-muted-foreground pl-1">
          Source: {source}
        </span>
      )}
    </div>
  );
}
