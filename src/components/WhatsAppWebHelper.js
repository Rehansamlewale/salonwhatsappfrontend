import React, { useState, useEffect } from 'react';

const WhatsAppWebHelper = () => {
    const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
    const [lastUsed, setLastUsed] = useState(null);

    useEffect(() => {
        // Check if WhatsApp Web was used recently
        const lastUsedTime = localStorage.getItem('whatsapp-web-last-used');
        if (lastUsedTime) {
            setLastUsed(new Date(lastUsedTime));
        }
    }, []);

    const openWhatsAppWeb = () => {
        const now = new Date();
        localStorage.setItem('whatsapp-web-last-used', now.toISOString());
        setLastUsed(now);
        
        // Open WhatsApp Web in same tab
        window.location.href = 'https://web.whatsapp.com/';
    };

    const focusWhatsAppWeb = () => {
        // Just open WhatsApp Web in same tab
        openWhatsAppWeb();
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💬</span>
                <div>
                    <h3 className="font-semibold text-gray-800">WhatsApp Web</h3>
                    <p className="text-sm text-gray-600">Quick access to your WhatsApp</p>
                </div>
            </div>

            <div className="space-y-2">
                <button
                    onClick={isWhatsAppOpen ? focusWhatsAppWeb : openWhatsAppWeb}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                    <span className="text-lg">💻</span>
                    <span>{isWhatsAppOpen ? 'Focus Contact List' : 'Open Contact List'}</span>
                </button>

                {lastUsed && (
                    <div className="text-xs text-gray-500 text-center">
                        Last used: {lastUsed.toLocaleTimeString()}
                    </div>
                )}
            </div>

            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                    <span className="font-semibold">💡 Pro Tip:</span> Open WhatsApp Web once and keep the tab open. Then use "Copy & Open Contact List" buttons from customer pages to copy messages and paste them to any contact.
                </p>
            </div>
        </div>
    );
};

export default WhatsAppWebHelper;
