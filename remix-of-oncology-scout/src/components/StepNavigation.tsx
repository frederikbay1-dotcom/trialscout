import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  showBack = true,
}: StepNavigationProps) {
  const isFinalStep = currentStep === 3;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 shadow-lg"
    >
      <div className="container max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Back Button */}
          <div className="flex-1">
            {showBack && currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 min-h-[48px] px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          {/* Next Button */}
          <div className="flex-1 flex justify-end">
            {currentStep < totalSteps && (
              <Button
                onClick={onNext}
                disabled={nextDisabled}
                className={`min-h-[48px] px-8 font-medium ${
                  isFinalStep 
                    ? "bg-blue-600 hover:bg-blue-700 text-white text-lg px-10" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isFinalStep && <Sparkles className="w-4 h-4 mr-2" />}
                {nextLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
