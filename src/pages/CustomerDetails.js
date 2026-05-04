import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, child, update } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LOAN_TYPE_NAMES, getDocumentList } from '../forms/loanTypes';
import WhatsAppMessage from '../components/WhatsAppMessage';

import {
    FaMobileAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCity,
    FaBriefcase,
    FaHome,
    FaStickyNote,
    FaBullseye,
    FaWhatsapp,
    FaCheckCircle,
    FaExclamationTriangle,
    FaHandHoldingUsd,
    FaDownload,
    FaEdit,
    FaMoneyBillWave,
} from 'react-icons/fa';
import DelayedLoader from '../components/common/DelayedLoader';
import { Toast } from '../components/common';
import html2pdf from 'html2pdf.js';

import CustomerFullDetails from './CustomerFullDetails';

const CustomerDetailsSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 animate-pulse">
        {/* Header/Info Card Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 h-64 mb-6">
            <div className="flex justify-between mb-6">
                <div className="h-10 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                <div className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-6 w-full bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-40 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 bg-gray-200 rounded-xl"></div>
            ))}
        </div>

        {/* Tabs and Content Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 h-96">
            <div className="flex gap-4 mb-8 border-b border-gray-100 pb-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
            <div className="space-y-4">
                <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { employeeData } = useAuth(); // Get employeeData
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [savingCommission, setSavingCommission] = useState(false);
    const [commissionCompanyName, setCommissionCompanyName] = useState('');
    const [commissionLoanAmount, setCommissionLoanAmount] = useState('');
    const [commissionPayoutAmount, setCommissionPayoutAmount] = useState('');
    const [commissionGivenToOther, setCommissionGivenToOther] = useState('');
    const [commissionDate, setCommissionDate] = useState('');
    const [commissionBalanceAmount, setCommissionBalanceAmount] = useState('');
    const [priority, setPriority] = useState('low');

    // Finance Scheme State
    const [showFinanceSchemeModal, setShowFinanceSchemeModal] = useState(false);
    const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);

    const handleDownloadPdf = () => {
        const element = document.getElementById('hidden-pdf-container-content');
        const opt = {
            margin: [0, 0, 0, 0],
            filename: `${customer?.name || 'customer'}_profile.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };
    const [savingFinanceScheme, setSavingFinanceScheme] = useState(false);
    const [financeSchemeData, setFinanceSchemeData] = useState({
        financeCompanyName: '',
        loanAmount: '',
        interestRate: '',
        processingFee: '',
        insurance: '',
        otherCharges: '',
        gst: '',
        totalCharges: '',
        actualDisbursement: '',
        irr: '',
        emiAmount: '',
        tenure: '',
        endDate: ''
    });
    const [toast, setToast] = useState(null); // Global Toast Notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [notification, setNotification] = useState({ type: '', message: '' }); // New Notification State
    const [birthdate, setBirthdate] = useState(null); // Birthdate from birthdates node

    // Validations
    const [dateError, setDateError] = useState('');

    // Helper function to calculate age from birthdate
    const calculateAge = (birthdateStr) => {
        if (!birthdateStr) return '';
        const today = new Date();
        const birthDate = new Date(birthdateStr);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Helper function to format date as dd/mm/yyyy
    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        loadCustomer();
        loadBirthdate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (showCommissionModal) {
            // Get current scroll position
            const scrollY = window.scrollY;

            // Prevent scrolling on both html and body
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            // Cleanup function to restore scrolling when modal closes
            return () => {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [showCommissionModal]);

    // Auto-calculate Balance Amount when Payout or Agent Commission changes
    useEffect(() => {
        if (showCommissionModal) {
            const payout = parseFloat(commissionPayoutAmount) || 0;
            const agentComm = parseFloat(commissionGivenToOther) || 0;
            // Always update balance when inputs change, even if they are 0
            const balance = payout - agentComm;
            setCommissionBalanceAmount(String(balance));
        }
    }, [commissionPayoutAmount, commissionGivenToOther, showCommissionModal]);


    const getCustomerById = async (customerId) => {
        try {
            const dbRef = ref(database);
            const customerSnap = await get(child(dbRef, `customers/${customerId}`));

            if (!customerSnap.exists()) {
                return null;
            }

            const data = customerSnap.val();
            const basic = data.customer_details?.basic_info || {};
            const occupation = data.customer_details?.occupation_info || {};

            let loanDocuments = {};
            let loans = [];

            if (data.primaryLoanId) {
                const loanSnap = await get(child(dbRef, `loans/${data.primaryLoanId}`));
                if (loanSnap.exists()) {
                    const loanData = loanSnap.val();
                    loans = [loanData];

                    // Get documents (they are stored under loans/{loanId}/documents in RTDB structure)
                    const documents = loanData.documents || {};
                    Object.values(documents).forEach(docData => {
                        loanDocuments[docData.type] = {
                            completed: docData.completed || false,
                            completedDate: docData.completedDate ? new Date(docData.completedDate) : null,
                            requestedDate: docData.requestedDate ? new Date(docData.requestedDate) : new Date(),
                            notes: docData.notes || ''
                        };
                    });
                }
            }

            const customerObj = {
                id: data.customerId,
                name: basic.full_name,
                mobile1: basic.mobile,
                mobile2: basic.mobile2,
                email: basic.email,
                city: basic.city_village,
                address: basic.full_address,
                landmark: basic.landmark,
                employmentType: occupation.type || occupation.occupation_type,
                notes: loans[0]?.notes || '',

                loanType: data.loan_application?.loan_details?.loan_type || data.loanType || '',
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
                documents: loanDocuments,
                loans,
                commission: data.commission || null,
                financeScheme: data.financeScheme || loans[0]?.financeScheme || null,
                priority: data.loan_application?.loan_details?.priority || data.priority || 'Low',
                createdBy: data.createdBy || null,
                createdByName: null,

                // Store raw Firebase data for printing and full access
                customer_details: data.customer_details || {},
                loan_application: data.loan_application || {},
                existing_loans: data.existing_loans || {},
                vehicle_info: data.vehicle_info || {},
                vehicle_history: data.vehicle_history || {},
                assets: data.assets || {},
                home_loan_details: data.home_loan_details || {},
                used_commercial_vehicle: data.used_commercial_vehicle || {}
            };

            // Fetch Creator Name if exists
            if (data.createdBy) {
                try {
                    const empSnap = await get(child(dbRef, `employees/${data.createdBy}`));
                    if (empSnap.exists()) {
                        customerObj.createdByName = empSnap.val().name;
                    }
                } catch (err) {
                    
                }
            }

            return customerObj;
        } catch (error) {
            
            return null;
        }
    };

    const loadCustomer = async () => {
        setLoading(true);
        const data = await getCustomerById(id);
        setCustomer(data);
        if (data) {
            setPriority(data.priority || 'low');
        }
        setLoading(false);
    };

    const loadBirthdate = async () => {
        try {
            const dbRef = ref(database, 'birthdates');
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const birthdatesData = snapshot.val();
                // Find birthdate entry for this customer
                const entry = Object.values(birthdatesData).find(
                    data => data.customerId === id
                );
                if (entry) {
                    setBirthdate(entry.birthdate);
                }
            }
        } catch (error) {
            
        }
    };


    const updateDocumentSummariesAsync = async (loanId, customerId) => {
        try {
            const now = new Date();
            const nowIso = now.toISOString();

            const docsRef = ref(database, `loans/${loanId}/documents`);
            const snapshot = await get(docsRef);

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

    const updateDocumentStatus = async (customerId, documentName, status) => {
        try {
            const now = new Date().toISOString();

            // 1. Get Customer to find Primary Loan ID
            const customerRef = ref(database, `customers/${customerId}`);
            const customerSnap = await get(customerRef);

            if (!customerSnap.exists()) return { success: false, error: 'Customer not found' };

            const customerData = customerSnap.val();
            const primaryLoanId = customerData.primaryLoanId;

            if (!primaryLoanId) return { success: false, error: 'No loan found' };

            // 2. Find specific document in Loan's document list
            const documentsRef = ref(database, `loans/${primaryLoanId}/documents`);
            const docsSnap = await get(documentsRef);

            let documentId = null;
            if (docsSnap.exists()) {
                const docs = docsSnap.val();
                // Find key by type == documentName
                const foundEntry = Object.entries(docs).find(([key, val]) => val.type === documentName);
                if (foundEntry) documentId = foundEntry[0];
            }

            // If not found, create new ID
            if (!documentId) {
                documentId = `doc_${Date.now()}`;
            }

            // 3. Update the document path
            const docRef = ref(database, `loans/${primaryLoanId}/documents/${documentId}`);
            await update(docRef, {
                type: documentName, // Ensure type is set if it's new
                completed: status.completed,
                completedDate: status.completed ? now : null,
                requestedDate: status.requestedDate ? new Date(status.requestedDate).toISOString() : now,
                notes: status.notes || ''
            });

            // 4. Update Summaries
            updateDocumentSummariesAsync(primaryLoanId, customerId);

            return { success: true };
        } catch (error) {
            
            return { success: false, error: error.message };
        }
    };

    const handleDocumentToggle = async (docName) => {
        if (!customer) return;

        try {
            // Get current collected documents
            const collectedDocuments = customer.loan_application?.documents?.collected_documents || {};
            const extraDocuments = customer.loan_application?.documents?.extra_documents || [];

            // Toggle the document status
            // docName passed here is already the sanitized key
            const isCollected = !collectedDocuments[docName];
            const newCollectedDocuments = {
                ...collectedDocuments,
                [docName]: isCollected
            };

            // Recalculate pending documents
            const requiredDocs = getDocumentList(customer.loanType, customer.employmentType) || [];

            // 1. Pending Required
            const pendingRequired = requiredDocs.filter(docNameOriginal => {
                const key = docNameOriginal.replace(/[^a-zA-Z0-9]/g, '');
                const isDocCollected = newCollectedDocuments[key] === true || newCollectedDocuments[key] === 'true';
                return !isDocCollected;
            });

            // 2. Pending Extra (Read only from array as they are not toggled here)
            const pendingExtra = extraDocuments.filter(d => !d.collected).map(d => d.name);

            // Combine
            const newPendingDocuments = [...new Set([...pendingRequired, ...pendingExtra])];

            // Update local state immediately for better UX
            setCustomer(prev => ({
                ...prev,
                pending_documents: newPendingDocuments,
                loan_application: {
                    ...prev.loan_application,
                    documents: {
                        ...prev.loan_application?.documents,
                        collected_documents: newCollectedDocuments
                    }
                }
            }));

            // Update in Firebase
            const updates = {};
            updates[`customers/${id}/loan_application/documents/collected_documents/${docName}`] = isCollected;

            // Update the pending_documents array
            updates[`customers/${id}/pending_documents`] = newPendingDocuments;

            updates[`customers/${id}/updated_at`] = new Date().toISOString();

            // Also update quickStats for consistency
            // Total = Required + Extra
            const totalDocsCount = requiredDocs.length + extraDocuments.length;
            // Completed = (Required Completed) + (Extra Completed)
            const completedRequiredCount = requiredDocs.filter(d => {
                const k = d.replace(/[^a-zA-Z0-9]/g, '');
                return newCollectedDocuments[k] === true || newCollectedDocuments[k] === 'true';
            }).length;
            const completedExtraCount = extraDocuments.filter(d => d.collected).length;

            const collectedCount = completedRequiredCount + completedExtraCount;
            const completionPercentage = totalDocsCount > 0 ? Math.round((collectedCount / totalDocsCount) * 100) : 0;

            updates[`customers/${id}/quickStats/totalDocuments`] = totalDocsCount;
            updates[`customers/${id}/quickStats/completedDocuments`] = collectedCount;
            updates[`customers/${id}/quickStats/completionPercentage`] = completionPercentage;

            await update(ref(database), updates);

        } catch (error) {
            
            // Reload customer data on error
            await loadCustomer();
        }
    };

    // Helper function to calculate payout percentage
    const calculatePayoutPercentage = () => {
        const loanAmt = parseFloat(commissionLoanAmount);
        const payoutAmt = parseFloat(commissionPayoutAmount);

        if (loanAmt && payoutAmt && loanAmt > 0) {
            const percentage = (payoutAmt / loanAmt) * 100;
            return percentage.toFixed(2);
        }
        return '';
    };

    const openCommissionModal = () => {
        setCommissionCompanyName(customer?.commission?.companyName || '');
        setCommissionLoanAmount(customer?.commission?.loanAmount != null ? String(customer.commission.loanAmount) : '');
        setCommissionPayoutAmount(customer?.commission?.payoutAmount != null ? String(customer.commission.payoutAmount) : '');
        setCommissionGivenToOther(customer?.commission?.givenToOther || '');
        setCommissionDate(customer?.commission?.date || '');
        setCommissionBalanceAmount(customer?.commission?.balanceAmount != null ? String(customer.commission.balanceAmount) : '');
        setShowCommissionModal(true);
    };

    const closeCommissionModal = () => {
        setShowCommissionModal(false);
        setSavingCommission(false);
    };

    const handleSaveCommission = async () => {
        // Validation: Check required fields
        if (!commissionCompanyName || !commissionCompanyName.trim()) {
            alert('Please enter Company Name');
            return;
        }

        if (!commissionLoanAmount || commissionLoanAmount.trim() === '') {
            alert('Please enter Loan Amount');
            return;
        }

        if (!commissionPayoutAmount || commissionPayoutAmount.trim() === '') {
            alert('Please enter Payout Amount');
            return;
        }

        // Validate that amounts are valid numbers
        if (isNaN(Number(commissionLoanAmount)) || Number(commissionLoanAmount) <= 0) {
            alert('Please enter a valid Loan Amount');
            return;
        }

        if (isNaN(Number(commissionPayoutAmount)) || Number(commissionPayoutAmount) <= 0) {
            alert('Please enter a valid Payout Amount');
            return;
        }

        // Validate balance amount if provided
        if (commissionBalanceAmount && commissionBalanceAmount.trim() !== '') {
            if (isNaN(Number(commissionBalanceAmount)) || Number(commissionBalanceAmount) < 0) {
                alert('Please enter a valid Balance Amount');
                return;
            }
        }

        setSavingCommission(true);
        try {
            const nowIso = new Date().toISOString();
            const payload = {
                companyName: commissionCompanyName || null,
                loanAmount: commissionLoanAmount !== '' ? Number(commissionLoanAmount) : null,
                payoutAmount: commissionPayoutAmount !== '' ? Number(commissionPayoutAmount) : null,
                givenToOther: commissionGivenToOther !== '' ? Number(commissionGivenToOther) : null,
                date: commissionDate || null,
                balanceAmount: commissionBalanceAmount !== '' ? Number(commissionBalanceAmount) : null,
                updatedAt: nowIso
            };

            const updates = {};
            updates[`customers/${id}/commission`] = payload;
            updates[`customers/${id}/updatedAt`] = nowIso;

            // Also attach commission to primary loan if available
            try {
                const dbRef = ref(database);
                const custSnap = await get(child(dbRef, `customers/${id}`));
                if (custSnap.exists()) {
                    const custData = custSnap.val();
                    const primaryLoanId = custData.primaryLoanId;
                    if (primaryLoanId) {
                        updates[`loans/${primaryLoanId}/commission`] = payload;
                        updates[`loans/${primaryLoanId}/updatedAt`] = nowIso;
                    }
                }
            } catch (err) {
                
            }

            await update(ref(database), updates);

            setCustomer(prev => ({ ...prev, commission: payload }));
            setShowCommissionModal(false);
            showToast('Commission/Payout details saved successfully!', 'success');
        } catch (error) {
            
            showToast('Failed to save commission details', 'error');
        } finally {
            setSavingCommission(false);
        }
    };

    const handlePriorityChange = async (newPriority) => {
        try {
            const nowIso = new Date().toISOString();
            const updates = {};
            // Update in the correct nested structure
            updates[`customers/${id}/loan_application/loan_details/priority`] = newPriority;
            updates[`customers/${id}/priority`] = newPriority; // Keep for backward compatibility
            updates[`customers/${id}/updatedAt`] = nowIso;

            await update(ref(database), updates);

            setPriority(newPriority);
            setCustomer(prev => ({ ...prev, priority: newPriority }));
        } catch (error) {
            
            alert('Failed to update priority');
        }
    };

    const openFinanceSchemeModal = () => {
        if (customer?.financeScheme) {
            setFinanceSchemeData({
                financeCompanyName: customer.financeScheme.financeCompanyName || '',
                executiveName: customer.financeScheme.executiveName || '',
                executiveMobile: customer.financeScheme.executiveMobile || '',
                loanAmount: customer.financeScheme.loanAmount || '',
                interestRate: customer.financeScheme.interestRate || '',
                processingFee: customer.financeScheme.processingFee || '',
                insurance: customer.financeScheme.insurance || '',
                otherCharges: customer.financeScheme.otherCharges || '',
                gst: customer.financeScheme.gst || '',
                totalCharges: customer.financeScheme.totalCharges || '',
                actualDisbursement: customer.financeScheme.actualDisbursement || '',
                irr: customer.financeScheme.irr || '',
                emiAmount: customer.financeScheme.emiAmount || '',
                tenure: customer.financeScheme.tenure || '',
                startDate: customer.financeScheme.startDate || '',
                endDate: customer.financeScheme.endDate || ''
            });
        }
        setShowFinanceSchemeModal(true);
    };

    const closeFinanceSchemeModal = () => {
        setShowFinanceSchemeModal(false);
        setSavingFinanceScheme(false);
        setDateError('');
        setNotification({ type: '', message: '' }); // Clear notification on close
    };

    // Helper to calc total annual income safely
    const calculateTotalAnnualIncome = (custData) => {
        if (!custData) return 0;
        const occupation = custData.customer_details?.occupation_info || {};
        const farm = custData.customer_details?.farm_income_info || {};

        let mainIncome = 0;
        if (occupation.type === 'Job' && occupation.employment_details) {
            const gross = parseFloat(occupation.employment_details.gross_salary || 0);
            if (!isNaN(gross)) mainIncome = gross * 12;
        } else if (occupation.type === 'Business' && occupation.employment_details) {
            const annual = parseFloat(occupation.employment_details.yearly_income || 0);
            if (!isNaN(annual)) mainIncome = annual;
        }

        let farmIncome = parseFloat(farm.extra_income_amount || 0);
        if (isNaN(farmIncome)) farmIncome = 0;

        return mainIncome + farmIncome;
    };

    // Calculate once we have customer data
    const totalAnnualIncome = customer ? calculateTotalAnnualIncome(customer) : 0;

    // Calculation Helpers
    const calculateFinanceValues = (data) => {
        let newData = { ...data };

        const P = parseFloat(newData.loanAmount) || 0;
        const rate = parseFloat(newData.interestRate) || 0;
        const n = parseFloat(newData.tenure) || 0;
        const procFee = parseFloat(newData.processingFee) || 0;
        const insurance = parseFloat(newData.insurance) || 0;


        // 1. Total Charges
        const totalCharges = procFee + insurance;
        newData.totalCharges = totalCharges > 0 ? totalCharges.toFixed(2) : '';

        // 2. Actual Disbursement
        const actualDisbursement = P - totalCharges;
        newData.actualDisbursement = P > 0 ? actualDisbursement.toFixed(2) : '';

        // 3. EMI Calculation - Only if rate is present, otherwise keep existing or allow manual
        let emi = 0;
        // If user enters EMI manually, use it. If rate is provided (which is hidden now, so likely 0), recalc.
        // Since we hid Interest Rate, we should NOT auto-calculate EMI based on rate (implied 0).
        // However, if we want to allow manual EMI, we should parse it from current data if avail.

        if (newData.emiAmount) {
            emi = parseFloat(newData.emiAmount);
        }

        // If we were to calculate:
        if (P > 0 && rate > 0 && n > 0) {
            const r = rate / 12 / 100;
            emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            newData.emiAmount = emi.toFixed(2);
        }
        // Else do NOT overwrite emiAmount with '' so user can type it.

        // 4. End Date Calculation
        if (newData.startDate && n > 0) {
            const start = new Date(newData.startDate);
            // Add months
            const end = new Date(start.setMonth(start.getMonth() + n));
            newData.endDate = end.toISOString().split('T')[0];
        }

        // 5. IRR Calculation
        if (actualDisbursement > 0 && emi > 0 && n > 0) {
            const cashFlows = [actualDisbursement]; // Positive inflow (from customer perspective)
            for (let i = 0; i < n; i++) {
                cashFlows.push(-emi); // Negative outflow (EMI payments)
            }

            // Newton-Raphson method to find IRR
            let guess = 0.01; // Initial guess (1% monthly)
            const tolerance = 0.000001;
            const maxIter = 50;

            for (let i = 0; i < maxIter; i++) {
                let npv = 0;
                let dNpv = 0; // Derivative of NPV

                for (let t = 0; t < cashFlows.length; t++) {
                    npv += cashFlows[t] / Math.pow(1 + guess, t);
                    dNpv -= (t * cashFlows[t]) / Math.pow(1 + guess, t + 1);
                }

                const newGuess = guess - npv / dNpv;
                if (Math.abs(newGuess - guess) < tolerance) {
                    guess = newGuess;
                    break;
                }
                guess = newGuess;
            }

            // Convert monthly IRR to annual percentage
            const annualIRR = (Math.pow(1 + guess, 12) - 1) * 100;
            newData.irr = annualIRR.toFixed(2);
        } else {
            newData.irr = '';
        }

        return newData;
    };


    const handleSaveFinanceScheme = async (e) => {
        e.preventDefault();

        // Validation
        if (financeSchemeData.endDate && financeSchemeData.startDate) {
            if (new Date(financeSchemeData.endDate) < new Date(financeSchemeData.startDate)) {
                setDateError('End Date cannot be before Start Date');
                return;
            }
        }

        setSavingFinanceScheme(true);
        try {
            const nowIso = new Date().toISOString();
            // Clean empty strings to null or keep as empty string depending on preference
            const payload = {
                ...financeSchemeData,
                updatedAt: nowIso
            };
            if (!payload.createdAt) {
                payload.createdAt = nowIso;
            }

            // Prepare updates object for atomic update
            const updates = {};

            // Update customer node
            updates[`customers/${id}/financeScheme`] = payload;

            // Also attach to primary loan if available
            try {
                const dbRef = ref(database);
                const custSnap = await get(child(dbRef, `customers/${id}`));

                if (custSnap.exists()) {
                    const custData = custSnap.val();
                    const primaryLoanId = custData.primaryLoanId;

                    if (primaryLoanId) {
                        // Update financeScheme in loan node as well
                        updates[`loans/${primaryLoanId}/financeScheme`] = payload;
                    }
                }
            } catch (err) {
                
                throw err; // Propagate to catch block
            }

            // Perform atomic update to both customer and loan nodes
            await update(ref(database), updates);

            // Update local state with the new payload
            setCustomer(prev => ({ ...prev, financeScheme: payload }));
            setShowFinanceSchemeModal(false);
            showToast('Finance Scheme saved successfully!', 'success');
        } catch (error) {
            
            showToast('Failed to save finance scheme', 'error');
        } finally {
            setSavingFinanceScheme(false);
        }
    };

    const handleSendFinanceSchemeViaWhatsApp = async () => {
        if (!customer.financeScheme) {
            alert('Please save the finance scheme first before sending via WhatsApp');
            return;
        }

        const scheme = customer.financeScheme;
        const customerName = customer.customer_details?.basic_info?.full_name || customer.fullName || 'Customer';
        const mobile = customer.customer_details?.basic_info?.mobile || customer.mobile1 || '';

        if (!mobile) {
            alert('Customer mobile number not found');
            return;
        }

        // Generate finance scheme message
        const message = `🏦 *Finance Scheme Details*

Dear ${customerName},

Here are the details of your finance scheme:

📋 *Scheme Information*
Finance Company: ${scheme.financeCompanyName || 'N/A'}
Loan Amount: ₹${scheme.loanAmount ? parseFloat(scheme.loanAmount).toLocaleString('en-IN') : '0'}
Annual Interest Rate: ${scheme.interestRate || '0'}%
Tenure: ${scheme.tenure || '0'} months
Start Date: ${scheme.startDate || 'N/A'}
End Date: ${scheme.endDate || 'N/A'}

💰 *Charges Breakdown*
Processing Fee: ₹${scheme.processingFee || '0'}
Insurance: ₹${scheme.insurance || '0'}
Other Charges: ₹${scheme.otherCharges || '0'}
GST: ₹${scheme.gst || '0'}

📊 *Calculated Results*
Total Charges: ₹${scheme.totalCharges ? parseFloat(scheme.totalCharges).toLocaleString('en-IN') : '0'}
Actual Disbursement: ₹${scheme.actualDisbursement ? parseFloat(scheme.actualDisbursement).toLocaleString('en-IN') : '0'}
EMI Amount: ₹${scheme.emiAmount ? parseFloat(scheme.emiAmount).toLocaleString('en-IN') : '0'}
IRR: ${scheme.irr || '0'}%

For any queries, please contact us.

Thank you,
Finance Management System
📱 9270 355 171`;

        // Send via WhatsApp API
        try {
            const whatsappAPI = (await import('../services/whatsappAPI')).default;

            // Format phone number and message
            const formattedPhone = whatsappAPI.formatPhoneNumber(mobile);
            const formattedMessage = whatsappAPI.formatMessage(message);

            // Send message via WhatsApp API
            const result = await whatsappAPI.sendMessage(formattedPhone, formattedMessage);

            if (result.success) {
                alert('Finance scheme sent successfully via WhatsApp!');
            } else {
                alert(`Failed to send message: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            
            alert('Failed to send message. Please make sure WhatsApp is connected.');
        }
    };


    const handleFinanceSchemeChange = (field, value) => {

        let newData = { ...financeSchemeData, [field]: value };

        // Date Validation Immediate Feedback
        if (field === 'endDate' && newData.startDate) {
            if (new Date(value) < new Date(newData.startDate)) {
                setDateError('End Date cannot be before Start Date');
            } else {
                setDateError('');
            }
        }
        if (field === 'startDate' && newData.endDate) {
            if (new Date(newData.endDate) < new Date(value)) {
                setDateError('End Date cannot be before Start Date');
            } else {
                setDateError('');
            }
        }


        // Auto-calculate on specific fields
        if (['loanAmount', 'interestRate', 'tenure', 'processingFee', 'insurance', 'otherCharges', 'gst', 'startDate'].includes(field)) {
            // If start date changed, we recalculate end date. If tenure matches constraints, we calc end date etc.
            setFinanceSchemeData(calculateFinanceValues(newData));
        } else {
            setFinanceSchemeData(newData);
        }
    };

    const getDocumentStats = () => {
        // Get loan type and employment type
        const effectiveLoanType = customer?.loanType ||
            customer?.loan_application?.loan_details?.loan_type ||
            customer?.customer_details?.basic_info?.loan_type ||
            '';

        let effectiveEmployment = customer?.employmentType ||
            customer?.occupationType ||
            customer?.customer_details?.occupation_info?.type ||
            customer?.customer_details?.basic_info?.occupation_type ||
            '';

        if (customer?.customer_details?.farm_income_info?.has_farm) {
            effectiveEmployment = 'FARMER';
        }

        // Get required documents list based on loan type
        let requiredDocs = getDocumentList(effectiveLoanType, effectiveEmployment);

        // Fallback if no documents found
        if (requiredDocs.length === 0) {
            requiredDocs = [
                'Aadhar Card',
                'PAN Card',
                'Passport Size Photo',
                'Bank Statement (6 Months)',
                'Income Proof',
                'Address Proof',
                'Signature'
            ];
        }

        // Get collected documents
        const collectedDocuments = customer?.loan_application?.documents?.collected_documents || {};
        const extraDocuments = customer?.loan_application?.documents?.extra_documents || [];

        // Count completed required documents
        const requiredKeys = requiredDocs.map(name => name.replace(/[^a-zA-Z0-9]/g, ''));
        const completedRequiredCount = requiredKeys.filter(key =>
            collectedDocuments[key] === true || collectedDocuments[key] === 'true'
        ).length;

        // Count completed extra documents
        const completedExtraCount = extraDocuments.filter(doc => doc.collected).length;

        // Total documents = required + extra
        const total = requiredDocs.length + extraDocuments.length;
        const completed = completedRequiredCount + completedExtraCount;
        const pending = total - completed;

        return { total, completed, pending };
    };

    const getPendingDays = (doc) => {
        if (doc.completed || !doc.requestedDate) return 0;

        const now = new Date();
        const requestedDate = new Date(doc.requestedDate);
        return Math.floor((now - requestedDate) / (1000 * 60 * 60 * 24));
    };

    if (!customer && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Customer not found</h3>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const stats = getDocumentStats();

    return (
        <DelayedLoader isLoading={loading} fallback={<CustomerDetailsSkeleton />}>
            {customer && (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 animate-fadeIn">
                    <div className="space-y-6">
                        {/* Customer Info Card */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp">
                            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                                {/* Title Row */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {/* Back Button */}
                                    <button
                                        onClick={() => navigate('/customer-list')}
                                        className="p-2 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 rounded-lg transition-all duration-200 group flex-shrink-0 transform hover:scale-110"
                                        title="Back to Customer List"
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent truncate animate-gradient">{customer.name}</h2>
                                </div>

                                {/* Buttons Row - Stack on mobile */}
                                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                                    {/* Finance Scheme Button */}
                                    {(!employeeData || employeeData.role === 'Manager') && (
                                        <button
                                            onClick={openFinanceSchemeModal}
                                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            <FaHandHoldingUsd className="flex-shrink-0" />
                                            <span className="truncate">{customer.financeScheme ? 'Edit Finance Scheme' : 'Add Finance Scheme'}</span>
                                        </button>
                                    )}

                                    {/* Commission Badge */}
                                    {customer.commission && (!employeeData || employeeData.role === 'Manager') && (
                                        <span className="text-xs sm:text-sm px-3 py-2 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 truncate">
                                            {customer.commission.payoutAmount != null
                                                ? `Payout: ₹${customer.commission.payoutAmount}${customer.commission.companyName ? ` from ${customer.commission.companyName}` : ''}`
                                                : 'Commission details available'}
                                        </span>
                                    )}

                                    {/* Add Payout Button */}
                                    {!employeeData && (
                                        <button
                                            onClick={openCommissionModal}
                                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition whitespace-nowrap"
                                        >
                                            {customer.commission ? 'Edit Commission' : 'Add Payout'}
                                        </button>
                                    )}

                                    {/* Edit Customer Button */}
                                    <button
                                        onClick={() => navigate(`/customer/${id}/edit`)}
                                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <FaEdit className="flex-shrink-0" />
                                        <span className="truncate">Edit Customer</span>
                                    </button>

                                    {/* View More Details Button */}
                                    <button
                                        onClick={() => setShowFullDetailsModal(true)}
                                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <FaStickyNote className="flex-shrink-0" />
                                        <span className="truncate">View More Details</span>
                                    </button>

                                    {/* Download PDF Button */}
                                    <button
                                        onClick={handleDownloadPdf}
                                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <FaDownload className="flex-shrink-0" />
                                        <span className="truncate">Download PDF</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                        <FaMobileAlt className="text-primary-500" /> Mobile 1
                                    </span>
                                    <span className="text-gray-800">{customer.mobile1}</span>
                                </div>
                                {customer.mobile2 && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                            <FaMobileAlt className="text-primary-500" /> Mobile 2
                                        </span>
                                        <span className="text-gray-800">{customer.mobile2}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                            <FaEnvelope className="text-primary-500" /> Email
                                        </span>
                                        <span className="text-gray-800">{customer.email}</span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                        <FaCity className="text-primary-500" /> City
                                    </span>
                                    <span className="text-gray-800">{customer.city}</span>
                                </div>
                                {birthdate && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                            🎂 Date of Birth
                                        </span>
                                        <span className="text-gray-800">
                                            {new Date(birthdate).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                            <span className="text-sm text-blue-600 ml-2">
                                                ({calculateAge(birthdate)} years)
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {customer.landmark && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-primary-500" /> Landmark
                                        </span>
                                        <span className="text-gray-800">{customer.landmark}</span>
                                    </div>
                                )}
                                {customer.employmentType && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                            <FaBriefcase className="text-primary-500" /> Employment
                                        </span>
                                        <span className="text-gray-800 capitalize">{customer.employmentType}</span>
                                    </div>
                                )}



                                {/* Total Annual Income Summary Card */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                        <FaMoneyBillWave className="text-emerald-500" /> Annual Income
                                    </span>
                                    <span className="text-emerald-700 font-bold text-lg">
                                        ₹{totalAnnualIncome.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Login Date - Current Date */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                        📅 Login Date
                                    </span>
                                    <span className="text-gray-800">{formatDateToDDMMYYYY(new Date())}</span>
                                </div>

                                {customer.address && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                            <FaHome className="text-primary-500" /> Address
                                        </span>
                                        <span className="text-gray-800">{customer.address}</span>
                                    </div>
                                )}
                            </div>

                            {customer.notes && (
                                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-2">
                                        <FaStickyNote className="text-primary-500" /> Notes
                                    </span>
                                    <p className="text-gray-800">{customer.notes}</p>
                                </div>
                            )}

                            {/* Priority Section */}
                            <div className="mt-6 pt-6 border-t-2 border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                        <FaBullseye className="text-primary-500" /> Priority
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${priority === 'high' ? 'bg-red-500' :
                                            priority === 'medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}></div>
                                        <select
                                            value={priority}
                                            onChange={(e) => handlePriorityChange(e.target.value)}
                                            className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm min-w-[120px] ${priority === 'high' ? 'border-red-300 bg-red-50 text-red-800' :
                                                priority === 'medium' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                                                    'border-green-300 bg-green-50 text-green-800'
                                                }`}
                                        >
                                            <option value="high">High Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="low">Low Priority</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showCommissionModal && (
                            <div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto"
                                onClick={closeCommissionModal}
                            >
                                <div
                                    className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 my-8 max-h-[90vh] overflow-y-auto relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Close Button */}
                                    <button
                                        onClick={closeCommissionModal}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Close"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 pr-8">
                                        📋 {customer.commission ? 'Edit Commission' : 'Add Payout Details'}
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>🏢</span> Company Name
                                            </label>
                                            <input
                                                type="text"
                                                value={commissionCompanyName}
                                                onChange={(e) => setCommissionCompanyName(e.target.value)}
                                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                                placeholder="Finance company name"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>💰</span> Loan Amount (₹)
                                            </label>
                                            <input
                                                type="number" onWheel={(e) => e.target.blur()}
                                                value={commissionLoanAmount}
                                                onChange={(e) => setCommissionLoanAmount(e.target.value)}
                                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                                placeholder="Approved loan amount"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>💵</span> Payout Amount (₹)
                                            </label>
                                            <input
                                                type="number" onWheel={(e) => e.target.blur()}
                                                value={commissionPayoutAmount}
                                                onChange={(e) => setCommissionPayoutAmount(e.target.value)}
                                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                                placeholder="Amount received from company"
                                            />
                                        </div>

                                        {/* Payout Percentage - Auto-calculated */}
                                        {commissionLoanAmount && commissionPayoutAmount && (
                                            <div>
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <span>📊</span> Payout Percentage (%)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={calculatePayoutPercentage() ? `${calculatePayoutPercentage()}%` : ''}
                                                    readOnly
                                                    className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                                                    placeholder="Auto-calculated"
                                                />
                                            </div>
                                        )}


                                        <div>
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>👤</span> Agent Commission (₹)
                                            </label>
                                            <input
                                                type="number" onWheel={(e) => e.target.blur()}
                                                value={commissionGivenToOther}
                                                onChange={(e) => setCommissionGivenToOther(e.target.value)}
                                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                                placeholder="Enter agent commission amount"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>📅</span> Date
                                            </label>
                                            <input
                                                type="date"
                                                value={commissionDate}
                                                onChange={(e) => setCommissionDate(e.target.value)}
                                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                                placeholder="Payout date"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <span>🧾</span> Balance Amount (₹)
                                            </label>
                                            <input
                                                type="number" onWheel={(e) => e.target.blur()}
                                                value={commissionBalanceAmount}
                                                onChange={(e) => setCommissionBalanceAmount(e.target.value)}
                                                className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-bold"
                                                placeholder="Auto-calculated"
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button onClick={closeCommissionModal} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                        <button onClick={handleSaveCommission} disabled={savingCommission} className="px-4 py-2 bg-primary-600 text-white rounded">
                                            {savingCommission ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Finance Scheme Modal */}
                        {showFinanceSchemeModal && (
                            <div
                                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-10"
                            >
                                <div
                                    className="bg-white rounded-2xl p-6 w-full max-w-xl mx-4 my-auto relative"
                                >
                                    <button
                                        onClick={closeFinanceSchemeModal}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                    <h3 className="text-xl font-semibold mb-6 text-gray-800">
                                        {customer.financeScheme ? 'Edit Finance Scheme Details' : 'Add Finance Scheme Details'}
                                    </h3>

                                    {notification.message && (
                                        <div className={`mb-4 p-3 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {notification.message}
                                        </div>
                                    )}

                                    <form onSubmit={handleSaveFinanceScheme} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Company & Loan Basics */}
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Finance Company Name</label>
                                                <input
                                                    type="text"
                                                    value={financeSchemeData.financeCompanyName}
                                                    onChange={(e) => handleFinanceSchemeChange('financeCompanyName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="Enter company name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Executive Name</label>
                                                <input
                                                    type="text"
                                                    value={financeSchemeData.executiveName || ''}
                                                    onChange={(e) => handleFinanceSchemeChange('executiveName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="Enter executive name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Executive Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    value={financeSchemeData.executiveMobile || ''}
                                                    onChange={(e) => handleFinanceSchemeChange('executiveMobile', e.target.value)}
                                                    maxLength="10"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="10-digit mobile number"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                                                <input
                                                    type="number" onWheel={(e) => e.target.blur()}
                                                    value={financeSchemeData.loanAmount}
                                                    onChange={(e) => handleFinanceSchemeChange('loanAmount', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Fee</label>
                                                <input
                                                    type="number" onWheel={(e) => e.target.blur()}
                                                    value={financeSchemeData.processingFee}
                                                    onChange={(e) => handleFinanceSchemeChange('processingFee', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                                                <input
                                                    type="number" onWheel={(e) => e.target.blur()}
                                                    value={financeSchemeData.insurance}
                                                    onChange={(e) => handleFinanceSchemeChange('insurance', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>





                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (Months)</label>
                                                <input
                                                    type="number" onWheel={(e) => e.target.blur()}
                                                    value={financeSchemeData.tenure}
                                                    onChange={(e) => handleFinanceSchemeChange('tenure', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="e.g. 36"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={financeSchemeData.startDate}
                                                    onChange={(e) => handleFinanceSchemeChange('startDate', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={financeSchemeData.endDate}
                                                    onChange={(e) => handleFinanceSchemeChange('endDate', e.target.value)}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${dateError ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-500'}`}
                                                />
                                                {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                                            </div>

                                            {/* Charges Section */}


                                            {/* Calculations Output Section */}
                                            <div className="md:col-span-2 border-t pt-2 mt-2 bg-slate-50 p-4 rounded-xl -mx-2">
                                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Calculated Results</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Charges</label>
                                                        <input
                                                            readOnly
                                                            type="number" onWheel={(e) => e.target.blur()}
                                                            value={financeSchemeData.totalCharges}
                                                            className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-600 cursor-not-allowed"
                                                            placeholder="Processing Fee"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Disbursement</label>
                                                        <input
                                                            readOnly
                                                            type="number" onWheel={(e) => e.target.blur()}
                                                            value={financeSchemeData.actualDisbursement}
                                                            className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-600 font-semibold cursor-not-allowed"
                                                            placeholder="Loan - Charges"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">EMI Amount</label>
                                                        <input
                                                            readOnly={false}
                                                            type="number" onWheel={(e) => e.target.blur()}
                                                            value={financeSchemeData.emiAmount}
                                                            onChange={(e) => handleFinanceSchemeChange('emiAmount', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                            placeholder="Enter EMI Amount"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">ROI (%)</label>
                                                        <input
                                                            type="number" onWheel={(e) => e.target.blur()}
                                                            value={financeSchemeData.irr}
                                                            onChange={(e) => handleFinanceSchemeChange('irr', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                            placeholder="Enter or Calculate IRR"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property Type Section - At Bottom */}
                                        <div className="border-t pt-4 mt-2">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Other Charges</label>
                                                <input
                                                    type="number" onWheel={(e) => e.target.blur()}
                                                    value={financeSchemeData.otherCharges}
                                                    onChange={(e) => handleFinanceSchemeChange('otherCharges', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Method</label>
                                            <div className="flex gap-6">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="propertyType"
                                                        value="Flat"
                                                        checked={financeSchemeData.propertyType === 'Flat'}
                                                        onChange={(e) => handleFinanceSchemeChange('propertyType', e.target.value)}
                                                        className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Flat</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="propertyType"
                                                        value="Residency"
                                                        checked={financeSchemeData.propertyType === 'Residency'}
                                                        onChange={(e) => handleFinanceSchemeChange('propertyType', e.target.value)}
                                                        className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Reducing</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={closeFinanceSchemeModal}
                                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSendFinanceSchemeViaWhatsApp}
                                                disabled={!customer.financeScheme}
                                                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                title={!customer.financeScheme ? "Please save the scheme first" : "Send via WhatsApp"}
                                            >
                                                <FaWhatsapp className="text-lg" />
                                                Send via WhatsApp
                                            </button>
                                            {/* View More Details Button - Removed from here */}
                                            <button
                                                type="submit"
                                                disabled={savingFinanceScheme}
                                                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {savingFinanceScheme ? 'Saving...' : 'Save Details'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Action Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaWhatsapp className="text-green-500" /> WhatsApp Actions
                                </h3>
                                <button
                                    onClick={() => setShowWhatsApp(!showWhatsApp)}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                                >
                                    <FaWhatsapp />
                                    {showWhatsApp ? 'Hide Message' : 'Generate Message'}
                                </button>
                            </div>
                            {showWhatsApp && (
                                <WhatsAppMessage
                                    customer={customer}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Global Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {showFullDetailsModal && customer && (
                <CustomerFullDetails
                    customer={customer}
                    onClose={() => setShowFullDetailsModal(false)}
                    mode="modal"
                />
            )}

            {/* Hidden PDF Container */}
            <div style={{ position: 'absolute', top: -9999, left: -9999, width: '210mm', minHeight: '297mm', visibility: 'hidden' }}>
                {customer && <CustomerFullDetails customer={customer} mode="embed" containerId="hidden-pdf-container-content" />}
            </div>
        </DelayedLoader>
    );
};

export default CustomerDetails;
