import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Activity,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  Layout,
  Share2,
  Copy,
  Check,
  Download,
  Lock,
  CopyPlus,
  Calendar,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTenant } from "../contexts/TenantContext";

interface SurveyItem {
  _id: string;
  surveyTitle?: string;
  status: "Draft" | "Running" | "Finished" | "Scheduled";
  createdAt: string;
  updatedAt?: string;
  isPasswordProtected?: boolean;
  password?: string;
  pages?: any[];
  scheduledOpen?: string;
  scheduledClose?: string;
}

// Confirmation dialog for deleting a survey.
const DeleteConfirmModal = ({ ...props }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        onClick={props.onCancel}
      />
      <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 max-w-xs w-full z-10 animate-in fade-in zoom-in duration-200">
        <button
          onClick={props.onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <Trash2 size={16} className="text-white" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white text-base">
            Delete survey?
          </p>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium truncate mb-1">
          "{props.survey.surveyTitle || "Untitled Survey"}"
        </p>
        <p className="text-slate-400 text-xs mb-4">
          This action cannot be undone.
        </p>
        {props.errorMsg && (
          <p className="text-rose-500 text-xs font-semibold mb-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
            {props.errorMsg}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={props.onCancel}
            disabled={props.deleting}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={props.onConfirm}
            disabled={props.deleting}
            className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-semibold text-sm hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-50 shadow-md"
          >
            {props.deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Share survey dialog with link copy, password protection toggle, and QR code download.
const ShareModal = ({
  survey,
  onClose,
}: {
  survey: SurveyItem;
  onClose: () => void;
}) => {
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(() => {
      const id = localStorage.getItem("activeTenantId");
      return id && id !== "__system__" ? { "x-tenant-id": id } : {};
    })(),
  };
  const surveyLink = `${window.location.origin}/take-survey/${survey._id}`;
  const [copied, setCopied] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(
    survey.isPasswordProtected || false,
  );
  const [password, setPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render SVG QR to canvas, then trigger PNG download.
  const downloadQR = () => {
    const svg = document.getElementById("share-modal-qr") as SVGElement | null;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${survey.surveyTitle || "survey"}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Toggle password protection; clearing it removes the password from the backend immediately.
  const handleToggle = async () => {
    const newValue = !isPasswordProtected;
    setIsPasswordProtected(newValue);
    setPassword("");
    setPasswordSaved(false);
    if (!newValue) {
      try {
        await fetch(`http://localhost:5000/api/surveys/${survey._id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ isPasswordProtected: false, password: "" }),
        });
      } catch (err) {
        console.error("Failed to clear password:", err);
      }
    }
  };

  const handleSavePassword = async () => {
    if (!password) return;
    setSavingPassword(true);
    try {
      await fetch(`http://localhost:5000/api/surveys/${survey._id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isPasswordProtected: true, password }),
      });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save password:", err);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-5 max-w-sm w-full z-10 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Share2 size={14} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              Share Survey
            </p>
            <p className="text-slate-400 text-[10px] truncate max-w-[200px]">
              {survey.surveyTitle || "Untitled Survey"}
            </p>
          </div>
        </div>

        <div className="mb-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Password Protection
              </span>
            </div>
            <div
              onClick={handleToggle}
              className={`w-8 h-4 rounded-full relative cursor-pointer transition-all duration-200 ${isPasswordProtected ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm ${isPasswordProtected ? "left-4" : "left-0.5"}`}
              />
            </div>
          </div>
          {isPasswordProtected && (
            <div className="flex gap-2 mt-2.5">
              <input
                type="password"
                placeholder={
                  survey.isPasswordProtected ? "••••••••" : "Set a password"
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordSaved(false);
                }}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 dark:text-white"
              />
              <button
                onClick={handleSavePassword}
                disabled={!password || savingPassword}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-xs font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-40 transition-all min-w-[50px] shadow-sm"
              >
                {passwordSaved ? "✓" : savingPassword ? "..." : "Save"}
              </button>
            </div>
          )}
          {!isPasswordProtected && (
            <p className="text-[10px] text-slate-400 mt-1">
              Anyone with the link can access this survey.
            </p>
          )}
        </div>

        <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
          Survey Link
        </p>
        <div className="flex gap-2 mb-4">
          <input
            readOnly
            value={surveyLink}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center min-w-[38px] shadow-sm"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>

        <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-2">
          QR Code
        </p>
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
            <QRCodeSVG
              id="share-modal-qr"
              value={surveyLink}
              size={90}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-snug">
              Download QR code to share
            </p>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:text-indigo-800 transition-colors"
            >
              <Download size={13} /> Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Survey list page with status tabs, stats cards, copy/delete/share actions, and role-based access.
export default function CreatedSurveys() {
  const navigate = useNavigate();
  const { activeTenant, isSystemContext } = useTenant();
  const effectiveRole =
    !isSystemContext && activeTenant ? activeTenant.role : null;
  // Only specific roles can create, edit, or delete surveys.
  const canCreate = effectiveRole
    ? ["super_admin", "admin", "creator"].includes(effectiveRole)
    : true;
  const [activeTab, setActiveTab] = useState("All");
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);
  const [copyingSurveyId, setCopyingSurveyId] = useState<string | null>(null);
  const [copiedSurveyId, setCopiedSurveyId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<SurveyItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [surveyToShare, setSurveyToShare] = useState<SurveyItem | null>(null);

  // Fetch all surveys, sorted by most recent update first.
  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const activeTenantId = localStorage.getItem("activeTenantId");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (activeTenantId && activeTenantId !== "__system__")
        headers["x-tenant-id"] = activeTenantId;
      const response = await fetch("http://localhost:5000/api/surveys", {
        headers,
        credentials: "include",
      });
      const data = await response.json();
      // Sort by updatedAt descending, falling back to createdAt.
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => {
        const dateA = a.updatedAt
          ? new Date(a.updatedAt)
          : new Date(a.createdAt);
        const dateB = b.updatedAt
          ? new Date(b.updatedAt)
          : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setSurveys(sortedData);
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [activeTenant]);
  // Listen for cross-tab survey update signals to refresh the list.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "surveyUpdated") {
        fetchSurveys();
        localStorage.removeItem("surveyUpdated");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Navigate to the appropriate view based on survey status.
  const handleCardClick = (survey: SurveyItem) => {
    if (survey.status === "Draft") {
      if (canCreate)
        navigate("/add-questions", { state: { surveyId: survey._id } });
      else
        navigate("/add-questions", {
          state: { surveyId: survey._id, readOnly: true },
        });
    } else if (survey.status === "Scheduled") {
      navigate("/scheduled-survey-preview", { state: { survey } });
    } else if (survey.status === "Running" || survey.status === "Finished") {
      navigate(`/survey-results/${survey._id}`);
    }
  };

  const handleShareClick = (e: React.MouseEvent, survey: SurveyItem) => {
    e.stopPropagation();
    setSurveyToShare(survey);
  };
  const handleDeleteClick = (event: React.MouseEvent, survey: SurveyItem) => {
    event.stopPropagation();
    setSurveyToDelete(survey);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const token = localStorage.getItem("token");
  const authHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(() => {
      const id = localStorage.getItem("activeTenantId");
      return id && id !== "__system__" ? { "x-tenant-id": id } : {};
    })(),
  });

  // Duplicate a survey by fetching its full data and creating a copy.
  const handleCopyClick = async (e: React.MouseEvent, survey: SurveyItem) => {
    e.stopPropagation();
    setCopyingSurveyId(survey._id);
    try {
      const res = await fetch(
        `http://localhost:5000/api/surveys/${survey._id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        },
      );
      const full = await res.json();
      const response = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          surveyTitle: `Copy of ${full.surveyTitle || "Untitled Survey"}`,
          description: full.description || "",
          pages: full.pages || [],
          status: "Draft",
          themeColor: full.themeColor,
          primaryColor: full.primaryColor,
          customizeBranding: full.customizeBranding,
          isAnonymous: full.isAnonymous,
        }),
      });
      const newSurvey = await response.json();
      const created = newSurvey?.survey || newSurvey;
      if (created?._id) {
        await fetchSurveys();
        setCopiedSurveyId(survey._id);
        setTimeout(() => setCopiedSurveyId(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy survey:", err);
    } finally {
      setCopyingSurveyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!surveyToDelete) return;
    setDeleteError(null);
    try {
      setDeletingSurveyId(surveyToDelete._id);
      const currentToken = localStorage.getItem("token");
      const activeTenantId = localStorage.getItem("activeTenantId");
      const response = await fetch(
        `http://localhost:5000/api/surveys/${surveyToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            ...(currentToken
              ? { Authorization: `Bearer ${currentToken}` }
              : {}),
            ...(activeTenantId && activeTenantId !== "__system__"
              ? { "x-tenant-id": activeTenantId }
              : {}),
          },
          credentials: "include",
        },
      );
      if (!response.ok) {
        let msg = "Failed to delete. Please try again.";
        try {
          const errData = await response.json();
          msg = errData.message || msg;
        } catch {}
        setDeleteError(msg);
        return;
      }
      await fetchSurveys();
      setShowDeleteModal(false);
      setSurveyToDelete(null);
    } catch (err) {
      console.error("Failed to delete survey:", err);
      setDeleteError("Network error. Is the server running?");
    } finally {
      setDeletingSurveyId(null);
    }
  };

  const filteredSurveys = surveys.filter(
    (survey) => activeTab === "All" || survey.status === activeTab,
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-75"></div>
            <div className="relative rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-3">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-xs animate-pulse">
            Loading Workspace
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {showDeleteModal && surveyToDelete && (
        <DeleteConfirmModal
          survey={surveyToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSurveyToDelete(null);
            setDeleteError(null);
          }}
          deleting={deletingSurveyId === surveyToDelete._id}
          errorMsg={deleteError}
        />
      )}
      {surveyToShare && (
        <ShareModal
          survey={surveyToShare}
          onClose={() => setSurveyToShare(null)}
        />
      )}

      <div className="fixed top-[70px] left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50" />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/30 dark:bg-indigo-600/20 blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/20 blur-[120px] animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div
          className="absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-pink-400/20 dark:bg-pink-600/10 blur-[120px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />

        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgb(99 102 241) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 lg:py-12">
        {/* Header with icon */}
        <div className="flex justify-between items-center w-full mb-12">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-30"></div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl flex items-center justify-center">
                <Sparkles size={22} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-[#0F172A] dark:text-white text-3xl font-black tracking-tight mb-2">
                My Surveys
              </h1>
              <p className="text-[#64748B] dark:text-slate-400 text-sm font-medium">
                Track performance and draft new insights.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canCreate && (
              <button
                onClick={() => navigate("/templates")}
                className="group cursor-pointer py-2 px-3 flex justify-center items-center rounded-md bg-indigo-600 text-white transition-opacity hover:opacity-90"
              >
                <Plus
                  size={16}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            {
              label: "Total Surveys",
              value: surveys.length,
              icon: Layout,
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-900/30",
              border: "border-indigo-100 dark:border-indigo-800/30",
            },
            {
              label: "Running",
              value: surveys.filter((s) => s.status === "Running").length,
              icon: Activity,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-900/30",
              border: "border-emerald-100 dark:border-emerald-800/30",
            },
            {
              label: "Draft",
              value: surveys.filter((s) => s.status === "Draft").length,
              icon: Clock,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-900/30",
              border: "border-amber-100 dark:border-amber-800/30",
            },
            {
              label: "Scheduled",
              value: surveys.filter((s) => s.status === "Scheduled").length,
              icon: Calendar,
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-900/30",
              border: "border-purple-100 dark:border-purple-800/30",
            },
            {
              label: "Finished",
              value: surveys.filter((s) => s.status === "Finished").length,
              icon: CheckCircle2,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-50 dark:bg-rose-900/30",
              border: "border-rose-100 dark:border-rose-800/30",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`group relative bg-white/70 dark:bg-slate-800/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 dark:border-slate-700/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 overflow-hidden shadow-sm`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}
                >
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Tabs */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
            {["All", "Running", "Draft", "Scheduled", "Finished"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2.5 ${
                  activeTab === tab
                    ? "bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-white shadow-md border border-white/50 dark:border-slate-600/50 scale-[1.02]"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent"
                }`}
              >
                {tab}
                <span
                  className={`px-2.5 py-0.5 text-[10px] rounded-lg font-black tracking-wide ${
                    activeTab === tab
                      ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 shadow-sm border border-indigo-100/50 dark:border-indigo-800/30"
                      : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab === "All"
                    ? surveys.length
                    : surveys.filter((s) => s.status === tab).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Survey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {filteredSurveys.map((survey) => {
            const isRunning = survey.status === "Running";
            const isDraft = survey.status === "Draft";
            const isScheduled = survey.status === "Scheduled";
            const isFinished = survey.status === "Finished";
            const isCopying = copyingSurveyId === survey._id;
            const isCopied = copiedSurveyId === survey._id;

            const getStatusColor = () => {
              if (isRunning) return "bg-emerald-500";
              if (isDraft) return "bg-amber-500";
              if (isScheduled) return "bg-purple-500";
              return "bg-rose-500";
            };

            const getIconBg = () => {
              if (isRunning)
                return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
              if (isDraft)
                return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400";
              if (isScheduled)
                return "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400";
              return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400";
            };

            const getBadgeColors = () => {
              if (isRunning)
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30";
              if (isDraft)
                return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
              if (isScheduled)
                return "bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30";
              return "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30";
            };

            const getIcon = (size = 24) => {
              if (isRunning) return <Activity size={size} />;
              if (isDraft) return <Clock size={size} />;
              if (isScheduled) return <Calendar size={size} />;
              return <CheckCircle2 size={size} />;
            };

            return (
              <div
                key={survey._id}
                onClick={() => handleCardClick(survey)}
                className="group relative flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 pointer-events-none" />
                <div
                  className={`absolute top-0 left-0 w-full h-1.5 ${getStatusColor()} opacity-90`}
                />

                <div className="relative z-10 p-7 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${getIconBg()}`}
                    >
                      {getIcon(24)}
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getBadgeColors()}`}
                    >
                      {survey.status}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-snug line-clamp-2 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {survey.surveyTitle || "Untitled Survey"}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {isRunning && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <Activity size={14} />
                          <span>Active Now</span>
                        </div>
                      )}
                      {isRunning && survey.scheduledClose && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Calendar size={14} />
                          <span>
                            Closes:{" "}
                            {new Date(survey.scheduledClose).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {isScheduled && survey.scheduledOpen && (
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                          <Calendar size={14} />
                          <span>
                            Opens:{" "}
                            {new Date(survey.scheduledOpen).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Clock size={14} />
                        <span>
                          Created:{" "}
                          {new Date(survey.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-semibold">
                      {survey.pages?.length || 0} Pages
                    </span>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {(isRunning || isScheduled) && (
                        <button
                          type="button"
                          onClick={(e) => handleShareClick(e, survey)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-center"
                          title="Share survey"
                        >
                          <Share2 size={16} />
                        </button>
                      )}

                      {isScheduled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/survey-settings/${survey._id}`);
                          }}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-center"
                          title="Survey Settings"
                        >
                          <Settings size={16} />
                        </button>
                      )}

                      {canCreate && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyClick(e, survey)}
                          disabled={isCopying}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors flex items-center justify-center disabled:opacity-50"
                          title="Make a copy"
                        >
                          {isCopied ? (
                            <Check size={16} className="text-emerald-500" />
                          ) : isCopying ? (
                            <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CopyPlus size={16} />
                          )}
                        </button>
                      )}

                      {canCreate && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, survey)}
                          disabled={deletingSurveyId === survey._id}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center disabled:opacity-50"
                          title="Delete survey"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSurveys.length === 0 && (
          <div className="relative text-center py-24 bg-white/40 dark:bg-slate-800/40 rounded-[2.5rem] border border-white/60 dark:border-slate-700/50 mt-10 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 pointer-events-none" />
            <div className="relative z-10 w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 animate-ping"></div>
              <div className="relative w-24 h-24 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <Layout size={40} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              No surveys found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto">
              {activeTab === "All"
                ? "You haven't created any surveys yet. Get started by creating your first survey."
                : `No ${activeTab.toLowerCase()} surveys available.`}
            </p>
            {canCreate && activeTab !== "Finished" && (
              <button
                onClick={() => navigate("/templates")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
              >
                <Plus size={18} />
                Create Survey
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { transform: translateX(0%); }
          50% { transform: translateX(100%); }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease-in-out infinite;
          background-size: 200% 100%;
        }
      `}</style>
    </div>
  );
}
