import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LOAN_TYPE_NAMES } from '../forms/loanTypes';

// Customer utilities functions
const getAllCustomers = async () => {
    try {
        const customersRef = collection(db, 'customers');
        const snapshot = await getDocs(customersRef);

        const customers = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.customerId,
                name: data.fullName,
                mobile1: data.mobile1,
                mobile2: data.mobile2,
                email: data.email,
                city: data.village,
                address: data.address,
                landmark: data.landmark,
                loanType: data.loanType || '',
                employmentType: data.customerType,
                notes: '',
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
                primaryLoanId: data.primaryLoanId,
                documents: {},
                totalDocuments: data.quickStats?.totalDocuments || 0,
                completedDocuments: data.quickStats?.completedDocuments || 0,
                completionPercentage: data.quickStats?.completionPercentage || 0,
                hasUrgentDocs: data.quickStats?.hasUrgentDocs || false,
                lastDocumentUpdate: data.quickStats?.lastDocumentUpdate?.toDate?.() || new Date()
            };
        });

        return customers;
    } catch (error) {
        
        return [];
    }
};

const Dashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        // Filter customers based on search term
        if (searchTerm.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.mobile1?.includes(searchTerm) ||
                customer.mobile2?.includes(searchTerm) ||
                customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCustomers(filtered);
        }
    }, [searchTerm, customers]);

    const loadCustomers = async () => {
        setLoading(true);
        const data = await getAllCustomers();
        setCustomers(data);
        setFilteredCustomers(data);
        setLoading(false);
    };

    const getDocumentProgress = (customer) => {
        // Use instant progress data from ultra-optimized service ⚡
        return {
            completed: customer.completedDocuments || 0,
            total: customer.totalDocuments || 0,
            percentage: customer.completionPercentage || 0
        };
    };

    // removed unused getPendingDays to satisfy linter

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-2">Customer Dashboard</h2>
                        <p className="text-gray-600">Manage loan applications and document tracking</p>
                    </div>

                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl z-10">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, mobile number, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-md focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                    />
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading customers...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                                <div className="text-gray-500 font-semibold mb-1">Total Customers</div>
                                <div className="text-3xl font-bold text-gray-800">{customers.length}</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                                <div className="text-gray-500 font-semibold mb-1">Completed Loans</div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {customers.filter(c => c.completionPercentage === 100).length}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500">
                                <div className="text-gray-500 font-semibold mb-1">Pending Documents</div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {customers.filter(c => c.completionPercentage < 100).length}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                                <div className="text-gray-500 font-semibold mb-1">Categories</div>
                                <div className="text-3xl font-bold text-gray-800">4</div>
                            </div>
                        </div>


                        {/* Search Results (Only show if searching) */}
                        {searchTerm && (
                            <>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Search Results</h3>
                                {filteredCustomers.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                        <div className="text-6xl mb-4 opacity-30">🔍</div>
                                        <p className="text-gray-500 text-lg">No customers found</p>
                                        <p className="text-gray-400 mt-2">Try searching for a different name or mobile number</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCustomers.map(customer => {
                                            const progress = getDocumentProgress(customer);

                                            return (
                                                <div
                                                    key={customer.id}
                                                    onClick={() => navigate(`/customer/${customer.id}`)}
                                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-100"
                                                >
                                                    {/* Card Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-xl font-bold text-gray-800 flex-1 pr-2">{customer.name}</h3>
                                                        {customer.hasUrgentDocs && (
                                                            <span className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full shadow-md whitespace-nowrap">
                                                                ⚠️ Urgent
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Customer Info */}
                                                    <div className="space-y-2 mb-5">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <span className="text-lg">📱</span>
                                                            <span className="text-sm">{customer.mobile1}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <span className="text-lg">📍</span>
                                                            <span className="text-sm">{customer.city}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <span className="text-lg">💼</span>
                                                            <span className="text-sm">{LOAN_TYPE_NAMES[customer.loanType] || customer.loanType}</span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Section */}
                                                    <div className="pt-4 border-t border-gray-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-semibold text-gray-600">Progress</span>
                                                            <span className="text-sm font-bold text-primary-600">
                                                                {progress.completed}/{progress.total}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500 rounded-full"
                                                                style={{ width: `${progress.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {!searchTerm && (
                            <div className="text-center py-20 opacity-50">
                                <span className="text-6xl">🔍</span>
                                <p className="mt-4 text-xl text-gray-500">Search for a customer to view details</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
