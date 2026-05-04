import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';


const DocumentChecklist = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Customer Data from navigation state
    const customerData = state?.customerData;
    const customerId = state?.customerId;

    useEffect(() => {
        if (!state || !customerId) {
            navigate('/dashboard');
        }
    }, [state, customerId, navigate]);

    const updateDocumentSummariesAsync = async (loanId, customerId) => {
        try {
            const now = new Date();
            const nowIso = now.toISOString();

            // Prefer nested documents under customer if present, fallback to top-level loans node
            const nestedDocsRef = ref(database, `customers/${customerId}/loans/${loanId}/documents`);
            let snapshot = await get(nestedDocsRef);
            if (!snapshot.exists()) {
                const docsRef = ref(database, `loans/${loanId}/documents`);
                snapshot = await get(docsRef);
            }

            let total = 0;
            let completed = 0;
            let urgent = 0;

            if (snapshot.exists()) {
                const docs = snapshot.val();
                total = Object.keys(docs).length;

                Object.values(docs).forEach(doc => {
                    if (doc.completed) {
                        completed++;
                    } else {
                        const reqDate = doc.requestedDate ? new Date(doc.requestedDate) : now;
                        const daysPending = (now - reqDate) / (1000 * 60 * 60 * 24);
                        if (daysPending >= 3) urgent++;
                    }
                });
            }

            const pending = total - completed;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            const summaryData = {
                totalDocuments: total,
                completedDocuments: completed,
                pendingDocuments: pending,
                completionPercentage: percentage,
                urgentDocuments: urgent,
                lastUpdated: nowIso
            };

            const updates = {};
            // Update Loan Summary
            updates[`loans/${loanId}/documentSummary`] = summaryData;
            updates[`loans/${loanId}/updatedAt`] = nowIso;

            // Update Customer Stats
            updates[`customers/${customerId}/quickStats`] = {
                totalDocuments: total,
                completedDocuments: completed,
                completionPercentage: percentage,
                hasUrgentDocs: urgent > 0,
                lastDocumentUpdate: nowIso
            };
            updates[`customers/${customerId}/updatedAt`] = nowIso;

            await update(ref(database), updates);

        } catch (error) {
            
        }
    };

    const bulkSaveDocuments = async (customerId, documents, documentStatus) => {
        try {
            const now = new Date().toISOString();
            const customerRef = ref(database, `customers/${customerId}`);
            const customerSnap = await get(customerRef);

            if (!customerSnap.exists()) return { success: false, error: 'Customer not found' };
            const primaryLoanId = customerSnap.val().primaryLoanId;
            if (!primaryLoanId) return { success: false, error: 'No loan' };

            const updates = {};

            documents.forEach((docName, index) => {
                const status = documentStatus[docName] || {};
                const docId = `doc_${Date.now()}_${index}`;
                const topPath = `loans/${primaryLoanId}/documents/${docId}`;
                const nestedPath = `customers/${customerId}/loans/${primaryLoanId}/documents/${docId}`;

                const payload = {
                    type: docName,
                    completed: status.completed || false,
                    completedDate: status.completed ? now : null,
                    requestedDate: now,
                    notes: status.notes || ''
                };

                // write to both nested and top-level to keep readers working
                updates[topPath] = payload;
                updates[nestedPath] = payload;
            });

            await update(ref(database), updates);
            // Ensure summaries read from nested first; we pass both ids
            updateDocumentSummariesAsync(primaryLoanId, customerId);

            return { success: true };
        } catch (error) {
            
            return { success: false, error: error.message };
        }
    };

    const handleConfirm = async () => {
        setLoading(true);

        const collectedDocs = customerData.collectedDocuments || {};

        const docsToSave = Object.keys(collectedDocs);
        const statusMap = {};

        docsToSave.forEach(docKey => {
            statusMap[docKey] = {
                completed: collectedDocs[docKey],
                notes: ''
            };
        });

        const result = await bulkSaveDocuments(customerId, docsToSave, statusMap);

        if (result.success) {
            navigate(`/customer/${customerId}`);
        } else {
            
            setLoading(false);
        }
    };

    if (!customerData) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🎉</span>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">Customer Added!</h2>
                <p className="text-gray-600 mb-8">
                    <span className="font-semibold text-gray-800">{customerData.name}</span> has been successfully registered.
                </p>

                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3">Next Steps</h3>
                    <ul className="space-y-3 text-blue-900">
                        <li className="flex items-start gap-3">
                            <span className="mt-1">📄</span>
                            <span>System will verify the initial document checklist.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1">📱</span>
                            <span>You can send a welcome message on WhatsApp with the document list.</span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all active:scale-95 flex justify-center items-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Finalizing...
                        </>
                    ) : 'Continue to Customer Details →'}
                </button>
            </div>
        </div>
    );
};

export default DocumentChecklist;
