import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getQuestionId,
  normalizeAnswer,
  type AnalyticsResultDoc,
  type SurveyDoc,
  type SurveyListItem,
  type SurveyQuestion,
  type SurveyResponseDoc,
} from "../utils/analyticsHelpers";

export interface UseAnalyticsDataReturn {
  // Survey meta
  surveyTitle: string;
  totalResponses: number;
  surveyQuestions: SurveyQuestion[];
  surveyResponses: SurveyResponseDoc[];
  // Text lines fed into the Gemini prompt
  aiInputLines: string[];
  // AI result state
  summary: string | null;
  keywords: { keyword: string; count: number }[];
  isAnalyzing: boolean;
  aiError: string | null;
  // Selector-view state
  finishedSurveys: SurveyListItem[];
  surveysLoading: boolean;
  // AI trigger
  runAnalysis: () => Promise<void>;
}

export function useAnalyticsData(
  surveyId: string,
  apiBaseUrl: string,
): UseAnalyticsDataReturn {
  //  Survey dashboard state
  const [surveyTitle, setSurveyTitle] = useState("Survey");
  const [totalResponses, setTotalResponses] = useState(0);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponseDoc[]>(
    [],
  );
  const [aiInputLines, setAiInputLines] = useState<string[]>([]);

  //AI result state
  const [summary, setSummary] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<
    { keyword: string; count: number }[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Selector-view state
  const [finishedSurveys, setFinishedSurveys] = useState<SurveyListItem[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(true);

  // Effect: load finished surveys (selector view) 
  // Only runs when there is no surveyId in the URL.
  useEffect(() => {
    const fetchFinishedSurveys = async () => {
      if (surveyId) {
        setSurveysLoading(false);
        return;
      }
      setSurveysLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/surveys`);
        const data = await response.json();
        const surveyList = Array.isArray(data)
          ? (data as SurveyListItem[])
          : [];
        // Only show surveys with status "Finished"
        setFinishedSurveys(surveyList.filter((s) => s.status === "Finished"));
      } catch (err) {
        console.error("Failed to load finished surveys:", err);
        setFinishedSurveys([]);
      } finally {
        setSurveysLoading(false);
      }
    };
    void fetchFinishedSurveys();
  }, [apiBaseUrl, surveyId]);

  // load survey structure, responses, and saved AI results
  // Only runs when a surveyId is present.
  useEffect(() => {
    const fetchSurveyContext = async () => {
      if (!surveyId) return;
      try {
        // Fetch all three resources in parallel to minimise load time
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

        // Flatten all questions from all pages into a single array
        const pages = Array.isArray(surveyJson?.pages) ? surveyJson.pages : [];
        const questions = pages.flatMap((page) =>
          Array.isArray(page.questions) ? page.questions : [],
        );

        // Build a Map of questionId -> question for fast answer lookups
        const questionById = new Map(
          questions
            .map((q) => [getQuestionId(q), q] as const)
            .filter(([id]) => Boolean(id)),
        );

        // Build human-readable text lines for each answer, used in the AI prompt
        const extractedText = responseDocs.flatMap((doc, idx) =>
          Object.entries(doc.responses ?? {}).flatMap(([qId, value]) => {
            const q = questionById.get(qId);
            if (!q) return [];
            const answer = normalizeAnswer(value);
            if (!answer) return [];
            return [
              `Response ${idx + 1} | Question (${q.type ?? "unknown"}): ${q.label ?? "Untitled"} | Answer: ${answer}`,
            ];
          }),
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

        // If a previously saved AI result exists, restore it into state
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

  //  runAnalysis: send responses to Gemini and persist the result 
  const runAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAiError(null);
    setSummary(null);
    setKeywords([]);

    try {
      if (!surveyId) throw new Error("Survey ID is missing.");
      if (aiInputLines.length === 0)
        throw new Error("No responses found in database for this survey.");

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey)
        throw new Error(
          "VITE_GEMINI_API_KEY is not set in environment variables.",
        );

      // Initialise Gemini client and select model
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // List all questions so Gemini understands the survey structure
      const questionCatalogue = surveyQuestions
        .map(
          (q, i) =>
            `${i + 1}. [${q.type ?? "unknown"}] ${q.label ?? "Untitled"}`,
        )
        .join("\n");

      const prompt = `Analyze the survey responses for this exact survey.

Survey Questions:
${questionCatalogue}

Response Records:
${aiInputLines.join("\n")}

Instructions:
1. Provide a concise summary grounded only in the provided responses.
2. Identify top 5 recurring keywords/topics with estimated counts.
3. Align findings with the survey questions and response patterns.

Return a purely JSON object (no markdown formatting, no code fence) with this structure:
{"summary":"...","top_5_keywords":[{"keyword":"Quality","count":15}]}
`;

      // Send prompt to Gemini; strip any markdown code fences from the response
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

      // Normalise keyword array with type-safe filtering
      const rawKeywords = Array.isArray(analysis.top_5_keywords)
        ? analysis.top_5_keywords
        : [];
      const normalizedKeywords = rawKeywords
        .filter(
          (item): item is { keyword?: unknown; count?: unknown } =>
            typeof item === "object" &&
            item !== null &&
            "keyword" in item &&
            typeof (item as Record<string, unknown>).keyword === "string",
        )
        .map((item) => ({
          keyword: String(item.keyword).trim(),
          count: Number(item.count ?? 0),
        }))
        .slice(0, 5);

      // Persist the AI result to the backend so it loads automatically next visit
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

      if (!saveResponse.ok)
        throw new Error(
          "AI analysis generated, but saving to database failed.",
        );

      setSummary(String(analysis.summary ?? "").trim());
      setKeywords(normalizedKeywords);
    } catch (err: unknown) {
      console.error("Analysis failed:", err);
      setAiError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during analysis.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    surveyTitle,
    totalResponses,
    surveyQuestions,
    surveyResponses,
    aiInputLines,
    summary,
    keywords,
    isAnalyzing,
    aiError,
    finishedSurveys,
    surveysLoading,
    runAnalysis,
  };
}
