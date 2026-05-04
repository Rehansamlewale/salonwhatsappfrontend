import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import { FaBell, FaClock, FaCheck, FaHistory, FaBirthdayCake, FaShieldAlt } from 'react-icons/fa';
import { getDocumentList } from '../forms/loanTypes';
import WhatsAppReminderTemplate from '../components/WhatsAppReminderTemplate';

const Reminders = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('followup'); // followup, birthday, insurance
  const [reminders, setReminders] = useState({ pending: [], completed: [] });
  const [birthdays, setBirthdays] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [actioningId, setActioningId] = useState(null);
  const [actionRemark, setActionRemark] = useState('');
  const [actionType, setActionType] = useState(null);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [bdayFilter, setBdayFilter] = useState('this_month');
  const [insuranceFilter, setInsuranceFilter] = useState('expiring_soon');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    urgentReminders: 0,
    totalPendingDocs: 0,
    birthdaysToday: 0,
    birthdaysThisWeek: 0,
    birthdaysThisMonth: 0,
    insuranceExpiringSoon: 0,
    pendingReminders: 0
  });
  const navigate = useNavigate();

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const customersRef = ref(database, 'customers');
      const remindersRef = ref(database, 'reminders');
      const birthdatesRef = ref(database, 'birthdates');
      const insurencesRef = ref(database, 'insurences');

      const [customersSnapshot, remindersSnapshot, birthdatesSnapshot, insurencesSnapshot] = await Promise.all([
        get(customersRef),
        get(remindersRef),
        get(birthdatesRef),
        get(insurencesRef)
      ]);

      // Process Customers
      const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {};
      const customerList = [];
      let urgentCount = 0;
      let totalPendingDocs = 0;
      Object.entries(customersData).forEach(([id, data]) => {
        const loanType = data.loanType ||
          data.loan_application?.loan_details?.loan_type ||
          data.loan_type || '';

        const occupation = data.customer_details?.occupation_info || {};
        const basic = data.customer_details?.basic_info || {};
        const employmentType = occupation.type || occupation.occupation_type || basic.occupation_type || '';

        const requiredDocs = getDocumentList(loanType, employmentType) || [];
        const collectedDocsMap = data.loan_application?.documents?.collected_documents || {};

        const pendingRequired = requiredDocs.filter(docName => {
          const key = docName.replace(/[^a-zA-Z0-9]/g, '');
          const isCollected = collectedDocsMap[key] === true || collectedDocsMap[key] === 'true';
          return !isCollected;
        });

        const extraDocs = data.loan_application?.documents?.extra_documents || [];
        const pendingExtra = extraDocs.filter(doc => !doc.collected).map(doc => doc.name);

        const allPendingDocs = [...new Set([...pendingRequired, ...pendingExtra])];

        if (allPendingDocs.length > 0) {
          customerList.push({
            id,
            name: data.customer_details?.basic_info?.full_name || data.fullName || 'Unknown',
            mobile: data.customer_details?.basic_info?.mobile || data.mobile1 || '',
            pendingDocs: allPendingDocs.length,
            documents: allPendingDocs
          });
          totalPendingDocs += allPendingDocs.length;
          if (allPendingDocs.length >= 3) urgentCount++;
        }
      });

      // Process Reminders
      const pendingReminders = [];
      const completedReminders = [];
      const remindersData = remindersSnapshot.exists() ? remindersSnapshot.val() : {};

      Object.entries(remindersData).forEach(([customerId, dateGroups]) => {
        Object.entries(dateGroups).forEach(([date, items]) => {
          Object.entries(items).forEach(([pushId, item]) => {
            const reminder = {
              id: pushId,
              customerId,
              date,
              ...item
            };

            if (item.status === 'completed') {
              completedReminders.push(reminder);
            } else {
              pendingReminders.push(reminder);
            }
          });
        });
      });

      // Sort pending: Oldest date first
      pendingReminders.sort((a, b) => new Date(a.date) - new Date(b.date));
      // Sort completed: Newest date first
      completedReminders.sort((a, b) => new Date(b.date) - new Date(a.date));

      setReminders({ pending: pendingReminders, completed: completedReminders });

      // Process Birthdays
      const birthdayList = [];
      const today = new Date();
      let birthdaysToday = 0;
      let birthdaysThisMonth = 0;
      let birthdaysThisWeek = 0;

      if (birthdatesSnapshot.exists()) {
        const birthdatesData = birthdatesSnapshot.val();

        Object.entries(birthdatesData).forEach(([bdayId, data]) => {
          if (data.birthdate) {
            const bday = new Date(data.birthdate);
            const isToday = today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
            
            
            const thisYearBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
            if (thisYearBirthday < today && !isToday) {
              thisYearBirthday.setFullYear(today.getFullYear() + 1);
            }
            const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
            const isThisWeek = daysUntil >= 0 && daysUntil <= 7;
            const isThisMonth = today.getMonth() === bday.getMonth();

            const customerData = customersData[data.customerId || bdayId];
            const name = data.customerName || customerData?.customer_details?.basic_info?.full_name || customerData?.fullName || 'Unknown';
            const mobile = data.mobile || customerData?.customer_details?.basic_info?.mobile || '';

            birthdayList.push({
              id: data.customerId || bdayId,
              name,
              mobile,
              birthdate: data.birthdate,
              daysUntil,
              isToday,
              isThisWeek,
              isThisMonth,
              age: today.getFullYear() - bday.getFullYear()
            });

            if (isToday) birthdaysToday++;
            if (isThisMonth) birthdaysThisMonth++;
            if (isThisWeek) birthdaysThisWeek++;
          }
        });
        birthdayList.sort((a, b) => a.daysUntil - b.daysUntil);
        setBirthdays(birthdayList);
      }

      // Process Insurance
      const insuranceList = [];
      let insuranceExpiringSoonCount = 0;

      if (insurencesSnapshot.exists()) {
        const insurencesData = insurencesSnapshot.val();
        Object.entries(insurencesData).forEach(([insId, data]) => {
          if (data.endDate) {
            const expiryDate = new Date(data.endDate);
            const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            const isExpired = daysLeft < 0;
            const isExpSoon = daysLeft >= 0 && daysLeft <= 30;

            insuranceList.push({
              id: insId,
              name: data.customerName || 'Unknown',
              mobile: data.mobile || '',
              company: data.insuranceCompany || '',
              vehicleNumber: data.vehicleNumber || '',
              model: data.model || '',
              expiryDate: data.endDate,
              daysLeft,
              isExpired,
              isExpiringSoon: isExpSoon,
              isExpiringThisMonth: isExpSoon
            });

            if (isExpSoon) insuranceExpiringSoonCount++;
          }
        });
        insuranceList.sort((a, b) => a.daysLeft - b.daysLeft);
        setInsurances(insuranceList);
      }

      setStats({
        totalCustomers: customerList.length,
        urgentReminders: urgentCount,
        totalPendingDocs,
        pendingReminders: pendingReminders.length,
        birthdaysToday,
        birthdaysThisWeek,
        birthdaysThisMonth,
        insuranceExpiringSoon: insuranceExpiringSoonCount
      });
    } catch (error) {
      
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleComplete = async (reminder) => {
    try {
      const updatePath = `reminders/${reminder.customerId}/${reminder.date}/${reminder.id}`;
      const now = new Date().toISOString();
      await update(ref(database), {
        [`${updatePath}/status`]: 'completed',
        [`${updatePath}/completedAt`]: now,
        [`${updatePath}/completionRemark`]: actionRemark.trim() || null
      });
      setActioningId(null);
      setActionRemark('');
      loadCustomers();
    } catch (error) {
      
      alert('Failed to complete reminder');
    }
  };

  const handleNextFollowUp = async (reminder) => {
    if (!nextFollowUpDate) {
      alert('Please select a next follow-up date');
      return;
    }
    try {
      const currentPath = `reminders/${reminder.customerId}/${reminder.date}/${reminder.id}`;
      const newPath = `reminders/${reminder.customerId}/${nextFollowUpDate}`;
      await update(ref(database), {
        [`${currentPath}/status`]: 'completed',
        [`${currentPath}/completedAt`]: new Date().toISOString(),
        [`${currentPath}/completionRemark`]: `Followed up. Next date: ${nextFollowUpDate}. ${actionRemark}`
      });
      const timestamp = Date.now();
      await update(ref(database), {
        [`${newPath}/${timestamp}`]: {
          remark: actionRemark.trim() || reminder.remark,
          priority: reminder.priority || 'Low',
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          customerName: reminder.customerName,
          customerMobile: reminder.customerMobile,
          status: 'pending'
        }
      });
      setActioningId(null);
      setActionRemark('');
      setNextFollowUpDate('');
      loadCustomers();
      alert('Next follow-up scheduled and current one completed!');
    } catch (error) {
      
      alert('Failed to schedule next follow-up');
    }
  };

  const toggleReminderStatus = async (reminder) => {
    try {
      const newStatus = reminder.status === 'completed' ? 'pending' : 'completed';
      const updatePath = `reminders/${reminder.customerId}/${reminder.date}/${reminder.id}`;
      await update(ref(database), {
        [`${updatePath}/status`]: newStatus,
        [`${updatePath}/completedAt`]: newStatus === 'completed' ? new Date().toISOString() : null
      });
      loadCustomers();
    } catch (error) {
      
      alert('Failed to update reminder status');
    }
  };

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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <FaBell className="text-white text-lg sm:text-xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Reminders & Notifications
              </h1>
            </div>
            <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Stay updated with pending tasks, document collection, and deadlines
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeTab === 'followup' ? 'ring-4 ring-orange-200 scale-105' : 'opacity-80'}`}
            onClick={() => setActiveTab('followup')}>
            <div className="text-4xl font-bold mb-2">{stats.pendingReminders || 0}</div>
            <div className="text-orange-100 font-medium">Customers Reminders</div>
            <div className="text-orange-200 text-sm mt-1">Pending Follow-ups</div>
          </div>

          {/* Total Pending Documents Card Commented Out */}
          {/* <div
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="text-4xl font-bold mb-2">{stats.totalPendingDocs}</div>
            <div className="text-blue-100 font-medium">Total Pending Documents</div>
          </div> */}

          <div
            className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeTab === 'birthday' ? 'ring-4 ring-purple-200 scale-105' : 'opacity-80'}`}
            onClick={() => setActiveTab('birthday')}
          >
            <div className="text-4xl font-bold mb-2">{stats.birthdaysThisMonth || 0}</div>
            <div className="text-purple-100 font-medium">Birthday Reminders</div>
            <div className="text-purple-200 text-sm mt-1">
              {stats.birthdaysToday > 0 && <div>🎉 {stats.birthdaysToday} today</div>}
              {stats.birthdaysThisWeek > 0 && <div>🗓️ {stats.birthdaysThisWeek} this week</div>}
              {stats.birthdaysThisMonth === 0 && <div>This Month</div>}
            </div>
          </div>
          <div
            className={`bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${activeTab === 'insurance' ? 'ring-4 ring-green-200 scale-105' : 'opacity-80'}`}
            onClick={() => setActiveTab('insurance')}
          >
            <div className="text-4xl font-bold mb-2">{stats.insuranceExpiringSoon || 0}</div>
            <div className="text-green-100 font-medium">Insurance Reminders</div>
            <div className="text-green-200 text-sm mt-1">Expiring Soon (30 days)</div>
          </div>
        </div>

        {/* Conditional Content based on activeTab */}
        {activeTab === 'followup' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
              <h3 className="text-xl font-bold text-gray-800">Customers Reminders List</h3>
              
              {/* Priority Filters */}
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white shadow-inner">
                {['All', 'Low', 'Medium', 'High'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 shadow-sm ${filterPriority === p
                      ? p === 'High' ? 'bg-red-500 text-white scale-105 shadow-red-200'
                        : p === 'Medium' ? 'bg-orange-500 text-white scale-105 shadow-orange-200'
                          : p === 'Low' ? 'bg-green-500 text-white scale-105 shadow-green-200'
                            : 'bg-blue-600 text-white scale-105 shadow-blue-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Column */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2">
                    <FaClock /> To Do / Pending
                  </h3>
                  <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                    {reminders.pending.filter(r => filterPriority === 'All' || r.priority === filterPriority).length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {reminders.pending
                    .filter(r => filterPriority === 'All' || r.priority === filterPriority)
                    .length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No pending reminders!</p>
                    </div>
                  ) : (
                    reminders.pending
                      .filter(r => filterPriority === 'All' || r.priority === filterPriority)
                      .map((reminder) => (
                        <div key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors group">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-800">{reminder.customerName}</h4>
                                  <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${reminder.priority === 'High' ? 'bg-red-100 text-red-600' :
                                    reminder.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                                      'bg-green-100 text-green-600'
                                    }`}>
                                    {reminder.priority || 'Low'}
                                  </span>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${reminder.date < new Date().toISOString().split('T')[0]
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                                  }`}>
                                  {reminder.date}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 font-medium">{reminder.remark}</p>
                              <div className="text-xs text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span>📱 {reminder.customerMobile}</span>
                                  <button
                                    onClick={() => navigate(`/customer/${reminder.customerId}`)}
                                    className="text-blue-500 hover:text-blue-700 underline"
                                  >
                                    View
                                  </button>
                                </div>

                                {actioningId !== reminder.id && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => { setActioningId(reminder.id); setActionType('next'); }}
                                      className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold border border-indigo-100 text-[10px]"
                                    >
                                      Next
                                    </button>
                                    <button
                                      onClick={() => { setActioningId(reminder.id); setActionType('complete'); }}
                                      className="px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold border border-green-100 text-[10px]"
                                    >
                                      Complete
                                    </button>
                                  </div>
                                )}
                              </div>

                              {actioningId === reminder.id && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                  {actionType === 'next' && (
                                    <div className="mb-3">
                                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Next Date</label>
                                      <input
                                        type="date"
                                        value={nextFollowUpDate}
                                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                                        min={new Date().toISOString().split('T')[0]}
                                      />
                                    </div>
                                  )}
                                  <div className="mb-3">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Remark</label>
                                    <textarea
                                      value={actionRemark}
                                      onChange={(e) => setActionRemark(e.target.value)}
                                      placeholder="Notes..."
                                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm min-h-[60px]"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => { setActioningId(null); setActionRemark(''); }} className="px-3 py-1 text-xs text-gray-500">Cancel</button>
                                    <button
                                      onClick={() => actionType === 'next' ? handleNextFollowUp(reminder) : handleComplete(reminder)}
                                      className={`px-4 py-1 text-xs text-white font-bold rounded-lg ${actionType === 'next' ? 'bg-indigo-600' : 'bg-green-600'}`}
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <FaHistory /> Completed History
                  </h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-bold">
                    {reminders.completed.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {reminders.completed.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No completed reminders.</p>
                    </div>
                  ) : (
                    reminders.completed.slice(0, 10).map((reminder) => (
                      <div key={reminder.id} className="p-4 bg-gray-50/50 opacity-75">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <h4 className="font-bold text-gray-700 line-through text-sm">{reminder.customerName}</h4>
                              <span className="text-[10px] text-gray-500">{reminder.date}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-through">{reminder.remark}</p>
                          </div>
                          <button onClick={() => toggleReminderStatus(reminder)} className="text-green-600">
                            <FaCheck size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'birthday' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaBirthdayCake className="text-purple-600" /> Birthday Reminders
              </h3>
              <div className="flex gap-2">
                {['today', 'this_week', 'this_month', 'all'].map((f) => (
                  <button key={f} onClick={() => setBdayFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bdayFilter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    {f.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📱 Send Birthday Wishes to Filtered List
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 divide-y overflow-hidden">
              {birthdays.filter(b => {
                if (bdayFilter === 'today') return b.isToday;
                if (bdayFilter === 'this_week') return b.isThisWeek;
                if (bdayFilter === 'this_month') return b.isThisMonth;
                return true;
              }).length === 0 ? (
                <div className="p-12 text-center text-gray-500">No birthdays found.</div>
              ) : (
                birthdays.filter(b => {
                  if (bdayFilter === 'today') return b.isToday;
                  if (bdayFilter === 'this_week') return b.isThisWeek;
                  if (bdayFilter === 'this_month') return b.isThisMonth;
                  return true;
                }).map(b => (
                  <div key={b.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-800">{b.name}</h4>
                        {b.isToday && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">🎉 TODAY</span>}
                      </div>
                      <div className="text-xs text-gray-500 flex gap-4 mt-1">
                        <span>📱 {b.mobile}</span>
                        <span>🎂 {new Date(b.birthdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>
                        <span>🗓️ In {b.daysUntil} days</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/customer/${b.id}`)} className="text-blue-500 text-xs font-bold hover:underline">View</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaShieldAlt className="text-green-600" /> Insurance Reminders
              </h3>
              <div className="flex gap-2">
                {['expired', 'expiring_soon', 'all'].map((f) => (
                  <button key={f} onClick={() => setInsuranceFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${insuranceFilter === f ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    {f.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              📱 Send Insurance Reminders to Filtered List
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 divide-y overflow-hidden">
              {insurances.filter(i => {
                if (insuranceFilter === 'expired') return i.isExpired;
                if (insuranceFilter === 'expiring_soon') return i.isExpiringSoon && !i.isExpired;
                return true;
              }).length === 0 ? (
                <div className="p-12 text-center text-gray-500">No insurance policies found.</div>
              ) : (
                insurances.filter(i => {
                  if (insuranceFilter === 'expired') return i.isExpired;
                  if (insuranceFilter === 'expiring_soon') return i.isExpiringSoon && !i.isExpired;
                  return true;
                }).map(i => (
                  <div key={i.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-800">{i.name}</h4>
                        {i.isExpired ? (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">⚠️ EXPIRED</span>
                        ) : i.daysLeft <= 7 && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">🔔 {i.daysLeft} DAYS LEFT</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-4 mt-1">
                        <span>📱 {i.mobile}</span>
                        <span>🚗 {i.vehicleNumber}</span>
                        <span>🏢 {i.company}</span>
                        <span>📅 {new Date(i.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/insurance`)} className="text-blue-500 text-xs font-bold hover:underline">Manage</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <WhatsAppReminderTemplate
            customers={
              activeTab === 'birthday' 
                ? birthdays.filter(b => bdayFilter === 'all' || (bdayFilter === 'today' && b.isToday) || (bdayFilter === 'this_week' && b.isThisWeek) || (bdayFilter === 'this_month' && b.isThisMonth))
                : insurances.filter(i => insuranceFilter === 'all' || (insuranceFilter === 'expired' && i.isExpired) || (insuranceFilter === 'expiring_soon' && i.isExpiringSoon && !i.isExpired))
            }
            templateType={activeTab === 'birthday' ? 'birthday' : 'insurance'}
            onClose={() => setShowWhatsAppModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Reminders;
