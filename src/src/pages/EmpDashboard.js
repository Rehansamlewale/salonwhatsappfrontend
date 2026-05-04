import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, get, child } from 'firebase/database';
import { database } from '../firebase';



const EmpDashboard = () => {
    const { currentUser, employeeData } = useAuth();
    const navigate = useNavigate();
    const [loanStats, setLoanStats] = useState({
        totalLoans: 0,
        totalAmount: 0,
        statusCounts: {
            new: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            disbursed: 0,
            closed: 0
        }
    });
    const [recentLoans, setRecentLoans] = useState([]);
    const [contactsStats, setContactsStats] = useState({
        total: 0,
        dealers: 0,
        agents: 0,
        bankers: 0
    });
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [inProcess, setInProcess] = useState(0);
    const [sanctioned, setSanctioned] = useState(0);
    const [disbursed, setDisbursed] = useState(0);
    const [commissionStats, setCommissionStats] = useState({
        totalGet: 0,
        totalGiven: 0,
        netProfit: 0
    });

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const loadEmployeeData = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const employeeId = currentUser.uid;
            
            
            

            // ===== FETCH ONLY THIS EMPLOYEE'S CUSTOMERS =====
            const dbRef = ref(database);
            const customersSnapshot = await get(child(dbRef, 'customers'));

            let customers = [];

            if (customersSnapshot.exists()) {
                const allCustomersData = customersSnapshot.val();

                customers = Object.entries(allCustomersData)
                    .map(([id, data]) => ({
                        id,
                        ...data
                    }))
                    .filter(c => {
                        const createdBy = c.created_by || c.createdBy;
                        const createdByEmail = c.created_by_email || c.createdByEmail;
                        // Match by either uid or email
                        const matchByUid = createdBy === employeeId;
                        const matchByEmail = createdByEmail && currentUser.email && 
                                           createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
                        return matchByUid || matchByEmail;
                    });
            }

            // Handle empty customers - set defaults
            if (customers.length === 0) {
                setInProcess(0);
                setSanctioned(0);
                setDisbursed(0);
                setCommissionStats({ totalGet: 0, totalGiven: 0, netProfit: 0 });
                setLoanStats({
                    totalLoans: 0,
                    totalAmount: 0,
                    statusCounts: { new: 0, pending: 0, approved: 0, rejected: 0, disbursed: 0, closed: 0 }
                });
                setRecentLoans([]);
                setContactsStats({ total: 0, dealers: 0, agents: 0, bankers: 0 });
                setLoading(false);
                return;
            }


            const inProcessCount = customers.filter(c => {
                const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                return status === 'login' || status === 'pending' || status.includes('pending');
            }).length;
            const sanctionedCount = customers.filter(c => {
                const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                return status === 'sanctioned' || status === 'approved' || status.includes('sanctioned');
            }).length;
            const disbursedCount = customers.filter(c => {
                const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                return status === 'disbursed' || status.includes('disbursed');
            }).length;

            setInProcess(inProcessCount);
            setSanctioned(sanctionedCount);
            setDisbursed(disbursedCount);

            // ===== COMMISSION CALCULATION =====
            const totalGet = customers.reduce((sum, c) => sum + (parseFloat(c.commission_get) || 0), 0);
            const totalGiven = customers.reduce((sum, c) => sum + (parseFloat(c.commission_given) || 0), 0);
            const netProfit = totalGet - totalGiven;

            setCommissionStats({
                totalGet,
                totalGiven,
                netProfit
            });

            // ===== RECENT CUSTOMERS =====
            const sortedCustomers = customers.sort((a, b) => {
                try {
                    return new Date(b.created_at) - new Date(a.created_at);
                } catch {
                    return 0;
                }
            });
            const recentCustomersData = sortedCustomers.slice(0, 10);

            

            const loans = recentCustomersData.map(customer => {
                // Handle nested data structure from instantSaveService
                const customerName = customer.customer_details?.basic_info?.full_name || 
                                    customer.customer_name || 
                                    customer.customerName || 
                                    'N/A';
                
                const loanCategory = customer.loan_application?.loan_details?.loan_category ||
                                    customer.loan_category || 
                                    customer.loanCategory ||
                                    'N/A';
                
                const loanAmount = parseFloat(
                    customer.customer_details?.basic_info?.required_loan_amount ||
                    customer.loan_amount || 
                    customer.loanAmount ||
                    0
                );

                const status = (customer.applicationStatus || 
                              customer.status || 
                              customer.loan_application?.loan_details?.status ||
                              'new').toLowerCase();

                

                return {
                    loanId: customer.id,
                    customerId: customer.id,
                    customerName: customerName,
                    loanType: loanCategory,
                    loanAmount: loanAmount,
                    status: status,
                    createdAt: new Date(customer.created_at || new Date()),
                    branch: customer.branch || '',
                    notes: customer.loan_application?.loan_details?.remark || customer.notes || ''
                };
            });

            const statusCounts = {
                new: customers.filter(c => {
                    const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                    return status === 'new' || status.includes('new');
                }).length,
                pending: customers.filter(c => {
                    const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                    return status === 'pending' || status === 'login' || status.includes('pending');
                }).length,
                approved: customers.filter(c => {
                    const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                    return status === 'approved' || status === 'sanctioned' || status.includes('sanctioned');
                }).length,
                rejected: customers.filter(c => {
                    const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                    return status === 'rejected' || status.includes('rejected');
                }).length,
                disbursed: customers.filter(c => {
                    const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                    return status === 'disbursed' || status.includes('disbursed');
                }).length,
                closed: customers.filter(c => {
                    const status = (c.applicationStatus || c.status || c.loan_application?.loan_details?.status || '').toLowerCase();
                    return status === 'closed' || status.includes('closed');
                }).length
            };

            const totalLoanAmount = customers.reduce((sum, c) => {
                const amount = parseFloat(
                    c.customer_details?.basic_info?.required_loan_amount ||
                    c.loan_amount ||
                    0
                );
                return sum + amount;
            }, 0);

            setLoanStats({
                totalLoans: customers.length,
                totalAmount: totalLoanAmount,
                statusCounts
            });
            setRecentLoans(loans);

            // ===== LOAD EMPLOYEE'S CONTACTS ONLY =====
            const categories = ['dealers', 'agents', 'bankers', 'others'];
            let allContacts = [];

            for (const cat of categories) {
                try {
                    const nodeRef = ref(database, `contacts/${cat}`);
                    const snap = await get(nodeRef);
                    if (!snap.exists()) continue;

                    const data = snap.val();
                    const list = Object.keys(data)
                        .map(id => ({
                            ...data[id],
                            id,
                            _category: cat
                        }))
                        .filter(contact => {
                            const createdBy = contact.createdBy || contact.created_by;
                            const createdByEmail = contact.createdByEmail || contact.created_by_email;
                            // Match by either uid or email
                            const matchByUid = createdBy === employeeId;
                            const matchByEmail = createdByEmail && currentUser.email && 
                                               createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
                            return matchByUid || matchByEmail;
                        });
                    allContacts = allContacts.concat(list);
                } catch (err) {
                    
                }
            }

            allContacts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            setContactsStats({
                total: allContacts.length,
                dealers: allContacts.filter(c => c.dealerType === 'dealer').length,
                agents: allContacts.filter(c => c.dealerType === 'agent').length,
                bankers: allContacts.filter(c => c.dealerType === 'banker').length
            });

            

        } catch (error) {
            
            // Set defaults on error
            setInProcess(0);
            setSanctioned(0);
            setDisbursed(0);
            setCommissionStats({ totalGet: 0, totalGiven: 0, netProfit: 0 });
            setLoanStats({
                totalLoans: 0,
                totalAmount: 0,
                statusCounts: { new: 0, pending: 0, approved: 0, rejected: 0, disbursed: 0, closed: 0 }
            });
            setRecentLoans([]);
            setContactsStats({ total: 0, dealers: 0, agents: 0, bankers: 0 });
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadEmployeeData();
    }, [loadEmployeeData]);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return '🌅 Good Morning';
        if (hour < 17) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const calculateSuccessRate = () => {
        if (loanStats.totalLoans === 0) return 0;
        const successful = loanStats.statusCounts.approved + loanStats.statusCounts.disbursed + loanStats.statusCounts.closed;
        return Math.round((successful / loanStats.totalLoans) * 100);
    };

    const getStatusPercentage = (count) => {
        if (loanStats.totalLoans === 0) return 0;
        return Math.round((count / loanStats.totalLoans) * 100);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <p className="text-gray-600 text-lg mt-6 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                    👤
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        {getGreeting()}, {employeeData?.name || 'Employee'}!
                                    </h1>
                                    <p className="text-gray-500 text-sm md:text-base mt-1">
                                        {employeeData?.role || 'Agent'} • {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                {/* Contact Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Total Contacts */}
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                        <div className="text-gray-600 text-sm font-semibold mb-1">Total Contacts</div>
                        <div className="text-3xl font-bold text-gray-800">{contactsStats.total}</div>
                    </div>

                    {/* Dealer Contacts */}
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
                        <div className="text-gray-600 text-sm font-semibold mb-1">Dealer Contacts</div>
                        <div className="text-3xl font-bold text-gray-800">{contactsStats.dealers}</div>
                    </div>

                    {/* Banker Contacts */}
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                        <div className="text-gray-600 text-sm font-semibold mb-1">Banker Contacts</div>
                        <div className="text-3xl font-bold text-gray-800">{contactsStats.bankers}</div>
                    </div>

                    {/* Agent Contacts */}
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                        <div className="text-gray-600 text-sm font-semibold mb-1">Agent Contacts</div>
                        <div className="text-3xl font-bold text-gray-800">{contactsStats.agents}</div>
                    </div>

                    {/* Active Contacts */}
                    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                        <div className="text-gray-600 text-sm font-semibold mb-1">Active Contacts</div>
                        <div className="text-3xl font-bold text-gray-800">
                            {contactsStats.total}
                        </div>
                    </div>
                </div>

                {/* Key Metrics - Hero Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Loans */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-xl p-6 text-gray-700 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 opacity-20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-200 bg-opacity-40 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
                                    📊
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Applications</p>
                                </div>
                            </div>
                            <div className="text-5xl font-bold mb-2 text-gray-800">{loanStats.totalLoans}</div>
                            <p className="text-gray-500 text-sm">Loan applications created</p>
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-xl p-6 text-gray-700 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 opacity-20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-200 bg-opacity-40 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
                                    💰
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Value</p>
                                </div>
                            </div>
                            <div className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">{formatCurrency(loanStats.totalAmount)}</div>
                            <p className="text-gray-500 text-sm">Cumulative loan amount</p>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl shadow-xl p-6 text-gray-700 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 opacity-20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-200 bg-opacity-40 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
                                    🎯
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Success Rate</p>
                                </div>
                            </div>
                            <div className="text-5xl font-bold mb-2 text-gray-800">{calculateSuccessRate()}%</div>
                            <p className="text-gray-500 text-sm">Approval & disbursement rate</p>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">
                            📈
                        </span>
                        Application Status Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sanctioned */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                            <div className="text-center">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✅</div>
                                <div className="text-4xl font-bold text-emerald-700 mb-2">{loanStats.statusCounts.approved}</div>
                                <div className="text-sm font-semibold text-emerald-600 uppercase mb-2">Sanctioned</div>
                                <div className="text-xs text-emerald-500">{getStatusPercentage(loanStats.statusCounts.approved)}% of total</div>
                            </div>
                        </div>

                        {/* Disbursed */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                            <div className="text-center">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">₹</div>
                                <div className="text-4xl font-bold text-purple-700 mb-2">{loanStats.statusCounts.disbursed}</div>
                                <div className="text-sm font-semibold text-purple-600 uppercase mb-2">Disbursed</div>
                                <div className="text-xs text-purple-500">{getStatusPercentage(loanStats.statusCounts.disbursed)}% of total</div>
                            </div>
                        </div>

                        {/* Rejected */}
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border-2 border-rose-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                            <div className="text-center">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">❌</div>
                                <div className="text-4xl font-bold text-rose-700 mb-2">{loanStats.statusCounts.rejected}</div>
                                <div className="text-sm font-semibold text-rose-600 uppercase mb-2">Rejected</div>
                                <div className="text-xs text-rose-500">{getStatusPercentage(loanStats.statusCounts.rejected)}% of total</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center text-xl shadow-md">⚡</div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Active</p>
                                <p className="text-2xl font-bold text-gray-800">{loanStats.statusCounts.new + loanStats.statusCounts.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-xl shadow-md">✨</div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Successful</p>
                                <p className="text-2xl font-bold text-gray-800">{loanStats.statusCounts.approved + loanStats.statusCounts.disbursed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-md">🎉</div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Completed</p>
                                <p className="text-2xl font-bold text-gray-800">{loanStats.statusCounts.closed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-md">📋</div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">This Month</p>
                                <p className="text-2xl font-bold text-gray-800">{recentLoans.filter(l => {
                                    const loanMonth = l.createdAt.getMonth();
                                    const currentMonth = new Date().getMonth();
                                    return loanMonth === currentMonth;
                                }).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Three Column Layout - Most Cases, Recent Loans, Monthly Commission */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Most Cases Referred By - Employee's Customers by Status */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <span className="text-2xl">🎯</span>
                            Your Customers
                        </h2>
                        <div className="space-y-4">
                            {[
                                { status: 'Sanctioned', count: sanctioned, color: 'bg-emerald-50 text-emerald-700' },
                                { status: 'Disbursed', count: disbursed, color: 'bg-blue-50 text-blue-700' },
                                { status: 'In Process', count: inProcess, color: 'bg-amber-50 text-amber-700' }
                            ].map((item, idx) => (
                                item.count > 0 && (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border-l-4 border-gray-300 ${item.color} bg-opacity-50`}>
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.status}</p>
                                            <p className="text-sm text-gray-600">{item.count} customer{item.count !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="text-3xl font-bold opacity-20">{item.count}</div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Recent Loans (Top 5) */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <span className="text-2xl">⏱️</span>
                            Recent Loans (Top 5)
                        </h2>
                        <div className="space-y-3">
                            {recentLoans.slice(0, 5).length > 0 ? (
                                recentLoans.slice(0, 5).map((loan, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500 hover:shadow-md transition-all">
                                        <span className="text-emerald-600 font-bold">{index + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{loan.customerName}</p>
                                            <p className="text-sm text-gray-600 truncate">{loan.loanType}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">{loan.createdAt.toLocaleDateString('en-IN')}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent loans</p>
                            )}
                        </div>
                    </div>

                    {/* Monthly Commission */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <span className="text-2xl">🍊</span>
                            Monthly Commission
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-green-600 font-semibold">Total Get</p>
                                        <p className="text-2xl font-bold text-green-700">{formatCurrency(commissionStats.totalGet)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-red-600 font-semibold">Total Given</p>
                                        <p className="text-2xl font-bold text-red-700">{formatCurrency(commissionStats.totalGiven)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold">Net Profit</p>
                                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(commissionStats.netProfit)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmpDashboard;
