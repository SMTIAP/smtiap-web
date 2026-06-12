import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { LineChart, Download, ArrowLeft } from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface Tenant {
  _id: string;
  name: string;
  createdBy: string;
  status: string;
  domain: string;
  plan: string;
  created_at: string;
}

interface UserTenantRole {
  _id: string;
  role: string;
  userId: { _id: string; username: string; email: string };
  tenantId: { _id: string; name: string };
  status: "active" | "inactive";
  lastLogin: string | null;
}

interface AuditLog {
  _id: string;
  action: string;
  createdAt: string;
  userId?: string;
}

interface TenantActivity {
  _id: string;
  totalSurveys: number;
  drafts: number;
  tenantName: string
  scheduled: number;
  published: number;
  stopped: number;
}

export const formatRole = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tenants");

  // const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [orgUsers, setOrgUsers] = useState<UserTenantRole[]>([]);
  const [auditLogs, setauditLogs] = useState<AuditLog[]>([]);
  const [activityData, setActivityData] = useState<TenantActivity[]>([]);

  const token = localStorage.getItem("token");
  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const id = localStorage.getItem("activeTenantId");
    if (id && id !== "system") headers["x-tenant-id"] = id;
    return headers;
  };


  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/reports/tenants/my",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const data = await response.json();
        console.log("API RESULT 1:", data);
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };
    fetchTenants();
  }, [location.key]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reports/user-tenant", {
          headers: authHeaders(),
          credentials: "include",
        });
        const data = await response.json();
        console.log("API RESULT 2:", data);
        console.log("AUDIT LOGS:", data.auditLogs);
        // setOrgUsers(Array.isArray(data) ? data : []);
        setOrgUsers(data.users ?? []);
        setauditLogs(data.auditLogs ?? []);
        console.log("ORG USERS:", orgUsers);

        // setauditLogs([]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrganizationData();
  }, [location.key]);

  const currentUserId: string | null = (() => {
    if (!token) return null;
    try {
      return (jwtDecode<any>(token) as any)?.id ?? null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchTenantActivity = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reports/tenant-activity",
          {
            headers: authHeaders(),
            credentials: "include",
          }
        );

        const data = await response.json();

        console.log("TENANT ACTIVITY DATA:", data);
        setActivityData(
          Array.isArray(data)
            ? data
            : Array.isArray(data.activityData)
              ? data.activityData
              : []
        );
        //  setActivityData(data);

        // setActivityData(data); // if you have state
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    fetchTenantActivity();
  }, [location.key]);

  //   const getLastLogin = (userId: string) => {
  //   const logs = auditLogs
  //     .filter((log) => log.userId === userId && log.action === "login")
  //     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  //   return logs[0]?.createdAt ?? null;
  // };

  // const isActiveTenantAdmin = (tenantId: string) =>
  //   orgUsers.some(
  //     (u) =>
  //       u.tenantId._id === tenantId &&
  //       u.userId._id === currentUserId &&
  //       u.role === "admin" &&
  //       u.status === "active",
  //   );

  // const filteredUsers = searchTerm.trim()
  //   ? users.filter(
  //     (user) =>
  //       user.role !== "super_admin" &&
  //       user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  //   )
  //   : [];

  // const filteredOrganizations = tenants.filter((tenant) =>
  //   orgUsers.some(
  //     (u) =>
  //       u.tenantId._id === tenant._id &&
  //       u.userId._id === currentUserId &&
  //       u.status === "active",
  //   ),
  // );

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      {/* Top Gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="w-full max-w-6xl px-6 py-10 flex flex-col gap-8">
        {/* HEADER */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#0D141C] dark:text-white">
              Reports
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

        {/* TABS + EXPORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex gap-3 flex-wrap">
            {["tenants", "users", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${activeTab === tab
                  ? "flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] border-indigo-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  }`}
              >
                {tab === "tenants" && "Tenant Registrations"}
                {tab === "users" && "Tenant Users"}
                {tab === "activity" && "Tenant Activity"}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => console.log("Export CSV")}
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={() => console.log("Export PDF")}
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
        {/* TABLE SECTION */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {/* TENANTS */}
          {activeTab === "tenants" && (
            <table className="min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Company
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Domain
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Subscription
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr
                    key={tenant._id}
                    className="border-b border-slate-100 dark:border-slate-700"
                  >
                    <td className="px-6 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {tenant.name}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{tenant.domain}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{tenant.plan}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {new Date(tenant.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === "users" && (
            <table className="min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Username
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Tenant
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgUsers.map((orgUser) => (
                  <tr
                    key={orgUser._id}
                    className="border-b border-slate-100 dark:border-slate-700"
                  >
                    <td className="px-6 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {orgUser.userId?.username}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{orgUser.tenantId?.name}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{orgUser.userId?.email}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{formatRole(orgUser.role)}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {orgUser.lastLogin
                        ? new Date(orgUser.lastLogin).toLocaleString("en-GB")
                        : "NEVER"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === "activity" && (
            <table className="min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Company Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Total Surveys
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Drafts
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Scheduled
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Published
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Stopped
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Responses
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {(activityData ?? []).map((activity) => (
                  <tr
                    key={activity._id}
                    className="border-b border-slate-100 dark:border-slate-700"
                  >
                    <td className="px-6 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {activity.tenantName}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{activity.totalSurveys}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{activity.drafts}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{activity.scheduled}</td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {activity.published}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {activity.stopped}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      -
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      -
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}