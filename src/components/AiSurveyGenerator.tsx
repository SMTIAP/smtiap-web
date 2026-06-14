import React, { useState } from "react";
import { Sparkles, Loader2, Bot, MessageSquare, Lightbulb } from "lucide-react";
import axios from "axios";

interface AiSurveyGeneratorProps {
  onGenerated: (result: {
    surveyTitle: string;
    description: string;
    pages: any[];
  }) => void;
  onCancel: () => void;
}

const SUGGESTED_PROMPTS = [
  "Customer satisfaction survey for a coffee shop",
  "Employee engagement and workplace happiness survey",
  "Event feedback form for a tech conference",
  "University course evaluation survey for students",
  "Healthcare patient experience questionnaire",
];

// Helper function to clean up survey title
const cleanSurveyTitle = (title: string): string => {
  // Remove brackets and their content like [Coffee Shop]
  let cleaned = title.replace(/\[[^\]]*\]/g, "").trim();
  // Remove extra dashes and spaces
  cleaned = cleaned.replace(/\s*-\s*$/, "").trim();
  // Remove any trailing special characters
  cleaned = cleaned.replace(/[-–—]\s*$/, "").trim();
  // If empty, return a default
  return cleaned || "AI Generated Survey";
};

// Helper function to clean up question labels
const cleanQuestionLabel = (label: string): string => {
  // Remove asterisks from labels
  let cleaned = label.replace(/\*/g, "").trim();
  return cleaned;
};

// Modal dialog for generating a new survey from a natural-language description via AI.
export default function AiSurveyGenerator({
  onGenerated,
  onCancel,
}: AiSurveyGeneratorProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/ai/generate-survey",
        { prompt: aiPrompt },
        { withCredentials: true },
      );
      if (data._error === "invalid_input") {
        setError(
          data._message ||
            "Please describe what kind of survey you want to create.",
        );
        return;
      }
      if (!data.surveyTitle || !data.pages || !Array.isArray(data.pages)) {
        throw new Error("AI returned an incomplete survey. Please try again.");
      }

      // Clean up the survey data
      const cleanedTitle = cleanSurveyTitle(data.surveyTitle);
      const cleanedDescription = data.description || "";

      // Clean up pages and questions
      const cleanedPages = (data.pages || []).map((page: any) => ({
        ...page,
        title: page.title || "Page 1",
        questions: (page.questions || []).map((question: any) => ({
          ...question,
          label: cleanQuestionLabel(question.label || "Untitled Question"),
          // Ensure required is a boolean
          required: question.required === true || question.required === "true",
        })),
      }));

      onGenerated({
        surveyTitle: cleanedTitle,
        description: cleanedDescription,
        pages: cleanedPages,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to connect to AI. Is the backend running?",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9] dark:border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[#1E293B] dark:text-white text-sm font-bold uppercase tracking-wider">
            AI Survey Generator
          </h2>
          <p className="text-[#64748B] dark:text-slate-400 text-xs">
            Describe your survey and let AI create it for you
          </p>
        </div>
      </div>

      {/* Prompt input */}
      <div className="flex flex-col gap-2">
        <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase">
          Describe Your Survey
        </label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Example: A customer feedback survey about our new mobile app's user experience and performance..."
          className="w-full p-4 border border-[#E2E8F0] dark:border-slate-600 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-h-30 resize-y transition-all"
          disabled={isGenerating}
        />
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-col gap-2">
        <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase flex items-center gap-1.5">
          <Lightbulb size={12} /> Suggested Ideas
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setAiPrompt(suggestion);
                setError(null);
              }}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                aiPrompt === suggestion
                  ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                  : "bg-white dark:bg-slate-700 border-[#E2E8F0] dark:border-slate-600 text-[#64748B] dark:text-slate-300 hover:border-indigo-200 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              }`}
            >
              <MessageSquare size={12} />
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isGenerating && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="relative">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium">
            AI is crafting your survey...
          </p>
          <p className="text-xs text-[#94A3B8] dark:text-slate-500">
            This usually takes a few seconds
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className="px-4 py-2.5 text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white transition-colors"
        >
          Back to Manual
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Generate Survey
            </>
          )}
        </button>
      </div>
    </div>
  );
}
