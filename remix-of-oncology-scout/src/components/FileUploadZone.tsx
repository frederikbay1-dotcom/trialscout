import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, Loader2 } from "lucide-react";

interface FileUploadZoneProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isUploaded: boolean;
  onUploadComplete: () => void;
}

export function FileUploadZone({
  icon,
  label,
  description,
  isUploaded,
  onUploadComplete,
}: FileUploadZoneProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = useCallback(() => {
    if (isUploaded || isScanning) return;

    setIsScanning(true);
    // Simulate AI scanning for 2.5 seconds
    setTimeout(() => {
      setIsScanning(false);
      onUploadComplete();
    }, 2500);
  }, [isUploaded, isScanning, onUploadComplete]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleUpload();
  };

  return (
    <div
      onClick={handleUpload}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`upload-zone relative p-8 flex flex-col items-center justify-center min-h-[200px] text-center ${
        isDragOver ? "upload-zone-active" : ""
      } ${isUploaded ? "border-success bg-success/5" : ""} ${
        isScanning ? "pointer-events-none" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Scanning Animation */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-xl bg-primary/10 overflow-hidden">
                <motion.div
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ y: ["-100%", "1600%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                {icon}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Analyzing document...</span>
              </div>
              <span className="text-xs text-muted-foreground">Extracting clinical data</span>
            </div>
          </motion.div>
        ) : isUploaded ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <Check className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium text-success">Uploaded & Analyzed</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              {icon}
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="w-3 h-3" />
              <span>Drop file or click to upload</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
