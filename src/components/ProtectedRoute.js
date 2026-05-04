import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, employeeData } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is an employee/agent
    const isEmployee = employeeData &&
        employeeData.role &&
        (employeeData.role.toLowerCase() === 'agent' || employeeData.role.toLowerCase() === 'employee');

    // If employee tries to access admin dashboard, always redirect to emp-dashboard
    if (isEmployee && location.pathname === '/dashboard') {
        return <Navigate to="/emp-dashboard" replace />;
    }

    // Map protected paths to permission keys used for employees
    const permissionMap = {
        '/dashboard': 'dashboardAccess',
        '/loan-categories': 'loanCategoriesAccess',
        '/employees': 'employeesAccess',
        '/add-employee': 'employeesAccess'
    };

    if (isEmployee) {
        // Check if current path matches a protected entry
        const matchedKey = Object.keys(permissionMap).find(route => location.pathname.startsWith(route));
        if (matchedKey) {
            const permKey = permissionMap[matchedKey];
            // If employee has explicit permission, allow; otherwise send to emp-dashboard
            if (!employeeData.permissions || employeeData.permissions[permKey] !== true) {
                if (location.pathname !== '/emp-dashboard') return <Navigate to="/emp-dashboard" replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;
