// Loan Types Configuration
export const LOAN_TYPES = {
    NEW_CAR: 'new_car',
    USED_CAR: 'used_car',
    NEW_COMMERCIAL: 'new_commercial',
    USED_COMMERCIAL: 'used_commercial',
    BUSINESS_LOAN: 'business_loan',
    PERSONAL_LOAN: 'personal_loan',
    HOME_LOAN_CONSTRUCTION: 'home_loan_construction',
    LAP_BUSINESS: 'lap_business',
    LAP_GAVTHAN: 'lap_gavthan',
    FLAT_PURCHASE: 'flat_purchase',
    HOME_LOAN_BT: 'home_loan_bt',
    BUNGALOW_PURCHASE: 'bungalow_purchase',
    COMMERCIAL_PURCHASE: 'commercial_purchase',
    RTO_COMMERCIAL: 'rto_commercial',
    RTO_CAR: 'rto_car',
    PROJECT_LOAN: 'PROJECT_LOAN',
    WORKING_CAPITAL: 'WORKING_CAPITAL',
    MACHINERY_LOAN: 'MACHINERY_LOAN',
    BALANCE_TRANSFER: 'BALANCE_TRANSFER',
    AGRICULTURE_LOAN: 'AGRICULTURE_LOAN',
    EDUCATION_LOAN: 'EDUCATION_LOAN',
    ANNASAHEB_PATIL: 'ANNASAHEB_PATIL',
    ANIMAL_LOAN: 'ANIMAL_LOAN',
    PMEGP: 'PMEGP',
    MUDRA: 'MUDRA',
    OTHER_GOVT: 'OTHER_GOVT',
    GOLD_LOAN: 'GOLD_LOAN'
};

export const EMPLOYMENT_TYPES = {
    SALARIED: 'salaried',
    SELF_EMPLOYED: 'self_employed',
    FARMER: 'farmer'
};

export const PROPERTY_TYPES = {
    NEW: 'new',
    OLD: 'old'
};

export const LOAN_PURPOSE_OPTIONS = [
    'Purchase',
    'Refinance',
    'BT + Topup'
];

export const FUEL_TYPES = [
    'Petrol',
    'Diesel',
    'Petrol + CNG',
    'Electric',
    'Hybrid'
];

// Loan Type Display Names
export const LOAN_TYPE_NAMES = {
    [LOAN_TYPES.NEW_CAR]: 'New Car Loan',
    [LOAN_TYPES.USED_CAR]: 'Used Car Loan',
    [LOAN_TYPES.NEW_COMMERCIAL]: 'New Commercial Vehicle Loan',
    [LOAN_TYPES.USED_COMMERCIAL]: 'Used Commercial Vehicle Loan',
    [LOAN_TYPES.BUSINESS_LOAN]: 'Business Loan',
    [LOAN_TYPES.PERSONAL_LOAN]: 'Personal Loan',
    [LOAN_TYPES.HOME_LOAN_CONSTRUCTION]: 'Home Loan - Construction',
    [LOAN_TYPES.LAP_BUSINESS]: 'LAP (Business)',
    [LOAN_TYPES.LAP_GAVTHAN]: 'LAP (Gavthan Property)',
    [LOAN_TYPES.FLAT_PURCHASE]: 'Flat Purchase',
    [LOAN_TYPES.HOME_LOAN_BT]: 'Home Loan BT',
    [LOAN_TYPES.BUNGALOW_PURCHASE]: 'Bungalow Purchase',
    [LOAN_TYPES.COMMERCIAL_PURCHASE]: 'Commercial Purchase',
    [LOAN_TYPES.RTO_COMMERCIAL]: 'RTO Work (Commercial Vehicle)',
    [LOAN_TYPES.RTO_CAR]: 'RTO Work (Car Vehicle)',
    [LOAN_TYPES.PROJECT_LOAN]: 'Project Loan',
    [LOAN_TYPES.WORKING_CAPITAL]: 'Working Capital / Cash Credit Loan',
    [LOAN_TYPES.MACHINERY_LOAN]: 'Machinery Loan',
    [LOAN_TYPES.BALANCE_TRANSFER]: 'All Types of Balance Transfer (BT) & Top-Up',
    [LOAN_TYPES.AGRICULTURE_LOAN]: 'Agriculture Loan',
    [LOAN_TYPES.EDUCATION_LOAN]: 'Education Loan',
    [LOAN_TYPES.ANNASAHEB_PATIL]: 'Annasaheb Patil Loan',
    [LOAN_TYPES.ANIMAL_LOAN]: 'Animal Loan',
    [LOAN_TYPES.PMEGP]: 'PMEGP Loan',
    [LOAN_TYPES.MUDRA]: 'Mudra Loan',
    [LOAN_TYPES.OTHER_GOVT]: 'Other Government Loans',
    [LOAN_TYPES.GOLD_LOAN]: 'Gold Loan'
};

