import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart3, ChevronLeft, StopCircle, X, Calendar } from "lucide-react";
import AllResponsesTable from "../components/AllResponsesTable";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";

interface Question {
  _id: string;
  type: string;
  label: string;
  options?: string[];
  max?: number;
}

// Confirmation modal shown before stopping a running survey
const StopConfirmModal = ({
  onConfirm,
  onCancel,
  stopping,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  stopping: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-black/25 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 max-w-xs w-full z-10">
      <button
        onClick={onCancel}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-all"
      >
        <X size={14} />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-red-50 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
          <StopCircle size={16} className="text-red-500 dark:text-red-400" />
        </div>
        <p className="font-black text-slate-900 dark:text-white text-base">Stop survey?</p>
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">
        No new responses after this.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={stopping}
          className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={stopping}
          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
        >
          {stopping ? "Stopping..." : "Stop"}
        </button>
      </div>
    </div>
  </div>
);

// Close Date Modal - for editing closing date of running surveys
const CloseDateModal = ({ 
  survey, 
  onClose, 
  onUpdate 
}: { 
  survey: any; 
  onClose: () => void; 
  onUpdate: () => void;
}) => {
  // Function to convert UTC date from server to local datetime-local format
  const formatDateForInput = (utcDateString: string | null) => {
    if (!utcDateString) return "";
    const date = new Date(utcDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get current datetime for min attribute (prevents past dates)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [closeDate, setCloseDate] = useState(
    formatDateForInput(survey.scheduledClose)
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const activeTenantId = localStorage.getItem("activeTenantId");
      
      let scheduledCloseISO = null;
      if (closeDate) {
        // Check if selected date is in the past
        const selectedDate = new Date(closeDate);
        if (selectedDate < new Date()) {
          toast.error("Close date cannot be in the past");
          setLoading(false);
          return;
        }
        scheduledCloseISO = selectedDate.toISOString();
      }
      
      const res = await fetch(`http://localhost:5000/api/surveys/${survey._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(activeTenantId && activeTenantId !== "__system__" ? { "x-tenant-id": activeTenantId } : {}),
        },
        body: JSON.stringify({
          scheduledClose: scheduledCloseISO,
        }),
      });
      if (res.ok) {
        toast.success(scheduledCloseISO ? "Closing date updated" : "Closing date removed");
        onUpdate();
        onClose();
      } else {
        toast.error("Failed to update closing date");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (utcDateString: string) => {
    if (!utcDateString) return null;
    const date = new Date(utcDateString);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set Closing Date</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Closing Date & Time
          </label>
          <input
            type="datetime-local"
            value={closeDate}
            min={getCurrentDateTime()}
            onChange={(e) => setCloseDate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <p className="text-xs text-slate-400 mt-1">Leave empty for no closing date</p>
        </div>
        
        {survey.scheduledClose && (
          <div className="mb-4 text-sm text-amber-600 dark:text-amber-400">
            Current close date: {formatDisplayDate(survey.scheduledClose)}
          </div>
        )}
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "individual" | "all">("summary");
  const [activeResponseIndex, setActiveResponseIndex] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showCloseDateModal, setShowCloseDateModal] = useState(false);
  const { activeTenant, isSystemContext } = useTenant();
  const effectiveRole = !isSystemContext && activeTenant ? activeTenant.role : null;
  const canModify = effectiveRole ? ["super_admin", "admin", "creator"].includes(effectiveRole) : true;

  const token = localStorage.getItem("token");
  const authHeaders = (): Record<string, string> => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(() => {
      const id = localStorage.getItem("activeTenantId");
      return id && id !== "__system__" ? { "x-tenant-id": id } : {};
    })(),
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [surveyRes, responsesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
            headers: authHeaders(),
            credentials: "include",
          }),
          fetch(`http://localhost:5000/api/surveys/${surveyId}/responses`),
        ]);
        const surveyData = await surveyRes.json();
        const responsesData = await responsesRes.json();
        setSurvey(surveyData);
        setResponses(responsesData);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    if (surveyId) fetchAll();
  }, [surveyId]);

  const handleStopSurvey = async () => {
    setStopping(true);
    try {
      const token = localStorage.getItem("token");
      const activeTenantId = localStorage.getItem("activeTenantId");
      await fetch(`http://localhost:5000/api/surveys/${surveyId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(activeTenantId && activeTenantId !== "__system__" ? { "x-tenant-id": activeTenantId } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status: "Finished" }),
      });
      setSurvey((prev: any) => ({ ...prev, status: "Finished" }));
      setShowStopModal(false);
      toast.success("Survey Stopped Successfully");
    } catch (err) {
      console.error("Failed to stop survey:", err);
    } finally {
      setStopping(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading results...</p>
        </div>
      </div>
    );

  if (!survey)
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Survey not found.</p>
      </div>
    );

  const primaryColor = survey.primaryColor || survey.themeColor || "#6366F1";
  const allQuestions: Question[] = survey.pages?.flatMap((p: any) => p.questions) || [];
  const totalResponses = responses.length;
  const isRunning = survey.status === "Running";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] py-12 px-6 transition-colors duration-300">
      {showStopModal && (
        <StopConfirmModal
          onConfirm={handleStopSurvey}
          onCancel={() => setShowStopModal(false)}
          stopping={stopping}
        />
      )}

      {showCloseDateModal && (
        <CloseDateModal
          survey={survey}
          onClose={() => setShowCloseDateModal(false)}
          onUpdate={() => {
            const fetchSurvey = async () => {
              const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
                headers: authHeaders(),
                credentials: "include",
              });
              const data = await res.json();
              setSurvey(data);
            };
            fetchSurvey();
          }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
          <div className="p-8">
            <div className="flex justify-between items-start">
              <button
                onClick={() => navigate("/created-surveys")}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <ChevronLeft size={14} /> Back to surveys
              </button>

              <div className="flex gap-2">
                {isRunning && canModify && (
                  <button
                    onClick={() => setShowCloseDateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  >
                    <Calendar size={14} />
                    {survey.scheduledClose ? "Change Close Date" : "Set Close Date"}
                  </button>
                )}

                {isRunning && canModify && (
                  <button
                    onClick={() => setShowStopModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    <StopCircle size={14} />
                    Stop Survey
                  </button>
                )}

                {!isRunning && (
                  <span className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800 rounded-xl text-xs font-bold">
                    ✓ Finished
                  </span>
                )}
              </div>
            </div>

            {isRunning && survey.scheduledClose && (
              <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Calendar size={12} />
                This survey will close on: {new Date(survey.scheduledClose).toLocaleString()}
              </div>
            )}

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-4">
              {survey.surveyTitle || "Untitled Survey"}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {totalResponses} response{totalResponses !== 1 ? "s" : ""} collected
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl w-fit">
                {(["summary", "individual", "all"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab === "summary" ? "📊 Summary" : tab === "individual" ? "👤 Individual" : "🗂 All"}
                  </button>
                ))}
              </div>

              {!isRunning && (
                <button
                  onClick={() => navigate(`/analytics?surveyId=${surveyId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2B8CED] hover:bg-[#1A76D2] shadow-sm"
                >
                  <BarChart3 size={14} />
                  View Analytics
                </button>
              )}
            </div>
          </div>
        </div>

        {totalResponses === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">No responses yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Share your survey link to start collecting answers.</p>
          </div>
        )}

        {activeTab === "summary" && totalResponses > 0 && allQuestions.map((q) => {
          const answers = responses.map((r) => r.responses?.[q._id]).filter(Boolean);
          return (
            <div key={q._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
              <p className="font-bold text-slate-800 dark:text-white text-base mb-1">{q.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{answers.length} response{answers.length !== 1 ? "s" : ""}</p>

              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const count = answers.filter((a) => a === opt).length;
                    const pct = answers.length ? Math.round((count / answers.length) * 100) : 0;
                    return (
                      <div key={opt}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{opt}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: primaryColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "checkboxes" && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const count = answers.filter((a) => {
                      if (Array.isArray(a)) return a.includes(opt);
                      if (typeof a === "string") return a.split(",").map((s) => s.trim()).includes(opt);
                      return false;
                    }).length;
                    const pct = answers.length ? Math.round((count / answers.length) * 100) : 0;
                    return (
                      <div key={opt}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{opt}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: primaryColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "rating" && (
                <div>
                  <p className="text-4xl font-black mb-1" style={{ color: primaryColor }}>
                    {(answers.reduce((s, a) => s + Number(a), 0) / answers.length).toFixed(1)}
                    <span className="text-base text-slate-400 dark:text-slate-500 font-normal ml-2"> / {q.max || 5} avg</span>
                  </p>
                  <div className="flex gap-2 mt-3">
                    {Array.from({ length: q.max || 5 }, (_, i) => {
                      const count = answers.filter((a) => Number(a) === i + 1).length;
                      const pct = answers.length ? Math.round((count / answers.length) * 100) : 0;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden h-16 flex flex-col-reverse">
                            <div className="w-full rounded-full transition-all duration-500" style={{ height: `${pct}%`, backgroundColor: primaryColor, opacity: 0.8 }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{i + 1}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(q.type === "short_text" || q.type === "long_text" || q.type === "number" || q.type === "date") && (
                <ul className="space-y-2">
                  {answers.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">No answers yet</p>
                  ) : (
                    answers.map((a, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">{a}</li>
                    ))
                  )}
                </ul>
              )}
            </div>
          );
        })}

        {activeTab === "all" && totalResponses > 0 && (
          <AllResponsesTable questions={allQuestions} responses={responses} primaryColor={primaryColor} />
        )}

        {activeTab === "individual" && totalResponses > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm px-6 py-4">
              <button
                disabled={activeResponseIndex === 0}
                onClick={() => setActiveResponseIndex((i) => i - 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Response {activeResponseIndex + 1} of {totalResponses}</span>
              <button
                disabled={activeResponseIndex === totalResponses - 1}
                onClick={() => setActiveResponseIndex((i) => i + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Submitted: {(() => {
                const raw = responses[activeResponseIndex]?.submittedAt ?? responses[activeResponseIndex]?.createdAt;
                const d = raw ? new Date(raw) : null;
                return d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : "N/A";
              })()}
            </p>

            {allQuestions.map((q) => {
              const answer = responses[activeResponseIndex].responses?.[q._id];
              return (
                <div key={q._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">{q.label}</p>
                  {answer !== undefined && answer !== null && answer !== "" ? (
                    <p className="text-slate-800 dark:text-slate-200 text-base bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                      {Array.isArray(answer) ? answer.join(", ") : String(answer)}
                    </p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">No answer</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}