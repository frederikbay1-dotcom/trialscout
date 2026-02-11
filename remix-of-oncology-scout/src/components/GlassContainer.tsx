import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassContainerProps {
  children: ReactNode;
  className?: string;
}

export function GlassContainer({ children, className = "" }: GlassContainerProps) {
  return (
    <div className={`glass-card rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
