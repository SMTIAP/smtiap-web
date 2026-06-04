import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  LayoutTemplate,
  Star,
  Type,
  List,
  CheckSquare,
  Hash,
  Calendar,
  FileText,
  Clock,
  Upload,
} from "lucide-react";
import { templateApi, type Template, type Category } from "../api/templateApi";
import SuperAdminNavBar from "../components/SuperAdminNavBar";

// Question type options - ALL 7 TYPES
const QUESTION_TYPES = [
  { id: "short_text", label: "Short Text", icon: Type },
  { id: "long_text", label: "Long Text", icon: FileText },
  { id: "multiple_choice", label: "Multiple Choice", icon: List },
  { id: "checkboxes", label: "Checkboxes", icon: CheckSquare },
  { id: "rating", label: "Rating Scale", icon: Star },
  { id: "number", label: "Number", icon: Hash },
  { id: "date", label: "Date", icon: Calendar },
];

// Preset theme colors - Indigo moved to first position as default
const themeColorPresets = [
  { name: "Indigo", value: "#6366F1", gradient: "from-indigo-500 to-purple-600" },
  { name: "Orange", value: "#FB923C", gradient: "from-orange-400 to-rose-500" },
  { name: "Pink", value: "#F472B6", gradient: "from-pink-400 to-rose-500" },
  { name: "Blue", value: "#60A5FA", gradient: "from-blue-400 to-indigo-500" },
  { name: "Amber", value: "#FBBF24", gradient: "from-orange-400 to-amber-500" },
  { name: "Emerald", value: "#34D399", gradient: "from-emerald-400 to-teal-500" },
  { name: "Yellow", value: "#FACC15", gradient: "from-yellow-400 to-amber-500" },
  { name: "Purple", value: "#C084FC", gradient: "from-purple-400 to-fuchsia-500" },
  { name: "Rose", value: "#F43F5E", gradient: "from-rose-400 to-pink-500" },
];

// Estimated time options (replaces icon selector)
const estimatedTimeOptions = [
  { value: "quick", label: "Quick (~2-3 minutes)", icon: Clock },
  { value: "medium", label: "Medium (~5-7 minutes)", icon: Clock },
  { value: "detailed", label: "Detailed (~10-15 minutes)", icon: Clock },
  { value: "comprehensive", label: "Comprehensive (~20+ minutes)", icon: Clock },
];

// Get gradient class from color value
const getGradientFromColor = (colorValue: string): string => {
  const preset = themeColorPresets.find(p => p.value === colorValue);
  return preset?.gradient || "from-indigo-500 to-purple-600";
};

// Get color value from gradient class
const getColorFromGradient = (gradientClass: string): string => {
  const preset = themeColorPresets.find(p => p.gradient === gradientClass);
  return preset?.value || "#6366F1";
};

interface PreviewQuestion {
  type: "short_text" | "long_text" | "multiple_choice" | "checkboxes" | "rating" | "number" | "date";
  label: string;
  max?: number;
  min?: number;
  options?: string[];
  placeholder?: string;
}