// Loan Categories (Main Categories)
export const LOAN_CATEGORIES = {
    VEHICLE_LOAN: 'vehicle_loan',
    HOME_LOAN: 'home_loan',
    LAP: 'lap',
    BUSINESS_FINANCE: 'business_finance',
    PERSONAL_LOAN: 'personal_loan',
    BUSINESS_LOAN: 'business_loan',
    AGRICULTURE_LOAN: 'agriculture_loan',
    EDUCATION_LOAN: 'education_loan',
    GOVERNMENT_SCHEME: 'government_scheme',
    GOLD_LOAN: 'gold_loan'
};

// Category Display Names
export const LOAN_CATEGORY_NAMES = {
    [LOAN_CATEGORIES.VEHICLE_LOAN]: '1️⃣ Vehicle Loan',
    [LOAN_CATEGORIES.HOME_LOAN]: '2️⃣ Home Loan',
    [LOAN_CATEGORIES.LAP]: '3️⃣ Loan Against Property (LAP)',
    [LOAN_CATEGORIES.BUSINESS_FINANCE]: '4️⃣ Business Finance',
    [LOAN_CATEGORIES.PERSONAL_LOAN]: '5️⃣ Personal Loan',
    [LOAN_CATEGORIES.BUSINESS_LOAN]: '6️⃣ Business Loan',
    [LOAN_CATEGORIES.AGRICULTURE_LOAN]: '7️⃣ Agriculture Loan',
    [LOAN_CATEGORIES.EDUCATION_LOAN]: '8️⃣ Education Loan',
    [LOAN_CATEGORIES.GOVERNMENT_SCHEME]: '9️⃣ Government Scheme Loan',
    [LOAN_CATEGORIES.GOLD_LOAN]: '🔟 Gold Loan'
};

