import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove, update } from 'firebase/database';
import { database } from '../firebase';

const Dealers = () => {
    const [dealers, setDealers] = useState([]);
    const [filteredDealers, setFilteredDealers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadDealers();
    }, []);

    useEffect(() => {
        filterDealers();
    }, [searchTerm, filterType, dealers]);

    const loadDealers = async () => {
        setLoading(true);
        try {
            const dealersRef = ref(database, 'dealers');
            const snapshot = await get(dealersRef);

            if (!snapshot.exists()) {
                setDealers([]);
                setFilteredDealers([]);
                setLoading(false);
                return;
            }

            const dealersData = snapshot.val();
            const dealersList = Object.keys(dealersData).map(id => ({
                ...dealersData[id],
                id
            }));

            dealersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setDealers(dealersList);
            setFilteredDealers(dealersList);
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const filterDealers = () => {
        let filtered = dealers;

        if (filterType !== 'all') {
            filtered = filtered.filter(dealer => dealer.dealerType === filterType);
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(dealer =>
                dealer.dealerName?.toLowerCase().includes(search) ||
                dealer.businessName?.toLowerCase().includes(search) ||
                dealer.mobile1?.includes(search) ||
                dealer.email?.toLowerCase().includes(search) ||
                dealer.city?.toLowerCase().includes(search)
            );
        }

        setFilteredDealers(filtered);
    };

    const handleEdit = (id) => {
        navigate(`/edit-dealer/${id}`);
    };

    const handleDelete = async (id) => {
        try {
            await remove(ref(database, `dealers/${id}`));
            setSuccessMessage('Dealer deleted successfully!');
            setDeleteConfirm(null);
            await loadDealers();
        } catch (error) {
            
            alert('Failed to delete dealer');
        }
    };

    const getDealerTypeLabel = (type) => {
        const types = {
            vehicle: 'Vehicle Dealer',
            property: 'Property Dealer',
            equipment: 'Equipment Dealer',
            other: 'Other'
        };
        return types[type] || type;
    };

    const getDealerTypeIcon = (type) => {
        const icons = {
            vehicle: '🚗',
            property: '🏠',
            equipment: '🔧',
            other: '🏪'
        };
        return icons[type] || '🏪';
    };

    const getDealerTypeColor = (type) => {
        const colors = {
            vehicle: 'bg-blue-100 text-blue-800 border-blue-300',
            property: 'bg-green-100 text-green-800 border-green-300',
            equipment: 'bg-orange-100 text-orange-800 border-orange-300',
            other: 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[type] || colors.other;
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await update(ref(database, `dealers/${id}`), {
                isActive: !currentStatus
            });
            await loadDealers();
        } catch (error) {
            
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-lg">Loading dealers...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 text-2xl">✓</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
                                <p className="text-green-600 font-semibold">{successMessage}</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setSuccessMessage('')}
                                className="bg-green-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">Dealers Management</h2>
                    <p className="text-gray-600">Manage dealer information and partnerships</p>
                </div>
                <button
                    onClick={() => navigate('/add-dealer')}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                    <span className="text-xl">➕</span>
                    Add New Dealer
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                    <div className="text-gray-500 font-semibold mb-1">Total Dealers</div>
                    <div className="text-3xl font-bold text-gray-800">{dealers.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                    <div className="text-gray-500 font-semibold mb-1">Vehicle Dealers</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {dealers.filter(d => d.dealerType === 'vehicle').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
                    <div className="text-gray-500 font-semibold mb-1">Property Dealers</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {dealers.filter(d => d.dealerType === 'property').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                    <div className="text-gray-500 font-semibold mb-1">Active Dealers</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {dealers.filter(d => d.isActive).length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Search dealers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="vehicle">Vehicle Dealers</option>
                            <option value="property">Property Dealers</option>
                            <option value="equipment">Equipment Dealers</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredDealers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <p className="text-gray-600 text-lg mb-2">No dealers found</p>
                    <p className="text-gray-500 text-sm">Add your first dealer to get started</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Dealer Info</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Contact</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Location</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Commission</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredDealers.map((dealer) => (
                                        <tr key={dealer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-gray-800">{dealer.dealerName}</div>
                                                    {dealer.businessName && (
                                                        <div className="text-sm text-gray-600">{dealer.businessName}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="text-gray-800">📱 {dealer.mobile1}</div>
                                                    {dealer.mobile2 && (
                                                        <div className="text-gray-600">📞 {dealer.mobile2}</div>
                                                    )}
                                                    {dealer.email && (
                                                        <div className="text-gray-600">📧 {dealer.email}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getDealerTypeColor(dealer.dealerType)}`}>
                                                    <span>{getDealerTypeIcon(dealer.dealerType)}</span>
                                                    {getDealerTypeLabel(dealer.dealerType)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {dealer.city && <div>📍 {dealer.city}</div>}
                                                    {dealer.state && <div className="text-gray-600">{dealer.state}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-800">
                                                    {dealer.commission > 0 ? `${dealer.commission}%` : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(dealer.id, dealer.isActive)}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${dealer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    {dealer.isActive ? '✓ Active' : '✕ Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(dealer.id)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(dealer.id)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {filteredDealers.map((dealer) => (
                            <div key={dealer.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">{dealer.dealerName}</h4>
                                        {dealer.businessName && <p className="text-sm text-gray-600">{dealer.businessName}</p>}
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getDealerTypeColor(dealer.dealerType)}`}>
                                        <span>{getDealerTypeIcon(dealer.dealerType)}</span>
                                        {getDealerTypeLabel(dealer.dealerType)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    <div className="col-span-2 space-y-1">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span>📱</span>
                                            <span>{dealer.mobile1}</span>
                                        </div>
                                        {dealer.mobile2 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span>📞</span>
                                                <span>{dealer.mobile2}</span>
                                            </div>
                                        )}
                                        {dealer.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span>📧</span>
                                                <span>{dealer.email}</span>
                                            </div>
                                        )}
                                        {dealer.city && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span>📍</span>
                                                <span>{dealer.city}, {dealer.state}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Commission:</span>
                                        <span className="font-semibold text-gray-800">
                                            {dealer.commission > 0 ? `${dealer.commission}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(dealer.id, dealer.isActive)}
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${dealer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {dealer.isActive ? '✓ Active' : '✕ Inactive'}
                                    </button>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                                    <button
                                        onClick={() => handleEdit(dealer.id)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(dealer.id)}
                                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Dealer?</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete this dealer? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dealers;
