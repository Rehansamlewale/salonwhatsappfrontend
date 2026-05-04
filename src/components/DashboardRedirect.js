import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirect = () => {
    const { employeeData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If employee data exists, redirect to employee dashboard
        // Otherwise, redirect to admin dashboard
        if (employeeData) {
            navigate('/emp-dashboard', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    }, [employeeData, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardRedirect;
