import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart3, ChevronLeft, StopCircle, X } from "lucide-react";
import AllResponsesTable from "../components/AllResponsesTable";
import { useTenant } from "../contexts/TenantContext";

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
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-xs w-full z-10">
      <button
        onClick={onCancel}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-all"
      >
        <X size={14} />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
          <StopCircle size={16} className="text-red-500" />
        </div>
        <p className="font-black text-slate-900 text-base">Stop survey?</p>
      </div>
      <p className="text-slate-400 text-xs mb-6">
        No new responses after this.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={stopping}
          className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
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

export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [survey, setSurvey] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "individual" | "all">(
    "summary",
  );
  const [activeResponseIndex, setActiveResponseIndex] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const { activeTenant, isSystemContext } = useTenant();
  const effectiveRole =
    !isSystemContext && activeTenant ? activeTenant.role : null;
  const canModify = effectiveRole
    ? ["super_admin", "admin", "creator"].includes(effectiveRole)
    : true;

  const token = localStorage.getItem("token");
  const authHeaders = (): Record<string, string> => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(() => {
      const id = localStorage.getItem("activeTenantId");
      return id && id !== "__system__"
        ? { "x-tenant-id": id }
        : ({} as Record<string, string>);
    })(),
  });

  // Fetches survey structure and all submitted responses in parallel
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  // Changes survey status to Finished, preventing new response submissions
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
          ...(activeTenantId && activeTenantId !== "__system__"
            ? { "x-tenant-id": activeTenantId }
            : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status: "Finished" }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSurvey((prev: any) => ({ ...prev, status: "Finished" }));
      setShowStopModal(false);
    } catch (err) {
      console.error("Failed to stop survey:", err);
    } finally {
      setStopping(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading results...</p>
        </div>
      </div>
    );

  if (!survey)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-slate-500">Survey not found.</p>
      </div>
    );

  const primaryColor = survey.primaryColor || survey.themeColor || "#6366F1";
  const allQuestions: Question[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    survey.pages?.flatMap((p: any) => p.questions) || [];
  const totalResponses = responses.length;
  const isRunning = survey.status === "Running";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      {showStopModal && (
        <StopConfirmModal
          onConfirm={handleStopSurvey}
          onCancel={() => setShowStopModal(false)}
          stopping={stopping}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="h-2 w-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="p-8">
            <div className="flex justify-between items-start">
              <button
                onClick={() => navigate("/created-surveys")}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-4 transition-all"
              >
                <ChevronLeft size={14} /> Back to surveys
              </button>

              {/* Stop button only visible when survey is running and user can modify */}
              {isRunning && canModify && (
                <button
                  onClick={() => setShowStopModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                >
                  <StopCircle size={14} />
                  Stop Survey
                </button>
              )}

              {!isRunning && (
                <span className="px-4 py-2 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-xs font-bold">
                  ✓ Finished
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              {survey.surveyTitle || "Untitled Survey"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {totalResponses} response{totalResponses !== 1 ? "s" : ""}{" "}
              collected
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              {/* Tab switcher between Summary, Individual and All responses views */}
              <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                {(["summary", "individual", "all"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab === "summary"
                      ? "📊 Summary"
                      : tab === "individual"
                        ? "👤 Individual"
                        : "🗂 All"}
                  </button>
                ))}
              </div>

              {!isRunning && (
                <button
                  onClick={() => navigate(`/analytics?surveyId=${surveyId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2B8CED] hover:bg-[#1A76D2] shadow-sm transition-all"
                >
                  <BarChart3 size={14} />
                  View Analytics
                </button>
              )}
            </div>
          </div>
        </div>

        {totalResponses === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-slate-700 font-bold text-lg">No responses yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Share your survey link to start collecting answers.
            </p>
          </div>
        )}

        {/* Summary tab — shows aggregated charts and counts per question */}
        {activeTab === "summary" &&
          totalResponses > 0 &&
          allQuestions.map((q) => {
            const answers = responses
              .map((r) => r.responses?.[q._id])
              .filter(Boolean);
            return (
              <div
                key={q._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <p className="font-bold text-slate-800 text-base mb-1">
                  {q.label}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  {answers.length} response{answers.length !== 1 ? "s" : ""}
                </p>

                {q.type === "multiple_choice" && q.options && (
                  <div className="space-y-3">
                    {q.options.map((opt) => {
                      const count = answers.filter((a) => a === opt).length;
                      const pct = answers.length
                        ? Math.round((count / answers.length) * 100)
                        : 0;
                      return (
                        <div key={opt}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 font-medium">
                              {opt}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: primaryColor,
                              }}
                            />
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
                        if (typeof a === "string")
                          return a
                            .split(",")
                            .map((s) => s.trim())
                            .includes(opt);
                        return false;
                      }).length;
                      const pct = answers.length
                        ? Math.round((count / answers.length) * 100)
                        : 0;
                      return (
                        <div key={opt}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 font-medium">
                              {opt}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: primaryColor,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "rating" && (
                  <div>
                    <p
                      className="text-4xl font-black mb-1"
                      style={{ color: primaryColor }}
                    >
                      {(
                        answers.reduce((s, a) => s + Number(a), 0) /
                        answers.length
                      ).toFixed(1)}
                      <span className="text-base text-slate-400 font-normal ml-2">
                        / {q.max || 5} avg
                      </span>
                    </p>
                    <div className="flex gap-2 mt-3">
                      {Array.from({ length: q.max || 5 }, (_, i) => {
                        const count = answers.filter(
                          (a) => Number(a) === i + 1,
                        ).length;
                        const pct = answers.length
                          ? Math.round((count / answers.length) * 100)
                          : 0;
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1 flex-1"
                          >
                            <div className="w-full bg-slate-100 rounded-full overflow-hidden h-16 flex flex-col-reverse">
                              <div
                                className="w-full rounded-full transition-all duration-500"
                                style={{
                                  height: `${pct}%`,
                                  backgroundColor: primaryColor,
                                  opacity: 0.8,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-bold">
                              {i + 1}
                            </span>
                            <span className="text-xs text-slate-400">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(q.type === "short_text" ||
                  q.type === "long_text" ||
                  q.type === "number" ||
                  q.type === "date") && (
                  <ul className="space-y-2">
                    {answers.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">
                        No answers yet
                      </p>
                    ) : (
                      answers.map((a, i) => (
                        <li
                          key={i}
                          className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                        >
                          {a}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            );
          })}

        {/* All tab — renders full response table component */}
        {activeTab === "all" && totalResponses > 0 && (
          <AllResponsesTable
            questions={allQuestions}
            responses={responses}
            primaryColor={primaryColor}
          />
        )}

        {/* Individual tab — browse responses one by one with prev/next navigation */}
        {activeTab === "individual" && totalResponses > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
              <button
                disabled={activeResponseIndex === 0}
                onClick={() => setActiveResponseIndex((i) => i - 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <span className="text-sm font-bold text-slate-500">
                Response {activeResponseIndex + 1} of {totalResponses}
              </span>
              <button
                disabled={activeResponseIndex === totalResponses - 1}
                onClick={() => setActiveResponseIndex((i) => i + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Submitted:{" "}
              {(() => {
                const raw =
                  responses[activeResponseIndex]?.submittedAt ??
                  responses[activeResponseIndex]?.createdAt;
                const d = raw ? new Date(raw) : null;
                return d && !Number.isNaN(d.getTime())
                  ? d.toLocaleString()
                  : "N/A";
              })()}
            </p>

            {allQuestions.map((q) => {
              const answer = responses[activeResponseIndex].responses?.[q._id];
              return (
                <div
                  key={q._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <p className="font-bold text-slate-700 text-sm mb-2">
                    {q.label}
                  </p>
                  {answer !== undefined && answer !== null && answer !== "" ? (
                    <p className="text-slate-800 text-base bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      {Array.isArray(answer)
                        ? answer.join(", ")
                        : String(answer)}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm italic">No answer</p>
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
