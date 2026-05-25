import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import {
  Search, Plus, Pencil, Sparkles, Loader2, X,
  Utensils, Coffee, Heart, GraduationCap, Users,
  Star, Building2, Mic, Zap, ShoppingBag,
} from "lucide-react";

interface SurveyItem {
  _id: string;
  surveyTitle?: string;
  status?: string;
  createdAt?: string;
}

const CATEGORIES = [
  "All",
  "Most Popular",
  "Restaurant",
  "HR",
  "Education",
  "Healthcare",
  "Events",
  "Corporate",
  "Product",
  "Retail",
];

const TEMPLATES = [
  {
    id: "csat",
    title: "Customer Satisfaction Survey",
    description: "Keep your customers happy and turn them into advocates.",
    category: "Most Popular",
    usedCount: "388,600+",
    gradient: "from-orange-400 to-rose-500",
    Icon: Star,
    aiPrompt: "Create a detailed customer satisfaction survey covering overall experience, product/service quality, staff friendliness, value for money, likelihood to recommend (NPS), and open feedback.",
  },
  {
    id: "employee",
    title: "Employee Engagement Survey",
    description: "Learn about your employees' experience and workplace happiness.",
    category: "HR",
    usedCount: "345,600+",
    gradient: "from-pink-400 to-rose-500",
    Icon: Users,
    aiPrompt: "Create an employee engagement survey covering job satisfaction, team culture, manager support, work-life balance, recognition, career growth, and NPS for recommending the company.",
  },
  {
    id: "nps",
    title: "Net Promoter Score (NPS)",
    description: "Measure customer loyalty and identify your promoters.",
    category: "Most Popular",
    usedCount: "280,000+",
    gradient: "from-blue-400 to-indigo-500",
    Icon: Zap,
    aiPrompt: "Create an NPS survey with the standard NPS question (0-10 scale), follow-up reason question, and open-ended feedback for improvement.",
  },
  {
    id: "food-res",
    title: "Food Satisfaction Survey",
    description: "Rate food quality, service speed, and overall dining experience.",
    category: "Restaurant",
    usedCount: "120,000+",
    gradient: "from-orange-400 to-amber-500",
    Icon: Utensils,
    aiPrompt: "Create a food satisfaction survey for a restaurant covering food quality, service speed, staff friendliness, ambiance, value for money, and overall experience.",
  },
  {
    id: "cafe",
    title: "Daily Cafe Feedback",
    description: "Get daily feedback on coffee quality, service, and atmosphere.",
    category: "Restaurant",
    usedCount: "85,000+",
    gradient: "from-amber-400 to-orange-500",
    Icon: Coffee,
    aiPrompt: "Create a daily cafe feedback survey covering coffee and drink quality, service speed, seating comfort, cleanliness, visit frequency, and suggestions for improvement.",
  },
  {
    id: "patient",
    title: "Patient Experience Survey",
    description: "Measure healthcare quality and patient satisfaction.",
    category: "Healthcare",
    usedCount: "95,000+",
    gradient: "from-emerald-400 to-teal-500",
    Icon: Heart,
    aiPrompt: "Create a healthcare patient experience survey covering quality of care, wait times, staff communication, facility cleanliness, likelihood to return, and improvement suggestions.",
  },
  {
    id: "course",
    title: "Course Evaluation Survey",
    description: "Collect feedback on instructor effectiveness and course content.",
    category: "Education",
    usedCount: "110,000+",
    gradient: "from-indigo-400 to-violet-500",
    Icon: GraduationCap,
    aiPrompt: "Create a university course evaluation survey covering instructor effectiveness, course content quality, pace, difficulty level, learning outcomes, and improvement suggestions.",
  },
  {
    id: "event",
    title: "Event Feedback Survey",
    description: "Measure attendee satisfaction and improve future events.",
    category: "Events",
    usedCount: "75,000+",
    gradient: "from-yellow-400 to-amber-500",
    Icon: Star,
    aiPrompt: "Create a post-event feedback survey covering overall experience, organization, speaker or content quality, venue, networking value, likelihood to attend future events, and suggestions.",
  },
  {
    id: "staff",
    title: "Staff Performance Review",
    description: "Evaluate team member performance, communication, and collaboration.",
    category: "Corporate",
    usedCount: "60,000+",
    gradient: "from-blue-400 to-cyan-500",
    Icon: Building2,
    aiPrompt: "Create a staff performance review survey covering overall performance, communication, collaboration, deadline management, problem-solving, strengths, and areas for improvement.",
  },
  {
    id: "product",
    title: "Product Feedback Survey",
    description: "Gather feature requests, pain points, and satisfaction scores.",
    category: "Product",
    usedCount: "130,000+",
    gradient: "from-purple-400 to-fuchsia-500",
    Icon: Mic,
    aiPrompt: "Create a product feedback survey covering overall satisfaction, ease of use, usage frequency, most valued features, NPS score, feature requests, and pain points.",
  },
  {
    id: "retail",
    title: "Retail Shopping Experience",
    description: "Understand the in-store experience and buying journey.",
    category: "Retail",
    usedCount: "50,000+",
    gradient: "from-rose-400 to-pink-500",
    Icon: ShoppingBag,
    aiPrompt: "Create a retail shopping experience survey covering store layout, product availability, staff helpfulness, checkout experience, value for money, and likelihood to return.",
  },
  {
    id: "remote-work",
    title: "Remote Work Check-In",
    description: "Monitor employee wellbeing and productivity while working remotely.",
    category: "HR",
    usedCount: "88,000+",
    gradient: "from-teal-400 to-cyan-500",
    Icon: Users,
    aiPrompt: "Create a remote work check-in survey covering productivity, communication with team, work-life balance, technology satisfaction, mental wellbeing, and support needed from management.",
  },
];

