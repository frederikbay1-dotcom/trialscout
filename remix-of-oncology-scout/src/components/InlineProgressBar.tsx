import { motion } from "framer-motion";

interface InlineProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export function InlineProgressBar({ currentStep, totalSteps, stepLabel }: InlineProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="progress-bar-container">
      <div className="container max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep} of {totalSteps}: {stepLabel}
          </span>
          <span className="text-sm font-medium text-blue-600">{percentage}%</span>
        </div>
        <div className="inline-progress">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-progress-fill"
          />
        </div>
      </div>
    </div>
  );
}
