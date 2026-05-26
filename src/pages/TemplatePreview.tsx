import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, X, Loader2,
  Monitor, Tablet, Smartphone, FileText, CopyPlus,
} from "lucide-react";
import { TEMPLATES } from "./SearchTemplate";

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceType, string> = {
  desktop: "w-full max-w-2xl",
  tablet: "w-[600px]",
  mobile: "w-[375px]",
};

const DeviceIcon = ({ device, current, onClick }: { device: DeviceType; current: DeviceType; onClick: () => void }) => {
  const icons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
  const Icon = icons[device];
  return (
    <button onClick={onClick}
      className={`p-2 rounded-lg transition-all ${current === device ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
      title={device.charAt(0).toUpperCase() + device.slice(1)}>
      <Icon size={18} />
    </button>
  );
};

const QuestionPreview = ({ question, index, primaryColor }: { question: any; index: number; primaryColor: string }) => {
  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-3">
        <span style={{ color: primaryColor }} className="font-bold text-sm">{index + 1}.</span>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{question.label}</h3>
      </div>
      <div className="pl-5">
        {question.type === "text" && (
          <div className="w-full border-b-2 border-gray-200 dark:border-slate-600 pb-2 text-slate-300 dark:text-slate-500 text-sm italic">
            Type your answer here...
          </div>
        )}
        {question.type === "rating" && (
          <div className="flex gap-1.5">
            {[...Array(question.max ?? 5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}
        {question.type === "multiple_choice" && (
          <div className="space-y-2">
            {question.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{opt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TemplatePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const templateId = location.state?.templateId;
  const template = TEMPLATES.find((t) => t.id === templateId);

  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const token = localStorage.getItem("token");

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-[#0F172A]">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Template not found.</p>
          <button onClick={() => navigate("/templates")} className="text-indigo-600 font-bold">← Back to templates</button>
        </div>
      </div>
    );
  }

  const Icon = template.Icon;
  const primaryColor = "#6366F1";

  // Split questions into pages of 3
  const questionsPerPage = 3;
  const pages = [];
  for (let i = 0; i < template.previewQuestions.length; i += questionsPerPage) {
    pages.push(template.previewQuestions.slice(i, i + questionsPerPage));
  }
  const totalPages = pages.length;

  const handleUseTemplate = async () => {
    setIsCreating(true);
    try {
      // Convert template questions to the format expected by your AddQuestions component
      const surveyPages = [{
        id: `page-${Date.now()}`,
        title: "Page 1",
        questions: template.previewQuestions.map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          type: q.type === "text" ? "long_text" : q.type,
          label: q.label,
          required: true,
          placeholder: q.type === "text" ? "Enter your answer here..." : undefined,
          options: q.options || undefined,
          max: q.max || undefined,
          branching: undefined,
        }))
      }];

      // First, create the survey as a draft
      const createRes = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({
          surveyTitle: template.title,
          description: template.description,
          status: "Draft",
          pages: surveyPages,
          primaryColor: "#6366F1",
          themeColor: "#6366F1",
          customizeBranding: false,
        }),
      });
      
      if (!createRes.ok) {
        throw new Error(`HTTP ${createRes.status}: ${createRes.statusText}`);
      }
      
      const data = await createRes.json();
      const newSurveyId = data._id || data.survey?._id;
      
      if (newSurveyId) {
        navigate("/add-questions", { 
          state: { 
            surveyId: newSurveyId,
            formData: {
              surveyTitle: template.title,
              description: template.description,
              customizeBranding: false,
              themeColor: "#6366F1",
            }
          } 
        });
      } else {
        throw new Error("No survey ID returned");
      }
    } catch (err) {
      console.error("Failed to create survey from template:", err);
      alert("Failed to create survey. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden transition-colors duration-300">

      {/* Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => navigate("/templates")}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors text-sm font-medium">
            <X size={18} />
            <span>Close preview</span>
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
          <span className="text-slate-400 text-sm truncate max-w-xs">{template.title}</span>
        </div>

        {/* Device preview area */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-8 px-4 relative">

          {/* Survey preview card */}
          <div className={`transition-all duration-300 ${deviceWidths[device]}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Colored header */}
              <div className={`bg-gradient-to-br ${template.gradient} p-8 flex items-center gap-4`}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-black text-xl leading-tight">{template.title}</h2>
                  <p className="text-white/70 text-sm mt-0.5">{template.category}</p>
                </div>
              </div>

              {/* Questions */}
              <div className="p-8">
                <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">{template.description}</p>

                {pages[currentPage]?.map((q: any, idx: number) => (
                  <QuestionPreview
                    key={idx}
                    question={q}
                    index={currentPage * questionsPerPage + idx}
                    primaryColor={primaryColor}
                  />
                ))}
              </div>

              {/* Page navigation */}
              {totalPages > 1 && (
                <div className="px-8 pb-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="flex gap-1.5">
                    {pages.map((_, i) => (
                      <div key={i} onClick={() => setCurrentPage(i)}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentPage ? "bg-indigo-500 w-4" : "bg-slate-200 dark:bg-slate-600"}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <ArrowLeft size={16} className="text-slate-500 dark:text-slate-400" />
                    </button>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <ArrowRight size={16} className="text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device switcher — bottom left */}
          <div className="fixed bottom-6 left-6 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 shadow-lg">
            <DeviceIcon device="desktop" current={device} onClick={() => setDevice("desktop")} />
            <DeviceIcon device="tablet" current={device} onClick={() => setDevice("tablet")} />
            <DeviceIcon device="mobile" current={device} onClick={() => setDevice("mobile")} />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6 flex-1">

          {/* Template info */}
          <div className={`h-28 bg-gradient-to-br ${template.gradient} rounded-2xl flex items-center justify-center mb-5`}>
            <Icon size={44} className="text-white drop-shadow" />
          </div>

          <h2 className="text-[#0F172A] dark:text-white font-black text-xl leading-tight mb-2">{template.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-1">{template.description}</p>
          <p className="text-slate-300 dark:text-slate-500 text-xs mb-6">Used {template.usedCount} times</p>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <FileText size={13} />
              <span>{template.previewQuestions.length} questions · {totalPages} page{totalPages !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
              You can edit, add, or remove questions after creating.
            </p>
          </div>

          {/* Use template button - Clean, professional look without AI styling */}
          <button 
            onClick={handleUseTemplate} 
            disabled={isCreating}
            className="w-full py-3 bg-white dark:bg-slate-700 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-50 dark:hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
          >
            {isCreating
              ? <><Loader2 size={16} className="animate-spin" /> Creating survey...</>
              : <><CopyPlus size={16} /> Use this template</>
            }
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            <span className="text-slate-300 dark:text-slate-500 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
          </div>

          {/* Blank survey link */}
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">Want to start from scratch?</p>
            <button onClick={() => navigate("/create-new-survey")}
              className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline transition-all">
              Create blank survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}