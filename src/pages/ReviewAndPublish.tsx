import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, CheckCircle2, FileText, Layout, Calendar, Globe, X } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "../contexts/TenantContext";


interface ScheduleModalProps {
  scheduledOpen: string | null;
  scheduledClose: string | null;
  onSave: (open: string | null, close: string | null) => void;
  onClose: () => void;
}

const convertTo24Hour = (time: string, ampm: string): string => {
  let [hours, minutes] = time.split(":");
  let hour = parseInt(hours);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
};

function ScheduleModal({ scheduledOpen, scheduledClose, onSave, onClose }: ScheduleModalProps) {
  const [enableOpen, setEnableOpen] = useState(!!scheduledOpen);
  const [enableClose, setEnableClose] = useState(!!scheduledClose);
  const [openDate, setOpenDate] = useState(
    scheduledOpen ? new Date(scheduledOpen).toISOString().split("T")[0] : ""
  );
  const [openHour, setOpenHour] = useState(() => {
    if (scheduledOpen) {
      let hour = parseInt(new Date(scheduledOpen).toTimeString().slice(0, 2));
      if (hour === 0) hour = 12;
      if (hour > 12) hour -= 12;
      return hour.toString().padStart(2, "0");
    }
    return "09";
  });
  const [openMinute, setOpenMinute] = useState(() =>
    scheduledOpen ? new Date(scheduledOpen).toTimeString().slice(3, 5) : "00"
  );
  const [openAmPm, setOpenAmPm] = useState(() => {
    if (scheduledOpen) {
      const hour = parseInt(new Date(scheduledOpen).toTimeString().slice(0, 2));
      return hour >= 12 ? "PM" : "AM";
    }
    return "AM";
  });
  const [closeDate, setCloseDate] = useState(
    scheduledClose ? new Date(scheduledClose).toISOString().split("T")[0] : ""
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
    scheduledClose ? new Date(scheduledClose).toTimeString().slice(3, 5) : "00"
  );
  const [closeAmPm, setCloseAmPm] = useState(() => {
    if (scheduledClose) {
      const hour = parseInt(new Date(scheduledClose).toTimeString().slice(0, 2));
      return hour >= 12 ? "PM" : "AM";
    }
    return "PM";
  });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    let openDateTime: string | null = null;
    let closeDateTime: string | null = null;
    const now = new Date();

    if (enableOpen && openDate) {
      const time24 = convertTo24Hour(`${openHour}:${openMinute}`, openAmPm);
      const localDate = new Date(`${openDate}T${time24}:00`);
      if (localDate < now) { toast.error("Please select a future time for opening"); return; }
      openDateTime = localDate.toISOString();
    }
    if (enableClose && closeDate) {
      const time24 = convertTo24Hour(`${closeHour}:${closeMinute}`, closeAmPm);
      const localDate = new Date(`${closeDate}T${time24}:00`);
      if (localDate < now) { toast.error("Please select a future time for closing"); return; }
      if (enableOpen && openDate && openDateTime) {
        if (localDate <= new Date(openDateTime)) { toast.error("Close date must be after open date"); return; }
      }
      closeDateTime = localDate.toISOString();
    }

    onSave(openDateTime, closeDateTime);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Survey</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
            <X size={18} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Timezone Info */}
        <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center gap-2">
          <Globe size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Time zone: <span className="font-mono font-semibold">{timezone}</span>
          </span>
        </div>

        {/* Start Date */}
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
          <label className="flex items-center justify-between cursor-pointer mb-3">
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set start date</span>
              <p className="text-xs text-slate-400">Launch the survey on</p>
            </div>
            <div
              onClick={() => setEnableOpen((v) => !v)}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableOpen ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableOpen ? "translate-x-5" : ""}`} />
            </div>
          </label>

          {enableOpen && (
            <div className="space-y-2 ml-2">
              <input type="date" value={openDate} min={today}
                onChange={(e) => setOpenDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex gap-1 items-center">
                <input type="number" value={openHour} min="1" max="12"
                  onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 1; v = Math.min(12, Math.max(1, v)); setOpenHour(v.toString().padStart(2, "0")); }}
                  className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <span className="text-lg font-medium text-slate-600 dark:text-slate-400">:</span>
                <input type="number" value={openMinute} min="0" max="59"
                  onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 0; v = Math.min(59, Math.max(0, v)); setOpenMinute(v.toString().padStart(2, "0")); }}
                  className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <select value={openAmPm} onChange={(e) => setOpenAmPm(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Close Date */}
        <div className="pb-2">
          <label className="flex items-center justify-between cursor-pointer mb-3">
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set cut-off date</span>
              <p className="text-xs text-slate-400">Close the survey on</p>
            </div>
            <div
              onClick={() => setEnableClose((v) => !v)}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${enableClose ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${enableClose ? "translate-x-5" : ""}`} />
            </div>
          </label>

          {enableClose && (
            <div className="space-y-2 ml-2">
              <input type="date" value={closeDate} min={today}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex gap-1 items-center">
                <input type="number" value={closeHour} min="1" max="12"
                  onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 1; v = Math.min(12, Math.max(1, v)); setCloseHour(v.toString().padStart(2, "0")); }}
                  className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <span className="text-lg font-medium text-slate-600 dark:text-slate-400">:</span>
                <input type="number" value={closeMinute} min="0" max="59"
                  onChange={(e) => { let v = parseInt(e.target.value); if (isNaN(v)) v = 0; v = Math.min(59, Math.max(0, v)); setCloseMinute(v.toString().padStart(2, "0")); }}
                  className="w-20 px-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center"
                />
                <select value={closeAmPm} onChange={(e) => setCloseAmPm(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewAndPublish() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTenant, isSystemContext } = useTenant();
  const tenantRole = !isSystemContext && activeTenant ? activeTenant.role : null;
  const isViewer = tenantRole === "viewer" || tenantRole === "billing_manager";

  const surveyTitle = location.state?.surveyTitle || "Untitled Survey";
  const description = location.state?.description || "";
  const pages = location.state?.pages || [];
  const primaryColor = location.state?.primaryColor || "#6366F1";
  const backgroundColor = location.state?.backgroundColor || "#F8FAFC";
  const surveyId = location.state?.surveyId;
  const logo = location.state?.logo || null;
  const websiteUrl = location.state?.websiteUrl || "";
  const customizeBranding = location.state?.customizeBranding || false;

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledOpen, setScheduledOpen] = useState<string | null>(null);
  const [scheduledClose, setScheduledClose] = useState<string | null>(null);

  if (isViewer) {
    toast.error("You do not have permission to publish or edit surveys");
    navigate("/created-surveys");
    return null;
  }

  const handleFinalize = async (status: "Running" | "Draft" | "Scheduled") => {
    try {
      const payload = {
        surveyTitle, description, logo, websiteUrl, customizeBranding,
        primaryColor, themeColor: primaryColor, backgroundColor,
        pages, status,
        scheduledOpen: scheduledOpen || null,
        scheduledClose: scheduledClose || null,
      };
      const token = localStorage.getItem("token");
      const activeTenantId = localStorage.getItem("activeTenantId");
      const url = surveyId ? `http://localhost:5000/api/surveys/${surveyId}` : "http://localhost:5000/api/surveys";
      const method = surveyId ? "PUT" : "POST";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(activeTenantId && activeTenantId !== "__system__" ? { "x-tenant-id": activeTenantId } : {}),
      };
      const res = await fetch(url, { method, headers, credentials: "include", body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); alert(`Error: ${err.message}`); return; }
      const data = await res.json();
      const savedSurvey = data.survey;

      if (status === "Running") {
        const statusRes = await fetch(`http://localhost:5000/api/surveys/${savedSurvey._id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: "Running" }),
        });
        if (!statusRes.ok) { toast.error("Failed to publish survey"); return; }
        toast.success("Survey Published Successfully");
      }

      if (status === "Running" || status === "Scheduled") {
        navigate("/share-survey", {
          state: { surveyId: savedSurvey._id, surveyTitle: savedSurvey.surveyTitle, scheduledOpen: status === "Scheduled" ? savedSurvey.scheduledOpen : null },
        });
      } else {
        navigate("/created-surveys", {
          state: {
            newSurvey: {
              id: savedSurvey._id, date: new Date().toLocaleDateString("en-GB"),
              title: savedSurvey.surveyTitle, status: savedSurvey.status,
              pageCount: savedSurvey.pages.length,
              questionCount: savedSurvey.pages.reduce((acc: number, p: any) => acc + p.questions.length, 0),
            },
          },
        });
      }
    } catch (err) {
      console.error("Failed to save survey:", err);
      alert("Something went wrong. Is the backend running on port 5000?");
    }
  };

  const hasSchedule = scheduledOpen || scheduledClose;
  const scheduleSummary = () => {
    const open = scheduledOpen ? new Date(scheduledOpen).toLocaleString() : null;
    const close = scheduledClose ? new Date(scheduledClose).toLocaleString() : null;
    if (open && close) return `📅 Opens: ${open} → Closes: ${close}`;
    if (open) return `📅 Opens: ${open} (no close date)`;
    if (close) return `📅 Closes: ${close}`;
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] font-sans transition-colors duration-300">
      <div className="flex max-w-200 py-12 px-6 flex-col gap-6 w-full text-left">
        <div className="flex justify-between items-center w-full mb-2">
          <button
            onClick={() => {
              if (surveyId) {
                navigate("/add-questions", { state: { surveyId, formData: { surveyTitle, description, logo, websiteUrl, customizeBranding, themeColor: primaryColor, backgroundColor } } });
              } else { navigate(-1); }
            }}
            className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-medium hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={18} /> Back to editor
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="h-2 w-full bg-gray-200 dark:bg-slate-700" />

          <div className="p-10">
            <div className="flex items-start justify-between mb-10">
              <div>
                <h1 className="text-gray-900 dark:text-white text-3xl font-extrabold mb-2">Review & Publish</h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Final check of the survey structure and content.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                <CheckCircle2 size={28} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Title</p>
                <p className="text-gray-900 dark:text-white font-bold">{surveyTitle}</p>
              </div>
              {description && (
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Description</p>
                  <p className="text-gray-700 dark:text-slate-300 text-sm">{description}</p>
                </div>
              )}
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Structure</p>
                <p className="text-gray-900 dark:text-white font-bold">
                  {pages.length} {pages.length === 1 ? "Page" : "Pages"} •{" "}
                  {pages.reduce((acc: number, p: any) => acc + p.questions.length, 0)} Questions
                </p>
              </div>
              {logo && (
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Logo</p>
                  <img src={logo} alt="Survey logo" className="max-h-16 object-contain rounded" />
                </div>
              )}
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Theme Color</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: primaryColor }} />
                  <span className="text-gray-900 dark:text-white font-bold font-mono text-sm">{primaryColor}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Background Color</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor }} />
                  <span className="text-gray-900 dark:text-white font-bold font-mono text-sm">{backgroundColor}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Status after action</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 border border-orange-100 dark:border-orange-800 font-bold">Draft</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 font-bold">Running</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 font-bold">Scheduled</span>
                </div>
              </div>
            </div>

            {hasSchedule && (
              <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Calendar size={14} /> Schedule configured:
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{scheduleSummary()}</p>
              </div>
            )}

            {pages.length > 0 ? (
              <div className="space-y-8 mb-12">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layout size={16} className="text-gray-500" /> Content Summary
                </h3>
                {pages.map((page: any, pIdx: number) => (
                  <div key={page.id || pIdx} className="border-l-2 border-gray-100 dark:border-slate-700 pl-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold py-0.5 px-2 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded">PAGE {pIdx + 1}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{page.title}</span>
                    </div>
                    {page.questions.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No questions on this page</p>
                    ) : (
                      <div className="grid gap-3">
                        {page.questions.map((q: any, qIdx: number) => (
                          <div key={q.id || qIdx} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
                            <span className="text-xs font-bold text-gray-400 mt-0.5">{qIdx + 1}.</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{q.label}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                                  <FileText size={10} /> {q.type.replace("_", " ")}
                                </span>
                                {q.required && <span className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">Required</span>}
                              </div>
                              {q.options && q.options.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {q.options.slice(0, 3).map((opt: string, i: number) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded text-gray-500 dark:text-slate-400">{opt}</span>
                                  ))}
                                  {q.options.length > 3 && <span className="text-[10px] text-gray-400">+{q.options.length - 3} more</span>}
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
                <p className="text-gray-400 text-sm">No pages or questions added yet.</p>
                <button onClick={() => navigate(-1)} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  ← Go back and add questions
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => handleFinalize("Draft")}
                className="px-8 py-3 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-all">
                Save as draft
              </button>
              <button onClick={() => setShowScheduleModal(true)}
                className="px-6 py-3 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center gap-2">
                <Calendar size={16} /> Schedule
              </button>
              <button onClick={() => handleFinalize(scheduledOpen ? "Scheduled" : "Running")}
                className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg transition-all">
                {scheduledOpen ? "Schedule Survey" : "Publish Survey"}
              </button>
            </div>
          </div>
        </div>
      </div>

      { }
      {showScheduleModal && (
        <ScheduleModal
          scheduledOpen={scheduledOpen}
          scheduledClose={scheduledClose}
          onSave={(open, close) => {
            setScheduledOpen(open);
            setScheduledClose(close);
            setShowScheduleModal(false);
          }}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
}