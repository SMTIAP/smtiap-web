import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import { Search, Target } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { toastStyles } from "../utils/toastStyles";


interface User {
    _id: string;
    username: string,
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
    userId: {
        _id: string;
        username: string;
        email: string;
    };
    tenantId: {
        _id: string;
        name: string;
    };
}

export default function RoleManagement(){

    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchOrganization, setSearchOrganization] = useState("");
    const [selectedRole, setSelectedRole] = useState<{[key: string]: string}>({});
    const [selectedTenantId, setSelectedTenantId] = useState<string>("");
    const [orgUsers, setOrgUsers] = useState<UserTenantRole[]>([]);

    const roleLabels: Record<string, string> = {
        super_admin: "Organization Admin",
        admin: "Tenant Admin",
        viewer: "Viewer",
        creator: "Creator",
        billing_manager: "Billing Manager"
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/role-management");

                const data = await response.json();
                // console.log("TENANTS FROM BACKEND 1:", data); // 👈 add this

                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/role-management/tenants");
                const data = await response.json();
                // console.log("TENANTS FROM BACKEND 2:", data); // 👈 add this
                setTenants(data);
            } catch(error){
                console.error("Error fetching tenants:", error);
            }
        };
        fetchTenants();
    }, []);

    
        const fetchOrganizationData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/role-management/user-tenant");
                const data = await response.json();
                setOrgUsers(data);

                // console.log("JOINED DATA:", data);
            } catch (error) {
                console.error(error);
            }
        };
useEffect(() => {
        fetchOrganizationData();
}, []);


//Get User ID
const token = localStorage.getItem("token");
// console.log("TOKEN:", token);
// console.log({
//     Authorization: `Bearer ${token}`
// });

let currentUserId = "";

if (token) {
    const decoded: any = jwtDecode(token);
    // console.log(decoded);
    currentUserId = decoded.id;
    // console.log("USER ID:", currentUserId);
}

    // const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredUsers = searchTerm.trim()
  ? users.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];
    const filteredOrgUsers = orgUsers.filter((item) => item.tenantId.name.toLowerCase().includes(searchOrganization.toLowerCase()));
    

const filteredOrganizations = tenants.filter(
    (tenant) => tenant.createdBy === currentUserId
);
    

const handleAddUser = async (user: User, tenant: Tenant) => {

    const confirmAdd = window.confirm(
        "Are you sure you want to add this user to the organization?"
    );

    if (!confirmAdd) return;
    try {
        const newRole = selectedRole[user._id];

        const response = await fetch(
            `http://localhost:5000/api/role-management/${user._id}/${tenant._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: newRole })
            }
        );

        // if (!response.ok) {
        //     throw new Error("Failed to assign user to tenant");
        // }

        const data = await response.json();
        if (!response.ok) {
            toast.error(data.message || "User already assigned to this organization", {
                style: toastStyles.error,
            });
            return;
        }
        toast.success("User added successfully", {
            style: toastStyles.success,
        });
await fetchOrganizationData();

    } catch (err) {
        console.error(err);
    }
};

const handleUpdateOrgRole = async (item: UserTenantRole) => {
    const confirmUpdate = window.confirm(
        "Are you sure you want to update the user role of this organization?"
    );

    if (!confirmUpdate) return;

    try {
        const newRole = selectedRole[item._id];

        const response = await fetch(
            `http://localhost:5000/api/role-management/${item.userId._id}/${item.tenantId._id}/role`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: newRole })
            }
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error("Failed to update role");
        }

        // const updated = await response.json();

        setOrgUsers((prev) =>
            prev.map((u) =>
                u._id === item._id
                    ? { ...u, role: data.role ?? newRole }
                    : u
            )
        );

        // clear selection
        setSelectedRole((prev) => {
            const copy = { ...prev };
            delete copy[item._id];
            return copy;
        });

        toast.success("User role updated successfully", {
            style: toastStyles.success,
        });
        // alert("User role updated successfully");

    } catch (err) {
        console.error(err);
    }
};

const handleRemoveOrgUser = async (item: UserTenantRole) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to remove this user from the organization?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `http://localhost:5000/api/role-management/${item.userId._id}/${item.tenantId._id}/remove`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
                const data = await response.json().catch(() => null);

    throw new Error(data?.message || "Failed to remove user");
        }

        // remove from UI immediately
        setOrgUsers((prev) =>
            prev.filter((u) => u._id !== item._id)
        );

        toast.success("User removed from organization successfully", {
            style: toastStyles.success,
        });

    } catch (err) {
        console.error(err);
    }
};



