import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type QuestionType = 'multiple-choice' | 'checkbox' | 'short-answer' | 'rating' | 'dropdown' | 'date' | 'matrix' | 'file-upload';

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  isRequired: boolean;
  isLogicEnabled: boolean;
  ratingMax?: number;
  ratingLow?: string;
  ratingHigh?: string;
  dateFormat?: string;
  fileMaxSize?: string;
  fileType?: string;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple choice',
  'checkbox': 'Checkboxes',
  'short-answer': 'Short answer',
  'rating': 'Rating scale',
  'dropdown': 'Dropdown',
  'date': 'Date / time',
  'matrix': 'Matrix / grid',
  'file-upload': 'File upload',
};

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'multiple-choice', label: 'Multiple choice',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>
  },
  {
    type: 'checkbox', label: 'Checkboxes',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 12l3 3 7-7" strokeLinecap="round"/></svg>
  },
  {
    type: 'short-answer', label: 'Short answer',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10" strokeLinecap="round"/></svg>
  },
  {
    type: 'rating', label: 'Rating scale',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  },
  {
    type: 'dropdown', label: 'Dropdown',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 11l4 4 4-4" strokeLinecap="round"/></svg>
  },
  {
    type: 'date', label: 'Date / time',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
  },
  {
    type: 'matrix', label: 'Matrix / grid',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18" strokeLinecap="round"/></svg>
  },
  {
    type: 'file-upload', label: 'File upload',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round"/></svg>
  },
];

