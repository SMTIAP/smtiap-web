import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface Question {
  _id: string;
  type: string;
  label: string;
  options?: string[];
  max?: number;
}

export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');
  const [activeResponseIndex, setActiveResponseIndex] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [surveyRes, responsesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/surveys/${surveyId}`),
          fetch(`http://localhost:5000/api/surveys/${surveyId}/responses`)
        ]);
        const surveyData = await surveyRes.json();
        const responsesData = await responsesRes.json();
        setSurvey(surveyData);
        setResponses(responsesData);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    if (surveyId) fetchAll();
  }, [surveyId]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading results...</p>
      </div>
    </div>
  );

  if (!survey) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <p className="text-slate-500">Survey not found.</p>
    </div>
  );

  const primaryColor = survey.primaryColor || survey.themeColor || '#6366F1';
  const allQuestions: Question[] = survey.pages?.flatMap((p: any) => p.questions) || [];
  const totalResponses = responses.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
          <div className="p-8">
            <button
              onClick={() => navigate('/created-surveys')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-4 transition-all"
            >
              <ChevronLeft size={14} /> Back to surveys
            </button>
            <h1 className="text-2xl font-black text-slate-900">{survey.surveyTitle || 'Untitled Survey'}</h1>
            <p className="text-slate-400 text-sm mt-1">{totalResponses} response{totalResponses !== 1 ? 's' : ''} collected</p>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 bg-slate-100 p-1 rounded-2xl w-fit">
              {(['summary', 'individual'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'summary' ? '📊 Summary' : '👤 Individual'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* No responses yet */}
        {totalResponses === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-slate-700 font-bold text-lg">No responses yet</p>
            <p className="text-slate-400 text-sm mt-1">Share your survey link to start collecting answers.</p>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && totalResponses > 0 && allQuestions.map((q) => {
          const answers = responses.map(r => r.responses?.[q._id]).filter(Boolean);

          return (
            <div key={q._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="font-bold text-slate-800 text-base mb-1">{q.label}</p>
              <p className="text-xs text-slate-400 mb-4">{answers.length} response{answers.length !== 1 ? 's' : ''}</p>

              {/* Multiple choice → bar chart */}
              {(q.type === 'multiple_choice') && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const count = answers.filter(a => a === opt).length;
                    const pct = answers.length ? Math.round((count / answers.length) * 100) : 0;
                    return (
                      <div key={opt}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium">{opt}</span>
                          <span className="text-slate-400 text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: primaryColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Checkboxes → bar chart (each option counted separately) */}
              {q.type === 'checkboxes' && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const count = answers.filter(a => a.split(',').includes(opt)).length;
                    const pct = answers.length ? Math.round((count / answers.length) * 100) : 0;
                    return (
                      <div key={opt}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium">{opt}</span>
                          <span className="text-slate-400 text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: primaryColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rating → average + breakdown */}
              {q.type === 'rating' && (
                <div>
                  <p className="text-4xl font-black mb-1" style={{ color: primaryColor }}>
                    {(answers.reduce((s, a) => s + Number(a), 0) / answers.length).toFixed(1)}
                    <span className="text-base text-slate-400 font-normal ml-2">/ {q.max || 5} avg</span>
                  </p>
                  <div className="flex gap-2 mt-3">
                    {Array.from({ length: q.max || 5 }, (_, i) => {
                      const count = answers.filter(a => Number(a) === i + 1).length;
                      const pct = answers.length ? Math.round((count / answers.length) * 100) : 0;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                          <div className="w-full bg-slate-100 rounded-full overflow-hidden h-16 flex flex-col-reverse">
                            <div
                              className="w-full rounded-full transition-all duration-500"
                              style={{ height: `${pct}%`, backgroundColor: primaryColor, opacity: 0.8 }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 font-bold">{i + 1}</span>
                          <span className="text-xs text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text answers */}
              {(q.type === 'short_text' || q.type === 'long_text' || q.type === 'number' || q.type === 'date') && (
                <ul className="space-y-2">
                  {answers.length === 0
                    ? <p className="text-slate-400 text-sm italic">No answers yet</p>
                    : answers.map((a, i) => (
                      <li key={i} className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        {a}
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>
          );
        })}

        {/* INDIVIDUAL TAB */}
        {activeTab === 'individual' && totalResponses > 0 && (
          <div className="space-y-4">
            {/* Pagination */}
            <div className="flex justify-between items-center bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
              <button
                disabled={activeResponseIndex === 0}
                onClick={() => setActiveResponseIndex(i => i - 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <span className="text-sm font-bold text-slate-500">
                Response {activeResponseIndex + 1} of {totalResponses}
              </span>
              <button
                disabled={activeResponseIndex === totalResponses - 1}
                onClick={() => setActiveResponseIndex(i => i + 1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>

            {/* Submitted at */}
            <p className="text-xs text-slate-400 text-center">
              Submitted: {new Date(responses[activeResponseIndex].submittedAt).toLocaleString()}
            </p>

            {/* Individual answers */}
            {allQuestions.map((q) => {
              const answer = responses[activeResponseIndex].responses?.[q._id];
              return (
                <div key={q._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="font-bold text-slate-700 text-sm mb-2">{q.label}</p>
                  {answer
                    ? <p className="text-slate-800 text-base bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">{answer}</p>
                    : <p className="text-slate-400 text-sm italic">No answer</p>
                  }
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}