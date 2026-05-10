import { BarChart } from "lucide-react";

// Renders the sticky dashboard navbar with the page title.
export default function AnalyticsTopBar() {
  return (
    <nav className="flex py-3 px-10 border-b border-[#E5E8EB] bg-white w-full sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EDF2]">
          <BarChart size={20} className="text-[#0D141C]" />
        </div>
        <h1 className="text-lg font-bold">Survey Analytics</h1>
      </div>
    </nav>
  );
}
