import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  Wand2,
  X,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import axios from "axios";

interface SurveyPage {
  id: string;
  title: string;
  questions: any[];
}

interface AiSurveyModifierProps {
  surveyTitle: string;
  pages: SurveyPage[];
  description: string;
  onApply: (result: {
    surveyTitle: string;
    description: string;
    pages: any[];
  }) => void;
  onClose: () => void;
}

const SUGGESTED_MODIFICATIONS = [
  "Add a rating question at the end",
  "Add a page about customer demographics",
  "Add conditional branching: if answer X, skip to question Y",
  "Add a multiple choice question about最喜欢的 features",
  "Add 3 more questions about service quality",
];

export default function AiSurveyModifier({
  surveyTitle,
  pages,
  description,
  onApply,
  onClose,
}: AiSurveyModifierProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = pages.reduce((sum, p) => sum + p.questions.length, 0);

  const handleModify = async () => {
    if (!aiPrompt.trim()) return;
    setIsModifying(true);
    setError(null);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/ai/modify-survey",
        {
          prompt: aiPrompt,
          currentSurvey: {
            surveyTitle,
            description,
            pages: pages.map((p) => ({
              title: p.title,
              questions: p.questions.map((q) => ({
                type: q.type,
                label: q.label,
                required: q.required,
                placeholder: q.placeholder,
                options: q.options,
                max: q.max,
                min: q.min,
                branching: q.branching,
              })),
            })),
          },
        },
        { withCredentials: true },
      );

      // Check if AI detected invalid input
      if (data._error === "invalid_input") {
        setError(
          data._message ||
            "Please provide a clear description of what you'd like to change.",
        );
        return;
      }

      if (!data.pages || !Array.isArray(data.pages)) {
        throw new Error("AI returned an incomplete result. Please try again.");
      }

      onApply({
        surveyTitle: data.surveyTitle || surveyTitle,
        description: data.description || description,
        pages: data.pages,
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to connect to AI. Is the backend running?";
      setError(msg);
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Wand2 size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Modify with AI
              </h3>
              <p className="text-xs text-gray-500">
                {pages.length} page{pages.length !== 1 ? "s" : ""},{" "}
                {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Current survey summary */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Current Survey
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {surveyTitle}
            </p>
            <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
              <span>
                {pages.length} page{pages.length !== 1 ? "s" : ""}
              </span>
              <span>
                {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Prompt input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              What would you like to change?
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='e.g. "Add a question about satisfaction rating at the end of page 1"'
              className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-h-24 resize-y"
              disabled={isModifying}
            />
          </div>

          {/* Suggested modifications */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb size={11} /> Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_MODIFICATIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setAiPrompt(suggestion);
                    setError(null);
                  }}
                  disabled={isModifying}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading state */}
          {isModifying && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 size={24} className="text-indigo-600 animate-spin" />
              <p className="text-xs text-gray-500 font-medium">
                AI is modifying your survey...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isModifying}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleModify}
            disabled={isModifying || !aiPrompt.trim()}
            className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isModifying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Modifying...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Apply Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