// const filteredTenants = tenants.filter(
//     (tenant) => tenant.createdBy === currentUserId
// );

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
            <div className="w-full max-w-[1152px] px-6 py-10 flex flex-col gap-10">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4 w-fit">
                        <BackButton />
                        <h1 className="text-[#1E293B] font-inter text-3xl font-bold leading-9">
                        All Employees and Role Management
                        </h1>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button onClick={() => navigate("/organization-registration")}
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            Create Organization
                        </button>
                        <button onClick={() => navigate("/audit-log")}
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            Audit Logs
                        </button>
                    </div>
                    
                    {/* <h1>Role Management</h1> */}
                </div>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                            
   
                    </div>
                    <select
                        value={selectedTenantId}
                        onChange={(e) => setSelectedTenantId(e.target.value)}
                        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select Organization</option>
                        {/* <option value="">Select Organization</option> */}
{filteredOrganizations.map((tenant) => (
    <option key={tenant._id} value={tenant._id}>
        {tenant.name}
    </option>
))}
                    </select>
                </div>

                <div className="w-full overflow-x-auto mt-6">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Email</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Role</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (

                            
                                    <tr key={user._id} className="border-b border-gray-300 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-800">{user.username}</td>
                                        <td className="px-6 py-4 text-gray-800">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-800">
                                            <select value={selectedRole[user._id] || user.role} 
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setSelectedRole((prev) => {
                                                        const updated = { ...prev };

                                                        if (value === user.role) {
                                                            delete updated[user._id]; // remove if same as original
                                                        } else {
                                                            updated[user._id] = value;
                                                        }

                                                        return updated;
                                                    });
                                                }}
                                                className="w-50 border border-gray-300 rounded-md px-3 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                <option value="super_admin">Organization Admin</option>
                                                <option value="admin">Tenant Admin</option>
                                                <option value="viewer">Viewer</option>
                                                <option value="creator">Creator</option>
                                                <option value="billing_manager">Billing Manager</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 flex gap-2">
                                            <button 
                                                onClick={() => {const tenant = tenants.find(t => t._id === selectedTenantId);
                                                if (!tenant) return;
                                                handleAddUser(user, tenant)}}
                                                disabled={!selectedTenantId}
                                                title={
                                                    !selectedTenantId
                                                        ? "Select an organization first"
                                                        : "Add user to organization"
                                                }
                                                className={`px-3 py-1 text-white text-sm rounded ${
                                                    !selectedTenantId
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-blue-500 hover:bg-blue-600"
                                                }`}>
                                                Add User
                                                
                                            </button>

                                            {/* <button 
                                                onClick={() => handleRoleChange(user)}
                                                disabled={!selectedRole[user._id] || selectedRole[user._id] === user.role}
                                                className={`px-3 py-1 bg-blue-500 text-white text-sm rounded ${
                                                    !selectedRole[user._id] ?
                                                        "bg-gray-400 cursor-not-allowed" :
                                                        "bg-blue-500 hover:bg-blue-600"
                                                }`}>
                                                    Change
                                            </button> */}
                                            {/* <button 
                                                disabled={user.role === "viewer"}
                                                className={`px-3 py-1 bg-blue-500 text-white text-sm rounded ${
                                                    user.role === "viewer" ?
                                                        "bg-gray-400 cursor-not-allowed" :
                                                        "bg-blue-500 hover:bg-blue-600"   }`}
                                                    >
                                                Remove
                                            </button> */}
                                        </td>
                                        
                                    </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-4 text-center text-gray-700"
                                >
                                    No Users Found
                                </td>
                            </tr>
                        )}
                            
                            
                        </tbody>
                    </table>
                </div>
                
                <br/>
                
                <div className="flex items-center w-fit">
                    <h3 className="text-[#1E293B] font-inter font-bold text-2xl leading-9">
                        Organization Members
                    </h3>
                </div>
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search organization..."
                            value={searchOrganization}
                            onChange={(e) => setSearchOrganization(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Email</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Current Role</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Organization</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>

                        
                        <tbody>
                            {filteredOrgUsers.length > 0 ? (
                            filteredOrgUsers.map((item) => (
                                <tr key={item._id} className="border-b border-gray-300 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-800">{item.userId.username}</td>
                                    <td className="px-6 py-4 text-gray-800">{item.userId.email}</td>
                                    <td className="px-6 py-4 text-gray-800">
                                        <select 
                                            value={selectedRole[item._id] || item.role}
                                            onChange={(e) => {
                                                setSelectedRole((prev) => ({
                                                    ...prev,
                                                    [item._id]: e.target.value
                                                }));
                                            }}
                                            className="w-50 border border-gray-300 rounded-md px-3 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >{Object.entries(roleLabels).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}</select>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800">{item.tenantId.name}</td>
                                    <td className="px-6 py-4 text-gray-800">
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
                                            <button onClick={() => handleRemoveOrgUser(item)} className="px-3 py-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
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
                                    className="px-6 py-4 text-center text-gray-700"
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