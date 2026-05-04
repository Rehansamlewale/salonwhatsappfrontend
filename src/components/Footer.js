import React, { useState } from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <footer className="mt-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Compact Footer - Always Visible */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        {/* Left: Copyright */}
                        <p className="text-gray-400 text-sm">
                            © {currentYear} <span className="text-primary-400 font-semibold">Whatsapp connection</span>. All rights reserved.
                        </p>

                        {/* Center: Quick Contact */}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <span className="text-primary-400">📞</span>
                                <span className="hover:text-white transition-colors">9270 355 171</span>
                            </span>
                            <span className="hidden md:inline text-gray-700">•</span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-primary-400">📍</span>
                                <span className="hover:text-white transition-colors">Sangli</span>
                            </span>
                        </div>

                        {/* Right: Expand/Collapse Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 text-sm font-medium group"
                        >
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                                {isExpanded ? 'Show Less' : 'More Info'}
                            </span>
                            <span className={`text-primary-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                {isExpanded ? '▲' : '▼'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Footer Content */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {/* Brand Section with Logo */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src="/whatsapp_logo.png"
                                        alt="Whatsapp connection"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-lg"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-white leading-tight">Whatsapp</h3>
                                        <p className="text-primary-300 text-sm font-semibold">connection</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Your trusted partner for seamless WhatsApp communication and professional messaging services.
                                </p>
                                <div className="flex space-x-4">
                                    {[
                                        { icon: '📱', color: 'bg-blue-600 hover:bg-blue-500' },
                                        { icon: '💬', color: 'bg-green-600 hover:bg-green-500' },
                                        { icon: '📧', color: 'bg-purple-600 hover:bg-purple-500' }
                                    ].map((item, index) => (
                                        <button key={index} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${item.color}`}>
                                            <span className="text-lg">{item.icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                                    <span className="w-1 h-5 bg-primary-500 mr-3 rounded"></span>
                                    Contact Us
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start space-x-3">
                                        <span className="text-xl mt-0.5 text-primary-400">📍</span>
                                        <span className="text-gray-400 text-sm leading-relaxed">
                                            10, Mahalaxmi Complex, Pushparaj Chowk,<br />
                                            Behind Sangli District Central Bank,<br />
                                            Sangli – 416416
                                        </span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <span className="text-xl text-primary-400">📞</span>
                                        <div className="flex flex-col text-sm text-gray-400">
                                            <span className="hover:text-white transition-colors">9270 355 171</span>
                                            <span className="hover:text-white transition-colors">9175 171 555</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Trust & Statistics Section */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center">
                                        <span className="w-1 h-5 bg-primary-500 mr-3 rounded"></span>
                                        Why Choose Us
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { icon: '✓', label: 'Trusted by 1000+ Customers', color: 'text-green-400' },
                                            { icon: '⚡', label: 'Fast Loan Processing', color: 'text-yellow-400' },
                                            { icon: '🔒', label: 'Secure & Confidential', color: 'text-blue-400' },
                                            { icon: '💼', label: 'Expert Financial Advice', color: 'text-purple-400' }
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 group">
                                                <span className={`text-xl ${item.color} group-hover:scale-110 transition-transform`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Links in Expanded View */}
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-400">
                                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                                <span className="text-gray-700">•</span>
                                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                                <span className="text-gray-700">•</span>
                                <div className="flex items-center space-x-1.5">
                                    <span>Made with</span>
                                    <span className="text-red-500 animate-pulse text-base">❤️</span>
                                    <span>in India</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
