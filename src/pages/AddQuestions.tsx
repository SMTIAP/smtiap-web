import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  GripVertical,
  Trash2,
  Settings2,
  Copy,
  Eye,
  ChevronDown,
  Type,
  List,
  CheckSquare,
  Star,
  Calendar,
  Hash,
  Layout,
  Save,
  ChevronRight,
  X,
  PlusCircle,
  FileText,
} from "lucide-react";

<<<<<<< HEAD
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
=======
// --- Calendar Component ---
const DatePickerCalendar = ({ value, onChange }) => {
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value) : new Date(),
  );
  const [showCalendar, setShowCalendar] = useState(false);

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
>>>>>>> origin/ai-analytics-intergration

  const days = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDateSelect = (day) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    onChange(selected.toISOString().split("T")[0]);
    setShowCalendar(false);
  };

<<<<<<< HEAD
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
=======
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full border-2 border-gray-100 rounded-lg p-2 focus:border-indigo-500 outline-none flex items-center gap-2 text-gray-700 hover:border-gray-300 transition-colors"
      >
        <Calendar size={18} />
        <span>{value || "Select date"}</span>
      </button>

      {showCalendar && (
        <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                  ),
                )
              }
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="rotate-90" size={18} />
            </button>
            <span className="font-semibold text-gray-900">{monthName}</span>
            <button
              type="button"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                  ),
                )
              }
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="-rotate-90" size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded transition-colors
                  ${!day ? "text-gray-300 cursor-default" : ""}
                  ${
                    day === new Date(value).getDate() &&
                    new Date(value).getMonth() === currentDate.getMonth() &&
                    new Date(value).getFullYear() === currentDate.getFullYear()
                      ? "bg-indigo-600 text-white font-bold"
                      : day
                        ? "hover:bg-indigo-50 text-gray-800"
                        : ""
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCalendar(false)}
            className="w-full mt-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200"
          >
            Close
          </button>
>>>>>>> origin/ai-analytics-intergration
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
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
=======
// --- Constants & Types ---
const QUESTION_TYPES = [
  {
    id: "short_text",
    label: "Short Text",
    icon: <Type size={18} />,
    defaultData: {
      label: "Untitled Question",
      placeholder: "Enter text here...",
    },
  },
  {
    id: "long_text",
    label: "Long Text",
    icon: <FileText size={18} />,
    defaultData: {
      label: "Untitled Question",
      placeholder: "Enter detailed response...",
    },
  },
  {
    id: "multiple_choice",
    label: "Multiple Choice",
    icon: <List size={18} />,
    defaultData: {
      label: "Untitled Question",
      options: ["Option 1", "Option 2"],
    },
  },
  {
    id: "checkboxes",
    label: "Checkboxes",
    icon: <CheckSquare size={18} />,
    defaultData: {
      label: "Untitled Question",
      options: ["Option 1", "Option 2"],
    },
  },
  {
    id: "rating",
    label: "Rating",
    icon: <Star size={18} />,
    defaultData: { label: "Rate this item", max: 5 },
  },
  {
    id: "number",
    label: "Number",
    icon: <Hash size={18} />,
    defaultData: { label: "Enter a number", min: 0, max: 100 },
  },
  {
    id: "date",
    label: "Date",
    icon: <Calendar size={18} />,
    defaultData: { label: "Select a date" },
  },
];

