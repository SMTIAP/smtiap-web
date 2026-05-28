import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, Globe, Save, X, 
  Trash2, CheckCircle2, Settings, 
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";

export default function SurveySettings() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  
  // Schedule state
  const [enableOpen, setEnableOpen] = useState(false);
  const [enableClose, setEnableClose] = useState(false);
  const [openDate, setOpenDate] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeDate, setCloseDate] = useState("");
  const [closeTime, setCloseTime] = useState("17:00");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toISOString().split("T")[0];

  // Fetch survey data
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setSurvey(data);
        
        if (data.scheduledOpen) {
          setEnableOpen(true);
          const open = new Date(data.scheduledOpen);
          setOpenDate(open.toISOString().split("T")[0]);
          setOpenTime(open.toTimeString().slice(0, 5));
        }
        if (data.scheduledClose) {
          setEnableClose(true);
          const close = new Date(data.scheduledClose);
          setCloseDate(close.toISOString().split("T")[0]);
          setCloseTime(close.toTimeString().slice(0, 5));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load survey");
      } finally {
        setLoading(false);
      }
    };
    if (surveyId) fetchSurvey();
  }, [surveyId]);

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      let openDateTime: string | null = null;
      let closeDateTime: string | null = null;

      if (enableOpen && openDate) {
        const localDate = new Date(`${openDate}T${openTime}:00`);
        if (localDate < new Date()) {
          toast.error("Open date cannot be in the past");
          return;
        }
        openDateTime = localDate.toISOString();
      }
      if (enableClose && closeDate) {
        const localDate = new Date(`${closeDate}T${closeTime}:00`);
        if (localDate < new Date()) {
          toast.error("Close date cannot be in the past");
          return;
        }
        if (enableOpen && openDate && localDate <= new Date(`${openDate}T${openTime}:00`)) {
          toast.error("Close date must be after open date");
          return;
        }
        closeDateTime = localDate.toISOString();
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduledOpen: openDateTime,
          scheduledClose: closeDateTime,
        }),
      });

      if (res.ok) {
        toast.success("Schedule updated successfully!");
        setShowScheduleModal(false);
        const updated = await res.json();
        setSurvey(updated.survey);
      } else {
        toast.error("Failed to update schedule");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!confirm("Cancel schedule and move survey to Draft? You can publish again later.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Draft",
          scheduledOpen: null,
          scheduledClose: null,
        }),
      });

      if (res.ok) {
        toast.success("Schedule cancelled. Survey moved to Draft.");
        navigate("/created-surveys");
      } else {
        toast.error("Failed to cancel schedule");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteSurvey = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Survey deleted successfully");
        navigate("/created-surveys");
      } else {
        toast.error("Failed to delete survey");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handlePublishNow = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Running",
          scheduledOpen: null,
          scheduledClose: null,
        }),
      });

      if (res.ok) {
        toast.success("Survey published now!");
        navigate("/share-survey", { state: { surveyId, surveyTitle: survey.surveyTitle } });
      } else {
        toast.error("Failed to publish survey");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header - Clean back button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Survey Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{survey?.surveyTitle}</p>
          </div>
        </div>

        <div className="grid gap-5">
          {/* Schedule Section - Clean card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <CalendarIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Settings</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Set when your survey should open and close</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Current Schedule Display */}
              {(survey?.scheduledOpen || survey?.scheduledClose) && (
                <div className="mb-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Current Schedule</p>
                  {survey.scheduledOpen && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                      📅 Opens: {new Date(survey.scheduledOpen).toLocaleString()}
                    </p>
                  )}
                  {survey.scheduledClose && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                      🔒 Closes: {new Date(survey.scheduledClose).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Schedule Button */}
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800"
              >
                <Calendar size={16} />
                {survey?.scheduledOpen || survey?.scheduledClose ? "Edit Schedule" : "Set Schedule"}
              </button>

              {/* Quick Actions for Scheduled Surveys */}
              {survey?.status === "Scheduled" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handlePublishNow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all border border-emerald-100 dark:border-emerald-800"
                  >
                    <CheckCircle2 size={14} />
                    Publish Now
                  </button>
                  <button
                    onClick={handleCancelSchedule}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all border border-amber-100 dark:border-amber-800"
                  >
                    <X size={14} />
                    Cancel Schedule
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone - Clean card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                  <Trash2 size={20} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Survey</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Permanently remove this survey</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={handleDeleteSurvey}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-xl font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all border border-rose-100 dark:border-rose-800"
              >
                <Trash2 size={16} />
                Delete Survey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Survey</h2>
              <button onClick={() => setShowScheduleModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                <X size={16} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Timezone Info */}
            <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-2">
              <Globe size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">Your timezone:</span> {timezone}
              </span>
            </div>

            {/* Start Date Section */}
            <div className="mb-5">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date & Time</span>
                  <p className="text-xs text-slate-400">When the survey becomes available</p>
                </div>
                <div
                  onClick={() => setEnableOpen(!enableOpen)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableOpen ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-600"}`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableOpen ? "translate-x-5" : ""}`} />
                </div>
              </label>

              {enableOpen && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={openDate}
                      min={today}
                      onChange={(e) => setOpenDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Close Date Section */}
            <div className="mb-6">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Close Date & Time</span>
                  <p className="text-xs text-slate-400">When the survey stops accepting responses</p>
                </div>
                <div
                  onClick={() => setEnableClose(!enableClose)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableClose ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-600"}`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableClose ? "translate-x-5" : ""}`} />
                </div>
              </label>

              {enableClose && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={closeDate}
                      min={today}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}