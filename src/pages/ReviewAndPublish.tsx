import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReviewAndPublish() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const surveyTitle = location.state?.surveyData?.surveyTitle || "Untitled Survey";
  const questionText = location.state?.questionData?.text || "No question entered";
  const options = location.state?.questionData?.options || [];

  // Helper function to handle both Draft and Publish actions
  const handleFinalize = (status: "Running" | "Draft") => {
    navigate('/created-surveys', { 
      state: { 
        newSurvey: {
          id: Date.now(),
          date: new Date().toLocaleDateString('en-GB'),
          title: surveyTitle,
          status: status
        } 
      } 
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[900px] py-10 px-6 flex-col gap-6 w-full text-left">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#64748B] text-sm font-medium hover:text-[#1E293B]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        <div className="bg-white p-12 rounded-xl shadow-sm border border-[#E2E8F0]">
          <h1 className="text-[#1E293B] text-2xl font-bold mb-2">Review & Publish</h1>
          <p className="text-[#64748B] text-sm mb-10">Review your survey details before making it live.</p>

          <div className="flex flex-col gap-6 text-sm mb-10">
            <div className="flex justify-between items-center border-b border-[#F1F5F9] py-3">
              <span className="text-[#64748B]">Survey Name</span>
              <span className="text-[#1E293B] font-bold text-lg">{surveyTitle}</span>
            </div>
          </div>

          <div className="p-6 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] mb-10">
            <p className="text-[#1E293B] font-bold mb-4 text-sm">{questionText}</p>
            <div className="flex flex-col gap-3">
              {options.map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-[#E2E8F0] rounded-md text-xs text-[#64748B]">
                  <div className="w-3 h-3 rounded-full border border-[#CBD5E1]" /> {opt}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {/* SAVE AS DRAFT BUTTON */}
            <button 
              onClick={() => handleFinalize("Draft")}
              className="px-6 py-2.5 bg-[#E2E8F0] text-[#1E293B] rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Save as draft
            </button>
            
            {/* PUBLISH NOW BUTTON */}
            <button 
              onClick={() => handleFinalize("Running")}
              className="px-6 py-2.5 bg-[#22C55E] text-white rounded-lg font-bold text-xs hover:bg-[#16A34A] shadow-md transition-colors"
            >
              Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}