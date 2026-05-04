import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import WhatsAppReminderTemplate from '../components/WhatsAppReminderTemplate';
import { FaBell } from 'react-icons/fa';

const InsuranceReminders = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('expiring_soon'); // 'expired', 'expiring_soon', 'this_month', 'all'
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const navigate = useNavigate();

  // Days until expiry
  const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  // Load customers with insurance from insurences node
  const loadInsuranceCustomers = async () => {
    setLoading(true);
    try {
      // Fetch from insurences node
      const insurencesRef = ref(database, 'insurences');
      const snapshot = await get(insurencesRef);

      if (!snapshot.exists()) {
        setCustomers([]);
        setFilteredCustomers([]);
        setLoading(false);
        return;
      }

      const insurencesData = snapshot.val();
      const insuranceList = [];

      Object.entries(insurencesData).forEach(([id, data]) => {
        if (data.endDate) {
          const daysLeft = daysUntilExpiry(data.endDate);

          insuranceList.push({
            id,
            name: data.customerName || 'Unknown',
            mobile: data.mobile || '',
            insurance: {
              policyNumber: data.vehicleNumber || '', // Using vehicle number as policy reference
              company: data.insuranceCompany || '',
              policyType: 'Vehicle Insurance',
              expiryDate: data.endDate,
              premiumAmount: data.idv || '',
              startDate: data.startDate || '',
              vehicleNumber: data.vehicleNumber || '',
              model: data.model || ''
            },
            daysLeft,
            isExpired: daysLeft < 0,
            isExpiringSoon: daysLeft >= 0 && daysLeft <= 30,
            isExpiringThisMonth: daysLeft >= 0 && daysLeft <= 30
          });
        }
      });

      // Sort by days left (ascending)
      insuranceList.sort((a, b) => a.daysLeft - b.daysLeft);

      setCustomers(insuranceList);
      applyFilter(insuranceList, filter);
    } catch (error) {
      
    }
    setLoading(false);
  };

  // Apply filter
  const applyFilter = (customerList, filterType) => {
    let filtered = [];
    switch (filterType) {
      case 'expired':
        filtered = customerList.filter(c => c.isExpired);
        break;
      case 'expiring_soon':
        filtered = customerList.filter(c => c.isExpiringSoon && !c.isExpired);
        break;
      case 'this_month':
        filtered = customerList.filter(c => c.isExpiringThisMonth && !c.isExpired);
        break;
      case 'all':
      default:
        filtered = customerList;
        break;
    }
    setFilteredCustomers(filtered);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(customers, newFilter);
  };

  useEffect(() => {
    loadInsuranceCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full space-y-8">
        {/* Back Button - Top Left */}
        <button
          onClick={() => navigate('/reminders')}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium transform hover:scale-105"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200 text-lg">←</span>
          <span>Back to Reminders</span>
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <FaBell className="text-white text-lg sm:text-xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Insurance Reminders
              </h1>
            </div>
            <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Track and remind customers about insurance renewals
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-4xl font-bold mb-2">{customers.filter(c => c.isExpired).length}</div>
            <div className="text-red-100 font-medium">Expired</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-4xl font-bold mb-2">{customers.filter(c => c.isExpiringSoon && !c.isExpired).length}</div>
            <div className="text-orange-100 font-medium">Expiring Soon (30 days)</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-4xl font-bold mb-2">{customers.filter(c => c.isExpiringThisMonth && !c.isExpired).length}</div>
            <div className="text-yellow-100 font-medium">This Month</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-4xl font-bold mb-2">{customers.length}</div>
            <div className="text-blue-100 font-medium">Total Policies</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleFilterChange('expired')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'expired'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            Expired ({customers.filter(c => c.isExpired).length})
          </button>
          <button
            onClick={() => handleFilterChange('expiring_soon')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'expiring_soon'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            Expiring Soon ({customers.filter(c => c.isExpiringSoon && !c.isExpired).length})
          </button>
          <button
            onClick={() => handleFilterChange('this_month')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'this_month'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            This Month ({customers.filter(c => c.isExpiringThisMonth && !c.isExpired).length})
          </button>
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all'
              ? 'bg-gray-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            All ({customers.length})
          </button>
        </div>

        {/* Send to All Button */}
        {filteredCustomers.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>📱</span>
              <span>Send Insurance Reminders to {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''}</span>
            </button>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">
              {filter === 'expired' && 'Expired Policies'}
              {filter === 'expiring_soon' && 'Policies Expiring Soon'}
              {filter === 'this_month' && 'Expiring This Month'}
              {filter === 'all' && 'All Insurance Policies'}
            </h3>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-4xl block mb-4">🔔</span>
              <p className="text-lg">No insurance policies found for this filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-800">{customer.name}</h4>
                        {customer.isExpired && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                            ⚠️ Expired
                          </span>
                        )}
                        {!customer.isExpired && customer.daysLeft <= 7 && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                            🔔 {customer.daysLeft} days left
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>📱</span> {customer.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>🏢</span> {customer.insurance.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>🚗</span> {customer.insurance.vehicleNumber} ({customer.insurance.model})
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span> Expires: {new Date(customer.insurance.expiryDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/insurance')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <WhatsAppReminderTemplate
            customers={filteredCustomers}
            templateType="insurance"
            onClose={() => setShowWhatsAppModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default InsuranceReminders;
