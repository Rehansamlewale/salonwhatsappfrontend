import React, { useState, useEffect } from 'react';
import whatsappAPI from '../services/whatsappAPI';

const WhatsAppAPIIntegration = ({ message, mediaUrl, selectedContacts, onSendComplete }) => {
    const [apiStatus, setApiStatus] = useState({ connected: false, loading: true });
    const [qrCode, setQrCode] = useState(null);
    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0, current: '' });
    const [sendResults, setSendResults] = useState([]);

    useEffect(() => {
        checkAPIStatus();
        // Auto-refresh status every 30 seconds
        const interval = setInterval(checkAPIStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-refresh when QR code is displayed
    useEffect(() => {
        if (qrCode && !apiStatus.connected) {
            
            const quickInterval = setInterval(checkAPIStatus, 30000);  // 30 seconds
            return () => clearInterval(quickInterval);
        }
    }, [qrCode, apiStatus.connected]);

    const checkAPIStatus = async () => {
        
        setApiStatus(prev => ({ ...prev, loading: true }));

        const status = await whatsappAPI.checkConnection();
        
        setApiStatus({
            connected: status.connected === true,
            loading: false,
            error: status.error,
            lastChecked: new Date().toLocaleTimeString()
        });

        if (status.connected === true) {
            
            setQrCode(null); // Clear QR code when connected
        } else {
            
            const qrResponse = await whatsappAPI.getQRCode();
            
            if (qrResponse.success && qrResponse.qrCode) {
                
                setQrCode(qrResponse.qrCode);
            } else {
                
            }
        }
    };

    const handleLogout = async () => {
        if (!window.confirm('Are you sure you want to logout from WhatsApp? You will need to scan the QR code again.')) {
            return;
        }

        setApiStatus(prev => ({ ...prev, loading: true }));
        const result = await whatsappAPI.logout();

        if (result.success) {
            alert('Logged out successfully! The page will refresh.');
            window.location.reload();
        } else {
            alert('Logout failed: ' + (result.error || 'Unknown error'));
            setApiStatus(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSendMessages = async () => {
        if (!apiStatus.connected || selectedContacts.length === 0) return;

        setSending(true);
        setSendProgress({ sent: 0, total: selectedContacts.length, current: '' });
        setSendResults([]);

        const results = [];

        for (let i = 0; i < selectedContacts.length; i++) {
            const contact = selectedContacts[i];
            setSendProgress({
                sent: i,
                total: selectedContacts.length,
                current: contact.name
            });

            try {
                const formattedPhone = whatsappAPI.formatPhoneNumber(contact.mobile || contact.mobile1);
                if (!formattedPhone) {
                    throw new Error('Missing phone number');
                }
                
                // Use individual customMessage if available, otherwise use shared message
                const messageToSend = contact.customMessage || message;
                const formattedMessage = whatsappAPI.formatMessage(messageToSend);

                // Use individual mediaUrl if available (from contact) or from props
                const mediaUrlToSend = contact.mediaUrl || mediaUrl;

                const result = await whatsappAPI.sendMessage(formattedPhone, formattedMessage, mediaUrlToSend);

                results.push({
                    contact: contact,
                    success: result.success,
                    error: result.error,
                    messageId: result.messageId
                });

                // Add delay between messages to avoid rate limiting
                if (i < selectedContacts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                results.push({
                    contact: contact,
                    success: false,
                    error: error.message
                });
            }
        }

        setSendProgress({ sent: selectedContacts.length, total: selectedContacts.length, current: '' });
        setSendResults(results);
        setSending(false);

        if (onSendComplete) {
            onSendComplete(results);
        }
    };

    const handleBulkSend = async () => {
        if (!apiStatus.connected || selectedContacts.length === 0) return;

        setSending(true);
        setSendProgress({ sent: 0, total: selectedContacts.length, current: 'Sending bulk...' });

        try {
            const contacts = selectedContacts.map(contact => ({
                phone: whatsappAPI.formatPhoneNumber(contact.mobile || contact.mobile1),
                name: contact.name
            }));

            const formattedMessage = whatsappAPI.formatMessage(message);
            const result = await whatsappAPI.sendBulkMessages(contacts, formattedMessage, mediaUrl);

            if (result.success) {
                setSendResults(result.results || []);
                setSendProgress({ sent: selectedContacts.length, total: selectedContacts.length, current: 'Complete!' });
            } else {
                setSendResults([{ success: false, error: result.error }]);
            }
        } catch (error) {
            setSendResults([{ success: false, error: error.message }]);
        }

        setSending(false);
    };



    if (apiStatus.loading) {
        return (
            <div className="p-6 text-center">
                <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Checking WhatsApp API status...</p>
            </div>
        );
    }

    if (!apiStatus.connected) {
        return (
            <div className="p-3 sm:p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">❌</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖WhatsApp API - Automated Sending✕</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800 font-semibold">❌WhatsApp API Not Connected</p>
                        <p className="text-red-600 text-sm mt-1">
                            {apiStatus.error || 'Please scan the QR code to connect WhatsApp'}
                        </p>
                        {apiStatus.triedUrls && (
                            <details className="mt-2">
                                <summary className="text-red-600 text-xs cursor-pointer">🔍 Debug Info (click to expand)</summary>
                                <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                    <p><strong>Tried URLs:</strong></p>
                                    <ul className="list-disc list-inside">
                                        {apiStatus.triedUrls.map((url, index) => (
                                            <li key={index} className="font-mono">{url}</li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        )}
                        {apiStatus.lastChecked && (
                            <p className="text-red-500 text-xs mt-2">
                                Last checked: {apiStatus.lastChecked}
                            </p>
                        )}
                    </div>
                </div>

                {qrCode ? (
                    <div className="text-center">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block shadow-lg">
                            <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" onLoad={() => {}} onError={() => {}} />
                        </div>
                        <p className="text-sm text-gray-600 mt-4 mb-4">
                            📱 Scan this QR code with WhatsApp on your phone
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                            QR Code: {qrCode ? `${qrCode.substring(0, 50)}...` : 'None'}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={checkAPIStatus}
                                disabled={apiStatus.loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {apiStatus.loading ? '🔄 Checking...' : '🔄 Check Connection'}
                            </button>
                            <button
                                onClick={() => window.open(whatsappAPI.getServerBase() + '/qr', '_blank')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                📱 WhatsApp QR Page
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800">⚠️ QR Code not available</p>
                            <p className="text-yellow-600 text-sm">Click refresh to generate a new QR code</p>
                        </div>
                        <div className="flex gap-2 justify-center flex-wrap">
                            <button
                                onClick={checkAPIStatus}
                                disabled={apiStatus.loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {apiStatus.loading ? '🔄 Loading...' : '🔄 Refresh Status'}
                            </button>
                            <button
                                onClick={() => window.open(whatsappAPI.getServerBase() + '/qr', '_blank')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                📱 Open WhatsApp QR
                            </button>
                            <button
                                onClick={() => window.open(whatsappAPI.getServerBase(), '_blank')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                🌐 Node.js Server
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6">
            {/* API Status */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">✅</span>
                        <span className="font-semibold text-green-800">🤖WhatsApp API - Automated Sending✓</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={checkAPIStatus}
                            disabled={apiStatus.loading}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {apiStatus.loading ? '🔄' : '🔄 Refresh'}
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={apiStatus.loading}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            🚺 Logout
                        </button>
                    </div>
                </div>
                <p className="text-sm text-green-700 mt-1">
                    ✅ WhatsApp API Connected - {apiStatus.ready !== false ? 'Ready to send messages' : 'Initializing...'} to {selectedContacts.length} contacts
                </p>
                {apiStatus.ready === false && (
                    <p className="text-sm text-yellow-700 mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                        ⚠️ Client is still initializing. Please wait 30-60 seconds before sending messages.
                    </p>
                )}
                {apiStatus.lastChecked && (
                    <p className="text-xs text-green-600 mt-1">
                        Last checked: {apiStatus.lastChecked}
                    </p>
                )}

                {/* Show selected contacts */}
                {selectedContacts.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Recipients:</h4>
                        <div className="space-y-1">
                            {selectedContacts.map(contact => (
                                <div key={contact.id} className="flex items-center gap-2 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${contact.type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {contact.type}
                                    </span>
                                    <span className="font-medium">{contact.name}</span>
                                    <span className="text-gray-600">({contact.mobile || contact.mobile1})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Send Options */}
            <div className="space-y-4 mb-6">
                <button
                    onClick={handleSendMessages}
                    disabled={sending || selectedContacts.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl">📤</span>
                    <span>Send to All Selected ({selectedContacts.length} contacts)</span>
                </button>

                <button
                    onClick={handleBulkSend}
                    disabled={sending || selectedContacts.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl">🚀</span>
                    <span>Send Bulk (Faster)</span>
                </button>
            </div>

            {/* Progress */}
            {sending && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-800">Sending Messages...</span>
                        <span className="text-sm text-blue-600">
                            {sendProgress.sent}/{sendProgress.total}
                        </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                        ></div>
                    </div>
                    {sendProgress.current && (
                        <p className="text-sm text-blue-700">
                            Currently sending to: {sendProgress.current}
                        </p>
                    )}
                </div>
            )}

            {/* Results */}
            {sendResults.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Send Results:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {sendResults.map((result, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-2 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                <span className="font-medium">
                                    {result.contact?.name || 'Bulk Send'}
                                </span>
                                <span className="text-sm">
                                    {result.success ? '✅ Sent' : `❌ ${result.error}`}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-300">
                        <div className="flex justify-between text-sm">
                            <span>Success: {sendResults.filter(r => r.success).length}</span>
                            <span>Failed: {sendResults.filter(r => !r.success).length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppAPIIntegration;
