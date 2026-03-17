import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AddQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pulling branding/details from the previous page to keep it in state
  const previousData = location.state?.formData || {};

  const [questionType, setQuestionType] = useState('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['Option A', 'Option B']);
  const [conditionalLogic, setConditionalLogic] = useState(false);

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions([...options, `Option ${nextLetter}`]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const hasOptions = questionType === 'multiple-choice' || questionType === 'checkbox';

  const handleNext = () => {
    // Navigating to review page and passing ALL gathered data
    navigate('/review-publish', { 
      state: { 
        surveyData: {
          ...previousData,
          totalQuestions: 1 // You can make this dynamic later
        },
        questionData: {
          type: questionType,
          text: questionText,
          options: options
        }
      } 
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[800px] py-10 px-6 flex-col gap-8 w-full">
        
        {/* Header Section */}
        <div className="flex justify-end w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[#64748B] text-sm font-medium hover:text-[#1E293B] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <h1 className="text-[#1E293B] text-3xl font-bold">Add Questions</h1>
          <p className="text-[#64748B] text-sm">Build your survey by adding different question types.</p>
        </div>

        <div className="flex flex-col gap-10 bg-white p-10 rounded-2xl shadow-sm border border-[#E2E8F0]">
          
          <section className="flex flex-col gap-6">
            <h2 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider border-b border-[#F1F5F9] pb-4">New Question</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-[#1E293B] text-xs font-bold uppercase">Question Type</label>
              <select 
                value={questionType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuestionType(e.target.value)}
                className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="checkbox">Checkboxes</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#1E293B] text-xs font-bold uppercase">Question Text</label>
              <input 
                type="text" 
                value={questionText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionText(e.target.value)}
                placeholder="What would you like to ask?" 
                className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </section>

          {hasOptions ? (
            <section className="flex flex-col gap-4 animate-in fade-in duration-300">
              <h3 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider">Answer Options</h3>
              
              {options.map((option, idx) => (
                <div key={idx} className="flex items-center justify-between border border-[#E2E8F0] p-3 rounded-lg bg-[#F8FAFC]">
                  <div className="flex items-center gap-3 w-full">
                    <input 
                      type={questionType === 'multiple-choice' ? 'radio' : 'checkbox'} 
                      disabled 
                      className="w-4 h-4 rounded border-[#CBD5E1]" 
                    />
                    <input 
                      type="text"
                      value={option}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newOptions = [...options];
                        newOptions[idx] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="bg-transparent text-sm text-[#1E293B] focus:outline-none w-full"
                    />
                  </div>
                  <button 
                    onClick={() => removeOption(idx)}
                    className="text-[#64748B] hover:text-red-500 transition-colors"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}

              <button onClick={addOption} className="text-[#6366F1] text-xs font-bold self-start hover:underline">
                + Add Option
              </button>
            </section>
          ) : (
            <div className="p-8 border-2 border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-center">
              <p className="text-sm text-[#64748B]">Respondents will see a text field for their answer.</p>
            </div>
          )}

          <section className="flex flex-col gap-6">
            <h2 className="text-[#1E293B] text-sm font-bold uppercase tracking-wider border-b border-[#F1F5F9] pb-4">Settings</h2>
            <div className="flex justify-between items-center py-2 bg-[#F8FAFC] px-4 rounded-lg">
              <span className="text-[#64748B] text-sm">Conditional Logic</span>
              <div 
                onClick={() => setConditionalLogic(!conditionalLogic)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${conditionalLogic ? 'bg-blue-600' : 'bg-[#E2E8F0]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${conditionalLogic ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </section>

          <div className="flex justify-end mt-4">
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#6366F1] text-white px-8 py-3 rounded-lg font-bold text-xs hover:opacity-90 transition-all shadow-md"
            >
              Next: Review & Publish
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}