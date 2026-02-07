import { Check, X, HelpCircle } from "lucide-react";
import { EligibilityCriterion } from "@/types/oncology";

interface EligibilityCriteriaListProps {
  criteria: EligibilityCriterion[];
  compact?: boolean;
}

export function EligibilityCriteriaList({ criteria, compact = false }: EligibilityCriteriaListProps) {
  const getStatusIcon = (status: EligibilityCriterion["status"]) => {
    switch (status) {
      case "met":
        return <Check className="w-4 h-4 text-success" />;
      case "not_met":
        return <X className="w-4 h-4 text-destructive" />;
      case "unknown":
        return <HelpCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBg = (status: EligibilityCriterion["status"]) => {
    switch (status) {
      case "met":
        return "bg-success/10";
      case "not_met":
        return "bg-destructive/10";
      case "unknown":
        return "bg-warning/10";
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {criteria.map((criterion, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${getStatusBg(criterion.status)}`}
            title={criterion.label}
          >
            {getStatusIcon(criterion.status)}
            <span className="max-w-[120px] truncate text-muted-foreground">
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {criteria.map((criterion, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${getStatusBg(criterion.status)}`}>
            {getStatusIcon(criterion.status)}
          </span>
          <span className="text-muted-foreground pt-0.5">{criterion.label}</span>
        </li>
      ))}
    </ul>
  );
}
