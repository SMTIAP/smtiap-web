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

// Displays the survey picker view when no surveyId is selected in the URL.
export default function SurveySelectorView({
  surveysLoading,
  finishedSurveys,
}: SurveySelectorViewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC] font-inter text-[#0D141C]">
      <nav className="flex py-3 px-10 border-b border-[#E5E8EB] bg-white w-full sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EDF2]">
            <BarChart size={20} className="text-[#0D141C]" />
          </div>
          <h1 className="text-lg font-bold">Survey Analytics</h1>
        </div>
      </nav>

      {/* Constrained content area — max width keeps cards readable on wide screens. */}
      <main className="flex-1 max-w-300 mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-[#0D141C]">
            Finished Surveys
          </h2>
          <p className="text-[#4A739C] mt-2">
            Select a finished survey to view analytics and AI insights.
          </p>
        </div>

        {/* Show loading spinner, empty state, or the survey card grid. */}
        {surveysLoading ? (
          <div className="text-sm text-[#4A739C]">
            Loading finished surveys...
          </div>
        ) : finishedSurveys.length === 0 ? (
          <div className="rounded-xl border border-[#CFDBE8] bg-white p-8 text-[#4A739C]">
            No finished surveys found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Render each finished survey as a selectable card. */}
            {finishedSurveys.map((survey) => (
              <SurveyCard
                key={survey._id}
                title={survey.surveyTitle || "Untitled Survey"}
                date={
                  survey.createdAt
                    ? new Date(survey.createdAt).toLocaleDateString("en-GB")
                    : undefined
                }
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
