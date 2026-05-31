import BackButton from "../BackButton";
import SurveyTitleBadge from "./SurveyTitleBadge";
import AnalyticsToolbar from "./AnalyticsToolbar";

interface AnalyticsDashboardHeaderProps {
  surveyTitle: string;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
}

export default function AnalyticsDashboardHeader({
  surveyTitle,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: AnalyticsDashboardHeaderProps) {
  return (
    <>
      <div className="w-full flex justify-start mb-6">
        <BackButton to="/analytics" />
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
