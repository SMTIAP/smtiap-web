import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import { Search, Target } from 'lucide-react';

interface User {
    _id: string;
    username: string,
    email: string;
    role: string;
}

export default function RoleManagement(){

    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/role-management");

                const data = await response.json();

                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))


    const handleRoleChange = async (user: User) => {
        try {
            const newRole = selectedRole[user._id];
            // console.log("Updating user:", user._id);
// console.log("New role:", newRole);
            const response = await fetch (
                
                `http://localhost:5000/api/role-management/${user._id}/role`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ role: newRole })
                }
            )

            if(!response.ok) {
                throw new Error("Failed to update role");
            }

            const updatedUser = await response.json();

            // update UI immediately
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === user._id ? { ...u, role: updatedUser.role } : u
                )
            );

            // clear selection after success
            setSelectedRole((prev) => {
                const updated = { ...prev };
                delete updated[user._id];
                return updated;
            });

        } catch(error){
            console.error("Error updating role:", error);
        }
    }
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
                        <button onClick={() => navigate("/audit-log")}
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            Audit Logs
                        </button>
                    </div>
                    
                    {/* <h1>Role Management</h1> */}
                </div>

                {/* Search Bar */}
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

                <div className="w-full overflow-x-auto mt-6">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Email</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Current Role</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (

                            
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
                                        onClick={() => handleRoleChange(user)}
                                        disabled={!selectedRole[user._id] || selectedRole[user._id] === user.role}
                                        className={`px-3 py-1 bg-blue-500 text-white text-sm rounded ${
                                            !selectedRole[user._id] ?
                                                "bg-gray-400 cursor-not-allowed" :
                                                "bg-blue-500 hover:bg-blue-600"
                                        }`}>
                                            Change
                                    </button>
                                    <button 
                                        disabled={user.role === "viewer"}
                                        className={`px-3 py-1 bg-blue-500 text-white text-sm rounded ${
                                            user.role === "viewer" ?
                                                "bg-gray-400 cursor-not-allowed" :
                                                "bg-blue-500 hover:bg-blue-600"   }`}
                                            >
                                        Remove
                                    </button>
                                    </td>
                                </tr>
                            ))}
                            {/* // <tr className="border-b border-gray-300 hover:bg-gray-50">
                            //     <td className="px-6 py-4 text-gray-800">Namal Kumara</td>
                            //     <td className="px-6 py-4 text-gray-800">namal@comp.com</td>
                            //     <td className="px-6 py-4 text-gray-800">
                            //         <select className="w-50 border border-gray-300 rounded-md px-3 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            //             <option>Organization Admin</option>
                            //             <option>Tenant Admin</option>
                            //             <option>Viewer</option>
                            //             <option>Creator</option>
                            //             <option>Billing Manager</option>
                            //         </select>
                            //     </td>
                            //     <td className="px-6 py-4 text-gray-800">
                            //     <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                            //         Remove
                            //     </button>
                            //     </td>
                            // </tr>
                             */}
                            {/* <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">Chamil Gamage</td>
                                <td className="px-6 py-4 text-gray-800">chamil@comp.com</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <select className="w-50 border border-gray-300 rounded-md px-3 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option>Organization Admin</option>
                                        <option>Tenant Admin</option>
                                        <option>Viewer</option>
                                        <option>Creator</option>
                                        <option>Billing Manager</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-gray-800">
                                <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                    Remove
                                </button>
                                </td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>
                
                <br/>
                
                <div className="flex items-center w-fit">
                    <h3 className="text-[#1E293B] font-inter font-bold text-2xl leading-9">
                        Pending Role Requests
                    </h3>
                </div>

                <div className="w-full overflow-x-auto">
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
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">Ruwan Gamage</td>
                                <td className="px-6 py-4 text-gray-800">ruwan@comp.com</td>
                                <td className="px-6 py-4 text-gray-800">Creator</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                            Approve
                                        </button>
                                        <button className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-blue-600">
                                            Deny
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">Hiruna Lakmal</td>
                                <td className="px-6 py-4 text-gray-800">hiruna@comp.com</td>
                                <td className="px-6 py-4 text-gray-800">Tenant Admin</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                            Approve
                                        </button>
                                        <button className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-blue-600">
                                            Deny
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            
                            
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}