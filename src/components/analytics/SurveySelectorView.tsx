import { BarChart } from "lucide-react";
import SurveyCard from "../SurveyCard";

interface SurveyListItem {
  _id: string;
  surveyTitle?: string;
  createdAt?: string;
  status?: string;
}

interface SurveySelectorViewProps {
  surveysLoading: boolean;
  finishedSurveys: SurveyListItem[];
}

export default function SurveySelectorView({ surveysLoading, finishedSurveys }: SurveySelectorViewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC] dark:bg-[#0F172A] font-inter text-[#0D141C] dark:text-white transition-colors duration-300">
      <div className="sticky top-0 z-20 w-full">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <nav className="flex py-3 px-10 border-b border-[#E5E8EB] dark:border-slate-700 bg-white dark:bg-slate-800 w-full transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EDF2] dark:bg-slate-700">
              <BarChart size={20} className="text-[#0D141C] dark:text-white" />
            </div>
            <h1 className="text-lg font-bold dark:text-white">Survey Analytics</h1>
          </div>
        </nav>
      </div>

      <main className="flex-1 max-w-300 mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-[#0D141C] dark:text-white">Finished Surveys</h2>
          <p className="text-[#4A739C] dark:text-slate-400 mt-2">Select a finished survey to view analytics and AI insights.</p>
        </div>

        {surveysLoading ? (
          <div className="text-sm text-[#4A739C] dark:text-slate-400">Loading finished surveys...</div>
        ) : finishedSurveys.length === 0 ? (
          <div className="rounded-xl border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-[#4A739C] dark:text-slate-400">
            No finished surveys found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {finishedSurveys.map((survey) => (
              <SurveyCard
                key={survey._id}
                title={survey.surveyTitle || "Untitled Survey"}
                date={survey.createdAt ? new Date(survey.createdAt).toLocaleDateString("en-GB") : undefined}
                category="Finished"
                variant="finished"
                to={`/analytics?surveyId=${survey._id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}