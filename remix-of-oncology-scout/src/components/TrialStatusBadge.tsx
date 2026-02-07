import { cn } from "@/lib/utils";
import { Clock, MapPin, AlertTriangle } from "lucide-react";
import { TrialStatus } from "@/types/oncology";

interface TrialStatusBadgeProps {
  status: TrialStatus;
  compact?: boolean;
}

export function TrialStatusBadge({ status, compact = false }: TrialStatusBadgeProps) {
  const isRecent = new Date(status.lastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
        status.recruiting 
          ? "bg-emerald-100 text-emerald-800" 
          : "bg-slate-100 text-slate-600"
      )}>
        <span className={cn("w-1.5 h-1.5 rounded-full", status.recruiting ? "bg-emerald-500" : "bg-slate-400")} />
        {status.recruiting ? "Recruiting" : "Not Recruiting"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-medium",
        status.recruiting 
          ? "bg-emerald-100 text-emerald-800" 
          : "bg-slate-100 text-slate-600"
      )}>
        <span className={cn("w-2 h-2 rounded-full", status.recruiting ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
        {status.recruiting ? "Actively Recruiting" : "Not Currently Recruiting"}
      </span>
      
      <span className={cn(
        "flex items-center gap-1 text-muted-foreground",
        !isRecent && "text-amber-600"
      )}>
        <Clock className="w-3 h-3" />
        Updated {status.lastUpdated}
        {!isRecent && <AlertTriangle className="w-3 h-3 ml-1" />}
      </span>
      
      {status.activeSitesNearUser > 0 && (
        <span className="flex items-center gap-1 text-primary font-medium">
          <MapPin className="w-3 h-3" />
          {status.activeSitesNearUser} sites near you
        </span>
      )}
    </div>
  );
}
