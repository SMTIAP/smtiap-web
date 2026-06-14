import { Check, X } from "lucide-react";

export default function PlanComparisonTable() {
  return (
    <div className="w-full mt-12">
      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] dark:text-white text-center mb-6">
        Compare Plans and Choose What's Best For Your Needs
      </h2>

      <div className="w-full overflow-x-auto rounded-2xl border border-[#E0DEE3] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <th className="text-left px-6 py-4 font-bold text-gray-900 dark:text-white">Feature</th>
              <th className="text-center px-6 py-4 font-bold text-gray-900 dark:text-white">Free</th>
              <th className="text-center px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                Startup
              </th>
              <th className="text-center px-6 py-4 font-bold text-gray-900 dark:text-white">Pro</th>
            </tr>
          </thead>
          <tbody>
            {/* Organization & Members */}
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <td colSpan={4} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Organization &amp; Members
              </td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Number of organization members</td>
              <td className="px-6 py-3 text-center text-gray-700 dark:text-slate-300 font-medium">1 (you only)</td>
              <td className="px-6 py-3 text-center text-gray-700 dark:text-slate-300 font-medium">Up to 10</td>
              <td className="px-6 py-3 text-center text-gray-700 dark:text-slate-300 font-medium">Up to 100</td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Assigning Roles and permissions</td>
              <td className="px-6 py-3 text-center"><X size={18} className="inline text-slate-300 dark:text-slate-600" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Having a Billing manager</td>
              <td className="px-6 py-3 text-center"><X size={18} className="inline text-slate-300 dark:text-slate-600" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>

            {/* Surveys */}
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <td colSpan={4} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Surveys
              </td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Active surveys (published or scheduled)</td>
              <td className="px-6 py-3 text-center text-gray-700 dark:text-slate-300 font-medium">Up to 5</td>
              <td className="px-6 py-3 text-center text-gray-700 dark:text-slate-300 font-medium">Up to 10</td>
              <td className="px-6 py-3 text-center text-gray-700 dark:text-slate-300 font-medium">Up to 100</td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Survey creation and editing</td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Survey templates</td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Scheduled publishing</td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>

            {/* Analytics & AI */}
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <td colSpan={4} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Analytics &amp; AI Responses
              </td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Response analytics dashboard</td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">AI summary &amp; key findings</td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">AI custom specific questions</td>
              <td className="px-6 py-3 text-center"><X size={18} className="inline text-slate-300 dark:text-slate-600" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>

            {/* Support */}
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <td colSpan={4} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Customer Support
              </td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Community support</td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="border-b border-[#E0DEE3] dark:border-slate-700">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Priority support</td>
              <td className="px-6 py-3 text-center"><X size={18} className="inline text-slate-300 dark:text-slate-600" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
            <tr className="last:border-b-0">
              <td className="px-6 py-3 text-gray-700 dark:text-slate-300">Dedicated account manager</td>
              <td className="px-6 py-3 text-center"><X size={18} className="inline text-slate-300 dark:text-slate-600" /></td>
              <td className="px-6 py-3 text-center"><X size={18} className="inline text-slate-300 dark:text-slate-600" /></td>
              <td className="px-6 py-3 text-center"><Check size={18} className="inline text-emerald-500" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}