const AI_SUGGESTIONS = [
  "A customer satisfaction survey for a coffee shop",
  "Employee engagement and workplace happiness survey",
  "Event feedback form for a tech conference",
  "University course evaluation survey",
  "Healthcare patient experience questionnaire",
];

export default function SearchTemplate() {
  const navigate = useNavigate();
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [draftSurveys, setDraftSurveys] = useState<SurveyItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDraftSurveys = async () => {
      try {
        setLoadingDrafts(true);
        const response = await fetch("http://localhost:5000/api/surveys", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await response.json();
        const list = Array.isArray(data) ? (data as SurveyItem[]) : [];
        setDraftSurveys(list.filter((s) => s.status === "Draft"));
      } catch (err) {
        console.error("Failed to load draft surveys:", err);
        setDraftSurveys([]);
      } finally {
        setLoadingDrafts(false);
      }
    };
    fetchDraftSurveys();
  }, []);

  const draftTitleSet = useMemo(
    () => new Set(draftSurveys.map((s) => (s.surveyTitle || "").trim().toLowerCase())),
    [draftSurveys]
  );

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const generateAndSave = async (title: string, prompt: string) => {
    const aiRes = await fetch("http://localhost:5000/api/ai/generate-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: "include",
      body: JSON.stringify({ prompt }),
    });
    const aiData = await aiRes.json();
    if (!aiRes.ok) throw new Error(aiData?.message || "AI generation failed");

    const surveyTitle = aiData?.surveyTitle || title;
    const pages = aiData?.pages || [];

    const createRes = await fetch("http://localhost:5000/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: "include",
      body: JSON.stringify({ surveyTitle, status: "Draft", pages }),
    });
    const created = await createRes.json();
    return created?._id || created?.survey?._id;
  };

  const handleUseTemplate = async (template: (typeof TEMPLATES)[number]) => {
    setLoadingTemplateId(template.id);
    try {
      const newSurveyId = await generateAndSave(template.title, template.aiPrompt);
      if (newSurveyId) navigate("/add-questions", { state: { surveyId: newSurveyId } });
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

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFDFD] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex max-w-[1300px] mx-auto py-10 px-8 w-full gap-8">

        {/* Left Sidebar — filters */}
        <aside className="w-56 shrink-0 flex flex-col gap-6 pt-2">
          <div>
            <BackButton />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1 text-xs text-slate-400">
                      ({TEMPLATES.filter((t) => t.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-[#0F172A] dark:text-white text-3xl font-black tracking-tight">
              Explore Templates
            </h1>
            <span className="text-slate-400 text-sm">
              {filteredTemplates.length} templates
            </span>
          </div>

          {/* Draft Surveys */}
          {!loadingDrafts && draftSurveys.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#0F172A] dark:text-white text-lg font-black">Continue Drafts</h2>
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Edit existing drafts</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {draftSurveys.map((survey) => {
                  const title = survey.surveyTitle || "Untitled Survey";
                  const matched = TEMPLATES.find((t) => t.title.toLowerCase() === title.toLowerCase());
                  const gradient = matched?.gradient || "from-indigo-400 to-purple-500";
                  const Icon = matched?.Icon || Pencil;
                  return (
                    <div key={survey._id} onClick={() => navigate("/add-questions", { state: { surveyId: survey._id } })}
                      className="group cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                        <Icon size={32} className="text-white drop-shadow" />
                        <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest text-white/80 bg-black/20 px-2 py-0.5 rounded-full">Draft</span>
                      </div>
                      <div className="p-3">
                        <p className="text-[#1E293B] dark:text-white font-black text-sm line-clamp-1">{title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">Click to continue editing</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* New Empty Card */}
            <div onClick={() => navigate("/create-new-survey")}
              className="group cursor-pointer bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500">
              <div className="h-40 bg-slate-700 dark:bg-slate-900 flex items-center justify-center">
                <Plus size={48} className="text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <div className="p-4">
                <h3 className="text-[#0F172A] dark:text-white font-black text-base">New Empty Survey</h3>
                <p className="text-slate-400 text-sm mt-1">Start from scratch with a blank survey.</p>
              </div>
            </div>

            {/* AI Custom Card */}
            <div onClick={() => setShowAiModal(true)}
              className="group cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={48} className="text-white drop-shadow" />
              </div>
              <div className="p-4">
                <h3 className="text-[#0F172A] dark:text-white font-black text-base">AI Custom Survey</h3>
                <p className="text-slate-400 text-sm mt-1">Describe your survey and let AI build it instantly.</p>
              </div>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map((temp) => {
              const Icon = temp.Icon;
              const isGenerating = loadingTemplateId === temp.id;
              const alreadyDraft = draftTitleSet.has(temp.title.toLowerCase());
              return (
                <div key={temp.id}
                  onClick={() => !isGenerating && !alreadyDraft && handleUseTemplate(temp)}
                  className={`group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 ${
                    alreadyDraft ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                  }`}>
                  <div className={`h-40 bg-gradient-to-br ${temp.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={36} className="text-white animate-spin" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Generating...</span>
                      </div>
                    ) : (
                      <Icon size={40} className="text-white drop-shadow" />
                    )}
                    {alreadyDraft && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest text-white bg-black/30 px-2 py-0.5 rounded-full">In Drafts</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-[#0F172A] dark:text-white font-black text-base leading-tight">{temp.title}</h3>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {temp.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{temp.description}</p>
                    <p className="text-slate-300 dark:text-slate-500 text-xs mt-2">Used {temp.usedCount} times</p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search size={40} className="text-slate-200 dark:text-slate-600 mb-4" />
              <p className="text-slate-400 font-bold text-lg">No templates found</p>
              <p className="text-slate-300 dark:text-slate-500 text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </main>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-16">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !aiLoading && setShowAiModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-8 max-w-lg w-full z-10">
            <button onClick={() => setShowAiModal(false)} disabled={aiLoading}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all disabled:opacity-30">
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-lg">AI Survey Generator</p>
                <p className="text-slate-400 text-xs">Describe your survey and AI will build it instantly</p>
              </div>
            </div>

            <textarea rows={4}
              placeholder="e.g. A customer satisfaction survey for a coffee shop with questions about service, food quality, and ambiance..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />

            <div className="mt-3 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Suggested ideas</p>
              <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setAiPrompt(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {aiError && <p className="text-rose-500 text-xs font-medium mb-4 bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-xl">{aiError}</p>}

            <button onClick={handleAiGenerate} disabled={!aiPrompt.trim() || aiLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {aiLoading
                ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
                : <><Sparkles size={16} /> Generate Survey</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}