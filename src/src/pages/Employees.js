import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, remove, update } from 'firebase/database';
import { database } from '../firebase';
import { FaEye, FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';
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
    Pagination,
    Toast
} from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/designTokens';

// Employee utilities functions
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

            // Extract timestamp from employee ID (format: emp_randomstring_timestamp)
            let idTimestamp = null;
            const idParts = empId.split('_');
            if (idParts.length >= 3) {
                // Last part is base36 timestamp
                const timeBase36 = idParts[idParts.length - 1];
                idTimestamp = parseInt(timeBase36, 36);
            }

            // Get timestamps for sorting
            let createdAtDate;
            let updatedAtDate;

            // Try to get createdAt timestamp
            const createdAtString = emp.createdAt || emp.created_at || emp.timestamp;
            if (createdAtString) {
                createdAtDate = new Date(createdAtString);
                if (isNaN(createdAtDate.getTime())) {
                    // If invalid, use ID timestamp or current date
                    createdAtDate = idTimestamp ? new Date(idTimestamp) : new Date();
                }
            } else {
                // Use ID timestamp as fallback, or current date
                createdAtDate = idTimestamp ? new Date(idTimestamp) : new Date();
            }

            // Try to get updatedAt timestamp
            const updatedAtString = emp.updatedAt || emp.updated_at;
            if (updatedAtString) {
                updatedAtDate = new Date(updatedAtString);
                if (isNaN(updatedAtDate.getTime())) {
                    updatedAtDate = createdAtDate; // Fallback to createdAt
                }
            } else {
                updatedAtDate = createdAtDate; // Fallback to createdAt
            }

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
                role: emp.role || 'Agent',
                isActive: emp.isActive !== undefined ? emp.isActive : true,
                createdAt: createdAtDate,
                updatedAt: updatedAtDate,
                createdAtTimestamp: createdAtDate.getTime(),
                updatedAtTimestamp: updatedAtDate.getTime()
            };
        });

        // Sort by most recent (updatedAt first, then createdAt, then by ID for stability)
        employees.sort((a, b) => {
            // First sort by updatedAt timestamp (descending - newest first)
            const timeDiff = b.updatedAtTimestamp - a.updatedAtTimestamp;
            if (timeDiff !== 0) return timeDiff;

            // If updatedAt is equal, sort by createdAt
            const createdDiff = b.createdAtTimestamp - a.createdAtTimestamp;
            if (createdDiff !== 0) return createdDiff;

            // If both timestamps are equal, sort by ID for stable sort
            return b.id.localeCompare(a.id);
        });

        return employees;
    } catch (error) {
        
        return [];
    }
};

