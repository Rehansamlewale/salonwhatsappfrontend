import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, child } from 'firebase/database';
import { database } from '../firebase';
import WhatsAppMessage from '../components/WhatsAppMessage';
import { LOAN_TYPE_NAMES } from '../forms/loanTypes';

const WhatsAppGenerator = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `customers/${id}`));

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const basic = data.customer_details?.basic_info || {};

                    // Fetch documents from primary loan if available
                    let loanDocuments = {};
                    if (data.primaryLoanId) {
                        const loanSnap = await get(child(dbRef, `loans/${data.primaryLoanId}/documents`));
                        if (loanSnap.exists()) {
                            const docs = loanSnap.val();
                            Object.values(docs).forEach(docData => {
                                loanDocuments[docData.type] = {
                                    completed: docData.completed || false,
                                    completedDate: docData.completedDate ? new Date(docData.completedDate) : null,
                                    requestedDate: docData.requestedDate ? new Date(docData.requestedDate) : new Date(),
                                    notes: docData.notes || ''
                                };
                            });
                        }
                    }

                    setCustomer({
                        ...data,
                        id: data.customerId,
                        name: basic.full_name,
                        mobile1: basic.mobile,
                        loanDocuments: loanDocuments
                    });
                } else {
                    
                }
            } catch (error) {
                
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCustomer();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading customer details...</p>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                    <span className="text-4xl block mb-4">⚠️</span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Customer Not Found</h3>
                    <button
                        onClick={() => navigate('/reminders')}
                        className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                        Back to Reminders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-2 sm:p-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
                <span>←</span> Back
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                        📱
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Generate WhatsApp Reminder</h2>
                        <p className="text-gray-500">
                            Create a professional reminder for <span className="font-semibold text-gray-800">{customer.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                    <span className="flex items-center gap-2">
                        <span>💼</span>
                        <span className="font-medium">{LOAN_TYPE_NAMES[customer.loanType] || customer.loanType}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span>📞</span>
                        <span className="font-medium">{customer.mobile1}</span>
                    </span>
                </div>

                <WhatsAppMessage
                    customer={customer}
                    documents={customer.loanDocuments}
                />
            </div>

            {/* Document Checklist Section */}
            <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 mt-6">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Document Checklist</h3>
                    <p className="text-gray-600">Check off documents as they are received</p>
                </div>

                {(() => {
                    const collectedDocs = customer.documents?.collected_documents ||
                        customer.loan_application?.documents?.collected_documents ||
                        {};
                    const docEntries = Object.entries(collectedDocs);

                    if (docEntries.length === 0) {
                        return (
                            <p className="text-gray-500 text-center py-8">No documents found</p>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {docEntries.map(([name, isCollected]) => {
                                const readableName = name.replace(/([A-Z])/g, ' $1').trim();
                                const isTrue = isCollected === true || isCollected === 'true';

                                return (
                                    <div
                                        key={name}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${isTrue
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm ${isTrue
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 text-gray-600'
                                            }`}>
                                            {isTrue ? '✓' : ''}
                                        </div>
                                        <span className={`text-sm font-medium ${isTrue ? 'text-green-900' : 'text-gray-700'
                                            }`}>
                                            {readableName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default WhatsAppGenerator;
