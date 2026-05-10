import { useMemo } from "react";
import {
  getQuestionId,
  normalizeAnswer,
  toCheckboxValues,
  type SurveyQuestion,
  type SurveyResponseDoc,
} from "../utils/analyticsHelpers";

// Types returned by the hook 

export interface UseAnalyticsChartsReturn {
  // Filtered question lists used by each chart section
  ratingQuestions: SurveyQuestion[];
  multipleChoiceQuestions: SurveyQuestion[];
  checkboxQuestions: SurveyQuestion[];
  // Summary stats passed to StatCards
  completionRate: number;
  averageRating: string | null;
  // Chart.js data + options for the ratings bar chart
  ratingData: RatingChartData;
  ratingOptions: RatingChartOptions;
  // Builder for MC and checkbox charts (called per-question)
  buildOptionChartData: (
    question: SurveyQuestion,
    isCheckbox: boolean,
  ) => OptionChartData;
  // Shared options for MC bar charts
  optionChartOptions: OptionChartOptions;
}

// Chart data/option shapes 

interface RatingChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius: number;
    barThickness: number;
  }[];
}

interface RatingChartOptions {
  indexAxis: "y";
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: { legend: { display: boolean }; tooltip: { enabled: boolean } };
  scales: {
    x: { beginAtZero: boolean; max: number; grid: { display: boolean } };
    y: { grid: { display: boolean } };
  };
}

interface OptionChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderRadius: number;
  }[];
}

interface OptionChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: { legend: { display: boolean } };
  scales: {
    x: { beginAtZero: boolean; grid: { display: boolean } };
    y: { grid: { display: boolean } };
  };
}

//Hook
export function useAnalyticsCharts(
  surveyQuestions: SurveyQuestion[],
  surveyResponses: SurveyResponseDoc[],
): UseAnalyticsChartsReturn {
  // Map of questionId -> array of raw answer values; foundation for all chart data
  const questionAnswerMap = useMemo(() => {
    const map = new Map<string, unknown[]>();

    // Pre-seed every known question so questions with 0 answers still appear
    for (const q of surveyQuestions) {
      const id = getQuestionId(q);
      if (id) map.set(id, []);
    }

    // Fill answers, skipping blank/empty values
    for (const response of surveyResponses) {
      for (const [qId, value] of Object.entries(response.responses ?? {})) {
        if (!map.has(qId)) continue;
        if (normalizeAnswer(value)) map.get(qId)?.push(value);
      }
    }

    return map;
  }, [surveyQuestions, surveyResponses]);

  // Filtered question lists 

  const ratingQuestions = useMemo(
    () => surveyQuestions.filter((q) => q.type === "rating"),
    [surveyQuestions],
  );

  const multipleChoiceQuestions = useMemo(
    () => surveyQuestions.filter((q) => q.type === "multiple_choice"),
    [surveyQuestions],
  );

  // Supports both "checkbox" and "checkboxes" type values
  const checkboxQuestions = useMemo(
    () =>
      surveyQuestions.filter(
        (q) => q.type === "checkbox" || q.type === "checkboxes",
      ),
    [surveyQuestions],
  );

  //  Summary stats 

  // completionRate = (answered fields / total possible fields) * 100
  const completionRate = useMemo(() => {
    if (surveyResponses.length === 0 || surveyQuestions.length === 0) return 0;

    const validIds = new Set(
      surveyQuestions.map(getQuestionId).filter(Boolean),
    );
    let answeredCount = 0;

    for (const response of surveyResponses) {
      for (const [qId, value] of Object.entries(response.responses ?? {})) {
        if (validIds.has(qId) && normalizeAnswer(value)) answeredCount += 1;
      }
    }

    const totalPossible = surveyResponses.length * surveyQuestions.length;
    return totalPossible > 0
      ? Math.round((answeredCount / totalPossible) * 100)
      : 0;
  }, [surveyQuestions, surveyResponses]);

  // averageRating = mean of all numeric rating answers across every rating question
  const averageRating = useMemo(() => {
    const values = ratingQuestions.flatMap((q) => {
      const id = getQuestionId(q);
      return (id ? (questionAnswerMap.get(id) ?? []) : [])
        .map((a) => Number(normalizeAnswer(a)))
        .filter((v) => Number.isFinite(v));
    });

    if (values.length === 0) return null;
    return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1);
  }, [questionAnswerMap, ratingQuestions]);

  // Rating chart data + options 

  // Chart.js dataset for the horizontal bar chart showing average rating per question
  const ratingData = useMemo<RatingChartData>(
    () => ({
      labels: ratingQuestions.map((q) => q.label ?? "Untitled Question"),
      datasets: [
        {
          label: "Average Rating",
          data: ratingQuestions.map((q) => {
            const id = getQuestionId(q);
            const vals = (id ? (questionAnswerMap.get(id) ?? []) : [])
              .map((a) => Number(normalizeAnswer(a)))
              .filter((v) => Number.isFinite(v));
            if (vals.length === 0) return 0;
            return Number(
              (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2),
            );
          }),
          backgroundColor: "#2B8CED",
          borderRadius: 8,
          barThickness: 16,
        },
      ],
    }),
    [questionAnswerMap, ratingQuestions],
  );

  // Chart.js options for the horizontal ratings bar chart
  const ratingOptions: RatingChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...ratingQuestions.map((q) => Number(q.max ?? 5)), 5),
        grid: { display: false },
      },
      y: { grid: { display: false } },
    },
  };

  //Option chart builder (MC + checkbox)

  // Fixed colour palette for chart slices/bars
  const OPTION_COLORS = [
    "#2B8CED",
    "#55E05F",
    "#FFA500",
    "#E8EDF2",
    "#C0B5EF",
    "#EFCCB5",
  ];

  /**
   * Builds Chart.js data for a single multiple-choice or checkbox question.
   * For checkboxes, each answer may contain multiple selected options.
   */
  const buildOptionChartData = (
    question: SurveyQuestion,
    isCheckbox: boolean,
  ): OptionChartData => {
    const options = Array.isArray(question.options) ? question.options : [];
    const id = getQuestionId(question);
    const answers = id ? (questionAnswerMap.get(id) ?? []) : [];

    const counts = options.map((option) =>
      isCheckbox
        ? answers.filter((a) => toCheckboxValues(a).includes(option)).length
        : answers.filter((a) => normalizeAnswer(a) === option).length,
    );

    return {
      labels: options,
      datasets: [
        {
          label: "Responses",
          data: counts,
          backgroundColor: OPTION_COLORS,
          borderRadius: 6,
        },
      ],
    };
  };

  // Shared Chart.js options for all multiple-choice bar charts
  const optionChartOptions: OptionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { display: false } },
      y: { grid: { display: false } },
    },
  };

  return {
    ratingQuestions,
    multipleChoiceQuestions,
    checkboxQuestions,
    completionRate,
    averageRating,
    ratingData,
    ratingOptions,
    buildOptionChartData,
    optionChartOptions,
  };
}
