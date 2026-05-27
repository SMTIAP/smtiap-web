import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, X, Loader2,
  Monitor, Tablet, Smartphone, FileText, CopyPlus,
} from "lucide-react";
import { templateApi, type Template } from "../api/templateApi";
import { getIcon } from "../utils/iconMap";

type DeviceType = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceType, string> = {
  desktop: "w-full max-w-2xl",
  tablet: "w-[600px]",
  mobile: "w-[375px] max-h-[600px]",
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

const QuestionPreview = ({ question, index, primaryColor, deviceType }: { question: any; index: number; primaryColor: string; deviceType: DeviceType }) => {
  const isMobile = deviceType === "mobile";
  
  const getPreviewInput = () => {
    switch (question.type) {
      case "short_text":
        return (
          <div className={`w-full border-b-2 border-gray-200 dark:border-slate-600 pb-2 text-slate-300 dark:text-slate-500 ${isMobile ? 'text-sm' : 'text-sm'} italic`}>
            {question.placeholder || "Short answer text..."}
          </div>
        );
      
      case "long_text":
        return (
          <div className={`w-full border-2 border-gray-200 dark:border-slate-600 rounded-xl p-3 text-slate-300 dark:text-slate-500 ${isMobile ? 'text-sm' : 'text-sm'} italic min-h-20`}>
            {question.placeholder || "Long answer text..."}
          </div>
        );
      
      case "multiple_choice":
        return (
          <div className="space-y-2">
            {question.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0" />
                <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-slate-600 dark:text-slate-300`}>{opt}</span>
              </div>
            ))}
          </div>
        );
      
      case "checkboxes":
        return (
          <div className="space-y-2">
            {question.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-500 rounded shrink-0" />
                <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-slate-600 dark:text-slate-300`}>{opt}</span>
              </div>
            ))}
          </div>
        );
      
      case "rating":
        return (
          <div className={`flex flex-wrap gap-1.5 ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
            {[...Array(question.max ?? 5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className={`${isMobile ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs'} rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold`}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        );
      
      case "number":
        return (
          <div className={`w-24 border-b-2 border-gray-200 dark:border-slate-600 pb-2 text-slate-300 dark:text-slate-500 ${isMobile ? 'text-sm' : 'text-sm'} italic`}>
            {question.min !== undefined && question.max !== undefined 
              ? `${question.min} - ${question.max}`
              : "Number..."}
          </div>
        );
      
      case "date":
        return (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Calendar size={isMobile ? 14 : 16} />
            <span className={`${isMobile ? 'text-sm' : 'text-sm'} italic`}>Select a date</span>
          </div>
        );
      
      default:
        return (
          <div className={`w-full border-b-2 border-gray-200 dark:border-slate-600 pb-2 text-slate-300 dark:text-slate-500 ${isMobile ? 'text-sm' : 'text-sm'} italic`}>
            Answer here...
          </div>
        );
    }
  };

  return (
    <div className={`mb-6 ${isMobile ? 'mb-5' : 'mb-8'}`}>
      <div className={`flex gap-2 mb-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <span style={{ color: primaryColor }} className={`font-bold ${isMobile ? 'text-sm' : 'text-sm'}`}>{index + 1}.</span>
        <h3 className={`font-semibold text-gray-800 dark:text-white ${isMobile ? 'text-sm' : 'text-sm'} leading-tight`}>{question.label}</h3>
      </div>
      <div className={`pl-4 ${isMobile ? 'pl-4' : 'pl-5'}`}>
        {getPreviewInput()}
      </div>
    </div>
  );
};

export default function TemplatePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const templateId = location.state?.templateId;
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setError("Template not found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await templateApi.getTemplateById(templateId);
        setTemplate(data);
      } catch (err) {
        console.error("Failed to fetch template:", err);
        setError("Template not found");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-[#0F172A]">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-[#0F172A]">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">{error || "Template not found."}</p>
          <button onClick={() => navigate("/templates")} className="text-indigo-600 font-bold">← Back to templates</button>
        </div>
      </div>
    );
  }

  const Icon = getIcon(template.icon);
  const primaryColor = "#6366F1";
  const isMobile = device === "mobile";

  const handleUseTemplate = async () => {
    setIsCreating(true);
    try {
      const surveyPages = [{
        id: `page-${Date.now()}`,
        title: "Page 1",
        questions: template.previewQuestions.map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          type: q.type,
          label: q.label,
          required: true,
          placeholder: q.placeholder,
          options: q.options,
          max: q.max,
          min: q.min,
          branching: undefined,
        }))
      }];

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
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-6 px-3 relative">
          <div className={`transition-all duration-300 ${deviceWidths[device]} ${isMobile ? 'overflow-y-auto' : ''}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-full">
              {/* Colored header - fixed */}
              <div className={`bg-gradient-to-br ${template.gradient} ${isMobile ? 'p-5' : 'p-8'} flex items-center gap-3 shrink-0`}>
                <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} bg-white/20 rounded-2xl flex items-center justify-center shrink-0`}>
                  <Icon size={isMobile ? 20 : 28} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-white font-black ${isMobile ? 'text-base' : 'text-xl'} leading-tight break-words`}>{template.title}</h2>
                  <p className={`text-white/70 ${isMobile ? 'text-[10px]' : 'text-sm'} mt-0.5`}>{template.category}</p>
                </div>
              </div>

              {/* Questions - scrollable area */}
              <div className={`${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
                <div className={`${isMobile ? 'p-5' : 'p-8'}`}>
                  <p className={`text-slate-400 dark:text-slate-500 ${isMobile ? 'text-xs mb-4' : 'text-sm mb-6'}`}>{template.description}</p>

                  {/* All questions in one scrollable list */}
                  <div className="space-y-6">
                    {template.previewQuestions.map((q: any, idx: number) => (
                      <QuestionPreview
                        key={idx}
                        question={q}
                        index={idx}
                        primaryColor={primaryColor}
                        deviceType={device}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device switcher */}
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
              <span>{template.previewQuestions.length} questions · 1 page</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
              You can edit, add, or remove questions after creating.
            </p>
          </div>

          {/* Use template button */}
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