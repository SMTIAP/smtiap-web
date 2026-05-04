import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, Share2, ChevronLeft } from 'lucide-react';

export default function ShareSurvey() {
  const location = useLocation();
  const navigate = useNavigate();
  const { surveyId, surveyTitle } = location.state || {};
  
  // The public URL where respondents will take the survey
  const surveyLink = `${window.location.origin}/take-survey/${surveyId}`;
  const [copied, setCopied] = useState(false);

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
      downloadLink.download = `${surveyTitle || 'survey'}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="flex justify-start mb-6">
           <button onClick={() => navigate('/created-surveys')} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 transition-colors text-sm font-medium">
             <ChevronLeft size={18}/> Back to Dashboard
           </button>
        </div>

        <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <Share2 size={32} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Survey Published!</h1>
        <p className="text-slate-500 text-sm mb-8">Your survey is now live and ready to collect responses.</p>

        <div className="mb-10 text-left">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 block">Unique Survey Link</label>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={surveyLink}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center min-w-[54px]"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center bg-slate-50 rounded-3xl p-8 border border-slate-100">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6">Scan to Participate</label>
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
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors"
          >
            <Download size={18} /> Download QR Code (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}