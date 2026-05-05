import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { Filter, BarChart, Sparkles, Download, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
import { Bar, Pie } from "react-chartjs-2";

// Register ChartJS components
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

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="flex min-w-[158px] p-6 flex-col items-start gap-2 rounded-lg border border-[#CFDBE8] w-full bg-white shadow-sm">
    <p className="text-[#0D141C] font-inter text-base font-medium leading-6">
      {label}
    </p>
    <p className="text-[#0D141C] font-inter text-2xl font-bold leading-[30px]">
      {value}
    </p>
  </div>
);

interface TagProps {
  label: string;
  count: number;
  color: string;
}

interface SurveyResponseDoc {
  createdAt?: string;
  responses?: Record<string, unknown>;
}

interface SurveyQuestion {
  _id?: string;
  id?: string;
  type?: string;
  label?: string;
  options?: string[];
  max?: number;
}

interface SurveyDoc {
  surveyTitle?: string;
  title?: string;
  pages?: { questions?: SurveyQuestion[] }[];
}

interface AnalyticsResultDoc {
  summary?: string;
  topKeywords?: { keyword: string; count: number }[];
}

const getQuestionId = (question: SurveyQuestion): string =>
  String(question._id ?? question.id ?? "").trim();

const normalizeAnswer = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  return String(value).trim();
};

const toCheckboxValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const normalized = normalizeAnswer(value);
  return normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
};