// Subcategories mapped to each category
export const LOAN_SUBCATEGORIES = {
    [LOAN_CATEGORIES.VEHICLE_LOAN]: {
        [LOAN_TYPES.NEW_CAR]: 'New Car Loan',
        [LOAN_TYPES.USED_CAR]: 'Used Car Loan',
        [LOAN_TYPES.NEW_COMMERCIAL]: 'New Commercial Vehicle Loan',
        [LOAN_TYPES.USED_COMMERCIAL]: 'Used Commercial Vehicle Loan'
    },
    [LOAN_CATEGORIES.HOME_LOAN]: {
        [LOAN_TYPES.HOME_LOAN_CONSTRUCTION]: 'Home Loan - Construction',
        [LOAN_TYPES.FLAT_PURCHASE]: 'Flat Purchase',
        [LOAN_TYPES.HOME_LOAN_BT]: 'Home Loan BT',
        [LOAN_TYPES.BUNGALOW_PURCHASE]: 'Bungalow Purchase'
    },
    [LOAN_CATEGORIES.LAP]: {
        [LOAN_TYPES.LAP_BUSINESS]: 'LAP (City Survey)',
        [LOAN_TYPES.LAP_GAVTHAN]: 'LAP (Gavthan Property)'
    },
    [LOAN_CATEGORIES.BUSINESS_FINANCE]: {
        [LOAN_TYPES.PROJECT_LOAN]: 'Project Loan',
        [LOAN_TYPES.WORKING_CAPITAL]: 'Working Capital / Cash Credit Loan',
        [LOAN_TYPES.MACHINERY_LOAN]: 'Machinery Loan',
        [LOAN_TYPES.BALANCE_TRANSFER]: 'All Types of Balance Transfer (BT) & Top-Up'
    },
    [LOAN_CATEGORIES.PERSONAL_LOAN]: {
        [LOAN_TYPES.PERSONAL_LOAN]: 'Personal Loan'
    },
    [LOAN_CATEGORIES.BUSINESS_LOAN]: {
        [LOAN_TYPES.BUSINESS_LOAN]: 'Business Loan'
    },
    [LOAN_CATEGORIES.AGRICULTURE_LOAN]: {
        [LOAN_TYPES.AGRICULTURE_LOAN]: 'Agriculture Loan'
    },
    [LOAN_CATEGORIES.EDUCATION_LOAN]: {
        [LOAN_TYPES.EDUCATION_LOAN]: 'Education Loan'
    },
    [LOAN_CATEGORIES.GOVERNMENT_SCHEME]: {
        [LOAN_TYPES.ANNASAHEB_PATIL]: 'Annasaheb Patil Loan',
        [LOAN_TYPES.ANIMAL_LOAN]: 'Animal Loan',
        [LOAN_TYPES.PMEGP]: 'PMEGP Loan',
        [LOAN_TYPES.MUDRA]: 'Mudra Loan',
        [LOAN_TYPES.OTHER_GOVT]: 'Other Government Loans'
    },
    [LOAN_CATEGORIES.GOLD_LOAN]: {
        [LOAN_TYPES.GOLD_LOAN]: 'Gold Loan'
    }
};

