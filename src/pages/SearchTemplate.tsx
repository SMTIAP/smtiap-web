import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { Utensils, Coffee, Plus, Search, Pencil } from "lucide-react";

interface SurveyItem {
  _id: string;
  surveyTitle?: string;
  status?: string;
  createdAt?: string;
}

export default function SearchTemplate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [draftSurveys, setDraftSurveys] = useState<SurveyItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  const templates = [
    { id: "food-res", title: "Food Satisfaction", category: "Restaurant", icon: <Utensils size={32} />, color: "bg-orange-50 text-orange-500 border-orange-100" },
    { id: "food-cafe", title: "Daily Cafe Feedback", category: "Cafe", icon: <Coffee size={32} />, color: "bg-amber-50 text-amber-500 border-amber-100" },
    { id: "food-res-2", title: "Restaurant Quality", category: "Restaurant", icon: <Utensils size={32} />, color: "bg-rose-50 text-rose-500 border-rose-100" },
    { id: "food-cafe-2", title: "Staff Performance", category: "Cafe", icon: <Coffee size={32} />, color: "bg-blue-50 text-blue-500 border-blue-100" },
  ];

  const templateByTitle = useMemo(
    () => templates.reduce((acc, template) => { acc[template.title.toLowerCase()] = template; return acc; }, {} as Record<string, (typeof templates)[number]>),
    [templates],
  );

  const uniqueDraftSurveys = useMemo(() => {
    const map = new Map<string, SurveyItem>();
    draftSurveys.forEach((survey) => {
      const key = (survey.surveyTitle || "untitled survey").trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) { map.set(key, survey); return; }
      const existingDate = new Date(existing.createdAt || 0).getTime();
      const currentDate = new Date(survey.createdAt || 0).getTime();
      if (currentDate >= existingDate) map.set(key, survey);
    });
    return Array.from(map.values());
  }, [draftSurveys]);

  const draftTitleSet = useMemo(
    () => new Set(uniqueDraftSurveys.map((survey) => (survey.surveyTitle || "Untitled Survey").trim().toLowerCase())),
    [uniqueDraftSurveys],
  );

  const uniqueTemplateCards = useMemo(
    () => templates.filter((template) => !draftTitleSet.has(template.title.trim().toLowerCase())),
    [draftTitleSet, templates],
  );

  useEffect(() => {
    const fetchDraftSurveys = async () => {
      try {
        setLoadingDrafts(true);
        const response = await fetch("http://localhost:5000/api/surveys");
        const data = await response.json();
        const list = Array.isArray(data) ? (data as SurveyItem[]) : [];
        setDraftSurveys(list.filter((survey) => survey.status === "Draft"));
      } catch (err) {
        console.error("Failed to load draft surveys:", err);
        setDraftSurveys([]);
      } finally {
        setLoadingDrafts(false);
      }
    };
    fetchDraftSurveys();
  }, []);

  const handleUseTemplate = async (templateTitle: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyTitle: templateTitle, status: "Draft", questions: [] }),
      });
      const newSurvey = await response.json();
      const newSurveyId = newSurvey?._id || newSurvey?.survey?._id;
      if (newSurveyId) navigate("/add-questions", { state: { surveyId: newSurveyId } });
    } catch (err) {
      console.error("Failed to create survey from template:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FDFDFD] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-blue-500" />

      <div className="flex max-w-[1200px] py-12 px-8 flex-col items-start gap-10 w-full">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-6">
            <BackButton />
            <h1 className="text-[#0F172A] dark:text-white text-4xl font-black tracking-tight">Search Template</h1>
          </div>
        </div>

        <div className="flex flex-col gap-10 w-full">
          {/* Search Bar */}
          <div className="relative w-full max-w-xl">
            <span className="absolute inset-y-0 left-4 flex items-center">
              <Search className="w-5 h-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full py-4 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-inner"
            />
          </div>

          {/* Draft Surveys */}
          <div className="w-full">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-[#0F172A] dark:text-white text-xl font-black tracking-tight">Survey Drafts</h2>
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Edit existing drafts</span>
            </div>

            {loadingDrafts ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Loading drafts...</div>
            ) : uniqueDraftSurveys.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No draft surveys found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full">
                {uniqueDraftSurveys.map((survey) => {
                  const title = survey.surveyTitle || "Untitled Survey";
                  const matchedTemplate = templateByTitle[title.toLowerCase()];
                  const icon = matchedTemplate?.icon || <Pencil size={32} />;
                  const color = matchedTemplate?.color || "bg-indigo-50 text-indigo-500 border-indigo-100";
                  return (
                    <div key={survey._id} onClick={() => navigate("/add-questions", { state: { surveyId: survey._id } })} className="flex flex-col gap-4 cursor-pointer group">
                      <div className={`relative flex items-center justify-center w-full aspect-square rounded-[2.5rem] border-2 transition-all group-hover:shadow-xl group-hover:-translate-y-2 ${color}`}>
                        {icon}
                        <button type="button"
                          onClick={(event) => { event.stopPropagation(); navigate("/add-questions", { state: { surveyId: survey._id } }); }}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 border border-white/60 text-slate-500 hover:text-indigo-600 transition-all flex items-center justify-center"
                          title="Edit draft" aria-label="Edit draft">
                          <Pencil size={12} />
                        </button>
                      </div>
                      <div className="px-2">
                        <p className="text-[#1E293B] dark:text-white font-black text-sm line-clamp-1">{title}</p>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Draft</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full">
            {/* New Empty */}
            <div onClick={() => navigate("/create-new-survey")} className="flex flex-col gap-4 cursor-pointer group">
              <div className="flex flex-col items-center justify-center w-full aspect-square rounded-[2.5rem] bg-[#2D9596] hover:bg-[#217374] transition-all shadow-xl shadow-teal-100 group-hover:-translate-y-2">
                <Plus size={48} className="text-white" />
              </div>
              <div className="px-2">
                <p className="text-[#1E293B] dark:text-white font-black text-sm">New Empty</p>
                <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Scratch</p>
              </div>
            </div>

            {/* Template Cards */}
            {uniqueTemplateCards.map((temp) => (
              <div key={temp.id} onClick={() => handleUseTemplate(temp.title)} className="flex flex-col gap-4 cursor-pointer group">
                <div className={`flex items-center justify-center w-full aspect-square rounded-[2.5rem] border-2 transition-all group-hover:shadow-xl group-hover:-translate-y-2 ${temp.color}`}>
                  {temp.icon}
                </div>
                <div className="px-2">
                  <p className="text-[#1E293B] dark:text-white font-black text-sm line-clamp-1">{temp.title}</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{temp.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-teal-700 dark:text-teal-300 font-black text-xs uppercase tracking-widest">Preparing Template...</p>
          </div>
        </div>
      )}
    </div>
  );
}