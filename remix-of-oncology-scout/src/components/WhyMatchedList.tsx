import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyMatchedListProps {
  items: string[];
  className?: string;
  variant?: "default" | "compact";
}

export function WhyMatchedList({ items, className, variant = "default" }: WhyMatchedListProps) {
  if (!items || items.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20"
          >
            <CheckCircle2 className="w-3 h-3" />
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-success">
        <Sparkles className="w-4 h-4" />
        <span>Why This Matched</span>
      </div>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