export default function AddQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state?.formData || {};

  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['Option A', 'Option B', 'Option C']);
  const [isRequired, setIsRequired] = useState(true);
  const [conditionalLogic, setConditionalLogic] = useState(false);
  const [ratingMax, setRatingMax] = useState(7);
  const [ratingLow, setRatingLow] = useState('');
  const [ratingHigh, setRatingHigh] = useState('');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [fileType, setFileType] = useState('Any file type');
  const [fileMaxSize, setFileMaxSize] = useState('Max 5 MB');
  const [questions, setQuestions] = useState<Question[]>([]);

  const hasOptions = questionType === 'multiple-choice' || questionType === 'checkbox' || questionType === 'dropdown';

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions([...options, `Option ${nextLetter}`]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert('Please enter a question.');
      return;
    }
    const newQ: Question = {
      id: Date.now(),
      type: questionType,
      text: questionText,
      options: hasOptions ? options : [],
      isRequired,
      isLogicEnabled: conditionalLogic,
      ratingMax,
      ratingLow,
      ratingHigh,
      dateFormat,
      fileType,
      fileMaxSize,
    };
    setQuestions([...questions, newQ]);
    setQuestionText('');
    setOptions(['Option A', 'Option B', 'Option C']);
    setConditionalLogic(false);
    setIsRequired(true);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleNext = () => {
    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }
    navigate('/review-publish', {
      state: {
        surveyData: { ...previousData, totalQuestions: questions.length },
        questionData: questions[0],
        allQuestions: questions,
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[760px] py-10 px-6 flex-col gap-6 w-full">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EAF3DE] border border-[#639922] text-[#27500A] text-[10px] font-medium flex items-center justify-center">✓</div>
            <span className="text-[11px] text-[#64748B]">Survey details</span>
          </div>
          <div className="w-8 h-px bg-[#E2E8F0] mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#6366F1] text-white text-[10px] font-medium flex items-center justify-center">2</div>
            <span className="text-[11px] text-[#6366F1] font-medium">Add questions</span>
          </div>
          <div className="w-8 h-px bg-[#E2E8F0] mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-[#E2E8F0] text-[#94A3B8] text-[10px] font-medium flex items-center justify-center">3</div>
            <span className="text-[11px] text-[#94A3B8]">Review & publish</span>
          </div>
        </div>

        {/* Questions added list */}
        {questions.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Questions added ({questions.length})</p>
            <div className="flex flex-col gap-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
                  <div className="w-5 h-5 rounded-full bg-[#EEEDFE] text-[#534AB7] text-[10px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] truncate">{q.text}</p>
                    <p className="text-[11px] text-[#64748B]">{TYPE_LABELS[q.type]}{q.isRequired ? ' · Required' : ''}</p>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="text-[#94A3B8] hover:text-red-500 transition-colors text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8">
          <p className="text-lg font-medium text-[#1E293B] mb-1">Add questions</p>
          <p className="text-sm text-[#64748B] mb-6 pb-5 border-b border-[#F1F5F9]">Select a type, write your question, then click "Add question".</p>

          {/* Question type grid */}
          <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Question type</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {QUESTION_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setQuestionType(type)}
                className={`flex flex-col items-center gap-1.5 p-3 border rounded-lg text-[11px] transition-all ${
                  questionType === type
                    ? 'border-[#6366F1] bg-[#EEEDFE] text-[#534AB7] font-medium'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#6366F1] hover:text-[#6366F1]'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Question text */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Question text</p>
              <button
                onClick={() => setIsRequired(!isRequired)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                  isRequired
                    ? 'bg-[#FBEAF0] text-[#993556] border-[#ED93B1]'
                    : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                }`}
              >
                {isRequired ? 'Required' : 'Optional'}
              </button>
            </div>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            />
          </div>

          {/* Multiple choice / Checkbox / Dropdown options */}
          {hasOptions && (
            <div className="mb-5">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Answer options</p>
              <div className="flex flex-col gap-2">
                {options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
                    {questionType === 'multiple-choice' && <div className="w-3.5 h-3.5 rounded-full border border-[#CBD5E1] flex-shrink-0" />}
                    {questionType === 'checkbox' && <div className="w-3.5 h-3.5 rounded border border-[#CBD5E1] flex-shrink-0" />}
                    {questionType === 'dropdown' && <span className="text-[11px] text-[#94A3B8] min-w-[16px]">{idx + 1}</span>}
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="bg-transparent text-sm text-[#1E293B] focus:outline-none flex-1"
                    />
                    <button onClick={() => removeOption(idx)} className="text-[#94A3B8] hover:text-red-500 transition-colors">×</button>
                  </div>
                ))}
              </div>
              <button onClick={addOption} className="mt-2 text-[#6366F1] text-xs font-medium hover:underline">
                + Add option
              </button>
            </div>
          )}

          {/* Rating */}
          {questionType === 'rating' && (
            <div className="mb-5">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Scale settings</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                {Array.from({ length: ratingMax }, (_, i) => (
                  <div key={i} className="w-8 h-8 border border-[#E2E8F0] rounded-lg flex items-center justify-center text-xs text-[#64748B] bg-[#F8FAFC]">{i + 1}</div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#64748B]">Max:</label>
                  <select value={ratingMax} onChange={(e) => setRatingMax(Number(e.target.value))} className="p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none">
                    <option value={5}>5</option>
                    <option value={7}>7</option>
                    <option value={10}>10</option>
                  </select>
                </div>
                <input type="text" value={ratingLow} onChange={(e) => setRatingLow(e.target.value)} placeholder="Low label (e.g. Not at all)" className="flex-1 min-w-[130px] p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#6366F1]" />
                <input type="text" value={ratingHigh} onChange={(e) => setRatingHigh(e.target.value)} placeholder="High label (e.g. Extremely)" className="flex-1 min-w-[130px] p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#6366F1]" />
              </div>
            </div>
          )}

          {/* Date/time */}
          {questionType === 'date' && (
            <div className="mb-5">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Date / time settings</p>
              <div className="flex gap-3">
                <select className="flex-1 p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none">
                  <option>Date only</option>
                  <option>Time only</option>
                  <option>Date and time</option>
                </select>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="flex-1 p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}

          {/* Matrix */}
          {questionType === 'matrix' && (
            <div className="mb-5">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Matrix preview</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-[#E2E8F0] bg-[#F8FAFC] text-left"></th>
                      {['Strongly agree', 'Agree', 'Neutral', 'Disagree'].map(c => (
                        <th key={c} className="p-2 border border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] font-medium">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Row 1', 'Row 2', 'Row 3'].map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 border border-[#E2E8F0] text-[#64748B]">{r}</td>
                        {[0, 1, 2, 3].map(j => (
                          <td key={j} className="p-2 border border-[#E2E8F0] text-center"><input type="radio" name={`row${i}`} disabled /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* File upload */}
          {questionType === 'file-upload' && (
            <div className="mb-5">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-3">Upload settings</p>
              <div className="flex gap-3">
                <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="flex-1 p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none">
                  <option>Any file type</option>
                  <option>Images only</option>
                  <option>PDF only</option>
                  <option>Documents</option>
                </select>
                <select value={fileMaxSize} onChange={(e) => setFileMaxSize(e.target.value)} className="flex-1 p-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] focus:outline-none">
                  <option>Max 5 MB</option>
                  <option>Max 10 MB</option>
                  <option>Max 25 MB</option>
                </select>
              </div>
            </div>
          )}

          {/* Short answer */}
          {questionType === 'short-answer' && (
            <div className="mb-5 p-4 border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-center">
              <p className="text-sm text-[#64748B]">Respondents will type their answer in a free-text field.</p>
            </div>
          )}

          {/* Conditional logic */}
          <div className="border-t border-[#F1F5F9] pt-4 mt-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-[#1E293B] font-medium">Conditional logic</p>
                <p className="text-[11px] text-[#64748B]">Show or skip questions based on answers</p>
              </div>
              <div
                onClick={() => setConditionalLogic(!conditionalLogic)}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-all ${conditionalLogic ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${conditionalLogic ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {conditionalLogic && hasOptions && (
              <div className="mt-3 p-4 bg-[#EEEDFE] border border-[#AFA9EC] rounded-xl">
                <p className="text-[10px] font-medium text-[#534AB7] uppercase tracking-wider mb-3">Logic rules</p>
                <div className="flex flex-col gap-2">
                  {options.map((option, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 text-xs bg-white p-3 rounded-lg border border-[#AFA9EC]">
                      <span className="text-[#64748B]">If answer is</span>
                      <span className="bg-[#534AB7] text-white px-2 py-0.5 rounded-full text-[10px] font-medium">{option || `Option ${idx + 1}`}</span>
                      <span className="text-[#64748B]">then</span>
                      <select className="flex-1 min-w-[140px] border border-[#AFA9EC] rounded p-1.5 text-[11px] bg-[#F8FAFC] focus:outline-none text-[#534AB7]">
                        <option>Go to next question</option>
                        <option>Skip to question...</option>
                        <option>End survey</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#F1F5F9]">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#64748B] text-sm hover:text-[#1E293B] transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 border border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] rounded-lg text-xs font-medium hover:bg-[#E2E8F0] transition-colors"
              >
                + Add question
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#6366F1] text-white px-5 py-2 rounded-lg text-xs font-medium hover:opacity-90 shadow-sm"
              >
                Review & publish
                <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}