import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Layout, Activity, Clock, CheckCircle2 } from 'lucide-react';

export default function CreatedSurveys() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/surveys");
        const data = await response.json();
        setSurveys(data);
      } catch (err) {
        console.error("Failed to fetch surveys:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const handleCardClick = (survey) => {
    if (survey.status === "Draft") {
      navigate("/add-questions", { state: { surveyId: survey._id } });
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    if (activeTab === 'All') return true;
    return survey.status === activeTab;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-indigo-200"></div>
        <p className="text-indigo-900 font-bold tracking-widest uppercase text-xs">Loading Workspace</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FDFDFD]">
      {/* Top Decorative Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="flex max-w-[1200px] py-12 px-8 flex-col items-start gap-10 w-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-end w-full">
          <div>
            <h1 className="text-[#0F172A] text-5xl font-black tracking-tight mb-2">My Surveys</h1>
            <p className="text-[#64748B] text-base font-medium">Track performance and draft new insights.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/templates')} 
              className="group h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-[#1E293B] text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1"
            >
              <ChevronLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* Premium Segmented Filter Bar */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] self-end backdrop-blur-md border border-slate-200/50">
          {['All', 'Running', 'Draft', 'Finished'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-[0.85rem] transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-white text-indigo-600 shadow-sm scale-100' 
                  : 'text-slate-500 hover:text-slate-900 scale-95 opacity-70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid: 4 Columns for a "Smarter" look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {filteredSurveys.map((survey) => {
            const isDraft = survey.status === 'Draft';
            const isRunning = survey.status === 'Running';
            const isFinished = survey.status === 'Finished';

            return (
              <div 
                key={survey._id} 
                onClick={() => handleCardClick(survey)}
                className="group relative flex flex-col items-center p-8 bg-white border border-slate-100 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-2 cursor-pointer aspect-[3/4] overflow-hidden"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  isRunning ? 'bg-emerald-400' : isDraft ? 'bg-amber-400' : 'bg-rose-400'
                }`}></div>

                <span className="text-slate-400 text-[10px] font-extrabold self-end mb-4 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {new Date(survey.createdAt).toLocaleDateString('en-GB')}
                </span>
                
                <div className="flex flex-col items-center justify-center flex-grow text-center w-full px-2">
                  <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                    isRunning ? 'bg-emerald-50 text-emerald-500' : 
                    isDraft ? 'bg-amber-50 text-amber-500' : 
                    'bg-rose-50 text-rose-500'
                  }`}>
                     {isRunning ? <Activity size={28} /> : isDraft ? <Clock size={28} /> : <CheckCircle2 size={28} />}
                  </div>
                  <h3 className="text-slate-800 font-black text-lg leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-indigo-600">
                    {survey.surveyTitle || "Untitled Survey"}
                  </h3>
                </div>

                {/* Rich Status Badges */}
                <div className={`mt-6 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border-2 transition-all duration-500 ${
                  isRunning ? 'text-emerald-600 border-emerald-100 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500' :
                  isDraft ? 'text-amber-600 border-amber-100 bg-amber-50 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500' :
                  'text-rose-600 border-rose-100 bg-rose-50 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500'
                }`}>
                  {survey.status}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Empty State */}
        {filteredSurveys.length === 0 && (
          <div className="w-full py-32 text-center bg-slate-50 border-4 border-dashed border-slate-200/50 rounded-[3rem] flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-full shadow-md text-slate-300">
              <Layout size={40} />
            </div>
            <p className="text-slate-400 font-bold text-xl">No {activeTab.toLowerCase()} surveys found.</p>
          </div>
        )}
      </div>
    </div>
  );
}