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
    plugins: { legend: { display: boolean }; tooltip: { enabled: boolean } };
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
    plugins: { legend: { display: boolean } };
    scales: {
      x: { beginAtZero: boolean; grid: { display: boolean } };
      y: { grid: { display: boolean } };
    };
  };
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-39.5 p-6 flex-col items-start gap-2 rounded-lg border border-[#CFDBE8] dark:border-slate-700 w-full bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300">
    <p className="text-[#0D141C] dark:text-slate-300 font-inter text-base font-medium leading-6">
      {label}
    </p>
    <p className="text-[#0D141C] dark:text-white font-inter text-2xl font-bold leading-7.5">
      {value}
    </p>
  </div>
);

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
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Responses" value={String(totalResponses)} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} />
        <StatCard
          label="Avg Rating"
          value={averageRating ? averageRating : "-"}
        />
      </div>

      {/* Rating chart */}
      {ratingQuestions.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-[#CFDBE8] dark:border-slate-700 p-6 mb-8 shadow-sm transition-colors duration-300">
          <h2 className="text-[22px] font-bold leading-7 mb-6 text-[#0D141C] dark:text-white">
            Rating Questions
          </h2>
          <div className="h-48">
            <Bar data={ratingData} options={ratingOptions} />
          </div>
        </section>
      )}

      {/* Multiple choice charts */}
      {multipleChoiceQuestions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[22px] font-bold leading-7 mb-4 text-[#0D141C] dark:text-white">
            Multiple Choice Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {multipleChoiceQuestions.map((question) => (
              <div
                key={getQuestionId(question)}
                className="p-6 rounded-lg border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm w-full transition-colors duration-300"
              >
                <h3 className="text-base font-medium mb-6 text-[#0D141C] dark:text-white">
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

      {/* Checkbox charts */}
      {checkboxQuestions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[22px] font-bold leading-7 mb-4 text-[#0D141C] dark:text-white">
            Checkbox Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checkboxQuestions.map((question) => (
              <div
                key={getQuestionId(question)}
                className="p-6 rounded-lg border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm w-full transition-colors duration-300"
              >
                <h3 className="text-base font-medium mb-6 text-[#0D141C] dark:text-white">
                  {question.label ?? "Untitled Question"}
                </h3>
                <div className="h-64">
                  <Pie
                    data={buildOptionChartData(question, true)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: "bottom" as const },
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
