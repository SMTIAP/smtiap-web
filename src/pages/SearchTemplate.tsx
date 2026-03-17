import { useNavigate } from 'react-router-dom';

export default function SearchTemplate() {
  const navigate = useNavigate();

  const templates = [
    { id: 'food-res', title: "Food Satisfaction", date: "25/08/21", category: "Restaurant", icon: "🍴" },
    { id: 'food-cafe', title: "Food Satisfaction", date: "25/08/21", category: "Cafe", icon: "☕" },
    { id: 'food-res-2', title: "Food Satisfaction", date: "25/08/21", category: "Restaurant", icon: "🍴" },
    { id: 'food-cafe-2', title: "Food Satisfaction", date: "25/08/21", category: "Cafe", icon: "☕" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[1152px] py-10 px-6 flex-col items-start gap-10 w-full">
        
        {/* Simple Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="py-1 px-4 rounded bg-[#F1F5F9] text-[#64748B] text-xs font-medium border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-colors"
        >
          Back
        </button>

        <div className="flex flex-col gap-6 w-full">
          <h1 className="text-[#1E293B] font-inter text-3xl font-bold leading-9 text-center md:text-left">
            Search Template
          </h1>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl self-center md:self-start">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full py-2 pl-10 pr-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 w-full mt-4">
            
            {/* NEW EMPTY TEMPLATE BUTTON */}
            <div 
              onClick={() => navigate('/create-new-survey')} 
              className="flex flex-col items-start gap-2 cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center w-full aspect-square rounded-xl bg-[#2D9596] hover:bg-[#267d7e] transition-all shadow-sm">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="text-[#1E293B] font-bold text-xs">New Empty</p>
                <p className="text-[#94A3B8] text-[10px]">25/08/21</p>
                <p className="text-[#3B82F6] text-[10px] font-semibold">Running</p>
              </div>
            </div>

            {/* Existing Templates */}
            {templates.map((temp, index) => (
              <div key={index} className="flex flex-col items-start gap-2 cursor-pointer group">
                <div className="flex items-center justify-center w-full aspect-square rounded-xl bg-[#FDF7E7] border border-[#FEF3C7] group-hover:shadow-md transition-all text-4xl">
                  {temp.icon}
                </div>
                <div className="flex flex-col">
                  <p className="text-[#1E293B] font-bold text-xs">{temp.title}</p>
                  <p className="text-[#94A3B8] text-[10px]">{temp.date}</p>
                  <p className="text-[#64748B] text-[10px]">{temp.category}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}