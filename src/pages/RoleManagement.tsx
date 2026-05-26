import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import BackButton from "../components/BackButton";
import { Search, Plus, ClipboardList, Trash2 } from "lucide-react";
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
    // super_admin: "Organization Admin",
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

  // Sonner-based confirmation dialog (returns a promise)
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
        const response = await fetch(
          "http://localhost:5000/api/role-management",
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrganizationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
  const currentUserId: string | null = (() => {
    if (!token) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (jwtDecode<any>(token) as any)?.id ?? null;
    } catch {
      return null;
    }
  })();

  // Helper: check if the current user is the creator of the tenant a membership belongs to
  // const isCreatorOfTenant = (membership: UserTenantRole): boolean => {
  //   if (!currentUserId) return false;
  //   const tenant = tenants.find((t) => t._id === membership.tenantId._id);
  //   if (!tenant) return false;
  //   return tenant.createdBy === currentUserId;
  // };

  // Helper: check if the current user is the creator of a given tenant by ID
  // const isCreatorOfTenantId = (tenantId: string): boolean => {
  //   if (!currentUserId) return false;
  //   const tenant = tenants.find((t) => t._id === tenantId);
  //   if (!tenant) return false;
  //   return tenant.createdBy === currentUserId;
  // };

const canManageTenant = (tenantId: string) => {
  const tenant = tenants.find(t => t._id === tenantId);
  if (!tenant || !currentUserId) return false;

  const isCreator = tenant.createdBy === currentUserId;

  const isTenantAdmin = orgUsers.some(
    u =>
      u.tenantId._id === tenantId &&
      u.userId._id === currentUserId &&
      u.role === "admin"
  );

  return isCreator || isTenantAdmin;
};

const canManageTenantId = (tenantId: string) => {
  const tenant = tenants.find((t) => t._id === tenantId);
  if (!tenant || !currentUserId) return false;

  const isCreator = tenant.createdBy === currentUserId;

  const isTenantAdmin = orgUsers.some(
    (u) =>
      u.tenantId._id === tenantId &&
      u.userId._id === currentUserId &&
      u.role === "admin"
  );

  return isCreator || isTenantAdmin;
};

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
    if (!canManageTenant(tenant._id)) {
      toast.error("Only the organization creator can add users");
      return;
    }
    const confirmed = await confirmAsync(
      `Add "${user.username}" to "${tenant.name}"?`,
    );
    if (!confirmed) return;
    try {
      const newRole = selectedRole[user._id] || "viewer";
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
        toast.error(
          data.message || "User already assigned to this organization",
        );
        return;
      }
      toast.success("User added successfully");
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
    if (!canManageTenant(item.tenantId._id)){
      toast.error("Only the organization creator can change roles");
      return;
    }
    const confirmed = await confirmAsync(
      `Update role for "${item.userId.username}"?`,
    );
    if (!confirmed) return;
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
    if (!canManageTenant(item.tenantId._id)){
      toast.error("Only the organization creator can remove users");
      return;
    }
    const confirmed = await confirmAsync(
      `Remove "${item.userId.username}" from "${item.tenantId.name}"? They can be re-added later.`,
    );
    if (!confirmed) return;
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
      toast.success(
        "User removed from organization. They can be re-added later.",
      );
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

  const confirmed = await confirmAsync(
    `Delete "${tenant.name}" organization? This will mark it as inactive.`,
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/role-management/tenant/${tenant._id}`,
      {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          status: "inactive",
        }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Failed to delete organization");
    }

    toast.success("Organization and related users marked as inactive");

    // Remove from frontend list immediately
    setTenants((prev) =>
      prev.filter((t) => t._id !== tenant._id),
    );

    // Clear selected organization
    setSelectedTenantId("");

    // Refresh organization users list
    const updatedOrgUsers = await fetch(
      "http://localhost:5000/api/role-management/user-tenant",
      {
        headers: authHeaders(),
        credentials: "include",
      },
    );

    setOrgUsers(await updatedOrgUsers.json());
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete organization");
  }
};

type GroupedTenant = {
  tenant: {
    _id: string;
    name: string;
  };
  creator: string | null;
  users: UserTenantRole[];
};

const groupedUsers = (): GroupedTenant[] => {
  const tenantMap = new Map(tenants.map((t) => [t._id, t]));

  const map = new Map<string, GroupedTenant>();

  orgUsers.forEach((item) => {
    const tenantId = item.tenantId._id;

    if (!map.has(tenantId)) {
      const fullTenant = tenantMap.get(tenantId);

      map.set(tenantId, {
        tenant: {
          _id: item.tenantId._id,
          name: item.tenantId.name,
        },
        creator: fullTenant?.createdBy || null,
        users: [],
      });
    }

    map.get(tenantId)!.users.push(item);
  });

  return Array.from(map.values());
};

  const groupedData = groupedUsers().filter((group) =>
  group.tenant.name
    .toLowerCase()
    .includes(searchOrganization.toLowerCase())
);






  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="w-full max-w-6xl px-6 py-10 flex flex-col gap-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 w-fit">
            <BackButton />
            <h1 className="text-[#1E293B] dark:text-white font-inter text-3xl font-bold leading-9">
              Employees and Role Management
            </h1>
          </div>
          <div className="flex justify-end gap-2">
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
            {filteredOrganizations.filter((tenant) => tenant.status === "active" && canManageTenantId(tenant._id)).map((tenant) => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <button
            disabled={
              !selectedTenantId || !canManageTenantId(selectedTenantId)
            }
            title={
              !selectedTenantId
                ? "Select an organization first"
                : !canManageTenantId(selectedTenantId)
                  ? "Only the organization creator can delete it"
                  : undefined
            }
            onClick={() => {
              const tenant = tenants.find(t => t._id === selectedTenantId);
              if (tenant) handleDeleteTenant(tenant);
            }}
            className={`flex items-center gap-1.5 px-4 h-[40px] rounded-lg text-white font-semibold text-[13px] shadow-md transition-all duration-200 shrink-0
              ${
                !selectedTenantId || !canManageTenantId(selectedTenantId)
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg hover:scale-[1.02]"
              }`}
          >
            <Trash2 size={16} />
            Delete Organization
          </button>
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
                        {/* <option value="super_admin">Organization Admin</option> */}
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
                            : undefined
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
  {groupedData.length > 0 ? (
    groupedData.map((group) => {
      const visibleUsers = canManageTenant(group.tenant._id)
  ? group.users
  : group.users.filter(
      (u: any) => u.userId._id === currentUserId
    );

      if (visibleUsers.length === 0) return null;

      return (
        <Fragment key={group.tenant._id}>
          {/* Tenant header row */}
          <tr className="bg-gray-100 dark:bg-slate-900">
            <td
              colSpan={5}
              className="px-6 py-3 font-bold text-indigo-600"
            >
              🏢 {group.tenant.name}
            </td>
          </tr>

          {/* Users */}
          {visibleUsers.map((item) => (
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
                  disabled={!canManageTenant(group.tenant._id)}
                  // disabled={group.creator !== currentUserId}
                  className="w-50 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
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

              <td className="px-6 py-4">
                {canManageTenant(group.tenant._id) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateOrgRole(item)}
                      disabled={
                        !selectedRole[item._id] ||
                        selectedRole[item._id] === item.role
                      }
                      className={`px-3 py-1 text-white text-sm rounded ${
                        !selectedRole[item._id] ||
                        selectedRole[item._id] === item.role
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
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
                )}
              </td>
            </tr>
          ))}
        </Fragment>
      );
    })
  ) : (
    <tr>
      <td colSpan={5} className="text-center py-4">
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
