import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  StopCircle,
  X,
  Calendar,
  Globe,
} from "lucide-react";
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

// Schedule Modal for setting a closing date on running surveys.
interface ScheduleModalProps {
  scheduledClose: string | null;
  onSave: (close: string | null) => void;
  onClose: () => void;
}

// Convert 12-hour time to 24-hour format for ISO date construction.
const convertTo24Hour = (time: string, ampm: string): string => {
  let [hours, minutes] = time.split(":");
  let hour = parseInt(hours);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
};

function ScheduleModal({
  scheduledClose,
  onSave,
  onClose,
}: ScheduleModalProps) {
  const [enableClose, setEnableClose] = useState(!!scheduledClose);
  const [closeDate, setCloseDate] = useState(
    scheduledClose ? new Date(scheduledClose).toISOString().split("T")[0] : "",
  );
  const [closeHour, setCloseHour] = useState(() => {
    if (scheduledClose) {
      let hour = parseInt(new Date(scheduledClose).toTimeString().slice(0, 2));
      if (hour === 0) hour = 12;
      if (hour > 12) hour -= 12;
      return hour.toString().padStart(2, "0");
    }
    return "05";
  });
  const [closeMinute, setCloseMinute] = useState(() =>
    scheduledClose ? new Date(scheduledClose).toTimeString().slice(3, 5) : "00",
  );
  const [closeAmPm, setCloseAmPm] = useState(() => {
    if (scheduledClose) {
      const hour = parseInt(
        new Date(scheduledClose).toTimeString().slice(0, 2),
      );
      return hour >= 12 ? "PM" : "AM";
    }
    return "PM";
  });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    let closeDateTime: string | null = null;
    const now = new Date();

    if (enableClose && closeDate) {
      const time24 = convertTo24Hour(`${closeHour}:${closeMinute}`, closeAmPm);
      const localDate = new Date(`${closeDate}T${time24}:00`);
      if (localDate < now) {
        toast.error("Please select a future time for closing");
        return;
      }
      closeDateTime = localDate.toISOString();
    }

    onSave(closeDateTime);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Set Closing Date
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            <X size={18} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Timezone Info */}
        <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center gap-2">
          <Globe size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Time zone:{" "}
            <span className="font-mono font-semibold">{timezone}</span>
          </span>
        </div>

        {/* Close Date */}
        <div className="pb-2">
          <label className="flex items-center justify-between cursor-pointer mb-3">
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Set cut-off date
              </span>
              <p className="text-xs text-slate-400">Close the survey on</p>
            </div>
            <div
              onClick={() => setEnableClose((v) => !v)}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableClose ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableClose ? "translate-x-5" : ""}`}
              />
            </div>
          </label>

          {enableClose && (
            <div className="space-y-2 ml-2">
              <input
                type="date"
                value={closeDate}
                min={today}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  value={closeHour}
                  min="1"
                  max="12"
                  onChange={(e) => {
                    let v = parseInt(e.target.value);
                    if (isNaN(v)) v = 1;
                    v = Math.min(12, Math.max(1, v));
                    setCloseHour(v.toString().padStart(2, "0"));
                  }}
                  className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <span className="text-lg font-medium text-slate-600 dark:text-slate-400">
                  :
                </span>
                <input
                  type="number"
                  value={closeMinute}
                  min="0"
                  max="59"
                  onChange={(e) => {
                    let v = parseInt(e.target.value);
                    if (isNaN(v)) v = 0;
                    v = Math.min(59, Math.max(0, v));
                    setCloseMinute(v.toString().padStart(2, "0"));
                  }}
                  className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <select
                  value={closeAmPm}
                  onChange={(e) => setCloseAmPm(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirmation modal shown before stopping a running survey
// Confirmation modal shown before stopping a running survey.
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
        <p className="font-black text-slate-900 dark:text-white text-base">
          Stop survey?
        </p>
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

// Survey results page with summary, individual response, and all-responses tabs.
// Supports stopping a running survey and setting a closing date.
export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "individual" | "all">(
    "summary",
  );
  const [activeResponseIndex, setActiveResponseIndex] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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
      return id && id !== "__system__" ? { "x-tenant-id": id } : {};
    })(),
  });

  // Fetch survey metadata and all responses in parallel on mount.
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

  // Stop a running survey by setting its status to Finished.
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
      setSurvey((prev: any) => ({ ...prev, status: "Finished" }));
      setShowStopModal(false);
      toast.success("Survey Stopped Successfully");
    } catch (err) {
      console.error("Failed to stop survey:", err);
    } finally {
      setStopping(false);
    }
  };

  const handleUpdateCloseDate = async (closeDateTime: string | null) => {
    try {
      const token = localStorage.getItem("token");
      const activeTenantId = localStorage.getItem("activeTenantId");

      const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(activeTenantId && activeTenantId !== "__system__"
            ? { "x-tenant-id": activeTenantId }
            : {}),
        },
        body: JSON.stringify({
          scheduledClose: closeDateTime,
        }),
      });

      if (res.ok) {
        toast.success(
          closeDateTime ? "Closing date updated" : "Closing date removed",
        );
        // Refresh survey data
        const surveyRes = await fetch(
          `http://localhost:5000/api/surveys/${surveyId}`,
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const surveyData = await surveyRes.json();
        setSurvey(surveyData);
      } else {
        toast.error("Failed to update closing date");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Loading results...
          </p>
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
  const allQuestions: Question[] =
    survey.pages?.flatMap((p: any) => p.questions) || [];
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

      {showScheduleModal && (
        <ScheduleModal
          scheduledClose={survey.scheduledClose}
          onSave={(closeDateTime) => {
            handleUpdateCloseDate(closeDateTime);
            setShowScheduleModal(false);
          }}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div
            className="h-2 w-full"
            style={{ backgroundColor: primaryColor }}
          />
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
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  >
                    <Calendar size={14} />
                    {survey.scheduledClose
                      ? "Change Close Date"
                      : "Set Close Date"}
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
                This survey will close on:{" "}
                {new Date(survey.scheduledClose).toLocaleString()}
              </div>
            )}

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-4">
              {survey.surveyTitle || "Untitled Survey"}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {totalResponses} response{totalResponses !== 1 ? "s" : ""}{" "}
              collected
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
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
              No responses yet
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Share your survey link to start collecting answers.
            </p>
          </div>
        )}

        {activeTab === "summary" &&
          totalResponses > 0 &&
          allQuestions.map((q) => {
            const answers = responses
              .map((r) => r.responses?.[q._id])
              .filter(Boolean);
            return (
              <div
                key={q._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6"
              >
                <p className="font-bold text-slate-800 dark:text-white text-base mb-1">
                  {q.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
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
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {opt}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-xs">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {opt}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-xs">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
                      <span className="text-base text-slate-400 dark:text-slate-500 font-normal ml-2">
                        {" "}
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
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden h-16 flex flex-col-reverse">
                              <div
                                className="w-full rounded-full transition-all duration-500"
                                style={{
                                  height: `${pct}%`,
                                  backgroundColor: primaryColor,
                                  opacity: 0.8,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                              {i + 1}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
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
                      <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                        No answers yet
                      </p>
                    ) : (
                      answers.map((a, i) => (
                        <li
                          key={i}
                          className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700"
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

        {activeTab === "all" && totalResponses > 0 && (
          <AllResponsesTable
            questions={allQuestions}
            responses={responses}
            primaryColor={primaryColor}
          />
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
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Response {activeResponseIndex + 1} of {totalResponses}
              </span>
              <button
                disabled={activeResponseIndex === totalResponses - 1}
                onClick={() => setActiveResponseIndex((i) => i + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
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
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6"
                >
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-2">
                    {q.label}
                  </p>
                  {answer !== undefined && answer !== null && answer !== "" ? (
                    <p className="text-slate-800 dark:text-slate-200 text-base bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                      {Array.isArray(answer)
                        ? answer.join(", ")
                        : String(answer)}
                    </p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                      No answer
                    </p>
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
