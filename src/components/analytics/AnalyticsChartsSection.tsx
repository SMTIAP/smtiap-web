/**
 * AnalyticsChartsSection
 *
 * Renders all chart-based analytics visuals inside the printable export area.
 * Used in Analytics.tsx after survey data and chart datasets are computed.
 *
 * Sections rendered (conditionally, if questions of that type exist):
 *   - Summary stat cards (total responses, completion rate, average rating)
 *   - Rating Questions  → horizontal Bar chart
 *   - Multiple Choice   → vertical Bar chart per question
 *   - Checkbox          → Pie chart per question
 *
 * All data and chart options are computed in Analytics.tsx and passed as props.
 * The outer `<div id="analytics-export-area">` is targeted by ExportPdfButton.
 */
import { Bar, Pie } from "react-chartjs-2";

interface SurveyQuestion {
  _id?: string;
  id?: string;
  type?: string;
  label?: string;
  options?: string[];
  max?: number;
}

interface AnalyticsChartsSectionProps {
  totalResponses: number;
  completionRate: number;
  averageRating: string | null;
  ratingQuestions: SurveyQuestion[];
  ratingData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderRadius: number;
      barThickness: number;
    }[];
  };
  ratingOptions: {
    indexAxis: "y";
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
      legend: { display: boolean };
      tooltip: { enabled: boolean };
    };
    scales: {
      x: { beginAtZero: boolean; max: number; grid: { display: boolean } };
      y: { grid: { display: boolean } };
    };
  };
  multipleChoiceQuestions: SurveyQuestion[];
  checkboxQuestions: SurveyQuestion[];
  getQuestionId: (question: SurveyQuestion) => string;
  buildOptionChartData: (
    question: SurveyQuestion,
    isCheckbox: boolean,
  ) => {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderRadius: number;
    }[];
  };
  optionChartOptions: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
      legend: { display: boolean };
    };
    scales: {
      x: { beginAtZero: boolean; grid: { display: boolean } };
      y: { grid: { display: boolean } };
    };
  };
}

interface StatCardProps {
  label: string;
  value: string;
}

// Renders a single top-level metric card (responses, completion, average rating).
const StatCard = ({ label, value }: StatCardProps) => (
  <div className="flex min-w-39.5 p-6 flex-col items-start gap-2 rounded-lg border border-[#CFDBE8] w-full bg-white shadow-sm">
    <p className="text-[#0D141C] font-inter text-base font-medium leading-6">
      {label}
    </p>
    <p className="text-[#0D141C] font-inter text-2xl font-bold leading-7.5">
      {value}
    </p>
  </div>
);

// Wraps all chart sections in the PDF-exportable area and renders them conditionally.
export default function AnalyticsChartsSection({
  totalResponses,
  completionRate,
  averageRating,
  ratingQuestions,
  ratingData,
  ratingOptions,
  multipleChoiceQuestions,
  checkboxQuestions,
  getQuestionId,
  buildOptionChartData,
  optionChartOptions,
}: AnalyticsChartsSectionProps) {
  return (
    <div id="analytics-export-area">
      {/* Top-level metric cards row. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Responses" value={String(totalResponses)} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} />
        <StatCard
          label="Avg Rating"
          value={averageRating ? averageRating : "-"}
        />
      </div>

      {/* Rating chart — only shown when the survey has at least one rating question. */}
      {ratingQuestions.length > 0 && (
        <section className="bg-white rounded-xl border border-[#CFDBE8] p-6 mb-8 shadow-sm">
          <h2 className="text-[22px] font-bold leading-7 mb-6">
            Rating Questions
          </h2>
          <div className="h-48">
            <Bar data={ratingData} options={ratingOptions} />
          </div>
        </section>
      )}

      {/* Multiple-choice charts — only shown when the survey has at least one MC question. */}
      {multipleChoiceQuestions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[22px] font-bold leading-7 mb-4">
            Multiple Choice Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Render one bar-chart card per multiple-choice question. */}
            {multipleChoiceQuestions.map((question) => (
              <div
                key={getQuestionId(question)}
                className="p-6 rounded-lg border border-[#CFDBE8] bg-white shadow-sm w-full"
              >
                <h3 className="text-base font-medium mb-6">
                  {question.label ?? "Untitled Question"}
                </h3>
                <div className="h-64">
                  <Bar
                    data={buildOptionChartData(question, false)}
                    options={optionChartOptions}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Checkbox charts — only shown when the survey has at least one checkbox question. */}
      {checkboxQuestions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[22px] font-bold leading-7 mb-4">
            Checkbox Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Render one pie-chart card per checkbox question. */}
            {checkboxQuestions.map((question) => (
              <div
                key={getQuestionId(question)}
                className="p-6 rounded-lg border border-[#CFDBE8] bg-white shadow-sm w-full"
              >
                <h3 className="text-base font-medium mb-6">
                  {question.label ?? "Untitled Question"}
                </h3>
                <div className="h-64">
                  <Pie
                    data={buildOptionChartData(question, true)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom" as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