// Document Lists for Different Loan Types
export const DOCUMENT_LISTS = {
    // New Car Loan - Self-Employed
    NEW_CAR_SELF_EMPLOYED: [
        'PAN Card',
        'Aadhaar Card',
        '1 Passport-size Photo',
        '6 Months Bank Statement',
        '2 Years ITR (Income Tax Returns)',
        'Shop Act / Udyam / Business Proof',
        'GST Certificate (if applicable)',
        'Address Proof (Electricity Bill / Rent Agreement)',
        '5 Cheques',
        'Quotation Report'
    ],

    // New Car Loan - Salaried
    NEW_CAR_SALARIED: [
        'PAN Card',
        'Aadhaar Card',
        '1 Passport-size Photo',
        '6 Months Bank Statement',
        'Electricity Bill (Address Proof)',
        '5 Cheques',
        'Last 3 Months Salary Slips',
        'Form 16',
        'Quotation Report'
    ],

    // New Car Loan - Farmer
    NEW_CAR_FARMER: [
        'PAN Card',
        'Aadhaar Card',
        '1 Passport-size Photo',
        '6 Months Bank Statement',
        'Electricity Bill (Address Proof)',
        '5 Cheques',
        '7/12 उतारा',
        '8A उतारा',
        'Quotation Report'
    ],

    // Used Car Loan - Self-Employed
    USED_CAR_SELF_EMPLOYED: [
        'PAN Card',
        'Aadhaar Card',
        '1 Passport-size Photo',
        '6 Months Bank Statement',
        '2 Years ITR (Income Tax Returns)',
        'Shop Act / Udyam / Business Proof',
        'GST Certificate (if applicable)',
        'Address Proof (Electricity Bill / Rent Agreement)',
        '5 Cheques',
        'RC Book',
        'Full Insurance',
        'Valuation Report'
    ],

    // Used Car Loan - Salaried
    USED_CAR_SALARIED: [
        'PAN Card',
        'Aadhaar Card',
        '1 Passport-size Photo',
        '6 Months Bank Statement',
        'Electricity Bill (Address Proof)',
        '5 Cheques',
        'Last 3 Months Salary Slips',
        'Form 16',
        'RC Book',
        'Full Insurance',
        'Valuation Report'
    ],

    // Used Car Loan - Farmer
    USED_CAR_FARMER: [
        'PAN Card',
        'Aadhaar Card',
        '1 Passport-size Photo',
        '6 Months Bank Statement',
        'Electricity Bill (Address Proof)',
        '5 Cheques',
        '7/12 उतारा',
        '8A उतारा',
        'RC Book',
        'Full Insurance',
        'Valuation Report'
    ],

    // New Commercial Vehicle Loan
    NEW_COMMERCIAL: [
        'Aadhaar Card',
        'PAN Card',
        'Driving Licence (as per vehicle category)',
        'Electricity Bill (Address Proof)',
        'Bank Passbook / 6 Months Bank Statement',
        '5 Cheques',
        '1 Passport-size Photo',
        'House Tax Paid Receipt',
        'Udyam Certificate',
        'Tax',
        'Permit',
        'Fitness Certificate',
        'Vehicle Quotation Report'
    ],

    // Used Commercial Vehicle Loan
    USED_COMMERCIAL: [
        // Borrower Documents
        '1 Passport-size Photo',
        'PAN Card',
        'Aadhaar Card',
        'Driving Licence (as per vehicle category)',
        'Electricity Bill (Address Proof)',
        'Latest 6 Months Bank Statement',
        '5 Cheques',
        'House Tax Paid Receipt / Property Document',
        'Udyam Certificate',
        'GST Certificate',
        'Old Vehicle RC',

        // Co-Applicant Documents
        'Co-Applicant: 1 Passport-size Photo',
        'Co-Applicant: PAN Card',
        'Co-Applicant: Aadhaar Card',

        // Guarantor Documents
        'Guarantor: 1 Passport-size Photo',
        'Guarantor: PAN Card',
        'Guarantor: Aadhaar Card',
        'Guarantor: Electricity Bill',
        'Guarantor: RC Xerox Copy',
        'Guarantor: Repayment Track Record',

        // Vehicle Documents
        'RC Book',
        'Full Insurance',
        'Tax Paid Certificate',
        'Vehicle Permit',
        'Fitness Certificate',
        'Vehicle Valuation Report'
    ],

    // Business Loan
    // Business Loan
    BUSINESS_LOAN: [
        // 1. KYC Documents
        'Aadhaar Card (Applicant)',
        'PAN Card (Applicant)',
        'Passport / Voter ID / Driving License',
        'Residence Address Proof (Utility Bill)',

        // 2. Business Identity & Registration
        'Udyam (MSME) Registration Certificate',
        'Business Address Proof (Light Bill / Rent Agreement)',
        'Shop Act / Trade License',
        'Business PAN Card',
        'Partnership Deed (if Partnership)',
        'Certificate of Incorporation / MOA / AOA (if Pvt Ltd/LLP)',
        'Board Resolution / Authorization Letter',

        // 3. Financial Records
        'Bank Statements (Last 12 Months)',
        'ITR (Income Tax Returns) - Last 2 Years',
        'Audited Balance Sheet & Profit & Loss Statement',
        'GST Returns / GST Registration Certificate',

        // 4. Business Information
        'Business Plan / Project Report',
        'Quotation of Machinery (for Purchase)',

        // 5. Additional Documents
        'Property / Asset Documents (for Secured Loan)',
        'Collateral / Security Documents',
        'Existing Loan Sanction Letters'
    ],

    // Personal Loan
    // Personal Loan
    PERSONAL_LOAN: [
        'Adhar card',
        'Pan card',
        'Mobile no',
        'Mail id',
        '3 latest Salary slip',
        '1 Year Bank statement',
        'ID card photo'
    ],

    // LAP Documents for Businessmen
    LAP_BUSINESS: [
        'Aadhar card',
        'Pan card',
        'Light bill (home & shop)',
        'Offering and joining letter',
        'Salary slip 3 Month',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if app)',
        'NA order / City survey Utara',
        'Ferfar',
        'Kharedi dast(chain documents)',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'Complition letter'
    ],

    // Flat Purchase - Salaried
    FLAT_PURCHASE_SALARIED: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Office ID Card/ joining letter',
        'Salary slip for 3 months',
        'Form no. 16 for 2 years (with part A&B)',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if app)',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Agrrement to sale',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'RERA Certificate'
    ],

    // Flat Purchase - Business
    FLAT_PURCHASE_BUSINESS: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Shop act license',
        'ITR 3 years',
        'GST certificate',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if any)',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Agrrement to sale',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'RERA Certificate'
    ],

    // LAP for Gavthan Property (Business)
    LAP_GAVTHAN: [
        'Pan card',
        'Aadhar card',
        'Shop Act/ Udhyam',
        '1 yr Bank statement pdf file',
        'Email ID',
        'Mob no',
        '7 12 / 8 A',
        'Kharedi Dast',
        'Last 13 yrs Assessment/ Ferfar',
        'Gavthan Dakhala',
        'Chaturseema Dakhala',
        'Gharpatti',
        'Light Bill'
    ],

    // Home Loan BT - Business
    HOME_LOAN_BT_BUSINESS: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Udhyam certificate',
        'ITR 3 years',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter of IDBI bank',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'LOD from previous bank',
        'Loan statement of previous bank'
    ],

    // Home Loan BT - Salary
    HOME_LOAN_BT_SALARIED: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Form 16 (2 years)',
        '3 month (lastest)salary slip',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'LOD from previous bank',
        'Loan statement of previous bank'
    ],

    // Bungalow Purchase - Salaried
    BUNGALOW_PURCHASE_SALARIED: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Office ID Card/ joining letter',
        'Salary slip for 3 months',
        'Form no. 16 for 2 years (with part A&B)',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if app)',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Agreement to sale',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'RERA Certificate'
    ],

    // Bungalow Purchase - Business
    BUNGALOW_PURCHASE_BUSINESS: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Shop act license',
        'ITR 3 years',
        'GST certificate',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if any)',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Agreement to sale',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'RERA Certificate'
    ],

    // Home Loan Construction - Business
    HOME_LOAN_CONSTRUCTION_BUSINESS: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Shop act / Udyam Adhar',
        'ITR - 3 years',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if any)',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'Estimate'
    ],

    // Home Loan Construction - Salaried
    HOME_LOAN_CONSTRUCTION_SALARIED: [
        'Aadhar card',
        'Pan card',
        'Light bill',
        'Office ID Card/ joining letter',
        'Salary slip for 3 months',
        'Form no. 16 for 2 years (with part A&B)',
        'Bank account statement 1 year',
        'Loan account statement & Sanction letter (if app)',
        'NA order/ City Survey',
        'Ferfar',
        'Kharedi dast (Chain Doc)',
        'Layout plan',
        'Sanction plan',
        'Bandhkam Parvana',
        'Estimate'
    ],

    // Commercial Purchase
    COMMERCIAL_PURCHASE: [
        'Individual KYC',
        'Photo',
        'PAN Card',
        'Aadhar Card',
        'Voter id',
        'Electricity bill home',
        // Comapny KYC
        'Company KYC',
        'Shop Act',
        'Udyam',
        'GST Registration',
        'Office Electricity Bill or Rent Agreement',
        // Income Documents
        'Income Documents',
        '3 years ITR with all financials',
        '1 year bank statement (01-08-2024 to Till date in PDF)',
        'GSTR3B last 12 Months',
        // Property Papers
        'Property papers',
        'Builders Master File',
        'Draft Agreement'
    ],

    // RTO Work - Commercial Vehicle
    RTO_COMMERCIAL: [
        'Original RC',
        'Insurance',
        'PUC Certificate',
        'Chassis Print',
        'Permit',
        'Fitness Certificate',
        'Tax Receipt',
        'Front Side Photo of the Vehicle',
        'PAN Card & Aadhaar Card of both (New and Old) Owners',
        'NOC (if required)',
        'Hypothecation Letter from Finance Company',
        'Transfer Forms (Form 29 & Form 30) signed by both owners',
        'HSRP Receipt (if required)',
        'RTO Transfer Charges'
    ],

    // RTO Work - Car Vehicle
    RTO_CAR: [
        'Original RC',
        'Insurance',
        'PUC Certificate',
        'Chassis Print',
        'Front Side Photo of the Vehicle',
        'PAN Card & Aadhaar Card of both (New and Old) Owners',
        'NOC (if required)',
        'Hypothecation Letter from Finance Company',
        'Transfer Forms (Form 29 & Form 30) signed by both owners',
        'HSRP Receipt (if required)',
        'RTO Transfer Charges'
    ]
};

