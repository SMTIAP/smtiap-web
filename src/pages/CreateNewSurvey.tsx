import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateNewSurvey() {
  const navigate = useNavigate();

  interface SurveyFormData {
    customizeBranding: boolean;
    logo: string | null;
    websiteUrl: string;
    themeColor: string;
    surveyTitle: string;
    description: string;
    isAnonymous: boolean;
  }

  const [formData, setFormData] = useState<SurveyFormData>({
    customizeBranding: false,
    logo: null,
    websiteUrl: '',
    themeColor: '#EFF6FF',
    surveyTitle: '',
    description: '',
    isAnonymous: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleField = (field: keyof SurveyFormData) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file.name }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[800px] py-10 px-6 flex-col gap-8 w-full">
        <div className="flex justify-end w-full">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#64748B] text-sm font-medium hover:text-[#1E293B]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <h1 className="text-[#1E293B] text-3xl font-bold">Create New Survey</h1>
          <p className="text-[#64748B] text-sm">Configure your survey branding and basic details.</p>
        </div>

        <div className="flex flex-col gap-10 bg-white p-10 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-4">
              <h2 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider">Customize Branding</h2>
              <div onClick={() => toggleField('customizeBranding')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${formData.customizeBranding ? 'bg-blue-600' : 'bg-[#E2E8F0]'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.customizeBranding ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-lg p-10 bg-[#F8FAFC] gap-3 cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <p className="text-[#1E293B] font-bold text-sm">{formData.logo || "Add Company Logo"}</p>
              <span className="mt-2 px-6 py-2 bg-[#E2E8F0] text-[#1E293B] text-xs font-bold rounded-md">Upload</span>
            </label>

            <div className="grid grid-cols-1 gap-6 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-[#1E293B] text-xs font-bold uppercase">Website URL</label>
                <input name="websiteUrl" type="text" value={formData.websiteUrl} onChange={handleChange} placeholder="https://example.com" className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6 text-left">
            <h2 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider border-b border-[#F1F5F9] pb-4">Survey Details</h2>
            <div className="flex flex-col gap-2">
              <label className="text-[#1E293B] text-xs font-bold uppercase">Survey Title</label>
              <input name="surveyTitle" type="text" value={formData.surveyTitle} onChange={handleChange} placeholder="Enter survey title" className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
          </section>

          <div className="flex justify-end mt-4">
            <button 
              onClick={() => navigate('/add-questions', { state: { formData } })} // CRITICAL: This passes the data
              className="flex items-center gap-2 bg-[#6366F1] text-white px-6 py-3 rounded-lg font-bold text-xs hover:opacity-90 shadow-md"
            >
              Next: Add Questions
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}