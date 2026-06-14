import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar } from "lucide-react";

interface BranchRule {
  value: string;
  targetQuestionId: string;
}

interface QuestionBranching {
  enabled?: boolean;
  rules?: BranchRule[];
  defaultTargetQuestionId?: string;
}

interface Question {
  _id?: string;
  id?: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  max?: number;
  branching?: QuestionBranching;
}

interface Page {
  _id?: string;
  id?: string;
  title: string;
  questions: Question[];
}

interface FlattenedQuestion {
  pageTitle: string;
  pageIndex: number;
  questionIndex: number;
  question: Question;
}

// Generates or retrieves a unique token per respondent per survey to prevent duplicate submissions
function getOrCreateRespondentToken(surveyId: string): string {
  const key = `survey_respondent_token_${surveyId}`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  localStorage.setItem(key, token);
  return token;
}

// Generates a random addition math problem for bot verification
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
}

function getTextColor(backgroundColor: string, opacity: number = 1): string {
  if (!backgroundColor || backgroundColor === "#F8FAFC") {
    return `rgba(30, 41, 59, ${opacity})`;
  }
  let hex = backgroundColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? `rgba(30, 41, 59, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;
}

export default function TakeSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [surveyData, setSurveyData] = useState<{
    pages: Page[];
    primaryColor?: string;
    themeColor?: string;
    backgroundColor?: string;
    status?: string;
    isPasswordProtected?: boolean;
    surveyTitle?: string;
    description?: string;
    coverImage?: string;
    _id?: string;
    scheduledOpen?: string;
    scheduledClose?: string;
    [key: string]: unknown;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [questionHistory, setQuestionHistory] = useState<number[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Password gate state
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);

  // Captcha state
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetches survey data from the backend on mount
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/surveys/${surveyId}`,
        );
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setSurveyData(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (surveyId) fetchSurvey();
  }, [surveyId]);

  const primaryColor = surveyData?.primaryColor || surveyData?.themeColor || "#6366F1";
  const backgroundColor = surveyData?.backgroundColor || "#F8FAFC";

  // Flattens all questions across all pages into a single ordered list for navigation
  const flattenedQuestions = useMemo<FlattenedQuestion[]>(() => {
    const pages: Page[] = surveyData?.pages || [];
    return pages.flatMap((page, pageIndex) =>
      (page.questions || []).map((question, questionIndex) => ({
        pageTitle: page.title || `Page ${pageIndex + 1}`,
        pageIndex,
        questionIndex,
        question,
      })),
    );
  }, [surveyData?.pages]);

  // Resets navigation when a new survey loads
  useEffect(() => {
    setActiveQuestionIndex(0);
    setQuestionHistory([]);
    setValidationError("");
  }, [surveyData?._id]);

  // Verifies the password against the backend before allowing survey access
  const handlePasswordSubmit = async () => {
    if (!passwordInput) return;
    setCheckingPassword(true);
    setPasswordError(false);
    try {
      const res = await fetch(
        `http://localhost:5000/api/surveys/${surveyId}/verify-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setPasswordVerified(true);
      } else {
        setPasswordError(true);
        setPasswordInput("");
      }
    } catch {
      setPasswordError(true);
    } finally {
      setCheckingPassword(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading survey...</p>
        </div>
      </div>
    );

  if (error || !surveyData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-10 rounded-3xl shadow-sm border border-gray-200 max-w-md mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <p className="text-2xl font-bold mb-2 text-slate-800">
            Survey not found
          </p>
          <p className="text-sm font-medium text-slate-500">
            This survey may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );

  // Check for Scheduled status (not yet open)
  if (surveyData.status === "Scheduled" && surveyData.scheduledOpen) {
    const now = new Date();
    const openDate = new Date(surveyData.scheduledOpen);
    
    if (now < openDate) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center p-10 rounded-3xl shadow-sm border border-gray-200 max-w-md mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <Calendar size={28} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-800">Survey Not Started Yet</h2>
            <p className="text-sm font-medium mb-1 text-slate-500">
              This survey will be available on
            </p>
            <p className="font-bold mt-2 text-slate-800">
              {openDate.toLocaleDateString()} at {openDate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      );
    }
  }

  // Check if survey has a close date and is closed (even if status still Running)
  if (surveyData.scheduledClose) {
    const now = new Date();
    const closeDate = new Date(surveyData.scheduledClose);
    
    if (now > closeDate) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center p-10 rounded-3xl shadow-sm border border-gray-200 max-w-md mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <svg width="28" height="28" fill="none" stroke="#F43F5E" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-800">Survey Closed</h2>
            <p className="text-sm font-medium text-slate-500">
              This survey closed on {closeDate.toLocaleDateString()} at {closeDate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      );
    }
  }

  if (surveyData.status === "Finished")
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-10 rounded-3xl shadow-sm border border-gray-200 max-w-md mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-2 text-slate-800">
            Survey Closed
          </h2>
          <p className="text-sm font-medium text-slate-500">
            This survey is no longer accepting responses.
          </p>
        </div>
      </div>
    );

  // Password gate — blocks access until correct password is entered
  if (surveyData.isPasswordProtected && !passwordVerified)
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8FAFC]">
        <div className="rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-sm text-center" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-xl font-black mb-1 text-slate-800">
            Password Required
          </h3>
          <p className="text-xs mb-6 font-medium text-slate-500">
            This survey is password protected
          </p>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            className={`w-full text-center text-sm font-semibold bg-transparent border-2 rounded-2xl px-4 py-3 outline-none transition-all mb-3 ${
              passwordError
                ? "border-red-300 bg-red-50/20 text-red-500"
                : "focus:border-indigo-400"
            }`}
            style={{ 
              borderColor: passwordError ? undefined : "#CBD5E1",
              color: "#1E293B"
            }}
          />
          {passwordError && (
            <p className="text-red-400 text-xs mb-3 font-semibold">
              Incorrect password, try again!
            </p>
          )}
          <button
            onClick={handlePasswordSubmit}
            disabled={!passwordInput || checkingPassword}
            className="w-full py-3 text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {checkingPassword ? "Checking..." : "Enter Survey →"}
          </button>
        </div>
      </div>
    );

  // FIXED: Thank You screen - clean white background, no survey colors
  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-10 rounded-3xl shadow-sm border border-gray-200 max-w-md mx-auto bg-white">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-2 text-slate-800">
            Thank you!
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Your response has been submitted successfully.
          </p>
        </div>
      </div>
    );

  const totalQuestions = flattenedQuestions.length;
  const currentFlowItem = flattenedQuestions[activeQuestionIndex];
  const currentQuestion = currentFlowItem?.question;

  const getQuestionStableId = (question?: Question) =>
    String(question?.id || question?._id || "").trim();

  const getResponseKey = (question?: Question) =>
    String(question?._id || question?.id || "").trim();

  const hasValue = (value: string) => value.trim().length > 0;

  // Resolves the next question index based on conditional branching rules
  const resolveBranchTargetIndex = (question: Question): number | null => {
    if (!question.branching?.enabled) return null;

    const responseKey = getResponseKey(question);
    const answerValue = (responses[responseKey] || "").trim();
    const rules = question.branching.rules || [];

    let targetQuestionId = "";
    if (
      (question.type === "multiple_choice" || question.type === "checkboxes") &&
      question.options?.length
    ) {
      const selectedValues = answerValue
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      for (const option of question.options) {
        if (!selectedValues.includes(option)) continue;
        const matchedRule = rules.find((rule) => rule.value === option);
        if (matchedRule?.targetQuestionId) {
          targetQuestionId = matchedRule.targetQuestionId;
          break;
        }
      }
    }

    if (!targetQuestionId) {
      targetQuestionId = question.branching.defaultTargetQuestionId || "";
    }

    if (!targetQuestionId) return null;
    if (targetQuestionId === "__END__") return -1;

    const targetIndex = flattenedQuestions.findIndex(
      (item) => getQuestionStableId(item.question) === targetQuestionId,
    );
    return targetIndex >= 0 ? targetIndex : null;
  };

  const handleResponse = (questionId: string, value: string) => {
    setValidationError("");
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  // Navigates back to the previous question using history stack
  const handleBack = () => {
    setValidationError("");
    setQuestionHistory((prev) => {
      if (prev.length === 0) return prev;
      const historyCopy = [...prev];
      const previousIndex = historyCopy.pop();
      if (previousIndex !== undefined) setActiveQuestionIndex(previousIndex);
      return historyCopy;
    });
  };

  // Validates current answer, resolves branch target and advances to next question
  const handleNext = () => {
    if (!currentQuestion) return;

    const responseKey = getResponseKey(currentQuestion);
    const currentAnswer = responses[responseKey] || "";

    if (currentQuestion.required && !hasValue(currentAnswer)) {
      setValidationError("This question is required.");
      return;
    }

    setValidationError("");
    const branchTargetIndex = resolveBranchTargetIndex(currentQuestion);
    if (branchTargetIndex === -1) {
      handleSubmitClick();
      return;
    }

    const nextIndex =
      branchTargetIndex !== null ? branchTargetIndex : activeQuestionIndex + 1;

    if (nextIndex >= totalQuestions) {
      handleSubmitClick();
      return;
    }

    setQuestionHistory((prev) => [...prev, activeQuestionIndex]);
    setActiveQuestionIndex(nextIndex);
    window.scrollTo(0, 0);
  };

  // Opens the captcha modal before final submission
  const handleSubmitClick = () => {
    setSubmitError("");
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
    setShowCaptcha(true);
  };

  // Verifies captcha answer then submits responses to the backend
  const handleCaptchaConfirm = async () => {
    if (Number(captchaInput) !== captcha.answer) {
      setCaptchaError(true);
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }
    setShowCaptcha(false);
    try {
      if (!surveyId) throw new Error("Invalid survey link.");

      const respondentToken = getOrCreateRespondentToken(surveyId);

      const response = await fetch(
        `http://localhost:5000/api/surveys/${surveyId}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses, respondentToken }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data?.error ||
            (response.status === 409
              ? "You have already submitted this survey."
              : "Failed to submit response."),
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit response.",
      );
    }
  };

  const currentResolvedTarget = currentQuestion
    ? resolveBranchTargetIndex(currentQuestion)
    : null;

  return (
    <div className="min-h-screen py-12 px-6 bg-[#F8FAFC]">
      {/* Math captcha modal shown before final form submission */}
      {showCaptcha && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-sm mx-4 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Quick Check
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Solve to verify you're human
            </p>

            <div className="bg-slate-50 rounded-2xl px-6 py-4 mb-4 inline-block w-full">
              <p className="text-3xl font-black text-slate-800 tracking-wide">
                {captcha.a} + {captcha.b} = ?
              </p>
            </div>

            <input
              type="number"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                setCaptchaError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCaptchaConfirm()}
              placeholder="Your answer"
              className={`w-full text-center text-lg font-bold bg-slate-50 border-2 rounded-2xl px-4 py-3 outline-none transition-all mb-4 ${
                captchaError
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 focus:border-indigo-400"
              }`}
            />

            {captchaError && (
              <p className="text-red-400 text-xs mb-4 font-semibold">
                Wrong answer, try again!
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCaptcha(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCaptchaConfirm}
                className="flex-1 px-4 py-3 text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all"
                style={{ backgroundColor: "#6366F1" }}
              >
                Submit ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Survey header with custom background color and contrast text */}
        <div 
          className="relative rounded-3xl shadow-md border border-gray-200 overflow-hidden mb-6 transition-all duration-300"
          style={{ backgroundColor: backgroundColor || "#FFFFFF", borderColor: getTextColor(backgroundColor, 0.1) }}
        >
          {/* Cover Image Banner */}
          <div className="h-44 w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0">
            {surveyData?.coverImage ? (
              <img
                src={surveyData.coverImage}
                alt="Cover banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #4f46e5 100%)`
                }}
              />
            )}
          </div>

          {/* Overlapping Logo */}
          {Boolean(surveyData?.logo) && (
            <div className="absolute left-1/2 -translate-x-1/2 top-28 w-36 h-36 rounded-full bg-white p-1 border-4 border-white shadow-md flex items-center justify-center overflow-hidden z-10 transition-all">
              <img
                src={surveyData!.logo as string}
                alt="Survey logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          )}

          {/* Header text info */}
          <div className={`p-8 pb-6 flex flex-col items-start ${Boolean(surveyData?.logo) ? 'pt-24' : 'pt-6'}`}>
            {(surveyData?.customizeBranding as unknown as boolean) &&
              (surveyData?.websiteUrl as string) && (
                <div className="flex justify-center w-full">
                  <a
                    href={surveyData?.websiteUrl as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] font-bold hover:underline mb-4 text-center"
                    style={{ color: getTextColor(backgroundColor) }}
                  >
                    {surveyData?.websiteUrl as string}
                  </a>
                </div>
              )}
            <h1 className="text-2xl font-black mb-1  text-left" style={{ color: getTextColor(backgroundColor) }}>
              {surveyData.surveyTitle || "Untitled Survey"}
            </h1>
            {surveyData.description && (
              <p className="text-sm mb-1  text-left" style={{ color: getTextColor(backgroundColor, 0.7) }}>
                {surveyData.description}
              </p>
            )}
            {totalQuestions > 0 && (
              <div className="flex items-center gap-2 mt-4">
                {flattenedQuestions.map((_, i: number) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeQuestionIndex ? "24px" : "8px",
                      backgroundColor:
                        i === activeQuestionIndex ? primaryColor : getTextColor(backgroundColor, 0.2),
                    }}
                  />
                ))}
                <span className="text-xs ml-2 font-medium" style={{ color: getTextColor(backgroundColor, 0.5) }}>
                  Question {Math.min(activeQuestionIndex + 1, totalQuestions)}{" "}
                  of {totalQuestions}
                </span>
              </div>
            )}
          </div>
        </div>

        {currentQuestion ? (
          <div className="space-y-4">
            {submitError && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium">
                {submitError}
              </div>
            )}

            {validationError && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium">
                {validationError}
              </div>
            )}

            {currentFlowItem?.pageTitle && (
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">
                {currentFlowItem.pageTitle}
              </p>
            )}

            {/* Question card with custom background color and contrast text */}
            <div 
              className="p-6 rounded-2xl border border-gray-100 shadow-md transition-all duration-300"
              style={{ backgroundColor: backgroundColor || "#FFFFFF", borderColor: getTextColor(backgroundColor, 0.1) }}
            >
              <p className="text-base font-semibold mb-4" style={{ color: getTextColor(backgroundColor) }}>
                {activeQuestionIndex + 1}.{" "}
                {currentQuestion.label || "Untitled Question"}
                {currentQuestion.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </p>

              {currentQuestion.type === "short_text" && (
                <input
                  type="text"
                  placeholder={
                    currentQuestion.placeholder || "Your answer here..."
                  }
                  value={responses[getResponseKey(currentQuestion)] || ""}
                  onChange={(e) =>
                    handleResponse(
                      getResponseKey(currentQuestion),
                      e.target.value,
                    )
                  }
                  className="w-full border-b-2 outline-none pb-2 transition-all text-sm focus:border-gray-500"
                  style={{ 
                    backgroundColor: "transparent", 
                    borderColor: getTextColor(backgroundColor, 0.3),
                    color: getTextColor(backgroundColor), 
                    caretColor: primaryColor 
                  }}
                />
              )}

              {currentQuestion.type === "long_text" && (
                <textarea
                  placeholder={
                    currentQuestion.placeholder || "Your answer here..."
                  }
                  value={responses[getResponseKey(currentQuestion)] || ""}
                  onChange={(e) =>
                    handleResponse(
                      getResponseKey(currentQuestion),
                      e.target.value,
                    )
                  }
                  rows={4}
                  className="w-full border-2 rounded-xl p-3 outline-none transition-all text-sm resize-none focus:border-gray-500"
                  style={{ 
                    backgroundColor: "transparent", 
                    borderColor: getTextColor(backgroundColor, 0.3),
                    color: getTextColor(backgroundColor), 
                    caretColor: primaryColor 
                  }}
                />
              )}

              {currentQuestion.type === "multiple_choice" && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((opt: string, i: number) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-indigo-500/50"
                      style={{ 
                        borderColor: getTextColor(backgroundColor, 0.1),
                        backgroundColor: getTextColor(backgroundColor, 0.02)
                      }}
                    >
                      <input
                        type="radio"
                        name={getResponseKey(currentQuestion)}
                        value={opt}
                        checked={
                          responses[getResponseKey(currentQuestion)] === opt
                        }
                        onChange={() =>
                          handleResponse(getResponseKey(currentQuestion), opt)
                        }
                        className="w-4 h-4 transition-colors"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-sm font-medium" style={{ color: getTextColor(backgroundColor) }}>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "checkboxes" && (
                <div className="space-y-2">
                  {currentQuestion.options?.map((opt: string, i: number) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-indigo-500/50"
                      style={{ 
                        borderColor: getTextColor(backgroundColor, 0.1),
                        backgroundColor: getTextColor(backgroundColor, 0.02)
                      }}
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        checked={(
                          responses[getResponseKey(currentQuestion)] || ""
                        )
                          .split(",")
                          .includes(opt)}
                        onChange={(e) => {
                          const current = responses[
                            getResponseKey(currentQuestion)
                          ]
                            ? responses[getResponseKey(currentQuestion)].split(
                                ",",
                              )
                            : [];
                          const updated = e.target.checked
                            ? [...current, opt]
                            : current.filter((v) => v !== opt);
                          handleResponse(
                            getResponseKey(currentQuestion),
                            updated.join(","),
                          );
                        }}
                        className="w-4 h-4 rounded transition-colors"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-sm font-medium" style={{ color: getTextColor(backgroundColor) }}>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "rating" && (
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: currentQuestion.max || 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        handleResponse(
                          getResponseKey(currentQuestion),
                          String(i + 1),
                        )
                      }
                      className="w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all duration-200"
                      style={{
                        borderColor:
                          Number(responses[getResponseKey(currentQuestion)]) > i
                            ? primaryColor
                            : getTextColor(backgroundColor, 0.2),
                        backgroundColor:
                          Number(responses[getResponseKey(currentQuestion)]) > i
                            ? primaryColor
                            : "transparent",
                        color:
                          Number(responses[getResponseKey(currentQuestion)]) > i
                            ? "white"
                            : getTextColor(backgroundColor, 0.5),
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === "number" && (
                <input
                  type="number"
                  value={responses[getResponseKey(currentQuestion)] || ""}
                  onChange={(e) =>
                    handleResponse(
                      getResponseKey(currentQuestion),
                      e.target.value,
                    )
                  }
                  className="w-32 border-b-2 outline-none pb-2 transition-all text-sm focus:border-gray-500"
                  style={{ 
                    backgroundColor: "transparent", 
                    borderColor: getTextColor(backgroundColor, 0.3),
                    color: getTextColor(backgroundColor), 
                    caretColor: primaryColor 
                  }}
                />
              )}

              {currentQuestion.type === "date" && (
                <input
                  type="date"
                  value={responses[getResponseKey(currentQuestion)] || ""}
                  onChange={(e) =>
                    handleResponse(
                      getResponseKey(currentQuestion),
                      e.target.value,
                    )
                  }
                  className="border-b-2 outline-none pb-2 transition-all text-sm focus:border-gray-500"
                  style={{ 
                    backgroundColor: "transparent", 
                    borderColor: getTextColor(backgroundColor, 0.3),
                    color: getTextColor(backgroundColor), 
                    accentColor: primaryColor 
                  }}
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4">
              {questionHistory.length > 0 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border rounded-xl text-sm font-semibold transition-all hover:bg-gray-100"
                  style={{
                    backgroundColor: backgroundColor || "#FFFFFF",
                    borderColor: getTextColor(backgroundColor, 0.2),
                    color: getTextColor(backgroundColor, 0.7)
                  }}
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                style={{
                  backgroundColor:
                    currentResolvedTarget === -1 ||
                    (currentResolvedTarget === null &&
                      activeQuestionIndex >= totalQuestions - 1)
                      ? "#16A34A"
                      : primaryColor,
                }}
                className="px-8 py-3 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg transition-all duration-200"
              >
                {currentResolvedTarget === -1 ||
                (currentResolvedTarget === null &&
                  activeQuestionIndex >= totalQuestions - 1)
                  ? "Submit Response ✓"
                  : "Next →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 italic bg-white/80 backdrop-blur-sm rounded-2xl shadow-md" style={{ backgroundColor: "#FFFFFF", color: "#64748B" }}>
            No questions found in this survey.
          </div>
        )}
      </div>
    </div>
  );
}