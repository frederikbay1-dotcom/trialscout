import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { HealthAnswer } from "@/types/oncology";

interface HealthQuestionProps {
  question: string;
  value: HealthAnswer;
  onChange: (value: HealthAnswer) => void;
  delay?: number;
}

export function HealthQuestion({ question, value, onChange, delay = 0 }: HealthQuestionProps) {
  const options: { value: HealthAnswer; label: string }[] = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
    { value: "unknown", label: "I don't know" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="p-5 bg-gray-50 rounded-xl border border-gray-200"
    >
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-gray-900 font-medium text-base">{question}</p>
      </div>
      <div className="flex flex-wrap gap-3 ml-8">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200 min-h-[44px] ${
              value === option.value
                ? option.value === "yes"
                  ? "bg-red-100 text-red-800 border-2 border-red-300"
                  : option.value === "unknown"
                  ? "bg-amber-100 text-amber-800 border-2 border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
