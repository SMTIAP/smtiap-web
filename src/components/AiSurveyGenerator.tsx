import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Bot,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
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
  "A customer satisfaction survey for a new coffee shop",
  "Employee engagement and workplace happiness survey",
  "Event feedback form for a tech conference",
  "University course evaluation survey for students",
  "Healthcare patient experience questionnaire",
];

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

      // Check if AI detected invalid input (gibberish/nonsense)
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

      onGenerated({
        surveyTitle: data.surveyTitle,
        description: data.description || "",
        pages: data.pages,
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to connect to AI. Is the backend running?";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider">
            AI Survey Generator
          </h2>
          <p className="text-[#64748B] text-xs">
            Describe your survey and let AI create it for you
          </p>
        </div>
      </div>

      {/* Prompt input */}
      <div className="flex flex-col gap-2">
        <label className="text-[#1E293B] text-xs font-bold uppercase">
          Describe Your Survey
        </label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g. A customer feedback survey about our new mobile app's user experience and performance..."
          className="w-full p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-h-30 resize-y transition-all"
          disabled={isGenerating}
        />
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-col gap-2">
        <label className="text-[#1E293B] text-xs font-bold uppercase flex items-center gap-1.5">
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
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              <MessageSquare size={12} />
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="relative">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-[#64748B] font-medium">
            AI is crafting your survey...
          </p>
          <p className="text-xs text-[#94A3B8]">
            This usually takes a few seconds
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className="px-4 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          Back to Manual
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Survey
            </>
          )}
        </button>
      </div>
    </div>
  );
}