const InsightTag = ({ label, count, color }: TagProps) => (
  <div
    className="flex items-center px-4 py-1.5 rounded-lg text-sm font-medium"
    style={{ backgroundColor: color }}
  >
    <span className="text-[#4D7399]">
      {label} ({count})
    </span>
  </div>
);

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const surveyId = useMemo(
    () =>
      searchParams.get("surveyId")?.trim() ||
      import.meta.env.VITE_DEFAULT_SURVEY_ID ||
      "",
    [searchParams],
  );

  const [surveyTitle, setSurveyTitle] = useState("Survey");
  const [totalResponses, setTotalResponses] = useState(0);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponseDoc[]>(
    [],
  );
  const [aiInputLines, setAiInputLines] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<
    { keyword: string; count: number }[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveyContext = async () => {
      if (!surveyId) {
        setAiError(
          "Survey ID is missing. Open analytics from a survey result page.",
        );
        return;
      }

      try {
        const [surveyRes, responsesRes, analyticsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/surveys/${surveyId}`),
          fetch(`${apiBaseUrl}/api/surveys/${surveyId}/responses`),
          fetch(
            `${apiBaseUrl}/api/analytics?surveyId=${encodeURIComponent(surveyId)}`,
          ),
        ]);

        const surveyJson = (await surveyRes.json()) as SurveyDoc;
        const responsesJson = await responsesRes.json();
        const analyticsJson = analyticsRes.ok ? await analyticsRes.json() : [];

        const responseDocs = Array.isArray(responsesJson)
          ? (responsesJson as SurveyResponseDoc[])
          : [];

        const pages = Array.isArray(surveyJson?.pages) ? surveyJson.pages : [];
        const questions = pages.flatMap((page) =>
          Array.isArray(page.questions) ? page.questions : [],
        );

        const questionById = new Map(
          questions
            .map((question) => [getQuestionId(question), question] as const)
            .filter(([id]) => Boolean(id)),
        );

        const extractedText = responseDocs.flatMap(
          (responseDoc, responseIndex) =>
            Object.entries(responseDoc.responses ?? {}).flatMap(
              ([questionId, value]) => {
                const question = questionById.get(questionId);
                if (!question) return [];

                const answer = normalizeAnswer(value);
                if (!answer) return [];

                return [
                  `Response ${responseIndex + 1} | Question (${question.type ?? "unknown"}): ${question.label ?? "Untitled"} | Answer: ${answer}`,
                ];
              },
            ),
        );

        const analyticsResults = Array.isArray(analyticsJson)
          ? (analyticsJson as AnalyticsResultDoc[])
          : [];

        setSurveyTitle(
          String(
            surveyJson?.surveyTitle ?? surveyJson?.title ?? "Untitled Survey",
          ),
        );
        setTotalResponses(responseDocs.length);
        setSurveyQuestions(questions);
        setSurveyResponses(responseDocs);
        setAiInputLines(extractedText);

        const latestResult = analyticsResults[0];
        if (latestResult) {
          setSummary(
            typeof latestResult.summary === "string"
              ? latestResult.summary
              : null,
          );
          setKeywords(
            Array.isArray(latestResult.topKeywords)
              ? latestResult.topKeywords.slice(0, 5)
              : [],
          );
        }
      } catch (err) {
        console.error("Failed to load survey analytics context:", err);
        setAiError("Failed to load survey data from database.");
      }
    };

    void fetchSurveyContext();
  }, [apiBaseUrl, surveyId]);

  const runAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAiError(null);
    setSummary(null);
    setKeywords([]);
    try {
      if (!surveyId) {
        throw new Error("Survey ID is missing.");
      }

      if (aiInputLines.length === 0) {
        throw new Error("No responses found in database for this survey.");
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "VITE_GEMINI_API_KEY is not set in environment variables.",
        );
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const questionCatalogue = surveyQuestions
        .map(
          (question, index) =>
            `${index + 1}. [${question.type ?? "unknown"}] ${question.label ?? "Untitled"}`,
        )
        .join("\n");

      const allText = aiInputLines.join("\n");
      const prompt = `Analyze the survey responses for this exact survey.

Survey Questions:
${questionCatalogue}

Response Records:
${allText}

Instructions:
1. Provide a concise summary grounded only in the provided responses.
2. Identify top 5 recurring keywords/topics with estimated counts.
3. Align findings with the survey questions and response patterns.

Return a purely JSON object (no markdown formatting, no code fence) with this structure:
{"summary":"...","top_5_keywords":[{"keyword":"Quality","count":15}]}
`;
      const result = await model.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const analysis = JSON.parse(text) as {
        summary?: unknown;
        top_5_keywords?: unknown;
      };
      const rawKeywords = Array.isArray(analysis.top_5_keywords)
        ? analysis.top_5_keywords
        : [];
      const normalizedKeywords = rawKeywords
        .filter(
          (
            item,
          ): item is {
            keyword?: unknown;
            count?: unknown;
          } =>
            typeof item === "object" &&
            item !== null &&
            "keyword" in item &&
            typeof item.keyword === "string",
        )
        .map((item) => ({
          keyword: String(item.keyword).trim(),
          count: Number(item.count ?? 0),
        }))
        .slice(0, 5);

      const saveResponse = await fetch(`${apiBaseUrl}/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId,
          summary: String(analysis.summary ?? "").trim(),
          topKeywords: normalizedKeywords,
          sourceCount: totalResponses,
          totalResponses,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error(
          "AI analysis generated, but saving to database failed.",
        );
      }

      setSummary(String(analysis.summary ?? "").trim());
      setKeywords(normalizedKeywords);
    } catch (err: unknown) {
      console.error("Analysis failed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during analysis.";
      setAiError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const questionAnswerMap = useMemo(() => {
    const answerMap = new Map<string, unknown[]>();

    for (const question of surveyQuestions) {
      const questionId = getQuestionId(question);
      if (questionId) {
        answerMap.set(questionId, []);
      }
    }

    for (const response of surveyResponses) {
      for (const [questionId, value] of Object.entries(
        response.responses ?? {},
      )) {
        if (!answerMap.has(questionId)) continue;
        if (normalizeAnswer(value)) {
          answerMap.get(questionId)?.push(value);
        }
      }
    }

    return answerMap;
  }, [surveyQuestions, surveyResponses]);

  const ratingQuestions = useMemo(
    () => surveyQuestions.filter((question) => question.type === "rating"),
    [surveyQuestions],
  );

  const multipleChoiceQuestions = useMemo(
    () =>
      surveyQuestions.filter((question) => question.type === "multiple_choice"),
    [surveyQuestions],
  );

  const checkboxQuestions = useMemo(
    () =>
      surveyQuestions.filter(
        (question) =>
          question.type === "checkbox" || question.type === "checkboxes",
      ),
    [surveyQuestions],
  );

  const completionRate = useMemo(() => {
    if (surveyResponses.length === 0 || surveyQuestions.length === 0) return 0;

    const validQuestionIds = new Set(
      surveyQuestions
        .map((question) => getQuestionId(question))
        .filter(Boolean),
    );

    let answeredCount = 0;
    for (const response of surveyResponses) {
      for (const [questionId, value] of Object.entries(
        response.responses ?? {},
      )) {
        if (!validQuestionIds.has(questionId)) continue;
        if (normalizeAnswer(value)) {
          answeredCount += 1;
        }
      }
    }

    const totalPossible = surveyResponses.length * surveyQuestions.length;
    return totalPossible > 0
      ? Math.round((answeredCount / totalPossible) * 100)
      : 0;
  }, [surveyQuestions, surveyResponses]);

  const averageRating = useMemo(() => {
    const ratingValues = ratingQuestions.flatMap((question) => {
      const questionId = getQuestionId(question);
      const answers = questionId
        ? (questionAnswerMap.get(questionId) ?? [])
        : [];
      return answers
        .map((answer) => Number(normalizeAnswer(answer)))
        .filter((value) => Number.isFinite(value));
    });

    if (ratingValues.length === 0) return null;

    const sum = ratingValues.reduce((acc, value) => acc + value, 0);
    return (sum / ratingValues.length).toFixed(1);
  }, [questionAnswerMap, ratingQuestions]);

  const ratingData = useMemo(
    () => ({
      labels: ratingQuestions.map(
        (question) => question.label ?? "Untitled Question",
      ),
      datasets: [
        {
          label: "Average Rating",
          data: ratingQuestions.map((question) => {
            const questionId = getQuestionId(question);
            const answers = questionId
              ? (questionAnswerMap.get(questionId) ?? [])
              : [];
            const values = answers
              .map((answer) => Number(normalizeAnswer(answer)))
              .filter((value) => Number.isFinite(value));

            if (values.length === 0) return 0;

            const total = values.reduce((acc, value) => acc + value, 0);
            return Number((total / values.length).toFixed(2));
          }),
          backgroundColor: "#2B8CED",
          borderRadius: 8,
          barThickness: 16,
        },
      ],
    }),
    [questionAnswerMap, ratingQuestions],
  );

  const ratingOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(
          ...ratingQuestions.map((question) => Number(question.max ?? 5)),
          5,
        ),
        grid: { display: false },
      },
      y: { grid: { display: false } },
    },
  };

  const buildOptionChartData = (
    question: SurveyQuestion,
    isCheckbox: boolean,
  ) => {
    const options = Array.isArray(question.options) ? question.options : [];
    const questionId = getQuestionId(question);
    const answers = questionId ? (questionAnswerMap.get(questionId) ?? []) : [];

    const counts = options.map((option) => {
      if (isCheckbox) {
        return answers.filter((answer) =>
          toCheckboxValues(answer).includes(option),
        ).length;
      }
      return answers.filter((answer) => normalizeAnswer(answer) === option)
        .length;
    });

    return {
      labels: options,
      datasets: [
        {
          label: "Responses",
          data: counts,
          backgroundColor: [
            "#2B8CED",
            "#55E05F",
            "#FFA500",
            "#E8EDF2",
            "#C0B5EF",
            "#EFCCB5",
          ],
          borderRadius: 6,
        },
      ],
    };
  };

  const optionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true, grid: { display: false } },
      y: { grid: { display: false } },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC] font-inter text-[#0D141C]">
      {/* Top Navbar */}
      <nav className="flex py-3 px-10 border-b border-[#E5E8EB] bg-white w-full sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EDF2]">
            <BarChart size={20} className="text-[#0D141C]" />
          </div>
          <h1 className="text-lg font-bold">Survey Analytics</h1>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        <div className="max-w-[960px] w-full px-4 md:px-0 py-5">
          <div className="w-full flex justify-start mb-6">
            <BackButton to="/response" />
          </div>
          {/* Action Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex py-3 items-center gap-3 flex-wrap w-full">
              <div className="flex py-2 px-6 justify-center items-center rounded-lg bg-[#2B8CED]">
                <p className="text-[#F7FAFC] text-sm font-bold">
                  {surveyTitle}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center w-full">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter size={24} className="text-[#0D141C]" />
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-[#2B8CED] hover:bg-[#1A76D2] text-white rounded-lg font-bold text-sm transition-all shadow-md group">
                <Download
                  size={20}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Responses" value={String(totalResponses)} />
            <StatCard label="Completion Rate" value={`${completionRate}%`} />
            <StatCard
              label="Avg Rating"
              value={averageRating ? averageRating : "-"}
            />
          </div>

          {/* Ratings Section */}
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

          {multipleChoiceQuestions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[22px] font-bold leading-7 mb-4">
                Multiple Choice Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {checkboxQuestions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[22px] font-bold leading-7 mb-4">
                Checkbox Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* AI Insights Section */}
          <section className="p-6 rounded-lg border border-[#CFDBE8] bg-white shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />

            <div className="flex items-center justify-between gap-2 mb-6 relative">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-500" />
                <h2 className="text-lg font-bold">AI Insights</h2>
              </div>
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-[#2B8CED] hover:bg-[#1A76D2] disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {aiError}
              </div>
            )}

            {/* Aurora loading overlay */}
            {isAnalyzing && (
              <div
                className="relative rounded-xl overflow-hidden border border-blue-100 bg-white p-8 text-center mb-6"
                style={{
                  background: "white",
                }}
              >
                {/* Animated aurora gradient border */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(270deg, #a5f3fc, #818cf8, #6ee7b7, #fde68a, #f9a8d4, #a5f3fc)",
                    backgroundSize: "400% 400%",
                    animation: "auroraShift 4s ease infinite",
                    padding: "2px",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
                {/* Inner glow */}
                <div
                  className="absolute inset-0 rounded-xl opacity-20"
                  style={{
                    background:
                      "linear-gradient(270deg, #a5f3fc, #818cf8, #6ee7b7, #fde68a, #f9a8d4)",
                    backgroundSize: "400% 400%",
                    animation: "auroraShift 4s ease infinite",
                    filter: "blur(16px)",
                  }}
                />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-blue-500 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">
                    Reading responses
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Analyzing all survey responses.
                  </p>
                </div>
                <style>{`
                  @keyframes auroraShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
              </div>
            )}

            {!isAnalyzing && (
              <>
                <div className="mb-6 relative">
                  <h3 className="text-[#4D7399] text-base font-medium mb-3">
                    Key Findings
                  </h3>
                  {summary ? (
                    <ul className="space-y-2 text-black text-base leading-relaxed">
                      {summary
                        .split(". ")
                        .filter(Boolean)
                        .map((sentence, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="font-bold text-green-500">•</span>
                            {sentence.endsWith(".") ? sentence : sentence + "."}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2 text-black text-base leading-relaxed">
                      <li className="flex gap-2">
                        <span className="font-bold text-green-500">•</span>
                        Users consistently praised the new responsive UI for
                        mobile devices.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-green-500">•</span>
                        Onboarding flow shows a 15% drop-off at the
                        &quot;Integration&quot; step.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-green-500">•</span>
                        High demand for enterprise-grade reporting features.
                      </li>
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 relative mt-8">
                  {keywords.length > 0 ? (
                    keywords.map((item, i) => {
                      const colors = [
                        "#C5EFB5",
                        "#B5E9EF",
                        "#C0B5EF",
                        "#EFCCB5",
                        "#EFE4B5",
                      ];
                      return (
                        <InsightTag
                          key={i}
                          label={item.keyword}
                          count={item.count}
                          color={colors[i % colors.length]}
                        />
                      );
                    })
                  ) : (
                    <>
                      <InsightTag label="Quality" count={123} color="#C5EFB5" />
                      <InsightTag
                        label="Professional"
                        count={110}
                        color="#B5E9EF"
                      />
                      <InsightTag
                        label="Efficient"
                        count={95}
                        color="#C0B5EF"
                      />
                      <InsightTag label="Timely" count={75} color="#EFCCB5" />
                      <InsightTag label="Friendly" count={80} color="#EFE4B5" />
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
