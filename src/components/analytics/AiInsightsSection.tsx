import { Sparkles, Loader2 } from "lucide-react";

interface TagProps {
  label: string;
  count: number;
  color: string;
}

const InsightTag = ({ label, count, color }: TagProps) => (
  <div className="flex items-center px-4 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: color }}>
    <span className="text-[#4D7399]">{label} ({count})</span>
  </div>
);

interface AiInsightsSectionProps {
  runAnalysis: () => Promise<void>;
  isAnalyzing: boolean;
  aiError: string | null;
  summary: string | null;
  keywords: { keyword: string; count: number }[];
}

export default function AiInsightsSection({ runAnalysis, isAnalyzing, aiError, summary, keywords }: AiInsightsSectionProps) {
  return (
    <section className="p-6 rounded-lg border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md relative overflow-hidden group transition-colors duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />

      <div className="flex items-center justify-between gap-2 mb-6 relative">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-500" />
          <h2 className="text-lg font-bold dark:text-white">AI Insights</h2>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-[#2B8CED] hover:bg-[#1A76D2] disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
        >
          {isAnalyzing ? (
            <><Loader2 size={16} className="animate-spin" /><span>Analyzing...</span></>
          ) : (
            <><Sparkles size={16} /><span>Run AI Analysis</span></>
          )}
        </button>
      </div>

      {aiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">{aiError}</div>
      )}

      {isAnalyzing && (
        <div className="relative rounded-xl overflow-hidden border border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900 p-8 text-center mb-6">
          <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(270deg, #a5f3fc, #818cf8, #6ee7b7, #fde68a, #f9a8d4, #a5f3fc)", backgroundSize: "400% 400%", animation: "auroraShift 4s ease infinite", padding: "2px", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
          <div className="absolute inset-0 rounded-xl opacity-20" style={{ background: "linear-gradient(270deg, #a5f3fc, #818cf8, #6ee7b7, #fde68a, #f9a8d4)", backgroundSize: "400% 400%", animation: "auroraShift 4s ease infinite", filter: "blur(16px)" }} />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/40 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Reading responses</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Analyzing all survey responses.</p>
          </div>
          <style>{`@keyframes auroraShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
        </div>
      )}

      {!isAnalyzing && (
        <>
          <div className="mb-6 relative">
            <h3 className="text-[#4D7399] dark:text-slate-400 text-base font-medium mb-3">Key Findings</h3>
            {summary ? (
              <ul className="space-y-2 text-black dark:text-white text-base leading-relaxed">
                {summary.split(". ").filter(Boolean).map((sentence, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-green-500">•</span>
                    {sentence.endsWith(".") ? sentence : sentence + "."}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles size={32} className="text-slate-200 dark:text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No analysis yet</p>
                <p className="text-slate-300 dark:text-slate-500 text-xs mt-1">
                  Click <span className="font-semibold">Run AI Analysis</span> to generate insights from your responses.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 relative mt-8">
            {keywords.length > 0 ? (
              keywords.map((item, i) => {
                const colors = ["#C5EFB5", "#B5E9EF", "#C0B5EF", "#EFCCB5", "#EFE4B5"];
                return <InsightTag key={i} label={item.keyword} count={item.count} color={colors[i % colors.length]} />;
              })
            ) : summary ? (
              <p className="text-slate-300 dark:text-slate-600 text-xs">No keywords extracted.</p>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}