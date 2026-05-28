import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, Copy, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ScheduledSurveyPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const survey = location.state?.survey;
  
  const [copied, setCopied] = useState(false);

  if (!survey) {
    navigate("/created-surveys");
    return null;
  }

  const openDate = survey.scheduledOpen ? new Date(survey.scheduledOpen) : null;
  const surveyLink = `${window.location.origin}/take-survey/${survey._id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(surveyLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6px)] px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          
          {/* Icon */}
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} className="text-purple-500" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {survey.surveyTitle || "Untitled Survey"}
          </h1>
          
          {/* Status Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-6">
            Scheduled
          </div>
          
          {/* Message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
            <p className="text-amber-800 dark:text-amber-300 font-medium">
              This survey has not started yet.
            </p>
            {openDate && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                It will be available on:
              </p>
            )}
            {openDate && (
              <p className="text-lg font-bold text-amber-800 dark:text-amber-300 mt-1">
                {openDate.toLocaleDateString()} at {openDate.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          {/* Share Link Section */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              You can share the link now. Respondents will see this message until the survey opens.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={surveyLink}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          
          {/* Back Button */}
          <button
            onClick={() => navigate("/created-surveys")}
            className="mt-6 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all w-full py-2 border border-slate-200 dark:border-slate-600 rounded-lg"
          >
            <ArrowLeft size={16} />
            Back to My Surveys
          </button>
        </div>
      </div>
    </div>
  );
}