// Co-applicant Documents (common for most loan types)
export const CO_APPLICANT_DOCUMENTS = [
    'PAN Card',
    'Aadhaar Card',
    '1 Passport-size Photo',
    'Guarantor Vehicle RC'
];

// Application status options
// Application status options
export const APPLICATION_STATUSES = [
    { value: '', label: 'Select Status' },
    { value: 'New Lead', label: 'New Lead' },
    { value: 'Follow-up Required', label: 'Follow-up Required' },
    { value: 'Basic Info', label: 'Basic Info' },
    { value: 'Property Details', label: 'Property Details' },
    { value: 'Paper List', label: 'Paper List' },
    { value: 'Paper Collection', label: 'Paper Collection' },
    { value: 'Document Pending', label: 'Document Pending' },
    { value: 'In Process', label: 'In Process' },
    { value: 'CIBIL Check', label: 'CIBIL Check' },
    { value: 'Assigned to Bank', label: 'Assigned to Bank' },
    { value: 'Loan Approval', label: 'Loan Approval' },
    { value: 'Loan Sanctioned', label: 'Loan Sanctioned' },
    { value: 'Ready for Disbursement', label: 'Ready for Disbursement' },
    { value: 'Disbursed', label: 'Disbursed' },
    { value: 'RTO Pending', label: 'RTO Pending' },
    { value: 'Rejected', label: 'Rejected' },
];

