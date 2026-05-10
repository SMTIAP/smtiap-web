
import { Filter } from "lucide-react";
import ExportPdfButton from "../ExportPdfButton";

interface AnalyticsToolbarProps {
  // Used to name the exported PDF file: `<surveyTitle>-analytics.pdf`
  surveyTitle: string;
}

// Renders a row with a filter icon button on the left and an export button on the right.
export default function AnalyticsToolbar({
  surveyTitle,
}: AnalyticsToolbarProps) {
  return (
    <div className="flex justify-between items-center w-full">
      {/* Filter button — placeholder for future filter/segment functionality */}
      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Filter size={24} className="text-[#0D141C]" />
      </button>

      {/* Export button — captures the analytics-export-area div as a PDF */}
      <ExportPdfButton
        targetId="analytics-export-area"
        fileName={`${surveyTitle}-analytics`}
      />
    </div>
  );
}
