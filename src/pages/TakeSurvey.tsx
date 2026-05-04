import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Question {
  _id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  max?: number;
}

interface Page {
  _id: string;
  title: string;
  questions: Question[];
}

export default function TakeSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [surveyData, setSurveyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/surveys/${surveyId}`);
        if (!response.ok) throw new Error('Not found');
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

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading survey...</p>
      </div>
    </div>
  );

  if (error || !surveyData) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center p-10">
        <p className="text-2xl font-bold text-slate-800 mb-2">Survey not found</p>
        <p className="text-slate-500 text-sm">This survey may have been removed or the link is invalid.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-gray-200 max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Thank you!</h2>
        <p className="text-slate-500 text-sm">Your response has been submitted successfully.</p>
      </div>
    </div>
  );

  const pages: Page[] = surveyData.pages || [];
  const primaryColor = surveyData.primaryColor || surveyData.themeColor || '#6366F1';
  const currentPage = pages[activePage];
  const totalPages = pages.length;

  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (activePage < totalPages - 1) {
      setActivePage(activePage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (activePage > 0) setActivePage(activePage - 1);
  };

  const handleSubmit = async () => {
    try {
      await fetch(`http://localhost:5000/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
          <div className="p-8">
            <h1 className="text-2xl font-black text-slate-900 mb-1">
              {surveyData.surveyTitle || 'Untitled Survey'}
            </h1>
            {surveyData.description && (
              <p className="text-slate-500 text-sm">{surveyData.description}</p>
            )}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {pages.map((_: any, i: number) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === activePage ? '24px' : '8px',
                      backgroundColor: i === activePage ? primaryColor : '#E2E8F0'
                    }}
                  />
                ))}
                <span className="text-xs text-slate-400 ml-2">
                  Page {activePage + 1} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        {currentPage ? (
          <div className="space-y-4">
            {currentPage.title && totalPages > 1 && (
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">
                {currentPage.title}
              </p>
            )}

            {currentPage.questions.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic">
                No questions on this page.
              </div>
            ) : (
              currentPage.questions.map((q: Question, index: number) => (
                <div key={q._id || index} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-base text-slate-800 font-semibold mb-4">
                    {index + 1}. {q.label || 'Untitled Question'}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </p>

                  {q.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder={q.placeholder || 'Your answer here...'}
                      value={responses[q._id] || ''}
                      onChange={e => handleResponse(q._id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-sm"
                    />
                  )}

                  {q.type === 'long_text' && (
                    <textarea
                      placeholder={q.placeholder || 'Your answer here...'}
                      value={responses[q._id] || ''}
                      onChange={e => handleResponse(q._id, e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-sm resize-none"
                    />
                  )}

                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {q.options?.map((opt: string, i: number) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all">
                          <input
                            type="radio"
                            name={q._id}
                            value={opt}
                            checked={responses[q._id] === opt}
                            onChange={() => handleResponse(q._id, opt)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkboxes' && (
                    <div className="space-y-2">
                      {q.options?.map((opt: string, i: number) => (
                        <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={(responses[q._id] || '').split(',').includes(opt)}
                            onChange={e => {
                              const current = responses[q._id] ? responses[q._id].split(',') : [];
                              const updated = e.target.checked
                                ? [...current, opt]
                                : current.filter(v => v !== opt);
                              handleResponse(q._id, updated.join(','));
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex gap-2">
                      {Array.from({ length: q.max || 5 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => handleResponse(q._id, String(i + 1))}
                          className="w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all"
                          style={{
                            borderColor: Number(responses[q._id]) > i ? primaryColor : '#E2E8F0',
                            backgroundColor: Number(responses[q._id]) > i ? primaryColor : 'white',
                            color: Number(responses[q._id]) > i ? 'white' : '#94A3B8',
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'number' && (
                    <input
                      type="number"
                      value={responses[q._id] || ''}
                      onChange={e => handleResponse(q._id, e.target.value)}
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-sm"
                    />
                  )}

                  {q.type === 'date' && (
                    <input
                      type="date"
                      value={responses[q._id] || ''}
                      onChange={e => handleResponse(q._id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-sm"
                    />
                  )}
                </div>
              ))
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              {activePage > 0 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
              ) : <div />}

              {activePage < totalPages - 1 ? (
                <button
                  onClick={handleNext}
                  style={{ backgroundColor: primaryColor }}
                  className="px-8 py-3 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-lg transition-all"
                >
                  Submit Response ✓
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 italic">
            No pages found in this survey.
          </div>
        )}
      </div>
    </div>
  );
}