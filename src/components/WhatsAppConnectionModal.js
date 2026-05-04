import React, { useState, useEffect } from 'react';
import whatsappAPI from '../services/whatsappAPI';

const WhatsAppConnectionModal = ({ isOpen, onClose }) => {
  const [apiStatus, setApiStatus] = useState({ connected: false, loading: true });
  const [qrCode, setQrCode] = useState(null);
  const [qrError, setQrError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkAPIStatus();
      // Auto-refresh status every 30 seconds
      const interval = setInterval(checkAPIStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Auto-refresh when QR code is displayed
  useEffect(() => {
    if (qrCode && !apiStatus.connected && isOpen) {
      const quickInterval = setInterval(checkAPIStatus, 30000);
      return () => clearInterval(quickInterval);
    }
  }, [qrCode, apiStatus.connected, isOpen]);

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
      setQrCode(null);
      setQrError(null);
    } else {
      const qrResponse = await whatsappAPI.getQRCode();
      if (qrResponse.success && qrResponse.qrCode) {
        setQrCode(qrResponse.qrCode);
        setQrError(null);
      } else {
        setQrError(qrResponse.error || 'Failed to load QR code');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold">WhatsApp API - Automated Sending</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {apiStatus.loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Checking WhatsApp API status...</p>
            </div>
          ) : apiStatus.connected ? (
            // Connected State
            <div>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xl">✅</span>
                    <span className="font-semibold text-green-800">🤖 WhatsApp API - Automated Sending ✓</span>
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
                      🚪 Logout
                    </button>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  ✅ WhatsApp API Connected - Ready to send messages
                </p>
                {apiStatus.lastChecked && (
                  <p className="text-xs text-green-600 mt-1">
                    Last checked: {apiStatus.lastChecked}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Not Connected State
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 WhatsApp API - Automated Sending ✕</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">❌ WhatsApp API Not Connected</p>
                  <p className="text-red-600 text-sm mt-1">
                    {apiStatus.error || 'Please scan the QR code to connect WhatsApp'}
                  </p>
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
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4 mb-4">
                    📱 Scan this QR code with WhatsApp on your phone
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
                    <p className="text-yellow-600 text-sm">
                      {qrError || 'Click refresh to generate a new QR code'}
                    </p>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnectionModal;
