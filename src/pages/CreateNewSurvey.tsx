import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, PenLine } from "lucide-react";
import AiSurveyGenerator from "../components/AiSurveyGenerator";

type CreationMode = "manual" | "ai";

export default function CreateNewSurvey() {
  const navigate = useNavigate();
  const [creationMode, setCreationMode] = useState<CreationMode>("manual");

  interface SurveyFormData {
    customizeBranding: boolean;
    logo: string | null;
    coverImage: string | null;
    websiteUrl: string;
    themeColor: string;
    backgroundColor: string;
    surveyTitle: string;
    description: string;
    isAnonymous: boolean;
  }

  const [formData, setFormData] = useState<SurveyFormData>({
    customizeBranding: false,
    logo: null,
    coverImage: null,
    websiteUrl: "",
    themeColor: "#6366F1",
    backgroundColor: "#FFFFFF", // Changed from #94A3B8 to #FFFFFF
    surveyTitle: "",
    description: "",
    isAnonymous: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleField = (field: keyof SurveyFormData) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerated = (result: {
    surveyTitle: string;
    description: string;
    pages: Record<string, unknown>[];
  }) => {
    navigate("/add-questions", {
      state: {
        formData: {
          ...formData,
          surveyTitle: result.surveyTitle || "AI-Generated Survey",
          description: result.description || "",
        },
        aiGeneratedPages: result.pages,
      },
    });
  };

  const colorPresets = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];
  const bgColorPresets = ["#FFFFFF", "#94A3B8", "#93C5FD", "#86EFAC", "#FCA5A5", "#D8B4FE", "#FCD34D"]; // White moved to first position

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="flex max-w-200 py-10 px-6 flex-col gap-8 w-full">

        <div className="flex justify-end w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#64748B] dark:text-slate-400 text-sm font-medium hover:text-[#1E293B] dark:hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <h1 className="text-[#1E293B] dark:text-white text-3xl font-bold">Create New Survey</h1>
          <p className="text-[#64748B] dark:text-slate-400 text-sm">Create from scratch or use AI to generate one instantly.</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit mx-auto border border-[#E2E8F0] dark:border-slate-700">
          <button
            onClick={() => setCreationMode("manual")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              creationMode === "manual"
                ? "bg-white dark:bg-slate-700 text-[#1E293B] dark:text-white shadow-sm"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white"
            }`}
          >
            <PenLine size={16} /> Manual
          </button>
          <button
            onClick={() => setCreationMode("ai")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              creationMode === "ai"
                ? "bg-white dark:bg-slate-700 text-[#1E293B] dark:text-white shadow-sm"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white"
            }`}
          >
            <Sparkles size={16} /> AI Assisted
          </button>
        </div>

        <div className="flex flex-col gap-10 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-slate-700 transition-colors duration-300">
          {creationMode === "manual" ? (
            <>
              <section className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#F1F5F9] dark:border-slate-700 pb-4">
                  <h2 className="text-[#1E293B] dark:text-white text-sm font-bold uppercase tracking-wider">
                    Customize Survey Theme
                  </h2>
                  <div
                    onClick={() => toggleField("customizeBranding")}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200 ${formData.customizeBranding ? "bg-blue-600" : "bg-[#E2E8F0] dark:bg-slate-600"}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${formData.customizeBranding ? "left-6" : "left-1"}`} />
                  </div>
                </div>

                {formData.customizeBranding && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] dark:border-slate-600 rounded-lg p-6 bg-[#F8FAFC] dark:bg-slate-900 gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      {formData.logo && formData.logo.startsWith("data:") ? (
                        <img src={formData.logo} alt="Logo preview" className="max-h-24 max-w-full object-contain rounded" />
                      ) : (
                        <p className="text-[#1E293B] dark:text-white font-bold text-sm">Add Company Logo</p>
                      )}
                      <span className="mt-1 px-6 py-2 bg-[#E2E8F0] dark:bg-slate-700 text-[#1E293B] dark:text-white text-xs font-bold rounded-md">
                        {formData.logo ? "Change" : "Upload"}
                      </span>
                    </label>

                    {/* Cover Image Upload */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase text-left">Cover Image</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] dark:border-slate-600 rounded-lg p-6 bg-[#F8FAFC] dark:bg-slate-900 gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors aspect-video w-full max-w-md mx-auto overflow-hidden">
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} />
                        {formData.coverImage ? (
                          <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover rounded" />
                        ) : (
                          <p className="text-[#1E293B] dark:text-white font-bold text-sm">Add Cover Image</p>
                        )}
                        <span className="mt-1 px-6 py-2 bg-[#E2E8F0] dark:bg-slate-700 text-[#1E293B] dark:text-white text-xs font-bold rounded-md">
                          {formData.coverImage ? "Change" : "Upload"}
                        </span>
                      </label>
                      {formData.coverImage && (
                        <button
                          onClick={(e) => { e.preventDefault(); setFormData((prev) => ({ ...prev, coverImage: null })); }}
                          className="text-xs text-red-500 hover:underline font-bold mt-1 self-center"
                        >
                          Remove Cover Image
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 text-left">
                      <div className="flex flex-col gap-2">
                        <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase">Website URL</label>
                        <input
                          name="websiteUrl" type="text" value={formData.websiteUrl} onChange={handleChange}
                          placeholder="https://example.com"
                          className="w-full p-3 border border-[#E2E8F0] dark:border-slate-600 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase">Theme Color</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color" name="themeColor" value={formData.themeColor} onChange={handleChange}
                            className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                          />
                          <div className="flex gap-2">
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                onClick={() => setFormData((p) => ({ ...p, themeColor: color }))}
                                className={`w-6 h-6 rounded-full border-2 ${formData.themeColor === color ? "border-slate-400" : "border-transparent"}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">Controls header bar, buttons, and accent elements on the live survey</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase">Background Color</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange}
                            className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                          />
                          <div className="flex gap-2">
                            {bgColorPresets.map((color) => (
                              <button
                                key={color}
                                onClick={() => setFormData((p) => ({ ...p, backgroundColor: color }))}
                                className={`w-6 h-6 rounded-full border-2 ${formData.backgroundColor === color ? "border-slate-400" : "border-transparent"}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">Controls the survey page background on the live survey</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="flex flex-col gap-6 text-left">
                <h2 className="text-[#1E293B] dark:text-white text-sm font-bold uppercase tracking-wider border-b border-[#F1F5F9] dark:border-slate-700 pb-4">
                  Survey Details
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase">Survey Title</label>
                    <input
                      name="surveyTitle" type="text" value={formData.surveyTitle} onChange={handleChange}
                      placeholder="Enter survey title"
                      className="w-full p-3 border border-[#E2E8F0] dark:border-slate-600 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase">Description</label>
                    <textarea
                      name="description" value={formData.description} onChange={handleChange}
                      placeholder="What is this survey about?"
                      className="w-full p-3 border border-[#E2E8F0] dark:border-slate-600 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-blue-400 min-h-25 transition-colors"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    const finalData = { ...formData, surveyTitle: formData.surveyTitle.trim() || "Untitled Survey" };
                    navigate("/add-questions", { state: { formData: finalData } });
                  }}
                  className="flex items-center gap-2 bg-[#6366F1] text-white px-8 py-3 rounded-lg font-bold text-sm hover:opacity-90 shadow-md transition-all active:scale-95"
                >
                  Next: Add Questions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <AiSurveyGenerator onGenerated={handleAiGenerated} onCancel={() => setCreationMode("manual")} />
          )}
        </div>
      </div>
    </div>
  );
}