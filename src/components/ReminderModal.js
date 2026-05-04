import React, { useState } from 'react';
import { ref, push, serverTimestamp, update } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { PRIORITY_OPTIONS } from '../forms/loanTypes';

const ReminderModal = ({ isOpen, onClose, customer }) => {
    const [date, setDate] = useState('');
    const [remark, setRemark] = useState('');
    const [priority, setPriority] = useState(customer?.priority || 'Low');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();

    // Reset state when customer changes
    React.useEffect(() => {
        if (customer) {
            setPriority(customer.priority || 'Low');
        }
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date || !remark.trim()) {
            alert('Please select a date and enter a remark.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Path: reminders/{customerId}/{date}/{pushId}
            const remindersRef = ref(database, `reminders/${customer.id}/${date}`);

            await push(remindersRef, {
                remark: remark.trim(),
                priority: priority,
                createdAt: serverTimestamp(),
                createdBy: currentUser ? currentUser.uid : 'unknown',
                customerName: customer.name,
                customerMobile: customer.mobile1,
                status: 'pending'
            });

            // Also update customer's priority in their profile
            const dbRef = ref(database);
            const updates = {};
            updates[`customers/${customer.id}/priority`] = priority;
            updates[`customers/${customer.id}/loan_application/loan_details/priority`] = priority;
            updates[`customers/${customer.id}/updatedAt`] = new Date().toISOString();
            
            await update(dbRef, updates);

            alert('Reminder set successfully!');
            onClose();
            setDate('');
            setRemark('');
        } catch (error) {
            
            alert('Failed to set reminder. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span>🔔</span> Set Reminder
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800 font-medium">Customer: <span className="font-bold">{customer.name}</span></p>
                        <p className="text-xs text-blue-600">Mobile: {customer.mobile1}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reminder Date *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all font-medium ${
                                    priority === 'High' ? 'border-red-300 text-red-700 focus:ring-red-500' :
                                    priority === 'Medium' ? 'border-orange-300 text-orange-700 focus:ring-orange-500' :
                                    'border-green-300 text-green-700 focus:ring-green-500'
                                }`}
                            >
                                {PRIORITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remark *
                        </label>
                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter reminder details..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span>💾 Save Reminder</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReminderModal;
