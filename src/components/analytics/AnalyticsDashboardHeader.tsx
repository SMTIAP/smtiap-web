import SurveyTitleBadge from "./SurveyTitleBadge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnalyticsToolbar from "./AnalyticsToolbar";

interface AnalyticsDashboardHeaderProps {
  surveyTitle: string;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
}

// Header for the analytics dashboard showing total responses, source count, and NPS score.
export default function AnalyticsDashboardHeader({
  surveyTitle,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: AnalyticsDashboardHeaderProps) {
  const navigate = useNavigate();
  return (
    <>
      <div className="w-full flex justify-end mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex py-3 items-center gap-3 flex-wrap w-full">
          <SurveyTitleBadge surveyTitle={surveyTitle} />
        </div>
        <AnalyticsToolbar
          surveyTitle={surveyTitle}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />
      </div>
    </>
  );
}
