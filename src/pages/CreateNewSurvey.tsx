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
    backgroundColor: "#FFFFFF",
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
  const bgColorPresets = ["#FFFFFF", "#94A3B8", "#93C5FD", "#86EFAC", "#FCA5A5", "#D8B4FE", "#FCD34D"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">

      {/* Top gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Subtle dot grid background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgb(99 102 241) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative max-w-[800px] mx-auto py-10 px-6 flex flex-col gap-8 w-full">

        {/* Back button — unchanged */}
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

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-30" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl flex items-center justify-center mx-auto">
              <PenLine size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-[#1E293B] dark:text-white text-3xl font-bold">Create New Survey</h1>
          <p className="text-[#64748B] dark:text-slate-400 text-sm">Create from scratch or use AI to generate one instantly.</p>
        </div>

        {/* Mode switcher */}
        <div className="flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 w-fit mx-auto border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setCreationMode("manual")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              creationMode === "manual"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white"
            }`}
          >
            <PenLine size={16} /> Manual
          </button>
          <button
            onClick={() => setCreationMode("ai")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              creationMode === "ai"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white"
            }`}
          >
            <Sparkles size={16} /> AI Assisted
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">

          {/* Card top accent */}
          <div className={`h-1 w-full ${creationMode === "ai" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`} />

          <div className="p-10 flex flex-col gap-10">
            {creationMode === "manual" ? (
              <>
                {/* Section 1: Branding */}
                <section className="flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div>
                      <h2 className="text-[#1E293B] dark:text-white text-sm font-bold uppercase tracking-wider">Customize Survey Theme</h2>
                      <p className="text-slate-400 text-xs mt-0.5">Logo, colors and branding</p>
                    </div>
                    <div
                      onClick={() => toggleField("customizeBranding")}
                      className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${formData.customizeBranding ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-600"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.customizeBranding ? "left-6" : "left-1"}`} />
                    </div>
                  </div>

                  {formData.customizeBranding && (
                    <div className="flex flex-col gap-6">

                      {/* Logo upload */}
                      <label className="flex items-center gap-4 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-5 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all group">
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                          <svg width="16" height="16" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" />
                          </svg>
                        </div>
                        {formData.logo && formData.logo.startsWith("data:") ? (
                          <img src={formData.logo} alt="Logo preview" className="max-h-16 object-contain rounded" />
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-white">Upload Company Logo</p>
                            <p className="text-xs text-slate-400 mt-0.5">PNG or JPG, up to 2MB</p>
                          </div>
                        )}
                      </label>

                      {/* Cover image */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase tracking-wider">Cover Image</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-6 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all aspect-video w-full max-w-md mx-auto overflow-hidden">
                          <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} />
                          {formData.coverImage ? (
                            <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15l5-5 4 4 3-3 4 4" strokeLinecap="round" />
                              </svg>
                              <p className="text-sm font-semibold">Add Cover Image</p>
                            </div>
                          )}
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

                      <div className="grid grid-cols-1 gap-5 text-left">
                        {/* Website URL */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase tracking-wider">Website URL</label>
                          <input
                            name="websiteUrl" type="text" value={formData.websiteUrl} onChange={handleChange}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                          />
                        </div>

                        {/* Theme Color */}
                        <div className="flex flex-col gap-3">
                          <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase tracking-wider">Theme Color</label>
                          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <input
                              type="color" name="themeColor" value={formData.themeColor} onChange={handleChange}
                              className="w-9 h-9 rounded-xl cursor-pointer border-2 border-slate-200 p-0.5 flex-shrink-0"
                            />
                            <div className="flex gap-2 flex-wrap">
                              {colorPresets.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setFormData((p) => ({ ...p, themeColor: color }))}
                                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${formData.themeColor === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 font-mono ml-auto">{formData.themeColor}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Controls header bar, buttons, and accent elements on the live survey</p>
                        </div>

                        {/* Background Color */}
                        <div className="flex flex-col gap-3">
                          <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase tracking-wider">Background Color</label>
                          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <input
                              type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange}
                              className="w-9 h-9 rounded-xl cursor-pointer border-2 border-slate-200 p-0.5 flex-shrink-0"
                            />
                            <div className="flex gap-2 flex-wrap">
                              {bgColorPresets.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setFormData((p) => ({ ...p, backgroundColor: color }))}
                                  className={`w-7 h-7 rounded-full border border-slate-200 transition-all hover:scale-110 ${formData.backgroundColor === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 font-mono ml-auto">{formData.backgroundColor}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Controls the survey page background on the live survey</p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Section 2: Survey Details */}
                <section className="flex flex-col gap-5 text-left">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h2 className="text-[#1E293B] dark:text-white text-sm font-bold uppercase tracking-wider">Survey Details</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Title and description for your survey</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase tracking-wider">
                        Survey Title <span className="text-rose-400 normal-case font-normal"> </span>
                      </label>
                      <input
                        name="surveyTitle" type="text" value={formData.surveyTitle} onChange={handleChange}
                        placeholder="e.g. Customer Satisfaction Survey"
                        className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-300"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[#1E293B] dark:text-white text-xs font-bold uppercase tracking-wider">
                        Description <span className="text-slate-300 normal-case font-normal text-[10px]">— optional</span>
                      </label>
                      <textarea
                        name="description" value={formData.description} onChange={handleChange}
                        placeholder="Give respondents some context about this survey..."
                        className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all min-h-[100px] resize-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </section>

                {/* Footer with button */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-medium">
                    {formData.surveyTitle
                      ? <span className="text-emerald-500 font-bold">✓ Ready to add questions</span>
                      : "Enter a title to get started"}
                  </p>
                  <button
                    onClick={() => {
                      const finalData = { ...formData, surveyTitle: formData.surveyTitle.trim() || "Untitled Survey" };
                      navigate("/add-questions", { state: { formData: finalData } });
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 hover:-translate-y-0.5"
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
    </div>
  );
}