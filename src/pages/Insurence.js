import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, get, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
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

const generateInsId = () => `ins_${Date.now()}`;

const addInsurence = async (id, data) => {
    try {
        await set(ref(database, `insurences/${id}`), data);
        return { success: true };
    } catch (err) {
        
        return { success: false, error: err.message };
    }
};

const getInsurenceById = async (id) => {
    try {
        const snap = await get(ref(database, `insurences/${id}`));
        if (!snap.exists()) return null;
        return snap.val();
    } catch (err) {
        
        return null;
    }
};

const updateInsurence = async (id, data) => {
    try {
        await update(ref(database, `insurences/${id}`), data);
        return { success: true };
    } catch (err) {
        
        return { success: false, error: err.message };
    }
};

const deleteInsurence = async (id) => {
    try {
        await remove(ref(database, `insurences/${id}`));
        return { success: true };
    } catch (err) {
        
        return { success: false, error: err.message };
    }
};

const Insurence = () => {
    const { currentUser, employeeData } = useAuth();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [form, setForm] = useState({
        customerName: '',
        mobile: '',
        place: '',
        birthDate: '',
        referenceName: '',
        referenceNo: '',
        vehicleNumber: '',
        model: '',
        manufacturingYear: '',
        insuranceCompany: '',
        executiveName: '',
        executiveMobile: '',
        idv: '',
        startDate: '',
        endDate: ''
    });
    const [notif, setNotif] = useState({ show: false, type: 'success', title: '', message: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [insuranceToDelete, setInsuranceToDelete] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [addSuccess, setAddSuccess] = useState(false);

    // Auto-fetch state
    const [vehicleMatches, setVehicleMatches] = useState([]);
    const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimerRef = useRef(null);

    // Search for vehicle records when vehicle number changes
    const searchVehicleRecords = useCallback(async (vehicleNum) => {
        if (!vehicleNum || vehicleNum.length < 4) {
            setVehicleMatches([]);
            setShowVehicleDropdown(false);
            return;
        }

        setIsSearching(true);
        try {
            const matches = [];
            const searchTerm = vehicleNum.toUpperCase();

            // First, fetch contacts to lookup referrer mobile numbers
            let allContacts = [];
            const contactsSnap = await get(ref(database, 'contacts'));
            if (contactsSnap.exists()) {
                const contactsData = contactsSnap.val();
                Object.values(contactsData).forEach(category => {
                    if (typeof category === 'object') {
                        Object.values(category).forEach(contact => {
                            if (contact && (contact.dealerName || contact.name)) {
                                allContacts.push(contact);
                            }
                        });
                    }
                });
            }

            // Helper function to find contact mobile by name
            const findContactMobile = (name) => {
                if (!name) return '';
                const contact = allContacts.find(c =>
                    (c.name || '').toLowerCase() === name.toLowerCase() ||
                    (c.dealerName || '').toLowerCase() === name.toLowerCase()
                );
                return contact ? (contact.mobile1 || contact.mobile || '') : '';
            };

            // Search in existing insurance records
            const insSnap = await get(ref(database, 'insurences'));
            if (insSnap.exists()) {
                const insData = insSnap.val();
                Object.entries(insData).forEach(([id, ins]) => {
                    if ((ins.vehicleNumber || '').toUpperCase().includes(searchTerm)) {
                        matches.push({
                            id,
                            source: 'insurance',
                            vehicleNumber: ins.vehicleNumber,
                            customerName: ins.customerName,
                            mobile: ins.mobile,
                            place: ins.place,
                            birthDate: ins.birthDate,
                            model: ins.model,
                            manufacturingYear: ins.manufacturingYear,
                            insuranceCompany: ins.insuranceCompany,
                            idv: ins.idv,
                            referenceName: ins.referenceName,
                            referenceNo: ins.referenceNo,
                            executiveName: ins.executiveName,
                            executiveMobile: ins.executiveMobile
                        });
                    }
                });
            }

            // Search in customer records (vehicle details)
            const custSnap = await get(ref(database, 'customers'));
            if (custSnap.exists()) {
                const custData = custSnap.val();
                Object.entries(custData).forEach(([id, cust]) => {
                    const vehicle = cust.customer_details?.vehicle_details || {};
                    const basic = cust.customer_details?.basic_info || {};
                    if ((vehicle.registration_number || '').toUpperCase().includes(searchTerm)) {
                        // Check if not already in matches
                        if (!matches.some(m => m.vehicleNumber === vehicle.registration_number)) {
                            const refName = basic.refered_by || '';
                            // Try to find referrer mobile: first from contacts, then from customer record
                            let refMobile = findContactMobile(refName);
                            // Fallback: check if reference mobile is stored directly in customer record
                            if (!refMobile) {
                                refMobile = basic.reference_mobile || basic.referrer_mobile || basic.ref_mobile || '';
                            }
                            matches.push({
                                id,
                                source: 'customer',
                                vehicleNumber: vehicle.registration_number,
                                customerName: basic.full_name,
                                mobile: basic.mobile,
                                place: basic.city_village || basic.city,
                                birthDate: basic.date_of_birth,
                                model: vehicle.model,
                                manufacturingYear: vehicle.manufacturing_year,
                                referenceName: refName,
                                referenceNo: refMobile
                            });
                        }
                    }
                });
            }

            setVehicleMatches(matches.slice(0, 5)); // Limit to 5 matches
            setShowVehicleDropdown(matches.length > 0);
        } catch (err) {
            
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle vehicle number change with debounce
    const handleVehicleNumberChange = (e) => {
        const value = e.target.value.toUpperCase();
        setForm(prev => ({ ...prev, vehicleNumber: value }));

        // Debounce search
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            searchVehicleRecords(value);
        }, 300);
    };

    // Select a match and fill form
    const handleSelectMatch = (match) => {
        setForm(prev => ({
            ...prev,
            vehicleNumber: match.vehicleNumber || prev.vehicleNumber,
            customerName: match.customerName || prev.customerName,
            mobile: match.mobile || prev.mobile,
            place: match.place || prev.place,
            birthDate: match.birthDate || prev.birthDate,
            model: match.model || prev.model,
            manufacturingYear: match.manufacturingYear || prev.manufacturingYear,
            insuranceCompany: match.insuranceCompany || prev.insuranceCompany,
            executiveName: match.executiveName || prev.executiveName,
            executiveMobile: match.executiveMobile || prev.executiveMobile,
            idv: match.idv || prev.idv,
            referenceName: match.referenceName || prev.referenceName,
            referenceNo: match.referenceNo || prev.referenceNo
        }));
        setShowVehicleDropdown(false);
        setVehicleMatches([]);
    };

    // Auto-lookup reference mobile when reference name is entered
    const handleReferenceNameBlur = async (e) => {
        const refName = e.target.value.trim();
        if (!refName || form.referenceNo) return; // Skip if no name or mobile already filled

        try {
            // Fetch contacts to find the referrer's mobile
            const contactsSnap = await get(ref(database, 'contacts'));
            if (contactsSnap.exists()) {
                const contactsData = contactsSnap.val();
                let foundMobile = '';

                // Search through all contact categories
                Object.values(contactsData).forEach(category => {
                    if (typeof category === 'object' && !foundMobile) {
                        Object.values(category).forEach(contact => {
                            if (contact && !foundMobile) {
                                const contactName = (contact.name || contact.dealerName || '').toLowerCase();
                                if (contactName === refName.toLowerCase()) {
                                    foundMobile = contact.mobile1 || contact.mobile || '';
                                }
                            }
                        });
                    }
                });

                if (foundMobile) {
                    setForm(prev => ({ ...prev, referenceNo: foundMobile }));
                }
            }
        } catch (err) {
            
        }
    };

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const snap = await get(ref(database, 'insurences'));
            if (!snap.exists()) { setList([]); setLoading(false); return; }
            const data = snap.val();
            let arr = Object.entries(data).map(([k, v]) => ({ id: k, ...v }));
            arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            // If employee logged in, show only their created insurences
            const isEmployee = employeeData && (employeeData.role?.toLowerCase() === 'agent' || employeeData.role?.toLowerCase() === 'employee');
            if (isEmployee && currentUser) {
                arr = arr.filter(i => i.createdBy === currentUser.uid);
            }
            setList(arr);
        } catch (err) {
            
        } finally { setLoading(false); }
    }, [employeeData, currentUser]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const openAdd = () => { setEditingId(null); setForm({ customerName: '', mobile: '', place: '', birthDate: '', referenceName: '', referenceNo: '', vehicleNumber: '', model: '', manufacturingYear: '', insuranceCompany: '', executiveName: '', executiveMobile: '', idv: '', startDate: '', endDate: '' }); setShowForm(true); };
    const openEdit = async (id) => {
        const data = await getInsurenceById(id);
        if (data) setForm({
            customerName: data.customerName || '',
            mobile: data.mobile || '',
            place: data.place || '',
            birthDate: data.birthDate || '',
            referenceName: data.referenceName || '',
            referenceNo: data.referenceNo || '',
            vehicleNumber: data.vehicleNumber || '',
            model: data.model || '',
            manufacturingYear: data.manufacturingYear || '',
            insuranceCompany: data.insuranceCompany || '',
            executiveName: data.executiveName || '',
            executiveMobile: data.executiveMobile || '',
            idv: data.idv || '',
            startDate: data.startDate || '',
            endDate: data.endDate || ''
        });
        setEditingId(id); setShowForm(true);
    };

    const handleDelete = (id) => {
        setInsuranceToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!insuranceToDelete) return;

        setShowDeleteConfirm(false);

        try {
            const res = await deleteInsurence(insuranceToDelete);
            if (res.success) {
                await loadAll();

                // Show success popup
                setDeleteSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Auto-hide after 2 seconds
                setTimeout(() => {
                    setDeleteSuccess(false);
                }, 2000);
            } else {
                
            }
        } catch (err) {
            
        } finally {
            setInsuranceToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setInsuranceToDelete(null);
    };

    const validate = () => {
        if (!form.customerName.trim()) return { ok: false, msg: 'Customer name is required' };
        if (!form.mobile.trim()) return { ok: false, msg: 'Mobile number is required' };
        if (!/^[0-9]{10}$/.test(form.mobile)) return { ok: false, msg: 'Mobile must be 10 digits' };
        if (!form.vehicleNumber.trim()) return { ok: false, msg: 'Vehicle number is required' };
        if (!form.model.trim()) return { ok: false, msg: 'Vehicle model is required' };
        if (!form.insuranceCompany.trim()) return { ok: false, msg: 'Insurance company is required' };
        if (!form.startDate || !form.endDate) return { ok: false, msg: 'Start and End dates are required' };
        return { ok: true };
    };

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        const v = validate();
        if (!v.ok) { alert(v.msg); return; }
        setLoading(true);
        const id = editingId || generateInsId();
        const payload = { ...form, updatedAt: Date.now(), updatedBy: currentUser?.uid || null };
        if (!editingId) payload.createdAt = Date.now();
        if (!editingId) payload.createdBy = currentUser?.uid || null;
        // Add human readable creator/updater names
        const actorName = (employeeData?.name) || currentUser?.displayName || currentUser?.email || 'admin';
        if (!editingId) payload.createdName = actorName;
        payload.updatedName = actorName;
        const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));
        const res = editingId ? await updateInsurence(id, cleanPayload) : await addInsurence(id, cleanPayload);
        setLoading(false);
        if (res.success) {
            setShowForm(false);
            await loadAll();

            // Show success popup for edit or add
            if (editingId) {
                setEditSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Auto-hide after 2 seconds
                setTimeout(() => {
                    setEditSuccess(false);
                }, 2000);
            } else {
                setAddSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Auto-hide after 2 seconds
                setTimeout(() => {
                    setAddSuccess(false);
                }, 2000);
            }
        } else {
            
        }
    };

    const filtered = list.filter(i => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (i.vehicleNumber || '').toLowerCase().includes(q)
            || (i.model || '').toLowerCase().includes(q)
            || (i.customerName || '').toLowerCase().includes(q)
            || (i.mobile || '').toLowerCase().includes(q)
            || (i.place || '').toLowerCase().includes(q)
            || (i.insuranceCompany || '').toLowerCase().includes(q)
            || (i.referenceName || '').toLowerCase().includes(q);
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const total = list.length;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedInsurances = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Calculate near expiry insurances (expiring within 30 days)
    const getNearExpiryInsurances = () => {
        const today = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setDate(today.getDate() + 30);

        return list.filter(insurance => {
            if (!insurance.endDate) return false;

            const endDate = new Date(insurance.endDate);
            return endDate >= today && endDate <= oneMonthFromNow;
        }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    };

    const nearExpiryInsurances = getNearExpiryInsurances();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div className="w-full space-y-8 px-6">{/* Padding moved to inner container */}
                {/* Header */}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="space-y-1 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                <FaShieldAlt className="text-white text-base sm:text-lg" />
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                Insurance Management
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-10 sm:ml-12 flex items-center gap-2 text-xs sm:text-sm">
                            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Manage vehicle insurances and track renewals
                        </p>
                    </div>
                    <PrimaryButton onClick={openAdd} variant="emerald" className="px-4 py-2 text-sm sm:text-base">
                        + Add Insurance
                    </PrimaryButton>
                </div>

                {/* Stats Cards with Subtle Left Border Accent */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                        <div className="text-sm text-gray-500 font-medium">Total Insurances</div>
                        <div className="text-3xl font-bold text-gray-800 mt-2">{total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
                        <div className="text-sm text-gray-500 font-medium">Recent</div>
                        <div className="text-3xl font-bold text-gray-800 mt-2">{filtered.slice(0, 3).length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300">
                        <div className="text-sm text-gray-500 font-medium">Expiring Soon</div>
                        <div className="text-3xl font-bold text-orange-600 mt-2">{nearExpiryInsurances.length}</div>
                    </div>
                </div>

                {/* Near Expiry Insurance Section */}
                {nearExpiryInsurances.length > 0 && (
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl">⚠️</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Near Expiry Insurance</h3>
                                    <p className="text-sm text-gray-600">{nearExpiryInsurances.length} insurance{nearExpiryInsurances.length > 1 ? 's' : ''} expiring within 30 days</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {nearExpiryInsurances.map((insurance) => {
                                    const endDate = new Date(insurance.endDate);
                                    const today = new Date();
                                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                                    return (
                                        <div key={insurance.id} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-400 hover:shadow-lg transition-shadow">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Customer</div>
                                                    <div className="font-semibold text-gray-800">{insurance.customerName}</div>
                                                    <div className="text-sm text-gray-600">{insurance.mobile}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Vehicle</div>
                                                    <div className="font-semibold text-gray-800">{insurance.vehicleNumber}</div>
                                                    <div className="text-sm text-gray-600">{insurance.model}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Insurance Company</div>
                                                    <div className="font-semibold text-gray-800">{insurance.insuranceCompany}</div>
                                                    <div className="text-sm text-gray-600">Expires: {insurance.endDate}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className={`px-4 py-2 rounded-lg text-center w-full ${daysLeft <= 7 ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                                                        daysLeft <= 15 ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                                                            'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                                        }`}>
                                                        <div className="text-2xl font-bold">{daysLeft}</div>
                                                        <div className="text-xs font-semibold">days left</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        placeholder="Search by vehicle, model, company or customer"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
                    />
                </div>

                {/* Desktop Table View */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600 text-lg mb-2">No insurance records found</p>
                        <p className="text-gray-500 text-sm">Add your first insurance to get started</p>
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
                                            <TableHeaderCell textAlign="left">Customer</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Mobile</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Place</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Vehicle No.</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Model</TableHeaderCell>
                                            <TableHeaderCell textAlign="left">Company</TableHeaderCell>
                                            <TableHeaderCell>Start</TableHeaderCell>
                                            <TableHeaderCell>End</TableHeaderCell>
                                            {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.insuranceActionAccess === true) && (
                                                <TableHeaderCell>Actions</TableHeaderCell>
                                            )}
                                        </tr>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedInsurances.map((it, idx) => {
                                            const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                                            return (
                                                <TableRow key={it.id}>
                                                    <TableCell textAlign="left">{serialNumber}</TableCell>
                                                    <TableCell primary textAlign="left">{it.customerName}</TableCell>
                                                    <TableCell textAlign="left">{it.mobile}</TableCell>
                                                    <TableCell textAlign="left">{it.place || '-'}</TableCell>
                                                    <TableCell textAlign="left">{it.vehicleNumber}</TableCell>
                                                    <TableCell textAlign="left">{it.model}</TableCell>
                                                    <TableCell textAlign="left">{it.insuranceCompany}</TableCell>
                                                    <TableCell>{it.startDate || '-'}</TableCell>
                                                    <TableCell>{it.endDate || '-'}</TableCell>
                                                    {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.insuranceActionAccess === true) && (
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <SecondaryButton onClick={() => openEdit(it.id)} className="text-sm px-3 py-1.5" aria-label="Edit" title="Edit Insurance">
                                                                    <FaEdit />
                                                                </SecondaryButton>
                                                                <DangerButton onClick={() => handleDelete(it.id)} className="text-sm px-3 py-1.5" aria-label="Delete" title="Delete Insurance">
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
                            {paginatedInsurances.map((it) => (
                                <div key={it.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                                    {/* Header with Customer Name and Vehicle */}
                                    <div className="mb-4 pb-4 border-b border-gray-100">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2">{it.customerName}</h4>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <span className="text-lg">📱</span>
                                            <span className="text-gray-800 font-medium">{it.mobile}</span>
                                        </div>
                                        {it.place && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-lg">📍</span>
                                                <span className="text-gray-600">{it.place}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vehicle Information */}
                                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Vehicle Number</div>
                                            <div className="font-semibold text-gray-800">{it.vehicleNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Model</div>
                                            <div className="text-gray-800">{it.model}</div>
                                        </div>
                                        {it.manufacturingYear && (
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Manufacturing Year</div>
                                                <div className="text-gray-800">{it.manufacturingYear}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Insurance Details */}
                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Insurance Company</div>
                                            <div className="font-medium text-gray-800">{it.insuranceCompany}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Start Date</div>
                                                <div className="text-sm text-gray-800">{it.startDate || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">End Date</div>
                                                <div className="text-sm text-gray-800">{it.endDate || '-'}</div>
                                            </div>
                                        </div>
                                        {it.idv && (
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">IDV</div>
                                                <div className="text-gray-800">₹ {it.idv}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {/* Actions */}
                                    {((!employeeData && !currentUser?.isDbUser) || employeeData?.role?.toLowerCase() === 'admin' || employeeData?.permissions?.insuranceActionAccess === true) && (
                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                            <SecondaryButton onClick={() => openEdit(it.id)} className="flex-1 text-sm py-2" aria-label="Edit" title="Edit Insurance">
                                                <FaEdit className="inline mr-2" />
                                                Edit
                                            </SecondaryButton>
                                            <DangerButton onClick={() => handleDelete(it.id)} className="flex-1 text-sm py-2" aria-label="Delete" title="Delete Insurance">
                                                <FaTrash className="inline mr-2" />
                                                Delete
                                            </DangerButton>
                                        </div>
                                    )}
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

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto relative">
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 z-10"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-lg sm:text-xl font-bold mb-4 pr-8">{editingId ? 'Edit Insurance' : 'Add Insurance'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:gap-4">
                            {/* Customer Information - now first */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="customerName"
                                        value={form.customerName}
                                        onChange={(e) => {
                                            if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                                                setForm(prev => ({ ...prev, customerName: e.target.value }))
                                            }
                                        }}
                                        placeholder="Enter customer name (letters only)"
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        Mobile no. <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="mobile"
                                        value={form.mobile}
                                        onChange={(e) => setForm(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                                        maxLength={10}
                                        placeholder="10-digit mobile number"
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Manufacturing year</label>
                                    <input name="manufacturingYear" value={form.manufacturingYear} onChange={(e) => setForm(prev => ({ ...prev, manufacturingYear: e.target.value.replace(/\D/g, '') }))} maxLength={4} placeholder="e.g. 2022" className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Birth date</label>
                                    <input type="date" name="birthDate" value={form.birthDate} onChange={(e) => setForm(prev => ({ ...prev, birthDate: e.target.value }))} max={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Reference name</label>
                                    <input name="referenceName" value={form.referenceName} onChange={(e) => {
                                        if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                                            setForm(prev => ({ ...prev, referenceName: e.target.value }))
                                        }
                                    }} onBlur={handleReferenceNameBlur} placeholder="e.g. Rajesh Sharma" className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Reference Mobile No.</label>
                                    <input name="referenceNo" value={form.referenceNo} onChange={(e) => setForm(prev => ({ ...prev, referenceNo: e.target.value.replace(/\D/g, '') }))} maxLength={10} placeholder="10-digit mobile number" className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>

                            {/* Vehicle Details - moved here above Manufacturing year */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        Vehicle Number <span className="text-red-500">*</span>
                                        {isSearching && <span className="ml-2 text-xs text-blue-500">Searching...</span>}
                                    </label>
                                    <input
                                        name="vehicleNumber"
                                        value={form.vehicleNumber}
                                        onChange={handleVehicleNumberChange}
                                        onBlur={() => setTimeout(() => setShowVehicleDropdown(false), 200)}
                                        onFocus={() => vehicleMatches.length > 0 && setShowVehicleDropdown(true)}
                                        placeholder="e.g. MH12AB1234"
                                        autoComplete="off"
                                        className="w-full px-4 py-2 border rounded"
                                    />

                                    {/* Dropdown for matching records */}
                                    {showVehicleDropdown && vehicleMatches.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                                            <div className="px-3 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
                                                Found {vehicleMatches.length} matching record(s) - Click to load
                                            </div>
                                            {vehicleMatches.map(match => (
                                                <button
                                                    key={match.id}
                                                    type="button"
                                                    onClick={() => handleSelectMatch(match)}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="font-medium text-gray-800">{match.vehicleNumber}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {match.customerName} • {match.mobile}
                                                                {match.model && ` • ${match.model}`}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-blue-600 font-semibold">
                                                            {match.source === 'insurance' ? '📋 Insurance' : '👤 Customer'}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        Vehicle model <span className="text-red-500">*</span>
                                    </label>
                                    <input name="model" value={form.model} onChange={(e) => setForm(prev => ({ ...prev, model: e.target.value }))} placeholder="e.g. Maruti Swift" className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Place</label>
                                    <input name="place" value={form.place} onChange={(e) => setForm(prev => ({ ...prev, place: e.target.value }))} placeholder="e.g. Pune, Mumbai" className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        Insurance company <span className="text-red-500">*</span>
                                    </label>
                                    <input name="insuranceCompany" value={form.insuranceCompany} onChange={(e) => setForm(prev => ({ ...prev, insuranceCompany: e.target.value }))} placeholder="e.g. ICICI Lombard, HDFC Ergo" className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Executive Name</label>
                                    <input name="executiveName" value={form.executiveName || ''} onChange={(e) => setForm(prev => ({ ...prev, executiveName: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))} placeholder="Enter executive name" className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Executive Mobile No.</label>
                                    <input name="executiveMobile" value={form.executiveMobile || ''} onChange={(e) => setForm(prev => ({ ...prev, executiveMobile: e.target.value.replace(/\D/g, '') }))} maxLength={10} placeholder="10-digit mobile number" className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">IDV of vehicle</label>
                                    <input name="idv" value={form.idv} onChange={(e) => setForm(prev => ({ ...prev, idv: e.target.value.replace(/[^0-9.]/g, '') }))} placeholder="e.g. 500000" className="w-full px-4 py-2 border rounded" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        Start date <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" name="startDate" value={form.startDate} onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1">
                                        End date <span className="text-red-500">*</span>
                                    </label>
                                    <input type="date" name="endDate" value={form.endDate} onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))} className="w-full px-4 py-2 border rounded" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-2 border-t border-gray-100">
                                <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                                    {editingId ? 'Edit Details' : 'Save'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="w-full sm:w-auto px-6 py-2 border rounded hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                Delete this insurance?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                This action cannot be undone.
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
                                Insurance record has been deleted successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Success Modal Popup */}
            {addSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Insurance Added Successfully!
                            </h3>
                            <p className="text-gray-600">
                                New insurance record has been added successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Success Modal Popup */}
            {editSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Updated Successfully!
                            </h3>
                            <p className="text-gray-600">
                                Insurance details have been updated successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Insurence;
