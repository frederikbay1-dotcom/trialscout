import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export function GlobalSafetyBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  useEffect(() => {
    // Check if user has seen the banner before in this session
    const viewed = sessionStorage.getItem("safety_banner_viewed");
    if (viewed) {
      setHasBeenViewed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("safety_banner_viewed", "true");
  };

  if (isDismissed) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-warning/10 border-b border-warning/30 px-4 py-2">
      <div className="container max-w-6xl mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-warning-foreground shrink-0" />
        <p className="text-xs sm:text-sm text-warning-foreground font-medium text-center flex-1">
          <span className="font-semibold">Research Use Only:</span> Matches are informational. 
          Final eligibility is determined by the trial site.
        </p>
        {hasBeenViewed && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-warning/20 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-warning-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}