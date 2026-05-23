import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, CheckCircle2, FileText, Layout } from "lucide-react";

export default function ReviewAndPublish() {
  const navigate = useNavigate();
  const location = useLocation();

  const surveyTitle = location.state?.surveyTitle || "Untitled Survey";
  const description = location.state?.description || "";
  const pages = location.state?.pages || [];
  const primaryColor = location.state?.primaryColor || "#6366F1";
  const surveyId = location.state?.surveyId;
  const logo = location.state?.logo || null;
  const websiteUrl = location.state?.websiteUrl || "";
  const customizeBranding = location.state?.customizeBranding || false;

  const handleFinalize = async (status: "Running" | "Draft") => {
    try {
      const payload = {
        surveyTitle,
        description,
        logo,
        websiteUrl,
        customizeBranding,
        primaryColor,
        themeColor: primaryColor,
        pages,
        status,
        tenantId: "default",
      };
      const token = localStorage.getItem("token");
      const url = surveyId
        ? `http://localhost:5000/api/surveys/${surveyId}`
        : "http://localhost:5000/api/surveys";
      const method = surveyId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.message}`);
        return;
      }
      const data = await res.json();
      const savedSurvey = data.survey;
      if (status === "Running") {
        navigate("/share-survey", {
          state: {
            surveyId: savedSurvey._id,
            surveyTitle: savedSurvey.surveyTitle,
          },
        });
      } else {
        navigate("/created-surveys", {
          state: {
            newSurvey: {
              id: savedSurvey._id,
              date: new Date().toLocaleDateString("en-GB"),
              title: savedSurvey.surveyTitle,
              status: savedSurvey.status,
              pageCount: savedSurvey.pages.length,
              questionCount: savedSurvey.pages.reduce(
                (acc: number, p: any) => acc + p.questions.length,
                0,
              ),
            },
          },
        });
      }
    } catch (err) {
      console.error("Failed to save survey:", err);
      alert("Something went wrong. Is the backend running on port 5000?");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] font-sans transition-colors duration-300">
      <div className="flex max-w-200 py-12 px-6 flex-col gap-6 w-full text-left">
        <div className="flex justify-between items-center w-full mb-2">
          <button
            onClick={() => {
              if (surveyId) {
                navigate("/add-questions", {
                  state: {
                    surveyId,
                    formData: {
                      surveyTitle,
                      description,
                      logo,
                      websiteUrl,
                      customizeBranding,
                      themeColor: primaryColor,
                    },
                  },
                });
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-medium hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={18} /> Back to editor
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div
            style={{ backgroundColor: primaryColor }}
            className="h-2 w-full"
          />

          <div className="p-10">
            <div className="flex items-start justify-between mb-10">
              <div>
                <h1 className="text-gray-900 dark:text-white text-3xl font-extrabold mb-2">
                  Review & Publish
                </h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Final check of the survey structure and content.
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                }}
              >
                <CheckCircle2 size={28} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                  Title
                </p>
                <p className="text-gray-900 dark:text-white font-bold">
                  {surveyTitle}
                </p>
              </div>
              {description && (
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                    Description
                  </p>
                  <p className="text-gray-700 dark:text-slate-300 text-sm">
                    {description}
                  </p>
                </div>
              )}
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                  Structure
                </p>
                <p className="text-gray-900 dark:text-white font-bold">
                  {pages.length} {pages.length === 1 ? "Page" : "Pages"} •{" "}
                  {pages.reduce(
                    (acc: number, p: any) => acc + p.questions.length,
                    0,
                  )}{" "}
                  Questions
                </p>
              </div>
              {logo && (
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                    Logo
                  </p>
                  <img
                    src={logo}
                    alt="Survey logo"
                    className="max-h-16 object-contain rounded"
                  />
                </div>
              )}
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                  Theme color
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-gray-900 dark:text-white font-bold font-mono text-sm">
                    {primaryColor}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                  Status after action
                </p>
                <div className="flex gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 border border-orange-100 dark:border-orange-800 font-bold">
                    Draft
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 font-bold">
                    Running
                  </span>
                </div>
              </div>
            </div>

            {pages.length > 0 ? (
              <div className="space-y-8 mb-12">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layout size={16} style={{ color: primaryColor }} /> Content
                  Summary
                </h3>
                {pages.map((page: any, pIdx: number) => (
                  <div
                    key={page.id || pIdx}
                    className="border-l-2 border-gray-100 dark:border-slate-700 pl-6 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold py-0.5 px-2 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded">
                        PAGE {pIdx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {page.title}
                      </span>
                    </div>
                    {page.questions.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        No questions on this page
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {page.questions.map((q: any, qIdx: number) => (
                          <div
                            key={q.id || qIdx}
                            className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm hover:border-gray-200 dark:hover:border-slate-600 transition-colors"
                          >
                            <span className="text-xs font-bold text-gray-400 mt-0.5">
                              {qIdx + 1}.
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                                {q.label}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                                  <FileText size={10} />{" "}
                                  {q.type.replace("_", " ")}
                                </span>
                                {q.required && (
                                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">
                                    Required
                                  </span>
                                )}
                              </div>
                              {q.options && q.options.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {q.options
                                    .slice(0, 3)
                                    .map((opt: string, i: number) => (
                                      <span
                                        key={i}
                                        className="text-[10px] px-2 py-0.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded text-gray-500 dark:text-slate-400"
                                      >
                                        {opt}
                                      </span>
                                    ))}
                                  {q.options.length > 3 && (
                                    <span className="text-[10px] text-gray-400">
                                      +{q.options.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-12 p-8 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-2xl text-center">
                <p className="text-gray-400 text-sm">
                  No pages or questions added yet.
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-3 text-sm font-medium"
                  style={{ color: primaryColor }}
                >
                  ← Go back and add questions
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => handleFinalize("Draft")}
                className="px-8 py-3 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-all"
              >
                Save as draft
              </button>
              <button
                onClick={() => handleFinalize("Running")}
                style={{ backgroundColor: primaryColor }}
                className="px-10 py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg transition-all"
              >
                Publish Survey
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