const deleteEmployee = async (employeeId) => {
    try {
        const employeeRef = ref(database, `employees/${employeeId}`);
        await remove(employeeRef);
        return { success: true };
    } catch (error) {
        
        return { success: false, error: error.message };
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
            role: updates.role || existingEmployee.role || 'Agent',
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

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [toast, setToast] = useState(null);
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const pageSize = 10;

    const { employeeData, currentUser } = useAuth();
    // Admin or employee with permission can perform actions
    const canPerformActions = (!employeeData && !currentUser?.isDbUser) ||
        (employeeData?.role?.toLowerCase() === 'admin') ||
        (employeeData?.permissions?.employeeActionAccess === true);

    const navigate = useNavigate();

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, employees]);

    const loadEmployees = async () => {
        setLoading(true);
        const data = await getAllEmployees();
        setEmployees(data);
        setFilteredEmployees(data);
        setLoading(false);
    };

    const filterEmployees = () => {
        let filtered = employees;

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.mobile?.includes(searchTerm)
            );
        }

        setFilteredEmployees(filtered);
    };

    const handleDelete = (id, name) => {
        setEmployeeToDelete({ id, name });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        setShowDeleteConfirm(false);

        try {
            const result = await deleteEmployee(employeeToDelete.id);
            if (result.success) {
                await loadEmployees();

                // Show success popup
                setToast({ type: 'success', message: 'Employee deleted successfully' });
            }
        } catch (err) {
            
            setToast({ type: 'error', message: 'Failed to delete employee' });
        } finally {
            setEmployeeToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
    };

    const handleToggleStatus = async (employee) => {
        const newStatus = !employee.isActive;
        const result = await updateEmployee(employee.id, {
            name: employee.name,
            email: employee.email,
            mobile: employee.mobile,
            permissions: employee.permissions,
            isActive: newStatus,
            role: employee.role
        });

        if (result.success) {
            // Update only the specific employee in state instead of reloading all
            setEmployees(prevEmployees =>
                prevEmployees.map(emp =>
                    emp.id === employee.id
                        ? { ...emp, isActive: newStatus }
                        : emp
                )
            );

            setFilteredEmployees(prevFiltered =>
                prevFiltered.map(emp =>
                    emp.id === employee.id
                        ? { ...emp, isActive: newStatus }
                        : emp
                )
            );
            setToast({ type: 'success', message: `Employee ${newStatus ? 'activated' : 'deactivated'} successfully` });
        } else {
            setToast({ type: 'error', message: 'Failed to update employee status' });
        }
    };

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeDetails(true);
    };

    // Pagination calculations
    const totalItems = filteredEmployees.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="w-full space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                    <FaUserTie className="text-white text-lg sm:text-xl" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                    Employee Management
                                </h1>
                            </div>
                            <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Manage your team members and their permissions
                            </p>
                        </div>
                        <PrimaryButton
                            onClick={() => navigate('/add-employee')}
                            variant="emerald"
                            className="px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto font-bold flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Add Employee
                        </PrimaryButton>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6 relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl z-10">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, email, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-md focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        />
                    </div>


                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading employees...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                                    <div className="text-gray-500 font-semibold mb-1">Total Employees</div>
                                    <div className="text-3xl font-bold text-gray-800">{employees.length}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                                    <div className="text-gray-500 font-semibold mb-1">Active Employees</div>
                                    <div className="text-3xl font-bold text-gray-800">
                                        {employees.filter(e => e.isActive).length}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
                                    <div className="text-gray-500 font-semibold mb-1">Inactive Employees</div>
                                    <div className="text-3xl font-bold text-gray-800">
                                        {employees.filter(e => !e.isActive).length}
                                    </div>
                                </div>
                            </div>

                            {/* Employee Table */}
                            {filteredEmployees.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                    <div className="text-6xl mb-4 opacity-30">👥</div>
                                    <p className="text-gray-500 text-lg">No employees found</p>
                                    {searchTerm && (
                                        <p className="text-gray-400 mt-2">Try searching for a different name</p>
                                    )}
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
                                                        <TableHeaderCell textAlign="left">Email</TableHeaderCell>
                                                        <TableHeaderCell textAlign="left">Mobile</TableHeaderCell>
                                                        <TableHeaderCell>Role</TableHeaderCell>
                                                        <TableHeaderCell>Status</TableHeaderCell>
                                                        <TableHeaderCell>Actions</TableHeaderCell>
                                                    </tr>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedEmployees.map((employee, index) => {
                                                        const serialNumber = (currentPage - 1) * pageSize + index + 1;
                                                        return (
                                                            <TableRow key={employee.id}>
                                                                <TableCell textAlign="left">{serialNumber}</TableCell>
                                                                <TableCell primary textAlign="left">{employee.name}</TableCell>
                                                                <TableCell textAlign="left">{employee.email || '-'}</TableCell>
                                                                <TableCell textAlign="left">{employee.mobile}</TableCell>
                                                                <TableCell>
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${employee.role === 'Manager' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                                        {employee.role}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center justify-center gap-3">
                                                                        <button
                                                                            onClick={() => handleToggleStatus(employee)}
                                                                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${employee.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                                                                            title={`Click to ${employee.isActive ? 'Deactivate' : 'Activate'}`}
                                                                        >
                                                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${employee.isActive ? 'translate-x-9' : 'translate-x-1'}`} />
                                                                        </button>
                                                                        <span className={`text-xs font-semibold ${employee.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {employee.isActive ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <button onClick={() => handleViewEmployee(employee)} className="text-sm px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200" aria-label="View" title="View Employee Details">
                                                                            <FaEye />
                                                                        </button>
                                                                        {canPerformActions && (
                                                                            <>
                                                                                <SecondaryButton onClick={() => navigate(`/employee/${employee.id}/edit`)} className="text-sm px-3 py-1.5" aria-label="Edit" title="Edit Employee">
                                                                                    <FaEdit />
                                                                                </SecondaryButton>
                                                                                <DangerButton onClick={() => handleDelete(employee.id, employee.name)} className="text-sm px-3 py-1.5" aria-label="Delete" title="Delete Employee">
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
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                                        {paginatedEmployees.map((employee, index) => {
                                            const serialNumber = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <div key={employee.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                                                                {serialNumber}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-800">{employee.name}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-xs text-gray-500 break-all">{employee.email || '-'}</p>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${employee.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                        {employee.role}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4 space-y-3">
                                                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                            <span className="mr-2">📱</span>
                                                            <span className="font-medium">{employee.mobile}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700">Account Status</span>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleToggleStatus(employee)}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 transform active:scale-95 ${employee.isActive
                                                                        ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                                                        : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                                                                        }`}
                                                                >
                                                                    {employee.isActive ? '● Active' : '○ Inactive'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                                        <button onClick={() => handleViewEmployee(employee)} className="flex-1 text-sm py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200" aria-label="View" title="View Employee Details">
                                                            <FaEye className="inline mr-1" /> View
                                                        </button>
                                                        {canPerformActions && (
                                                            <>
                                                                <SecondaryButton onClick={() => navigate(`/employee/${employee.id}/edit`)} className="flex-1 text-sm py-2" aria-label="Edit" title="Edit Employee">
                                                                    <FaEdit className="inline mr-1" /> Edit
                                                                </SecondaryButton>
                                                                <DangerButton onClick={() => handleDelete(employee.id, employee.name)} className="flex-1 text-sm py-2" aria-label="Delete" title="Delete Employee">
                                                                    <FaTrash className="inline mr-1" /> Delete
                                                                </DangerButton>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

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
                                Delete {employeeToDelete?.name}?
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

            {/* Employee Details Modal */}
            {showEmployeeDetails && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform animate-scaleIn max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Employee Details</h3>
                                <button
                                    onClick={() => setShowEmployeeDetails(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">👤</span> Basic Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Name</p>
                                        <p className="font-semibold text-gray-800">{selectedEmployee.name}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="font-semibold text-gray-800 break-all">{selectedEmployee.email || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Mobile</p>
                                        <p className="font-semibold text-gray-800">{selectedEmployee.mobile}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${selectedEmployee.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {selectedEmployee.isActive ? '● Active' : '○ Inactive'}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Role</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${selectedEmployee.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {selectedEmployee.role || 'Agent'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🔐</span> Access Permissions
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { key: 'dashboardAccess', label: 'Dashboard', icon: '📊' },
                                        { key: 'addCustomerAccess', label: 'Add Customer', icon: '➕' },
                                        { key: 'customerListAccess', label: 'Customer List', icon: '📁' },
                                        { key: 'employeesAccess', label: 'Employees', icon: '👥' },
                                        { key: 'remindersAccess', label: 'Reminders', icon: '🔔' },
                                        { key: 'dealersAccess', label: 'Contacts', icon: '📋' },
                                        { key: 'insurenceAccess', label: 'Insurance', icon: '🛡️' },
                                        { key: 'reportsAccess', label: 'Reports', icon: '📊' },
                                        { key: 'enquiriesAccess', label: 'Enquiries', icon: '💬' },
                                        { key: 'customerActionAccess', label: 'Customer Actions', icon: '✏️' },
                                        { key: 'employeeActionAccess', label: 'Employee Actions', icon: '✏️' },
                                        { key: 'contactActionAccess', label: 'Contact Actions', icon: '✏️' },
                                        { key: 'insuranceActionAccess', label: 'Insurance Actions', icon: '✏️' },
                                        { key: 'enquiryActionAccess', label: 'Enquiry Actions', icon: '✏️' }
                                    ].map(permission => (
                                        <div key={permission.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${selectedEmployee.permissions?.[permission.key]
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <span className="text-lg">{permission.icon}</span>
                                            <span className="text-sm font-medium text-gray-700 flex-1">{permission.label}</span>
                                            {selectedEmployee.permissions?.[permission.key] ? (
                                                <span className="text-green-600 font-bold">✓</span>
                                            ) : (
                                                <span className="text-gray-400">✗</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t">
                            <button
                                onClick={() => setShowEmployeeDetails(false)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Success Modal Popup - Removed (replaced with Toast) */}
        </>
    );
};

export default Employees;
