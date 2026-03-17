import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CreatedSurveys() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');

  const [surveys, setSurveys] = useState([
    { id: 1, date: "25/08/21", title: "Food Satisfaction", status: "Running" },
    { id: 2, date: "22/08/21", title: "Customer Support Quiz", status: "Draft" },
    { id: 3, date: "15/08/21", title: "Product Feedback", status: "Finished", to: "/response" },
  ]);

  useEffect(() => {
    if (location.state?.newSurvey) {
      const newSurvey = location.state.newSurvey;
      setSurveys((prev) => {
        if (prev.find(s => s.id === newSurvey.id)) return prev;
        return [newSurvey, ...prev];
      });
    }
  }, [location.state]);

  // Logic to filter surveys based on the selected tab
  const filteredSurveys = surveys.filter(survey => {
    if (activeTab === 'All') return true;
    return survey.status === activeTab;
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[1152px] py-10 px-6 flex-col items-start gap-8 w-full">
        
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[#1E293B] text-3xl font-bold">Created surveys</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/templates')} className="w-10 h-10 rounded-md bg-[#1E293B] text-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3V13M3 8H13"/></svg>
            </button>
            <button onClick={() => navigate('/')} className="py-2 px-6 rounded-md bg-[#1E293B] text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">Back</button>
          </div>
        </div>

        {/* Filter Tabs - Now Interactive */}
        <div className="flex gap-2 self-end">
          {['All', 'Running', 'Draft', 'Finished'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-md border transition-all ${
                activeTab === tab ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-[#64748B] border-[#E2E8F0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {filteredSurveys.map((survey: any) => (
            <div 
              key={survey.id} 
              onClick={() => survey.to && navigate(survey.to)}
              className={`flex flex-col items-center justify-between p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm transition-all aspect-[3/4] ${
                survey.to ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : 'hover:border-blue-300'
              }`}
            >
              <span className="text-[#94A3B8] text-[10px] font-bold self-end">{survey.date}</span>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="9" />
                   </svg>
                </div>
                <p className="text-[#1E293B] font-bold text-sm leading-tight">{survey.title}</p>
              </div>

              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${
                survey.status === 'Running' ? 'text-green-600 border-green-100 bg-green-50' :
                survey.status === 'Draft' ? 'text-orange-500 border-orange-100 bg-orange-50' :
                'text-red-500 border-red-100 bg-red-50'
              }`}>
                {survey.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}