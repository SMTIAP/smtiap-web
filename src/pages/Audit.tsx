import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function Audit(){

    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC]">
            <div className="w-full max-w-[1152px] px-6 py-10 flex flex-col gap-10">
                <div className="flex justify-between items-center w-full">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(-1)}
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>
                </div>
                <div className="flex items-center w-fit">
                    <h1 className="text-[#1E293B] font-inter text-3xl font-bold leading-9">
                        Audit Trail
                    </h1> 
                </div>


                <div className="flex flex-col w-full max-w-[600px] gap-4">
                    <div className="flex items-center gap-4">
                        {/* From Date */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label htmlFor="from-date" className="text-gray-700 font-inter text-sm font-medium">From</label>
                            <input
                                type="date"
                                id="from-date"
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label htmlFor="to-date" className="text-gray-700 font-inter text-sm font-medium">
                                To
                            </label>
                            <input
                                type="date"
                                id="to-date"
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Action Type */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label htmlFor="action-type" className="text-gray-700 font-inter text-sm font-medium">Action Type</label>
                            <select
                                id="action-type"
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Action</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                            </select>
                        </div>

                        {/* User */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label htmlFor="user" className="text-gray-700 font-inter text-sm font-medium">Select User</label>
                            <select
                                id="user"
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select User</option>
                                <option value="Kamal Perera">Kamal Perera</option>
                                <option value="Namal Kumara">Namal Kumara</option>
                                <option value="Chamil Gamage">Chamil Gamage</option>
                                <option value="Ruwan Gamage">Ruwan Gamage</option>
                                <option value="Hiruna Lakmal">Hiruna Lakmal</option>
                            </select>
                        
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="tenant" className="text-gray-700 font-inter text-sm font-medium">
                            Tenant
                            </label>
                            <select
                                id="tenant"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                <option value="">Select Tenant</option>
                                <option value="Awesome Softs Inc.">Awesome Softs Inc.</option>
                                <option value="ABC Limited">ABC Limited</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center w-full">
                    <div className="flex w-full justify-end gap-2">
                        <button
                            className="bg-gray-400 cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            Clear
                        </button>
                        <button
                            className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#3B82F6] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                            Search
                        </button>
                        <div className="relative inline-block">
                            <button onClick={() => setShowDropdown(!showDropdown)}
                                className="bg-gray-400 cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
                                Export
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                    PDF
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                    Excel
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                    CSV
                                </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto mt-6">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Timestamp</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Username</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Tenant</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Type</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">10.03.2026 18:00:00</td>
                                <td className="px-6 py-4 text-gray-800">kamal</td>
                                <td className="px-6 py-4 text-gray-800">Awesome Softs Inc.</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <button className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-600">
                                        Login
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-gray-800">Successful Login</td>
                            </tr>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">12.03.2026 13:10:00</td>
                                <td className="px-6 py-4 text-gray-800">namal</td>
                                <td className="px-6 py-4 text-gray-800">Awesome Softs Inc.</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <button className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-600">
                                        Logout
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-gray-800">User Initiated Logout</td>
                            </tr>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">13.03.2026 22:50:00</td>
                                <td className="px-6 py-4 text-gray-800">chamil</td>
                                <td className="px-6 py-4 text-gray-800">ABC Limited</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <button className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-600">
                                        Create
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-gray-800">New Project Created</td>
                            </tr>
                            <tr className="border-b border-gray-300 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-800">14.03.2026 09:43:00</td>
                                <td className="px-6 py-4 text-gray-800">ruwan</td>
                                <td className="px-6 py-4 text-gray-800">Awesome Softs Inc.</td>
                                <td className="px-6 py-4 text-gray-800">
                                    <button className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-600">
                                        Update
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-gray-800">Task Updated with Newer Details</td>
                            </tr>
                            

                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                            &lt; Previous
                        </button>
                        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded">1</button>
                        <button className="px-3 py-1 text-gray-700 text-sm hover:text-black">2</button>
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                            Next &gt;
                        </button>
                    </div>

                    {/* Entries Info */}
                    <p className="text-sm text-gray-600">
                        Showing 1 to 4 of 10 entries
                    </p>

                    <div className="mt-6 text-sm text-gray-500 text-center">
                        <p>Retention Policy: Logs are automatically purged after 1 year (365 days)</p>
                        <p>Next automatic purge: 31.12.2026</p>
                    </div>

                </div>
            </div>
        </div>
    );
}