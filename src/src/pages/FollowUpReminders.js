import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import { FaCheck, FaClock, FaHistory, FaArrowLeft, FaBell } from 'react-icons/fa';

const FollowUpReminders = () => {
    const [reminders, setReminders] = useState({ pending: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [filterPriority, setFilterPriority] = useState('All');
    const [actioningId, setActioningId] = useState(null); // ID of reminder being completed/followed up
    const [actionRemark, setActionRemark] = useState('');
    const [actionType, setActionType] = useState(null); // 'complete' or 'next'
    const [nextFollowUpDate, setNextFollowUpDate] = useState('');
    const navigate = useNavigate();

    const loadReminders = useCallback(async () => {
        setLoading(true);
        try {
            const remindersRef = ref(database, 'reminders');
            const snapshot = await get(remindersRef);
            const remindersData = snapshot.exists() ? snapshot.val() : {};

            const pendingReminders = [];
            const completedReminders = [];
            // const today = new Date().toISOString().split('T')[0];

            // Structure: reminders/{customerId}/{date}/{pushId}
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

        } catch (error) {
            
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

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
            loadReminders();
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

            // 1. Mark current as completed with 'Followed Up' status
            await update(ref(database), {
                [`${currentPath}/status`]: 'completed',
                [`${currentPath}/completedAt`]: new Date().toISOString(),
                [`${currentPath}/completionRemark`]: `Followed up. Next date: ${nextFollowUpDate}. ${actionRemark}`
            });

            // 2. Create new reminder
            const remindersRef = ref(database, newPath);
            const { push } = await import('firebase/database');
            const { useAuth } = await import('../contexts/AuthContext');
            
            // Note: Since I can't easily access useAuth here without refactoring, I'll use a simpler push if push is not available
            // but I have access to database and ref.
            const newReminderRef = ref(database, `${newPath}/${Date.now()}`); // Simple unique ID
            await update(ref(database), {
                [`${newPath}/${Date.now()}`]: {
                    remark: actionRemark.trim() || reminder.remark,
                    priority: reminder.priority || 'Low',
                    createdAt: new Date().toISOString(),
                    createdBy: 'system', // Simplification
                    customerName: reminder.customerName,
                    customerMobile: reminder.customerMobile,
                    status: 'pending'
                }
            });

            setActioningId(null);
            setActionRemark('');
            setNextFollowUpDate('');
            loadReminders();
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

            // Optimistic refresh
            loadReminders();
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
                                Follow-up Reminders
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Manage your daily and pending customer follow-ups
                        </p>
                    </div>

                    {/* Priority Filters */}
                    <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white shadow-inner">
                        {['All', 'Low', 'Medium', 'High'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setFilterPriority(p)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm ${filterPriority === p
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
                    {/* Pending / Today Column */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                            <h3 className="font-bold text-blue-800 flex items-center gap-2">
                                <FaClock /> To Do / Pending
                            </h3>
                            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                {reminders.pending.length}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto custom-scrollbar">
                            {reminders.pending
                                .filter(r => filterPriority === 'All' || r.priority === filterPriority)
                                .length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No pending reminders for this priority!</p>
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
                                                            {reminder.priority && (
                                                                <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${reminder.priority === 'High' ? 'bg-red-100 text-red-600' :
                                                                    reminder.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                                                                        'bg-green-100 text-green-600'
                                                                    }`}>
                                                                    {reminder.priority}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${reminder.date < new Date().toISOString().split('T')[0]
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {reminder.date}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2 font-medium">{reminder.remark}</p>
                                                    <div className="text-xs text-gray-400 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span>📱 {reminder.customerMobile}</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/customer/${reminder.customerId}`);
                                                                }}
                                                                className="text-blue-500 hover:text-blue-700 underline"
                                                            >
                                                                View Customer
                                                            </button>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        {actioningId !== reminder.id && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => { setActioningId(reminder.id); setActionType('next'); }}
                                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold transition-all border border-indigo-100"
                                                                >
                                                                    Next Follow-up
                                                                </button>
                                                                <button
                                                                    onClick={() => { setActioningId(reminder.id); setActionType('complete'); }}
                                                                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold transition-all border border-green-100"
                                                                >
                                                                    Complete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Inline Remark Box */}
                                                    {actioningId === reminder.id && (
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 animate-fadeIn">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                    {actionType === 'next' ? 'Schedule Next Follow-up' : 'Complete Follow-up'}
                                                                </h5>
                                                                <button onClick={() => { setActioningId(null); setActionRemark(''); }} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                                                            </div>
                                                            {actionType === 'next' && (
                                                                <div className="mb-3">
                                                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Next Date</label>
                                                                    <input
                                                                        type="date"
                                                                        value={nextFollowUpDate}
                                                                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                                        min={new Date().toISOString().split('T')[0]}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Remark / Log</label>
                                                                <textarea
                                                                    value={actionRemark}
                                                                    onChange={(e) => setActionRemark(e.target.value)}
                                                                    placeholder="What was discussed?"
                                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end gap-2 mt-3">
                                                                <button
                                                                    onClick={() => { setActioningId(null); setActionRemark(''); }}
                                                                    className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => actionType === 'next' ? handleNextFollowUp(reminder) : handleComplete(reminder)}
                                                                    className={`px-6 py-2 text-sm text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all ${actionType === 'next' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}
                                                                >
                                                                    Confirm {actionType === 'next' ? 'Next' : 'Complete'}
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
                        <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto custom-scrollbar">
                            {reminders.completed.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No completed reminders yet.</p>
                                </div>
                            ) : (
                                reminders.completed.map((reminder) => (
                                    <div key={reminder.id} className="p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors opacity-75 hover:opacity-100">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <h4 className="font-bold text-gray-700 line-through">{reminder.customerName}</h4>
                                                    <span className="text-xs text-gray-500">{reminder.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 line-through mb-1">{reminder.remark}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleReminderStatus(reminder)}
                                                className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"
                                                title="Mark Pending"
                                            >
                                                <FaCheck size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FollowUpReminders;
