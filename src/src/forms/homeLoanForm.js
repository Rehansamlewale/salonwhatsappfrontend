// Home Loan Form Configuration
export const HOME_LOAN_FORM_FIELDS = {
  // 1. Applicant Personal Details
  applicantPersonalDetails: {
    fullName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    maritalStatus: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    emailId: '',
    panNumber: '',
    aadhaarNumber: '',
    currentResidentialAddress: '',
    permanentAddress: ''
  },

  // 2. Co-Applicant Details
  coApplicantDetails: {
    hasCoApplicant: false,
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    age: '',
    panNumber: '',
    aadhaarNumber: '',
    occupation: '',
    monthlyIncome: ''
  },

  // 3. Employment / Income Details
  employmentDetails: {
    employmentType: '', // 'salaried' or 'self-employed'

    // For Salaried
    salaried: {
      employerName: '',
      organizationType: '', // Govt / PSU / Private / MNC
      designation: '',
      totalWorkExperience: '',
      currentCompanyExperience: '',
      monthlyGrossSalary: '',
      monthlyNetSalary: '',
      salaryAccountBank: ''
    },

    // For Self-Employed
    selfEmployed: {
      businessType: '', // Proprietor / Partner / Director
      natureOfBusiness: '',
      businessVintage: '',
      annualTurnoverYear1: '',
      annualTurnoverYear2: '',
      annualTurnoverYear3: '',
      netProfitYear1: '',
      netProfitYear2: '',
      netProfitYear3: ''
    }
  },

  // 4. Existing Loans
  existingLoans: {
    hasExistingLoans: false,
    loans: [] // Array of { loanType, bankNbfc, emiAmount, outstanding, endDate }
  },

  // 5. Home Loan Requirement
  loanRequirement: {
    purposeOfLoan: '', // purchase_ready / purchase_construction / construction / plot_purchase / renovation
    requiredLoanAmount: '',
    preferredTenure: '',
    expectedEmiRange: ''
  },

  // 6. Property Details
  propertyDetails: {
    propertyType: '', // Flat / Row House / Bungalow / Plot
    propertyUsage: '', // Self-Occupied / Rental
    fullPropertyAddress: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    carpetArea: '',
    builtUpArea: '',
    propertyAge: '',
    agreementValue: '',
    marketValue: ''
  },

  // 7. Builder / Seller Details
  builderSellerDetails: {
    sellerBuilderName: '',
    projectName: '',
    reraRegistrationNumber: '',
    sellerContactDetails: ''
  },

  // 8. Documents Checklist
  documentsChecklist: {
    kycDocuments: {
      aadhaarCard: false,
      panCard: false,
      photoId: false // Passport / Voter ID / Driving License
    },
    incomeProof: {
      salarySlips: false,
      form16: false,
      bankStatement6Months: false,
      itr: false,
      balanceSheet: false,
      profitLoss: false,
      bankStatement12Months: false
    },
    propertyDocuments: {
      saleAgreement: false,
      approvedBuildingPlan: false,
      occupancyCertificate: false,
      propertyTaxReceipt: false
    }
  }
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

// Marital Status Options
export const MARITAL_STATUS_OPTIONS = [
  { value: '', label: 'Select Status' },
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' }
];

// Organization Type Options
export const ORGANIZATION_TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'Government', label: 'Government' },
  { value: 'PSU', label: 'PSU (Public Sector Undertaking)' },
  { value: 'Private', label: 'Private Limited' },
  { value: 'MNC', label: 'MNC (Multinational Corporation)' }
];

// Business Type Options
export const BUSINESS_TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'Proprietor', label: 'Proprietor' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Director', label: 'Director' }
];

// Loan Purpose Options
export const LOAN_PURPOSE_OPTIONS = [
  { value: '', label: 'Select Purpose' },
  { value: 'purchase_ready', label: 'Purchase – Ready Property' },
  { value: 'purchase_construction', label: 'Purchase – Under Construction' },
  { value: 'construction', label: 'Construction of House' },
  { value: 'plot_purchase', label: 'Plot Purchase' },
  { value: 'renovation', label: 'Home Improvement / Renovation' }
];

// Property Type Options
export const PROPERTY_TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Row House', label: 'Row House' },
  { value: 'Bungalow', label: 'Bungalow' },
  { value: 'Plot', label: 'Plot' }
];

// Property Usage Options
export const PROPERTY_USAGE_OPTIONS = [
  { value: '', label: 'Select Usage' },
  { value: 'Self-Occupied', label: 'Self-Occupied' },
  { value: 'Rental', label: 'Rental' }
];

// Relationship Options for Co-Applicant
export const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select Relationship' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Other', label: 'Other' }
];