// Vehicle Loan specific status workflow (10 steps)
export const VEHICLE_LOAN_STATUSES = [
    { value: '', label: 'Select Status' },
    { value: 'Basic Documents', label: 'Basic Documents' },
    { value: 'CIBIL Check', label: 'CIBIL Check' },
    { value: 'Document Pending', label: 'Document Pending' },
    { value: 'Verification (FIR)', label: 'Verification (FIR)' },
    { value: 'Valuation + Search ', label: 'Valuation + Search' },
    { value: 'Loan Approval', label: 'Loan Approval' },
    { value: 'Finance Scheme', label: 'Finance Scheme' },
    { value: 'Disbursement', label: 'Disbursement' },
    { value: 'RTO Work / Insurance', label: 'RTO Work / Insurance' },
    { value: 'Payout', label: 'Payout' },
    { value: 'Rejected', label: 'Rejected' }
];

// Home Loan specific status workflow (10 steps)
export const HOME_LOAN_STATUSES = [
    { value: '', label: 'Select Status' },
    { value: 'Customer Basic Info', label: 'Customer Basic Info' },
    { value: 'Property Details & Loan Product', label: 'Property Details & Loan Product' },
    { value: 'Documents', label: 'Documents' },
    { value: 'CIBIL', label: 'CIBIL' },
    { value: 'Property Search & Valuation', label: 'Property Search & Valuation' },
    { value: 'Assign the Bank / Finance', label: 'Assign the Bank / Finance' },
    { value: 'Paper Collection', label: 'Paper Collection' },
    { value: 'Paper Unit Get', label: 'Paper Unit Get' },
    { value: 'Property Lift', label: 'Property Lift' },
    { value: 'Disbursement', label: 'Disbursement' },
    { value: 'Rejected', label: 'Rejected' }
];

