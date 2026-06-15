import ExportPdfButton from "../ExportPdfButton";

interface AnalyticsToolbarProps {
  // Used to name the exported PDF file: `<surveyTitle>-analytics.pdf`
  surveyTitle: string;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
}

// Renders a row with date range filter on the left and an export button on the right.
// Toolbar for the analytics view with date range picker and export controls.
export default function AnalyticsToolbar({
  surveyTitle,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: AnalyticsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
      {/* Date range filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="self-end sm:self-center px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Export button — captures the analytics-export-area div as a PDF */}
      <ExportPdfButton
        targetId="analytics-export-area"
        fileName={`${surveyTitle}-analytics`}
      />
    </div>
  );
}
