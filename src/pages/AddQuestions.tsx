import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTenant } from "../contexts/TenantContext";
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
  Wand2,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import AiSurveyModifier from "../components/AiSurveyModifier";
import SurveySettingsModal from "../components/SurveySettingsModal";

type QuestionTypeId =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "rating"
  | "number"
  | "date";

interface BranchRule {
  value: string;
  targetQuestionId: string;
}

interface QuestionBranching {
  enabled: boolean;
  rules: BranchRule[];
  defaultTargetQuestionId?: string;
}

interface BranchTargetOption {
  id: string;
  label: string;
}

interface SurveyQuestion {
  id: string;
  type: QuestionTypeId;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  max?: number;
  min?: number;
  branching?: QuestionBranching;
}

interface SurveyPage {
  id: string;
  title: string;
  questions: SurveyQuestion[];
}

interface SetupFormData {
  customizeBranding?: boolean;
  themeColor?: string;
  backgroundColor?: string;
  surveyTitle?: string;
  description?: string;
  websiteUrl?: string;
  logo?: string;
}

interface RouteState {
  formData?: SetupFormData;
  surveyId?: string;
  aiGeneratedPages?: IncomingPage[];
  readOnly?: boolean;
}

interface DatePickerCalendarProps {
  value?: string;
  onChange: (date: string) => void;
}

interface QuestionTypeConfig {
  id: QuestionTypeId;
  label: string;
  icon: ReactNode;
  defaultData: Partial<SurveyQuestion>;
}

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  isPreview: boolean;
  selectedQuestionId: string | null;
  setSelectedQuestionId: (id: string | null) => void;
  moveQuestion: (index: number, direction: number) => void;
  reorderQuestion: (fromIndex: number, toIndex: number) => void;
  duplicateQuestion: (id: string) => void;
  deleteQuestion: (id: string) => void;
  totalQuestions: number;
}

interface PropertyEditorProps {
  selectedQuestion: SurveyQuestion | null;
  updateQuestion: (id: string, updates: Partial<SurveyQuestion>) => void;
  setSelectedQuestionId: (id: string | null) => void;
  branchTargets: BranchTargetOption[];
}

interface IncomingQuestion {
  id?: string;
  _id?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  max?: number;
  min?: number;
  branching?: {
    enabled?: boolean;
    rules?: Array<{
      value?: string;
      targetQuestionId?: string;
      targetQuestionLabel?: string;
    }>;
    defaultTargetQuestionId?: string;
    defaultTargetQuestionLabel?: string;
  };
}

interface IncomingPage {
  id?: string;
  _id?: string;
  title?: string;
  questions?: IncomingQuestion[];
}

type PreviewDeviceType = "desktop" | "tablet" | "mobile";

const previewDeviceWidths: Record<PreviewDeviceType, string> = {
  desktop: "w-full max-w-3xl",
  tablet: "w-[600px]",
  mobile: "w-[375px]",
};

