import { motion } from "framer-motion";

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const stepLabels = ["Medical Info", "Clinical Details", "Your Matches"];

export function ProgressTracker({ currentStep, totalSteps, onStepClick }: ProgressTrackerProps) {
  const getPercentage = (step: number) => {
    return Math.round((step / totalSteps) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 right-6 z-50"
    >
      <div className="bg-white px-8 py-4 rounded-xl shadow-lg border border-gray-200">
        <div className="relative flex items-start">
          {/* Connecting line */}
          <div 
            className="absolute top-[14px] h-0.5 bg-gray-200"
            style={{ left: "16px", right: "16px" }}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          
          {/* Step circles */}
          <div className="relative flex items-start gap-12">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => onStepClick?.(i + 1)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 text-sm font-bold ${
                    i + 1 <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  } ${i + 1 === currentStep ? "ring-2 ring-blue-200 ring-offset-2 ring-offset-white" : ""}`}
                  aria-label={`Go to ${stepLabels[i]}`}
                >
                  {i + 1}
                </button>
                <div className="text-center">
                  <span
                    className={`text-sm font-semibold whitespace-nowrap transition-colors block ${
                      i + 1 <= currentStep ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {stepLabels[i]}
                  </span>
                  <span className={`text-xs ${i + 1 <= currentStep ? "text-blue-600" : "text-gray-400"}`}>
                    {getPercentage(i + 1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
