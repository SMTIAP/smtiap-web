import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  Plus,
  ChevronRight,
  FileText,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/api";

interface FeatureCardProps {
  to?: string;
  icon: LucideIcon;
  gradient: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const FeatureCard = ({
  to,
  icon: Icon,
  gradient,
  title,
  description,
  badge,
  badgeColor,
}: FeatureCardProps) => {
  const content = (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 transition-all duration-300 p-6 h-full flex flex-col cursor-pointer">
      {/* Upper segment: icon + badge */}
      <div className="flex items-start justify-between mb-5">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${gradient} shadow-sm shrink-0`}
        >
          <Icon size={22} className="text-white" />
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${badgeColor}`}
        >
          {badge}
        </span>
      </div>
      {/* Lower segment: title + description + link */}
      <h3 className="text-gray-900 font-bold text-lg mb-1.5">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5">
        {description}
      </p>
      <div className="border-t border-gray-50 pt-4 mt-auto">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:gap-2 transition-all">
          Explore Portal{" "}
          <ChevronRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="w-full h-full no-underline">
      {content}
    </Link>
  ) : (
    <div className="w-full h-full">{content}</div>
  );
};

interface DashboardUser {
  username?: string;
}

interface DashboardStats {
  roles: {
    admin: number;
    creator: number;
    billing_manager: number;
    viewer: number;
  };
  surveys: {
    total: number;
    draft: number;
    published: number;
    ended: number;
  };
  subscription: {
    plan: string;
    startDate: string;
    endDate: string;
    remainingDays: number;
    progressPct: number;
  } | null;
}

export default function OrganizationAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let statsTimer: ReturnType<typeof setInterval> | null = null;

    const fetchUser = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data);
      } catch {
        console.log("Not logged in");
      }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get("http://localhost:5000/api/dashboard/stats");
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    const handleWindowFocus = () => {
      fetchStats();
    };

    fetchUser();
    fetchStats();

    // Keep dashboard values fresh while page is open.
    statsTimer = setInterval(fetchStats, 15000);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (statsTimer) clearInterval(statsTimer);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  if (!user) return <h2>Loading...</h2>;

  const totalUsers =
    (stats?.roles.admin ?? 0) +
    (stats?.roles.creator ?? 0) +
    (stats?.roles.billing_manager ?? 0) +
    (stats?.roles.viewer ?? 0);
  const activePublished = stats?.surveys.published ?? 0;

  const features = [
    {
      title: "Surveys Management",
      icon: FileText,
      to: "/created-surveys",
      gradient: "bg-linear-to-br from-indigo-500 to-purple-600",
      description:
        "Craft, distribute and monitor active system feedback forms.",
      badge: `${activePublished} Active`,
      badgeColor: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Employees & Team",
      icon: Users,
      to: "/role-management",
      gradient: "bg-linear-to-br from-indigo-500 to-purple-600",
      description:
        "Manage roles, permission privileges and organizational growth.",
      badge: `${totalUsers} Users`,
      badgeColor: "text-purple-600 bg-purple-50",
    },
    {
      title: "Billing & Premium",
      icon: CreditCard,
      to: "/subscription",
      gradient: "bg-linear-to-br from-indigo-500 to-purple-600",
      description:
        "Configure licensing, view active invoices, or scale your account.",
      badge: stats?.subscription?.plan
        ? `${stats.subscription.plan} Active`
        : "Free Tier",
      badgeColor: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
      <div className="flex max-w-6xl py-10 px-6 flex-col items-start gap-10 w-full">
        {/* Hero Greeting Card */}
        <div className="relative w-full rounded-2xl bg-white border border-slate-200 shadow-md p-8 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left side */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  Control Center Active
                </span>
              </div>
              <h1 className="text-gray-900 text-3xl md:text-4xl font-extrabold tracking-tight mb-1.5">
                Welcome back, {user?.username || "Admin"}
              </h1>
              <p className="text-gray-400 text-sm max-w-xl">
                Monitor team collaboration, active surveys, and subscription
                metrics seamlessly from one place.
              </p>
            </div>
            {/* Right side */}
            <button
              onClick={() => navigate("/create-new-survey")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 shrink-0"
            >
              <Plus size={18} />
              New Survey
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>

        {/* Status Section */}
        <div className="w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
            <h2 className="text-gray-800 text-xl font-extrabold leading-8 mb-6">
              Organization Status:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Card 1: System Members */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50">
                    <Users size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900">
                      {totalUsers}
                    </span>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      System Members
                    </p>
                  </div>
                </div>
                <div className="space-y-0">
                  {[
                    {
                      label: "Admins",
                      value: stats?.roles.admin ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Creators",
                      value: stats?.roles.creator ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Billing",
                      value: stats?.roles.billing_manager ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Viewers",
                      value: stats?.roles.viewer ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm text-gray-500">
                        {item.label}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${item.color}`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Surveys Status */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-50">
                    <FileText size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900">
                      {stats?.surveys.total ?? "—"}
                    </span>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Total Surveys
                    </p>
                  </div>
                </div>
                <div className="space-y-0">
                  {[
                    {
                      label: "Created Total",
                      value: stats?.surveys.total ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Draft Mode",
                      value: stats?.surveys.draft ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Published",
                      value: stats?.surveys.published ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Ended",
                      value: stats?.surveys.ended ?? "—",
                      color: "bg-blue-100 text-blue-700",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm text-gray-500">
                        {item.label}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${item.color}`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Active Plan Tracker */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50">
                    <CreditCard size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-gray-900 truncate block max-w-40">
                      {stats?.subscription?.plan || "Free"}
                    </span>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Active Plan
                    </p>
                  </div>
                </div>
                {/* Plan badge */}
                <div className="flex justify-center mb-5">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-sm font-bold text-indigo-700">
                    {stats?.subscription?.plan || "Free Tier"}
                  </span>
                </div>
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <CalendarDays
                      size={14}
                      className="mx-auto mb-1 text-gray-400"
                    />
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Start
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {stats?.subscription?.startDate ?? "—"}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <CalendarDays
                      size={14}
                      className="mx-auto mb-1 text-gray-400"
                    />
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Renewal
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {stats?.subscription?.endDate ?? "—"}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="border-t border-gray-50 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Remaining License Period
                    </span>
                    <span className="text-sm font-extrabold text-indigo-600">
                      {stats?.subscription
                        ? `${stats.subscription.remainingDays}d`
                        : "—"}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-emerald-400 via-indigo-400 to-purple-500 transition-all duration-500"
                      style={{
                        width: `${stats?.subscription?.progressPct ?? 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
