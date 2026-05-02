import { useNavigate, useLocation } from 'react-router-dom';

type QuestionType = 'multiple-choice' | 'checkbox' | 'short-answer' | 'rating' | 'dropdown' | 'date' | 'matrix' | 'file-upload';

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  isRequired: boolean;
  ratingMax?: number;
  ratingLow?: string;
  ratingHigh?: string;
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

export default function ReviewAndPublish() {
  const navigate = useNavigate();
  const location = useLocation();

  const surveyData = location.state?.surveyData || {};
  const allQuestions: Question[] = location.state?.allQuestions || [];
  const surveyTitle = surveyData?.surveyTitle || 'Untitled Survey';
  const websiteUrl = surveyData?.websiteUrl || '—';
  const themeColor = surveyData?.themeColor || '#6366F1';
  const isAnonymous = surveyData?.isAnonymous || false;

  const handleFinalize = async (status: 'Running' | 'Draft') => {
    try {
      const payload = {
        surveyTitle,
        websiteUrl:        surveyData?.websiteUrl,
        logo:              surveyData?.logo,
        themeColor,
        customizeBranding: surveyData?.customizeBranding,
        isAnonymous,
        questions: allQuestions.map(q => ({
          type:           q.type,
          text:           q.text,
          options:        q.options,
          isRequired:     q.isRequired,
          isLogicEnabled: false,
          ratingMax:      q.ratingMax,
          ratingLow:      q.ratingLow,
          ratingHigh:     q.ratingHigh,
        })),
        status,
        tenantId: 'default',
      };

      const res = await fetch('http://localhost:5000/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      navigate('/created-surveys', {
        state: {
          newSurvey: {
            id:     data.survey._id,
            date:   new Date().toLocaleDateString('en-GB'),
            title:  data.survey.surveyTitle,
            status: data.survey.status,
          }
        }
      });
    } catch (err) {
      console.error('Failed to save survey:', err);
      alert('Something went wrong. Is the backend running?');
    }
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
            <div className="w-6 h-6 rounded-full bg-[#EAF3DE] border border-[#639922] text-[#27500A] text-[10px] font-medium flex items-center justify-center">✓</div>
            <span className="text-[11px] text-[#64748B]">Add questions</span>
          </div>
          <div className="w-8 h-px bg-[#E2E8F0] mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#6366F1] text-white text-[10px] font-medium flex items-center justify-center">3</div>
            <span className="text-[11px] text-[#6366F1] font-medium">Review & publish</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col gap-6">
          <div>
            <p className="text-lg font-medium text-[#1E293B] mb-1">Review & publish</p>
            <p className="text-sm text-[#64748B] pb-5 border-b border-[#F1F5F9]">Check everything before making your survey live.</p>
          </div>

          {/* Survey details summary */}
          <div className="flex flex-col gap-0">
            <div className="flex justify-between items-center py-3 border-b border-[#F1F5F9]">
              <span className="text-sm text-[#64748B]">Survey title</span>
              <span className="text-sm font-medium text-[#1E293B]">{surveyTitle}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#F1F5F9]">
              <span className="text-sm text-[#64748B]">Website</span>
              <span className="text-sm text-[#64748B]">{websiteUrl}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#F1F5F9]">
              <span className="text-sm text-[#64748B]">Questions</span>
              <span className="text-sm font-medium text-[#1E293B]">{allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#F1F5F9]">
              <span className="text-sm text-[#64748B]">Anonymous</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isAnonymous ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                {isAnonymous ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-[#64748B]">Theme color</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: themeColor }} />
                <span className="text-sm text-[#64748B] font-mono text-xs">{themeColor}</span>
              </div>
            </div>
          </div>

          {/* Questions preview */}
          {allQuestions.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">Questions preview</p>
              {allQuestions.map((q, i) => (
                <div key={q.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[#EEEDFE] text-[#534AB7] text-[10px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E293B]">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">{TYPE_LABELS[q.type]}</span>
                        {q.isRequired && <span className="text-[10px] text-[#993556] bg-[#FBEAF0] px-2 py-0.5 rounded">Required</span>}
                      </div>
                    </div>
                  </div>
                  {q.options.length > 0 && (
                    <div className="flex flex-col gap-1.5 ml-8">
                      {q.options.slice(0, 3).map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-[#64748B]">
                          <div className="w-3 h-3 rounded-full border border-[#CBD5E1]" />
                          {opt}
                        </div>
                      ))}
                      {q.options.length > 3 && (
                        <p className="text-[11px] text-[#94A3B8] ml-5">+{q.options.length - 3} more options</p>
                      )}
                    </div>
                  )}
                  {q.type === 'rating' && (
                    <div className="flex gap-1.5 ml-8 mt-1">
                      {Array.from({ length: q.ratingMax || 7 }, (_, k) => (
                        <div key={k} className="w-7 h-7 border border-[#E2E8F0] rounded text-[11px] text-[#64748B] flex items-center justify-center bg-white">{k + 1}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-[#F1F5F9]">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#64748B] text-sm hover:text-[#1E293B] transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleFinalize('Draft')}
                className="px-5 py-2.5 bg-[#F1F5F9] text-[#1E293B] rounded-lg text-sm font-medium hover:bg-[#E2E8F0] transition-colors"
              >
                Save as draft
              </button>
              <button
                onClick={() => handleFinalize('Running')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] text-white rounded-lg text-sm font-medium hover:bg-[#16A34A] shadow-sm transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>
                Publish now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}