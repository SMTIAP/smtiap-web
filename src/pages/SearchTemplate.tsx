import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { Utensils, Coffee, Plus, Search } from 'lucide-react';

export default function SearchTemplate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const templates = [
    { id: 'food-res', title: "Food Satisfaction", category: "Restaurant", icon: <Utensils size={32} />, color: "bg-orange-50 text-orange-500 border-orange-100" },
    { id: 'food-cafe', title: "Daily Cafe Feedback", category: "Cafe", icon: <Coffee size={32} />, color: "bg-amber-50 text-amber-500 border-amber-100" },
    { id: 'food-res-2', title: "Restaurant Quality", category: "Restaurant", icon: <Utensils size={32} />, color: "bg-rose-50 text-rose-500 border-rose-100" },
    { id: 'food-cafe-2', title: "Staff Performance", category: "Cafe", icon: <Coffee size={32} />, color: "bg-blue-50 text-blue-500 border-blue-100" },
  ];

  const handleUseTemplate = async (templateTitle: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyTitle: templateTitle,
          status: "Draft",
          questions: [] 
        }),
      });

      const newSurvey = await response.json();
      
      if (newSurvey._id) {
        navigate("/add-questions", { state: { surveyId: newSurvey._id } });
      }
    } catch (err) {
      console.error("Failed to create survey from template:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FDFDFD]">
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-blue-500"></div>

      <div className="flex max-w-[1200px] py-12 px-8 flex-col items-start gap-10 w-full">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-6">
            <BackButton />
            <h1 className="text-[#0F172A] text-4xl font-black tracking-tight">Search Template</h1>
          </div>
        </div>

        <div className="flex flex-col gap-10 w-full">
          {/* Search Bar */}
          <div className="relative w-full max-w-xl">
            <span className="absolute inset-y-0 left-4 flex items-center">
              <Search className="w-5 h-5 text-slate-400" />
            </span>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              className="w-full py-4 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full">
            
            {/* NEW EMPTY TEMPLATE - Updated Navigation */}
            <div 
              onClick={() => navigate('/create-new-survey')} 
              className="flex flex-col gap-4 cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center w-full aspect-square rounded-[2.5rem] bg-[#2D9596] hover:bg-[#217374] transition-all shadow-xl shadow-teal-100 group-hover:-translate-y-2">
                <Plus size={48} className="text-white" />
              </div>
              <div className="px-2">
                <p className="text-[#1E293B] font-black text-sm">New Empty</p>
                <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Scratch</p>
              </div>
            </div>

            {/* Template Cards */}
            {templates.map((temp) => (
              <div 
                key={temp.id} 
                onClick={() => handleUseTemplate(temp.title)}
                className="flex flex-col gap-4 cursor-pointer group"
              >
                <div className={`flex items-center justify-center w-full aspect-square rounded-[2.5rem] border-2 transition-all group-hover:shadow-xl group-hover:-translate-y-2 ${temp.color}`}>
                  {temp.icon}
                </div>
                <div className="px-2">
                  <p className="text-[#1E293B] font-black text-sm line-clamp-1">{temp.title}</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{temp.category}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-teal-700 font-black text-xs uppercase tracking-widest">Preparing Template...</p>
          </div>
        </div>
      )}
    </div>
  );
}