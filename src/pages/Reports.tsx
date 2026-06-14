import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { LineChart, Download, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getGeneratedBy,
  addHeaderAndFooter,
  formatFileDateTime,
  formatRole,
} from "../utils/pdfHelpers";
import { exportToCSV } from "../utils/csvHelpers";

// interface User {
//   _id: string;
//   username: string;
//   email: string;
//   role: string;
// }

interface Tenant {
  _id: string;
  name: string;
  createdBy: string;
  status: string;
  domain: string;
  plan: string;
  created_at: string;
  country: string;
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
  tenantName: string;
  scheduled: number;
  published: number;
  stopped: number;
  status: string;
  users: number;
}

// export const formatRole = (role: string) => {
//   return role
//     .split("_")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };
export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();
  // const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  // const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tenants");
  // const [generatedBy, setGeneratedBy] = useState("Unknown");

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

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await fetch("http://localhost:5000/api/users/me", {
  //         headers: authHeaders(),
  //       });

  //       const data = await res.json();
  //       console.log("USER DATA:", data);

  //       setGeneratedBy(data.username || data.email || "Unknown User");
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchUser();
  // }, []);
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
        console.log("API RESULT 1:", data); // 👈 add this
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
        const response = await fetch(
          "http://localhost:5000/api/reports/user-tenant",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const data = await response.json();
        console.log("API RESULT 2:", data); // 👈 add this
        console.log("AUDIT LOGS:", data.auditLogs); // 👈 THIS is what you want
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
        const response = await fetch(
          "http://localhost:5000/api/reports/tenant-activity",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );

        const data = await response.json();

        console.log("TENANT ACTIVITY DATA:", data); // 👈 SEE DATA HERE
        setActivityData(
          Array.isArray(data)
            ? data
            : Array.isArray(data.activityData)
              ? data.activityData
              : [],
        );
        //  setActivityData(data);

        // setActivityData(data); // if you have state
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    fetchTenantActivity();
  }, [location.key]);

  // PDF Exports
  const exportTenantRegistrationsPDF = async () => {
    const doc = new jsPDF();

    const generatedBy = await getGeneratedBy();
    const now = new Date();
    const pageWidth = doc.internal.pageSize.width;

    // Report title below the line
    doc.setFontSize(18);
    doc.setFont("helvetica");
    doc.text("Tenant Registration Report", pageWidth / 2, 32, {
      align: "center",
    });

    // Table
    autoTable(doc, {
      startY: 38,
      head: [["Company", "Domain", "Subscription", "Created Date"]],
      body: tenants.map((tenant) => [
        tenant.name,
        tenant.domain,
        tenant.plan,
        new Date(tenant.created_at).toLocaleDateString("en-GB"),
      ]),
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
      },

      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();

        // HEADER + FOOTER helper
        addHeaderAndFooter(
          doc,
          "MTSP System",
          generatedBy,
          pageCount,
          data.pageNumber,
        );
      },
    });

    // Download
    doc.save(`tenant-registration-report_${formatFileDateTime(now)}.pdf`);
  };

  const exportUsersPDF = async () => {
    const doc = new jsPDF();

    const generatedBy = await getGeneratedBy();
    const now = new Date();
    const pageWidth = doc.internal.pageSize.width;

    // Report title below the line
    doc.setFontSize(18);
    doc.setFont("helvetica");
    doc.text("User Report", pageWidth / 2, 32, {
      align: "center",
    });

    // Table
    autoTable(doc, {
      startY: 38,
      margin: {
        bottom: 23,
      },
      head: [["Username", "Tenant", "Email", "Role", "Last Login"]],
      body: orgUsers.map((orgUser) => [
        orgUser.userId.username,
        orgUser.tenantId.name,
        orgUser.userId.email,
        formatRole(orgUser.role),
        orgUser.lastLogin
          ? new Date(orgUser.lastLogin).toLocaleString("en-GB")
          : "NEVER",
      ]),
      styles: {
        fontSize: 11,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
      },

      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();

        // HEADER + FOOTER helper
        addHeaderAndFooter(
          doc,
          "MTSP System",
          generatedBy,
          pageCount,
          data.pageNumber,
        );
      },
    });

    // Download
    doc.save(`user-tenant-report_${formatFileDateTime(now)}.pdf`);
  };

  const handleExportPDF = async () => {
    if (activeTab === "tenants") {
      await exportTenantRegistrationsPDF();
    } else if (activeTab === "users") {
      await exportUsersPDF();
    }
    // else if (activeTab === "activity") {
    //   await exportActivityPDF();
    // }
  };

  // CSV Exports
    const exportTenantsCSV = () => {
    exportToCSV(
      "tenant-registrations",
      tenants.map((t) => ({
        name: t.name,
        domain: t.domain,
        plan: t.plan,
        created_at: new Date(t.created_at).toLocaleDateString("en-GB"),
      })),
      ["name", "domain", "plan", "created_at"],
    );
  };

  const exportUsersCSV = () => {
    exportToCSV(
      "user-tenant-registrations",
      orgUsers.map((u) => ({
        username: u.userId.username,
        tenant: u.tenantId.name,
        email: u.userId.email,
        role: formatRole(u.role),
        lastLogin: u.lastLogin
          ? new Date(u.lastLogin).toLocaleString("en-GB")
          : "NEVER",
      })),
      ["username", "tenant", "email", "role", "lastLogin"],
    );
  };

  const handleExportCSV = () => {
    if (activeTab === "tenants") exportTenantsCSV();
    else if (activeTab === "users") exportUsersCSV();
    // else if (activeTab === "activity") exportActivityCSV();
  };

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
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${
                  activeTab === tab
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
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={handleExportPDF}
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

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {tenant.domain}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {tenant.plan}
                    </td>

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

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {orgUser.tenantId?.name}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {orgUser.userId?.email}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {formatRole(orgUser.role)}
                    </td>

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {orgUser.lastLogin
                        ? new Date(orgUser.lastLogin).toLocaleString("en-GB")
                        : "NEVER"}
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
                    Users
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Total Surveys
                  </th>

                  {/* <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Scheduled
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Published
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Stopped
                  </th> */}
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

                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {activity.users}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {activity.totalSurveys}
                    </td>

                    {/* <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{activity.scheduled}</td> */}

                    {/* <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {activity.published}
                    </td> */}
                    {/* <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      {activity.stopped}
                    </td> */}
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                      -
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          activity.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </span>
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
