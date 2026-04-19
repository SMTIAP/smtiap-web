import { Link } from "react-router-dom";
import {
  Plus,
  BarChart3,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  FileText,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Tooltip, Legend, ArcElement);

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color: string;
}

const StatCard = ({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color,
}: StatCardProps) => (
  <div className="flex flex-col p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg`}
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      {change && (
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            changeType === "positive"
              ? "text-green-600 bg-green-50"
              : changeType === "negative"
                ? "text-red-600 bg-red-50"
                : "text-gray-600 bg-gray-50"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-[#1E293B] mb-1">{value}</p>
    <p className="text-sm text-[#64748B]">{label}</p>
  </div>
);

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  to?: string;
  color: string;
  onClick?: () => void;
}

const QuickAction = ({
  label,
  icon: Icon,
  to,
  color,
  onClick,
}: QuickActionProps) => {
  const content = (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:shadow-md hover:-translate-y-0.5 transition-all w-full"
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <span className="text-sm font-medium text-[#1E293B]">{label}</span>
    </button>
  );

  return to ? (
    <Link to={to} className="w-full no-underline">
      {content}
    </Link>
  ) : (
    content
  );
};

interface SurveyItemProps {
  title: string;
  responses: number;
  status: "Running" | "Draft" | "Finished";
  date: string;
  to?: string;
}

const SurveyItem = ({
  title,
  responses,
  status,
  date,
  to,
}: SurveyItemProps) => (
  <div className="flex items-center justify-between p-4 rounded-lg border border-[#F1F5F9] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
        <FileText size={18} className="text-[#6366F1]" />
      </div>
      <div>
        <p className="font-semibold text-[#1E293B]">{title}</p>
        <p className="text-xs text-[#94A3B8]">
          {responses} responses • {date}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          status === "Running"
            ? "text-green-600 bg-green-50"
            : status === "Draft"
              ? "text-orange-500 bg-orange-50"
              : "text-red-500 bg-red-50"
        }`}
      >
        {status}
      </span>
      {to && <ArrowRight size={16} className="text-[#94A3B8]" />}
    </div>
  </div>
);

function CreatorDashboard() {
  // Chart data for Doughnut
  const statusData = {
    labels: ["Running", "Draft", "Finished"],
    datasets: [
      {
        data: [5, 2, 8],
        backgroundColor: ["#22C55E", "#F97316", "#EF4444"],
        borderWidth: 0,
      },
    ],
  };

  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: "Inter", size: 12, weight: "bold" as const },
          color: "#64748B",
        },
      },
    },
    cutout: "70%",
  };

  const recentSurveys = [
    {
      title: "Customer Satisfaction Survey",
      responses: 156,
      status: "Running" as const,
      date: "2 hours ago",
      to: "/response",
    },
    {
      title: "Product Feedback Form",
      responses: 89,
      status: "Running" as const,
      date: "5 hours ago",
      to: "/response",
    },
    {
      title: "Employee Engagement Quiz",
      responses: 0,
      status: "Draft" as const,
      date: "1 day ago",
    },
    {
      title: "Market Research Survey",
      responses: 234,
      status: "Finished" as const,
      date: "3 days ago",
      to: "/analytics",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-[1200px] py-10 px-6 flex-col items-start gap-8 w-full">
        {/* Header Section */}
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col">
            <h1 className="text-[#1E293B] text-3xl font-bold mb-2">
              Creator Dashboard
            </h1>
            <p className="text-[#64748B]">
              Welcome back! Here's what's happening with your surveys.
            </p>
          </div>
          <Link
            to="/create-new-survey"
            className="flex items-center gap-2 py-3 px-6 rounded-lg bg-[#6366F1] text-white font-bold text-sm shadow-md hover:bg-[#5558E3] hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Create Survey
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <StatCard
            label="Total Surveys"
            value={15}
            changeType="positive"
            icon={FileText}
            color="#6366F1"
          />
          <StatCard
            label="Total Responses"
            value="2,847"
            changeType="positive"
            icon={MessageSquare}
            color="#22C55E"
          />
          <StatCard
            label="Avg. Completion"
            value="87%"
            changeType="positive"
            icon={CheckCircle2}
            color="#F59E0B"
          />
          <StatCard
            label="Active Surveys"
            value={5}
            icon={TrendingUp}
            color="#EF4444"
          />
        </div>
        {/* Quick Actions */}
        <div className="w-full">
          <div className="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <h2 className="text-lg font-bold text-[#1E293B] mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction
                label="New Survey"
                icon={Plus}
                to="/create-new-survey"
                color="#6366F1"
              />
              <QuickAction
                label="View Templates"
                icon={FileText}
                to="/templates"
                color="#22C55E"
              />
              <QuickAction
                label="View Analytics"
                icon={BarChart3}
                to="/analytics"
                color="#F59E0B"
              />
              <QuickAction
                label="View Responses"
                icon={Eye}
                to="/response"
                color="#EF4444"
              />
            </div>
          </div>
        </div>
        {/* Survey Status + Recent Surveys */}
        <div className="w-full">
          <div className="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] mb-6">
                  Survey Status
                </h2>
                <div className="h-48 mb-4">
                  <Doughnut data={statusData} options={statusOptions} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#22C55E]">5</p>
                    <p className="text-xs text-[#64748B]">Running</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#F97316]">2</p>
                    <p className="text-xs text-[#64748B]">Draft</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#EF4444]">8</p>
                    <p className="text-xs text-[#64748B]">Finished</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1E293B]">
                    Recent Surveys
                  </h2>
                  <Link
                    to="/created-surveys"
                    className="text-sm text-[#6366F1] font-medium hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {recentSurveys.map((survey, idx) => (
                    <SurveyItem key={idx} {...survey} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorDashboard;
