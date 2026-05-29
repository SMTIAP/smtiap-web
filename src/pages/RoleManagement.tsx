import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import { ArrowLeft, Search, Plus, ClipboardList, Trash2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

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
}

interface UserTenantRole {
  _id: string;
  role: string;
  userId: { _id: string; username: string; email: string };
  tenantId: { _id: string; name: string };
  status: "active" | "inactive";
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
    admin: "Tenant Admin",
    viewer: "Viewer",
    creator: "Creator",
    billing_manager: "Billing Manager",
  };

  const token = localStorage.getItem("token");
  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const id = localStorage.getItem("activeTenantId");
    if (id && id !== "__system__") headers["x-tenant-id"] = id;
    return headers;
  };

  const confirmAsync = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 w-80">
            <p className="text-base text-gray-800 dark:text-slate-200 mb-5 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(t);
                  resolve(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  resolve(true);
                }}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "bottom-right" },
      );
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/role-management", {
          headers: authHeaders(),
          credentials: "include",
        });
        const data = await response.json();
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
        const response = await fetch("http://localhost:5000/api/role-management/tenants", {
          headers: authHeaders(),
          credentials: "include",
        });
        const data = await response.json();
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
        const response = await fetch("http://localhost:5000/api/role-management/user-tenant", {
          headers: authHeaders(),
          credentials: "include",
        });
        const data = await response.json();
        setOrgUsers(data);
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

  const canManageTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t._id === tenantId);
    if (!tenant || !currentUserId) return false;

    const isActiveMember = orgUsers.some(
      u =>
        u.tenantId._id === tenantId &&
        u.userId._id === currentUserId &&
        u.status === "active"
    );

    const isCreator = tenant.createdBy === currentUserId && isActiveMember;
    const isTenantAdmin = orgUsers.some(
      u =>
        u.tenantId._id === tenantId &&
        u.userId._id === currentUserId &&
        u.role === "admin" &&
        u.status === "active"
    );

    return isCreator || isTenantAdmin;
  };

  const canManageTenantId = (tenantId: string) => {
    const tenant = tenants.find((t) => t._id === tenantId);
    if (!tenant || !currentUserId) return false;

    const isActiveMember = orgUsers.some(
      (u) =>
        u.tenantId._id === tenantId &&
        u.userId._id === currentUserId &&
        u.status === "active"
    );

    const isCreator = tenant.createdBy === currentUserId && isActiveMember;
    const isTenantAdmin = orgUsers.some(
      (u) =>
        u.tenantId._id === tenantId &&
        u.userId._id === currentUserId &&
        u.role === "admin" &&
        u.status === "active"
    );

    return isCreator || isTenantAdmin;
  };

  const isActiveTenantAdmin = (tenantId: string) =>
    orgUsers.some(
      (u) =>
        u.tenantId._id === tenantId &&
        u.userId._id === currentUserId &&
        u.role === "admin" &&
        u.status === "active"
    );

  const filteredUsers = searchTerm.trim()
    ? users.filter((user) =>
        user.role !== "super_admin" &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const filteredOrganizations = tenants.filter((tenant) =>
    orgUsers.some(
      (u) =>
        u.tenantId._id === tenant._id &&
        u.userId._id === currentUserId &&
        u.status === "active"
    )
  );

  const handleAddUser = async (user: User, tenant: Tenant) => {
    if (!canManageTenant(tenant._id)) {
      toast.error("Only the organization creator can add users");
      return;
    }
    const confirmed = await confirmAsync(`Add "${user.username}" to "${tenant.name}"?`);
    if (!confirmed) return;
    try {
      const newRole = selectedRole[user._id] || "viewer";
      const response = await fetch(`http://localhost:5000/api/role-management/${user._id}/${tenant._id}`, {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "User already assigned to this organization");
        return;
      }
      toast.success("User added successfully");
      const updatedOrg = await fetch("http://localhost:5000/api/role-management/user-tenant", {
        headers: authHeaders(),
        credentials: "include",
      });
      setOrgUsers(await updatedOrg.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrgRole = async (item: UserTenantRole) => {
    if (!isActiveTenantAdmin(item.tenantId._id)) {
      toast.error("Only the organization creator can change roles");
      return;
    }

    const newRole = selectedRole[item._id];
    const changingTenantAdminRole = item.role === "admin" && newRole !== "admin";

    if (changingTenantAdminRole) {
      const otherAdmins = orgUsers.filter(
        (u) =>
          u.tenantId._id === item.tenantId._id &&
          u._id !== item._id &&
          u.role === "admin"
      );
      if (otherAdmins.length === 0) {
        toast.error("This organization must have at least one Tenant Admin");
        return;
      }
    }

    const confirmed = await confirmAsync(`Update role for "${item.userId.username}"?`);
    if (!confirmed) return;
    try {
      const response = await fetch(`http://localhost:5000/api/role-management/${item.userId._id}/${item.tenantId._id}/role`, {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update role");
      }
      setOrgUsers((prev) =>
        prev.map((u) =>
          u._id === item._id
            ? { ...u, role: data?.newRole ?? data?.updated?.role ?? newRole }
            : u,
        ),
      );
      setSelectedRole((prev) => {
        const copy = { ...prev };
        delete copy[item._id];
        return copy;
      });
      toast.success("User role updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveOrgUser = async (item: UserTenantRole) => {
    if (!canManageTenant(item.tenantId._id)) {
      toast.error("Only the organization creator can remove users");
      return;
    }

    if (item.role === "admin") {
      const otherAdmins = orgUsers.filter(
        (u) =>
          u.tenantId._id === item.tenantId._id &&
          u.userId._id !== item.userId._id &&
          u.role === "admin"
      );
      if (otherAdmins.length === 0) {
        toast.error("You cannot remove the last Tenant Admin in this organization");
        return;
      }
    }

    const confirmed = await confirmAsync(`Remove "${item.userId.username}" from "${item.tenantId.name}"? They can be re-added later.`);
    if (!confirmed) return;
    try {
      const response = await fetch(`http://localhost:5000/api/role-management/${item.userId._id}/${item.tenantId._id}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to remove user");
      }
      setOrgUsers((prev) => prev.filter((u) => u._id !== item._id));
      toast.success("User removed from organization. They can be re-added later.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove user");
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!canManageTenant(tenant._id)) {
      toast.error("Only the organization creator can delete this organization");
      return;
    }

    const confirmed = await confirmAsync(`Delete "${tenant.name}" organization? This will mark it as inactive.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/role-management/tenant/${tenant._id}`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ status: "inactive" }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete organization");
      }
      toast.success("Organization and related users marked as inactive");
      setTenants((prev) => prev.filter((t) => t._id !== tenant._id));
      setSelectedTenantId("");
      const updatedOrgUsers = await fetch("http://localhost:5000/api/role-management/user-tenant", {
        headers: authHeaders(),
        credentials: "include",
      });
      setOrgUsers(await updatedOrgUsers.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete organization");
    }
  };

  type GroupedTenant = {
    tenant: { _id: string; name: string };
    creator: string | null;
    users: UserTenantRole[];
  };

  const groupedUsers = (): GroupedTenant[] => {
    const tenantMap = new Map(tenants.map((t) => [t._id, t]));
    const map = new Map<string, GroupedTenant>();

    orgUsers
      .filter((item) => item.status !== "inactive")
      .forEach((item) => {
        const tenantId = item.tenantId._id;
        if (!map.has(tenantId)) {
          const fullTenant = tenantMap.get(tenantId);
          map.set(tenantId, {
            tenant: { _id: item.tenantId._id, name: item.tenantId.name },
            creator: fullTenant?.createdBy || null,
            users: [],
          });
        }
        map.get(tenantId)!.users.push(item);
      });
    return Array.from(map.values());
  };

  const groupedData = groupedUsers().filter((group) =>
    group.tenant.name.toLowerCase().includes(searchOrganization.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="w-full max-w-6xl px-6 py-10 flex flex-col gap-10">
        {/* Header - Title on left, buttons on right */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 w-fit">
            <h2 className="text-3xl font-black tracking-tight text-[#0D141C] dark:text-white">
              Employees and Role Management
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/organization-registration")}
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shrink-0"
            >
              <Plus size={18} />Create Organization
            </button>
            <button
              onClick={() => navigate("/audit-log")}
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shrink-0"
            >
              <ClipboardList size={18} />Audit Logs
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 w-full items-center">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder:text-slate-400"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full md:w-72 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
          >
            <option value="">Select Organization</option>
            {filteredOrganizations.filter((tenant) => tenant.status === "active" && isActiveTenantAdmin(tenant._id)).map((tenant) => (
              <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
            ))}
          </select>
          <button
            disabled={!selectedTenantId || !canManageTenantId(selectedTenantId)}
            onClick={() => {
              const tenant = tenants.find(t => t._id === selectedTenantId);
              if (tenant) handleDeleteTenant(tenant);
            }}
            className={`flex items-center gap-1.5 px-4 h-[40px] rounded-lg text-white font-semibold text-[13px] shadow-md transition-all duration-200 shrink-0 ${
              !selectedTenantId || !canManageTenantId(selectedTenantId)
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
            }`}
          >
            <Trash2 size={16} /> Delete Organization
          </button>
        </div>

        {/* Users Table */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-3 text-slate-800 dark:text-slate-200 font-medium">{user.username}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-3">
                      <select
                        value={selectedRole[user._id] || user.role}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedRole((prev) => {
                            const updated = { ...prev };
                            if (value === user.role) delete updated[user._id];
                            else updated[user._id] = value;
                            return updated;
                          });
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="admin">Tenant Admin</option>
                        <option value="viewer">Viewer</option>
                        <option value="creator">Creator</option>
                        <option value="billing_manager">Billing Manager</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => {
                          const tenant = tenants.find(t => t._id === selectedTenantId);
                          if (!tenant) return;
                          handleAddUser(user, tenant);
                        }}
                        disabled={!selectedTenantId}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                          !selectedTenantId ? "bg-slate-300 dark:bg-slate-600 text-white cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        Add User
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No Users Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Organization Members Section */}
        <div className="mt-4">
          <h3 className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-white mb-4">Organization Members</h3>
          <div className="relative w-full md:max-w-md mb-4">
            <input
              type="text"
              placeholder="Search organization..."
              value={searchOrganization}
              onChange={(e) => setSearchOrganization(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder:text-slate-400"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Org Members Table */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Organization</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.length > 0 ? (
                groupedData.map((group) => {
                  const visibleUsers = canManageTenant(group.tenant._id)
                    ? group.users
                    : group.users.filter((u: any) => u.userId._id === currentUserId);
                  if (visibleUsers.length === 0) return null;
                  return (
                    <Fragment key={group.tenant._id}>
                      <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                        <td colSpan={5} className="px-6 py-3">
                          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold">
                            🏢 {group.tenant.name}
                          </div>
                        </td>
                      </tr>
                      {visibleUsers.map((item) => (
                        <tr key={item._id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                          <td className="px-6 py-3 text-slate-800 dark:text-slate-200 font-medium">{item.userId.username}</td>
                          <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{item.userId.email}</td>
                          <td className="px-6 py-3">
                            <select
                              value={selectedRole[item._id] || item.role}
                              onChange={(e) => setSelectedRole((prev) => ({ ...prev, [item._id]: e.target.value }))}
                              disabled={!isActiveTenantAdmin(group.tenant._id)}
                              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                            >
                              {Object.entries(roleLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{item.tenantId.name}</td>
                          <td className="px-6 py-3">
                            {isActiveTenantAdmin(group.tenant._id) && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateOrgRole(item)}
                                  disabled={!selectedRole[item._id] || selectedRole[item._id] === item.role}
                                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                                    !selectedRole[item._id] || selectedRole[item._id] === item.role
                                      ? "bg-slate-300 dark:bg-slate-600 text-white cursor-not-allowed"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  }`}
                                >
                                  Change
                                </button>
                                <button
                                  onClick={() => handleRemoveOrgUser(item)}
                                  className="px-3 py-1.5 text-sm rounded-lg font-medium bg-rose-500 hover:bg-rose-600 text-white transition"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No Organizations Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}