// --- QuestionCard Component (top-level to prevent remounting) ---
const QuestionCard = ({
  question,
  index,
  isPreview,
  selectedQuestionId,
  setSelectedQuestionId,
  moveQuestion,
  duplicateQuestion,
  deleteQuestion,
  totalQuestions,
}) => {
  const isActive = selectedQuestionId === question.id && !isPreview;

  return (
    <div
      onClick={() => !isPreview && setSelectedQuestionId(question.id)}
      className={`group relative bg-white rounded-xl border-2 transition-all duration-200 ${
        isActive
          ? "border-indigo-500 shadow-lg"
          : "border-gray-100 hover:border-gray-200 shadow-sm"
      } ${isPreview ? "p-6 mb-4" : "p-6 mb-4 cursor-pointer"}`}
    >
      {!isPreview && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <div className="bg-white border shadow-sm p-1 rounded-md text-gray-400">
            <GripVertical size={16} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </h3>
        </div>
        {!isPreview && isActive && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveQuestion(index, -1);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
              disabled={index === 0}
            >
              <ChevronDown className="rotate-180" size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveQuestion(index, 1);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
              disabled={index === totalQuestions - 1}
            >
              <ChevronDown size={16} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateQuestion(question.id);
              }}
              className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md text-gray-500"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteQuestion(question.id);
              }}
              className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md text-gray-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {(question.type === "short_text" || question.type === "long_text") && (
          <input
            type="text"
            placeholder={question.placeholder}
            disabled
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-400"
          />
        )}
        {(question.type === "multiple_choice" ||
          question.type === "checkboxes") && (
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 border border-gray-300 ${question.type === "multiple_choice" ? "rounded-full" : "rounded"}`}
                />
                <span className="text-gray-700">{opt}</span>
              </div>
            ))}
          </div>
        )}
        {question.type === "rating" && (
          <div className="flex gap-2">
            {[...Array(question.max)].map((_, i) => (
              <Star key={i} className="text-gray-300" size={24} />
            ))}
          </div>
        )}
        {question.type === "number" && (
          <input
            type="number"
            disabled
            className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-400 w-32"
          />
        )}
        {question.type === "date" && (
          <button className="flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg p-2 w-full hover:bg-indigo-100 transition-colors">
            <Calendar size={16} />
            <span className="text-sm font-medium">Click to select date</span>
          </button>
        )}
      </div>
    </div>
  );
};

// --- PropertyEditor Component (top-level to prevent remounting) ---
const PropertyEditor = ({
  selectedQuestion,
  updateQuestion,
  setSelectedQuestionId,
}) => {
  const [editLabel, setEditLabel] = useState(selectedQuestion?.label || "");
  const [editPlaceholder, setEditPlaceholder] = useState(
    selectedQuestion?.placeholder || "",
  );

  React.useEffect(() => {
    setEditLabel(selectedQuestion?.label || "");
    setEditPlaceholder(selectedQuestion?.placeholder || "");
  }, [selectedQuestion?.id]);

  if (!selectedQuestion) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <Settings2 size={48} className="mb-4 opacity-20" />
        <p>Select a question to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Properties</h2>
        <button
          onClick={() => setSelectedQuestionId(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Question Label
          </label>
          <input
            type="text"
            value={editLabel}
            onChange={(e) => {
              setEditLabel(e.target.value);
              updateQuestion(selectedQuestion.id, { label: e.target.value });
            }}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {(selectedQuestion.type === "short_text" ||
          selectedQuestion.type === "long_text") && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Placeholder
            </label>
            <input
              type="text"
              value={editPlaceholder}
              onChange={(e) => {
                setEditPlaceholder(e.target.value);
                updateQuestion(selectedQuestion.id, {
                  placeholder: e.target.value,
                });
              }}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}

        {(selectedQuestion.type === "multiple_choice" ||
          selectedQuestion.type === "checkboxes") && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Options
            </label>
            <div className="space-y-2">
              {selectedQuestion.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...selectedQuestion.options];
                      newOpts[i] = e.target.value;
                      updateQuestion(selectedQuestion.id, { options: newOpts });
                    }}
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const newOpts = selectedQuestion.options.filter(
                        (_, idx) => idx !== i,
                      );
                      updateQuestion(selectedQuestion.id, { options: newOpts });
                    }}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  updateQuestion(selectedQuestion.id, {
                    options: [
                      ...selectedQuestion.options,
                      `Option ${selectedQuestion.options.length + 1}`,
                    ],
                  });
                }}
                className="w-full mt-2 py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>
>>>>>>> origin/ai-analytics-intergration
          </div>
        )}

        {selectedQuestion.type === "rating" && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Max Stars
            </label>
            <input
              type="number"
              value={selectedQuestion.max}
              onChange={(e) =>
                updateQuestion(selectedQuestion.id, {
                  max: parseInt(e.target.value) || 5,
                })
              }
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">
              Required Field
            </span>
            <div
              onClick={() =>
                updateQuestion(selectedQuestion.id, {
                  required: !selectedQuestion.required,
                })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${selectedQuestion.required ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${selectedQuestion.required ? "translate-x-5" : ""}`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default function AddQuestions() {
  const [surveyTitle, setSurveyTitle] = useState("Survey creator");
  const [pages, setPages] = useState([
    { id: "page-1", title: "Page 1", questions: [] },
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedType, setDraggedType] = useState(null);
  const [responses, setResponses] = useState({});
  // --- Actions ---
  const addPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      questions: [],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const deletePage = (index) => {
    if (pages.length === 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    setActivePageIndex(Math.max(0, index - 1));
  };

  const addQuestion = (typeId) => {
    const typeDef = QUESTION_TYPES.find((t) => t.id === typeId);
    const newQuestion = {
      id: `q-${Date.now()}`,
      type: typeId,
      ...typeDef.defaultData,
      required: false,
    };

    const updatedPages = [...pages];
    updatedPages[activePageIndex].questions.push(newQuestion);
    setPages(updatedPages);
    setSelectedQuestionId(newQuestion.id);
  };

  const updateQuestion = (id, updates) => {
    const updatedPages = pages.map((page) => ({
      ...page,
      questions: page.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    }));
    setPages(updatedPages);
  };

  const deleteQuestion = (id) => {
    const updatedPages = pages.map((page) => ({
      ...page,
      questions: page.questions.filter((q) => q.id !== id),
    }));
    setPages(updatedPages);
    if (selectedQuestionId === id) setSelectedQuestionId(null);
  };

  const duplicateQuestion = (id) => {
    const questionToCopy = pages[activePageIndex].questions.find(
      (q) => q.id === id,
    );
    if (!questionToCopy) return;

    const newQuestion = { ...questionToCopy, id: `q-${Date.now()}` };
    const updatedPages = [...pages];
    const index = updatedPages[activePageIndex].questions.findIndex(
      (q) => q.id === id,
    );
    updatedPages[activePageIndex].questions.splice(index + 1, 0, newQuestion);
    setPages(updatedPages);
  };

  const moveQuestion = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pages[activePageIndex].questions.length)
      return;

    const updatedQuestions = [...pages[activePageIndex].questions];
    const [moved] = updatedQuestions.splice(index, 1);
    updatedQuestions.splice(newIndex, 0, moved);

    const updatedPages = [...pages];
    updatedPages[activePageIndex].questions = updatedQuestions;
    setPages(updatedPages);
  };

  // --- Helpers ---
  const activePage = pages[activePageIndex];
  const selectedQuestion =
    activePage.questions.find((q) => q.id === selectedQuestionId) ||
    pages.flatMap((p) => p.questions).find((q) => q.id === selectedQuestionId);

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-gray-800 overflow-hidden font-sans">
      {/* Sidebar - Question Elements */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          
          <p className="text-xs text-gray-500">Drag or click to add elements</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 mb-3">
              Essentials
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addQuestion(type.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50 transition-all text-left text-gray-700 hover:text-indigo-700 font-medium group"
                >
                  <span className="p-2 bg-gray-50 group-hover:bg-white rounded-lg transition-colors shadow-sm">
                    {type.icon}
                  </span>
                  {type.label}
                  <PlusCircle
                    size={14}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 mb-3">
              Pages
            </h3>
            <div className="space-y-1">
              {pages.map((page, idx) => (
                <div
                  key={page.id}
                  onClick={() => setActivePageIndex(idx)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${activePageIndex === idx ? "bg-indigo-50 text-indigo-700 font-semibold" : "hover:bg-gray-50 text-gray-600"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${activePageIndex === idx ? "bg-indigo-600" : "bg-transparent"}`}
                  />
                  <span className="truncate flex-1">{page.title}</span>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPage}
                className="w-full flex items-center gap-2 p-2 text-indigo-600 text-sm hover:bg-indigo-50 rounded-lg transition-colors mt-2"
              >
                <Plus size={16} /> Add Page
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-sm transition-all">
            <Save size={16} /> Save Draft
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-0">
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-1/2"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isPreviewMode
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Eye size={16} />
              {isPreviewMode ? "Exit Preview" : "Preview"}
            </button>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
              Publish
            </button>
          </div>
        </header>

        {/* Builder Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto py-12 px-6">
            {!isPreviewMode ? (
              <div className="space-y-4">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    {activePage.title}
                  </span>
                  <input
                    type="text"
                    value={activePage.title}
                    onChange={(e) => {
                      const updatedPages = [...pages];
                      updatedPages[activePageIndex].title = e.target.value;
                      setPages(updatedPages);
                    }}
                    className="block text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-gray-300"
                    placeholder="Page Title"
                  />
                </div>

                {activePage.questions.length === 0 ? (
                  <div className="border-4 border-dashed border-gray-100 rounded-3xl p-20 flex flex-col items-center justify-center text-gray-400">
                    <Plus size={48} className="mb-4 opacity-10" />
                    <p className="text-lg font-medium opacity-40">
                      Your survey is empty
                    </p>
                    <p className="text-sm opacity-30">
                      Add elements from the left sidebar to begin
                    </p>
                  </div>
                ) : (
                  activePage.questions.map((q, idx) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={idx}
                      isPreview={false}
                      selectedQuestionId={selectedQuestionId}
                      setSelectedQuestionId={setSelectedQuestionId}
                      moveQuestion={moveQuestion}
                      duplicateQuestion={duplicateQuestion}
                      deleteQuestion={deleteQuestion}
                      totalQuestions={activePage.questions.length}
                    />
                  ))
                )}

                <div className="pt-8 flex justify-center">
                  <button
                    onClick={() => addQuestion("multiple_choice")}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 rounded-2xl transition-all"
                  >
                    <Plus size={20} /> Add new question
                  </button>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="h-2 bg-indigo-600" />
                <div className="p-10 flex-1">
                  <h1 className="text-2xl font-bold mb-2">{surveyTitle}</h1>
                  <p className="text-gray-500 mb-8">{activePage.title}</p>

                  <div className="space-y-8">
                    {activePage.questions.map((q, idx) => (
                      <div key={q.id}>
                        <div className="flex gap-2 mb-3">
                          <span className="text-indigo-600 font-bold">
                            {idx + 1}.
                          </span>
                          <h3 className="font-semibold text-gray-800">
                            {q.label}{" "}
                            {q.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </h3>
                        </div>
                        <div className="pl-6">
                          {q.type === "short_text" && (
                            <input
                              type="text"
                              className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none pb-2 transition-colors"
                              placeholder={q.placeholder}
                            />
                          )}
                          {q.type === "long_text" && (
                            <textarea
                              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-indigo-500 outline-none min-h-[100px] transition-colors"
                              placeholder={q.placeholder}
                            />
                          )}
                          {(q.type === "multiple_choice" ||
                            q.type === "checkboxes") && (
                            <div className="space-y-3">
                              {q.options.map((opt, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-3 cursor-pointer group"
                                >
                                  <input
                                    type={
                                      q.type === "multiple_choice"
                                        ? "radio"
                                        : "checkbox"
                                    }
                                    name={q.id}
                                    className={`w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${q.type === "multiple_choice" ? "rounded-full" : "rounded"}`}
                                  />
                                  <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">
                                    {opt}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                          {q.type === "rating" && (
                            <div className="flex gap-2">
                              {[...Array(q.max)].map((_, i) => (
                                <button
                                  key={i}
                                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                                >
                                  <Star size={32} />
                                </button>
                              ))}
                            </div>
                          )}
                          {q.type === "number" && (
                            <input
                              type="number"
                              className="border-2 border-gray-100 rounded-lg p-2 focus:border-indigo-500 outline-none w-32"
                            />
                          )}
                          {q.type === "date" && (
                            <DatePickerCalendar
                              value={responses[q.id] || ""}
                              onChange={(date) =>
                                setResponses({ ...responses, [q.id]: date })
                              }
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                  <div className="flex gap-2">
                    {pages.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${activePageIndex === i ? "bg-indigo-600" : "bg-gray-300"}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {activePageIndex > 0 && (
                      <button
                        onClick={() => setActivePageIndex(activePageIndex - 1)}
                        className="px-6 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-white transition-all"
                      >
                        Back
                      </button>
                    )}
                    {activePageIndex < pages.length - 1 ? (
                      <button
                        onClick={() => setActivePageIndex(activePageIndex + 1)}
                        className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button className="px-8 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg shadow-green-100 transition-all">
                        Submit Survey
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Properties */}
      {!isPreviewMode && (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm overflow-y-auto">
          <PropertyEditor
            selectedQuestion={selectedQuestion}
            updateQuestion={updateQuestion}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        </aside>
      )}

      {/* Global CSS for scrollbar and styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
