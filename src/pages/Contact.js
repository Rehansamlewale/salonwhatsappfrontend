import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove } from 'firebase/database';
import { database } from '../firebase';
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


import { useAuth } from '../contexts/AuthContext';


const Contacts = () => {
    const { employeeData, currentUser } = useAuth();
    const [dealers, setDealers] = useState([]);
    const [filteredDealers, setFilteredDealers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const navigate = useNavigate();

    useEffect(() => {
        loadDealers();
    }, []);

    useEffect(() => {
        filterDealers();
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, dealers]);

    // Reload contacts when page becomes visible (e.g., after adding a new contact)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadDealers();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also reload when window gains focus
        const handleFocus = () => {
            loadDealers();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadDealers = async () => {
        setLoading(true);
        try {
            // load from new structure: contacts/{category}/{id}
            // Include ALL categories that can be saved from AddContact form
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
            
            // 1. Fetch from root 'dealers' node
            const rootDealersRef = ref(database, 'dealers');
            const rootSnap = await get(rootDealersRef);
            if (rootSnap.exists()) {
                const data = rootSnap.val();
                const list = Object.keys(data).map(id => ({
                    ...data[id],
                    id,
                    _category: 'root_dealers'
                }));
                all = all.concat(list);
            }

            // 1.1 Fetch from root 'customers' node
            const rootCustomersRef = ref(database, 'customers');
            const rootCustSnap = await get(rootCustomersRef);
            if (rootCustSnap.exists()) {
                const data = rootCustSnap.val();
                const list = Object.keys(data).map(id => ({
                    ...data[id],
                    id,
                    _category: 'root_customers'
                }));
                all = all.concat(list);
            }

            // 2. Fetch from new 'contacts/{category}' structure
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

            // De-duplicate by ID to prevent double entries (e.g. if in both root customers and contacts node)
            const uniqueMap = new Map();
            all.forEach(item => {
                // If already in map, prefer the one with more details or the one from 'customers'
                if (!uniqueMap.has(item.id) || item._category === 'root_customers') {
                    uniqueMap.set(item.id, item);
                }
            });

            const dealersList = Array.from(uniqueMap.values());

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
            finance_executive: '💼',
            customer: '👥',
            key_person: '⭐',
            dsa: '🔗',
            bni: '🤝',
            social_media: '📱',
            others: '🏪'
        };
        return icons[type] || '🏪';
    };

    const getDealerTypeColor = (type) => {
        const colors = {
            dealer: 'bg-blue-100 text-blue-800 border-blue-300',
            agent: 'bg-orange-100 text-orange-800 border-orange-300',
            finance_executive: 'bg-purple-100 text-purple-800 border-purple-300',
            customer: 'bg-green-100 text-green-800 border-green-300',
            key_person: 'bg-red-100 text-red-800 border-red-300',
            dsa: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            bni: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            social_media: 'bg-pink-100 text-pink-800 border-pink-300',
            others: 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[type] || colors.others;
    };

    const handleEdit = (dealerId) => {
        navigate(`/edit-contact/${dealerId}`);
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
                    const fnMatch = card.match(/^FN:(.*)$/m);
                    const nMatch = card.match(/^N:(.*)$/m);
                    let name = fnMatch ? fnMatch[1].trim() : '';
                    if (!name && nMatch) {
                        const parts = nMatch[1].split(';');
                        name = parts.filter(p => p.trim()).reverse().join(' ').trim();
                    }

                    const telMatch = card.match(/^TEL(?:.*):(.*)$/m);
                    const mobile = telMatch ? telMatch[1].replace(/\D/g, '').trim() : '';

                    const emailMatch = card.match(/^EMAIL(?:.*):(.*)$/m);
                    const email = emailMatch ? emailMatch[1].trim() : '';

                    if (name && mobile) {
                        const newContactRef = ref(database, `customers`);
                        const pushRef = require('firebase/database').push(newContactRef);
                        await require('firebase/database').set(pushRef, {
                            dealerName: name,
                            mobile1: mobile,
                            email: email || '',
                            dealerType: 'customer',
                            isActive: true,
                            createdAt: new Date().toISOString(),
                            createdBy: currentUser?.email || 'system'
                        });
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
        e.target.value = '';
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

    // Pagination calculations
    const totalItems = filteredDealers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedDealers = filteredDealers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="p-6">
            <div className="w-full">{/* Removed max-w-7xl mx-auto for full width */}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="space-y-1 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                <FaAddressBook className="text-white text-base sm:text-lg" />
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                Contacts Management
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-10 sm:ml-12 flex items-center gap-2 text-xs sm:text-sm">
                            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Manage contact information and partnerships
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <PrimaryButton
                            onClick={() => document.getElementById('vcard-import-input').click()}
                            variant="indigo"
                            className="px-4 py-2 text-sm sm:text-base flex items-center justify-center gap-2"
                        >
                            <FaFileImport /> Import vCard
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
                            className="px-4 py-2 text-sm sm:text-base"
                        >
                            + Add New Contact
                        </PrimaryButton>
                    </div>
                </div>



                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="w-full">
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
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <tr>
                                            <TableHeaderCell textAlign="left">Sr. No.</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Name</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Mobile Number</TableHeaderCell>
                                            {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.contactActionAccess === true) && (
                                                <TableHeaderCell>Actions</TableHeaderCell>
                                            )}
                                        </tr>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedDealers.map((dealer, idx) => {
                                            const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                                            return (
                                                <TableRow key={dealer.id}>
                                                    <TableCell textAlign="left">{serialNumber}</TableCell>
                                                    <TableCell primary textAlign="left">
                                                        <div>{dealer.dealerName}</div>
                                                    </TableCell>
                                                    <TableCell textAlign="left">
                                                        <div className="text-sm">📱 {dealer.mobile1}</div>
                                                    </TableCell>
                                                    {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.contactActionAccess === true) && (
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <SecondaryButton onClick={() => handleEdit(dealer.id)} className="text-sm px-3 py-1.5" aria-label="Edit" title="Edit Contact">
                                                                    <FaEdit />
                                                                </SecondaryButton>
                                                                <DangerButton onClick={() => setDeleteConfirm(dealer.id)} className="text-sm px-3 py-1.5" aria-label="Delete" title="Delete Contact">
                                                                    <FaTrash />
                                                                </DangerButton>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 mb-6">
                            {paginatedDealers.map((dealer) => (
                                <div key={dealer.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                                    {/* Header with Name */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg mb-1">{dealer.dealerName}</h4>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-lg">📱</span>
                                            <span className="text-gray-800 font-medium">{dealer.mobile1}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                                        {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.contactActionAccess === true) && (
                                            <div className="flex items-center gap-2">
                                                <SecondaryButton onClick={() => handleEdit(dealer.id)} className="text-sm px-4 py-2" aria-label="Edit" title="Edit Contact">
                                                    <FaEdit />
                                                </SecondaryButton>
                                                <DangerButton onClick={() => setDeleteConfirm(dealer.id)} className="text-sm px-4 py-2" aria-label="Delete" title="Delete Contact">
                                                    <FaTrash />
                                                </DangerButton>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
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
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Contact?</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete this contact? This action cannot be undone.
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

export default Contacts;
