import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, Globe, X, 
  Trash2, CheckCircle2, 
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
  const [openAmPm, setOpenAmPm] = useState("AM");
  const [closeDate, setCloseDate] = useState("");
  const [closeTime, setCloseTime] = useState("17:00");
  const [closeAmPm, setCloseAmPm] = useState("PM");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toISOString().split("T")[0];

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (time: string, ampm: string): string => {
    let [hours, minutes] = time.split(":");
    let hour = parseInt(hours);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24-hour to 12-hour format with AM/PM
  const convertTo12Hour = (time24: string): { time: string; ampm: string } => {
    let [hours, minutes] = time24.split(":");
    let hour = parseInt(hours);
    let ampm = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;
    return { time: `${hour.toString().padStart(2, "0")}:${minutes}`, ampm };
  };

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
          const time24 = open.toTimeString().slice(0, 5);
          const { time, ampm } = convertTo12Hour(time24);
          setOpenTime(time);
          setOpenAmPm(ampm);
        }
        if (data.scheduledClose) {
          setEnableClose(true);
          const close = new Date(data.scheduledClose);
          setCloseDate(close.toISOString().split("T")[0]);
          const time24 = close.toTimeString().slice(0, 5);
          const { time, ampm } = convertTo12Hour(time24);
          setCloseTime(time);
          setCloseAmPm(ampm);
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
        const time24 = convertTo24Hour(openTime, openAmPm);
        const localDate = new Date(`${openDate}T${time24}:00`);
        if (localDate < new Date()) {
          toast.error("Open date cannot be in the past");
          return;
        }
        openDateTime = localDate.toISOString();
      }
      if (enableClose && closeDate) {
        const time24 = convertTo24Hour(closeTime, closeAmPm);
        const localDate = new Date(`${closeDate}T${time24}:00`);
        if (localDate < new Date()) {
          toast.error("Close date cannot be in the past");
          return;
        }
        if (enableOpen && openDate && openDateTime) {
          const openDateObj = new Date(openDateTime);
          if (localDate <= openDateObj) {
            toast.error("Close date must be after open date");
            return;
          }
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
        {/* Header - Title on left, back button on right */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Survey Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{survey?.surveyTitle}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="grid gap-6">
          {/* Schedule Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Schedule Settings</h2>
              </div>
            </div>

            <div className="p-6">
              {(survey?.scheduledOpen || survey?.scheduledClose) && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Current Schedule</p>
                  {survey.scheduledOpen && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Opens: {new Date(survey.scheduledOpen).toLocaleString()}
                    </p>
                  )}
                  {survey.scheduledClose && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      Closes: {new Date(survey.scheduledClose).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                <Calendar size={14} />
                {survey?.scheduledOpen || survey?.scheduledClose ? "Edit Schedule" : "Set Schedule"}
              </button>

              {survey?.status === "Scheduled" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handlePublishNow}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
                  >
                    <CheckCircle2 size={12} />
                    Publish Now
                  </button>
                  <button
                    onClick={handleCancelSchedule}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all"
                  >
                    <X size={12} />
                    Cancel Schedule
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 dark:border-red-900">
              <div className="flex items-center gap-2">
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                <h2 className="font-semibold text-red-600 dark:text-red-400">Delete Survey</h2>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={handleDeleteSurvey}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-all border border-red-200 dark:border-red-800"
              >
                <Trash2 size={14} />
                Delete Survey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Survey</h2>
              <button onClick={() => setShowScheduleModal(false)} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                <X size={14} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Globe size={12} />
                <span>Timezone: <span className="font-medium">{timezone}</span></span>
              </div>
            </div>

            {/* Start Date */}
            <div className="mb-4">
              <label className="flex items-center justify-between cursor-pointer mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date & Time</span>
                <div
                  onClick={() => setEnableOpen(!enableOpen)}
                  className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${enableOpen ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${enableOpen ? "translate-x-4" : ""}`} />
                </div>
              </label>

              {enableOpen && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={openDate}
                    min={today}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={openTime.split(":")[0]}
                      min="1"
                      max="12"
                      onChange={(e) => {
                        const minutes = openTime.split(":")[1];
                        setOpenTime(`${e.target.value.padStart(2, "0")}:${minutes}`);
                      }}
                      className="w-14 px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-center focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-500 self-center">:</span>
                    <input
                      type="number"
                      value={openTime.split(":")[1]}
                      min="0"
                      max="59"
                      onChange={(e) => {
                        const hours = openTime.split(":")[0];
                        setOpenTime(`${hours}:${e.target.value.padStart(2, "0")}`);
                      }}
                      className="w-14 px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-center focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={openAmPm}
                      onChange={(e) => setOpenAmPm(e.target.value)}
                      className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Close Date */}
            <div className="mb-5">
              <label className="flex items-center justify-between cursor-pointer mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Close Date & Time</span>
                <div
                  onClick={() => setEnableClose(!enableClose)}
                  className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${enableClose ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${enableClose ? "translate-x-4" : ""}`} />
                </div>
              </label>

              {enableClose && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={closeDate}
                    min={today}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={closeTime.split(":")[0]}
                      min="1"
                      max="12"
                      onChange={(e) => {
                        const minutes = closeTime.split(":")[1];
                        setCloseTime(`${e.target.value.padStart(2, "0")}:${minutes}`);
                      }}
                      className="w-14 px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-center focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-500 self-center">:</span>
                    <input
                      type="number"
                      value={closeTime.split(":")[1]}
                      min="0"
                      max="59"
                      onChange={(e) => {
                        const hours = closeTime.split(":")[0];
                        setCloseTime(`${hours}:${e.target.value.padStart(2, "0")}`);
                      }}
                      className="w-14 px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-center focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={closeAmPm}
                      onChange={(e) => setCloseAmPm(e.target.value)}
                      className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}