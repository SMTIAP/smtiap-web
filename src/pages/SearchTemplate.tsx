import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Sparkles,
  Loader2,
  X,
  ArrowLeft,
  Utensils,
  Coffee,
  Heart,
  GraduationCap,
  Users,
  Star,
  Building2,
  Mic,
  Zap,
  ShoppingBag,
  ChevronRight,
  Clock,
} from "lucide-react";
import { templateApi, type Template, type Category } from "../api/templateApi";
import { getIcon } from "../utils/iconMap";

const AI_SUGGESTIONS = [
  "A customer satisfaction survey for a coffee shop",
  "Employee engagement and workplace happiness survey",
  "Event feedback form for a tech conference",
  "University course evaluation survey",
  "Healthcare patient experience questionnaire",
];

// Helper function to get estimated time label
const getEstimatedTimeLabel = (time: string | undefined): string => {
  switch (time) {
    case "quick": return "⏱️ Quick (~2-3 min)";
    case "medium": return "⏱️ Medium (~5-7 min)";
    case "detailed": return "⏱️ Detailed (~10-15 min)";
    case "comprehensive": return "⏱️ Comprehensive (~20+ min)";
    default: return "⏱️ Quick (~2-3 min)";
  }
};

export default function SearchTemplate() {
  const navigate = useNavigate();
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // State for API data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  // Fetch templates and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [templatesData, categoriesData] = await Promise.all([
          templateApi.getTemplates(),
          templateApi.getCategories(),
        ]);
        setTemplates(templatesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        setError("Failed to load templates. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      if (selectedCategories.includes("All")) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(["All"]);
      }
      return;
    }

    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((c) => c !== "All");

      if (withoutAll.includes(cat)) {
        const newSelection = withoutAll.filter((c) => c !== cat);
        return newSelection;
      } else {
        return [...withoutAll, cat];
      }
    });
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes("All") ||
        selectedCategories.includes(t.category);
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategories, searchQuery]);

  const generateAndSave = async (title: string, prompt: string) => {
    const aiRes = await fetch("http://localhost:5000/api/ai/generate-survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ prompt }),
    });
    const aiData = await aiRes.json();
    if (!aiRes.ok) throw new Error(aiData?.message || "AI generation failed");
    const surveyTitle = aiData?.surveyTitle || title;
    const pages = aiData?.pages || [];
    const createRes = await fetch("http://localhost:5000/api/surveys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ surveyTitle, status: "Draft", pages }),
    });
    const created = await createRes.json();
    return created?._id || created?.survey?._id;
  };

  const handleUseTemplate = async (templateId: string) => {
    const template = templates.find((t) => t._id === templateId);
    if (!template) return;
    setLoadingTemplateId(templateId);
    try {
      const newSurveyId = await generateAndSave(
        template.title,
        template.aiPrompt,
      );
      if (newSurveyId)
        navigate("/add-questions", { state: { surveyId: newSurveyId } });
    } catch (err) {
      console.error("Failed to create survey from template:", err);
    } finally {
      setLoadingTemplateId(null);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const newSurveyId = await generateAndSave(aiPrompt, aiPrompt);
      if (newSurveyId) {
        setShowAiModal(false);
        navigate("/add-questions", { state: { surveyId: newSurveyId } });
      }
    } catch (err: any) {
      setAiError(err?.message || "Failed to generate survey with AI");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFDFD] dark:bg-[#0F172A]">
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin text-indigo-500 mx-auto mb-4"
          />
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFDFD] dark:bg-[#0F172A]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 fixed top-[70px] left-0 z-10" />

      <div className="flex w-full max-w-[1300px] mx-auto pt-4 sm:pt-6 pb-10 px-4 sm:px-6 gap-4 sm:gap-8 mt-1.5 flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 pt-0 lg:pt-4 sticky top-24 self-start">
          <div className="relative mb-3 lg:mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
            />
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 lg:mb-3">
            Categories
          </p>
          <div className="flex lg:flex-col gap-0.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => toggleCategory("All")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left group ${
                selectedCategories.includes("All") ||
                selectedCategories.length === 0
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  selectedCategories.includes("All") ||
                  selectedCategories.length === 0
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                }`}
              >
                {(selectedCategories.includes("All") ||
                  selectedCategories.length === 0) && (
                  <ChevronRight size={11} className="text-white" />
                )}
              </span>
              <span className="flex-1">All</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {templates.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              const count = templates.filter(
                (t) => t.category === cat.name,
              ).length;
              return (
                <button
                  key={cat._id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left group ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                    }`}
                  >
                    {isSelected && (
                      <ChevronRight size={11} className="text-white" />
                    )}
                  </span>
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-0 lg:pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h1 className="text-[#0F172A] dark:text-white text-2xl sm:text-3xl font-black tracking-tight">
              Explore Templates
            </h1>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-slate-400 text-xs sm:text-sm">
                {filteredTemplates.length} templates
              </span>
              {/* Circular Back Button - Top Right */}
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* New Empty */}
            <div
              onClick={() => navigate("/create-new-survey")}
              className="group cursor-pointer bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500"
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <Plus
                  size={44}
                  className="text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-all"
                />
              </div>
              <div className="p-4">
                <h3 className="text-[#0F172A] dark:text-white font-black text-base">
                  New Empty Survey
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Start from scratch with a blank canvas.
                </p>
              </div>
            </div>

            {/* AI Custom */}
            <div
              onClick={() => setShowAiModal(true)}
              className="group cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={44} className="text-white drop-shadow" />
              </div>
              <div className="p-4">
                <h3 className="text-[#0F172A] dark:text-white font-black text-base">
                  AI Custom Survey
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Describe your survey and AI builds it instantly.
                </p>
              </div>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map((temp) => {
              const Icon = getIcon(temp.icon);
              const isGenerating = loadingTemplateId === temp._id;
              return (
                <div
                  key={temp._id}
                  onClick={() =>
                    !isGenerating &&
                    navigate("/template-preview", {
                      state: { templateId: temp._id },
                    })
                  }
                  className="group cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`h-40 bg-gradient-to-br ${temp.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2
                          size={36}
                          className="text-white animate-spin"
                        />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                          Generating...
                        </span>
                      </div>
                    ) : (
                      <Icon size={40} className="text-white drop-shadow" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-[#0F172A] dark:text-white font-black text-base leading-tight">
                        {temp.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {temp.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {temp.description}
                    </p>
                    {/* ✅ ESTIMATED TIME BADGE */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full">
                        {getEstimatedTimeLabel(temp.estimatedTime)}
                      </span>
                      <p className="text-slate-300 dark:text-slate-500 text-xs">
                        Used {temp.usedCount} times
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search
                size={40}
                className="text-slate-200 dark:text-slate-600 mb-4"
              />
              <p className="text-slate-400 font-bold text-lg">
                No templates found
              </p>
              <p className="text-slate-300 dark:text-slate-500 text-sm mt-1">
                Try a different search or category
              </p>
            </div>
          )}
        </main>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-16">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !aiLoading && setShowAiModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-5 sm:p-8 max-w-lg w-full z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAiModal(false)}
              disabled={aiLoading}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all disabled:opacity-30"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-lg">
                  AI Survey Generator
                </p>
                <p className="text-slate-400 text-xs">
                  Describe your survey and AI will build it instantly
                </p>
              </div>
            </div>
            <textarea
              rows={4}
              placeholder="e.g. A customer satisfaction survey for a coffee shop..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            <div className="mt-3 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Suggested ideas
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setAiPrompt(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {aiError && (
              <p className="text-rose-500 text-xs font-medium mb-4 bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-xl">
                {aiError}
              </p>
            )}
            <button
              onClick={handleAiGenerate}
              disabled={!aiPrompt.trim() || aiLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {aiLoading ? (
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
      )}
    </div>
  );
}