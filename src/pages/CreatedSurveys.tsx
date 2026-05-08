import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  Activity,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import api from "../api/api";

interface SurveyItem {
  _id: string;
  surveyTitle?: string;
  status: "Draft" | "Running" | "Finished";
  createdAt: string;
}

export default function CreatedSurveys() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await api.get("/surveys");
        setSurveys(response.data);
      } catch (err) {
        console.error("Failed to fetch surveys:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const handleCardClick = (survey: SurveyItem) => {
    if (survey.status === "Draft") {
      navigate("/add-questions", { state: { surveyId: survey._id } });
    } else if (survey.status === "Running" || survey.status === "Finished") {
      // ✅ Navigates to the results page for active surveys
      navigate(`/survey-results/${survey._id}`);
    }
  };

  const handleDeleteSurvey = async (
    event: React.MouseEvent,
    survey: SurveyItem,
  ) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete survey "${survey.surveyTitle || "Untitled Survey"}"?`,
    );
    if (!confirmed) return;

    try {
      setDeletingSurveyId(survey._id);
      await api.delete(`/surveys/${survey._id}`);

      setSurveys((prev) => prev.filter((item) => item._id !== survey._id));
    } catch (err) {
      console.error("Failed to delete survey:", err);
      window.alert("Could not delete survey. Please try again.");
    } finally {
      setDeletingSurveyId(null);
    }
  };

  const filteredSurveys = surveys.filter((survey) => {
    if (activeTab === "All") return true;
    return survey.status === activeTab;
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
          <p className="text-indigo-900 font-bold tracking-widest uppercase text-xs">
            Loading Workspace
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FDFDFD]">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="flex max-w-[1200px] py-12 px-8 flex-col items-start gap-10 w-full">
        <div className="flex justify-between items-end w-full">
          <div>
            <h1 className="text-[#0F172A] text-5xl font-black tracking-tight mb-2">
              My Surveys
            </h1>
            <p className="text-[#64748B] text-base font-medium">
              Track performance and draft new insights.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/templates")}
              className="group h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1"
            >
              <Plus
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-[#1E293B] text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1"
            >
              <ChevronLeft size={18} /> Back
            </button>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] self-end backdrop-blur-md border border-slate-200/50">
          {["All", "Running", "Draft", "Finished"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-[0.85rem] transition-all duration-300 ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 opacity-70"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {filteredSurveys.map((survey) => {
            const isRunning = survey.status === "Running";
            const isDraft = survey.status === "Draft";
            return (
              <div
                key={survey._id}
                onClick={() => handleCardClick(survey)}
                className="group relative flex flex-col items-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer aspect-[3/4] overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1.5 ${isRunning ? "bg-emerald-400" : isDraft ? "bg-amber-400" : "bg-rose-400"}`}
                ></div>

                <button
                  type="button"
                  onClick={(event) => handleDeleteSurvey(event, survey)}
                  disabled={deletingSurveyId === survey._id}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Delete survey"
                  title="Delete survey"
                >
                  <Trash2 size={14} />
                </button>

                <span className="text-slate-400 text-[10px] font-extrabold self-end mb-4 bg-slate-50 px-3 py-1 rounded-full">
                  {new Date(survey.createdAt).toLocaleDateString("en-GB")}
                </span>
                <div className="flex flex-col items-center justify-center flex-grow text-center w-full">
                  <div
                    className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-6 ${isRunning ? "bg-emerald-50 text-emerald-500" : isDraft ? "bg-amber-50 text-amber-500" : "bg-rose-50 text-rose-500"}`}
                  >
                    {isRunning ? (
                      <Activity size={28} />
                    ) : isDraft ? (
                      <Clock size={28} />
                    ) : (
                      <CheckCircle2 size={28} />
                    )}
                  </div>
                  <h3 className="text-slate-800 font-black text-lg leading-tight line-clamp-2">
                    {survey.surveyTitle || "Untitled Survey"}
                  </h3>
                </div>
                <div
                  className={`mt-6 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${isRunning ? "text-emerald-600 border-emerald-100 bg-emerald-50" : isDraft ? "text-amber-600 border-amber-100 bg-amber-50" : "text-rose-600 border-rose-100 bg-rose-50"}`}
                >
                  {survey.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
