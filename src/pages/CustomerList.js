import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, child, remove, update } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LOAN_TYPE_NAMES, APPLICATION_STATUSES, LOAN_TYPES, PRIORITY_OPTIONS, ALL_COMBINED_STATUSES, getStatusOptions, getDocumentList } from '../forms/loanTypes';
import ReminderModal from '../components/ReminderModal';
import { FaEye, FaEdit, FaTrash, FaBell, FaUsers, FaUserTie, FaWhatsapp } from 'react-icons/fa';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';
import BulkWhatsAppModal from '../components/BulkWhatsAppModal';
import {
    Card,
    Table,
    TableHeader,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    StatusDropdown,
    PriorityDropdown,
    ActiveDropdown,
    PrimaryButton,
    SecondaryButton,
    DangerButton,
    Pagination,
    Toast
} from '../components/common';
import { colors } from '../styles/designTokens';

const CustomerList = () => {
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all'); // Added Priority Filter State
    const [hideRecentlyMessaged, setHideRecentlyMessaged] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedCustomerForReminder, setSelectedCustomerForReminder] = useState(null);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [selectedCustomerForWhatsApp, setSelectedCustomerForWhatsApp] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [showAssignBankerModal, setShowAssignBankerModal] = useState(false);
    const [selectedCustomerForBanker, setSelectedCustomerForBanker] = useState(null);
    const [bankersList, setBankersList] = useState([]);
    const [selectedBankerId, setSelectedBankerId] = useState('');
    const [showAddNewBanker, setShowAddNewBanker] = useState(false);
    const [newBankerName, setNewBankerName] = useState('');
    const [newBankerMobile, setNewBankerMobile] = useState('');
    const [toast, setToast] = useState(null);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [contactMatches, setContactMatches] = useState([]);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [isBulkWhatsAppModalOpen, setIsBulkWhatsAppModalOpen] = useState(false);
    const [bulkWhatsAppTargets, setBulkWhatsAppTargets] = useState([]);
    const pageSize = 10;
    const navigate = useNavigate();
    const { employeeData, currentUser } = useAuth();

    // Helper function to format date as dd-mm-yyyy
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // ... (getAllCustomers remains same) ...

    const getAllCustomers = async () => {
        try {
            const dbRef = ref(database);
            
            // 1. Fetch from root 'customers' node
            const rootCustomersSnapshot = await get(child(dbRef, 'customers'));
            let allRawData = {};
            if (rootCustomersSnapshot.exists()) {
                allRawData = rootCustomersSnapshot.val();
            }

            // 2. Fetch from 'contacts/' structure
            const categories = [
                'dealers', 'agents', 'bankers', 'finance_executives', 
                'customers', 'key_persons', 'dsa', 'bni', 'social_media', 'others'
            ];

            for (const cat of categories) {
                try {
                    const catSnapshot = await get(child(dbRef, `contacts/${cat}`));
                    if (catSnapshot.exists()) {
                        const catData = catSnapshot.val();
                        // Merge into allRawData, keeping existing if already there (customers node takes priority)
                        Object.entries(catData).forEach(([key, val]) => {
                            if (!allRawData[key]) {
                                allRawData[key] = val;
                            }
                        });
                    }
                } catch (catErr) {
                    console.warn(`Failed to fetch category ${cat}:`, catErr);
                }
            }

            const customersList = Object.entries(allRawData).map(([key, customerData]) => {
                const basic = customerData.customer_details?.basic_info || {};

                // Ensure createdAt is a valid date
                let createdAtDate;
                const dateString = customerData.createdAt || customerData.created_at || customerData.timestamp;

                if (dateString) {
                    createdAtDate = new Date(dateString);
                    if (isNaN(createdAtDate.getTime())) {
                        createdAtDate = new Date();
                    }
                } else {
                    createdAtDate = new Date();
                }

                return {
                    id: customerData.customerId || customerData.dealerId || key,
                    name: basic.full_name || customerData.dealerName || customerData.name || '',
                    mobile1: basic.mobile || customerData.mobile1 || customerData.mobile || '',
                    mobile2: basic.mobile2 || '',
                    email: basic.email || customerData.email || '',
                    city: basic.city_village || customerData.city || '',
                    loanAmount: customerData.loan_application?.loan_details?.loan_amount ||
                        basic.required_loan_amount || '',
                    loanType: customerData.loanType ||
                        customerData.loan_application?.loan_details?.loan_type ||
                        basic.loan_type ||
                        customerData.loan_type || 
                        (customerData.dealerType === 'customer' ? '' : customerData.dealerType) || '',
                    createdAt: createdAtDate,
                    createdAtTimestamp: createdAtDate.getTime(),
                    createdBy: customerData.createdBy || customerData.created_by || null,
                    primaryLoanId: customerData.primaryLoanId,
                    totalDocuments: customerData.quickStats?.totalDocuments || 0,
                    completedDocuments: customerData.quickStats?.completedDocuments || 0,
                    completionPercentage: customerData.quickStats?.completionPercentage || 0,
                    status: customerData.loan_application?.loan_details?.status ||
                        customerData.applicationStatus ||
                        customerData.status || '',
                    priority: customerData.loan_application?.loan_details?.priority || customerData.priority || 'Low',
                    hasFinanceScheme: !!(customerData.financeScheme && customerData.financeScheme.loanAmount),
                    employmentType: basic.occupation_type || customerData.customer_details?.occupation_info?.type || '',
                    hasFarm: customerData.customer_details?.farm_income_info?.has_farm || false,
                    collectedDocs: customerData.documents?.collected_documents ||
                        customerData.loan_application?.documents?.collected_documents ||
                        customerData.collected_documents || {},
                    assignedBankers: customerData.assignedBankers || [],
                    lastMessageSentAt: customerData.lastMessageSentAt || null
                };
            });

            // Sort by timestamp in descending order
            let list = customersList.sort((a, b) => {
                const timeDiff = b.createdAtTimestamp - a.createdAtTimestamp;
                if (timeDiff !== 0) return timeDiff;
                return b.id.localeCompare(a.id);
            });

            // For employees - filter to show only their created customers
            const isEmployee = employeeData && (employeeData.role?.toLowerCase() === 'agent' || employeeData.role?.toLowerCase() === 'employee');
            if (isEmployee && currentUser) {
                list = list.filter(c => c.createdBy === currentUser.uid);
            }
            return list;
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    };

    const handleSelectCustomer = (id) => {
        setSelectedCustomerIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAllOnPage = () => {
        const pageIds = paginatedCustomers.map(c => c.id);
        const allSelected = pageIds.every(id => selectedCustomerIds.includes(id));

        if (allSelected) {
            setSelectedCustomerIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedCustomerIds(prev => [...new Set([...prev, ...pageIds])]);
        }
    };

    const getMessagesSentToday = () => {
        const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
        let count = 0;
        customers.forEach(c => {
            if (c.lastMessageSentAt) {
                const sentDate = new Date(c.lastMessageSentAt).toLocaleDateString('en-CA');
                if (sentDate === today) count++;
            }
        });
        return count;
    };

    const messagesSentToday = getMessagesSentToday();
    const dailyLimit = 150;
    const remainingQuota = Math.max(0, dailyLimit - messagesSentToday);

    const handleBulkWhatsAppSelected = () => {
        if (remainingQuota <= 0) {
            setToast({ message: 'Daily limit of 150 messages reached.', type: 'error' });
            return;
        }
        if (selectedCustomerIds.length === 0) {
            setToast({ message: 'Please select at least one customer', type: 'error' });
            return;
        }
        
        let targets = customers.filter(c => selectedCustomerIds.includes(c.id));
        if (targets.length > remainingQuota) {
            setToast({ message: `Daily quota remaining: ${remainingQuota}. Only the first ${remainingQuota} will be selected.`, type: 'warning' });
            targets = targets.slice(0, remainingQuota);
        }
        
        setBulkWhatsAppTargets(targets);
        setIsBulkWhatsAppModalOpen(true);
    };

    const handleBulkWhatsAppAll = () => {
        if (remainingQuota <= 0) {
            setToast({ message: 'Daily limit of 150 messages reached.', type: 'error' });
            return;
        }
        if (filteredCustomers.length === 0) {
            setToast({ message: 'No customers found', type: 'error' });
            return;
        }
        
        let targets = filteredCustomers;
        if (targets.length > remainingQuota) {
            setToast({ message: `Daily quota remaining: ${remainingQuota}. Sending to the first ${remainingQuota} only.`, type: 'warning' });
            targets = targets.slice(0, remainingQuota);
        }
        
        setBulkWhatsAppTargets(targets);
        setIsBulkWhatsAppModalOpen(true);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        const allCustomers = await getAllCustomers();
        setCustomers(allCustomers);

        // Load all contacts for autocomplete
        try {
            const categories = ['dealers', 'agents', 'bankers', 'finance_executives', 'customers', 'key_persons', 'dsa', 'bni', 'social_media', 'others'];
            let allContacts = [];
            
            for (const cat of categories) {
                const nodeRef = ref(database, `contacts/${cat}`);
                const snap = await get(nodeRef);
                if (snap.exists()) {
                    const data = snap.val();
                    const list = Object.entries(data).map(([id, data]) => ({
                        id,
                        name: data.dealerName || data.name || '',
                        mobile: data.mobile1 || data.mobile || '',
                        category: cat
                    }));
                    allContacts = allContacts.concat(list);
                }
            }
            setBankersList(allContacts);
        } catch (err) {
            
        }

        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Reload data when user navigates back to this page
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Page is visible again, reload data
                loadData();
            }
        };

        const handleFocus = () => {
            // Window regained focus, reload data
            loadData();
        };

        const handleClickOutside = (e) => {
            if (showContactDropdown && !e.target.closest('.contact-dropdown-container')) {
                setShowContactDropdown(false);
            }
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('mousedown', handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [loadData, showContactDropdown]);

    const handleCategoryChange = (value) => setSelectedCategory(value);
    const handleView = (id) => navigate(`/customer/${id}`);
    const handleEdit = (id) => navigate(`/customer/${id}/edit`);

    const handleStatusChange = async (customerId, loanId, newStatus, loanType) => {
        try {
            // Get the correct status list for this loan type
            const statusOptions = getStatusOptions(loanType);
            const statuses = statusOptions.map(s => s.value).filter(Boolean);
            const idx = statuses.indexOf(newStatus);
            const pct = idx >= 0 ? Math.round(((idx + 1) / statuses.length) * 100) : 0;

            // Get current timestamp
            const timestamp = new Date().toISOString();

            const updates = {};
            if (loanId) {
                updates[`loans/${loanId}/status`] = newStatus;
                updates[`loans/${loanId}/statusChangedAt`] = timestamp;
                updates[`loans/${loanId}/documentSummary/completionPercentage`] = pct;
            }
            // Update in the correct nested structure
            updates[`customers/${customerId}/loan_application/loan_details/status`] = newStatus;
            updates[`customers/${customerId}/applicationStatus`] = newStatus; // Keep for backward compatibility
            updates[`customers/${customerId}/quickStats/completionPercentage`] = pct;

            

            await update(ref(database), updates);
            setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: newStatus, completionPercentage: pct } : c));
            setToast({ type: 'success', message: 'Status updated successfully' });
        } catch (err) {
            
            setToast({ type: 'error', message: 'Failed to update status' });
        }
    };

    const handlePriorityChange = async (customerId, loanId, newPriority) => {
        try {
            const updates = {};
            if (loanId) {
                updates[`loans/${loanId}/priority`] = newPriority;
            }
            // Update in the correct nested structure
            updates[`customers/${customerId}/loan_application/loan_details/priority`] = newPriority;
            updates[`customers/${customerId}/priority`] = newPriority; // Keep for backward compatibility
            await update(ref(database), updates);
            setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, priority: newPriority } : c));
            setToast({ type: 'success', message: 'Priority updated successfully' });
        } catch (err) {
            
            setToast({ type: 'error', message: 'Failed to update priority' });
        }
    };

    const handleReminder = (customer) => {
        setSelectedCustomerForReminder(customer);
        setIsReminderModalOpen(true);
    };

    const handleWhatsApp = (customer) => {
        setSelectedCustomerForWhatsApp(customer);
        setIsWhatsAppModalOpen(true);
    };

    const handleDelete = (id) => {
        setCustomerToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        setShowDeleteConfirm(false);

        try {
            await remove(child(ref(database), `customers/${customerToDelete}`));
            await loadData();

            // Show success popup
            setToast({ type: 'success', message: 'Customer deleted successfully' });
        } catch (err) {
            
            setToast({ type: 'error', message: 'Failed to delete customer' });
        } finally {
            setCustomerToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setCustomerToDelete(null);
    };

    const handleAssignBanker = (customer) => {
        setSelectedCustomerForBanker(customer);
        setSelectedBankerId('');
        setShowAddNewBanker(false);
        setNewBankerName('');
        setNewBankerMobile('');
        setShowAssignBankerModal(true);
        setShowContactDropdown(false);
        setContactMatches([]);
    };

    const handleContactInputChange = (value) => {
        setNewBankerName(value);
        if (value.trim().length > 0) {
            const matches = bankersList.filter(contact =>
                contact.name.toLowerCase().includes(value.toLowerCase()) ||
                contact.mobile.includes(value)
            ).slice(0, 5); // Limit to 5 matches
            setContactMatches(matches);
            setShowContactDropdown(true);
        } else {
            setContactMatches([]);
            setShowContactDropdown(false);
        }
    };

    const handleContactSelect = (contact) => {
        setNewBankerName(contact.name);
        setNewBankerMobile(contact.mobile);
        setShowContactDropdown(false);
    };

    const addBankerToCustomer = async () => {
        if (!selectedCustomerForBanker) return;

        let bankerToAdd = null;

        // Check if adding from existing list or creating new
        if (showAddNewBanker) {
            // Validate new banker
            if (!newBankerName.trim() || !newBankerMobile.trim()) {
                alert('Please enter both name and mobile number');
                return;
            }
            if (newBankerMobile.length !== 10) {
                alert('Please enter a valid 10-digit mobile number');
                return;
            }

            bankerToAdd = {
                id: `banker_${Date.now()}`,
                name: newBankerName.trim(),
                mobile: newBankerMobile.trim(),
                addedAt: new Date().toISOString()
            };
        } else {
            // Adding from existing list
            if (!selectedBankerId) {
                alert('Please select a banker');
                return;
            }

            const selectedBanker = bankersList.find(b => b.id === selectedBankerId);
            if (!selectedBanker) {
                alert('Invalid banker selection');
                return;
            }

            bankerToAdd = {
                id: selectedBanker.id,
                name: selectedBanker.name,
                mobile: selectedBanker.mobile,
                addedAt: new Date().toISOString()
            };
        }

        try {
            const currentBankers = selectedCustomerForBanker.assignedBankers || [];

            // Check if banker already assigned
            if (currentBankers.some(b => b.mobile === bankerToAdd.mobile)) {
                alert('This banker is already assigned to this customer');
                return;
            }

            const updatedBankers = [...currentBankers, bankerToAdd];

            const updates = {};
            updates[`customers/${selectedCustomerForBanker.id}/assignedBankers`] = updatedBankers;

            await update(ref(database), updates);

            // Update local state
            setCustomers(prev => prev.map(c =>
                c.id === selectedCustomerForBanker.id
                    ? { ...c, assignedBankers: updatedBankers }
                    : c
            ));

            // Reset form
            setSelectedBankerId('');
            setShowAddNewBanker(false);
            setNewBankerName('');
            setNewBankerMobile('');

            // Update selected customer for banker to show updated list
            setSelectedCustomerForBanker(prev => ({
                ...prev,
                assignedBankers: updatedBankers
            }));
            setToast({ type: 'success', message: 'Banker assigned successfully' });
        } catch (err) {
            
            setToast({ type: 'error', message: 'Failed to add banker' });
        }
    };

    const removeBankerFromCustomer = async (bankerToRemove) => {
        if (!selectedCustomerForBanker) return;

        try {
            const currentBankers = selectedCustomerForBanker.assignedBankers || [];
            const updatedBankers = currentBankers.filter(b => b.id !== bankerToRemove.id);

            const updates = {};
            updates[`customers/${selectedCustomerForBanker.id}/assignedBankers`] = updatedBankers;

            await update(ref(database), updates);

            // Update local state
            setCustomers(prev => prev.map(c =>
                c.id === selectedCustomerForBanker.id
                    ? { ...c, assignedBankers: updatedBankers }
                    : c
            ));

            // Update selected customer
            setSelectedCustomerForBanker(prev => ({
                ...prev,
                assignedBankers: updatedBankers
            }));
            setToast({ type: 'success', message: 'Banker removed successfully' });
        } catch (err) {
            
            setToast({ type: 'error', message: 'Failed to remove banker' });
        }
    };

    const cancelAssignBanker = () => {
        setShowAssignBankerModal(false);
        setSelectedCustomerForBanker(null);
        setSelectedBankerId('');
        setShowAddNewBanker(false);
        setNewBankerName('');
        setNewBankerMobile('');
    };


    const filteredCustomers = (() => {
        let list = selectedCategory === 'all' ? customers : customers.filter(c => c.loanType === selectedCategory);

        // Filter by status
        if (selectedStatus !== 'all') {
            list = list.filter(c => (c.status || '').toLowerCase() === selectedStatus.toLowerCase());
        }

        // Filter by priority (NEW)
        if (selectedPriority !== 'all') {
            list = list.filter(c => (c.priority || 'Low').toLowerCase() === selectedPriority.toLowerCase());
        }

        // Filter out customers messaged in the last 7 days
        if (hideRecentlyMessaged) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            list = list.filter(c => {
                if (!c.lastMessageSentAt) return true;
                const lastSentDate = new Date(c.lastMessageSentAt);
                return lastSentDate < sevenDaysAgo;
            });
        }

        const q = (searchTerm || '').trim().toLowerCase();
        if (!q) return list;
        return list.filter(c => {
            const name = (c.name || '').toLowerCase();
            const m1 = (c.mobile1 || '').toLowerCase();
            const m2 = (c.mobile2 || '').toLowerCase();
            const aadhar = ((c.aadharNumber || c.aadhaar || c.aadhar || c.identityNumber) || '').toString().toLowerCase();
            return name.includes(q) || m1.includes(q) || m2.includes(q) || aadhar.includes(q);
        });
    })();

    useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedStatus, selectedPriority, searchTerm, customers]);

    const totalItems = filteredCustomers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                <FaUsers className="text-white text-lg sm:text-xl" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                Customer List
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Overview of customer applications and status
                        </p>
                    </div>

                </div>
                {/* <p className="text-gray-600 mb-8">Overview of customers</p> */}

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative lg:col-span-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            >
                                <option value="all">All Loan Types</option>
                                {Object.entries(LOAN_TYPE_NAMES).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            >
                                <option value="all">All Statuses</option>
                                {ALL_COMBINED_STATUSES.filter(s => s.value).map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            >
                                <option value="all">All Priorities</option>
                                {PRIORITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {/* Hide Recently Messaged Toggle */}
                        <div className="flex items-center gap-2 lg:col-span-4 mt-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={hideRecentlyMessaged}
                                    onChange={(e) => setHideRecentlyMessaged(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Hide recently messaged (last 7 days)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-gray-800">Customers ({filteredCustomers.length}/{customers.length})</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleBulkWhatsAppSelected}
                                disabled={selectedCustomerIds.length === 0 || remainingQuota <= 0}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <FaWhatsapp /> Send to Selected ({selectedCustomerIds.length})
                            </button>
                            <button
                                onClick={handleBulkWhatsAppAll}
                                disabled={remainingQuota <= 0 || filteredCustomers.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <FaWhatsapp /> Send to All
                            </button>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Card>
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableHeaderCell textAlign="left">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                checked={paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedCustomerIds.includes(c.id))}
                                                onChange={handleSelectAllOnPage}
                                            />
                                        </TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Sr. No.</TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Name</TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Mobile</TableHeaderCell>
                                        <TableHeaderCell textAlign="left">Type</TableHeaderCell>
                                        {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.customerActionAccess === true) && (
                                            <TableHeaderCell textAlign="right">Actions</TableHeaderCell>
                                        )}
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCustomers.map((customer, index) => {
                                        const total = customer.totalDocuments || 0;
                                        const completed = customer.completedDocuments || 0;
                                        const docPct = total > 0 ? Math.round((completed / total) * 100) : 0;
                                        const pct = typeof customer.completionPercentage === 'number' && customer.completionPercentage >= 0 ? customer.completionPercentage : docPct;
                                        const serialNumber = (currentPage - 1) * pageSize + index + 1;

                                        return (
                                            <TableRow key={customer.id} onClick={() => handleSelectCustomer(customer.id)} className="cursor-pointer">
                                                <TableCell textAlign="left" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        checked={selectedCustomerIds.includes(customer.id)}
                                                        onChange={() => handleSelectCustomer(customer.id)}
                                                    />
                                                </TableCell>
                                                <TableCell textAlign="left">{serialNumber}</TableCell>
                                                <TableCell primary textAlign="left">
                                                    <div className="flex items-center gap-2">
                                                        {customer.hasFinanceScheme && (
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"
                                                                title="Finance Scheme Added"
                                                            />
                                                        )}
                                                        <span>{customer.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell textAlign="left">{customer.mobile1}</TableCell>
                                                <TableCell textAlign="left">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                        {(LOAN_TYPE_NAMES[customer.loanType] || customer.loanType || 'Customer').replace('_', ' ')}
                                                    </span>
                                                </TableCell>
                                                <TableCell textAlign="right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.customerActionAccess === true) && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleWhatsApp(customer); }}
                                                                    className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition-colors"
                                                                    title="Send WhatsApp Message"
                                                                >
                                                                    <FaWhatsapp />
                                                                </button>
                                                                <PrimaryButton onClick={(e) => { e.stopPropagation(); handleEdit(customer.id); }} variant="emerald" className="text-sm px-3 py-1.5" aria-label="Edit">
                                                                    <FaEdit />
                                                                </PrimaryButton>
                                                                <DangerButton onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="text-sm px-3 py-1.5" aria-label="Delete">
                                                                    <FaTrash />
                                                                </DangerButton>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {paginatedCustomers.map(customer => {
                            const total = customer.totalDocuments || 0;
                            const completed = customer.completedDocuments || 0;
                            const docPct = total > 0 ? Math.round((completed / total) * 100) : 0;
                            const pct = typeof customer.completionPercentage === 'number' && customer.completionPercentage >= 0 ? customer.completionPercentage : docPct;

                            return (
                                <div key={customer.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 relative">
                                    <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            checked={selectedCustomerIds.includes(customer.id)}
                                            onChange={() => handleSelectCustomer(customer.id)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-start mb-3" onClick={() => handleSelectCustomer(customer.id)}>
                                        <div>
                                            <h4
                                                className="font-bold text-gray-800 text-lg px-2 py-1 rounded inline-block"
                                                style={customer.hasFinanceScheme ? {
                                                    backgroundColor: '#d1fae5',
                                                    color: '#065f46'
                                                } : {}}
                                            >
                                                {customer.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <span>📱</span> {customer.mobile1}
                                            </p>
                                            {customer.email && (
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <span>📧</span> {customer.email}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <span>📅</span> {formatDate(customer.createdAt)}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium border border-blue-100 max-w-[140px] truncate">
                                            {LOAN_TYPE_NAMES[customer.loanType] || customer.loanType}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.neutral.gray100 }}>
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors.primary.emerald }} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Application Status</label>
                                            <StatusDropdown
                                                value={customer.status}
                                                onChange={(e) => { e.stopPropagation(); handleStatusChange(customer.id, customer.primaryLoanId, e.target.value, customer.loanType); }}
                                                options={getStatusOptions(customer.loanType)}
                                                className="w-full"
                                            />
                                        </div>



                                        <div className="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                                            {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.customerActionAccess === true) && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleWhatsApp(customer); }}
                                                        className="flex-1 text-sm py-2 flex items-center justify-center gap-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
                                                    >
                                                        <FaWhatsapp />
                                                        <span>WhatsApp</span>
                                                    </button>
                                                    <PrimaryButton onClick={(e) => { e.stopPropagation(); handleEdit(customer.id); }} variant="emerald" className="flex-1 text-sm py-2 flex items-center justify-center gap-1" aria-label="Edit">
                                                        <FaEdit />
                                                        <span>Edit</span>
                                                    </PrimaryButton>
                                                    <DangerButton onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="flex-1 text-sm py-2 flex items-center justify-center gap-1" aria-label="Delete">
                                                        <FaTrash />
                                                        <span>Delete</span>
                                                    </DangerButton>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                </div>

                <ReminderModal
                    isOpen={isReminderModalOpen}
                    onClose={() => setIsReminderModalOpen(false)}
                    customer={selectedCustomerForReminder}
                />

                <WhatsAppMessageModal
                                    isOpen={isWhatsAppModalOpen}
                                    onClose={() => setIsWhatsAppModalOpen(false)}
                                    customer={selectedCustomerForWhatsApp}
                                />

                                <BulkWhatsAppModal
                                    isOpen={isBulkWhatsAppModalOpen}
                                    onClose={() => setIsBulkWhatsAppModalOpen(false)}
                                    selectedContacts={bulkWhatsAppTargets}
                                />

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                                    <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Delete this customer?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    This cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={confirmDelete}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 min-w-[100px]"
                                    >
                                        OK
                                    </button>
                                    <button
                                        onClick={cancelDelete}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors duration-200 min-w-[100px]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Success Modal Popup */}
                {deleteSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Deleted Successfully!
                                </h3>
                                <p className="text-gray-600">
                                    Customer has been deleted successfully.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Banker Modal */}
                {showAssignBankerModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full transform animate-scaleIn max-h-[90vh] overflow-y-auto">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                                            <FaUserTie className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Assigned Bankers/Executives
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedCustomerForBanker?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={cancelAssignBanker}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* List of Assigned Bankers */}
                                {selectedCustomerForBanker?.assignedBankers?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Currently Assigned:</h4>
                                        <div className="space-y-2">
                                            {selectedCustomerForBanker.assignedBankers.map((banker, index) => (
                                                <div key={banker.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{banker.name}</p>
                                                            <p className="text-sm text-gray-600">📱 {banker.mobile}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeBankerFromCustomer(banker)}
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                                        title="Remove"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Banker Section */}
                                <div className="border-t pt-4">
                                    {!showAddNewBanker ? (
                                        <>
                                            {/* List of existing bankers */}
                                            <div className="mb-4 max-h-64 overflow-y-auto space-y-2">
                                                {bankersList.map(banker => (
                                                    <div
                                                        key={banker.id}
                                                        onClick={() => setSelectedBankerId(banker.id)}
                                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedBankerId === banker.id
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{banker.name}</p>
                                                                <p className="text-sm text-gray-600">📱 {banker.mobile}</p>
                                                            </div>
                                                            {selectedBankerId === banker.id && (
                                                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add New Button */}
                                            <button
                                                onClick={() => setShowAddNewBanker(true)}
                                                className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="text-xl">+</span>
                                                Add New Banker/Executive
                                            </button>

                                            <div className="flex gap-3 justify-end mt-4">
                                                <button
                                                    onClick={cancelAssignBanker}
                                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    onClick={addBankerToCustomer}
                                                    disabled={!selectedBankerId}
                                                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    + Add Selected
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Add new banker form */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-700">Add New Banker/Executive:</h4>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddNewBanker(false);
                                                            setNewBankerName('');
                                                            setNewBankerMobile('');
                                                        }}
                                                        className="text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        ← Back to list
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Name *
                                                        </label>
                                                        <div className="relative contact-dropdown-container">
                                                            <input
                                                                type="text"
                                                                value={newBankerName}
                                                                onChange={(e) => handleContactInputChange(e.target.value)}
                                                                autoComplete="off"
                                                                placeholder="Enter banker name"
                                                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                                            />
                                                            {showContactDropdown && contactMatches.length > 0 && (
                                                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-auto">
                                                                    {contactMatches.map(contact => (
                                                                        <button
                                                                            key={contact.id}
                                                                            type="button"
                                                                            onClick={() => handleContactSelect(contact)}
                                                                            className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-0 transition-colors"
                                                                        >
                                                                            <div className="flex justify-between items-center">
                                                                                <div>
                                                                                    <div className="font-semibold text-gray-800">{contact.name}</div>
                                                                                    <div className="text-sm text-gray-500">📱 {contact.mobile}</div>
                                                                                </div>
                                                                                <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded capitalize">
                                                                                    {contact.category?.replace('_', ' ')}
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Mobile Number *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={newBankerMobile}
                                                            onChange={(e) => setNewBankerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                            placeholder="Enter 10-digit mobile number"
                                                            maxLength="10"
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-end">
                                                <button
                                                    onClick={cancelAssignBanker}
                                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    onClick={addBankerToCustomer}
                                                    disabled={!newBankerName.trim() || !newBankerMobile.trim()}
                                                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    + Add New
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CustomerList;
