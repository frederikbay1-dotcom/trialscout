import { motion } from "framer-motion";
import { ArrowRight, Shield, Lock, Eye, FileSearch, Share2, ClipboardCheck, AlertTriangle, Check } from "lucide-react";
import { FictionalPatientDisclaimer } from "@/components/FictionalPatientDisclaimer";
import { Button } from "@/components/ui/button";
import { SAMPLE_PATIENT_DESCRIPTIONS, SamplePatientKey } from "@/data/samplePatients";

interface LandingStepProps {
  onStart: () => void;
  onTrySample?: (patientKey: SamplePatientKey) => void;
}

const sampleColors: Record<SamplePatientKey, string> = {
  her2_low: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
  post_cdk46: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
  tnbc: "border-pink-200 hover:border-pink-400 hover:bg-pink-50",
  egfr: "border-green-200 hover:border-green-400 hover:bg-green-50",
};

export function LandingStep({ onStart, onTrySample }: LandingStepProps) {
  const howItWorksSteps = [
    {
      icon: <FileSearch className="w-6 h-6" />,
      title: "Enter Your Info",
      description: "Upload clinical documents or manually enter your diagnosis details",
    },
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "We Match You",
      description: "Our tool analyzes your profile against active trials from ClinicalTrials.gov",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Share with Doctor",
      description: "Download a summary to discuss potential options with your care team",
    },
  ];

  const trustSignals = [
    { icon: <Check className="w-4 h-4" />, text: "Information from ClinicalTrials.gov" },
    { icon: <Shield className="w-4 h-4" />, text: "Free and confidential" },
    { icon: <Check className="w-4 h-4" />, text: "No medical advice provided" },
    { icon: <Check className="w-4 h-4" />, text: "Built with oncologists" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-200">
            <Shield className="w-4 h-4" />
            Privacy-First Clinical Trial Matching
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Find Clinical Trials That
            <br />
            <span className="text-blue-600">May Match You</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed">
            This tool helps you discover clinical trials you might be eligible for.
            Your doctor will help determine if a trial is right for your specific situation.
          </p>
          
          {/* Trust Signals Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-blue-600">{signal.icon}</span>
                  <span className="text-gray-700">{signal.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex items-center justify-center mb-6">
            <Button
              onClick={onStart}
              size="lg"
              className="btn-primary text-lg px-8 py-6 h-auto min-h-[56px] w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 relative">
                  {step.icon}
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{step.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-3 w-6">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Privacy Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-6 max-w-2xl mx-auto mb-8"
        >
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                🔒 Your Privacy is Protected
              </h3>
              <p className="text-sm text-green-800">
                We don't collect or store your medical information. All trial matching
                happens locally in your browser. Your data never leaves your device and
                is automatically cleared when you close the page.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>No Data Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>HTTPS Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Privacy First</span>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-600 mt-8 max-w-2xl mx-auto"
        >
          <AlertTriangle className="w-4 h-4 inline-block mr-1 text-amber-500" />
          <span className="italic">
            <strong>Important:</strong> This tool provides educational information only.
            It does not provide medical advice or guarantee trial enrollment.
            Always consult your healthcare provider before making treatment decisions.
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-base text-gray-600 mt-4 flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4 text-blue-600" />
          Your data stays in your browser. Nothing is sent to our servers.
        </motion.p>
      </div>
    </div>
  );
}
