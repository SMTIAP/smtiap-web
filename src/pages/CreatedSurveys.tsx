import { useNavigate } from 'react-router-dom';

export default function CreatedSurveys() {
  const navigate = useNavigate();

  // Mock data to match the wireframe
  const surveys = [
    { id: 1, date: "25/08/21", title: "Food Satisfaction", status: "Running" },
    { id: 2, date: "25/08/21", title: "Food Satisfaction", status: "Running" },
    { id: 3, date: "25/08/21", title: "Food Satisfaction", status: "Draft" },
    { id: 4, date: "25/08/21", title: "Food Satisfaction", status: "Finished" },
    { id: 5, date: "25/08/21", title: "Food Satisfaction", status: "Running" },
    { id: 6, date: "25/08/21", title: "Food Satisfaction", status: "Running" },
    { id: 7, date: "25/08/21", title: "Food Satisfaction", status: "Draft" },
    { id: 8, date: "25/08/21", title: "Food Satisfaction", status: "Finished" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[1152px] py-10 px-6 flex-col items-start gap-8 w-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[#1E293B] font-inter text-3xl font-bold leading-9">
            Created surveys
          </h1>
          <div className="flex gap-3">
            {/* Square Add Button */}
            <button 
              onClick={() => navigate('/create-new')} // Update this path as needed
              className="flex items-center justify-center w-10 h-10 rounded-md bg-[#1E293B] text-white hover:opacity-90 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)} 
              className="py-2 px-6 rounded-md bg-[#1E293B] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 self-end">
          {['All', 'Running', 'Draft', 'Finished'].map((tab) => (
            <button 
              key={tab} 
              className={`px-4 py-1 text-xs font-semibold rounded border ${
                tab === 'All' ? 'bg-[#1E293B] text-white border-[#1E293B]' : 'bg-white text-[#64748B] border-[#E2E8F0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Surveys Grid - Scrollable area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {surveys.map((survey, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-between p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md transition-shadow aspect-[3/4]"
            >
              <span className="text-[#94A3B8] text-[10px] font-bold self-end">{survey.date}</span>
              
              <p className="text-[#1E293B] font-semibold text-center text-sm px-2">
                {survey.title}
              </p>

              <div className={`px-4 py-1 rounded text-[10px] font-bold border ${
                survey.status === 'Running' ? 'text-green-600 border-green-200 bg-green-50' :
                survey.status === 'Draft' ? 'text-gray-500 border-gray-200 bg-gray-50' :
                'text-red-500 border-red-200 bg-red-50'
              }`}>
                {survey.status}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="flex justify-center w-full mt-4">
            <button className="bg-[#4D4D00] text-[#FFFFFF] px-10 py-3 rounded-md font-bold text-sm hover:opacity-90 transition-all shadow-lg">
                View All Surveys
            </button>
        </div>

      </div>
    </div>
  );
}