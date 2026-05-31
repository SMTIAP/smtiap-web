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

export default function CreatedSurveys() {
  const navigate = useNavigate();
  const { activeTenant, isSystemContext } = useTenant();
  const effectiveRole =
    !isSystemContext && activeTenant ? activeTenant.role : null;
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

      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {[
            {
              label: "Total",
              value: surveys.length,
              icon: Layout,
              gradient: "from-indigo-500 to-indigo-600",
              bg: "from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30",
            },
            {
              label: "Running",
              value: surveys.filter((s) => s.status === "Running").length,
              icon: Activity,
              gradient: "from-emerald-500 to-emerald-600",
              bg: "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30",
            },
            {
              label: "Draft",
              value: surveys.filter((s) => s.status === "Draft").length,
              icon: Clock,
              gradient: "from-amber-500 to-amber-600",
              bg: "from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30",
            },
            {
              label: "Scheduled",
              value: surveys.filter((s) => s.status === "Scheduled").length,
              icon: Calendar,
              gradient: "from-purple-500 to-purple-600",
              bg: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30",
            },
            {
              label: "Finished",
              value: surveys.filter((s) => s.status === "Finished").length,
              icon: CheckCircle2,
              gradient: "from-rose-500 to-rose-600",
              bg: "from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/30",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon size={16} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-0">
          {["All", "Running", "Draft", "Scheduled", "Finished"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab === "All"
                  ? surveys.length
                  : surveys.filter((s) => s.status === tab).length}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Survey Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {filteredSurveys.map((survey) => {
            const isRunning = survey.status === "Running";
            const isDraft = survey.status === "Draft";
            const isScheduled = survey.status === "Scheduled";
            const isFinished = survey.status === "Finished";
            const isCopying = copyingSurveyId === survey._id;
            const isCopied = copiedSurveyId === survey._id;

            const getStatusColor = () => {
              if (isRunning) return "from-emerald-500 to-emerald-600";
              if (isDraft) return "from-amber-500 to-amber-600";
              if (isScheduled) return "from-purple-500 to-purple-600";
              return "from-rose-500 to-rose-600";
            };

            const getIconBg = () => {
              if (isRunning)
                return "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-600";
              if (isDraft)
                return "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-600";
              if (isScheduled)
                return "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-600";
              return "bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 text-rose-600";
            };

            const getIcon = () => {
              if (isRunning) return <Activity size={28} />;
              if (isDraft) return <Clock size={28} />;
              if (isScheduled) return <Calendar size={28} />;
              return <CheckCircle2 size={28} />;
            };

            const getBadgeClass = () => {
              if (isRunning)
                return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md";
              if (isDraft)
                return "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md";
              if (isScheduled)
                return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md";
              return "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md";
            };

            return (
              <div
                key={survey._id}
                onClick={() => handleCardClick(survey)}
                className="group relative flex flex-col items-center p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10"></div>
                <div className="absolute inset-[1px] bg-white/90 dark:bg-slate-800/90 rounded-2xl -z-5"></div>

                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getStatusColor()}`}
                />

                <div className="flex justify-between items-center w-full mb-6">
                  <span className="text-slate-500 text-[10px] font-extrabold bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-600">
                    {new Date(survey.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(isRunning || isScheduled) && (
                      <button
                        type="button"
                        onClick={(e) => handleShareClick(e, survey)}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                        title="Share survey"
                      >
                        <Share2 size={13} />
                      </button>
                    )}

                    {isScheduled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/survey-settings/${survey._id}`);
                        }}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                        title="Survey Settings"
                      >
                        <Settings size={13} />
                      </button>
                    )}

                    {canCreate && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyClick(e, survey)}
                        disabled={isCopying}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        title="Make a copy"
                      >
                        {isCopied ? (
                          <Check size={13} className="text-emerald-500" />
                        ) : isCopying ? (
                          <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CopyPlus size={13} />
                        )}
                      </button>
                    )}

                    {canCreate && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, survey)}
                        disabled={deletingSurveyId === survey._id}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        title="Delete survey"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-grow text-center w-full">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg ${getIconBg()}`}
                  >
                    {getIcon()}
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-bold text-base leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2">
                    {survey.surveyTitle || "Untitled Survey"}
                  </h3>
                  {isRunning && (
                    <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                      <Activity size={10} />
                      <span>Active Now</span>
                    </div>
                  )}
                  {isScheduled && survey.scheduledOpen && (
                    <div className="flex items-center gap-1 text-purple-600 text-[10px] font-bold">
                      <Calendar size={10} />
                      <span>
                        {new Date(survey.scheduledOpen).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`mt-4 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getBadgeClass()}`}
                >
                  {survey.status}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSurveys.length === 0 && (
          <div className="text-center py-20">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20"></div>
              <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-xl">
                <Layout
                  size={48}
                  className="text-slate-300 dark:text-slate-600"
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              No surveys found
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {activeTab === "All"
                ? "You haven't created any surveys yet."
                : `No ${activeTab.toLowerCase()} surveys available.`}
            </p>
            {canCreate && activeTab !== "Finished" && (
              <button
                onClick={() => navigate("/templates")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                <Plus size={16} />
                Create your first survey
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
