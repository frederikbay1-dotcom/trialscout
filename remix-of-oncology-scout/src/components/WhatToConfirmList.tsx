import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatToConfirmListProps {
  items: string[];
  className?: string;
  variant?: "default" | "compact";
}

export function WhatToConfirmList({ items, className, variant = "default" }: WhatToConfirmListProps) {
  if (!items || items.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className={cn("text-xs", className)}>
        <span className="font-medium text-amber-700">Confirm: </span>
        <span className="text-muted-foreground">{items.join(", ")}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
        <AlertCircle className="w-4 h-4" />
        <span>What to Confirm Next</span>
      </div>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
