import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SurveyFormData {
  customizeBranding: boolean;
  logo: string | null;
  websiteUrl: string;
  themeColor: string;
  surveyTitle: string;
  description: string;
  isAnonymous: boolean;
}

export default function CreateNewSurvey() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SurveyFormData>({
    customizeBranding: false,
    logo: null,
    websiteUrl: '',
    themeColor: '#6366F1',
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
    if (file) setFormData((prev) => ({ ...prev, logo: file.name }));
  };

  const handleNext = () => {
    if (!formData.surveyTitle.trim()) {
      alert('Please enter a survey title.');
      return;
    }
    navigate('/add-questions', { state: { formData } });
  };

  const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[760px] py-10 px-6 flex-col gap-6 w-full">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#6366F1] text-white text-[10px] font-medium flex items-center justify-center">1</div>
            <span className="text-[11px] text-[#6366F1] font-medium">Survey details</span>
          </div>
          <div className="w-8 h-px bg-[#E2E8F0] mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-[#E2E8F0] text-[#94A3B8] text-[10px] font-medium flex items-center justify-center">2</div>
            <span className="text-[11px] text-[#94A3B8]">Add questions</span>
          </div>
          <div className="w-8 h-px bg-[#E2E8F0] mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-[#E2E8F0] text-[#94A3B8] text-[10px] font-medium flex items-center justify-center">3</div>
            <span className="text-[11px] text-[#94A3B8]">Review & publish</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col gap-6">
          <div>
            <p className="text-lg font-medium text-[#1E293B] mb-1">Create new survey</p>
            <p className="text-sm text-[#64748B] pb-5 border-b border-[#F1F5F9]">Set up your survey branding and basic details.</p>
          </div>

          {/* Survey title */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
              Survey title <span className="text-red-400">*</span>
            </label>
            <input
              name="surveyTitle"
              type="text"
              value={formData.surveyTitle}
              onChange={handleChange}
              placeholder="e.g. Customer satisfaction survey"
              className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
              Description <span className="text-[#94A3B8] normal-case text-[10px]">(optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the purpose of this survey..."
              rows={3}
              className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-[#6366F1] resize-none"
            />
          </div>

          {/* Branding section */}
          <div className="flex flex-col gap-4 border-t border-[#F1F5F9] pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-[#1E293B]">Customize branding</p>
                <p className="text-[11px] text-[#64748B]">Add your company logo, colors and website URL</p>
              </div>
              <div
                onClick={() => toggleField('customizeBranding')}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-all ${formData.customizeBranding ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${formData.customizeBranding ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {formData.customizeBranding && (
              <div className="flex flex-col gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">

                {/* Logo upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Company logo</label>
                  <label className="flex items-center gap-4 p-4 border border-dashed border-[#CBD5E1] rounded-lg bg-white cursor-pointer hover:border-[#6366F1] transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="w-10 h-10 rounded-lg bg-[#EEEDFE] flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" fill="none" stroke="#6366F1" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">{formData.logo || 'Upload company logo'}</p>
                      <p className="text-[11px] text-[#64748B]">PNG, JPG up to 2MB</p>
                    </div>
                  </label>
                </div>

                {/* Website URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Website URL</label>
                  <input
                    name="websiteUrl"
                    type="text"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                    className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                  />
                </div>

                {/* Theme color */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Theme color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData((prev) => ({ ...prev, themeColor: color }))}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-lg transition-all ${formData.themeColor === color ? 'ring-2 ring-offset-2 ring-[#6366F1]' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                    <label className="w-8 h-8 rounded-lg border border-dashed border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#6366F1]" title="Custom color">
                      <input type="color" className="hidden" value={formData.themeColor} onChange={(e) => setFormData((prev) => ({ ...prev, themeColor: e.target.value }))} />
                      <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anonymous toggle */}
          <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-4">
            <div>
              <p className="text-sm font-medium text-[#1E293B]">Anonymous responses</p>
              <p className="text-[11px] text-[#64748B]">Don't collect respondent identity</p>
            </div>
            <div
              onClick={() => toggleField('isAnonymous')}
              className={`w-9 h-5 rounded-full relative cursor-pointer transition-all ${formData.isAnonymous ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${formData.isAnonymous ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-[#F1F5F9]">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#64748B] text-sm hover:text-[#1E293B] transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <button onClick={handleNext} className="flex items-center gap-2 bg-[#6366F1] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm">
              Next: add questions
              <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}