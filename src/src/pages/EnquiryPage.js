import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaFilter, FaSearch, FaCheckCircle, FaClock, FaCheck, FaExclamationCircle, FaTimesCircle, FaTable } from 'react-icons/fa';

const EnquiryPage = () => {
    const { employeeData, currentUser } = useAuth();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'completed', 'closed'
    const [searchTerm, setSearchTerm] = useState('');
    const [loanTypeFilter, setLoanTypeFilter] = useState(''); // New loan type filter
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [remark, setRemark] = useState('');
    const [showRemarkInput, setShowRemarkInput] = useState(null); // ID of enquiry being updated

    useEffect(() => {
        const db = getDatabase(app);
        const enquiriesRef = ref(db, 'enquiries');

        const unsubscribe = onValue(enquiriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedEnquiries = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                // Sort by timestamp descending (newest first)
                loadedEnquiries.sort((a, b) => {
                    const timeA = a.timestamp ? (typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime()) : 0;
                    const timeB = b.timestamp ? (typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime()) : 0;
                    return timeB - timeA;
                });
                setEnquiries(loadedEnquiries);
            } else {
                setEnquiries([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const db = getDatabase(app);
            const updates = {};
            updates[`/enquiries/${id}/status`] = newStatus;
            updates[`/enquiries/${id}/remark`] = remark;

            await update(ref(db), updates);

            setShowRemarkInput(null);
            setRemark('');
            setStatusUpdating(null);
        } catch (error) {
            
            alert("Failed to update status");
        }
    };

    const openRemarkInput = (id, currentStatus) => {
        setShowRemarkInput(id);
        setStatusUpdating(currentStatus);
        setRemark('');
    };

    // Get unique loan types for filter dropdown
    const uniqueLoanTypes = [...new Set(enquiries.map(e => e.loanType).filter(Boolean))].sort();

    const filteredEnquiries = enquiries.filter(enquiry => {
        const status = enquiry.status ? enquiry.status.toLowerCase() : 'pending';

        let matchesTab = false;
        if (activeTab === 'completed') {
            matchesTab = status === 'complete' || status === 'completed';
        } else if (activeTab === 'closed') {
            matchesTab = status === 'closed';
        } else {
            matchesTab = status === 'pending' || status === 'followup' || (!['complete', 'completed', 'closed'].includes(status));
        }

        const matchesSearch =
            (enquiry.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (enquiry.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (enquiry.loanType?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesLoanType = !loanTypeFilter || enquiry.loanType === loanTypeFilter;

        return matchesTab && matchesSearch && matchesLoanType;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusLower = (status || 'pending').toLowerCase();
        if (statusLower === 'complete' || statusLower === 'completed') {
            return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <FaCheckCircle /> Complete
            </span>;
        } else if (statusLower === 'followup') {
            return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                <FaExclamationCircle /> Follow-up
            </span>;
        } else if (statusLower === 'closed') {
            return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                <FaTimesCircle /> Closed
            </span>;
        } else {
            return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                <FaClock /> Pending
            </span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                <FaTable className="text-white text-lg sm:text-xl" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                Enquiries
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Manage and track customer enquiries efficiently
                        </p>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Search */}
                        <div className="relative group">
                            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FaSearch className="text-blue-600" />
                                Search Enquiries
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-all duration-300 group-focus-within:scale-110" />
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Name, Phone, Loan Type..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium shadow-sm hover:shadow-md"
                                />
                            </div>
                        </div>

                        {/* Loan Type Filter */}
                        <div className="relative">
                            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FaFilter className="text-purple-600" />
                                Loan Type
                            </label>
                            <div className="relative">
                                <FaFilter className="absolute left-4 top-4 text-gray-400 pointer-events-none z-10" />
                                <select
                                    value={loanTypeFilter}
                                    onChange={e => setLoanTypeFilter(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium appearance-none cursor-pointer shadow-sm hover:shadow-md"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.5em 1.5em'
                                    }}
                                >
                                    <option value="">All Loan Types</option>
                                    {uniqueLoanTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tab Filters */}
                        <div>
                            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FaFilter className="text-indigo-600" />
                                Filter by Status
                            </label>
                            <div className="flex bg-gradient-to-br from-white to-gray-50 p-1.5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'pending'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                        }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === 'completed'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                        }`}
                                >
                                    Completed
                                </button>
                                <button
                                    onClick={() => setActiveTab('closed')}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === 'closed'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                        }`}
                                >
                                    Closed
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Record Count */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-5 py-3 rounded-xl border-2 border-blue-200 shadow-md w-fit">
                            <FaTable className="text-blue-600 text-lg animate-pulse" />
                            <span className="text-sm font-bold text-gray-800">
                                {loading ? '⏳ Loading...' : `📊 ${filteredEnquiries.length} Enquiries`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 overflow-hidden flex flex-col min-h-[500px] hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p>Loading enquiries...</p>
                        </div>
                    ) : filteredEnquiries.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <FaTable className="text-4xl mb-4 opacity-50" />
                            <p>No enquiries found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Sr. No.</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Phone</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Loan Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Requirements</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Remark</th>
                                        {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.enquiryActionAccess === true) && (
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEnquiries.map((enquiry, idx) => (
                                        <tr key={enquiry.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap group-hover:text-gray-900">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap group-hover:text-blue-600">{enquiry.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap group-hover:text-gray-900">{enquiry.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap group-hover:text-gray-900">{enquiry.loanType || 'General'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={enquiry.requirements}>{enquiry.requirements || '-'}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">{getStatusBadge(enquiry.status)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(enquiry.timestamp)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate italic" title={enquiry.remark}>{enquiry.remark || '-'}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {showRemarkInput === enquiry.id ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter remark..."
                                                            className="w-full text-xs p-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                            value={remark}
                                                            onChange={(e) => setRemark(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setShowRemarkInput(null)}
                                                                className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(enquiry.id, statusUpdating)}
                                                                className="flex-1 px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-colors shadow-sm"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    ((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.enquiryActionAccess === true) && (
                                                        <div className="flex gap-1.5">
                                                            {activeTab === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setStatusUpdating('followup');
                                                                            openRemarkInput(enquiry.id, 'followup');
                                                                        }}
                                                                        className="px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                                                                        title="Mark as Follow-up"
                                                                    >
                                                                        <FaExclamationCircle />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setStatusUpdating('complete');
                                                                            openRemarkInput(enquiry.id, 'complete');
                                                                        }}
                                                                        className="px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                                        title="Mark as Complete"
                                                                    >
                                                                        <FaCheck />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setStatusUpdating('closed');
                                                                            openRemarkInput(enquiry.id, 'closed');
                                                                        }}
                                                                        className="px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                                        title="Close Enquiry"
                                                                    >
                                                                        <FaTimesCircle />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(activeTab === 'completed' || activeTab === 'closed') && (
                                                                <button
                                                                    onClick={() => {
                                                                        setStatusUpdating('pending');
                                                                        openRemarkInput(enquiry.id, 'pending');
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-300 shadow-sm"
                                                                >
                                                                    <FaClock className="inline mr-1" /> Re-open
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EnquiryPage;