const PreviewDeviceIcon = ({ device, current, onClick }: { device: PreviewDeviceType; current: PreviewDeviceType; onClick: () => void }) => {
  const icons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
  const Icon = icons[device];
  return (
    <button onClick={onClick}
      className={`p-2 rounded-lg transition-all ${current === device ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
      title={device.charAt(0).toUpperCase() + device.slice(1)}>
      <Icon size={18} />
    </button>
  );
};

// Interactive calendar picker used in preview mode for date question types
const DatePickerCalendar = ({ value, onChange }: DatePickerCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value) : new Date(),
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const selectedDate = value ? new Date(value) : null;

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days: Array<number | null> = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDateSelect = (day: number) => {
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
                className={`p-2 text-sm rounded transition-colors
                  ${!day ? "text-gray-300 cursor-default" : ""}
                  ${
                    selectedDate &&
                    day === selectedDate.getDate() &&
                    selectedDate.getMonth() === currentDate.getMonth() &&
                    selectedDate.getFullYear() === currentDate.getFullYear()
                      ? "bg-indigo-600 text-white font-bold"
                      : day
                        ? "hover:bg-indigo-50 text-gray-800"
                        : ""
                  }`}
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

// Supported question types with their default field values
const QUESTION_TYPES: QuestionTypeConfig[] = [
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

// Renders a single question card in the builder canvas with move, copy and delete actions
const QuestionCard = ({
  question,
  index,
  isPreview,
  selectedQuestionId,
  setSelectedQuestionId,
  moveQuestion,
  reorderQuestion,
  duplicateQuestion,
  deleteQuestion,
  totalQuestions,
}: QuestionCardProps) => {
  const isActive = selectedQuestionId === question.id && !isPreview;
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      draggable={!isPreview}
      onDragStart={(e) => {
        e.dataTransfer.setData("dragIndex", String(index));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const fromIndex = Number(e.dataTransfer.getData("dragIndex"));
        if (!isNaN(fromIndex) && fromIndex !== index) {
          reorderQuestion(fromIndex, index);
        }
      }}
      onDragEnd={() => setIsDragOver(false)}
      onClick={() => !isPreview && setSelectedQuestionId(question.id)}
      className={`group relative bg-white dark:bg-slate-800 rounded-xl border-2 transition-all duration-200 ${
        isDragOver
          ? "border-indigo-400 shadow-xl scale-[1.01] bg-indigo-50 dark:bg-indigo-900/20"
          : isActive
            ? "border-indigo-500 shadow-lg"
            : "border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 shadow-sm"
      } ${isPreview ? "p-6 mb-4" : "p-6 mb-4 cursor-pointer"}`}
    >
      {!isPreview && (
        <div
          className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-white border shadow-sm p-1 rounded-md text-gray-400">
            <GripVertical size={16} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
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
            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3 text-gray-400"
          />
        )}
        {(question.type === "multiple_choice" ||
          question.type === "checkboxes") && (
          <div className="space-y-2">
            {question.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 border border-gray-300 ${question.type === "multiple_choice" ? "rounded-full" : "rounded"}`}
                />
                <span className="text-gray-700 dark:text-slate-300">{opt}</span>
              </div>
            ))}
          </div>
        )}
        {question.type === "rating" && (
          <div className="flex gap-2">
            {[...Array(question.max ?? 5)].map((_, i: number) => (
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

// Right panel for editing question properties, options and conditional branching rules
const PropertyEditor = ({
  selectedQuestion,
  updateQuestion,
  setSelectedQuestionId,
  branchTargets,
}: PropertyEditorProps) => {
  if (!selectedQuestion) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 p-8 text-center bg-white dark:bg-slate-800">
        <Settings2 size={48} className="mb-4 opacity-20" />
        <p>Select a question to edit its properties</p>
      </div>
    );
  }

  const supportsBranching =
    selectedQuestion.type === "multiple_choice" ||
    selectedQuestion.type === "checkboxes";

  const branching = selectedQuestion.branching || {
    enabled: false,
    rules: [],
    defaultTargetQuestionId: "",
  };

  const updateBranchRule = (value: string, targetQuestionId: string) => {
    const nextRules = (branching.rules || []).filter(
      (rule) => rule.value !== value,
    );
    if (targetQuestionId) nextRules.push({ value, targetQuestionId });

    updateQuestion(selectedQuestion.id, {
      branching: {
        enabled: true,
        rules: nextRules,
        defaultTargetQuestionId: branching.defaultTargetQuestionId,
      },
    });
  };

  return (
    <div className="p-5 space-y-5 bg-white dark:bg-slate-800 h-full overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white text-base">Properties</h2>
        <button
          onClick={() => setSelectedQuestionId(null)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400"
        >
          <X size={16} />
        </button>
      </div>

      {/* Question Label */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          Question Label
        </label>
        <input
          type="text"
          value={selectedQuestion.label}
          onChange={(e) =>
            updateQuestion(selectedQuestion.id, { label: e.target.value })
          }
          className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
        />
      </div>

      {/* Placeholder for text questions */}
      {(selectedQuestion.type === "short_text" || selectedQuestion.type === "long_text") && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Placeholder
          </label>
          <input
            type="text"
            value={selectedQuestion.placeholder || ""}
            onChange={(e) =>
              updateQuestion(selectedQuestion.id, {
                placeholder: e.target.value,
              })
            }
            className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Options for multiple choice/checkboxes */}
      {(selectedQuestion.type === "multiple_choice" || selectedQuestion.type === "checkboxes") && (
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">
            Options
          </label>
          <div className="space-y-2">
            {selectedQuestion.options?.map((opt: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...(selectedQuestion.options || [])];
                    newOpts[i] = e.target.value;
                    updateQuestion(selectedQuestion.id, {
                      options: newOpts,
                    });
                  }}
                  className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    const currentOptions = selectedQuestion.options || [];
                    const newOpts = currentOptions.filter((_, idx) => idx !== i);
                    updateQuestion(selectedQuestion.id, {
                      options: newOpts,
                    });
                  }}
                  className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const currentOptions = selectedQuestion.options || [];
                updateQuestion(selectedQuestion.id, {
                  options: [...currentOptions, `Option ${currentOptions.length + 1}`],
                });
              }}
              className="w-full mt-1 py-2 px-3 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1"
            >
              <Plus size={12} /> Add Option
            </button>
          </div>
        </div>
      )}

      {/* Conditional Branching */}
      {supportsBranching && (
        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
              Enable Conditional Branching
            </span>
            <div
              onClick={() =>
                updateQuestion(selectedQuestion.id, {
                  branching: branching.enabled
                    ? undefined
                    : {
                        enabled: true,
                        rules: [],
                        defaultTargetQuestionId: "",
                      },
                })
              }
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${branching.enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-slate-600"}`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${branching.enabled ? "translate-x-5" : ""}`}
              />
            </div>
          </label>

          {branching.enabled && (
            <div className="space-y-2 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/20 p-3">
              <p className="text-[10px] text-gray-600 dark:text-slate-400">
                Map each answer to the next question
              </p>
              
              {(selectedQuestion.options || []).map((optionValue) => {
                const selectedTarget = (branching.rules || []).find(
                  (rule) => rule.value === optionValue,
                )?.targetQuestionId;
                return (
                  <div key={optionValue} className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 dark:text-slate-300 w-20 flex-shrink-0 truncate">
                      {optionValue}
                    </span>
                    <select
                      value={selectedTarget || ""}
                      onChange={(e) =>
                        updateBranchRule(optionValue, e.target.value)
                      }
                      className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg p-1.5 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="">Next question</option>
                      <option value="__END__">End survey</option>
                      {branchTargets.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <div className="flex items-center gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-800">
                <span className="text-xs text-gray-700 dark:text-slate-300 w-20 flex-shrink-0">
                  Otherwise
                </span>
                <select
                  value={branching.defaultTargetQuestionId || ""}
                  onChange={(e) =>
                    updateQuestion(selectedQuestion.id, {
                      branching: {
                        enabled: true,
                        rules: branching.rules || [],
                        defaultTargetQuestionId: e.target.value,
                      },
                    })
                  }
                  className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg p-1.5 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="">Next question</option>
                  <option value="__END__">End survey</option>
                  {branchTargets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Max Stars for rating */}
      {selectedQuestion.type === "rating" && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
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
            className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Required Field Toggle */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
            Required Field
          </span>
          <div
            onClick={() =>
              updateQuestion(selectedQuestion.id, {
                required: !selectedQuestion.required,
              })
            }
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${selectedQuestion.required ? "bg-indigo-600" : "bg-gray-300 dark:bg-slate-600"}`}
          >
            <div
              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${selectedQuestion.required ? "translate-x-5" : ""}`}
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default function AddQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as RouteState | null) ?? {};
  const setupData = routeState.formData;

  const surveyId = routeState.surveyId;
  const aiGeneratedPages = routeState.aiGeneratedPages;

  const { activeTenant, isSystemContext } = useTenant();
  const tenantRole =
    !isSystemContext && activeTenant ? activeTenant.role : null;
  const isViewer = tenantRole === "viewer" || tenantRole === "billing_manager";
  const readOnly = routeState.readOnly === true || isViewer;

  const [primaryColor, setPrimaryColor] = useState(
    setupData?.customizeBranding
      ? setupData.themeColor
      : setupData?.themeColor || "#6366F1",
  );
  const [backgroundColor, setBackgroundColor] = useState(
    setupData?.backgroundColor || "#F8FAFC",
  );
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState(
    setupData?.surveyTitle || "Survey creator",
  );
  const [pages, setPages] = useState<SurveyPage[]>([
    { id: "page-1", title: "Page 1", questions: [] },
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [isPreviewMode, setIsPreviewMode] = useState(readOnly);
  const [showAiModifier, setShowAiModifier] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logo, setLogo] = useState<string | null>(setupData?.logo || null);
  const [description, setDescription] = useState(setupData?.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(setupData?.websiteUrl || "");
  const [customizeBranding, setCustomizeBranding] = useState(
    setupData?.customizeBranding || false,
  );
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDeviceType>("desktop");

  // Rest of your existing useEffect hooks (keep them as is)
  useEffect(() => {
    if (
      aiGeneratedPages &&
      Array.isArray(aiGeneratedPages) &&
      aiGeneratedPages.length > 0
    ) {
      const timestamp = Date.now();
      const normalizedPages: SurveyPage[] = aiGeneratedPages.map(
        (page: IncomingPage, idx: number) => {
          const pageQuestions = Array.isArray(page?.questions)
            ? page.questions
            : [];
          return {
            id: `ai-page-${idx}-${timestamp}`,
            title: page.title || `Page ${idx + 1}`,
            questions: pageQuestions.map((q: IncomingQuestion, qi: number) => {
              const type = normalizeQuestionType(q?.type);
              const supportsOptions =
                type === "multiple_choice" || type === "checkboxes";
              return {
                id: `ai-q-${idx}-${qi}-${timestamp}`,
                type,
                label: q.label || "Untitled Question",
                required: q.required ?? false,
                placeholder:
                  q.placeholder ||
                  (type === "short_text"
                    ? "Enter text here..."
                    : type === "long_text"
                      ? "Enter detailed response..."
                      : undefined),
                options: supportsOptions
                  ? Array.isArray(q?.options) && q.options.length > 0
                    ? q.options
                    : ["Option 1", "Option 2"]
                  : undefined,
                max: type === "rating" ? Number(q?.max || 5) : q?.max,
                min: type === "number" ? Number(q?.min || 0) : q?.min,
                branching: undefined,
              };
            }),
          };
        },
      );

      const labelToIdMap = new Map<string, string>();
      normalizedPages.forEach((page) => {
        page.questions.forEach((q) => {
          labelToIdMap.set(q.label, q.id);
        });
      });

      const flatIncomingQuestions = aiGeneratedPages.flatMap(
        (p: IncomingPage) => p.questions || [],
      );

      normalizedPages.forEach((page) => {
        page.questions.forEach((q) => {
          const incomingQ = flatIncomingQuestions.find(
            (inq: IncomingQuestion) => inq.label === q.label || inq.id === q.id,
          );
          const branchingRaw = incomingQ?.branching;
          if (branchingRaw?.enabled) {
            type RawRule = {
              value?: string;
              targetQuestionId?: string;
              targetQuestionLabel?: string;
            };
            const rules = (branchingRaw.rules || [])
              .filter((rule: RawRule) => Boolean(rule?.value))
              .map((rule: RawRule) => {
                const targetLabel = rule.targetQuestionLabel;
                let targetId = "";
                if (targetLabel === "__END__") {
                  targetId = "__END__";
                } else if (targetLabel) {
                  targetId = labelToIdMap.get(targetLabel) || "";
                } else if (rule.targetQuestionId) {
                  targetId = rule.targetQuestionId;
                }
                return {
                  value: rule.value as string,
                  targetQuestionId: targetId,
                };
              })
              .filter((rule: { value: string; targetQuestionId: string }) =>
                Boolean(rule.targetQuestionId),
              );
            const defaultLabel = branchingRaw.defaultTargetQuestionLabel;
            let defaultTargetId = "";
            if (defaultLabel === "__END__") {
              defaultTargetId = "__END__";
            } else if (defaultLabel) {
              defaultTargetId = labelToIdMap.get(defaultLabel) || "";
            } else if (branchingRaw.defaultTargetQuestionId) {
              defaultTargetId = branchingRaw.defaultTargetQuestionId;
            }
            if (rules.length > 0) {
              q.branching = {
                enabled: true,
                rules,
                defaultTargetQuestionId: defaultTargetId || undefined,
              };
            }
          }
        });
      });

      setPages(normalizedPages);
      setActivePageIndex(0);
      setSelectedQuestionId(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/users/me/tenant", {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.tenantId) setTenantId(d.tenantId);
      })
      .catch(() => {});
  }, []);

  const normalizeQuestionType = useCallback((type?: string): QuestionTypeId => {
    if (type === "checkbox") return "checkboxes";
    const allowedTypes: QuestionTypeId[] = [
      "short_text",
      "long_text",
      "multiple_choice",
      "checkboxes",
      "rating",
      "number",
      "date",
    ];
    return allowedTypes.includes(type as QuestionTypeId)
      ? (type as QuestionTypeId)
      : "short_text";
  }, []);

  const normalizeSurveyPages = useCallback(
    (incomingPages: unknown): SurveyPage[] => {
      if (!Array.isArray(incomingPages) || incomingPages.length === 0) {
        return [{ id: "page-1", title: "Page 1", questions: [] }];
      }
      return (incomingPages as IncomingPage[]).map((page, pageIndex) => {
        const pageQuestions = Array.isArray(page?.questions)
          ? page.questions
          : [];
        return {
          id: page?.id || page?._id || `page-${Date.now()}-${pageIndex}`,
          title: page?.title || `Page ${pageIndex + 1}`,
          questions: pageQuestions.map(
            (question: IncomingQuestion, questionIndex: number) => {
              const type = normalizeQuestionType(question?.type);
              const supportsOptions =
                type === "multiple_choice" || type === "checkboxes";
              return {
                id:
                  question?.id ||
                  question?._id ||
                  `q-${Date.now()}-${pageIndex}-${questionIndex}`,
                type,
                label: question?.label || "Untitled Question",
                placeholder:
                  question?.placeholder ||
                  (type === "short_text"
                    ? "Enter text here..."
                    : type === "long_text"
                      ? "Enter detailed response..."
                      : undefined),
                options: supportsOptions
                  ? Array.isArray(question?.options) &&
                    question.options.length > 0
                    ? question.options
                    : ["Option 1", "Option 2"]
                  : undefined,
                required: Boolean(question?.required),
                max:
                  type === "rating"
                    ? Number(question?.max || 5)
                    : question?.max,
                min:
                  type === "number"
                    ? Number(question?.min || 0)
                    : question?.min,
                branching: question?.branching?.enabled
                  ? {
                      enabled: true,
                      rules: Array.isArray(question.branching.rules)
                        ? question.branching.rules
                            .filter(
                              (rule) =>
                                Boolean(rule?.value) &&
                                Boolean(rule?.targetQuestionId),
                            )
                            .map((rule) => ({
                              value: String(rule!.value),
                              targetQuestionId: String(rule!.targetQuestionId),
                            }))
                        : [],
                      defaultTargetQuestionId:
                        question.branching.defaultTargetQuestionId || "",
                    }
                  : undefined,
              };
            },
          ),
        };
      });
    },
    [normalizeQuestionType],
  );

  useEffect(() => {
    if (surveyId) {
      const loadSurvey = async () => {
        try {
          setLoadingSurvey(true);
          const token = localStorage.getItem("token");
          const tenantId_hdr = localStorage.getItem("activeTenantId");
          const res = await fetch(
            `http://localhost:5000/api/surveys/${surveyId}`,
            {
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(tenantId_hdr && tenantId_hdr !== "__system__"
                  ? { "x-tenant-id": tenantId_hdr }
                  : {}),
              },
              credentials: "include",
            },
          );
          if (res.ok) {
            const data = await res.json();
            setSurveyTitle(data?.surveyTitle || "Untitled Survey");
            setPrimaryColor(
              data?.primaryColor || data?.themeColor || "#6366F1",
            );
            setBackgroundColor(data?.backgroundColor || "#F8FAFC");
            setLogo(data?.logo || null);
            setDescription(data?.description || "");
            setWebsiteUrl(data?.websiteUrl || "");
            setCustomizeBranding(data?.customizeBranding || false);
            setPages(normalizeSurveyPages(data?.pages));
            setActivePageIndex(0);
            setSelectedQuestionId(null);
          }
        } catch (err) {
          console.error("Failed to load existing survey data", err);
        } finally {
          setLoadingSurvey(false);
        }
      };
      loadSurvey();
    }
  }, [surveyId, normalizeSurveyPages]);

  const addPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      questions: [],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const deletePage = (index: number) => {
    if (pages.length === 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    setActivePageIndex(Math.max(0, index - 1));
  };

  const addQuestion = (typeId: QuestionTypeId) => {
    const typeDef = QUESTION_TYPES.find((t) => t.id === typeId);
    if (!typeDef) return;
    const newQuestion = {
      id: `q-${Date.now()}`,
      type: typeId,
      ...typeDef.defaultData,
      required: false,
    };
    const updatedPages = [...pages];
    updatedPages[activePageIndex].questions.push(newQuestion as SurveyQuestion);
    setPages(updatedPages);
    setSelectedQuestionId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    const updatedPages = pages.map((page) => ({
      ...page,
      questions: page.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    }));
    setPages(updatedPages);
  };

  const deleteQuestion = (id: string) => {
    const updatedPages = pages.map((page) => ({
      ...page,
      questions: page.questions
        .filter((q) => q.id !== id)
        .map((q) => {
          if (!q.branching?.enabled) return q;
          const nextRules = (q.branching.rules || []).filter(
            (rule) => rule.targetQuestionId !== id,
          );
          return {
            ...q,
            branching: {
              ...q.branching,
              rules: nextRules,
              defaultTargetQuestionId:
                q.branching.defaultTargetQuestionId === id
                  ? ""
                  : q.branching.defaultTargetQuestionId,
            },
          };
        }),
    }));
    setPages(updatedPages);
    if (selectedQuestionId === id) setSelectedQuestionId(null);
  };

  const duplicateQuestion = (id: string) => {
    const questionToCopy = pages[activePageIndex].questions.find(
      (q) => q.id === id,
    );
    if (!questionToCopy) return;
    const newQuestion = {
      ...questionToCopy,
      id: `q-${Date.now()}`,
      branching: undefined,
    };
    const updatedPages = [...pages];
    const index = updatedPages[activePageIndex].questions.findIndex(
      (q) => q.id === id,
    );
    updatedPages[activePageIndex].questions.splice(index + 1, 0, newQuestion);
    setPages(updatedPages);
  };

  const moveQuestion = (index: number, direction: number) => {
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

  const reorderQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...pages[activePageIndex].questions];
    const [moved] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, moved);
    const updatedPages = [...pages];
    updatedPages[activePageIndex].questions = updatedQuestions;
    setPages(updatedPages);
  };

  const activePage = pages[activePageIndex] ?? pages[0];
  const selectedQuestion =
    activePage?.questions.find((q) => q.id === selectedQuestionId) ||
    pages.flatMap((p) => p.questions).find((q) => q.id === selectedQuestionId);

  const branchTargets = useMemo(() => {
    const flattened = pages.flatMap((page, pageIndex) =>
      page.questions.map((question, questionIndex) => ({
        id: question.id,
        label: `P${pageIndex + 1} Q${questionIndex + 1} - ${question.label || "Untitled"}`,
      })),
    );
    const selectedIndex = flattened.findIndex(
      (target) => target.id === selectedQuestionId,
    );
    if (selectedIndex < 0) return flattened;
    return flattened.filter((_, index) => index > selectedIndex);
  }, [pages, selectedQuestionId]);

  const handleAiModifyApplied = useCallback(
    (result: {
      surveyTitle: string;
      description: string;
      pages: IncomingPage[];
    }) => {
      const timestamp = Date.now();
      const rawPages = Array.isArray(result.pages) ? result.pages : [];
      const normalized: SurveyPage[] = rawPages.map(
        (page: IncomingPage, idx: number) => ({
          id: `ai-page-${idx}-${timestamp}`,
          title: page.title || `Page ${idx + 1}`,
          questions: (page.questions || []).map(
            (q: IncomingQuestion, qi: number) => {
              const type = normalizeQuestionType(q?.type);
              const supportsOptions =
                type === "multiple_choice" || type === "checkboxes";
              return {
                id: `ai-q-${idx}-${qi}-${timestamp}`,
                type,
                label: q.label || "Untitled Question",
                required: q.required ?? false,
                placeholder:
                  q.placeholder ||
                  (type === "short_text"
                    ? "Enter text here..."
                    : type === "long_text"
                      ? "Enter detailed response..."
                      : undefined),
                options: supportsOptions
                  ? Array.isArray(q?.options) && q.options.length > 0
                    ? q.options
                    : ["Option 1", "Option 2"]
                  : undefined,
                max: type === "rating" ? Number(q?.max || 5) : q?.max,
                min: type === "number" ? Number(q?.min || 0) : q?.min,
                branching: undefined,
              };
            },
          ),
        }),
      );
      const labelToIdMap = new Map<string, string>();
      normalized.forEach((page) =>
        page.questions.forEach((qq) => labelToIdMap.set(qq.label, qq.id)),
      );
      const flatIncoming = rawPages.flatMap(
        (p: IncomingPage) => p.questions || [],
      );
      normalized.forEach((page) => {
        page.questions.forEach((qq) => {
          const incomingQ = flatIncoming.find(
            (iq: IncomingQuestion) => iq.label === qq.label,
          );
          const br = incomingQ?.branching;
          if (br?.enabled) {
            const rules = (br.rules || [])
              .filter(
                (r: {
                  value?: string;
                  targetQuestionId?: string;
                  targetQuestionLabel?: string;
                }) => r?.value,
              )
              .map(
                (r: {
                  value?: string;
                  targetQuestionId?: string;
                  targetQuestionLabel?: string;
                }) => {
                  let tid = "";
                  if (
                    r.targetQuestionLabel === "__END__" ||
                    r.targetQuestionId === "__END__"
                  )
                    tid = "__END__";
                  else if (r.targetQuestionLabel)
                    tid = labelToIdMap.get(r.targetQuestionLabel) || "";
                  else if (r.targetQuestionId) tid = r.targetQuestionId;
                  return { value: r.value as string, targetQuestionId: tid };
                },
              )
              .filter(
                (r: { value: string; targetQuestionId: string }) =>
                  r.targetQuestionId,
              );
            const dl =
              br.defaultTargetQuestionLabel || br.defaultTargetQuestionId;
            let dtid = "";
            if (dl === "__END__") dtid = "__END__";
            else if (br.defaultTargetQuestionLabel)
              dtid = labelToIdMap.get(br.defaultTargetQuestionLabel) || "";
            else if (br.defaultTargetQuestionId)
              dtid = br.defaultTargetQuestionId;
            if (rules.length > 0) {
              qq.branching = {
                enabled: true,
                rules,
                defaultTargetQuestionId: dtid || undefined,
              };
            }
          }
        });
      });
      setSurveyTitle(result.surveyTitle || surveyTitle);
      setPages(normalized);
      setActivePageIndex(0);
      setSelectedQuestionId(null);
      setShowAiModifier(false);
    },
    [surveyTitle, normalizeQuestionType],
  );

  if (loadingSurvey) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB] dark:bg-[#0F172A]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading draft survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] dark:bg-[#0F172A] text-gray-800 dark:text-slate-200 overflow-hidden font-sans transition-colors duration-300">
      {readOnly && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-6 py-3 text-center text-sm font-semibold text-amber-800">
          <Eye size={16} className="inline mr-2 -mt-0.5" />
          Viewing draft survey (read-only) — you do not have permission to edit or publish
        </div>
      )}

      {!readOnly && (
        <aside className="w-72 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col z-10 shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 bg-gray-50 dark:bg-slate-900">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800">
              <Layout size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate w-28">
                {surveyTitle}
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Designer
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-all shrink-0"
              title="Survey Settings"
            >
              <Settings2 size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest px-2 mb-3">
                Essentials
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => addQuestion(type.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left text-gray-700 dark:text-slate-300 font-medium group bg-white dark:bg-slate-800"
                  >
                    <span className="p-2 bg-gray-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600 rounded-lg transition-colors shadow-sm text-gray-600 dark:text-slate-300">
                      {type.icon}
                    </span>
                    {type.label}
                    <PlusCircle
                      size={14}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest px-2 mb-3">
                Pages
              </h3>
              <div className="space-y-1">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    onClick={() => setActivePageIndex(idx)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      activePageIndex === idx
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        activePageIndex === idx ? "bg-indigo-500" : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    />
                    <span className="truncate flex-1 text-sm">{page.title}</span>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-gray-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPage}
                  className="w-full flex items-center gap-2 p-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors mt-2"
                >
                  <Plus size={16} /> Add Page
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <button
              onClick={async () => {
                const url = surveyId
                  ? `http://localhost:5000/api/surveys/${surveyId}`
                  : "http://localhost:5000/api/surveys";
                const method = surveyId ? "PUT" : "POST";
                try {
                  const token = localStorage.getItem("token");
                  const tenantId_hdr = localStorage.getItem("activeTenantId");
                  const res = await fetch(url, {
                    method,
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      ...(tenantId_hdr && tenantId_hdr !== "__system__"
                        ? { "x-tenant-id": tenantId_hdr }
                        : {}),
                    },
                    body: JSON.stringify({
                      surveyTitle,
                      description: description,
                      logo: logo,
                      websiteUrl: websiteUrl,
                      customizeBranding: customizeBranding,
                      primaryColor,
                      themeColor: primaryColor,
                      backgroundColor,
                      pages,
                      status: "Draft",
                      tenantId: tenantId ?? undefined,
                    }),
                  });
                  const data = await res.json();
                  const finalId = surveyId || data.survey._id;
                  navigate("/created-surveys", {
                    state: {
                      newSurvey: {
                        id: finalId,
                        date: new Date().toLocaleDateString("en-GB"),
                        title: surveyTitle,
                        status: "Draft",
                      },
                    },
                  });
                } catch {
                  alert("Could not save draft. Is the backend running?");
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <Save size={16} /> {surveyId ? "Update Draft" : "Save Draft"}
            </button>
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col h-full overflow-hidden ${readOnly ? "pt-12" : ""}`}>
<header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
  {/* Button bar - top row */}
  <div className="flex items-center justify-end gap-2 px-4 py-2">
    {!readOnly && (
      <button
        onClick={() => setShowAiModifier(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all"
      >
        <Wand2 size={14} />
        AI Modify
      </button>
    )}
    
    {/* Preview button */}
    <button
      onClick={() => {
        if (readOnly) {
          navigate("/created-surveys");
          return;
        }
        setIsPreviewMode(!isPreviewMode);
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isPreviewMode
          ? "bg-indigo-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      }`}
    >
      <Eye size={14} />
      {isPreviewMode ? "Exit Preview" : "Preview"}
    </button>
    
    {/* Device Switcher - only show in preview mode */}
    {isPreviewMode && (
      <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-slate-700 rounded-lg px-1.5 py-1">
        <button
          onClick={() => setPreviewDevice("desktop")}
          className={`p-1 rounded-md transition-all ${previewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
          title="Desktop"
        >
          <Monitor size={14} />
        </button>
        <button
          onClick={() => setPreviewDevice("tablet")}
          className={`p-1 rounded-md transition-all ${previewDevice === "tablet" ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
          title="Tablet"
        >
          <Tablet size={14} />
        </button>
        <button
          onClick={() => setPreviewDevice("mobile")}
          className={`p-1 rounded-md transition-all ${previewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
          title="Mobile"
        >
          <Smartphone size={14} />
        </button>
      </div>
    )}
    
    {!readOnly && (
      <button
        onClick={async () => {
          const url = surveyId
            ? `http://localhost:5000/api/surveys/${surveyId}`
            : "http://localhost:5000/api/surveys";
          const method = surveyId ? "PUT" : "POST";
          let finalId = surveyId;
          try {
            const token = localStorage.getItem("token");
            const tenantId_hdr = localStorage.getItem("activeTenantId");
            const res = await fetch(url, {
              method,
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(tenantId_hdr && tenantId_hdr !== "__system__"
                  ? { "x-tenant-id": tenantId_hdr }
                  : {}),
              },
              body: JSON.stringify({
                surveyTitle,
                description: description,
                logo: logo,
                websiteUrl: websiteUrl,
                customizeBranding: customizeBranding,
                primaryColor,
                themeColor: primaryColor,
                backgroundColor,
                pages,
                status: "Draft",
                tenantId: tenantId ?? undefined,
              }),
            });
            const data = await res.json();
            finalId = surveyId || data.survey._id;
          } catch {
            alert("Could not save draft. Is the backend running?");
            return;
          }
          navigate("/review-publish", {
            state: {
              surveyId: finalId,
              surveyTitle,
              description: description,
              logo,
              websiteUrl: websiteUrl,
              customizeBranding: customizeBranding,
              primaryColor,
              backgroundColor,
              pages,
            },
          });
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Review & Publish
      </button>
    )}
  </div>
  
  {/* Title bar - bottom row */}
  <div className="px-6 pb-4">
    <input
      type="text"
      value={surveyTitle}
      onChange={(e) => setSurveyTitle(e.target.value)}
      readOnly={readOnly}
      className={`text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full dark:text-white ${
        readOnly ? "text-gray-500 cursor-default" : ""
      }`}
      placeholder="Survey Title"
    />
  </div>
</header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto py-12 px-6">
            {!isPreviewMode ? (
              <div className="space-y-4">
                <div className="mb-8">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
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
                    <p className="text-lg font-medium opacity-40">Your survey is empty</p>
                    <p className="text-sm opacity-30">Add elements from the left sidebar to begin</p>
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
                      reorderQuestion={reorderQuestion}
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
              // PREVIEW MODE with device switcher

<div className="relative">
  <div className={`transition-all duration-300 mx-auto ${previewDeviceWidths[previewDevice]}`}>
    <div 
      className="rounded-3xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden min-h-150 flex flex-col transition-colors duration-300"
      style={{ backgroundColor: backgroundColor || "#FFFFFF" }}
    >
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-2"
      />
      {/* Content area with white background for readability */}
      <div className="p-10 flex-1 bg-white dark:bg-white">
        {logo && (
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Survey logo" className="max-h-20 object-contain rounded" />
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2 text-gray-900">{surveyTitle}</h1>
        {description && <p className="text-gray-500 text-sm mb-1">{description}</p>}
        {customizeBranding && websiteUrl && (
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-blue-500 hover:text-blue-700 underline mb-6">
            {websiteUrl}
          </a>
        )}
        <p className="text-gray-500 mb-8">{activePage.title}</p>

        <div className="space-y-8">
          {activePage.questions.map((q, idx) => (
            <div key={q.id}>
              <div className="flex gap-2 mb-3">
                <span className="font-bold text-gray-700">{idx + 1}.</span>
                <h3 className="font-semibold text-gray-800">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </h3>
              </div>
              <div className="pl-6">
                {q.type === "short_text" && (
                  <input type="text" className="w-full border-b-2 border-gray-200 focus:border-gray-400 outline-none pb-2 transition-colors bg-transparent text-gray-800" placeholder={q.placeholder} />
                )}
                {q.type === "long_text" && (
                  <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none min-h-25 transition-colors focus:border-gray-400 bg-transparent text-gray-800" placeholder={q.placeholder} />
                )}
                {(q.type === "multiple_choice" || q.type === "checkboxes") && (
                  <div className="space-y-3">
                    {q.options?.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <input type={q.type === "multiple_choice" ? "radio" : "checkbox"} name={q.id} className="w-5 h-5 border-gray-300 rounded-full focus:ring-0" />
                        <span className="text-gray-700 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "rating" && (
                  <div className="flex gap-2 flex-wrap">
                    {[...Array(q.max || 5)].map((_, i) => (
                      <button key={i} className="w-10 h-10 rounded-lg border-2 border-gray-200 text-gray-400 hover:text-yellow-400 transition-all">
                        <Star size={20} />
                      </button>
                    ))}
                  </div>
                )}
                {q.type === "number" && (
                  <input type="number" className="border-2 border-gray-200 rounded-lg p-2 outline-none w-32 focus:border-gray-400 bg-transparent text-gray-800" />
                )}
                {q.type === "date" && (
                  <DatePickerCalendar value={responses[q.id] || ""} onChange={(date) => setResponses((prev) => ({ ...prev, [q.id]: date }))} />
                )}
                {q.branching?.enabled && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                    Conditional flow mapped
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-gray-50 flex justify-between items-center border-t border-gray-200">
        <div className="flex gap-2">
          {pages.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-colors" style={{ backgroundColor: activePageIndex === i ? primaryColor : "#D1D5DB" }} />
          ))}
        </div>
        <div className="flex gap-4">
          {activePageIndex > 0 && (
            <button onClick={() => setActivePageIndex(activePageIndex - 1)} className="px-6 py-2 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition-all text-gray-700">Back</button>
          )}
          {activePageIndex < pages.length - 1 ? (
            <button onClick={() => setActivePageIndex(activePageIndex + 1)} style={{ backgroundColor: primaryColor }} className="px-8 py-2 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg transition-all flex items-center gap-2">Next <ChevronRight size={18} /></button>
          ) : (
            <button style={{ backgroundColor: primaryColor }} className="px-8 py-2 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg transition-all">Submit Survey</button>
          )}
        </div>
      </div>
    </div>
  </div>
</div>


             
            )}
          </div>
        </div>
      </main>

      {!isPreviewMode && (
        <aside className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col z-10 shadow-sm overflow-y-auto transition-colors duration-300">
          <PropertyEditor
            selectedQuestion={selectedQuestion || null}
            updateQuestion={updateQuestion}
            setSelectedQuestionId={setSelectedQuestionId}
            branchTargets={branchTargets}
          />
        </aside>
      )}

      {showSettings && (
        <SurveySettingsModal
          surveyTitle={surveyTitle}
          description={description}
          logo={logo}
          websiteUrl={websiteUrl}
          themeColor={primaryColor || "#6366F1"}
          backgroundColor={backgroundColor || "#F8FAFC"}
          customizeBranding={customizeBranding}
          onSave={(settings) => {
            setSurveyTitle(settings.surveyTitle);
            setDescription(settings.description);
            setLogo(settings.logo);
            setWebsiteUrl(settings.websiteUrl);
            setPrimaryColor(settings.themeColor);
            setBackgroundColor(settings.backgroundColor);
            setCustomizeBranding(settings.customizeBranding);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAiModifier && (
        <AiSurveyModifier
          surveyTitle={surveyTitle}
          pages={pages}
          description={description}
          onApply={handleAiModifyApplied}
          onClose={() => setShowAiModifier(false)}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}