import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

// Custom hooks — own all state, effects, and chart computation
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useAnalyticsCharts } from "../hooks/useAnalyticsCharts";

// Analytics sub-components
import SurveySelectorView from "../components/analytics/SurveySelectorView";
import AnalyticsTopBar from "../components/analytics/AnalyticsTopBar";
import AnalyticsDashboardHeader from "../components/analytics/AnalyticsDashboardHeader";
import AnalyticsChartsSection from "../components/analytics/AnalyticsChartsSection";
import AiInsightsSection from "../components/analytics/AiInsightsSection";

// Register Chart.js modules needed for Bar and Pie charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

// Main page component — thin orchestrator, no business logic
export default function Analytics() {
  const [searchParams] = useSearchParams();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // surveyId comes from ?surveyId= query param. If absent, show survey list.
  const surveyId = useMemo(
    () =>
      searchParams.get("surveyId")?.trim() ||
      import.meta.env.VITE_DEFAULT_SURVEY_ID ||
      "",
    [searchParams],
  );

  // Date range filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // All data-fetching state, side-effects, and runAnalysis handler
  const {
    surveyTitle,
    totalResponses,
    surveyQuestions,
    surveyResponses,
    summary,
    keywords,
    isAnalyzing,
    aiError,
    finishedSurveys,
    surveysLoading,
    runAnalysis,
  } = useAnalyticsData(surveyId, apiBaseUrl);

  // Filter responses by date range (client-side)
  const filteredResponses = useMemo(() => {
    if (!fromDate && !toDate) return surveyResponses;
    return surveyResponses.filter((response) => {
      const submittedRaw = response?.submittedAt ?? response?.createdAt;
      const submittedDate = submittedRaw ? new Date(submittedRaw) : null;
      if (!submittedDate) return !fromDate && !toDate;
      if (fromDate) {
        const start = new Date(`${fromDate}T00:00:00`);
        if (submittedDate < start) return false;
      }
      if (toDate) {
        const end = new Date(`${toDate}T23:59:59.999`);
        if (submittedDate > end) return false;
      }
      return true;
    });
  }, [surveyResponses, fromDate, toDate]);

  const filteredTotalResponses = filteredResponses.length;

  // All chart datasets, options, and derived stats (memoised)
  const {
    ratingQuestions,
    multipleChoiceQuestions,
    checkboxQuestions,
    completionRate,
    averageRating,
    ratingData,
    ratingOptions,
    buildOptionChartData,
    optionChartOptions,
  } = useAnalyticsCharts(surveyQuestions, filteredResponses);

  // Render: survey picker (no surveyId in URL)
  if (!surveyId) {
    return (
      <SurveySelectorView
        surveysLoading={surveysLoading}
        finishedSurveys={finishedSurveys}
      />
    );
  }

  // Render: full analytics dashboard
  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC] dark:bg-[#0F172A] font-inter text-[#0D141C] dark:text-white transition-colors duration-300">
      <AnalyticsTopBar />

      <main className="flex-1 flex flex-col items-center">
        <div className="max-w-[960px] w-full px-4 md:px-0 py-5">
          {/* Component  - back nav + survey title badge + filter/export toolbar */}
          <AnalyticsDashboardHeader
            surveyTitle={surveyTitle}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />

          {/* Export-aware wrapper */}
          <div id="analytics-export-area">
            {/* Component - stat cards + chart sections */}
            <AnalyticsChartsSection
              totalResponses={filteredTotalResponses}
              completionRate={completionRate}
              averageRating={averageRating}
              ratingQuestions={ratingQuestions}
              ratingData={ratingData}
              ratingOptions={ratingOptions}
              multipleChoiceQuestions={multipleChoiceQuestions}
              checkboxQuestions={checkboxQuestions}
              getQuestionId={(q) => String(q._id ?? q.id ?? "").trim()}
              buildOptionChartData={buildOptionChartData}
              optionChartOptions={optionChartOptions}
            />

            {/* Component - AI insights card */}
            <AiInsightsSection
              runAnalysis={runAnalysis}
              isAnalyzing={isAnalyzing}
              aiError={aiError}
              summary={summary}
              keywords={keywords}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