export default function SuperAdminTemplateEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#6366F1"); // Default indigo

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    gradient: "from-indigo-500 to-purple-600",
    estimatedTime: "quick",
    coverImage: "",
  });

  const [questions, setQuestions] = useState<PreviewQuestion[]>([
    { type: "short_text", label: "" },
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await templateApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch template if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchTemplate = async () => {
        setLoading(true);
        try {
          const template = await templateApi.getTemplateById(id);
          setFormData({
            title: template.title,
            description: template.description,
            category: template.category,
            gradient: template.gradient,
            estimatedTime: template.estimatedTime || "quick",
            coverImage: template.coverImage || "",
          });
          setSelectedColor(getColorFromGradient(template.gradient));
          setQuestions(template.previewQuestions);
        } catch (err) {
          console.error("Failed to fetch template:", err);
          setError("Template not found");
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [id, isEditing]);

  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue);
    setFormData(prev => ({
      ...prev,
      gradient: getGradientFromColor(colorValue)
    }));
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: "short_text", label: "" }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<PreviewQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options!.push(`Option ${updated[questionIndex].options!.length + 1}`);
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
      setQuestions(updated);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
      setQuestions(updated);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill all required fields");
      return;
    }

    if (questions.length === 0 || questions.some(q => !q.label)) {
      setError("Please add at least one question with a label");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const templateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        gradient: formData.gradient,
        coverImage: formData.coverImage || undefined,
        estimatedTime: formData.estimatedTime,
        previewQuestions: questions,
        usedCount: isEditing ? undefined : "0+",
      };

      if (isEditing && id) {
        await templateApi.updateTemplate(id, templateData);
      } else {
        await templateApi.createTemplate(templateData);
      }

      navigate("/super-admin/templates");
    } catch (err) {
      console.error("Failed to save template:", err);
      setError("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  // Helper to render question type specific fields
  const renderQuestionTypeFields = (question: PreviewQuestion, qIdx: number) => {
    switch (question.type) {
      case "rating":
        return (
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Max Rating (1-10)
            </label>
            <select
              value={question.max || 5}
              onChange={(e) => updateQuestion(qIdx, { max: parseInt(e.target.value) })}
              className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} Stars
                </option>
              ))}
            </select>
          </div>
        );

      case "number":
        return (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={question.min || 0}
                onChange={(e) => updateQuestion(qIdx, { min: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={question.max || 100}
                onChange={(e) => updateQuestion(qIdx, { max: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case "short_text":
      case "long_text":
        return (
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Placeholder (optional)
            </label>
            <input
              type="text"
              value={question.placeholder || ""}
              onChange={(e) => updateQuestion(qIdx, { placeholder: e.target.value })}
              placeholder="e.g., Enter your answer here..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        );

      case "multiple_choice":
      case "checkboxes":
        return (
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {question.options?.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeOption(qIdx, optIdx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(qIdx)}
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} />
                Add Option
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
        <SuperAdminNavBar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <SuperAdminNavBar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/super-admin/templates")}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-3 text-sm"
            >
              <ChevronLeft size={16} />
              Back to Templates
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate size={24} className="text-indigo-500" />
              {isEditing ? "Edit Template" : "Create New Template"}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Template Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Customer Satisfaction Survey"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe what this template is for..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Theme Color
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {themeColorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleColorChange(preset.value)}
                        className={`w-8 h-8 rounded-full transition-all duration-200 ${
                          selectedColor === preset.value
                            ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-1"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {selectedColor}
                    </span>
                  </div>
                  
                  <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: selectedColor }}>
                    <p className="text-xs text-white text-center font-medium">
                      Preview: This color will be applied to surveys
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    This color will be used as the primary theme for surveys created from this template
                  </p>
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Time
                </label>
                <select
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {estimatedTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Helps users know how long the survey will take
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Used Count Display
                </label>
                <input
                  type="text"
                  value={isEditing ? "Auto-updates" : "0+"}
                  disabled
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Cover Image Section */}
              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cover Image
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 w-full md:w-64 aspect-video cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleCoverImageUpload} 
                    />
                    {formData.coverImage ? (
                      <img 
                        src={formData.coverImage} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Upload size={24} />
                        <span className="text-xs font-bold">Upload Cover Image</span>
                      </div>
                    )}
                  </label>
                  {formData.coverImage && (
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-end md:self-auto"
                    >
                      <Trash2 size={12} />
                      Remove Image
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Recommended aspect ratio 16:9 or banner style. This will be shown at the top of surveys.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preview Questions</h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
            >
              <Plus size={14} />
              Add Question
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            These questions will be pre-filled when users create a survey from this template
          </p>

          <div className="space-y-4">
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Question {qIdx + 1}
                  </span>
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIdx, { type: e.target.value as PreviewQuestion["type"] })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {QUESTION_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => updateQuestion(qIdx, { label: e.target.value })}
                      placeholder="Enter question..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {renderQuestionTypeFields(question, qIdx)}
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No questions added. Click "Add Question" to start building your template.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}