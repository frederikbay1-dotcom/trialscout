import { HelpCircle, FileText, Phone, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BiomarkerHelperData } from "@/data/biomarkerHelpers";

export function BiomarkerHelper({
  title,
  whereToFind,
  documentNames,
  whoToAsk,
  example,
  reportSection,
}: BiomarkerHelperData) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors ml-1.5"
          aria-label={`Help for ${title}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <Search className="w-4 h-4 text-blue-600" />
            Where to Find {title}
          </h4>

          <div className="space-y-1.5">
            {whereToFind.map((instruction, i) => (
              <p key={i} className="text-xs text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{instruction}</span>
              </p>
            ))}
          </div>

          {documentNames && documentNames.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
              <div className="flex items-start gap-2 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                <p className="text-xs font-medium text-blue-900">
                  Look for these documents:
                </p>
              </div>
              <ul className="text-xs text-blue-800 space-y-0.5 ml-5">
                {documentNames.map((doc, i) => (
                  <li key={i}>• {doc}</li>
                ))}
              </ul>
            </div>
          )}

          {reportSection && (
            <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-200">
              <p className="text-xs text-purple-900">
                <strong>Common section name:</strong> "{reportSection}"
              </p>
            </div>
          )}

          {example && (
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <p className="text-xs text-gray-600 mb-0.5">
                <strong>Example from report:</strong>
              </p>
              <p className="text-xs text-gray-700 font-mono">{example}</p>
            </div>
          )}

          {whoToAsk && (
            <div className="bg-green-50 rounded-lg p-2.5 border border-green-200">
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                <p className="text-xs text-green-900">
                  <strong>Can't find it?</strong> {whoToAsk}
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Don't worry if you can't find this — you can still see trial matches
            and discuss specific requirements with trial coordinators.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
