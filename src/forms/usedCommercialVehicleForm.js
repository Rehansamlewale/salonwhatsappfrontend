// Used Commercial Vehicle Loan Form Configuration
export const USED_COMMERCIAL_VEHICLE_FORM_FIELDS = {
  // 1. Driving License & Experience
  drivingLicense: {
    hasValidLicense: false,
    licenseActiveYears: '',
    drivingExperienceYears: '',
    intendedUse: '' // Goods Transport / Own Business / Rental (T-Permit)
  },

  // 2. Current Fleet Details
  currentFleet: {
    ownsCommercialVehicles: false,
    totalVehicles: '',
    vehicleModels: '', // Comma-separated or text description
    loanFreeVehicles: '',
    vehiclesWithLoan: '',

    // Active Loan Details (if vehiclesWithLoan > 0)
    activeLoans: [] // Array of { financeCompany: '', loanAmount: '', tenure: '', emisOnTime: '' }
  },

  // 3. Ongoing Loans & CIBIL
  ongoingLoans: {
    hasOtherLoans: false, // Personal, Gold, Home, etc.
    totalMonthlyEmi: '',
    cibilScore: '' // Approximate
  },

  // 4. Personal Information
  personalInfo: {
    fullName: '',
    mobileNumber: '',
    village: '',
    completeAddress: '',
    nearestLandmark: ''
  },

  // 5. Residential Details
  residentialDetails: {
    residentialStatus: '', // Owned / Rented
    houseType: '', // Bungalow / Flat / Tiled / Tin Shed
    houseRegisteredName: '',
    hasPanAadhar: false,
    livesAtAadharAddress: false
  },

  // 6. Business Details
  businessDetails: {
    hasBusiness: false,
    natureOfBusiness: '',
    businessYears: '',
    businessPremises: '', // Owned / Rented
    monthlyRent: '',
    hasShopActUdyam: false,
    hasGstNumber: false,
    filesItr: false,
    annualIncomePerItr: ''
  },

  // 7. Agriculture & Additional Income
  agricultureIncome: {
    ownsAgriLand: false,
    landArea: '', // Acres / Gunthas
    landRegisteredName: '',
    has712And8A: false,
    hasOtherIncome: false,
    otherIncomeSources: [] // Room Rent / Dairy Business / Small Business / Others
  },

  // 8. Vehicle Documentation
  vehicleDocumentation: {
    hasOriginalRc: false,
    hasHypothecation: false,
    hypothecationBank: '',
    outstandingLoanAmount: '',
    hasNoc: false,
    hasComprehensiveInsurance: false,
    hasFitnessCertificate: false,
    hasValidPermit: false,
    roadTaxPaid: false,
    professionalTaxPaid: false,
    greenTaxPaid: false
  }
};

// Intended Use Options
export const INTENDED_USE_OPTIONS = [
  { value: '', label: 'Select Intended Use' },
  { value: 'Goods Transport', label: 'Goods Transport' },
  { value: 'Own Business', label: 'Own Business' },
  { value: 'Rental (T-Permit)', label: 'Rental (T-Permit)' }
];

// Residential Status Options
export const RESIDENTIAL_STATUS_OPTIONS = [
  { value: '', label: 'Select Status' },
  { value: 'Owned', label: 'Owned' },
  { value: 'Rented', label: 'Rented' }
];

// House Type Options
export const HOUSE_TYPE_OPTIONS = [
  { value: '', label: 'Select House Type' },
  { value: 'Bungalow', label: 'Bungalow' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Tiled', label: 'Tiled' },
  { value: 'Tin Shed', label: 'Tin Shed' }
];

// Business Premises Options
export const BUSINESS_PREMISES_OPTIONS = [
  { value: '', label: 'Select Premises Type' },
  { value: 'Owned', label: 'Owned' },
  { value: 'Rented', label: 'Rented' }
];

// Other Income Sources Options
export const OTHER_INCOME_SOURCES = [
  { value: 'Room Rent', label: 'Room Rent' },
  { value: 'Dairy Business', label: 'Dairy Business' },
  { value: 'Small Business', label: 'Small Business' },
  { value: 'Others', label: 'Others' }
];

// Yes/No Options
export const YES_NO_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' }
];
