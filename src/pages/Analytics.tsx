import { Link } from 'react-router-dom';
import { Filter, BarChart, Sparkles, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="flex min-w-[158px] p-6 flex-col items-start gap-2 rounded-lg border border-[#CFDBE8] w-full bg-white shadow-sm">
    <p className="text-[#0D141C] font-inter text-base font-medium leading-6">{label}</p>
    <p className="text-[#0D141C] font-inter text-2xl font-bold leading-[30px]">{value}</p>
  </div>
);

interface TagProps {
  label: string;
  count: number;
  color: string;
}

const InsightTag = ({ label, count, color }: TagProps) => (
  <div 
    className="flex items-center px-4 py-1.5 rounded-lg text-sm font-medium" 
    style={{ backgroundColor: color }}
  >
    <span className="text-[#4D7399]">{label} ({count})</span>
  </div>
);

export default function Analytics() {
  // Chart configurations
  const ratingData = {
    labels: ['Rating Question 01', 'Rating Question 02'],
    datasets: [
      {
        label: 'Rating (out of 5)',
        data: [3.1, 4.2],
        backgroundColor: '#2B8CED',
        borderRadius: 8,
        barThickness: 16,
      },
    ],
  };

  const ratingOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        max: 5,
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      },
    },
  };

  const mcq01Data = {
    labels: ['Option A', 'Option B', 'Option C', 'Option D'],
    datasets: [
      {
        label: 'Responses',
        data: [100, 15, 65, 80],
        backgroundColor: '#E8EDF2',
        borderColor: '#757575',
        borderWidth: { right: 2 },
        borderRadius: 4,
      },
    ],
  };

  const mcq01Options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { display: false }, ticks: { font: { family: 'Inter', weight: 'bold' as any, size: 12 }, color: '#4D7399' } },
    },
  };

  const mcq02Data = {
    labels: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    datasets: [
      {
        label: 'Responses',
        data: [137, 104, 59, 93],
        backgroundColor: [
          '#2B8CED', // Modern Blue
          '#55E05F', // Vibrant Green
          '#FFA500', // Warning Orange
          '#E8EDF2', // Soft Gray
        ],
        hoverOffset: 15,
        borderWidth: 0,
      },
    ],
  };

  const mcq02Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter', size: 12, weight: '500' as any }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAFC] font-inter text-[#0D141C]">
      {/* Top Navbar */}
      <nav className="flex py-3 px-10 border-b border-[#E5E8EB] bg-white w-full sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EDF2]">
            <BarChart size={20} className="text-[#0D141C]" />
          </div>
          <h1 className="text-lg font-bold">Survey Analytics</h1>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        <div className="max-w-[960px] w-full px-4 md:px-0 py-5">
          {/* Action Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex py-3 items-center gap-3 flex-wrap w-full">
              <Link to="/response" className="flex min-w-[84px] py-2 px-4 justify-center items-center rounded-lg bg-[#E8EDF2] hover:bg-gray-200 transition-colors">
                <p className="text-[#0D141C] text-sm font-bold">Back</p>
              </Link>
              <div className="flex py-2 px-6 justify-center items-center rounded-lg bg-[#2B8CED]">
                <p className="text-[#F7FAFC] text-sm font-bold">Food Satisfaction</p>
              </div>
            </div>

            <div className="flex justify-between items-center w-full">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter size={24} className="text-[#0D141C]" />
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-[#2B8CED] hover:bg-[#1A76D2] text-white rounded-lg font-bold text-sm transition-all shadow-md group">
                <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Responses" value="1,234" />
            <StatCard label="Completion Rate" value="85%" />
            <StatCard label="NPS" value="7.8" />
          </div>

          {/* Ratings Section */}
          <section className="bg-white rounded-xl border border-[#CFDBE8] p-6 mb-8 shadow-sm">
            <h2 className="text-[22px] font-bold leading-7 mb-6">Rating Questions</h2>
            <div className="h-48">
              <Bar data={ratingData} options={ratingOptions} />
            </div>
          </section>

          {/* MCQs Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* MCQ 01 - Horizontal Bars */}
            <div className="p-6 rounded-lg border border-[#CFDBE8] bg-white shadow-sm w-full">
              <h3 className="text-base font-medium mb-6">Multiple Choice Question 01</h3>
              <div className="h-64">
                <Bar data={mcq01Data} options={mcq01Options} />
              </div>
            </div>

            {/* MCQ 02 - Pie Chart */}
            <div className="p-6 rounded-lg border border-[#CFDBE8] bg-white shadow-sm w-full">
              <h3 className="text-base font-medium mb-6">Multiple Choice Question 02</h3>
              <div className="h-64">
                <Pie data={mcq02Data} options={mcq02Options} />
              </div>
            </div>
          </section>

          {/* AI Insights Section */}
          <section className="p-6 rounded-lg border border-[#CFDBE8] bg-white shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-2 mb-6 relative">
              <Sparkles size={20} className="text-yellow-500" />
              <h2 className="text-lg font-bold">AI Insights</h2>
            </div>
            
            <div className="mb-6 relative">
              <h3 className="text-[#4D7399] text-base font-medium mb-3">Key Findings</h3>
              <ul className="space-y-2 text-black text-base leading-relaxed">
                <li className="flex gap-2">
                  <span className="font-bold text-green-500">•</span>
                  Users consistently praised the new responsive UI for mobile devices.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-500">•</span>
                  Onboarding flow shows a 15% drop-off at the "Integration" step.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-500">•</span>
                  High demand for enterprise-grade reporting features.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 relative mt-8">
              <InsightTag label="Quality" count={123} color="#C5EFB5" />
              <InsightTag label="Professional" count={110} color="#B5E9EF" />
              <InsightTag label="Efficient" count={95} color="#C0B5EF" />
              <InsightTag label="Timely" count={75} color="#EFCCB5" />
              <InsightTag label="Friendly" count={80} color="#EFE4B5" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
