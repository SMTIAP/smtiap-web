import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import {
  Search, Plus, Pencil, Loader2, X,
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
  "All", "Most Popular", "Restaurant", "HR",
  "Education", "Healthcare", "Events", "Corporate", "Product", "Retail",
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
    pages: [
      {
        id: "page-1", title: "Customer Satisfaction",
        questions: [
          { id: "q1", type: "rating", label: "How satisfied are you with our product or service overall?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "How would you rate the quality of our product or service?", required: true, options: ["Excellent", "Good", "Average", "Poor", "Very Poor"] },
          { id: "q3", type: "multiple_choice", label: "How would you rate the friendliness of our staff?", required: false, options: ["Very Friendly", "Friendly", "Neutral", "Unfriendly"] },
          { id: "q4", type: "rating", label: "How likely are you to recommend us to a friend or colleague? (NPS)", required: true, max: 10 },
          { id: "q5", type: "long_text", label: "Do you have any additional comments or suggestions for us?", required: false },
        ],
      },
    ],
  },
  {
    id: "employee",
    title: "Employee Engagement Survey",
    description: "Learn about your employees' experience and workplace happiness.",
    category: "HR",
    usedCount: "345,600+",
    gradient: "from-pink-400 to-rose-500",
    Icon: Users,
    pages: [
      {
        id: "page-1", title: "Employee Engagement",
        questions: [
          { id: "q1", type: "rating", label: "How satisfied are you with your current role?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "How would you describe the team culture?", required: true, options: ["Excellent", "Good", "Needs Improvement", "Poor"] },
          { id: "q3", type: "multiple_choice", label: "How supported do you feel by your manager?", required: true, options: ["Very Supported", "Supported", "Neutral", "Unsupported"] },
          { id: "q4", type: "multiple_choice", label: "How would you rate your work-life balance?", required: true, options: ["Excellent", "Good", "Fair", "Poor"] },
          { id: "q5", type: "rating", label: "How likely are you to recommend this company as a great place to work?", required: true, max: 10 },
          { id: "q6", type: "long_text", label: "What could we do to improve your experience at work?", required: false },
        ],
      },
    ],
  },
  {
    id: "nps",
    title: "Net Promoter Score (NPS)",
    description: "Measure customer loyalty and identify your promoters.",
    category: "Most Popular",
    usedCount: "280,000+",
    gradient: "from-blue-400 to-indigo-500",
    Icon: Zap,
    pages: [
      {
        id: "page-1", title: "NPS Survey",
        questions: [
          { id: "q1", type: "rating", label: "On a scale of 0 to 10, how likely are you to recommend us to a friend or colleague?", required: true, max: 10 },
          { id: "q2", type: "long_text", label: "What is the main reason for your score?", required: false },
          { id: "q3", type: "long_text", label: "What could we do to improve your experience?", required: false },
        ],
      },
    ],
  },
  {
    id: "food-res",
    title: "Food Satisfaction Survey",
    description: "Rate food quality, service speed, and overall dining experience.",
    category: "Restaurant",
    usedCount: "120,000+",
    gradient: "from-orange-400 to-amber-500",
    Icon: Utensils,
    pages: [
      {
        id: "page-1", title: "Dining Experience",
        questions: [
          { id: "q1", type: "rating", label: "How would you rate the quality of the food?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "How was the service speed?", required: true, options: ["Very Fast", "Fast", "Average", "Slow", "Very Slow"] },
          { id: "q3", type: "multiple_choice", label: "How friendly was our staff?", required: true, options: ["Very Friendly", "Friendly", "Neutral", "Unfriendly"] },
          { id: "q4", type: "rating", label: "How would you rate the overall dining experience?", required: true, max: 5 },
          { id: "q5", type: "multiple_choice", label: "Would you visit us again?", required: true, options: ["Definitely", "Probably", "Not Sure", "Probably Not", "Definitely Not"] },
          { id: "q6", type: "long_text", label: "Any suggestions for improvement?", required: false },
        ],
      },
    ],
  },
  {
    id: "cafe",
    title: "Daily Cafe Feedback",
    description: "Get daily feedback on coffee quality, service, and atmosphere.",
    category: "Restaurant",
    usedCount: "85,000+",
    gradient: "from-amber-400 to-orange-500",
    Icon: Coffee,
    pages: [
      {
        id: "page-1", title: "Cafe Feedback",
        questions: [
          { id: "q1", type: "rating", label: "How would you rate the quality of your coffee or drink?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "How was the service speed?", required: true, options: ["Very Fast", "Fast", "Average", "Slow"] },
          { id: "q3", type: "multiple_choice", label: "How comfortable was the seating?", required: false, options: ["Very Comfortable", "Comfortable", "Average", "Uncomfortable"] },
          { id: "q4", type: "multiple_choice", label: "How often do you visit us?", required: false, options: ["Daily", "Several times a week", "Weekly", "Occasionally", "First time"] },
          { id: "q5", type: "long_text", label: "Any suggestions to make your visit better?", required: false },
        ],
      },
    ],
  },
  {
    id: "patient",
    title: "Patient Experience Survey",
    description: "Measure healthcare quality and patient satisfaction.",
    category: "Healthcare",
    usedCount: "95,000+",
    gradient: "from-emerald-400 to-teal-500",
    Icon: Heart,
    pages: [
      {
        id: "page-1", title: "Patient Experience",
        questions: [
          { id: "q1", type: "rating", label: "How would you rate the quality of care you received?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "How long did you wait before being seen?", required: true, options: ["Less than 15 mins", "15-30 mins", "30-60 mins", "Over 1 hour"] },
          { id: "q3", type: "multiple_choice", label: "How clearly did the staff communicate with you?", required: true, options: ["Very Clearly", "Clearly", "Somewhat", "Not Clearly"] },
          { id: "q4", type: "rating", label: "How likely are you to return to this facility?", required: true, max: 5 },
          { id: "q5", type: "long_text", label: "What could we do to improve your experience?", required: false },
        ],
      },
    ],
  },
  {
    id: "course",
    title: "Course Evaluation Survey",
    description: "Collect feedback on instructor effectiveness and course content.",
    category: "Education",
    usedCount: "110,000+",
    gradient: "from-indigo-400 to-violet-500",
    Icon: GraduationCap,
    pages: [
      {
        id: "page-1", title: "Course Evaluation",
        questions: [
          { id: "q1", type: "rating", label: "How effective was the instructor in delivering the course?", required: true, max: 5 },
          { id: "q2", type: "rating", label: "How would you rate the quality of the course content?", required: true, max: 5 },
          { id: "q3", type: "multiple_choice", label: "How would you rate the pace of the course?", required: true, options: ["Too Fast", "Just Right", "Too Slow"] },
          { id: "q4", type: "multiple_choice", label: "How would you rate the difficulty level?", required: false, options: ["Too Hard", "Appropriate", "Too Easy"] },
          { id: "q5", type: "long_text", label: "What would you suggest to improve this course?", required: false },
        ],
      },
    ],
  },
  {
    id: "event",
    title: "Event Feedback Survey",
    description: "Measure attendee satisfaction and improve future events.",
    category: "Events",
    usedCount: "75,000+",
    gradient: "from-yellow-400 to-amber-500",
    Icon: Star,
    pages: [
      {
        id: "page-1", title: "Event Feedback",
        questions: [
          { id: "q1", type: "rating", label: "How would you rate the overall event experience?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "How well was the event organised?", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
          { id: "q3", type: "rating", label: "How would you rate the speakers or content quality?", required: true, max: 5 },
          { id: "q4", type: "multiple_choice", label: "Would you attend future events?", required: true, options: ["Definitely", "Probably", "Not Sure", "No"] },
          { id: "q5", type: "long_text", label: "What suggestions do you have for future events?", required: false },
        ],
      },
    ],
  },
  {
    id: "staff",
    title: "Staff Performance Review",
    description: "Evaluate team member performance, communication, and collaboration.",
    category: "Corporate",
    usedCount: "60,000+",
    gradient: "from-blue-400 to-cyan-500",
    Icon: Building2,
    pages: [
      {
        id: "page-1", title: "Staff Performance",
        questions: [
          { id: "q1", type: "rating", label: "How would you rate the staff member's overall performance?", required: true, max: 5 },
          { id: "q2", type: "rating", label: "How effective is their communication?", required: true, max: 5 },
          { id: "q3", type: "rating", label: "How well do they collaborate with the team?", required: true, max: 5 },
          { id: "q4", type: "multiple_choice", label: "Do they consistently meet deadlines?", required: true, options: ["Always", "Usually", "Sometimes", "Rarely"] },
          { id: "q5", type: "long_text", label: "What are their key strengths?", required: false },
          { id: "q6", type: "long_text", label: "What areas could they improve in?", required: false },
        ],
      },
    ],
  },
  {
    id: "product",
    title: "Product Feedback Survey",
    description: "Gather feature requests, pain points, and satisfaction scores.",
    category: "Product",
    usedCount: "130,000+",
    gradient: "from-purple-400 to-fuchsia-500",
    Icon: Mic,
    pages: [
      {
        id: "page-1", title: "Product Feedback",
        questions: [
          { id: "q1", type: "rating", label: "How satisfied are you with the product overall?", required: true, max: 5 },
          { id: "q2", type: "rating", label: "How easy is the product to use?", required: true, max: 5 },
          { id: "q3", type: "multiple_choice", label: "How often do you use the product?", required: false, options: ["Daily", "Weekly", "Monthly", "Rarely"] },
          { id: "q4", type: "rating", label: "How likely are you to recommend it to others?", required: true, max: 10 },
          { id: "q5", type: "long_text", label: "What features do you find most valuable?", required: false },
          { id: "q6", type: "long_text", label: "What improvements would you like to see?", required: false },
        ],
      },
    ],
  },
  {
    id: "retail",
    title: "Retail Shopping Experience",
    description: "Understand the in-store experience and buying journey.",
    category: "Retail",
    usedCount: "50,000+",
    gradient: "from-rose-400 to-pink-500",
    Icon: ShoppingBag,
    pages: [
      {
        id: "page-1", title: "Shopping Experience",
        questions: [
          { id: "q1", type: "rating", label: "How easy was it to find what you were looking for?", required: true, max: 5 },
          { id: "q2", type: "multiple_choice", label: "Were the products you wanted available in stock?", required: true, options: ["Yes, all", "Most of them", "Some of them", "None"] },
          { id: "q3", type: "rating", label: "How helpful was our staff?", required: true, max: 5 },
          { id: "q4", type: "multiple_choice", label: "How was your checkout experience?", required: false, options: ["Very Smooth", "Good", "Average", "Poor"] },
          { id: "q5", type: "rating", label: "How likely are you to shop with us again?", required: true, max: 5 },
          { id: "q6", type: "long_text", label: "Any feedback to help us improve?", required: false },
        ],
      },
    ],
  },
  {
    id: "remote-work",
    title: "Remote Work Check-In",
    description: "Monitor employee wellbeing and productivity while working remotely.",
    category: "HR",
    usedCount: "88,000+",
    gradient: "from-teal-400 to-cyan-500",
    Icon: Users,
    pages: [
      {
        id: "page-1", title: "Remote Work",
        questions: [
          { id: "q1", type: "rating", label: "How productive do you feel working remotely?", required: true, max: 5 },
          { id: "q2", type: "rating", label: "How well are you communicating with your team?", required: true, max: 5 },
          { id: "q3", type: "multiple_choice", label: "How would you rate your work-life balance working remotely?", required: true, options: ["Excellent", "Good", "Fair", "Poor"] },
          { id: "q4", type: "multiple_choice", label: "How satisfied are you with the technology tools provided?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"] },
          { id: "q5", type: "long_text", label: "What additional support do you need from management?", required: false },
        ],
      },
    ],
  },
];

export default function SearchTemplate() {
  const navigate = useNavigate();
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [draftSurveys, setDraftSurveys] = useState<SurveyItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  // Toggle category checkbox selection
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(t.category);
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategories, searchQuery]);

  // Creates survey directly from template pages — no AI call needed
  const handleUseTemplate = async (template: (typeof TEMPLATES)[number]) => {
    setLoadingTemplateId(template.id);
    try {
      const response = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          surveyTitle: template.title,
          status: "Draft",
          pages: template.pages,
        }),
      });
      const created = await response.json();
      const newSurveyId = created?._id || created?.survey?._id;
      if (newSurveyId) navigate("/add-questions", { state: { surveyId: newSurveyId } });
    } catch (err) {
      console.error("Failed to create survey from template:", err);
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFDFD] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex max-w-[1300px] mx-auto py-10 px-8 w-full gap-8">

        {/* Left Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col gap-6 pt-2">
          <BackButton />

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

          {/* Category Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories</p>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.filter(c => c !== "All").map((cat) => {
                const isChecked = selectedCategories.includes(cat);
                const count = TEMPLATES.filter((t) => t.category === cat).length;
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div
                      onClick={() => toggleCategory(cat)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {isChecked && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() => toggleCategory(cat)}
                      className={`text-sm font-medium flex-1 transition-colors ${
                        isChecked
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    >
                      {cat}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#0F172A] dark:text-white text-3xl font-black tracking-tight">
                Explore Templates
              </h1>
              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-700"
                    >
                      {cat}
                      <button onClick={() => toggleCategory(cat)} className="hover:text-indigo-800 ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-slate-400 text-sm">{filteredTemplates.length} templates</span>
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
                    <div key={survey._id}
                      onClick={() => navigate("/add-questions", { state: { surveyId: survey._id } })}
                      className="group cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
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
            <div
              onClick={() => navigate("/create-new-survey")}
              className="group cursor-pointer bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500"
            >
              <div className="h-40 bg-slate-700 dark:bg-slate-900 flex items-center justify-center">
                <Plus size={48} className="text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <div className="p-4">
                <h3 className="text-[#0F172A] dark:text-white font-black text-base">New Empty Survey</h3>
                <p className="text-slate-400 text-sm mt-1">Start from scratch with a blank survey.</p>
              </div>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map((temp) => {
              const Icon = temp.Icon;
              const isGenerating = loadingTemplateId === temp.id;
              const alreadyDraft = draftTitleSet.has(temp.title.toLowerCase());
              return (
                <div
                  key={temp.id}
                  onClick={() => !isGenerating && !alreadyDraft && handleUseTemplate(temp)}
                  className={`group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 ${
                    alreadyDraft
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  <div className={`h-40 bg-gradient-to-br ${temp.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={36} className="text-white animate-spin" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Creating...</span>
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
    </div>
  );
}