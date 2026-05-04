import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LOAN_TYPE_NAMES, ALL_COMBINED_STATUSES, PRIORITY_OPTIONS } from '../forms/loanTypes';
import { FaSearch, FaFileDownload, FaFilter, FaTable, FaColumns, FaCalendarAlt } from 'react-icons/fa';

const Report = () => {
  const { currentUser, employeeData } = useAuth();

  // --- State ---
  const [masterData, setMasterData] = useState([]);
  const [uniqueFinanceCompanies, setUniqueFinanceCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [type, setType] = useState('all');


  const [filterLoanCategory, setFilterLoanCategory] = useState('');
  const [filterContactType, setFilterContactType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

  // Columns
  const allCustomerColumns = [
    'Sr. No.',
    'Customer Name',
    'Mobile Number',
    'Village',
    'Car Type',
    'Vehicle Name',
    'Vehicle Reg.No',
    'MGF Year',
    'Previous Hyp',
    'Loan Amount',
    'Disbursement Amount',
    'EMI',
    'Tenure',
    'Rate',
    'Payout',
    'Key Person Name',
    'Key Person Mobile',
    'Finance Company Name',
    'Executive Name',
    'Executive Mobile',
    'Location',
    'Loan Type',
    'Reference from',
    'Reference Mob.No.',
    'Customer Address',
    'Loan Product',
    'Property Type',
    'Property Address',
    'Occupation',
    'Income Details',
    'Work Experience',
    'Active Loans',
    'Loan Requirement',
    'Status',
    'Remark ( If any)',
    'Customer Note'
  ];
  const [selectedColumns, setSelectedColumns] = useState(allCustomerColumns);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // --- Loan Category Mapping ---
  const loanTypeMapping = useMemo(() => ({
    'Car Loan': ['NEW_CAR', 'USED_CAR', 'new_car', 'used_car', 'RTO_CAR', 'rto_car'],
    'Commercial Vehicle Loan': ['NEW_COMMERCIAL', 'USED_COMMERCIAL', 'new_commercial', 'used_commercial', 'RTO_COMMERCIAL', 'rto_commercial'],
    'Home Loan': ['HOME_LOAN_CONSTRUCTION_BUSINESS', 'HOME_LOAN_CONSTRUCTION_SALARIED', 'home_loan_construction_business', 'home_loan_construction_salaried', 'FLAT_PURCHASE_SALARIED', 'FLAT_PURCHASE_BUSINESS', 'flat_purchase_salaried', 'flat_purchase_business', 'HOME_LOAN_BT_BUSINESS', 'HOME_LOAN_BT_SALARY', 'home_loan_bt_business', 'home_loan_bt_salary'],
    'Loan Against Property (LAP)': ['LAP_BUSINESS', 'LAP_GAVTHAN', 'lap_business', 'lap_gavthan'],
    'Personal Loan': ['PERSONAL_LOAN', 'personal_loan'],
    'Business Loan': ['BUSINESS_LOAN', 'business_loan', 'PROJECT_LOAN', 'project_loan', 'WORKING_CAPITAL', 'working_capital', 'MACHINERY_LOAN', 'machinery_loan'],
    'Balance Transfer / Top-Up': ['BALANCE_TRANSFER', 'balance_transfer'],
    'Agriculture Loan': ['AGRICULTURE_LOAN', 'agriculture_loan', 'ANIMAL_LOAN', 'animal_loan'],
    'Others': ['EDUCATION_LOAN', 'education_loan', 'GOLD_LOAN', 'gold_loan', 'ANNASAHEB_PATIL', 'annasaheb_patil', 'PMEGP', 'pmegp', 'MUDRA', 'mudra', 'OTHER_GOVT', 'other_govt']
  }), []);

  // --- Click Outside to Close Dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Data Fetching (Runs Once) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results = { customers: [], loans: {}, users: {}, contacts: [] };

        // 1. Fetch Users (Executives) and Employees
        const uSnap = await get(ref(database, 'users'));
        if (uSnap.exists()) results.users = uSnap.val();

        const eSnap = await get(ref(database, 'employees'));
        if (eSnap.exists()) results.employees = eSnap.val();

        // 2. Fetch Contacts (Referrers)
        const cSnap = await get(ref(database, 'contacts'));
        let allContacts = [];
        if (cSnap.exists()) {
          const cData = cSnap.val();
          Object.values(cData).forEach(cat => {
            if (typeof cat === 'object') Object.values(cat).forEach(c => allContacts.push(c));
          });
        }
        results.contacts = allContacts;

        // 3. Fetch Loans
        const loansSnap = await get(ref(database, 'loans'));
        if (loansSnap.exists()) {
          results.loans = loansSnap.val();
        }

        // 4. Fetch Customers
        const custSnap = await get(ref(database, 'customers'));
        if (custSnap.exists()) {
          results.customers = custSnap.val();
        }

        // 5. Process and merge all data
        const allRecords = [];
        const processedCustomerIds = new Set();

        // First, process all LOANS (these have the most complete financial data)
        Object.entries(results.loans).forEach(([loanId, loan]) => {
          const customerId = loan.customerId;
          const customer = results.customers[customerId] || {};
          const basic = customer.customer_details?.basic_info || {};
          const vehicle = customer.vehicle_info || customer.customer_details?.vehicle_info || customer.customer_details?.vehicle_details || {};
          const emp = customer.customer_details?.occupation_info?.employment_details || {};

          const creatorId = loan.createdBy || customer.createdBy;
          const creator = results.users[creatorId] || (results.employees && results.employees[creatorId]) || {};

          const referrerName = basic.referred_by || basic.refered_by || '';
          const referrerObj = results.contacts.find(c =>
            (c.name || '').toLowerCase() === referrerName.toLowerCase() ||
            (c.dealerName || '').toLowerCase() === referrerName.toLowerCase()
          );

          const financeScheme = loan.financeScheme || customer.financeScheme || {};
          const commission = loan.commission || customer.commission || {};

          allRecords.push({
            id: loanId,
            source: 'loan',
            raw: { loan, customer },
            'Sr. No.': '', // Will be filled in render
            'Reference from': basic.reference_name || basic.referred_by || basic.refered_by || '',
            'Reference Mob.No.': basic.reference_mobile || basic.referred_by_mobile || (referrerObj ? (referrerObj.mobile1 || referrerObj.mobile) : '') || '',
            'Customer Address': basic.full_address || '',
            'Loan Product': loan.loanSubcategory || loan.loanType || '',
            'Property Type': customer.home_loan_details?.propertyType || customer.home_loan_details?.property_type || '',
            'Property Address': customer.home_loan_details?.propertyAddress || customer.home_loan_details?.property_address || '',
            'Occupation': customer.customer_details?.occupation_info?.type || '',
            'Income Details': emp.net_salary ? `Net Salary: ${emp.net_salary}` : (emp.gross_salary ? `Gross Salary: ${emp.gross_salary}` : (emp.yearly_income ? `Yearly Income: ${emp.yearly_income}` : (emp.yearly_turnover ? `Turnover: ${emp.yearly_turnover}` : (emp.itr_income ? `ITR: ${emp.itr_income}` : (customer.home_loan_details?.monthlyNetSalary ? `Net Salary: ${customer.home_loan_details.monthlyNetSalary}` : (customer.home_loan_details?.annualTurnover1 ? `Turnover: ${customer.home_loan_details.annualTurnover1}` : '')))))),
            'Work Experience': customer.customer_details?.occupation_info?.employment_details?.years_employed || customer.customer_details?.occupation_info?.employment_details?.years_in_business || customer.home_loan_details?.totalWorkExperience || customer.home_loan_details?.businessVintage || '',
            'Active Loans': customer.existing_loans?.active_loans?.map(l => `${l.bankName || l.bank} (${l.loanAmount || l.amount})`).join(', ') || 'None',
            'Loan Requirement': customer.home_loan_details?.requiredLoanAmount || customer.home_loan_details?.loan_amount_needed || vehicle.loan_amount_required || '',
            'Status': customer.applicationStatus || customer.status || loan.status || '',
            'Remark ( If any)': loan.remark || loan.notes || customer.loan_application?.loan_details?.remark || '',
            'Customer Note': [customer.notes, customer.remark, customer.customer_details?.residence_info?.remark].filter(Boolean).join(' | ') || '',

            'Customer Name': basic.full_name || loan.customerName || '',
            'Mobile Number': [basic.mobile, basic.mobile2].filter(Boolean).join(', '),
            'Village': basic.city_village || basic.city || '',
            'Car Type': vehicle.vehicle_type || vehicle.new_vehicle_type || '',
            'Vehicle Name': vehicle.model || vehicle.new_vehicle_model || '',
            'Vehicle Reg.No': vehicle.registration_number || '',
            'MGF Year': vehicle.manufacturing_year || '',
            'Previous Hyp': vehicle.hypothecation_bank_name || vehicle.finance_company || '',
            'Loan Amount': financeScheme.loanAmount || '',
            'Disbursement Amount': financeScheme.actualDisbursement || '',
            'EMI': financeScheme.emiAmount || '',
            'Tenure': financeScheme.tenure || '',
            'Rate': financeScheme.interestRate || financeScheme.irr || '',
            'Payout': commission.payoutAmount || '',
            'Key Person Name': referrerName || '',
            'Key Person Mobile': basic.referred_by_mobile || (referrerObj ? (referrerObj.mobile1 || referrerObj.mobile || '') : '') || '',
            'Finance Company Name': financeScheme.financeCompanyName || commission.companyName || '',
            'Executive Name': financeScheme.executiveName || creator.name || loan.createdName || creator.email || 'Unknown',
            'Executive Mobile': financeScheme.executiveMobile || creator.mobile || '',
            'Location': basic.city_village || basic.city || '',
            'Loan Type': loan.loanType || loan.loanSubcategory || '',
            'Status / Follow-up / Remarks': loan.status || '',
            'Priority': customer.priority || 'Low',

            // Internal for filtering
            createdAt: loan.createdAt || customer.createdAt || 0,
            createdBy: creatorId || null,
            loanTypeRaw: loan.loanType || loan.loanSubcategory || '',
            contactType: referrerObj?.dealerType || ''
          });

          if (customerId) processedCustomerIds.add(customerId);
        });

        // Then, process CUSTOMERS that don't have a loan record yet
        Object.entries(results.customers).forEach(([custId, customer]) => {
          if (processedCustomerIds.has(custId) || processedCustomerIds.has(customer.customerId)) {
            return; // Skip if already processed via loan
          }

          const basic = customer.customer_details?.basic_info || {};
          const vehicle = customer.vehicle_info || customer.customer_details?.vehicle_info || customer.customer_details?.vehicle_details || {};
          const emp = customer.customer_details?.occupation_info?.employment_details || {};
          const activeLoans = customer.current_loans?.active_loans || {};

          const creatorId = customer.createdBy;
          const creator = results.users[creatorId] || (results.employees && results.employees[creatorId]) || {};

          const referrerName = basic.referred_by || basic.refered_by || '';
          const referrerObj = results.contacts.find(c =>
            (c.name || '').toLowerCase() === referrerName.toLowerCase() ||
            (c.dealerName || '').toLowerCase() === referrerName.toLowerCase()
          );

          // Get first active loan if exists
          const firstLoan = Object.values(activeLoans)[0] || {};
          const financeScheme = customer.financeScheme || {};

          allRecords.push({
            id: customer.customerId || custId,
            source: 'customer',
            raw: { customer },
            'Sr. No.': '',
            'Reference from': basic.reference_name || basic.referred_by || basic.refered_by || '',
            'Reference Mob.No.': basic.reference_mobile || basic.referred_by_mobile || (referrerObj ? (referrerObj.mobile1 || referrerObj.mobile) : '') || '',
            'Customer Address': basic.full_address || '',
            'Loan Product': customer.loanSubcategory || customer.loanType || '',
            'Property Type': customer.home_loan_details?.propertyType || customer.home_loan_details?.property_type || '',
            'Property Address': customer.home_loan_details?.propertyAddress || customer.home_loan_details?.property_address || '',
            'Occupation': customer.customer_details?.occupation_info?.type || '',
            'Income Details': emp.net_salary ? `Net Salary: ${emp.net_salary}` : (emp.gross_salary ? `Gross Salary: ${emp.gross_salary}` : (emp.yearly_income ? `Yearly Income: ${emp.yearly_income}` : (emp.yearly_turnover ? `Turnover: ${emp.yearly_turnover}` : (emp.itr_income ? `ITR: ${emp.itr_income}` : (customer.home_loan_details?.monthlyNetSalary ? `Net Salary: ${customer.home_loan_details.monthlyNetSalary}` : (customer.home_loan_details?.annualTurnover1 ? `Turnover: ${customer.home_loan_details.annualTurnover1}` : '')))))),
            'Work Experience': customer.customer_details?.occupation_info?.employment_details?.years_employed || customer.customer_details?.occupation_info?.employment_details?.years_in_business || customer.home_loan_details?.totalWorkExperience || customer.home_loan_details?.businessVintage || '',
            'Active Loans': customer.existing_loans?.active_loans?.map(l => `${l.bankName || l.bank} (${l.loanAmount || l.amount})`).join(', ') || 'None',
            'Loan Requirement': customer.home_loan_details?.requiredLoanAmount || customer.home_loan_details?.loan_amount_needed || vehicle.loan_amount_required || '',
            'Status': customer.applicationStatus || customer.status || '',
            'Remark ( If any)': customer.loan_application?.loan_details?.remark || '',
            'Customer Note': [customer.notes, customer.remark, customer.customer_details?.residence_info?.remark].filter(Boolean).join(' | ') || '',

            'Customer Name': basic.full_name || '',
            'Mobile Number': [basic.mobile, basic.mobile2].filter(Boolean).join(', '),
            'Village': basic.city_village || basic.city || '',
            'Car Type': vehicle.vehicle_type || vehicle.new_vehicle_type || '',
            'Vehicle Name': vehicle.model || vehicle.new_vehicle_model || '',
            'Vehicle Reg.No': vehicle.registration_number || '',
            'MGF Year': vehicle.manufacturing_year || '',
            'Previous Hyp': vehicle.hypothecation_bank_name || vehicle.finance_company || '',
            'Loan Amount': firstLoan.loan_amount || customer.homeLoan?.requiredLoanAmount || customer.vehicle_details?.vehicleLoanAmountRequired || customer.customer_details?.basic_info?.requiredLoanAmount || customer.requiredLoanAmount || '',
            'Disbursement Amount': firstLoan.loan_amount || '',
            'EMI': firstLoan.emi_amount || customer.homeLoan?.expectedEmi || '',
            'Tenure': firstLoan.tenure || customer.homeLoan?.preferredTenure || '',
            'Rate': '',
            'Payout': customer.commission?.payoutAmount || '',
            'Key Person Name': referrerName || '',
            'Key Person Mobile': basic.referred_by_mobile || (referrerObj ? (referrerObj.mobile1 || referrerObj.mobile || '') : '') || '',
            'Finance Company Name': firstLoan.bank_name || '',
            'Executive Name': financeScheme.executiveName || creator.name || creator.email || 'Unknown',
            'Executive Mobile': financeScheme.executiveMobile || creator.mobile || '',
            'Location': basic.city_village || basic.city || '',
            'Loan Type': customer.loanType || customer.loanSubcategory || '',
            'Status / Follow-up / Remarks': customer.applicationStatus || customer.status || '',
            'Priority': customer.priority || 'Low',

            // Internal for filtering
            createdAt: customer.createdAt || customer.updatedAt || 0,
            createdBy: creatorId || null,
            loanTypeRaw: customer.loanType || customer.loanSubcategory || '',
            contactType: referrerObj?.dealerType || ''
          });
        });

        setMasterData(allRecords);

        // Extract unique finance scheme names from loans
        const financeSchemes = new Set();
        Object.values(results.loans).forEach(loan => {
          const schemeName = loan.financeScheme?.financeCompanyName;
          if (schemeName && schemeName.trim()) {
            financeSchemes.add(schemeName.trim());
          }
        });
        setUniqueFinanceCompanies(Array.from(financeSchemes).sort());
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Run once on mount

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    let data = masterData;

    // 1. Filter by Employee Role
    const isEmployee = employeeData && (employeeData.role?.toLowerCase() === 'agent' || employeeData.role?.toLowerCase() === 'employee');
    if (isEmployee) {
      data = data.filter(r => r.createdBy === currentUser.uid);
    }

    // 2. Filter by Search
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(r => Object.values(r).some(val => String(val || '').toLowerCase().includes(q)));
    }

    // 3. Filter by Date
    const fd = fromDate ? Date.parse(fromDate) : -Infinity;
    const td = toDate ? Date.parse(toDate) + 24 * 60 * 60 * 1000 - 1 : Infinity;
    if (fromDate || toDate) {
      data = data.filter(r => {
        const ts = typeof r.createdAt === 'string' ? Date.parse(r.createdAt) : r.createdAt;
        const validTs = isNaN(ts) ? 0 : ts;
        return validTs >= fd && validTs <= td;
      });
    }

    // 4. Filter by Loan Category
    if (filterLoanCategory) {
      const mapping = loanTypeMapping[filterLoanCategory];
      if (mapping) {
        data = data.filter(r => {
          const rType = r.loanTypeRaw;
          return mapping.some(t => rType.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(rType.toLowerCase()));
        });
      }
    }

    // 5. Filter by Contact Type (Reference from)
    if (filterContactType) {
      data = data.filter(r => {
        const contactType = r.contactType || '';
        return contactType === filterContactType;
      });
    }

    // 6. Filter by Status
    if (filterStatus) {
      data = data.filter(r => {
        const status = r['Status / Follow-up / Remarks'] || '';
        return status.toLowerCase() === filterStatus.toLowerCase();
      });
    }

    // 7. Filter by Priority
    if (filterPriority) {
      data = data.filter(r => {
        // We need to check priority in raw data since we removed the column
        const p = r.raw?.customer?.priority || r.raw?.loan?.customer?.priority || 'Low';
        return p.toLowerCase() === filterPriority.toLowerCase();
      });
    }

    return data;
  }, [masterData, search, fromDate, toDate, filterLoanCategory, filterContactType, filterStatus, filterPriority, employeeData, currentUser, loanTypeMapping]);


  // --- Helper Functions ---
  const getOrderedColumns = () => allCustomerColumns.filter(col => selectedColumns.includes(col));
  const toggleColumn = (col) => {
    setSelectedColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert("No data to download");
      return;
    }

    const orderedKeys = getOrderedColumns();
    const csvRows = [];

    // Header
    csvRows.push(orderedKeys.map(k => `"${k.replace(/"/g, '""')}"`).join(','));

    // Rows
    filteredData.forEach((row, idx) => {
      const values = orderedKeys.map(k => {
        let val = row[k];
        if (k === 'Sr. No.') val = idx + 1;
        return `"${String(val || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <FaTable className="text-white text-lg sm:text-xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Financial Reports
              </h1>
            </div>
            <p className="text-gray-600 ml-13 sm:ml-15 flex items-center gap-2 text-sm sm:text-base">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Export and analyze your customer data efficiently
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={filteredData.length === 0}
            className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-xl transition-all duration-300 transform w-full md:w-auto justify-center ${filteredData.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <FaFileDownload className="text-lg sm:text-xl" />
            <span className="text-sm sm:text-base">Export CSV</span>
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-visible relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Search */}
            <div className="relative group">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaSearch className="text-blue-600" />
                Search Records
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-all duration-300 group-focus-within:scale-110" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, Mobile, Vehicle..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Loan Category Filter */}
            <div className="relative">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaFilter className="text-indigo-600" />
                Loan Category
              </label>
              <div className="relative">
                <FaFilter className="absolute left-4 top-4 text-gray-400 pointer-events-none z-10" />
                <select
                  value={filterLoanCategory}
                  onChange={e => setFilterLoanCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">All Categories</option>
                  {Object.keys(loanTypeMapping).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Type Filter */}
            <div className="relative">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaFilter className="text-purple-600" />
                Contact Type
              </label>
              <div className="relative">
                <FaFilter className="absolute left-4 top-4 text-gray-400 pointer-events-none z-10" />
                <select
                  value={filterContactType}
                  onChange={e => setFilterContactType(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">All Contact Types</option>
                  <option value="dealer">Dealer</option>
                  <option value="agent">Agent</option>
                  <option value="banker">Banker</option>
                  <option value="finance_executive">Finance Executive/Banker</option>
                  <option value="customer">Customer</option>
                  <option value="key_person">Key Person</option>
                  <option value="dsa">DSA</option>
                  <option value="bni">BNI</option>
                  <option value="social_media">Social Media</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaFilter className="text-green-600" />
                Status
              </label>
              <div className="relative">
                <FaFilter className="absolute left-4 top-4 text-gray-400 pointer-events-none z-10" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">All Statuses</option>
                  {ALL_COMBINED_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label || status.value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaFilter className="text-orange-600" />
                Priority
              </label>
              <div className="relative">
                <FaFilter className="absolute left-4 top-4 text-gray-400 pointer-events-none z-10" />
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">All Priorities</option>
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range - From */}
            <div className="relative">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-pink-600" />
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Date Range - To */}
            <div className="relative">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-pink-600" />
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full pl-4 pr-4 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </div>

          </div>

          {/* Column Selector */}
          <div className="mt-8 pt-6 border-t-2 border-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 relative z-[100] overflow-visible" ref={dropdownRef}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 font-bold transition-all duration-300 px-4 sm:px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-transparent hover:border-blue-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full sm:w-auto justify-center sm:justify-start"
              >
                <FaColumns className="text-lg" />
                <span className="text-sm sm:text-base">Customize Columns ({selectedColumns.length})</span>
              </button>
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-4 sm:px-5 py-3 rounded-xl border-2 border-blue-200 shadow-md w-full sm:w-auto justify-center">
                <FaTable className="text-blue-600 text-lg animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  {loading ? '⏳ Loading...' : `📊 ${filteredData.length} Records`}
                </span>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className={`
                    absolute left-0 right-0 mt-3 mx-2 sm:mx-0 sm:w-full md:w-[700px] bg-white rounded-2xl shadow-2xl border-2 border-blue-200 z-[9999] p-4 sm:p-7
                    transition-all duration-200 origin-top-left
                    ${showColumnDropdown ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                `}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-4 border-b-2 border-gray-200 gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <FaColumns className="text-white text-sm sm:text-base" />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">Select Fields to Display</h3>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedColumns(allCustomerColumns)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedColumns(['Sr. No.', 'Customer Name', 'Loan Type'])}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-0 max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {allCustomerColumns.map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-3 py-2.5 sm:py-3 px-2 sm:px-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-xs sm:text-sm flex-1 ${selectedColumns.includes(col)
                      ? 'text-blue-700 font-semibold'
                      : 'text-gray-700 font-medium'
                      }`}>
                      {col}
                    </span>
                    {selectedColumns.includes(col) && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex-shrink-0">
                        ✓ Active
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 overflow-hidden flex flex-col h-[650px] hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p>Loading your data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <FaTable className="text-4xl mb-4 opacity-50" />
              <p>No records found matching your filters.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {getOrderedColumns().map(col => (
                      <th key={col} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">

                  {filteredData.map((row, idx) => {
                    // Get status from multiple possible field names
                    const status = (
                      row['Status'] ||
                      row['Status / Follow-up / Remarks'] ||
                      row['Remark ( If any)'] ||
                      ''
                    ).toLowerCase();

                    // Check for rejected or disbursed status
                    const isRejected = status.includes('reject');
                    const isDisbursed = status.includes('disburs');

                    // Determine row background color
                    let rowClassName = 'hover:bg-blue-50/50 transition-colors group';
                    if (isRejected) {
                      rowClassName = 'bg-red-100 hover:bg-red-200 transition-colors group';
                    } else if (isDisbursed) {
                      rowClassName = 'bg-green-100 hover:bg-green-200 transition-colors group';
                    }

                    return (
                      <tr key={idx} className={rowClassName}>
                        {getOrderedColumns().map(col => {
                          let val = row[col];
                          if (col === 'Sr. No.') val = idx + 1;
                          return (
                            <td key={col} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap group-hover:text-gray-900">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Removed row limit warning */}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Report;
