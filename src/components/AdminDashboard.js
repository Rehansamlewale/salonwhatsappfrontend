import { useState, useEffect, useCallback } from 'react';
import { ref, get, update, child } from 'firebase/database';
import { database } from '../firebase';
import { LOAN_TYPE_NAMES, LOAN_TYPES } from '../forms/loanTypes';

import { FaEdit, FaFolderOpen, FaCheckCircle, FaRupeeSign, FaTimesCircle, FaCar, FaHome, FaFileContract, FaUser, FaBriefcase, FaMoneyBillWave, FaTractor, FaBullseye, FaChartLine } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';


const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalLoans: 0,
        totalCustomers: 0,
        totalInsurance: 0,
        totalEmployees: 0,
        mostCasesReferredBy: [],
        recentLoans: [],
        monthlyCommission: {
            totalGet: 0,
            totalGiven: 0
        },
        rejectedCount: 0,
        vehicleSubCounts: { newCar: 0, usedCar: 0, newCommercial: 0, usedCommercial: 0 },
        homeSubCounts: {
            constructionBusiness: 0, constructionSalaried: 0,
            flatPurchaseBusiness: 0, flatPurchaseSalaried: 0,
            btBusiness: 0, btSalaried: 0, commercialPurchase: 0
        },
        lapSubCounts: { lapBusiness: 0, lapGavthan: 0 },
        businessSubCounts: { business: 0, project: 0, machinery: 0 },
        agriSubCounts: { agriculture: 0, animal: 0 },
        financeSchemeCount: 0,
        loanCounts: {
            carLoan: 0,
            commercialLoan: 0,
            homeLoan: 0,
            lapLoan: 0,
            personalLoan: 0,
            businessLoan: 0,
            workingCapitalLoan: 0,
            agricultureLoan: 0
        },
        chartData: {
            statusData: [],
            loanTypeData: [],
            dailyTrendData: []
        },

        totalTarget: 0,
        achievedAmount: 0
    });
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [targetMode, setTargetMode] = useState('monthly'); // 'monthly' | 'yearly'
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'
    const [newTarget, setNewTarget] = useState('');
    const [allCustomers, setAllCustomers] = useState([]);

    // Initialize with Local Date (YYYY-MM-DD) correctly
    const getTodayString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getStartOfMonthString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };

    const [fromDate, setFromDate] = useState(getStartOfMonthString());
    const [toDate, setToDate] = useState(getTodayString());

    const [masterData, setMasterData] = useState({
        customers: [],
        employees: [],
        dealers: [],
        loans: [],
        insurance: [],
        target: 0
    });
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const [activeFilter, setActiveFilter] = useState(null); // 'daily', 'login', 'sanctioned', 'disbursed'
    const [subTypeFilter, setSubTypeFilter] = useState(null); // 'newCar', 'usedCar', 'newCommercial', 'usedCommercial'

    const fetchAllData = useCallback(async () => {
        try {
            const [
                customersData,
                employeesData,
                dealersData,
                loansData,
                insuranceData,
                targetData
            ] = await Promise.all([
                loadCustomersData(),
                loadEmployeesData(),
                loadDealersData(),
                loadLoansData(),
                loadInsuranceData(),
                loadTargetData()
            ]);

            setMasterData({
                customers: customersData,
                employees: employeesData,
                dealers: dealersData,
                loans: loansData,
                insurance: insuranceData,
                target: targetData
            });
            setAllCustomers(customersData);
            setInitialFetchDone(true);
            return {
                customers: customersData,
                employees: employeesData,
                dealers: dealersData,
                loans: loansData,
                insurance: insuranceData,
                target: targetData
            };
        } catch (error) {
            
            return null;
        }
    }, []);

    const loadDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setLoading(true);

        // Use data from masterData if already fetched, or fetch it now
        let currentData = masterData;
        if (!initialFetchDone || isRefresh) {
            const fetched = await fetchAllData();
            if (fetched) currentData = fetched;
        }

        if (!currentData.customers) return;

        try {
            const { customers: customersData, employees: employeesData, dealers: dealersData, loans: loansData, insurance: insuranceData, target: targetData } = currentData;

            // Process the data
            const processedData = processAllData(customersData, employeesData, dealersData, loansData, insuranceData, fromDate, toDate);

            // STRATEGY: Treat DB value as YEARLY TARGET
            const yearlyTarget = Number(targetData) || 1200000;
            const monthlyBase = yearlyTarget / 12;

            const currentYear = new Date().getFullYear();
            const currentMonthIndex = new Date().getMonth();

            let accumulatedCarryover = 0;

            for (let i = 0; i < currentMonthIndex; i++) {
                const monthStart = new Date(currentYear, i, 1);
                const monthEnd = new Date(currentYear, i + 1, 0);
                monthEnd.setHours(23, 59, 59, 999);

                const monthDisbursed = customersData.reduce((sum, c) => {
                    if (c.financeScheme && c.financeScheme.actualDisbursement) {
                        const dDate = c.financeScheme.updatedAt ? new Date(c.financeScheme.updatedAt) : new Date(c.createdAt);
                        if (dDate >= monthStart && dDate <= monthEnd) {
                            return sum + (Number(c.financeScheme.actualDisbursement) || 0);
                        }
                    } else if (c.status?.toLowerCase().includes('disburs') || c.status?.toLowerCase().includes('payout')) {
                        const cDate = new Date(c.createdAt);
                        if (cDate >= monthStart && cDate <= monthEnd) {
                            return sum + (Number(c.loanAmount) || 0);
                        }
                    }
                    return sum;
                }, 0);

                const thisMonthTarget = monthlyBase + accumulatedCarryover;
                const shortfall = Math.max(0, thisMonthTarget - monthDisbursed);
                accumulatedCarryover = shortfall;
            }

            const totalDisbursedYTD = customersData.reduce((sum, c) => {
                const startOfYear = new Date(currentYear, 0, 1);
                const now = new Date();

                if (c.financeScheme && c.financeScheme.actualDisbursement) {
                    const dDate = c.financeScheme.updatedAt ? new Date(c.financeScheme.updatedAt) : new Date(c.createdAt);
                    if (dDate >= startOfYear && dDate <= now) return sum + (Number(c.financeScheme.actualDisbursement) || 0);
                } else if (c.status?.toLowerCase().includes('disburs') || c.status?.toLowerCase().includes('payout')) {
                    const cDate = new Date(c.createdAt);
                    if (cDate >= startOfYear && cDate <= now) return sum + (Number(c.loanAmount) || 0);
                }
                return sum;
            }, 0);

            const currentMonthTarget = monthlyBase + accumulatedCarryover;

            processedData.yearlyTarget = yearlyTarget;
            processedData.monthlyTarget = currentMonthTarget;
            processedData.monthlyBase = monthlyBase;
            processedData.carryover = accumulatedCarryover;
            processedData.yearToDateDisbursed = totalDisbursedYTD;

            setDashboardData(prev => ({
                ...prev,
                ...processedData,
                yearlyTarget,
                monthlyTarget: currentMonthTarget
            }));
        } catch (error) {
            
        } finally {
            if (isRefresh || !initialFetchDone) setLoading(false);
        }
    }, [fromDate, toDate, initialFetchDone, masterData, fetchAllData]);

    useEffect(() => {
        if (!initialFetchDone) {
            loadDashboardData(true);
        } else {
            loadDashboardData(false);
        }
    }, [fromDate, toDate, initialFetchDone, loadDashboardData]); // Re-run when dates change, but without full loading screen after initial load

    const loadCustomersData = async () => {
        try {
            if (!database) return [];

            // Load from Realtime Database instead of Firestore
            const customersRef = ref(database, 'customers');
            const snapshot = await get(customersRef);

            if (!snapshot.exists()) return [];

            const customersData = snapshot.val();
            const customers = Object.keys(customersData).map(customerId => {
                const data = customersData[customerId];
                const basicInfo = data.customer_details?.basic_info || {};

                return {
                    id: data.customerId || customerId,
                    name: basicInfo.full_name || data.fullName || data.name || '',
                    loanType: data.loanType ||
                        data.loan_application?.loan_details?.loan_type ||
                        basicInfo.loan_type ||
                        data.loan_type || '',
                    loanCategory: data.loanCategory ||
                        data.loan_application?.loan_details?.loan_category ||
                        data.loan_category || '',
                    loanSubcategory: data.loanSubcategory ||
                        data.loan_application?.loan_details?.loan_subcategory ||
                        data.loan_subcategory || '',
                    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                    referedBy: basicInfo.refered_by ||
                        basicInfo.referred_by ||
                        basicInfo.referedby ||
                        basicInfo.referredby ||
                        data.referedBy ||
                        data.referredBy ||
                        data.referedby ||
                        data.referredby || '',
                    status: data.status || data.applicationStatus || '',
                    loanAmount: data.loanAmount || 0,
                    branch: data.branch || '',
                    commission: data.commission || null,
                    financeScheme: data.financeScheme || null,
                    remark: data.remark ||
                        data.loan_application?.loan_details?.remark ||
                        data.notes || ''
                };
            });

            return customers;
        } catch (error) {
            
            return [];
        }
    };

    const loadEmployeesData = async () => {
        try {
            if (!database) return [];

            const employeesRef = ref(database, 'employees');
            const snapshot = await get(employeesRef);

            if (!snapshot.exists()) return [];

            const employeesData = snapshot.val();
            const employees = Object.keys(employeesData).map(empId => ({
                id: empId,
                name: employeesData[empId].name || '',
                isActive: employeesData[empId].isActive !== undefined ? employeesData[empId].isActive : true
            }));

            return employees;
        } catch (error) {
            
            return [];
        }
    };

    const loadDealersData = async () => {
        try {
            if (!database) return [];

            const dealersRef = ref(database, 'dealers');
            const snapshot = await get(dealersRef);

            if (!snapshot.exists()) return [];

            const dealersData = snapshot.val();
            const dealers = Object.keys(dealersData).map(dealerId => ({
                id: dealerId,
                name: dealersData[dealerId].dealerName || '',
                commission: dealersData[dealerId].commission || 0,
                isActive: dealersData[dealerId].isActive !== undefined ? dealersData[dealerId].isActive : true
            }));

            return dealers;
        } catch (error) {
            
            return [];
        }
    };

    const loadLoansData = async () => {
        try {
            if (!database) return [];

            const loansRef = ref(database, 'loans');
            const snapshot = await get(loansRef);

            if (!snapshot.exists()) return [];

            const loansData = snapshot.val();
            const loans = Object.keys(loansData).map(loanId => {
                const data = loansData[loanId];
                return {
                    id: loanId,
                    customerId: data.customerId || '',
                    branch: data.branch || '',
                    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                    loanAmount: data.loanAmount || 0,
                    loanType: data.loanType || ''
                };
            });

            return loans;
        } catch (error) {
            
            return [];
        }
    };

    const loadInsuranceData = async () => {
        try {
            if (!database) return [];

            const insuranceRef = ref(database, 'insurences');
            const snapshot = await get(insuranceRef);

            if (!snapshot.exists()) return [];

            const insuranceData = snapshot.val();
            const insurance = Object.keys(insuranceData).map(insId => {
                const data = insuranceData[insId];
                return {
                    id: insId,
                    customerName: data.customerName || '',
                    createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
                };
            });

            return insurance;
        } catch (error) {
            
            return [];
        }
    };
    const loadTargetData = async () => {
        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, 'settings/target'));
            return snapshot.val() || 0;
        } catch (error) {
            
            return 0;
        }
    };

    const handleUpdateTarget = async () => {
        try {
            if (!newTarget) return;
            const updates = {};

            // Store EXACTLY what the user entered (Yearly Target)
            const yearlyValue = Number(newTarget);

            if (yearlyValue < 0) {
                alert('Target cannot be negative');
                return;
            }

            // Saving as yearlyTarget
            updates['customers/targetSettings/yearlyTarget'] = yearlyValue;
            updates['settings/target'] = yearlyValue;

            await update(ref(database), updates);

            // Trigger reload to recalculate everything
            loadDashboardData(true);
            setShowTargetModal(false);
            setNewTarget('');
        } catch (error) {
            
            alert('Failed to update target');
        }
    };




    const processAllData = (customers, employees, dealers, loans, insurance, startDate, endDate) => {
        // Calculate total loans
        const totalLoans = loans.length > 0 ? loans.length : customers.length;

        // Date Logic - ensure rigorous comparison
        const startOfTargetDate = new Date(startDate);
        startOfTargetDate.setHours(0, 0, 0, 0);

        const endOfTargetDate = new Date(endDate);
        endOfTargetDate.setHours(23, 59, 59, 999);

        // Filter customers strictly by createdAt date
        const dateFilteredCustomers = customers.filter(c => {
            if (!c.createdAt) return false;
            const created = new Date(c.createdAt);
            // created is likely UTC if from DB string 'Z', but JS Date compares timestamps correctly
            return created >= startOfTargetDate && created <= endOfTargetDate;
        });

        // 1. Daily Leads: Count of files created on that date
        const dailyLeads = dateFilteredCustomers.length;

        // 2. Login: Active processing (Created on that date, status is processing)
        const loginCount = dateFilteredCustomers.filter(c => {
            const s = (c.status || '').toLowerCase();
            const isNew = s === 'new lead';
            const isSanctioned = s.includes('sanction') || s.includes('approval');
            const isDisbursed = s.includes('disburs') || s.includes('payout');
            const isRejected = s.includes('reject');

            return !isNew && !isSanctioned && !isDisbursed && !isRejected;
        }).length;

        // 3. Sanctioned: Count of Sanctioned (Created on that date)
        const sanctionedCount = dateFilteredCustomers.filter(c =>
            c.status?.toLowerCase().includes('sanction') ||
            c.status?.toLowerCase().includes('approval')
        ).length;

        // 4. Disbursed: Count of Disbursed (Created on that date)
        const disbursedCount = dateFilteredCustomers.filter(c =>
            c.status?.toLowerCase().includes('disburs') ||
            c.status?.toLowerCase().includes('payout')
        ).length;

        // 5. Rejected: Count of Rejected (Created on that date)
        const rejectedCount = dateFilteredCustomers.filter(c =>
            c.status?.toLowerCase().includes('reject')
        ).length;

        // 6. Finance Scheme: Count of Finance Schemes created on that date
        // Use financeScheme.createdAt if available, otherwise fallback to customer.createdAt
        const financeSchemeCount = customers.filter(c => {
            if (!c.financeScheme) return false;
            const schemeCreated = c.financeScheme.createdAt ? new Date(c.financeScheme.createdAt) : new Date(c.createdAt);
            return schemeCreated >= startOfTargetDate && schemeCreated < endOfTargetDate;
        }).length;

        // 7. Calculate Specific Loan Type Counts (Requests)
        const loanCounts = {
            carLoan: 0,
            commercialLoan: 0,
            homeLoan: 0,
            lapLoan: 0,
            personalLoan: 0,
            businessLoan: 0,
            workingCapitalLoan: 0,
            agricultureLoan: 0
        };

        const vehicleSubCounts = {
            newCar: 0,
            usedCar: 0,
            newCommercial: 0,
            usedCommercial: 0
        };

        const homeSubCounts = {
            constructionBusiness: 0,
            constructionSalaried: 0,
            flatPurchaseBusiness: 0,
            flatPurchaseSalaried: 0,
            btBusiness: 0,
            btSalaried: 0,
            commercialPurchase: 0
        };

        const lapSubCounts = {
            lapBusiness: 0,
            lapGavthan: 0
        };

        const businessSubCounts = {
            business: 0,
            project: 0,
            machinery: 0
        };

        const agriSubCounts = {
            agriculture: 0,
            animal: 0
        };

        dateFilteredCustomers.forEach(c => {
            const type = c.loanType; // Use raw value for comparison with LOAN_TYPES
            const subType = c.loanSubcategory; // Check subcategory as well

            // Vehicle Loan (Car + Commercial) - Match Keys OR Display Names in Type OR SubType OR Category
            if (
                c.loanCategory === 'vehicle_loan' ||
                type === LOAN_TYPES.NEW_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_CAR] ||
                subType === LOAN_TYPES.NEW_CAR ||
                type === LOAN_TYPES.USED_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_CAR] ||
                subType === LOAN_TYPES.USED_CAR ||
                type === LOAN_TYPES.RTO_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.RTO_CAR] ||
                subType === LOAN_TYPES.RTO_CAR ||
                type === LOAN_TYPES.NEW_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_COMMERCIAL] ||
                subType === LOAN_TYPES.NEW_COMMERCIAL ||
                type === LOAN_TYPES.USED_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_COMMERCIAL] ||
                subType === LOAN_TYPES.USED_COMMERCIAL ||
                type === LOAN_TYPES.RTO_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.RTO_COMMERCIAL] ||
                subType === LOAN_TYPES.RTO_COMMERCIAL
            ) {
                loanCounts.carLoan++;

                // Subtype Counts
                if (type === LOAN_TYPES.NEW_CAR || subType === LOAN_TYPES.NEW_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_CAR]) {
                    vehicleSubCounts.newCar++;
                } else if (type === LOAN_TYPES.USED_CAR || subType === LOAN_TYPES.USED_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_CAR]) {
                    vehicleSubCounts.usedCar++;
                } else if (type === LOAN_TYPES.NEW_COMMERCIAL || subType === LOAN_TYPES.NEW_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_COMMERCIAL]) {
                    vehicleSubCounts.newCommercial++;
                } else if (type === LOAN_TYPES.USED_COMMERCIAL || subType === LOAN_TYPES.USED_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_COMMERCIAL]) {
                    vehicleSubCounts.usedCommercial++;
                }
            }
            // Commercial Vehicle Loan (New, Used, RTO Commercial)
            else if (
                type === LOAN_TYPES.NEW_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_COMMERCIAL] ||
                subType === LOAN_TYPES.NEW_COMMERCIAL ||
                type === LOAN_TYPES.USED_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_COMMERCIAL] ||
                subType === LOAN_TYPES.USED_COMMERCIAL ||
                type === LOAN_TYPES.RTO_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.RTO_COMMERCIAL] ||
                subType === LOAN_TYPES.RTO_COMMERCIAL
            ) {
                loanCounts.commercialLoan++;
            }
            // Home Loan
            else if (
                type === LOAN_TYPES.HOME_LOAN_CONSTRUCTION_BUSINESS ||
                type === LOAN_TYPES.HOME_LOAN_CONSTRUCTION_SALARIED ||
                type === LOAN_TYPES.FLAT_PURCHASE_SALARIED ||
                type === LOAN_TYPES.FLAT_PURCHASE_BUSINESS ||
                type === LOAN_TYPES.HOME_LOAN_BT_BUSINESS ||
                type === LOAN_TYPES.HOME_LOAN_BT_SALARY ||
                type === LOAN_TYPES.COMMERCIAL_PURCHASE ||
                type === LOAN_TYPES.HOME_LOAN
            ) {
                loanCounts.homeLoan++;

                if (type === LOAN_TYPES.HOME_LOAN_CONSTRUCTION_BUSINESS) homeSubCounts.constructionBusiness++;
                else if (type === LOAN_TYPES.HOME_LOAN_CONSTRUCTION_SALARIED) homeSubCounts.constructionSalaried++;
                else if (type === LOAN_TYPES.FLAT_PURCHASE_BUSINESS) homeSubCounts.flatPurchaseBusiness++;
                else if (type === LOAN_TYPES.FLAT_PURCHASE_SALARIED) homeSubCounts.flatPurchaseSalaried++;
                else if (type === LOAN_TYPES.HOME_LOAN_BT_BUSINESS) homeSubCounts.btBusiness++;
                else if (type === LOAN_TYPES.HOME_LOAN_BT_SALARY) homeSubCounts.btSalaried++;
                else if (type === LOAN_TYPES.COMMERCIAL_PURCHASE) homeSubCounts.commercialPurchase++;
            }
            // LAP / Mortgage
            else if (type === LOAN_TYPES.LAP_BUSINESS || type === LOAN_TYPES.LAP_GAVTHAN) {
                loanCounts.lapLoan++;
                if (type === LOAN_TYPES.LAP_BUSINESS) lapSubCounts.lapBusiness++;
                else if (type === LOAN_TYPES.LAP_GAVTHAN) lapSubCounts.lapGavthan++;
            }
            // Personal Loan
            else if (type === LOAN_TYPES.PERSONAL_LOAN) {
                loanCounts.personalLoan++;
            }
            // Business Loan
            else if (type === LOAN_TYPES.BUSINESS_LOAN || type === LOAN_TYPES.PROJECT_LOAN || type === LOAN_TYPES.MACHINERY_LOAN) {
                loanCounts.businessLoan++;
                if (type === LOAN_TYPES.BUSINESS_LOAN) businessSubCounts.business++;
                else if (type === LOAN_TYPES.PROJECT_LOAN) businessSubCounts.project++;
                else if (type === LOAN_TYPES.MACHINERY_LOAN) businessSubCounts.machinery++;
            }
            // Working Capital
            else if (type === LOAN_TYPES.WORKING_CAPITAL) {
                loanCounts.workingCapitalLoan++;
            }
            // Agriculture Loan
            else if (type === LOAN_TYPES.AGRICULTURE_LOAN || type === LOAN_TYPES.ANIMAL_LOAN) {
                loanCounts.agricultureLoan++;
                if (type === LOAN_TYPES.AGRICULTURE_LOAN) agriSubCounts.agriculture++;
                else if (type === LOAN_TYPES.ANIMAL_LOAN) agriSubCounts.animal++;
            }
        });


        // Keep only real referral data - no fake fallbacks

        // Recent loans (top 5 most recent) - use loans data if available
        let recentLoans = [];
        if (loans.length > 0) {

            // Use loans data and match with customer names
            recentLoans = loans
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((loan, index) => {
                    // Find customer name by matching customerId (ensure string comparison)
                    const customer = customers.find(c => String(c.id) === String(loan.customerId));
                    return {
                        srNo: index + 1,
                        customerName: customer ? customer.name : 'Unknown Customer',
                        loanType: LOAN_TYPE_NAMES[loan.loanType] || loan.loanType || 'Not Specified',
                        createdAt: loan.createdAt,
                        branch: loan.branch || ''
                    };
                });
        } else {
            // ... assigned above
            recentLoans = customers
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((customer, index) => ({
                    srNo: index + 1,
                    customerName: customer.name,
                    loanType: LOAN_TYPE_NAMES[customer.loanType] || customer.loanType || 'Not Specified',
                    createdAt: customer.createdAt,
                    branch: customer.branch || ''
                }));
        }

        // Keep only real loan data - no fake fallbacks

        // Monthly commission calculation based on actual customer commission data
        let totalGet = 0;
        let totalGiven = 0;

        // Calculate from customer commission records
        customers.forEach(customer => {
            if (customer.commission) {
                totalGet += Number(customer.commission.payoutAmount) || 0;
                totalGiven += Number(customer.commission.balanceAmount) || 0;
            }
        });

        let monthlyCommission = {
            totalGet: totalGet,
            totalGiven: totalGiven
        };

        // Keep only real commission data - no fake fallbacks

        // Most cases referred by dealers - count referrals from customers/loans
        const referralCounts = {};
        const dataForReferrals = customers.length > 0 ? customers : loans;


        dataForReferrals.forEach(item => {
            // Check both referedBy and referedby (case inconsistency)
            const referrer = item.referedBy || item.referedby || '';
            if (referrer && referrer.trim()) {
                const referrerName = referrer.trim();
                referralCounts[referrerName] = (referralCounts[referrerName] || 0) + 1;
            }
        });

        // Get top referrers (dealers) with percentages
        const mostCasesReferredBy = Object.entries(referralCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalLoans > 0 ? ((count / totalLoans) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate Revenue by Status
        const sanctionedAmount = dateFilteredCustomers
            .filter(c => c.status?.toLowerCase().includes('sanction') || c.status?.toLowerCase().includes('approval'))
            .reduce((sum, c) => sum + (Number(c.loanAmount) || 0), 0);

        const disbursedAmount = dateFilteredCustomers
            .filter(c => c.status?.toLowerCase().includes('disburs') || c.status?.toLowerCase().includes('payout'))
            .reduce((sum, c) => sum + (Number(c.loanAmount) || 0), 0);

        const processingAmount = dateFilteredCustomers
            .filter(c => {
                const s = (c.status || '').toLowerCase();
                const isNew = s === 'new lead';
                const isSanctioned = s.includes('sanction') || s.includes('approval');
                const isDisbursed = s.includes('disburs') || s.includes('payout');
                const isRejected = s.includes('reject');
                return !isNew && !isSanctioned && !isDisbursed && !isRejected;
            })
            .reduce((sum, c) => sum + (Number(c.loanAmount) || 0), 0);

        // Calculate Monthly Trends (last 6 months)
        const monthlyTrends = (() => {
            const trends = {};
            const now = new Date();

            // Generate last 6 months
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                trends[monthKey] = {
                    month: monthName,
                    applications: 0,
                    sanctioned: 0,
                    disbursed: 0
                };
            }

            // Populate with customer data
            customers.forEach(c => {
                const createdDate = new Date(c.createdAt);
                const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;

                if (trends[monthKey]) {
                    trends[monthKey].applications++;
                    if (c.status?.toLowerCase().includes('sanction') || c.status?.toLowerCase().includes('approval')) {
                        trends[monthKey].sanctioned++;
                    }
                    if (c.status?.toLowerCase().includes('disburs') || c.status?.toLowerCase().includes('payout')) {
                        trends[monthKey].disbursed++;
                    }
                }
            });

            return Object.values(trends);
        })();

        return {
            totalLoans,
            totalInsurance: insurance.length,
            dailyLeads,
            loginCount,
            sanctionedCount,
            disbursedCount,
            rejectedCount,
            mostCasesReferredBy,
            recentLoans,
            monthlyCommission,
            financeSchemeCount,
            loanCounts,
            vehicleSubCounts,
            homeSubCounts,
            lapSubCounts,
            businessSubCounts,
            agriSubCounts,
            chartData: {
                statusData: [
                    { name: 'New Leads', value: dailyLeads, color: '#3B82F6' },
                    { name: 'In Process', value: loginCount, color: '#F59E0B' },
                    { name: 'Sanctioned', value: sanctionedCount, color: '#10B981' },
                    { name: 'Disbursed', value: disbursedCount, color: '#8B5CF6' },
                    { name: 'Rejected', value: rejectedCount, color: '#EF4444' }
                ],
                funnelData: [
                    { name: 'Leads', value: dailyLeads, fill: '#3B82F6' },
                    { name: 'Processing', value: loginCount, fill: '#F59E0B' },
                    { name: 'Sanctioned', value: sanctionedCount, fill: '#10B981' },
                    { name: 'Disbursed', value: disbursedCount, fill: '#8B5CF6' }
                ],
                revenueData: [
                    { name: 'Processing', amount: processingAmount, fill: '#F59E0B' },
                    { name: 'Sanctioned', amount: sanctionedAmount, fill: '#10B981' },
                    { name: 'Disbursed', amount: disbursedAmount, fill: '#8B5CF6' }
                ].filter(item => item.amount > 0),
                monthlyTrends: monthlyTrends,
                loanTypeData: [
                    { name: 'Vehicle', value: loanCounts.carLoan + loanCounts.commercialLoan },
                    { name: 'Home', value: loanCounts.homeLoan },
                    { name: 'LAP', value: loanCounts.lapLoan },
                    { name: 'Personal', value: loanCounts.personalLoan },
                    { name: 'Business', value: loanCounts.businessLoan },
                    { name: 'Other', value: loanCounts.workingCapitalLoan + loanCounts.agricultureLoan }
                ].filter(item => item.value > 0),
                dailyTrendData: (() => {
                    const trendMap = {};
                    const start = new Date(startDate);
                    const end = new Date(endDate);

                    // Normalize times
                    const current = new Date(start);
                    current.setHours(0, 0, 0, 0);
                    const endLimit = new Date(end);
                    endLimit.setHours(23, 59, 59, 999);

                    // Fill all days in range
                    while (current <= endLimit) {
                        const dateStr = current.toLocaleDateString('en-CA'); // YYYY-MM-DD
                        trendMap[dateStr] = {
                            date: dateStr,
                            shortDate: current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                            leads: 0,
                            sanctioned: 0,
                            disbursed: 0
                        };
                        current.setDate(current.getDate() + 1);
                    }

                    // Populate with actual data
                    dateFilteredCustomers.forEach(c => {
                        const dateStr = new Date(c.createdAt).toLocaleDateString('en-CA');
                        if (trendMap[dateStr]) {
                            trendMap[dateStr].leads++;
                            if (c.status?.toLowerCase().includes('sanction') || c.status?.toLowerCase().includes('approval')) trendMap[dateStr].sanctioned++;
                            if (c.status?.toLowerCase().includes('disburs') || c.status?.toLowerCase().includes('payout')) trendMap[dateStr].disbursed++;
                        }
                    });
                    return Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));
                })()
            },

            achievedAmount: (() => {
                let total = 0;
                customers.forEach(c => {
                    // Logic 1: Finance Scheme (Prioritized)
                    if (c.financeScheme && c.financeScheme.actualDisbursement) {
                        const schemeDate = c.financeScheme.updatedAt ? new Date(c.financeScheme.updatedAt) : new Date(c.createdAt);
                        // Normalize schemeDate
                        const checkDate = new Date(schemeDate);

                        if (checkDate >= startOfTargetDate && checkDate <= endOfTargetDate) {
                            total += (Number(c.financeScheme.actualDisbursement) || 0);
                        }
                    }
                    // Logic 2: Standard Disbursed Status (Fallback)
                    else {
                        const status = (c.status || '').toLowerCase();
                        if (status.includes('disburs') || status.includes('payout')) {
                            const created = new Date(c.createdAt);
                            if (created >= startOfTargetDate && created <= endOfTargetDate) {
                                total += (Number(c.loanAmount) || 0);
                            }
                        }
                    }
                });
                return total;
            })(),
            totalTarget: 0
        };
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getFilteredCustomers = () => {
        // Debug Logging
        

        if (!activeFilter) return [];

        // Same filtering logic as dashboard stats
        const startOfTargetDate = new Date(fromDate);
        startOfTargetDate.setHours(0, 0, 0, 0);

        const endOfTargetDate = new Date(toDate);
        endOfTargetDate.setHours(23, 59, 59, 999);

        // Base filter: Created on selected date
        let filtered = allCustomers.filter(c => {
            const created = new Date(c.createdAt);
            const isInDate = created >= startOfTargetDate && created < endOfTargetDate;
            return isInDate;
        });

        

        // Loan Type Filters - Check before status filters
        const loanFilters = ['carLoan', 'commercialLoan', 'homeLoan', 'lapLoan', 'personalLoan', 'businessLoan', 'workingCapitalLoan', 'agricultureLoan'];

        if (loanFilters.includes(activeFilter)) {
            // Filter from allCustomers to show all loans of this type, not just today's
            return allCustomers.filter(c => {
                const type = c.loanType;
                const subType = c.loanSubcategory; // Check subcategory as well

                // Vehicle Loan (Car + Commercial) - Match Keys OR Display Names in Type OR SubType OR Category
                if (activeFilter === 'carLoan') {
                    // Sub-filter Logic
                    if (subTypeFilter) {
                        if (subTypeFilter === 'newCar') return type === LOAN_TYPES.NEW_CAR || subType === LOAN_TYPES.NEW_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_CAR];
                        if (subTypeFilter === 'usedCar') return type === LOAN_TYPES.USED_CAR || subType === LOAN_TYPES.USED_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_CAR];
                        if (subTypeFilter === 'newCommercial') return type === LOAN_TYPES.NEW_COMMERCIAL || subType === LOAN_TYPES.NEW_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_COMMERCIAL];
                        if (subTypeFilter === 'usedCommercial') return type === LOAN_TYPES.USED_COMMERCIAL || subType === LOAN_TYPES.USED_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_COMMERCIAL];
                    }

                    return c.loanCategory === 'vehicle_loan' ||
                        type === LOAN_TYPES.NEW_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_CAR] ||
                        subType === LOAN_TYPES.NEW_CAR ||
                        type === LOAN_TYPES.USED_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_CAR] ||
                        subType === LOAN_TYPES.USED_CAR ||
                        type === LOAN_TYPES.RTO_CAR || type === LOAN_TYPE_NAMES[LOAN_TYPES.RTO_CAR] ||
                        subType === LOAN_TYPES.RTO_CAR ||
                        type === LOAN_TYPES.NEW_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_COMMERCIAL] ||
                        subType === LOAN_TYPES.NEW_COMMERCIAL ||
                        type === LOAN_TYPES.USED_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_COMMERCIAL] ||
                        subType === LOAN_TYPES.USED_COMMERCIAL ||
                        type === LOAN_TYPES.RTO_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.RTO_COMMERCIAL] ||
                        subType === LOAN_TYPES.RTO_COMMERCIAL;
                }

                // Other Loan Types (Keep original separate logic if needed, but Vehicle covers Commercial now)
                if (activeFilter === 'commercialLoan') {
                    return type === LOAN_TYPES.NEW_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.NEW_COMMERCIAL] ||
                        subType === LOAN_TYPES.NEW_COMMERCIAL ||
                        type === LOAN_TYPES.USED_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.USED_COMMERCIAL] ||
                        subType === LOAN_TYPES.USED_COMMERCIAL ||
                        type === LOAN_TYPES.RTO_COMMERCIAL || type === LOAN_TYPE_NAMES[LOAN_TYPES.RTO_COMMERCIAL] ||
                        subType === LOAN_TYPES.RTO_COMMERCIAL;
                }

                // Home Loan
                if (activeFilter === 'homeLoan') {
                    if (subTypeFilter) {
                        const smap = {
                            constructionBusiness: LOAN_TYPES.HOME_LOAN_CONSTRUCTION_BUSINESS,
                            constructionSalaried: LOAN_TYPES.HOME_LOAN_CONSTRUCTION_SALARIED,
                            flatPurchaseBusiness: LOAN_TYPES.FLAT_PURCHASE_BUSINESS,
                            flatPurchaseSalaried: LOAN_TYPES.FLAT_PURCHASE_SALARIED,
                            btBusiness: LOAN_TYPES.HOME_LOAN_BT_BUSINESS,
                            btSalaried: LOAN_TYPES.HOME_LOAN_BT_SALARY,
                            commercialPurchase: LOAN_TYPES.COMMERCIAL_PURCHASE
                        };
                        return type === smap[subTypeFilter]; // Using key match for exactness
                    }
                    return type === LOAN_TYPES.HOME_LOAN_CONSTRUCTION_BUSINESS || type === LOAN_TYPES.HOME_LOAN_CONSTRUCTION_SALARIED || type === LOAN_TYPES.FLAT_PURCHASE_SALARIED || type === LOAN_TYPES.FLAT_PURCHASE_BUSINESS || type === LOAN_TYPES.HOME_LOAN_BT_BUSINESS || type === LOAN_TYPES.HOME_LOAN_BT_SALARY || type === LOAN_TYPES.COMMERCIAL_PURCHASE || type === LOAN_TYPES.HOME_LOAN;
                }

                if (activeFilter === 'lapLoan') {
                    if (subTypeFilter) {
                        if (subTypeFilter === 'lapBusiness') return type === LOAN_TYPES.LAP_BUSINESS;
                        if (subTypeFilter === 'lapGavthan') return type === LOAN_TYPES.LAP_GAVTHAN;
                    }
                    return type === LOAN_TYPES.LAP_BUSINESS || type === LOAN_TYPES.LAP_GAVTHAN;
                }

                if (activeFilter === 'personalLoan') return type === LOAN_TYPES.PERSONAL_LOAN;

                if (activeFilter === 'businessLoan') {
                    if (subTypeFilter) {
                        if (subTypeFilter === 'business') return type === LOAN_TYPES.BUSINESS_LOAN;
                        if (subTypeFilter === 'project') return type === LOAN_TYPES.PROJECT_LOAN;
                        if (subTypeFilter === 'machinery') return type === LOAN_TYPES.MACHINERY_LOAN;
                    }
                    return type === LOAN_TYPES.BUSINESS_LOAN || type === LOAN_TYPES.PROJECT_LOAN || type === LOAN_TYPES.MACHINERY_LOAN;
                }

                if (activeFilter === 'workingCapitalLoan') return type === LOAN_TYPES.WORKING_CAPITAL;

                if (activeFilter === 'agricultureLoan') {
                    if (subTypeFilter) {
                        if (subTypeFilter === 'agriculture') return type === LOAN_TYPES.AGRICULTURE_LOAN;
                        if (subTypeFilter === 'animal') return type === LOAN_TYPES.ANIMAL_LOAN;
                    }
                    return type === LOAN_TYPES.AGRICULTURE_LOAN || type === LOAN_TYPES.ANIMAL_LOAN;
                }
                return false;
            });
        }

        const statusFilters = {
            'daily': () => true, // Already filtered by date
            'login': (status) => {
                const s = status.toLowerCase();
                return s !== 'new lead' && !s.includes('sanction') && !s.includes('approval') && !s.includes('disburs') && !s.includes('payout') && !s.includes('reject');
            },
            'sanctioned': (status) => status.toLowerCase().includes('sanction') || status.toLowerCase().includes('approval'),
            'disbursed': (status) => status.toLowerCase().includes('disburs') || status.toLowerCase().includes('payout'),
            'rejected': (status) => status.toLowerCase().includes('reject'),
            'financeScheme': (c) => {
                // Filter for finance schemes created on selected date range
                if (!c.financeScheme) return false;
                const start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);

                const schemeCreated = c.financeScheme.createdAt ? new Date(c.financeScheme.createdAt) : new Date(c.createdAt);
                return schemeCreated >= start && schemeCreated <= end;
            }
        };

        if (activeFilter !== 'daily') {
            if (activeFilter === 'financeScheme') {
                // Custom filter logic for finance scheme which uses its own date or matches main filter
                filtered = allCustomers.filter(statusFilters['financeScheme']);
            } else {
                filtered = filtered.filter(c => statusFilters[activeFilter]?.(c.status || ''));
            }
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const filteredList = getFilteredCustomers();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none min-h-screen bg-gray-50 p-6 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">New design coming soon...</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-400 text-lg">Dashboard Content Area</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
