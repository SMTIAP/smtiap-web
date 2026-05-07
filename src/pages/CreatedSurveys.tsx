import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, ChevronLeft, Activity, Clock, CheckCircle2,
  Trash2, X, Layout, Share2, Copy, Check, Download, Lock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface SurveyItem {
  _id: string;
  surveyTitle?: string;
  status: "Draft" | "Running" | "Finished";
  createdAt: string;
  isPasswordProtected?: boolean;
  password?: string;
}

const DeleteConfirmModal = ({ survey, onConfirm, onCancel, deleting }: {
  survey: SurveyItem;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-xs w-full z-10">
      <button onClick={onCancel} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-all">
        <X size={14} />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trash2 size={16} className="text-rose-500" />
        </div>
        <p className="font-black text-slate-900 text-base">Delete survey?</p>
      </div>
      <p className="text-slate-700 text-sm font-semibold truncate mb-1">
        "{survey.surveyTitle || 'Untitled Survey'}"
      </p>
      <p className="text-slate-400 text-xs mb-6">This can't be undone.</p>
      <div className="flex gap-2">
        <button onClick={onCancel} disabled={deleting} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50">
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ✅ Compact Share Modal — fits screen without touching navbar
const ShareModal = ({ survey, onClose }: {
  survey: SurveyItem;
  onClose: () => void;
}) => {
  const surveyLink = `${window.location.origin}/take-survey/${survey._id}`;
  const [copied, setCopied] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(survey.isPasswordProtected || false);
  const [password, setPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("share-modal-qr") as SVGGraphicsElement;
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
      downloadLink.download = `${survey.surveyTitle || 'survey'}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleToggle = async () => {
    const newValue = !isPasswordProtected;
    setIsPasswordProtected(newValue);
    setPassword('');
    setPasswordSaved(false);
    if (!newValue) {
      try {
        await fetch(`http://localhost:5000/api/surveys/${survey._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPasswordProtected: false, password: '' })
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPasswordProtected: true, password })
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
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      {/* ✅ max-h + overflow-y-auto so it never overflows the screen */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 max-w-sm w-full z-10 max-h-[85vh] overflow-y-auto mt-16">

        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-all">
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Share2 size={14} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm">Share survey</p>
            <p className="text-slate-400 text-[10px] truncate max-w-[200px]">{survey.surveyTitle || 'Untitled Survey'}</p>
          </div>
        </div>

        {/* Password Protection */}
        <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-700">Password Protection</span>
            </div>
            <div
              onClick={handleToggle}
              className={`w-8 h-4 rounded-full relative cursor-pointer transition-all duration-200 ${isPasswordProtected ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isPasswordProtected ? 'left-4' : 'left-0.5'}`} />
            </div>
          </div>

          {isPasswordProtected && (
            <div className="flex gap-2 mt-2.5">
              <input
                type="password"
                placeholder={survey.isPasswordProtected ? "••••••••" : "Set a password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordSaved(false); }}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-400 transition-all"
              />
              <button
                onClick={handleSavePassword}
                disabled={!password || savingPassword}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-40 transition-all min-w-[52px]"
              >
                {passwordSaved ? '✓' : savingPassword ? '...' : 'Save'}
              </button>
            </div>
          )}

          {!isPasswordProtected && (
            <p className="text-[10px] text-slate-400 mt-1">Anyone with the link can access this.</p>
          )}
        </div>

        {/* Link */}
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1.5">Survey link</p>
        <div className="flex gap-2 mb-4">
          <input
            readOnly
            value={surveyLink}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-600 outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="bg-indigo-600 text-white px-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center min-w-[38px]"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>

        {/* QR Code — compact */}
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">QR code</p>
        <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="bg-white p-2 rounded-xl shadow-sm flex-shrink-0">
            <QRCodeSVG
              id="share-modal-qr"
              value={surveyLink}
              size={90}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 font-medium leading-snug">Scan to open survey on any device</p>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition-colors"
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
  const [activeTab, setActiveTab] = useState("All");
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<SurveyItem | null>(null);
  const [surveyToShare, setSurveyToShare] = useState<SurveyItem | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/surveys");
        const data = await response.json();
        setSurveys(data);
      } catch (err) {
        console.error("Failed to fetch surveys:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const handleCardClick = (survey: SurveyItem) => {
    if (survey.status === "Draft") {
      navigate("/add-questions", { state: { surveyId: survey._id } });
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
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!surveyToDelete) return;
    try {
      setDeletingSurveyId(surveyToDelete._id);
      const response = await fetch(
        `http://localhost:5000/api/surveys/${surveyToDelete._id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete");
      setSurveys((prev) => prev.filter((item) => item._id !== surveyToDelete._id));
      setShowDeleteModal(false);
      setSurveyToDelete(null);
    } catch (err) {
      console.error("Failed to delete survey:", err);
    } finally {
      setDeletingSurveyId(null);
    }
  };

  const filteredSurveys = surveys.filter((survey) => {
    if (activeTab === "All") return true;
    return survey.status === activeTab;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
        <p className="text-indigo-900 font-bold tracking-widest uppercase text-xs">Loading Workspace</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FDFDFD]">

      {showDeleteModal && surveyToDelete && (
        <DeleteConfirmModal
          survey={surveyToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowDeleteModal(false); setSurveyToDelete(null); }}
          deleting={deletingSurveyId === surveyToDelete._id}
        />
      )}
      {surveyToShare && (
        <ShareModal
          survey={surveyToShare}
          onClose={() => setSurveyToShare(null)}
        />
      )}

      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="flex max-w-[1200px] py-12 px-8 flex-col items-start gap-10 w-full">
        <div className="flex justify-between items-end w-full">
          <div>
            <h1 className="text-[#0F172A] text-5xl font-black tracking-tight mb-2">My Surveys</h1>
            <p className="text-[#64748B] text-base font-medium">Track performance and draft new insights.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/templates")}
              className="group h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-[#1E293B] text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1"
            >
              <ChevronLeft size={18} /> Back
            </button>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] self-end backdrop-blur-md border border-slate-200/50">
          {["All", "Running", "Draft", "Finished"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-[0.85rem] transition-all duration-300 ${
                activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 opacity-70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {filteredSurveys.map((survey) => {
            const isRunning = survey.status === "Running";
            const isDraft = survey.status === "Draft";

            return (
              <div
                key={survey._id}
                onClick={() => handleCardClick(survey)}
                className="group relative flex flex-col items-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer aspect-[3/4] overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                  isRunning ? "bg-emerald-400" : isDraft ? "bg-amber-400" : "bg-rose-400"
                }`} />

                <div className="flex justify-between items-center w-full mb-4">
                  <span className="text-slate-400 text-[10px] font-extrabold bg-slate-50 px-3 py-1 rounded-full">
                    {new Date(survey.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  <div className="flex items-center gap-1">
                    {isRunning && (
                      <button
                        type="button"
                        onClick={(e) => handleShareClick(e, survey)}
                        className="w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center"
                        title="Share survey"
                      >
                        <Share2 size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, survey)}
                      disabled={deletingSurveyId === survey._id}
                      className="w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Delete survey"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-grow text-center w-full">
                  <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                    isRunning ? "bg-emerald-50 text-emerald-500" :
                    isDraft ? "bg-amber-50 text-amber-500" :
                    "bg-rose-50 text-rose-500"
                  }`}>
                    {isRunning ? <Activity size={28} /> : isDraft ? <Clock size={28} /> : <CheckCircle2 size={28} />}
                  </div>
                  <h3 className="text-slate-800 font-black text-lg leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-indigo-600">
                    {survey.surveyTitle || "Untitled Survey"}
                  </h3>
                </div>

                <div className={`mt-6 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border-2 transition-all duration-500 ${
                  isRunning ? "text-emerald-600 border-emerald-100 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500" :
                  isDraft ? "text-amber-600 border-amber-100 bg-amber-50 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500" :
                  "text-rose-600 border-rose-100 bg-rose-50 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500"
                }`}>
                  {survey.status}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSurveys.length === 0 && (
          <div className="w-full py-32 text-center bg-slate-50 border-4 border-dashed border-slate-200/50 rounded-[3rem] flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-full shadow-md text-slate-300">
              <Layout size={40} />
            </div>
            <p className="text-slate-400 font-bold text-xl">No {activeTab.toLowerCase()} surveys found.</p>
          </div>
        )}
      </div>
    </div>
  );
}