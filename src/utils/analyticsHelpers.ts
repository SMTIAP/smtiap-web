// A single submitted survey response document from the API.
export interface SurveyResponseDoc {
  createdAt?: string;
  responses?: Record<string, unknown>;
}

// A single survey question, as returned inside a survey's pages array.
export interface SurveyQuestion {
  _id?: string;
  id?: string;
  type?: string;
  label?: string;
  options?: string[];
  max?: number;
}

// Top-level survey document shape from GET /api/surveys/:id
export interface SurveyDoc {
  surveyTitle?: string;
  title?: string;
  pages?: { questions?: SurveyQuestion[] }[];
}

// Shape of a saved AI analytics result from GET /api/analytics
export interface AnalyticsResultDoc {
  summary?: string;
  topKeywords?: { keyword: string; count: number }[];
}

// Summary item used in the survey list / selector view.
export interface SurveyListItem {
  _id: string;
  surveyTitle?: string;
  createdAt?: string;
  status?: string;
}

// ── Helper functions ─────────────────────────────────────────────────────────

/**
 * Returns the question's `_id` or `id` field as a trimmed string.
 * Used everywhere a stable question identifier is needed.
 */
export const getQuestionId = (question: SurveyQuestion): string =>
  String(question._id ?? question.id ?? "").trim();

/**
 * Converts any raw answer value to a plain string.
 * Arrays are joined with ", "; null/undefined become "".
 */
export const normalizeAnswer = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  return String(value).trim();
};

/**
 * Converts a checkbox answer (array or comma-separated string)
 * into an array of individual trimmed option strings.
 */
export const toCheckboxValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const normalized = normalizeAnswer(value);
  return normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
};
