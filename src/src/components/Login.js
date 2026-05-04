import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Toast from './common/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await login(email, password);

            // Show success toast
            setShowSuccess(true);

            // Fetch fresh employee data for redirection logic
            let emp = null;
            try {
                if (database) {
                    const employeesRef = ref(database, 'employees');
                    const snapshot = await get(employeesRef);
                    if (snapshot.exists()) {
                        const employeesData = snapshot.val();
                        for (const [, empData] of Object.entries(employeesData)) {
                            if (empData.email && empData.email.toLowerCase() === email.toLowerCase()) {
                                emp = empData;
                                break;
                            }
                        }
                    }
                }
            } catch (fetchErr) {
                console.error('Error fetching employee data for redirect:', fetchErr);
                // We ignore this error because the login itself was successful
            }

            // Small delay to let the user see the success message
            setTimeout(() => {
                if (emp && emp.role) {
                    const roleLC = emp.role.toLowerCase();
                    if (emp.isActive === false) {
                        logout();
                        setError('Your account has been deactivated. Please contact the administrator.');
                        setShowSuccess(false);
                        return;
                    }

                    if (roleLC === 'agent' || roleLC === 'employee') {
                        navigate('/emp-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    // Fallback if employee data couldn't be fetched but login was successful
                    navigate('/dashboard');
                }
            }, 1500);

        } catch (err) {
            // If login already succeeded (showSuccess is true), don't show "Invalid" error
            if (showSuccess) {
                console.error('Post-login data fetch error:', err);
                // Fallback redirect after delay if not already handled
                setTimeout(() => navigate('/dashboard'), 1500);
                return;
            }

            const errorMsg = err.message || '';
            if (errorMsg.includes('deactivated') || errorMsg.includes('contact the administrator')) {
                setError(errorMsg);
            } else if (errorMsg.includes('auth/')) {
                setError('Invalid email or password');
            } else {
                setError(errorMsg || 'An error occurred during sign in');
            }
            
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="flex w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden bg-white min-h-[600px]">
                {/* Left Side - Illustration (Hidden on mobile) */}
                <div className="hidden lg:flex w-1/2 bg-[#C4D2F5] flex-col justify-center items-center p-12 relative overflow-hidden">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-20 left-20 w-16 h-16 border-4 border-white rounded-full opacity-20"></div>
                    <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-10 blur-xl"></div>

                    {/* Main Illustration Placeholder */}
                    <div className="relative z-10 mb-8 transform hover:scale-105 transition-transform duration-500">
                        <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
                            <img src="/logo.png" alt="Loan Management System" className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>

                    <div className="relative z-10 text-center max-w-sm">
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2 tracking-tight drop-shadow-sm">
                            Loan Management System
                        </h2>
                        <h3 className="text-lg font-semibold text-gray-700 mb-6 italic">
                            Your Trusted Finance Partner
                        </h3>
                        <div className="relative overflow-hidden group p-2">
                            <p className="text-gray-600 text-base font-medium transition-all duration-500 transform hover:scale-105">
                                We help you to grow your business.
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
                        </div>
                    </div>


                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 bg-white">
                    <div className="w-full max-w-sm space-y-6">
                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                <img src="/logo.png" alt="Loan Management System" className="w-24 h-24 rounded-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Welcome back 👋</h2>
                            <p className="mt-1 text-sm text-gray-500">Please enter your details to sign in.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>



                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {showSuccess && (
                <Toast
                    message="Login Successful! Redirecting..."
                    type="success"
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </div>
    );
};

export default Login;
