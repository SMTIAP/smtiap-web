import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Download, Share2, ChevronLeft, Lock } from "lucide-react";

export default function ShareSurvey() {
  const location = useLocation();
  const navigate = useNavigate();
  const { surveyId, surveyTitle } = location.state || {};

  const surveyLink = `${window.location.origin}/take-survey/${surveyId}`;
  const [copied, setCopied] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("survey-qr") as SVGGraphicsElement;
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
      downloadLink.download = `${surveyTitle || "survey"}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const handleToggle = async () => {
    const newValue = !isPasswordProtected;
    setIsPasswordProtected(newValue);
    setPasswordSaved(false);
    setPassword("");
    if (!newValue && surveyId) {
      try {
        await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
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
    if (!surveyId || !password) return;
    setSavingPassword(true);
    try {
      await fetch(`http://localhost:5000/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isPasswordProtected: true, password }),
      });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save password settings:", err);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] py-12 px-6 font-sans transition-colors duration-300">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 p-10 text-center transition-colors duration-300">
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate("/created-surveys")}
            className="flex items-center gap-2 text-gray-400 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
          <Share2 size={32} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Survey Published!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          Share the link or download the QR code to start collecting responses.
        </p>

        {/* Password Protection */}
        <div className="mb-6 text-left bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Password Protection
              </span>
            </div>
            <div
              onClick={handleToggle}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200 ${isPasswordProtected ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-600"}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isPasswordProtected ? "left-6" : "left-1"}`}
              />
            </div>
          </div>
          {isPasswordProtected && (
            <div className="flex gap-2 mt-4">
              <input
                type="password"
                placeholder="Set a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordSaved(false);
                }}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all dark:text-white"
              />
              <button
                onClick={handleSavePassword}
                disabled={!password || savingPassword}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-all min-w-[70px]"
              >
                {passwordSaved ? "✓ Saved" : savingPassword ? "..." : "Save"}
              </button>
            </div>
          )}
          {!isPasswordProtected && (
            <p className="text-xs text-slate-400 mt-2">
              Anyone with the link can access this survey.
            </p>
          )}
        </div>

        {/* Survey Link */}
        <div className="mb-8 text-left">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 block">
            Unique Survey Link
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={surveyLink}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center min-w-[54px]"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6">
            Download & Share Survey
          </label>
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
            <QRCodeSVG
              id="survey-qr"
              value={surveyLink}
              size={180}
              level={"H"}
              includeMargin={true}
            />
          </div>
          <button
            onClick={downloadQR}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:text-indigo-800 transition-colors"
          >
            <Download size={18} /> Download QR Code (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}
