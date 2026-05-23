import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { Search } from "lucide-react";
import { jwtDecode } from "jwt-decode";

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
}

interface UserTenantRole {
  _id: string;
  role: string;
  userId: { _id: string; username: string; email: string };
  tenantId: { _id: string; name: string };
}

export default function RoleManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOrganization, setSearchOrganization] = useState("");
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>(
    {},
  );
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [orgUsers, setOrgUsers] = useState<UserTenantRole[]>([]);

  const roleLabels: Record<string, string> = {
    super_admin: "Organization Admin",
    admin: "Tenant Admin",
    viewer: "Viewer",
    creator: "Creator",
    billing_manager: "Billing Manager",
  };

  const token = localStorage.getItem("token");
  const authHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/role-management",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const data = await response.json();
        console.log("TENANTS FROM BACKEND 1:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [location.key]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/role-management/tenants",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const data = await response.json();
        console.log("TENANTS FROM BACKEND 2:", data);
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
          "http://localhost:5000/api/role-management/user-tenant",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const data = await response.json();
        setOrgUsers(data);
        console.log("JOINED DATA:", data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrganizationData();
  }, [location.key]);
  let currentUserId = "";
  if (token) {
    const decoded: any = jwtDecode(token);
    console.log(decoded);
    currentUserId = decoded.id;
    console.log("USER ID:", currentUserId);
  }

  const filteredUsers = searchTerm.trim()
    ? users.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];
  const filteredOrgUsers = orgUsers.filter((item) =>
    item.tenantId.name.toLowerCase().includes(searchOrganization.toLowerCase()),
  );
  // Debug: log tenants data
  console.log("DEBUG tenants state:", tenants);
  console.log("DEBUG tenants length:", tenants.length);

  // Use all tenants the user belongs to (loadTenant middleware already filters by membership)
  const filteredOrganizations = tenants;

  const handleAddUser = async (user: User, tenant: Tenant) => {
    const confirmAdd = window.confirm(
      "Are you sure you want to add this user to the organization?",
    );
    if (!confirmAdd) return;
    try {
      const newRole = selectedRole[user._id] || user.role;
      const response = await fetch(
        `http://localhost:5000/api/role-management/${user._id}/${tenant._id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "User already assigned to this organization");
        return;
      }
      alert("User added successfully");
      // Refresh organization members list
      const updatedOrg = await fetch(
        "http://localhost:5000/api/role-management/user-tenant",
        { headers: authHeaders(), credentials: "include" },
      );
      setOrgUsers(await updatedOrg.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrgRole = async (item: UserTenantRole) => {
    const confirmUpdate = window.confirm(
      "Are you sure you want to update the user role of this organization?",
    );
    if (!confirmUpdate) return;
    try {
      const newRole = selectedRole[item._id];
      const response = await fetch(
        `http://localhost:5000/api/role-management/${item.userId._id}/${item.tenantId._id}/role`,
        {
          method: "PUT",
          headers: authHeaders(),
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        },
      );
      const data = await response.json().catch(() => null);
      console.log("STATUS:", response.status);
      console.log("RESPONSE:", data);
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      setOrgUsers((prev) =>
        prev.map((u) =>
          u._id === item._id ? { ...u, role: data.role ?? newRole } : u,
        ),
      );
      setSelectedRole((prev) => {
        const copy = { ...prev };
        delete copy[item._id];
        return copy;
      });
      alert("User role updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveOrgUser = async (item: UserTenantRole) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this user from the organization?",
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/role-management/${item.userId._id}/${item.tenantId._id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to remove user");
      }
      setOrgUsers((prev) => prev.filter((u) => u._id !== item._id));
      alert("User removed from organization successfully");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="w-full max-w-[1152px] px-6 py-10 flex flex-col gap-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 w-fit">
            <BackButton />
            <h1 className="text-[#1E293B] dark:text-white font-inter text-3xl font-bold leading-9">
              All Employees and Role Management
            </h1>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => navigate("/organization-registration")}
              className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-white font-inter text-sm font-medium transition-opacity hover:opacity-90"
            >
              Create Organization
            </button>
            <button
              onClick={() => navigate("/audit-log")}
              className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-white font-inter text-sm font-medium transition-opacity hover:opacity-90"
            >
              Audit Logs
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">Select Organization</option>
            {filteredOrganizations.map((tenant) => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="w-full overflow-x-auto mt-6">
          <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors duration-300">
            <thead className="bg-gray-100 dark:bg-slate-900">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      <select
                        value={selectedRole[user._id] || user.role}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedRole((prev) => {
                            const updated = { ...prev };
                            if (value === user.role) {
                              delete updated[user._id];
                            } else {
                              updated[user._id] = value;
                            }
                            return updated;
                          });
                        }}
                        className="w-50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <option value="super_admin">Organization Admin</option>
                        <option value="admin">Tenant Admin</option>
                        <option value="viewer">Viewer</option>
                        <option value="creator">Creator</option>
                        <option value="billing_manager">Billing Manager</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200 flex gap-2">
                      <button
                        onClick={() => {
                          const tenant = tenants.find(
                            (t) => t._id === selectedTenantId,
                          );
                          if (!tenant) return;
                          handleAddUser(user, tenant);
                        }}
                        disabled={!selectedTenantId}
                        title={
                          !selectedTenantId
                            ? "Select an organization first"
                            : "Add user to organization"
                        }
                        className={`px-3 py-1 text-white text-sm rounded ${!selectedTenantId ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                      >
                        Add User
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-700 dark:text-slate-400"
                  >
                    No Users Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <br />

        {/* Org Members Header */}
        <div className="flex items-center w-fit">
          <h3 className="text-[#1E293B] dark:text-white font-inter font-bold text-2xl leading-9">
            Organization Members
          </h3>
        </div>

        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search organization..."
            value={searchOrganization}
            onChange={(e) => setSearchOrganization(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Org Members Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors duration-300">
            <thead className="bg-gray-100 dark:bg-slate-900">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Current Role
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Organization
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgUsers.length > 0 ? (
                filteredOrgUsers.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      {item.userId.username}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      {item.userId.email}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      <select
                        value={selectedRole[item._id] || item.role}
                        onChange={(e) =>
                          setSelectedRole((prev) => ({
                            ...prev,
                            [item._id]: e.target.value,
                          }))
                        }
                        className="w-50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        {Object.entries(roleLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      {item.tenantId.name}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrgRole(item)}
                          disabled={
                            !selectedRole[item._id] ||
                            selectedRole[item._id] === item.role
                          }
                          className={`px-3 py-1 text-white text-sm rounded ${!selectedRole[item._id] || selectedRole[item._id] === item.role ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                        >
                          Change
                        </button>
                        <button
                          onClick={() => handleRemoveOrgUser(item)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-700 dark:text-slate-400"
                  >
                    No Organizations Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
