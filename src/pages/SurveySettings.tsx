import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, Globe, Save, X, 
  Trash2, AlertCircle, CheckCircle2, Settings, 
  Calendar as CalendarIcon, Clock as ClockIcon 
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
        
        // Initialize schedule state
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
        // Refresh survey data
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Survey Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{survey?.surveyTitle}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Schedule Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <CalendarIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Set when your survey should open and close</p>
              </div>
            </div>

            {/* Current Schedule Display */}
            {(survey?.scheduledOpen || survey?.scheduledClose) && (
              <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Current Schedule:</p>
                {survey.scheduledOpen && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    Opens: {new Date(survey.scheduledOpen).toLocaleString()}
                  </p>
                )}
                {survey.scheduledClose && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    Closes: {new Date(survey.scheduledClose).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Schedule Modal Toggle */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              <Calendar size={16} />
              {survey?.scheduledOpen || survey?.scheduledClose ? "Edit Schedule" : "Set Schedule"}
            </button>

            {/* Quick Actions for Scheduled Surveys */}
            {survey?.status === "Scheduled" && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handlePublishNow}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                >
                  <CheckCircle2 size={14} />
                  Publish Now
                </button>
                <button
                  onClick={handleCancelSchedule}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-all"
                >
                  <X size={14} />
                  Cancel Schedule
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete this survey</p>
              </div>
            </div>
            <button
              onClick={handleDeleteSurvey}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
            >
              <Trash2 size={16} />
              Delete Survey
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Survey</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Timezone Info */}
            <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center gap-2">
              <Globe size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Time zone: <span className="font-mono font-semibold">{timezone}</span>
              </span>
            </div>

            {/* Start Date Section */}
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set start date</span>
                  <p className="text-xs text-slate-400">Launch the survey on</p>
                </div>
                <div
                  onClick={() => setEnableOpen(!enableOpen)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableOpen ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableOpen ? "translate-x-5" : ""}`} />
                </div>
              </label>

              {enableOpen && (
                <div className="flex gap-2 ml-4 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                  <div className="flex-1 relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={openDate}
                      min={today}
                      onChange={(e) => setOpenDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div className="w-28 relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Close Date Section */}
            <div className="pb-2">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set cut-off date</span>
                  <p className="text-xs text-slate-400">Close the survey on</p>
                </div>
                <div
                  onClick={() => setEnableClose(!enableClose)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableClose ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableClose ? "translate-x-5" : ""}`} />
                </div>
              </label>

              {enableClose && (
                <div className="flex gap-2 ml-4 pl-3 border-l-2 border-rose-200 dark:border-rose-800">
                  <div className="flex-1 relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={closeDate}
                      min={today}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div className="w-28 relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
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