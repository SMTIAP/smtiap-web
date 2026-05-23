import { BarChart } from "lucide-react";

export default function AnalyticsTopBar() {
  return (
    <div className="sticky top-0 z-20 w-full">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <nav className="flex py-3 px-10 border-b border-[#E5E8EB] dark:border-slate-700 bg-white dark:bg-slate-800 w-full transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EDF2] dark:bg-slate-700">
            <BarChart size={20} className="text-[#0D141C] dark:text-white" />
          </div>
          <h1 className="text-lg font-bold text-[#0D141C] dark:text-white">Survey Analytics</h1>
        </div>
      </nav>
    </div>
  );
}