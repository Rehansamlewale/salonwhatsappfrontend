import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaKey, FaUser, FaChevronDown, FaWhatsapp } from 'react-icons/fa';
import ResetPasswordModal from './ResetPasswordModal';
import ProfileModal from './ProfileModal';
import WhatsAppConnectionModal from './WhatsAppConnectionModal';

const Navbar = ({ setSidebarOpen, collapsed }) => {
    const navigate = useNavigate();
    const { currentUser, logout, employeeData } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            
        }
    };

    const handleResetPassword = () => {
        setIsResetPasswordOpen(true);
        setIsDropdownOpen(false);
    };

    const handleProfile = () => {
        setIsProfileOpen(true);
        setIsDropdownOpen(false);
    };

    // Determine Role to display
    const rawRole = employeeData?.role || 'Admin';
    const userRole = rawRole === 'Agent' ? 'Employee' : rawRole;

    return (
        <nav className={`bg-white shadow-sm fixed top-0 z-50 h-16 border-b transition-all duration-300 
            ${collapsed ? 'lg:left-14' : 'lg:left-48'} left-0 right-0`}
            style={{ borderColor: '#E2E8F0' }}>
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center">
                {/* Mobile Menu Button - only visible on mobile */}
                <button
                    onClick={() => setSidebarOpen && setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#103766' }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Spacer to push right content to the right */}
                <div className="flex-1"></div>

                {/* Right side content - WhatsApp and Profile */}
                <div className="flex items-center space-x-3">
                    {/* WhatsApp Button */}
                    <button
                        onClick={() => setIsWhatsAppModalOpen(true)}
                        className="p-2 rounded-lg hover:bg-green-50 transition-colors focus:outline-none"
                        title="WhatsApp Connection"
                    >
                        <FaWhatsapp className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 hover:text-green-700" />
                    </button>

                    {/* User Menu Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                            <div className="flex flex-col text-right hidden sm:block">
                                <span className="text-xs text-gray-500 uppercase">{userRole}</span>
                            </div>
                            <FaUserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600" />
                            <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Content */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in-down origin-top-right z-50">
                                {/* Header in Dropdown */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.email}</p>
                                    <p className="text-xs text-primary-600 font-medium uppercase mt-1">{userRole}</p>
                                </div>

                                <div className="py-1">
                                    <button
                                        onClick={handleProfile}
                                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                    >
                                        <FaUser className="w-4 h-4 mr-3" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleResetPassword}
                                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                    >
                                        <FaKey className="w-4 h-4 mr-3" />
                                        Reset Password
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FaSignOutAlt className="w-4 h-4 mr-3" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ResetPasswordModal isOpen={isResetPasswordOpen} onClose={() => setIsResetPasswordOpen(false)} />
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <WhatsAppConnectionModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
        </nav>
    );
};

export default Navbar;
