import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TrustCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function TrustCard({ icon, title, description, delay = 0 }: TrustCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.4 }}
      className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
