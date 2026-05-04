import React, { useState } from 'react';

const WhatsAppReminderTemplate = ({ customers = [], templateType, onClose }) => {
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0, current: '' });

  // Calculate age helper
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Generate birthday message
  const generateBirthdayMessage = (customer) => {
    const age = customer.birthdate ? calculateAge(customer.birthdate) : '';

    return `🎉🎂 *Happy Birthday ${customer.name}!* 🎂🎉

Dear ${customer.name},

Wishing you a very Happy Birthday! 🎈
${age ? `May this special day of turning ${age} bring you joy, success, and prosperity!` : 'May this special day bring you joy, success, and prosperity!'}

Thank you for being a valued customer of Loan Management System. We wish you all the best in your endeavors and hope to continue serving you in the years to come.

May God bless you with good health, happiness, and success! 🙏

Warm wishes,

📞 Contact Details:
Rajendra Kavathekar
Loan Management System
📱 9270 355 171
📱 9175 171 555

📍 Address
10, Mahalaxmi Complex, Pushkaraj Chowk,
Behind Sangli D.C.C Bank,
Sangli – 416416`;
  };

  // Generate insurance message
  const generateInsuranceMessage = (customer) => {
    const insurance = customer.insurance || {};
    const daysUntilExpiry = insurance.expiryDate
      ? Math.ceil((new Date(insurance.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    return `🔔 *Insurance Renewal Reminder*

Dear ${customer.name},

This is a friendly reminder that your ${insurance.policyType || 'insurance'} policy is ${daysUntilExpiry > 0 ? `expiring in ${daysUntilExpiry} days` : 'expired'}.

📋 Policy Details:
Policy Number: ${insurance.policyNumber || 'N/A'}
Insurance Company: ${insurance.company || 'N/A'}
Policy Type: ${insurance.policyType || 'N/A'}
Expiry Date: ${insurance.expiryDate ? new Date(insurance.expiryDate).toLocaleDateString('en-IN') : 'N/A'}
Premium Amount: ₹${insurance.premiumAmount || 'N/A'}

Please renew your policy before the expiry date to avoid any lapses in coverage.

For assistance with renewal, please contact us:

📞 Contact Details:
Rajendra Kavathekar
Loan Management System
📱 9270 355 171
📱 9175 171 555

📍 Address
10, Mahalaxmi Complex, Pushkaraj Chowk,
Behind Sangli D.C.C Bank,
Sangli – 416416

🙏 Thank you for your cooperation!`;
  };

  // Generate message based on template type
  const generateMessage = (customer) => {
    if (templateType === 'birthday') {
      return generateBirthdayMessage(customer);
    } else if (templateType === 'insurance') {
      return generateInsuranceMessage(customer);
    }
    return '';
  };

  // Get combined message for preview
  const getCombinedMessage = () => {
    if (selectedCustomers.length === 0) return 'No customers selected';
    if (selectedCustomers.length === 1) {
      const customer = customers.find(c => c.id === selectedCustomers[0]);
      return customer ? generateMessage(customer) : '';
    }
    return `Sending ${templateType} messages to ${selectedCustomers.length} customers`;
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleCustomerToggle = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile?.includes(searchTerm)
  );

  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCombinedMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      
    }
  };

  // Send messages directly via WhatsApp API
  const handleSendViaWhatsApp = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer');
      return;
    }

    setSending(true);
    setSendProgress({ sent: 0, total: selectedCustomers.length, current: '' });

    try {
      const whatsappAPI = (await import('../services/whatsappAPI')).default;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedCustomers.length; i++) {
        const customerId = selectedCustomers[i];
        const customer = customers.find(c => c.id === customerId);

        if (!customer) continue;

        setSendProgress({
          sent: i,
          total: selectedCustomers.length,
          current: customer.name
        });

        try {
          const message = generateMessage(customer);
          const formattedPhone = whatsappAPI.formatPhoneNumber(customer.mobile);
          const formattedMessage = whatsappAPI.formatMessage(message);

          const result = await whatsappAPI.sendMessage(formattedPhone, formattedMessage);

          if (result.success) {
            successCount++;
          } else {
            failCount++;
            
          }

          // Add delay between messages
          if (i < selectedCustomers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          failCount++;
          
        }
      }

      setSendProgress({ sent: selectedCustomers.length, total: selectedCustomers.length, current: 'Complete!' });

      // Show summary
      alert(`Messages sent!\nSuccess: ${successCount}\nFailed: ${failCount}`);

      // Close modal after successful send
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      
      alert('Failed to send messages. Please make sure WhatsApp is connected.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {templateType === 'birthday' ? '🎂 Birthday Wishes' : '🔔 Insurance Reminders'}
              </h3>
              <p className="text-green-100 mt-1">
                Select customers and send WhatsApp messages
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 text-2xl"
              disabled={sending}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Search and Select All */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              disabled={sending}
            />
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold whitespace-nowrap disabled:opacity-50"
              disabled={sending}
            >
              {selectAll ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Customer List */}
          <div className="space-y-2 mb-6">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => !sending && handleCustomerToggle(customer.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCustomers.includes(customer.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
                  } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{customer.name}</div>
                    <div className="text-sm text-gray-600">
                      📱 {customer.mobile}
                      {customer.birthdate && templateType === 'birthday' && (
                        <span className="ml-4">
                          🎂 {new Date(customer.birthdate).toLocaleDateString('en-IN')} ({calculateAge(customer.birthdate)} years)
                        </span>
                      )}
                      {customer.insurance?.expiryDate && templateType === 'insurance' && (
                        <span className="ml-4">
                          📅 Expires: {new Date(customer.insurance.expiryDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${selectedCustomers.includes(customer.id)
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                    }`}>
                    {selectedCustomers.includes(customer.id) && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sending Progress */}
          {sending && (
            <div className="bg-blue-50 rounded-xl p-6 mb-4">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  Sending Messages...
                </div>
                <div className="text-sm text-gray-600">
                  {sendProgress.current && `Currently sending to: ${sendProgress.current}`}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600">
                {sendProgress.sent} / {sendProgress.total} sent
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={selectedCustomers.length === 0 || sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? '✓ Copied!' : '📋 Copy Message'}
              </button>
              <button
                onClick={handleSendViaWhatsApp}
                disabled={selectedCustomers.length === 0 || sending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    📱 Send via WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppReminderTemplate;
