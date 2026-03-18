import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Search } from 'lucide-react';

export default function RoleManagement(){

    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
            <div className="w-full max-w-[1152px] px-6 py-10 flex flex-col gap-10">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center w-fit">
                        <h1 className="text-[#1E293B] font-inter text-3xl font-bold leading-9">
                        All Employees and Role Management
                        </h1>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => navigate("/audit-log")}
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            Audit Logs
                        </button>
                        <button onClick={() => navigate(-1)}
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>
                    
                    {/* <h1>Role Management</h1> */}
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search roles..."
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
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">Kamal Perera</td>
                                <td className="px-6 py-4 text-gray-800">kamal@comp.com</td>
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
                            </tr>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">Namal Kumara</td>
                                <td className="px-6 py-4 text-gray-800">namal@comp.com</td>
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
                            </tr>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
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
                            </tr>
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