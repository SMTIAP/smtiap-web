import BackButton from "../BackButton";
import SurveyTitleBadge from "./SurveyTitleBadge";
import AnalyticsToolbar from "./AnalyticsToolbar";

interface AnalyticsDashboardHeaderProps {
  // The title of the currently selected survey, passed down from Analytics.tsx state.
  surveyTitle: string;
}

// Renders the back-navigation row, survey badge, and action toolbar.
export default function AnalyticsDashboardHeader({
  surveyTitle,
}: AnalyticsDashboardHeaderProps) {
  return (
    <>
      {/* Back navigation — returns to the survey selector list */}
      <div className="w-full flex justify-start mb-6">
        <BackButton to="/analytics" />
      </div>

      {/* Survey badge + toolbar row */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Survey title badge row */}
        <div className="flex py-3 items-center gap-3 flex-wrap w-full">
          <SurveyTitleBadge surveyTitle={surveyTitle} />
        </div>

        {/* Filter + export action toolbar */}
        <AnalyticsToolbar surveyTitle={surveyTitle} />
      </div>
    </>
  );
}
