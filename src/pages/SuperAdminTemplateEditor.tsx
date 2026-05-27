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
} from "lucide-react";
import { templateApi, type Template, type Category } from "../api/templateApi";
import SuperAdminNavBar from "../components/SuperAdminNavBar";

// Question type options
const QUESTION_TYPES = [
  { id: "text", label: "Text Question", icon: Type },
  { id: "rating", label: "Rating Scale", icon: Star },
  { id: "multiple_choice", label: "Multiple Choice", icon: List },
];

// Gradient options
const gradientOptions = [
  "from-orange-400 to-rose-500",
  "from-pink-400 to-rose-500",
  "from-blue-400 to-indigo-500",
  "from-orange-400 to-amber-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-violet-500",
  "from-yellow-400 to-amber-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-fuchsia-500",
  "from-rose-400 to-pink-500",
  "from-teal-400 to-cyan-500",
];

// Icon options
const iconOptions = [
  "Star", "Users", "Zap", "Utensils", "Coffee", "Heart",
  "GraduationCap", "Building2", "Mic", "ShoppingBag"
];

interface PreviewQuestion {
  type: "text" | "rating" | "multiple_choice";
  label: string;
  max?: number;
  options?: string[];
}

export default function SuperAdminTemplateEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - REMOVED aiPrompt
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    gradient: "from-orange-400 to-rose-500",
    icon: "Star",
  });

  const [questions, setQuestions] = useState<PreviewQuestion[]>([
    { type: "text", label: "" },
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await templateApi.getCategories();
        setCategories(data);
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
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
            icon: template.icon,
          });
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

  const addQuestion = () => {
    setQuestions([...questions, { type: "text", label: "" }]);
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
    // Removed aiPrompt validation
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
      // Removed aiPrompt from templateData
      const templateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        gradient: formData.gradient,
        icon: formData.icon,
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
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Gradient
                </label>
                <select
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {gradientOptions.map((g) => (
                    <option key={g} value={g}>
                      {g.replace("from-", "").replace("to-", " → ")}
                    </option>
                  ))}
                </select>
                <div className={`mt-2 h-8 rounded-lg bg-gradient-to-br ${formData.gradient}`} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {iconOptions.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
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
            </div>

            {/* AI Prompt Section REMOVED */}
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
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Rating Max */}
                {question.type === "rating" && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Max Rating (1-10)
                    </label>
                    <select
                      value={question.max || 5}
                      onChange={(e) => updateQuestion(qIdx, { max: parseInt(e.target.value) })}
                      className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Multiple Choice Options */}
                {question.type === "multiple_choice" && (
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
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                )}
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