import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove, update } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaEdit, FaTrash, FaAddressBook, FaFileImport } from 'react-icons/fa';
import {
    Card,
    Table,
    TableHeader,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    PrimaryButton,
    SecondaryButton,
    DangerButton,
    Pagination
} from '../components/common';
import { colors } from '../styles/designTokens';

const Dealers = () => {
    const [dealers, setDealers] = useState([]);
    const [filteredDealers, setFilteredDealers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const navigate = useNavigate();
    const { employeeData, currentUser } = useAuth();

    useEffect(() => {
        loadDealers();
    }, []);

    useEffect(() => {
        filterDealers();
        setCurrentPage(1);
    }, [searchTerm, filterType, dealers]);

    const loadDealers = async () => {
        setLoading(true);
        try {
            // load from new structure: contacts/{category}/{id}
            const categories = [
                'dealers',
                'agents',
                'bankers',
                'finance_executives',
                'customers',
                'key_persons',
                'dsa',
                'bni',
                'social_media',
                'others'
            ];
            let all = [];
            for (const cat of categories) {
                const nodeRef = ref(database, `contacts/${cat}`);
                const snap = await get(nodeRef);
                if (!snap.exists()) continue;
                const data = snap.val();
                const list = Object.keys(data).map(id => ({
                    ...data[id],
                    id,
                    _category: cat
                }));
                all = all.concat(list);
            }

            const dealersList = all;

            dealersList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setDealers(dealersList);
            setFilteredDealers(dealersList);
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const filterDealers = () => {
        let filtered = [...dealers];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(dealer => dealer.dealerType === filterType);
        }

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(dealer =>
                dealer.dealerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dealer.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dealer.mobile1?.includes(searchTerm) ||
                dealer.city?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDealers(filtered);
    };

    const getDealerTypeLabel = (type) => {
        const types = {
            dealer: 'Dealer',
            agent: 'Agent',
            banker: 'Banker',
            finance_executive: 'Finance Executive/Banker',
            customer: 'Customer',
            key_person: 'Key Person',
            dsa: 'DSA',
            bni: 'BNI',
            social_media: 'Social Media',
            others: 'Others'
        };
        return types[type] || type;
    };

    const getDealerTypeIcon = (type) => {
        const icons = {
            dealer: '🏪',
            agent: '🧑‍💼',
            banker: '🏦',
            finance_executive: '💼',
            customer: '👤',
            key_person: '⭐',
            dsa: '🤝',
            bni: '🔗',
            social_media: '📱',
            others: '📋'
        };
        return icons[type] || '📋';
    };

    const getDealerTypeColor = (type) => {
        const colors = {
            dealer: 'bg-blue-100 text-blue-800 border-blue-300',
            agent: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            banker: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            finance_executive: 'bg-purple-100 text-purple-800 border-purple-300',
            customer: 'bg-green-100 text-green-800 border-green-300',
            key_person: 'bg-pink-100 text-pink-800 border-pink-300',
            dsa: 'bg-teal-100 text-teal-800 border-teal-300',
            bni: 'bg-cyan-100 text-cyan-800 border-cyan-300',
            social_media: 'bg-orange-100 text-orange-800 border-orange-300',
            others: 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[type] || colors.others;
    };

    const handleEdit = (dealerId) => {
        navigate(`/edit-contact/${dealerId}`);
    };

    const handleDelete = async (dealerId) => {
        try {
            // determine category by searching in current dealers array
            const item = dealers.find(d => d.id === dealerId);
            const cat = item?._category || 'others';
            const dealerRef = ref(database, `contacts/${cat}/${dealerId}`);
            await remove(dealerRef);
            setDeleteConfirm(null);
            setSuccessMessage('Contact deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            loadDealers();
        } catch (error) {
            
            alert('Failed to delete contact');
        }
    };

    const handleVCardImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const vcardRegex = /BEGIN:VCARD[\s\S]*?END:VCARD/g;
                const cards = text.match(vcardRegex);

                if (!cards) {
                    alert('No valid vCard contacts found in file.');
                    return;
                }

                setLoading(true);
                let importCount = 0;

                for (const card of cards) {
                    // Extract Name (FN or N)
                    const fnMatch = card.match(/^FN:(.*)$/m);
                    const nMatch = card.match(/^N:(.*)$/m);
                    let name = fnMatch ? fnMatch[1].trim() : '';
                    if (!name && nMatch) {
                        const parts = nMatch[1].split(';');
                        name = parts.filter(p => p.trim()).reverse().join(' ').trim();
                    }

                    // Extract Mobile (TEL)
                    const telMatch = card.match(/^TEL(?:.*):(.*)$/m);
                    const mobile = telMatch ? telMatch[1].replace(/\D/g, '').trim() : '';

                    // Extract Email
                    const emailMatch = card.match(/^EMAIL(?:.*):(.*)$/m);
                    const email = emailMatch ? emailMatch[1].trim() : '';

                    if (name && mobile) {
                        const dealerId = `OTHER_${Date.now()}_${importCount}`;
                        const contactData = {
                            dealerId,
                            dealerName: name,
                            mobile1: mobile,
                            email: email || '',
                            dealerType: 'others',
                            isActive: true,
                            createdAt: new Date().toISOString(),
                            createdBy: currentUser?.email || 'system'
                        };

                        const updates = {};
                        updates[`contacts/others/${dealerId}`] = contactData;
                        updates[`customers/${dealerId}`] = contactData;
                        
                        await update(ref(database), updates);
                        importCount++;
                    }
                }

                setSuccessMessage(`Successfully imported ${importCount} contacts!`);
                setTimeout(() => setSuccessMessage(''), 3000);
                loadDealers();
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to parse vCard file.');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const toggleStatus = async (dealerId, currentStatus) => {
        try {
            const item = dealers.find(d => d.id === dealerId);
            const cat = item?._category || 'others';
            const dealerRef = ref(database, `contacts/${cat}/${dealerId}`);
            await update(dealerRef, { isActive: !currentStatus });
            loadDealers();
        } catch (error) {
            
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full space-y-8">
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
                                    <p className="text-green-600 font-semibold flex items-center gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{successMessage}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSuccessMessage('')}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ✕
                                </button>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                <FaAddressBook className="text-white text-lg sm:text-xl" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                Contacts Management
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Manage contact information and partnerships
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <PrimaryButton
                            onClick={() => document.getElementById('vcard-import-input').click()}
                            variant="indigo"
                            className="px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto font-bold flex items-center justify-center gap-2"
                        >
                            <FaFileImport className="text-xl" /> Import vCard
                        </PrimaryButton>
                        <input
                            id="vcard-import-input"
                            type="file"
                            accept=".vcf"
                            onChange={handleVCardImport}
                            className="hidden"
                        />
                        <PrimaryButton
                            onClick={() => navigate('/add-contact')}
                            variant="emerald"
                            className="px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto font-bold flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Add New Contact
                        </PrimaryButton>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 mb-8">
                    <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-lg border-l-4 border-green-500">
                        <div className="text-gray-500 font-semibold mb-1 text-xs lg:text-sm">Dealer Contacts</div>
                        <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                            {dealers.filter(d => d.dealerType === 'dealer').length}
                        </div>
                    </div>

                    <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-lg border-l-4 border-yellow-500">
                        <div className="text-gray-500 font-semibold mb-1 text-xs lg:text-sm">Banker Contacts</div>
                        <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                            {dealers.filter(d => d.dealerType === 'banker').length}
                        </div>
                    </div>

                    <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-lg border-l-4 border-orange-500">
                        <div className="text-gray-500 font-semibold mb-1 text-xs lg:text-sm">Agent Contacts</div>
                        <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                            {dealers.filter(d => d.dealerType === 'agent').length}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, business, mobile, or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            />
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            >
                                <option value="all">All Contact Types ({dealers.length})</option>
                                <option value="dealer">Dealer ({dealers.filter(d => d.dealerType === 'dealer').length})</option>
                                <option value="agent">Agent ({dealers.filter(d => d.dealerType === 'agent').length})</option>
                                <option value="finance_executive">Finance Executive/Banker ({dealers.filter(d => d.dealerType === 'finance_executive').length})</option>
                                <option value="customer">Customer ({dealers.filter(d => d.dealerType === 'customer').length})</option>
                                <option value="key_person">Key Person ({dealers.filter(d => d.dealerType === 'key_person').length})</option>
                                <option value="dsa">DSA ({dealers.filter(d => d.dealerType === 'dsa').length})</option>
                                <option value="bni">BNI ({dealers.filter(d => d.dealerType === 'bni').length})</option>
                                <option value="social_media">Social Media ({dealers.filter(d => d.dealerType === 'social_media').length})</option>
                                <option value="others">Others ({dealers.filter(d => d.dealerType === 'others').length})</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading contacts...</p>
                    </div>
                ) : filteredDealers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🏪</div>
                        <p className="text-gray-600 text-lg mb-2">No contacts found</p>
                        <p className="text-gray-500 text-sm">Add your first contact to get started</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded text-xs overflow-auto">
                            <strong>DEBUG:</strong> Role: {String(employeeData?.role)} | Match: {String(employeeData?.role?.toLowerCase() === 'admin')} | IsDbUser: {String(currentUser?.isDbUser)} | Perm: {String(employeeData?.permissions?.contactActionAccess)} | NoEmpData: {String(!employeeData)}
                        </div>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableHeaderCell textAlign="left">Sr. No.</TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Contact Info</TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Contact</TableHeaderCell>
                                        <TableHeaderCell>Type</TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Location</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.contactActionAccess === true) && (
                                            <TableHeaderCell>Actions</TableHeaderCell>
                                        )}
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {(() => {
                                        const totalItems = filteredDealers.length;
                                        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
                                        const paginatedDealers = filteredDealers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                                        return paginatedDealers.map((dealer, idx) => {
                                            const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                                            return (
                                                <TableRow key={dealer.id}>
                                                    <TableCell textAlign="left">{serialNumber}</TableCell>
                                                    <TableCell primary textAlign="left">
                                                        <div>
                                                            <div>{dealer.dealerName}</div>
                                                            {dealer.businessName && (
                                                                <div className="text-sm text-gray-600">{dealer.businessName}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell textAlign="left">
                                                        <div className="text-sm">
                                                            <div>📱 {dealer.mobile1}</div>
                                                            {dealer.mobile2 && <div className="text-gray-600">📞 {dealer.mobile2}</div>}
                                                            {dealer.email && <div className="text-gray-600">📧 {dealer.email}</div>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getDealerTypeColor(dealer.dealerType)}`}>
                                                            <span>{getDealerTypeIcon(dealer.dealerType)}</span>
                                                            <span>{getDealerTypeLabel(dealer.dealerType)}</span>
                                                        </span>
                                                    </TableCell>
                                                    <TableCell textAlign="left">
                                                        <div className="text-sm">
                                                            {dealer.city && <div>📍 {dealer.city}</div>}
                                                            {dealer.state && <div className="text-gray-600">{dealer.state}</div>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${dealer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            <span>{dealer.isActive ? '✓' : '✗'}</span>
                                                            <span>{dealer.isActive ? 'Active' : 'Inactive'}</span>
                                                        </span>
                                                    </TableCell>
                                                    {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.contactActionAccess === true) && (
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <SecondaryButton onClick={() => handleEdit(dealer.id)} className="text-sm px-3 py-1.5" aria-label="Edit">
                                                                    <FaEdit />
                                                                </SecondaryButton>
                                                                <DangerButton onClick={() => setDeleteConfirm(dealer.id)} className="text-sm px-3 py-1.5" aria-label="Delete">
                                                                    <FaTrash />
                                                                </DangerButton>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        });
                                    })()}
                                </TableBody>
                            </Table>
                        </Card>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.max(1, Math.ceil(filteredDealers.length / pageSize))}
                            totalItems={filteredDealers.length}
                            pageSize={pageSize}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </>
                )}
            </div>

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
