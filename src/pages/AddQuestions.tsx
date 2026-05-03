import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom'; // Added for navigation state
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
        </div>
      )}
    </div>
  );
};

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
  const location = useLocation();
  const navigate = useNavigate(); // Added for navigation
  const setupData = location.state?.formData;
  
  // Apply the theme color from Step 1, or default to indigo
  const primaryColor = setupData?.customizeBranding ? setupData.themeColor : "#6366F1";

  const [surveyTitle, setSurveyTitle] = useState(setupData?.surveyTitle || "Survey creator");
  const [pages, setPages] = useState([
    { id: "page-1", title: "Page 1", questions: [] },
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
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
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div 
             className="h-10 w-10 rounded-lg flex items-center justify-center border border-[#F1F5F9]"
             style={{ backgroundColor: `${primaryColor}10` }}
          >
            <Layout size={20} style={{ color: primaryColor }} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 truncate w-32">{surveyTitle}</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Designer</p>
          </div>
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
                  className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all text-left text-gray-700 font-medium group"
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
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${activePageIndex === idx ? "bg-gray-100 text-gray-900 font-semibold" : "hover:bg-gray-50 text-gray-600"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full`}
                    style={{ backgroundColor: activePageIndex === idx ? primaryColor : "transparent" }}
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
                style={{ color: primaryColor }}
                className="w-full flex items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-lg transition-colors mt-2"
              >
                <Plus size={16} /> Add Page
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:5000/api/surveys', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    surveyTitle,
                    primaryColor,
                    themeColor: primaryColor,
                    pages,
                    status: 'Draft',
                    tenantId: 'default',
                  }),
                });
                const data = await res.json();
                navigate('/created-surveys', {
                  state: {
                    newSurvey: {
                      id:    data.survey._id,
                      date:  new Date().toLocaleDateString('en-GB'),
                      title: data.survey.surveyTitle,
                      status: 'Draft',
                    }
                  }
                });
              } catch (err) {
                alert('Could not save draft. Is the backend running?');
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-sm transition-all"
          >
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
              style={isPreviewMode ? { backgroundColor: primaryColor } : {}}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isPreviewMode
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Eye size={16} />
              {isPreviewMode ? "Exit Preview" : "Preview"}
            </button>
            <button 
              onClick={() => navigate('/review-publish', {
                state: {
                  surveyTitle,
                  primaryColor,
                  pages,
                }
              })}
              style={{ backgroundColor: primaryColor }}
              className="text-white px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 shadow-lg transition-all"
            >
              Review & Publish
            </button>
          </div>
        </header>

        {/* Builder Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto py-12 px-6">
            {!isPreviewMode ? (
              <div className="space-y-4">
                <div className="mb-8">
                  <span 
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                  >
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
                    className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 rounded-2xl transition-all"
                  >
                    <Plus size={20} /> Add new question
                  </button>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div style={{ backgroundColor: primaryColor }} className="h-2" />
                <div className="p-10 flex-1">
                  <h1 className="text-2xl font-bold mb-2">{surveyTitle}</h1>
                  <p className="text-gray-500 mb-8">{activePage.title}</p>

                  <div className="space-y-8">
                    {activePage.questions.map((q, idx) => (
                      <div key={q.id}>
                        <div className="flex gap-2 mb-3">
                          <span style={{ color: primaryColor }} className="font-bold">
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
                              className="w-full border-b-2 border-gray-100 focus:border-gray-400 outline-none pb-2 transition-colors"
                              style={{ caretColor: primaryColor }}
                              placeholder={q.placeholder}
                            />
                          )}
                          {q.type === "long_text" && (
                            <textarea
                              className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none min-h-[100px] transition-colors focus:border-gray-400"
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
                                    style={{ color: primaryColor }}
                                    className={`w-5 h-5 border-gray-300 focus:ring-0 ${q.type === "multiple_choice" ? "rounded-full" : "rounded"}`}
                                  />
                                  <span className="text-gray-700 transition-colors">
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
                                  className="text-gray-200 hover:text-yellow-400 transition-colors"
                                >
                                  <Star size={32} />
                                </button>
                              ))}
                            </div>
                          )}
                          {q.type === "number" && (
                            <input
                              type="number"
                              className="border-2 border-gray-100 rounded-lg p-2 outline-none w-32 focus:border-gray-400"
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
                        className={`w-2 h-2 rounded-full transition-colors`}
                        style={{ backgroundColor: activePageIndex === i ? primaryColor : "#D1D5DB" }}
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
                        style={{ backgroundColor: primaryColor }}
                        className="px-8 py-2 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg transition-all flex items-center gap-2"
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    ) : (
                      <button className="px-8 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg transition-all">
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