import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import WhatsAppReminderTemplate from '../components/WhatsAppReminderTemplate';

const BirthdayReminders = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('this_month'); // 'today', 'this_week', 'this_month', 'all'
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const navigate = useNavigate();

  // Calculate age
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

  // Check if birthday is today
  const isBirthdayToday = (birthdate) => {
    const today = new Date();
    const bday = new Date(birthdate);
    return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
  };

  // Check if birthday is this week
  const isBirthdayThisWeek = (birthdate) => {
    const today = new Date();
    const bday = new Date(birthdate);
    const dayOfYear = (date) => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const diff = dayOfYear(new Date(today.getFullYear(), bday.getMonth(), bday.getDate())) - dayOfYear(today);
    return diff >= 0 && diff <= 7;
  };

  // Check if birthday is this month
  const isBirthdayThisMonth = (birthdate) => {
    const today = new Date();
    const bday = new Date(birthdate);
    return today.getMonth() === bday.getMonth();
  };

  // Days until birthday
  const daysUntilBirthday = (birthdate) => {
    const today = new Date();
    const bday = new Date(birthdate);
    const thisYearBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diff = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Load customers with birthdays
  const loadBirthdayCustomers = async () => {
    setLoading(true);
    try {
      // Fetch birthdates
      const birthdatesRef = ref(database, 'birthdates');
      const birthdatesSnapshot = await get(birthdatesRef);

      // Fetch customers
      const customersRef = ref(database, 'customers');
      const customersSnapshot = await get(customersRef);

      if (!birthdatesSnapshot.exists()) {
        setCustomers([]);
        setFilteredCustomers([]);
        setLoading(false);
        return;
      }

      const birthdatesData = birthdatesSnapshot.val();
      const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {};

      const birthdayList = [];

      Object.entries(birthdatesData).forEach(([id, data]) => {
        if (data.birthdate && data.customerId) {
          // Get customer details
          const customerData = customersData[data.customerId];
          const basicInfo = customerData?.customer_details?.basic_info || {};

          birthdayList.push({
            id: data.customerId,
            name: basicInfo.full_name || customerData?.fullName || 'Unknown',
            mobile: data.mobile || basicInfo.mobile || '',
            birthdate: data.birthdate,
            age: calculateAge(data.birthdate),
            daysUntil: daysUntilBirthday(data.birthdate),
            isToday: isBirthdayToday(data.birthdate),
            isThisWeek: isBirthdayThisWeek(data.birthdate),
            isThisMonth: isBirthdayThisMonth(data.birthdate)
          });
        }
      });

      // Sort by days until birthday
      birthdayList.sort((a, b) => a.daysUntil - b.daysUntil);

      setCustomers(birthdayList);
      applyFilter(birthdayList, filter);
    } catch (error) {
      
    }
    setLoading(false);
  };

  // Apply filter
  const applyFilter = (customerList, filterType) => {
    let filtered = [];
    switch (filterType) {
      case 'today':
        filtered = customerList.filter(c => c.isToday);
        break;
      case 'this_week':
        filtered = customerList.filter(c => c.isThisWeek);
        break;
      case 'this_month':
        filtered = customerList.filter(c => c.isThisMonth);
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
    loadBirthdayCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button - Top Left */}
      <button
        onClick={() => navigate('/reminders')}
        className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium mb-6 transform hover:scale-105"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200 text-lg">←</span>
        <span>Back to Reminders</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🎂 Birthday Reminders</h2>
          <p className="text-gray-600 mt-1">Send birthday wishes to your customers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-4xl font-bold mb-2">{customers.filter(c => c.isToday).length}</div>
          <div className="text-purple-100 font-medium">Today's Birthdays</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-4xl font-bold mb-2">{customers.filter(c => c.isThisWeek).length}</div>
          <div className="text-blue-100 font-medium">This Week</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-4xl font-bold mb-2">{customers.filter(c => c.isThisMonth).length}</div>
          <div className="text-green-100 font-medium">This Month</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-4xl font-bold mb-2">{customers.length}</div>
          <div className="text-orange-100 font-medium">Total Customers</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleFilterChange('today')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'today'
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          Today ({customers.filter(c => c.isToday).length})
        </button>
        <button
          onClick={() => handleFilterChange('this_week')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'this_week'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          This Week ({customers.filter(c => c.isThisWeek).length})
        </button>
        <button
          onClick={() => handleFilterChange('this_month')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'this_month'
            ? 'bg-green-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          This Month ({customers.filter(c => c.isThisMonth).length})
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
            <span>Send Birthday Wishes to {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">
            {filter === 'today' && 'Today\'s Birthdays'}
            {filter === 'this_week' && 'Birthdays This Week'}
            {filter === 'this_month' && 'Birthdays This Month'}
            {filter === 'all' && 'All Birthdays'}
          </h3>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-4xl block mb-4">🎂</span>
            <p className="text-lg">No birthdays found for this filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-800">{customer.name}</h4>
                      {customer.isToday && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                          🎉 Today!
                        </span>
                      )}
                      {!customer.isToday && customer.daysUntil <= 7 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          In {customer.daysUntil} day{customer.daysUntil !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>📱</span> {customer.mobile}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🎂</span> {new Date(customer.birthdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🎈</span> Turning {customer.age + 1} years
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/customer/${customer.id}`)}
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
          templateType="birthday"
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}
    </div>
  );
};

export default BirthdayReminders;
