import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, set, get, update } from 'firebase/database';
import { database, auth } from '../firebase';

const AddContact = () => {
    const { id } = useParams();
    const currentUser = auth.currentUser;

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!id);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const isEditMode = !!id;

    const [dealerData, setDealerData] = useState({
        dealerName: '',
        mobile1: '',
        email: '',
        dealerType: 'customer'
    });

    useEffect(() => {
        if (isEditMode) {
            loadDealerData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadDealerData = async () => {
        try {
            // Check customers node first as it's the primary storage for now
            let dealerRef = ref(database, `customers/${id}`);
            let snapshot = await get(dealerRef);

            if (!snapshot.exists()) {
                // If not in customers, check contacts node
                const getPrefixCategory = (prefix) => {
                    const prefixMap = {
                        'DEALER': 'dealers',
                        'AGENT': 'agents',
                        'BANKER': 'bankers',
                        'FINANCE': 'finance_executives',
                        'CUSTOMER': 'customers',
                        'KEY': 'key_persons',
                        'DSA': 'dsa',
                        'BNI': 'bni',
                        'SOCIAL': 'social_media',
                        'OTHER': 'others'
                    };
                    return prefixMap[prefix] || 'others';
                };

                const prefix = (id || '').toString().split('_')[0];
                const node = getPrefixCategory(prefix);
                dealerRef = ref(database, `contacts/${node}/${id}`);
                snapshot = await get(dealerRef);
            }

            if (snapshot.exists()) {
                const data = snapshot.val();
                setDealerData({
                    dealerName: data.dealerName || '',
                    mobile1: data.mobile1 || '',
                    email: data.email || '',
                    dealerType: data.dealerType || 'customer'
                });
            } else {
                setError('Contact not found');
                setTimeout(() => navigate('/contacts'), 2000);
            }
        } catch (error) {
            setError('Failed to load dealer data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let processedValue = value;

        // Real-time validation
        if (name === 'dealerName') {
            // Only allow letters and spaces
            if (!/^[a-zA-Z\s]*$/.test(value)) return;
        }

        if (name === 'mobile1' || name === 'pincode') {
            // Only allow digits
            processedValue = value.replace(/\D/g, '');
        }

        if (name === 'email') {
            processedValue = value.toLowerCase();
        }

        setDealerData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const validateMobile = (mobile) => {
        const mobileRegex = /^\d{10}$/;
        return mobileRegex.test(mobile);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const generateDealerId = async () => {
        try {
            const randomPart = Math.random().toString(36).substring(2, 14);
            const type = (dealerData.dealerType || 'dealer').toLowerCase();

            const getPrefixForType = (dealerType) => {
                const prefixMap = {
                    'dealer': 'DEALER',
                    'agent': 'AGENT',
                    'banker': 'BANKER',
                    'finance_executive': 'FINANCE',
                    'customer': 'CUSTOMER',
                    'key_person': 'KEY',
                    'dsa': 'DSA',
                    'bni': 'BNI',
                    'social_media': 'SOCIAL',
                    'others': 'OTHER'
                };
                return prefixMap[dealerType] || 'OTHER';
            };

            const prefix = getPrefixForType(type);
            return `${prefix}${randomPart}`;
        } catch (error) {
            return `OTHER${Date.now().toString(36)}`;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dealerData.dealerName.trim()) {
            setError('Contact Name is required');
            return;
        }

        if (!dealerData.mobile1) {
            setError('Mobile Number is required');
            return;
        }

        if (!/^[a-zA-Z\s]+$/.test(dealerData.dealerName.trim())) {
            setError('Contact name should contain only letters and spaces');
            return;
        }

        if (!validateMobile(dealerData.mobile1)) {
            setError('Mobile Number 1 must be a valid 10-digit number');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const getContactCategory = (dealerType) => {
            const typeMap = {
                'dealer': 'dealers',
                'agent': 'agents',
                'banker': 'bankers',
                'finance_executive': 'finance_executives',
                'customer': 'customers',
                'key_person': 'key_persons',
                'dsa': 'dsa',
                'bni': 'bni',
                'social_media': 'social_media',
                'others': 'others'
            };
            return typeMap[dealerType] || 'others';
        };

        try {
            const dealerId = isEditMode ? id : await generateDealerId();
            const node = getContactCategory(dealerData.dealerType);
            
            const contactData = {
                dealerId,
                dealerName: dealerData.dealerName,
                mobile1: dealerData.mobile1,
                email: dealerData.email || '',
                dealerType: dealerData.dealerType || 'customer',
                updatedAt: new Date().toISOString(),
                isActive: true
            };

            if (!isEditMode) {
                contactData.createdAt = new Date().toISOString();
                contactData.createdBy = currentUser?.uid || 'unknown';
                contactData.createdByEmail = currentUser?.email || 'unknown';
            }

            const updates = {};
            // Save to contacts structure
            updates[`contacts/${node}/${dealerId}`] = contactData;
            
            // Always save to customers node for CustomerList, regardless of type
            updates[`customers/${dealerId}`] = contactData;

            await update(ref(database), updates);
            setSuccess(isEditMode ? 'Contact updated successfully!' : 'Contact added successfully!');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setError(error.message || 'Failed to save contact');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-lg">Loading dealer data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 animate-fadeIn">
            {/* Header */}
            <div className="mb-6 animate-slideUp">
                <button
                    onClick={() => navigate('/contacts')}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium mb-4 transform hover:scale-105"
                >
                    <span className="group-hover:-translate-x-1 transition-transform duration-200 text-lg">←</span>
                    <span>Back to Contacts</span>
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 animate-gradient">
                    {isEditMode ? 'Edit Contact' : 'Add New Contact'}
                </h1>
                <p className="text-gray-600">
                    {isEditMode ? 'Update contact details and business information' : 'Enter contact details and business information'}
                </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scaleIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-green-600 text-4xl">✓</span>
                            </div>
                            <h3 className="text-2xl font-bold text-green-600 mb-2">Success</h3>
                            <p className="text-gray-600 mb-6">{success}</p>
                            <button
                                onClick={() => {
                                    setSuccess('');
                                    navigate('/contacts');
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scaleIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-red-600 text-4xl">✕</span>
                            </div>
                            <h3 className="text-2xl font-bold text-red-600 mb-2">Error</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                {/* Basic Information */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="dealerName"
                                value={dealerData.dealerName}
                                onChange={handleChange}
                                placeholder="Enter contact name (letters only)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="mobile1"
                                value={dealerData.mobile1}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                maxLength="10"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                Email Address (Optional)
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={dealerData.email}
                                onChange={handleChange}
                                placeholder="customer@example.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>


                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isEditMode ? 'Updating Contact...' : 'Adding Contact...'}</span>
                            </>
                        ) : (
                            <>
                                <span>{isEditMode ? '✓ Update Contact' : '✓ Add Contact'}</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/contacts')}
                        className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddContact;
