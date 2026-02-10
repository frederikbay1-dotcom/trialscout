import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ExtractedBiomarkers {
  cancer_type: string;
  stage: string;
  biomarkers: Record<string, any>;
  prior_treatments: string[];
  extraction_notes?: string;
}

interface DocumentUploadProps {
  onExtracted: (data: ExtractedBiomarkers) => void;
  cancerType?: 'breast' | 'lung';
}

export default function DocumentUpload({ onExtracted, cancerType }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedBiomarkers | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setUploading(true);
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
      setExtractedData(result.biomarker_data);
    } catch (err: any) {
      setError(err.message || 'Failed to process document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onExtracted(extractedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!extractedData && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          
          <label
            htmlFor="document-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-lg font-medium text-gray-700">
                  Extracting biomarkers from your report...
                </p>
                <p className="text-sm text-gray-500">
                  This may take 5-10 seconds
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Upload Pathology Report or Oncology Note
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF or TXT (max 10MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Choose File
                </button>
              </>
            )}
          </label>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Extracted Data Review */}
      {extractedData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Biomarkers Extracted Successfully
            </h3>
          </div>

          <div className="space-y-4">
            {/* Cancer Type & Stage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Cancer Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {extractedData.cancer_type}
                </p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">Stage</p>
                <p className="font-medium text-gray-900">
                  {extractedData.stage}
                </p>
              </div>
            </div>

            {/* Biomarkers */}
            <div className="bg-white rounded p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Biomarkers:</p>
              <div className="space-y-2">
                {Object.entries(extractedData.biomarkers).map(([name, data]: [string, any]) => {
                  // Skip if unknown with low confidence
                  if (data.value === 'unknown' && data.confidence === 'low') return null;
                  
                  return (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{name}:</span>
                        <span className="ml-2 text-gray-700">
                          {typeof data === 'object' ? data.value || data.status || 'Unknown' : data}
                        </span>
                        {data.details && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({data.details})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {data.confidence === 'low' && (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
                            ⚠️ Verify
                          </span>
                        )}
                        {data.confidence === 'medium' && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Review
                          </span>
                        )}
                        {data.confidence === 'high' && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            ✓ High
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extraction Notes */}
            {extractedData.extraction_notes && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> {extractedData.extraction_notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                ✓ Looks Good - Use This Data
              </button>
              <button
                onClick={() => setExtractedData(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Try Another File
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              You'll be able to review and edit all information before matching trials
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!extractedData && !uploading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium mb-2">
            💡 Accepted Documents:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Pathology reports (surgical, biopsy)</li>
            <li>Immunohistochemistry (IHC) results</li>
            <li>Molecular testing reports (FISH, NGS)</li>
            <li>Oncology notes with biomarker information</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Your document is processed securely and is not stored after extraction.
          </p>
        </div>
      )}
    </div>
  );
}