// Helper function to get document list based on loan type and employment type
export const getDocumentList = (loanType, employmentType) => {
    if (!loanType) return [];

    // For loan types that don't vary by employment type (static lists)
    const simpleDocLists = [
        'BUSINESS_LOAN', 'PERSONAL_LOAN', 'LAP_BUSINESS', 'LAP_GAVTHAN',
        'COMMERCIAL_PURCHASE', 'RTO_COMMERCIAL', 'RTO_CAR'
    ];

    const loanTypeKey = Object.keys(LOAN_TYPES).find(key => LOAN_TYPES[key] === loanType);

    if (!loanTypeKey) return [];

    if (simpleDocLists.includes(loanTypeKey)) {
        return DOCUMENT_LISTS[loanTypeKey] || [];
    }

    // For loan types that vary by employment type (Vehicles, Home Loans, etc.)
    if (employmentType) {
        let empKey = employmentType.toUpperCase();
        // Normalize occupation types to standard keys
        if (empKey === 'JOB' || empKey === 'SALARY') empKey = 'SALARIED';

        // Try exact match first
        let docKey = `${loanTypeKey}_${empKey}`;
        let docs = DOCUMENT_LISTS[docKey];

        // If not found, and type is BUSINESS, try SELF_EMPLOYED
        if (!docs && empKey === 'BUSINESS') {
            docs = DOCUMENT_LISTS[`${loanTypeKey}_SELF_EMPLOYED`];
        }

        return docs || [];
    }

    // FALLBACK: If employment type is missing, try to return a default document list
    // Try BUSINESS/SELF_EMPLOYED first (most common), then SALARIED, then FARMER
    const fallbackKeys = ['BUSINESS', 'SELF_EMPLOYED', 'SALARIED', 'FARMER'];

    for (const empKey of fallbackKeys) {
        const docKey = `${loanTypeKey}_${empKey}`;
        const docs = DOCUMENT_LISTS[docKey];
        if (docs && docs.length > 0) {
            
            return docs;
        }
    }

    return [];
};

// Helper function to get status options based on loan type
export const getStatusOptions = (loanType) => {
    if (!loanType) return APPLICATION_STATUSES;

    // Vehicle loan types get specialized workflow
    const vehicleLoanTypes = [
        LOAN_TYPES.NEW_CAR,
        LOAN_TYPES.USED_CAR,
        LOAN_TYPES.NEW_COMMERCIAL,
        LOAN_TYPES.USED_COMMERCIAL
    ];

    if (vehicleLoanTypes.includes(loanType)) {
        return VEHICLE_LOAN_STATUSES;
    }

    // Home loan types get specialized workflow
    const homeLoanTypes = [
        LOAN_TYPES.HOME_LOAN_CONSTRUCTION,
        LOAN_TYPES.FLAT_PURCHASE,
        LOAN_TYPES.HOME_LOAN_BT,
        LOAN_TYPES.BUNGALOW_PURCHASE,
        LOAN_TYPES.COMMERCIAL_PURCHASE,
        // Add LAP types
        LOAN_TYPES.LAP_BUSINESS,
        LOAN_TYPES.LAP_GAVTHAN,
        // Add Business Finance types (often property backed)
        LOAN_TYPES.PROJECT_LOAN,
        LOAN_TYPES.WORKING_CAPITAL,
        LOAN_TYPES.BALANCE_TRANSFER
    ];

    if (homeLoanTypes.includes(loanType)) {
        return HOME_LOAN_STATUSES;
    }

    // All other loan types use standard statuses
    return APPLICATION_STATUSES;
};

// Combined Status List for Filters
const allStatusArrays = [
    ...APPLICATION_STATUSES,
    ...VEHICLE_LOAN_STATUSES,
    ...HOME_LOAN_STATUSES
];

// Create unique list based on value
export const ALL_COMBINED_STATUSES = Array.from(
    new Map(allStatusArrays.map(item => [item.value, item])).values()
);

// Priority Options
export const PRIORITY_OPTIONS = [
    { value: 'Low', label: 'Low', color: 'green' },
    { value: 'Medium', label: 'Medium', color: 'orange' },
    { value: 'High', label: 'High', color: 'red' }
];
