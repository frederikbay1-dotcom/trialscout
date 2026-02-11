import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, Loader2, AlertCircle } from "lucide-react";

interface FileUploadZoneProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isUploaded: boolean;
  onUploadComplete: (extractedData?: any) => void;
  cancerType?: 'breast' | 'lung';
}

export function FileUploadZone({
  icon,
  label,
  description,
  isUploaded,
  onUploadComplete,
  cancerType,
}: FileUploadZoneProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (isUploaded || isScanning) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or text file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (cancerType) {
        formData.append('cancer_type', cancerType);
      }

      const response = await fetch('http://localhost:8000/api/v1/extract-biomarkers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to extract biomarkers');
      }

      const result = await response.json();
      setIsScanning(false);
      onUploadComplete(result.biomarker_data);
    } catch (err: any) {
      setIsScanning(false);
      setError(err.message || 'Failed to process document');
      console.error('Upload error:', err);
    }
  }, [isUploaded, isScanning, onUploadComplete, cancerType]);

  const handleUpload = useCallback(() => {
    if (isUploaded || isScanning) return;
    fileInputRef.current?.click();
  }, [isUploaded, isScanning]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div
        onClick={handleUpload}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-zone relative p-8 flex flex-col items-center justify-center h-[200px] text-center ${
          isDragOver ? "upload-zone-active" : ""
        } ${isUploaded ? "border-success bg-success/5" : ""} ${
          error ? "border-destructive" : ""
        } ${isScanning ? "pointer-events-none" : ""}`}
      >
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            {/* Scanning Animation */}
            <div className="relative w-16 h-16 flex-shrink-0">
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
                <span className="text-sm font-medium">Analyzing document with AI...</span>
              </div>
              <span className="text-xs text-muted-foreground">This may take 5-10 seconds</span>
            </div>
          </motion.div>
        ) : isUploaded ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <Check className="w-8 h-8" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-success">Uploaded & Analyzed</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              {icon}
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="w-3 h-3" />
              <span>Drop file or click to upload</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 right-2 bg-destructive/10 border border-destructive rounded-lg p-3 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </motion.div>
      )}
    </div>
    </>
  );
}
