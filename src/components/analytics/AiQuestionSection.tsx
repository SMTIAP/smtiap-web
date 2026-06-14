import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageCircleQuestion, Loader2, Send, Lock } from "lucide-react";
import {
  getQuestionId,
  normalizeAnswer,
  type SurveyQuestion,
  type SurveyResponseDoc,
} from "../../utils/analyticsHelpers";

import api from "../../api/api";

// ---plan-based feature access----
// set to true/false per plan to allow/restrict the "Ask About This Survey" feature. tenants need to buy plan to get custom analysis
const PLAN_FEATURE_ACCESS: Record<string, boolean> = {
  free: false,
  startup: true,
  pro: true,
};


interface AiQuestionSectionProps {
  surveyQuestions: SurveyQuestion[];
  surveyResponses: SurveyResponseDoc[];
  totalResponses: number;
}

export default function AiQuestionSection({
  surveyQuestions,
  surveyResponses,
  totalResponses,
}: AiQuestionSectionProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
    // ---plan access check. check if tenant is in a paid plan or not.----
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get("http://localhost:5000/api/payments/subscription")
      .then((res) => {
        if (!mounted) return;
        const planName = (res.data?.plan ?? "free").toLowerCase();
        setHasAccess(PLAN_FEATURE_ACCESS[planName] ?? false);
      })
      .catch(() => {
        if (mounted) setHasAccess(false);
      })
      .finally(() => {
        if (mounted) setIsCheckingAccess(false);
      });
    return () => { mounted = false; };
  }, []);


  const askQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;

    setIsAsking(true);
    setError(null);
    setAnswer(null);

    try {
      if (totalResponses === 0) {
        throw new Error("No responses found in database for this survey.");
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not set in environment variables.");
      }

      // Build question catalogue, same approach as the general analysis
      const questionCatalogue = surveyQuestions
        .map((q, i) => `${i + 1}. [${q.type ?? "unknown"}] ${q.label ?? "Untitled"}`)
        .join("\n");

      // Build response text lines from the (already date-filtered) responses
      const questionById = new Map(
        surveyQuestions
          .map((q) => [getQuestionId(q), q] as const)
          .filter(([id]) => Boolean(id)),
      );

      const inputLines = surveyResponses.flatMap((doc, idx) =>
        Object.entries(doc.responses ?? {}).flatMap(([qId, value]) => {
          const q = questionById.get(qId);
          if (!q) return [];
          const ans = normalizeAnswer(value);
          if (!ans) return [];
          return [
            `Response ${idx + 1} | Question (${q.type ?? "unknown"}): ${q.label ?? "Untitled"} | Answer: ${ans}`,
          ];
        }),
      );

      if (inputLines.length === 0) {
        throw new Error("No responses found in database for this survey.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Answer a specific question about this survey's responses.

Survey Questions:
${questionCatalogue}

Response Records:
${inputLines.join("\n")}

User's Question:
${trimmed}

Instructions:
1. Answer the user's question as specifically as possible, grounded only in the provided response records.
2. If the question can't be answered from the data, say so clearly and explain why.
3. Be concise but specific — cite numbers, patterns, or examples from the responses where relevant.
4. Do not invent data that isn't present in the response records.

Return a purely JSON object (no markdown formatting, no code fence) with this structure:
{"answer":"..."}
`;

      const result = await model.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(text) as { answer?: unknown };
      setAnswer(String(parsed.answer ?? "").trim() || "No answer was returned.");
    } catch (err: unknown) {
      console.error("Question failed:", err);
      const errorStr = String(err instanceof Error ? err.message : err).toLowerCase();
      if (
        errorStr.includes("429") ||
        errorStr.includes("quota") ||
        errorStr.includes("rate limit") ||
        errorStr.includes("too many requests")
      ) {
        setError(
          "AI analysis is temporarily unavailable due to high demand. Please wait a moment and try again.",
        );
      } else {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred.",
        );
      }
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void askQuestion();
    }
  };

    //while chekcing access, render nothing extra (avoids flash of locked UI)
  if (isCheckingAccess) {
    return (
      <section className="p-6 rounded-lg border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md relative overflow-hidden transition-colors duration-300 mt-6">
        <div className="flex items-center gap-2 mb-2 relative">
          <MessageCircleQuestion size={20} className="text-purple-500" />
          <h2 className="text-lg font-bold dark:text-white">Ask About This Survey</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="text-slate-300 dark:text-slate-600 animate-spin" />
        </div>
      </section>
    );
  }

  if (!hasAccess) {
    return (
      <section className="p-6 rounded-lg border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md relative overflow-hidden transition-colors duration-300 mt-6">
        <div className="flex items-center gap-2 mb-6 relative">
          <MessageCircleQuestion size={20} className="text-purple-500" />
          <h2 className="text-lg font-bold dark:text-white">Ask About This Survey</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center relative">
          <div className="inline-flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-700 rounded-full mb-3">
            <Lock size={24} className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-semibold">
            Available on Startup and Pro plans
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-sm">
            Ask specific questions about your survey responses and get AI-grounded answers. Upgrade your organization's plan to unlock this feature.
          </p>
          <a
            href="/subscription"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2B8CED] hover:bg-[#1A76D2] text-white rounded-lg font-bold text-sm transition-all shadow-sm"
          >
            View Plans
          </a>
        </div>
      </section>
    );
  }


  return (
    <section className="p-6 rounded-lg border border-[#CFDBE8] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md relative overflow-hidden group transition-colors duration-300 mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />

      <div className="flex items-center gap-2 mb-6 relative">
        <MessageCircleQuestion size={20} className="text-purple-500" />
        <h2 className="text-lg font-bold dark:text-white">Ask About This Survey</h2>
      </div>

      <div className="flex gap-2 relative mb-4" data-export-hidden="true">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAsking}
          placeholder='e.g. "What did most users say about pricing?"'
          className="flex-1 px-4 py-2.5 rounded-lg border border-[#CFDBE8] dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-[#0D141C] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B8CED] disabled:opacity-60"
        />
        <button
          onClick={() => void askQuestion()}
          disabled={isAsking || !question.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2B8CED] hover:bg-[#1A76D2] disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-sm whitespace-nowrap"
        >
          {isAsking ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Asking...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Ask</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm relative">
          {error}
        </div>
      )}

      {isAsking && (
        <div className="flex flex-col items-center justify-center py-8 text-center relative">
          <Loader2 size={28} className="text-[#2B8CED] animate-spin mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Reading responses for your question...
          </p>
        </div>
      )}

      {!isAsking && answer && (
        <div className="relative p-4 rounded-lg bg-[#F7FAFC] dark:bg-slate-900 border border-[#CFDBE8] dark:border-slate-700 text-sm text-[#0D141C] dark:text-white leading-relaxed whitespace-pre-wrap">
          {answer}
        </div>
      )}

      {!isAsking && !answer && !error && (
        <div className="flex flex-col items-center justify-center py-8 text-center relative">
          <MessageCircleQuestion
            size={32}
            className="text-slate-200 dark:text-slate-600 mb-3"
          />
          <p className="text-slate-400 text-sm font-medium">
            Ask anything about this survey's responses
          </p>
          <p className="text-slate-300 dark:text-slate-500 text-xs mt-1">
            Get a specific, grounded answer based on the actual response data.
          </p>
        </div>
      )}
    </section>
  );
}