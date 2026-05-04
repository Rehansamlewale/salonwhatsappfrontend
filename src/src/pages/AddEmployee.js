import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, set, get, update } from 'firebase/database';
import { database } from '../firebase';

// Employee utilities functions
// Generate a random, URL-friendly employee id (e.g. "emp_k9x4s7a_kt3z")
const generateEmployeeId = async () => {
    try {
        // Use a compact random string + timestamp to avoid collisions
        const rand = Math.random().toString(36).slice(2, 10);
        const time = Date.now().toString(36);
        return `emp_${rand}_${time}`;
    } catch (error) {
        
        return `emp_${Date.now()}`;
    }
};

const addEmployee = async (employeeData) => {
    try {
        if (!database) {
            throw new Error('Firebase Realtime Database is not initialized. Please add REACT_APP_FIREBASE_DATABASE_URL to your .env file.');
        }

        const empId = await generateEmployeeId();

        // Auth account creation removed per request
        // if (employeeData.email && employeeData.password) { ... }

        const employeeRef = ref(database, `employees/${empId}`);

        const employee = {
            emp_id: empId,
            email: employeeData.email || '',
            name: employeeData.name,
            number: parseInt(employeeData.mobile) || 0,
            password: employeeData.password || '',
            role: employeeData.role || 'agent',
            permissions: employeeData.permissions || {
                dashboardAccess: true,
                addCustomerAccess: true,
                customerListAccess: true,
                employeesAccess: false,
                remindersAccess: true,
                dealersAccess: false,
                insurenceAccess: false,
                reportsAccess: false,
                enquiriesAccess: false,
                customerActionAccess: true,
                employeeActionAccess: false,
                contactActionAccess: false,
                insuranceActionAccess: false,
                enquiryActionAccess: false
            },
            isActive: employeeData.isActive !== undefined ? employeeData.isActive : true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await set(employeeRef, employee);

        return { success: true, employeeId: empId };
    } catch (error) {
        
        return { success: false, error: error.message };
    }
};

const getEmployeeById = async (employeeId) => {
    try {
        const employeeRef = ref(database, `employees/${employeeId}`);
        const snapshot = await get(employeeRef);

        if (!snapshot.exists()) {
            return null;
        }

        const emp = snapshot.val();
        return {
            id: employeeId,
            name: emp.name || '',
            email: emp.email || '',
            mobile: emp.number?.toString() || '',
            permissions: emp.permissions || {
                dashboardAccess: true,
                addCustomerAccess: true,
                customerListAccess: true,
                employeesAccess: false,
                remindersAccess: true,
                dealersAccess: false,
                insurenceAccess: false,
                reportsAccess: false,
                enquiriesAccess: false,
                customerActionAccess: true,
                employeeActionAccess: false,
                contactActionAccess: false,
                insuranceActionAccess: false,
                enquiryActionAccess: false
            },
            isActive: emp.isActive !== undefined ? emp.isActive : true
        };
    } catch (error) {
        
        return null;
    }
};

const updateEmployee = async (employeeId, updates) => {
    try {
        const employeeRef = ref(database, `employees/${employeeId}`);

        // Get existing employee data to preserve password if not updating
        const snapshot = await get(employeeRef);
        const existingEmployee = snapshot.exists() ? snapshot.val() : {};

        const updateData = {
            emp_id: employeeId,
            name: updates.name,
            email: updates.email || '',
            number: parseInt(updates.mobile) || 0,
            // Only update password if a new one is provided, otherwise keep existing
            password: updates.password ? updates.password : (existingEmployee.password || ''),
            role: updates.role || 'agent',
            permissions: updates.permissions || {
                dashboardAccess: true,
                addCustomerAccess: true,
                customerListAccess: true,
                employeesAccess: false,
                remindersAccess: true,
                dealersAccess: false,
                insurenceAccess: false,
                reportsAccess: false,
                enquiriesAccess: false,
                customerActionAccess: true,
                employeeActionAccess: false,
                contactActionAccess: false,
                insuranceActionAccess: false,
                enquiryActionAccess: false
            },
            isActive: updates.isActive !== undefined ? updates.isActive : true,
            updatedAt: new Date().toISOString()
        };

        await update(employeeRef, updateData);
        return { success: true };
    } catch (error) {
        
        return { success: false, error: error.message };
    }
};

const getAllEmployees = async () => {
    try {
        if (!database) {
            
            return [];
        }

        const employeesRef = ref(database, 'employees');
        const snapshot = await get(employeesRef);

        if (!snapshot.exists()) {
            return [];
        }

        const employeesData = snapshot.val();
        const employees = Object.keys(employeesData).map(empId => {
            const emp = employeesData[empId];
            return {
                id: empId,
                name: emp.name || '',
                email: emp.email || '',
                mobile: emp.number?.toString() || '',
                permissions: emp.permissions || {
                    dashboardAccess: true,
                    addCustomerAccess: true,
                    customerListAccess: true,
                    employeesAccess: false,
                    remindersAccess: true,
                    dealersAccess: false,
                    insurenceAccess: false,
                    reportsAccess: false,
                    enquiriesAccess: false,
                    customerActionAccess: true,
                    employeeActionAccess: false,
                    contactActionAccess: false,
                    insuranceActionAccess: false,
                    enquiryActionAccess: false
                },
                isActive: emp.isActive !== undefined ? emp.isActive : true
            };
        });

        employees.sort((a, b) => a.name.localeCompare(b.name));

        return employees;
    } catch (error) {
        
        return [];
    }
};

// Permissions will be managed via checkboxes instead of roles

const AddEmployee = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        role: 'Agent',
        isActive: true,
        permissions: {
            dashboardAccess: true,
            addCustomerAccess: true,
            customerListAccess: true,
            employeesAccess: false,
            remindersAccess: true,
            dealersAccess: false,
            insurenceAccess: false,
            reportsAccess: false,
            enquiriesAccess: false,
            customerActionAccess: true,
            employeeActionAccess: false,
            contactActionAccess: false,
            insuranceActionAccess: false,
            enquiryActionAccess: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: 'success', // 'success', 'error', 'warning'
        title: '',
        message: ''
    });

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            loadEmployee();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadEmployee = async () => {
        setLoading(true);
        const employee = await getEmployeeById(id);
        if (employee) {
            setFormData({
                name: employee.name,
                email: employee.email || '',
                mobile: employee.mobile,
                password: '', // Don't load password in edit mode
                role: employee.role || 'Agent',
                isActive: employee.isActive !== undefined ? employee.isActive : true,
                permissions: employee.permissions || {
                    dashboardAccess: true,
                    addCustomerAccess: true,
                    customerListAccess: true,
                    employeesAccess: false,
                    remindersAccess: true,
                    dealersAccess: false,
                    insurenceAccess: false,
                    reportsAccess: false,
                    enquiriesAccess: false,
                    customerActionAccess: true,
                    employeeActionAccess: false,
                    contactActionAccess: false,
                    insuranceActionAccess: false,
                    enquiryActionAccess: false
                }
            });
        }
        setLoading(false);
    };

    const showNotification = (type, title, message) => {
        setModalConfig({ type, title, message });
        setShowModal(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Employee Name is required';
        } else if (/[^a-zA-Z\s]/.test(formData.name)) {
            newErrors.name = 'Employee Name should only contain letters and spaces';
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!isEditMode && !formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Check for duplicate email and mobile before adding (only for new employees)
        if (!isEditMode) {
            const allEmployees = await getAllEmployees();

            // Check for duplicate email
            if (formData.email) {
                const emailExists = allEmployees.some(emp =>
                    emp.email.toLowerCase() === formData.email.toLowerCase()
                );

                if (emailExists) {
                    setLoading(false);
                    showNotification('error', 'Email Already Exists', `An employee with email "${formData.email}" is already registered in the system. Please use a different email address.`);
                    return;
                }
            }

            // Check for duplicate mobile number
            if (formData.mobile) {
                const mobileExists = allEmployees.some(emp =>
                    emp.mobile === formData.mobile
                );

                if (mobileExists) {
                    setLoading(false);
                    showNotification('error', 'Mobile Number Already Exists', `An employee with mobile number "${formData.mobile}" is already registered in the system. Please use a different mobile number.`);
                    return;
                }
            }
        }

        let result;
        if (isEditMode) {
            result = await updateEmployee(id, formData);
        } else {
            result = await addEmployee(formData);
        }

        setLoading(false);

        if (result.success) {
            showNotification('success', 'Success', `Employee ${isEditMode ? 'updated' : 'added'} successfully!`);
            setTimeout(() => navigate('/employees'), 1500);
        } else {
            showNotification('error', 'Error', result.error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let processedValue = value;

        // Convert email to lowercase automatically
        if (name === 'email') {
            processedValue = value.toLowerCase();
        }

        // Only allow digits for mobile number
        if (name === 'mobile') {
            processedValue = value.replace(/\D/g, ''); // Remove all non-digits
        }

        // Only allow letters and spaces for name
        if (name === 'name') {
            if (!/^[a-zA-Z\s]*$/.test(value)) {
                return; // Ignore invalid input
            }
        }

        // Handle checkbox for isActive
        if (type === 'checkbox') {
            processedValue = checked;
        }

        // Auto-enable all permissions if Manager is selected
        if (name === 'role' && value === 'Manager') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                permissions: {
                    dashboardAccess: true,
                    addCustomerAccess: true,
                    customerListAccess: true,
                    employeesAccess: true,
                    remindersAccess: true,
                    dealersAccess: true,
                    insurenceAccess: true,
                    reportsAccess: true,
                    enquiriesAccess: true,
                    customerActionAccess: true,
                    employeeActionAccess: true,
                    contactActionAccess: true,
                    insuranceActionAccess: true,
                    enquiryActionAccess: true
                }
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <>
            {/* Professional Modal Notification */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-fadeIn">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modalConfig.type === 'success' ? 'bg-green-100' :
                                modalConfig.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                                }`}>
                                <span className="text-4xl">
                                    {modalConfig.type === 'success' ? '✅' : modalConfig.type === 'error' ? '❌' : '⚠️'}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className={`text-2xl font-bold mb-2 ${modalConfig.type === 'success' ? 'text-green-600' :
                                modalConfig.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                {modalConfig.title}
                            </h3>

                            {/* Message */}
                            <p className="text-gray-600 mb-6">
                                {modalConfig.message}
                            </p>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 ${modalConfig.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    modalConfig.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                    }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 animate-fadeIn">
                {/* Header */}
                <div className="mb-6 animate-slideUp">
                    <button
                        onClick={() => navigate('/employees')}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium mb-4 transform hover:scale-105"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform duration-200 text-lg">←</span>
                        <span>Back to Employees</span>
                    </button>
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient">
                        {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                    </h2>
                    <p className="text-gray-600">
                        {isEditMode ? 'Update employee information' : 'Fill in the details to add a new employee'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">👤</span>
                                <span>Basic Information</span>
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <span>Employee Name</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className={`w-full px-4 py-3 border-2 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠️</span>{errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <span>Email Address</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="employee@example.com"
                                        className={`w-full px-4 py-3 border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all`}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠️</span>{errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Mobile Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <span>Mobile Number</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                        className={`w-full px-4 py-3 border-2 ${errors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                            } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all`}
                                    />
                                    {errors.mobile && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <span>⚠️</span>{errors.mobile}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field - Only for new employees */}
                                {!isEditMode && (
                                    <div>
                                        <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                            <span>Password</span>
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Minimum 6 characters"
                                            className={`w-full px-4 py-3 border-2 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                } rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all`}
                                        />
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <span>⚠️</span>{errors.password}
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                            <span>💡</span>Password cannot be changed after creation
                                        </p>
                                    </div>
                                )}

                                {/* Status Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <span>Status</span>
                                    </label>
                                    <select
                                        name="isActive"
                                        value={formData.isActive ? 'true' : 'false'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white"
                                    >
                                        <option value="true">✓ Active</option>
                                        <option value="false">✗ Inactive</option>
                                    </select>
                                </div>

                                {/* Role Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <span>Role</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white"
                                    >
                                        <option value="Agent">Agent</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">🔐</span>
                                <span>Access Permissions</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.dashboardAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, dashboardAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>📊</span>Dashboard
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-green-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.addCustomerAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, addCustomerAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>➕</span>Add Customer
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-purple-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.customerListAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, customerListAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>📁</span>Customer List
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-orange-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.employeesAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, employeesAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>👥</span>Employees
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-yellow-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.remindersAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, remindersAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>🔔</span>Reminders
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-teal-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.dealersAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, dealersAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>📋</span>Contacts
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-indigo-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.insurenceAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, insurenceAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>🛡️</span>Insurance
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-cyan-50 to-sky-50 hover:from-cyan-100 hover:to-sky-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-cyan-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.reportsAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, reportsAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>📊</span>Reports
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-violet-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.enquiriesAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, enquiriesAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>💬</span>Enquiries
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-purple-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.customerActionAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, customerActionAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>✏️</span>Customer Actions
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-orange-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.employeeActionAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, employeeActionAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>✏️</span>Employee Actions
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-teal-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.contactActionAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, contactActionAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>✏️</span>Contact Actions
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-indigo-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.insuranceActionAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, insuranceActionAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>✏️</span>Insurance Actions
                                    </span>
                                </label>

                                <label className="relative flex items-center gap-3 cursor-pointer bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 p-4 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-violet-300 group">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.enquiryActionAccess}
                                        disabled={formData.role === 'Manager'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, enquiryActionAccess: e.target.checked }
                                        }))}
                                        className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <span>✏️</span>Enquiry Actions
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/employees')}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {isEditMode ? 'Updating...' : 'Adding...'}
                                    </span>
                                ) : (
                                    isEditMode ? '✓ Update Employee' : '✓ Add Employee'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddEmployee;
