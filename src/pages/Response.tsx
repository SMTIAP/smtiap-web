import { Link } from 'react-router-dom';
import { ChevronLeft, Download, BarChart2, Play, FileText, CheckCircle } from 'lucide-react';

interface ResponseData {
  timestamp: string;
  answers: string[];
}

const mockResponses: ResponseData[] = [
  { timestamp: "2024-03-15 10:00 AM", answers: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"] },
  { timestamp: "2024-03-15 11:00 AM", answers: ["Answer 5", "Answer 6", "Answer 7", "Answer 8"] },
  { timestamp: "2024-03-15 12:00 PM", answers: ["Answer 9", "Answer 10", "Answer 11", "Answer 12"] },
  { timestamp: "2024-03-15 01:00 PM", answers: ["Answer 13", "Answer 14", "Answer 15", "Answer 16"] },
  { timestamp: "2024-03-15 02:00 PM", answers: ["Answer 17", "Answer 18", "Answer 19", "Answer 20"] },
];

const headers = ["Timestamp", "Question 1", "Question 2", "Question 3", "Question 4"];

export default function Response() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFB] text-[#121712] font-inter">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <Link 
          to="/surveys" 
          className="flex items-center gap-2 text-lg font-bold hover:text-green-600 transition-colors group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </Link>
        
        <div className="flex gap-3">
          <Link 
            to="/analytics" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all shadow-sm"
          >
            <BarChart2 size={18} />
            <span>View Analytics</span>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2BED6B] hover:bg-[#25D45F] rounded-lg font-semibold transition-all shadow-sm">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Survey Responses</h1>
          
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {headers.map((header) => (
                    <th key={header} className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockResponses.map((response, index) => (
                  <tr key={index} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-500">{response.timestamp}</span>
                    </td>
                    {response.answers.map((answer, i) => (
                      <td key={i} className="px-6 py-5">
                        <span className="text-sm text-gray-700">{answer}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            <ActionButton icon={<Play size={18} />} label="Run" variant="primary" />
            <ActionButton icon={<FileText size={18} />} label="Draft" variant="secondary" />
            <ActionButton icon={<CheckCircle size={18} />} label="Finish" variant="secondary" />
          </div>
          <p className="text-gray-400 text-sm italic hover:text-gray-600 transition-colors cursor-default">
            Internal reference: resp_v2_final
          </p>
        </div>
      </main>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  variant: 'primary' | 'secondary';
}

function ActionButton({ icon, label, variant }: ActionButtonProps) {
  const baseStyles = "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg";
  const variants = {
    primary: "bg-[#2BED6B] text-[#121712] hover:bg-[#25D45F]",
    secondary: "bg-white text-[#121712] border border-gray-200 hover:border-green-300"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
