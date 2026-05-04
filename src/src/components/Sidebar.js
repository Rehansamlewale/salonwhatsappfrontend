import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdDashboard, MdPeople, MdContacts, MdSecurity, MdNotifications, MdAssessment, MdQuestionAnswer } from 'react-icons/md';
import { FaUserPlus, FaUsers, FaChevronLeft, FaChevronRight, FaWhatsapp } from 'react-icons/fa';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../firebase';

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) => {
    // const [collapsed, setCollapsed] = useState(false); // Controlled by parent now
    const location = useLocation();
    const { employeeData } = useAuth();
    const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState(0);

    // Pending enquiries count fetch removed

    // Map permission keys to paths
    const permissionMap = {
        '/dashboard': 'dashboardAccess',
        '/customer-list': 'customerListAccess',
        '/contacts': 'dealersAccess',
        '/message-template': 'customerListAccess'
    };

    // Check if user is an employee/agent
    const isEmployee = employeeData &&
        employeeData.role &&
        (employeeData.role.toLowerCase() === 'agent' || employeeData.role.toLowerCase() === 'employee');

    const allMenuItems = [
        {
            icon: MdDashboard,
            label: 'Dashboard',
            // Show employee dashboard for employees, admin dashboard for admins
            path: isEmployee ? '/emp-dashboard' : '/dashboard'
        },
        {
            icon: FaUsers,
            label: 'Customer List',
            path: '/customer-list'
        },
        {
            icon: MdContacts,
            label: 'Contacts',
            path: '/contacts'
        },
        {
            icon: FaWhatsapp,
            label: 'Message Template',
            path: '/message-template'
        }
    ];

    // Filter menu items based on employee permissions
    const menuItems = (employeeData && employeeData.role !== 'Manager')
        ? allMenuItems.filter(item => {
            // For employees, always show the employee dashboard
            if (item.path === '/emp-dashboard') return true;

            // specific check for admins or if permissions missing completely
            if (!employeeData.permissions) return false;

            const permKey = permissionMap[item.path];
            // If path not in map (like dealers), default to false for employees
            if (!permKey) return false;

            return employeeData.permissions[permKey] === true;
        })
        : allMenuItems; // Show all if no permission data (admin) or if Manager

    const isActive = (path) => {
        // Exact match for the path
        if (location.pathname === path) return true;

        // Check for sub-routes
        // For /contacts, also match /add-contact and /edit-contact/:id
        if (path === '/contacts' && (location.pathname === '/add-contact' || location.pathname.startsWith('/edit-contact/'))) {
            return true;
        }

        // For /customer-list, also match /customer/:id/edit
        if (path === '/customer-list' && location.pathname.startsWith('/customer/')) {
            return true;
        }

        return false;
    };

    return (
        <div className={`${collapsed ? 'w-14' : 'w-48'
            } h-screen flex flex-col transition-all duration-300 shadow-lg fixed left-0 top-0 z-40 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            style={{ backgroundColor: '#F5F7FA' }}>

            {/* Logo/Header - At the very top, same height as navbar */}
            <div className="h-16 flex items-center px-4 border-b bg-white" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center justify-between w-full">
                    {!collapsed && (
                        <div className="flex items-center space-x-2">
                            <img
                                src="/logo.png"
                                alt="Loan Management System"
                                className="w-8 h-8 rounded-full object-cover border-2 shadow-lg"
                                style={{ borderColor: '#2E865F' }}
                            />
                            <div>
                                <h2 className="text-gray-800 font-bold text-sm">Loan</h2>
                                <p className="text-gray-800 text-sm font-bold">Finance</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="flex justify-center w-full">
                            <img
                                src="/logo.png"
                                alt="Loan"
                                className="w-8 h-8 rounded-full object-cover border-2"
                                style={{ borderColor: '#2E865F' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const IconComponent = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen && setSidebarOpen(false)}
                                className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive(item.path)
                                    ? 'shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200/50'
                                    }`}
                                style={isActive(item.path) ? { backgroundColor: '#2E865F', color: 'white' } : {}}
                            >
                                <div className="flex items-center space-x-2">
                                    <IconComponent className="text-xl flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="font-semibold text-sm">{item.label}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Toggle Button - at the bottom of sidebar */}
            <div className="p-3 border-t hidden lg:block" style={{ borderColor: '#E2E8F0' }}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`w-full flex items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md ${collapsed ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    style={{ backgroundColor: '#2E865F', color: 'white' }}
                    title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {collapsed ? (
                        <FaChevronRight className="text-lg" />
                    ) : (
                        <FaChevronLeft className="text-lg" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
