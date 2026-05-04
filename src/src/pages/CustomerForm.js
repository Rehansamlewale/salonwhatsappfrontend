import React, { useState, useEffect, useRef } from 'react';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ref, update, get, child, set } from 'firebase/database';
import { database } from '../firebase';
import {
    LOAN_TYPES,
    DOCUMENT_LISTS,
    LOAN_SUBCATEGORIES
} from '../forms/loanTypes';
import UsedCommercialVehicleFormSections from '../forms/UsedCommercialVehicleFormSections';
import { Toast, SecondaryButton } from '../components/common';

// Import extracted form section components
import {
    LoanCategorySection,
    BasicInfoSection,
    ResidenceSection,
    OccupationSection,
    FarmIncomeSection,
    VehicleDetailsSection,
    VehicleHistorySection,
    LoansSection,
    UsedVehicleSection,
    NewVehicleSection,
    HomeLoanSection,
    ApplicationStatusSection,
    DocumentsSection,
    AddDocumentModal,
    AssetsLiabilitiesSection,
    CoApplicantSection
} from '../forms/customerForm';

const CustomerForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    // Referrer management states
    const [referrerMobile, setReferrerMobile] = useState('');
    const [isNewReferrer, setIsNewReferrer] = useState(false);
    const [existingReferrers, setExistingReferrers] = useState([]);

    // Add Document Modal state
    const [showAddDocModal, setShowAddDocModal] = useState(false);
    const [newDocName, setNewDocName] = useState('');

    const [formData, setFormData] = useState({
        // Loan Category Selection (NEW - displayed first)
        loanCategory: '',
        loanSubcategory: '',
        loanPurpose: '',

        // 1. Basic Information
        name: '',
        mobile1: '',
        aadhar: '',
        mobile2: '',
        email: '',
        city: '',
        address: '',
        landmark: '',
        referedby: '',
        birthdate: '',
        requiredLoanAmount: '',

        // 2. Residence Information
        residenceType: '', // Own/Rented
        houseCategory: '', // Bungalow/Flat/Koularu/Sheet
        numberOfRooms: '',
        houseOwnerName: '',
        hasOwnerPanAadhar: false,
        livesAtAadharAddress: false,
        residenceRemark: '',

        // 3. Occupation Information
        occupationType: '', // Job/Business
        // Job Specific
        companyName: '',
        designation: '',
        jobYears: '',
        salaryInBank: false,
        grossSalary: '',
        netSalary: '',
        hasForm16: false,
        hasSalarySlips: false,
        hasBankStatement: false,
        hasPF: false,
        // Business Specific
        businessName: '',
        businessYears: '',
        businessPlaceType: '', // Own/Rented
        businessRentAmount: '',
        yearlyIncome: '',
        yearlyTurnover: '',
        hasShopAct: false,
        hasUdyamReg: false,
        itrFiled: false,
        itrIncome: '',
        // Business Finance Specific
        businessEntityType: '', // Proprietorship, Partnership, LLP, Pvt Ltd
        hasGST: false,
        businessAddress: '',
        hasStockValuation: false,
        stockValuationAmount: '',
        partners: [], // Array of { name: '', mobile: '' }

        // 4. Farm & Extra Income
        hasFarm: false,
        farmArea: '', // In Guntha/Acre
        farmOwnerName: '',
        hasFarmDocuments: false, // 7/12 & 8A
        hasExtraIncome: false,
        extraIncomeSources: [], // Array of selected sources: Rent, Dairy, SmallBiz, Other
        extraIncomeBreakdown: {}, // { "Room Rent": "1000", ... }
        extraIncomeAmount: '',
        otherIncomeDescription: '', // Description when 'Other' is selected

        // 5. Current Vehicle Details (for vehicle loans)
        vehicleRegistrationNumber: '',
        vehicleType: '', // Car/Commercial Vehicle/Two Wheeler
        vehicleModel: '',
        vehicleManufacturingYear: '',
        vehicleNumberOfOwners: '',
        vehicleKmReading: '',
        vehiclePurchasePrice: '',
        vehicleLoanAmountRequired: '',
        vehicleHypothecation: '', // yes/no
        vehicleHypothecationBankName: '',
        vehicleHypothecationBalanceAmount: '',
        vehicleInsurance: '', // yes/no
        vehicleInsuranceIdvAmount: '',
        vehicleFuelType: '', // Petrol/Diesel/CNG/Electric/Hybrid

        // New Vehicle Details (for new car/commercial loans)
        newVehicleType: '',
        newVehicleModel: '',
        newVehicleFuelType: '',
        newVehicleColor: '',
        newVehicleInvoicePrice: '',
        newVehicleOnRoadPrice: '',
        newVehicleUsageType: '', // Private/Personal Use/T-Permit
        newVehicleInsurance: '',
        newVehicleTax: '',
        newVehicleTotal: '',
        newVehicleOther: '',
        hasHeavyLicense: false, // For new commercial vehicle loans
        heavyLicenseDate: '', // Heavy license issue date
        hasTRLicense: false, // For new commercial vehicle loans
        trLicenseDate: '', // TR license issue date

        // 6. Vehicle History
        hasPreviousVehicle: false,
        vehicles: [], // Array of { model: '', financeCompany: '', loanActive: 'No' }

        // LAP Specific - Property Details
        propertyType: '', // Residential/Commercial/Industrial/Plot
        propertyUsage: '', // Self Occupied/Rented/Vacant
        propertyAddress: '',
        propertyCity: '',
        propertyPincode: '',
        plotArea: '',
        constructionArea: '',
        agreementValue: '',
        marketValue: '',

        // LAP Specific - Builder/Seller Details
        sellerName: '',
        projectName: '',
        reraNumber: '',
        sellerMobile: '',

        // 7. Current Loans & CIBIL
        existingLoan: false,
        activeLoans: [], // Array of { bankName: '', loanAmount: '', emi: '', tenure: '', loanType: '', outstandingAmount: '' }
        cibilScore: '',

        // 8. Loan Application Details
        loanType: '',
        // 8b. Application Status
        status: '',
        priority: 'Low', // Default priority
        remark: '',
        machineQuotation: '', // For Business Finance -> Machinery Loan

        // 9. Documents Collected (Checklist) - stored with sanitized IDs from document labels
        collectedDocuments: {},
        // 10. Extra Documents (custom documents added by user)
        extraDocuments: [],

        // 11. Co-Applicants (for all loan types)
        coApplicants: [], // Array of { name, relationship, dob, mobile, income, occupation }

        // 12. Assets & Liabilities
        assets: {
            home: '',
            plot: '',
            farm: '',
            vehicle: '',
            gold: '',
            other: ''
        },

        // Home Loan Specific Fields
        homeLoan: {
            // Applicant Personal Details
            applicantGender: '',
            applicantMaritalStatus: '',
            applicantAlternateMobile: '',
            applicantPan: '',
            applicantAadhaar: '',
            applicantCurrentAddress: '',
            applicantPermanentAddress: '',

            // Multiple Co-Applicants
            coApplicants: [], // Array of { name, relationship, dob, income, occupation, mobile }

            // Employment Details (Salaried)
            employerName: '',
            organizationType: '',
            designation: '',
            totalWorkExperience: '',
            currentCompanyExperience: '',
            monthlyGrossSalary: '',
            monthlyNetSalary: '',
            salaryAccountBank: '',

            // Employment Details (Self-Employed)
            businessType: '',
            natureOfBusiness: '',
            businessVintage: '',
            annualTurnover1: '',
            annualTurnover2: '',
            annualTurnover3: '',
            netProfit1: '',
            netProfit2: '',
            netProfit3: '',

            // Loan Requirement
            loanPurpose: '',
            requiredLoanAmount: '',
            preferredTenure: '',
            expectedEmi: '',

            // Property Details
            propertyType: '',
            propertyUsage: '',
            propertyAddress: '',
            propertyCity: '',
            propertyDistrict: '',
            propertyState: '',
            propertyPincode: '',
            carpetArea: '',
            builtUpArea: '',
            propertyAge: '',
            agreementValue: '',
            marketValue: '',

            // Builder/Seller Details
            sellerName: '',
            projectName: '',
            reraNumber: '',
            sellerContact: ''
        },

        // Used Commercial Vehicle Loan Specific Fields
        usedCommercialVehicle: {
            // 1. Driving License & Experience
            hasValidLicense: false,
            licenseActiveYears: '',
            drivingExperienceYears: '',
            intendedUse: '',

            // 2. Current Fleet Details
            ownsCommercialVehicles: false,
            totalVehicles: '',
            vehicleModels: '',
            loanFreeVehicles: '',
            vehiclesWithLoan: '',
            fleetActiveLoans: [], // Array of { financeCompany: '', loanAmount: '', tenure: '', emisOnTime: '' }

            // 3. Ongoing Loans & CIBIL
            hasOtherLoans: false,
            totalMonthlyEmi: '',
            ucvCibilScore: '',

            // 4. Personal Information (some overlap with basic info)
            ucvFullName: '',
            ucvMobileNumber: '',
            ucvVillage: '',
            ucvCompleteAddress: '',
            ucvNearestLandmark: '',

            // 5. Residential Details
            ucvResidentialStatus: '',
            ucvHouseType: '',
            ucvHouseRegisteredName: '',
            ucvHasPanAadhar: false,
            ucvLivesAtAadharAddress: false,

            // 6. Business Details
            hasBusiness: false,
            natureOfBusiness: '',
            businessYears: '',
            businessPremises: '',
            monthlyRent: '',
            hasShopActUdyam: false,
            hasGstNumber: false,
            filesItr: false,
            annualIncomePerItr: '',

            // 7. Agriculture & Additional Income
            ownsAgriLand: false,
            landArea: '',
            landRegisteredName: '',
            has712And8A: false,
            hasOtherIncome: false,
            otherIncomeSources: [],

            // 8. Vehicle Documentation
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
    });

    // Helper function to calculate age from birthdate
    const calculateAge = (birthdate) => {
        if (!birthdate) return '';
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            // Handle nested object for collectedDocuments
            if (name.startsWith('doc_')) {
                const docName = name.replace('doc_', '');
                setFormData(prev => ({
                    ...prev,
                    collectedDocuments: {
                        ...prev.collectedDocuments,
                        [docName]: checked
                    }
                }));
            } else if (name === 'extraIncomeSource') {
                setFormData(prev => ({ ...prev, [name]: checked }));
            } else if (name === 'hasPreviousVehicle') {
                // Initialize one empty vehicle if checked
                setFormData(prev => ({
                    ...prev,
                    [name]: checked,
                    vehicles: checked && prev.vehicles.length === 0 ? [{ model: '', financeCompany: '', loanActive: 'No' }] : prev.vehicles
                }));
            } else if (name === 'existingLoan') {
                // Initialize one empty loan if checked
                setFormData(prev => ({
                    ...prev,
                    [name]: checked,
                    activeLoans: checked && prev.activeLoans.length === 0 ? [{ bankName: '', loanAmount: '', emi: '', tenure: '', loanType: '', outstandingAmount: '' }] : prev.activeLoans
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            let sanitizedValue = value;
            let newErrors = { ...errors };

            // Sanitize Name and City - only allow alphabets and spaces
            if (name === 'name' || name === 'city') {
                sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
            }

            // Validate Mobile Numbers
            if (name === 'mobile1' || name === 'mobile2') {
                // Only allow digits
                sanitizedValue = value.replace(/\D/g, '');
                if (sanitizedValue.length > 0 && sanitizedValue.length !== 10) {
                    newErrors[name] = 'Mobile number must be exactly 10 digits';
                } else {
                    delete newErrors[name];
                }
            }

            // Validate Aadhaar
            if (name === 'aadhar') {
                // Only allow digits
                sanitizedValue = value.replace(/\D/g, '');
                if (sanitizedValue.length > 0 && sanitizedValue.length !== 12) {
                    newErrors[name] = 'Aadhaar number must be exactly 12 digits';
                } else {
                    delete newErrors[name];
                }
            }

            // Validate Email
            if (name === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value.length > 0 && !emailRegex.test(value)) {
                    newErrors[name] = 'Please enter a valid email address';
                } else {
                    delete newErrors[name];
                }
            }

            // Validate CIBIL Score
            if (name === 'cibilScore') {
                const score = parseInt(value);
                if (value.length > 0 && (score < 300 || score > 900)) {
                    newErrors[name] = 'CIBIL score must be between 300 and 900';
                } else {
                    delete newErrors[name];
                }
            }

            // Validate Birthdate - cannot be in future
            if (name === 'birthdate') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (value.length > 0 && selectedDate > today) {
                    newErrors[name] = 'Birthdate cannot be in the future';
                    sanitizedValue = ''; // Clear or handle as needed
                } else {
                    delete newErrors[name];
                }
            }

            // Validate numeric fields (amounts, years, etc.)
            const numericFields = ['monthlySalary', 'businessRentAmount', 'vehiclePurchasePrice',
                'vehicleLoanAmountRequired', 'vehicleKmReading', 'numberOfRooms', 'requiredLoanAmount'];
            if (numericFields.includes(name) || type === 'number') {
                if (value !== '' && parseFloat(value) < 0) {
                    sanitizedValue = '0';
                }
                const num = parseFloat(sanitizedValue);
                if (sanitizedValue.length > 0 && (isNaN(num) || num < 0)) {
                    newErrors[name] = 'Please enter a valid positive number';
                } else {
                    delete newErrors[name];
                }
            }

            // Validate Manufacturing Year
            if (name === 'vehicleManufacturingYear') {
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                if (value.length > 0 && (year < 1980 || year > currentYear + 1)) {
                    newErrors[name] = `Year must be between 1980 and ${currentYear + 1}`;
                } else {
                    delete newErrors[name];
                }
            }

            setErrors(newErrors);

            // Auto-check hasRentAgreement when residenceType is set to "Rented"
            if (name === 'residenceType' && sanitizedValue === 'Rented') {
                setFormData(prev => ({ ...prev, [name]: sanitizedValue, hasRentAgreement: true }));
            } else {
                setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
            }
        }
    };

    // --- Vehicle Handlers ---
    const addVehicle = () => {
        setFormData(prev => ({
            ...prev,
            vehicles: [...prev.vehicles, { model: '', financeCompany: '', loanActive: 'No' }]
        }));
    };

    const removeVehicle = (index) => {
        setFormData(prev => ({
            ...prev,
            vehicles: prev.vehicles.filter((_, i) => i !== index)
        }));
    };

    const handleVehicleChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.vehicles];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, vehicles: updated };
        });
    };

    // --- Loan Handlers ---
    const addLoan = () => {
        setFormData(prev => ({
            ...prev,
            activeLoans: [...prev.activeLoans, { bankName: '', loanAmount: '', emi: '', tenure: '', loanType: '', outstandingAmount: '' }]
        }));
    };

    const removeLoan = (index) => {
        setFormData(prev => ({
            ...prev,
            activeLoans: prev.activeLoans.filter((_, i) => i !== index)
        }));
    };

    const handleLoanChange = (index, field, value) => {
        // Prevent negative numbers for fields that are likely amounts or numeric
        let sanctionedValue = value;
        if (value !== '' && !isNaN(value) && parseFloat(value) < 0) {
            sanctionedValue = '0';
        }

        setFormData(prev => {
            const updated = [...prev.activeLoans];
            updated[index] = { ...updated[index], [field]: sanctionedValue };
            return { ...prev, activeLoans: updated };
        });
    };

    // Category and Subcategory Handlers
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setFormData(prev => ({
            ...prev,
            loanCategory: category,
            loanSubcategory: '', // Reset subcategory when category changes
            loanType: '' // Reset old loanType for backward compatibility
        }));
    };

    const handleSubcategoryChange = (e) => {
        const subcategory = e.target.value;
        setFormData(prev => ({
            ...prev,
            loanSubcategory: subcategory,
            loanType: subcategory // Keep loanType synced for backward compatibility
        }));
    };

    const handleExtraIncomeSourceChange = (source) => {
        setFormData(prev => {
            const isRemoving = prev.extraIncomeSources.includes(source);
            const sources = isRemoving
                ? prev.extraIncomeSources.filter(s => s !== source)
                : [...prev.extraIncomeSources, source];

            // If removing, also remove from breakdown and recalculate total
            let newBreakdown = { ...prev.extraIncomeBreakdown };
            let newTotal = parseFloat(prev.extraIncomeAmount) || 0;

            if (isRemoving) {
                delete newBreakdown[source];
                // Recalculate total
                newTotal = Object.values(newBreakdown).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            }

            return {
                ...prev,
                extraIncomeSources: sources,
                extraIncomeBreakdown: newBreakdown,
                extraIncomeAmount: isRemoving ? newTotal.toString() : prev.extraIncomeAmount
            };
        });
    };

    const handleExtraIncomeAmountChange = (source, amount) => {
        // Prevent negative numbers
        let sanitizedAmount = amount;
        if (amount !== '' && !isNaN(amount) && parseFloat(amount) < 0) {
            sanitizedAmount = '0';
        }

        setFormData(prev => {
            const newBreakdown = { ...prev.extraIncomeBreakdown, [source]: sanitizedAmount };
            const total = Object.values(newBreakdown).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            return {
                ...prev,
                extraIncomeBreakdown: newBreakdown,
                extraIncomeAmount: total.toString()
            };
        });
    };

    // Home Loan Field Handler
    const handleHomeLoanChange = (field, value) => {
        // Prevent negative numbers for numeric fields
        let sanitizedValue = value;
        // Basic check: if it looks like a number and is negative
        if (value !== '' && !isNaN(value) && typeof value !== 'boolean' && parseFloat(value) < 0) {
            sanitizedValue = '0';
        }

        // Prevent future birthdates for co-applicants
        if (field === 'coApplicants' && Array.isArray(value)) {
            sanitizedValue = value.map(app => {
                if (app.dob) {
                    const selectedDate = new Date(app.dob);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate > today) {
                        alert(`Birthdate for ${app.name || 'co-applicant'} cannot be in the future`);
                        return { ...app, dob: '' };
                    }
                }
                return app;
            });
        }

        setFormData(prev => ({
            ...prev,
            homeLoan: {
                ...prev.homeLoan,
                [field]: sanitizedValue
            }
        }));
    };

    // Used Commercial Vehicle Field Handler
    const handleUsedCommercialVehicleChange = (field, value) => {
        // Prevent negative numbers for numeric fields
        let sanitizedValue = value;
        if (value !== '' && !isNaN(value) && typeof value !== 'boolean' && parseFloat(value) < 0) {
            sanitizedValue = '0';
        }

        setFormData(prev => ({
            ...prev,
            usedCommercialVehicle: {
                ...prev.usedCommercialVehicle,
                [field]: sanitizedValue
            }
        }));
    };

    // Fleet Loan Handlers for Used Commercial Vehicle
    const addFleetLoan = () => {
        setFormData(prev => ({
            ...prev,
            usedCommercialVehicle: {
                ...prev.usedCommercialVehicle,
                fleetActiveLoans: [...prev.usedCommercialVehicle.fleetActiveLoans, { financeCompany: '', loanAmount: '', tenure: '', emisOnTime: '' }]
            }
        }));
    };

    const removeFleetLoan = (index) => {
        setFormData(prev => ({
            ...prev,
            usedCommercialVehicle: {
                ...prev.usedCommercialVehicle,
                fleetActiveLoans: prev.usedCommercialVehicle.fleetActiveLoans.filter((_, i) => i !== index)
            }
        }));
    };

    const handleFleetLoanChange = (index, field, value) => {
        // Prevent negative numbers
        let sanitizedValue = value;
        if (value !== '' && !isNaN(value) && parseFloat(value) < 0) {
            sanitizedValue = '0';
        }

        setFormData(prev => {
            const updated = [...prev.usedCommercialVehicle.fleetActiveLoans];
            updated[index] = { ...updated[index], [field]: sanitizedValue };
            return {
                ...prev,
                usedCommercialVehicle: {
                    ...prev.usedCommercialVehicle,
                    fleetActiveLoans: updated
                }
            };
        });
    };

    // Handler for other income sources (checkboxes)
    const handleOtherIncomeSourceChange = (source) => {
        setFormData(prev => {
            const sources = prev.usedCommercialVehicle.otherIncomeSources.includes(source)
                ? prev.usedCommercialVehicle.otherIncomeSources.filter(s => s !== source)
                : [...prev.usedCommercialVehicle.otherIncomeSources, source];
            return {
                ...prev,
                usedCommercialVehicle: {
                    ...prev.usedCommercialVehicle,
                    otherIncomeSources: sources
                }
            };
        });
    };

    // Asset Field Handler
    const handleAssetChange = (field, value) => {
        // Prevent negative numbers
        let sanitizedValue = value;
        if (value !== '' && !isNaN(value) && parseFloat(value) < 0) {
            sanitizedValue = '0';
        }

        setFormData(prev => ({
            ...prev,
            assets: {
                ...prev.assets,
                [field]: sanitizedValue
            }
        }));
    };

    // Co-Applicant Handlers
    const addCoApplicant = () => {
        setFormData(prev => ({
            ...prev,
            coApplicants: [...prev.coApplicants, { name: '', relationship: '', dob: '', mobile: '', income: '', occupation: '' }]
        }));
    };

    const removeCoApplicant = (index) => {
        setFormData(prev => ({
            ...prev,
            coApplicants: prev.coApplicants.filter((_, i) => i !== index)
        }));
    };

    const handleCoApplicantChange = (index, field, value) => {
        // Prevent negative numbers for income
        let sanitizedValue = value;
        if (field === 'income' && value !== '' && parseFloat(value) < 0) {
            sanitizedValue = '0';
        }

        // Prevent future DOB
        if (field === 'dob' && value !== '') {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                alert('Date of Birth cannot be in the future');
                sanitizedValue = '';
            }
        }

        setFormData(prev => {
            const updated = [...prev.coApplicants];
            updated[index] = { ...updated[index], [field]: sanitizedValue };
            return { ...prev, coApplicants: updated };
        });
    };

    // Partner Handlers (for Business Finance)
    const addPartner = () => {
        setFormData(prev => ({
            ...prev,
            partners: [...prev.partners, { name: '', mobile: '' }]
        }));
    };

    const removePartner = (index) => {
        setFormData(prev => ({
            ...prev,
            partners: prev.partners.filter((_, i) => i !== index)
        }));
    };

    const handlePartnerChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.partners];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, partners: updated };
        });
    };

    // Handler for selecting a contact from autocomplete
    const handleContactSelect = (contact) => {
        setFormData(prev => ({
            ...prev,
            referedby: contact.name || ''
        }));
        setShowContactDropdown(false);
    };

    // --- Extra Document Handlers ---
    const addExtraDocument = () => {
        setNewDocName('');
        setShowAddDocModal(true);
    };

    const confirmAddExtraDocument = () => {
        if (newDocName && newDocName.trim()) {
            setFormData(prev => ({
                ...prev,
                extraDocuments: [...prev.extraDocuments, { name: newDocName.trim(), collected: false }]
            }));
            setToast({ type: 'info', message: `Information: Custom document "${newDocName.trim()}" has been successfully added to the checklist.` });
        }
        setShowAddDocModal(false);
        setNewDocName('');
    };

    const removeExtraDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            extraDocuments: prev.extraDocuments.filter((_, i) => i !== index)
        }));
    };

    const handleExtraDocumentCheck = (index, checked) => {
        setFormData(prev => ({
            ...prev,
            extraDocuments: prev.extraDocuments.map((doc, i) =>
                i === index ? { ...doc, collected: checked } : doc
            )
        }));
    };

    // Helper to determine required documents
    const getRequiredDocs = () => {
        
        
        

        if (!formData.loanType) {
            
            return [];
        }

        const loanTypeKey = Object.keys(LOAN_TYPES).find(k => LOAN_TYPES[k] === formData.loanType);
        

        if (!loanTypeKey) {
            
            return [];
        }

        let docs = [];

        // Loan types that vary by employment type
        const employmentBasedLoanTypes = [
            'NEW_CAR', 'USED_CAR',
            'HOME_LOAN_CONSTRUCTION',
            'FLAT_PURCHASE',
            'HOME_LOAN_BT',
            'BUNGALOW_PURCHASE'
        ];

        if (employmentBasedLoanTypes.includes(loanTypeKey)) {
            
            
            

            // Determine employment suffix
            let employmentSuffix = '';

            if (formData.hasFarm) {
                employmentSuffix = '_FARMER';
            } else if (formData.occupationType === 'Job' || formData.occupationType === 'Salaried') {
                employmentSuffix = '_SALARIED';
            } else {
                // Default to Business/Self-Employed
                employmentSuffix = '_BUSINESS';
            }

            const docKey = `${loanTypeKey}${employmentSuffix}`;
            docs = DOCUMENT_LISTS[docKey] || [];
            

            // If not found, try alternative naming (SELF_EMPLOYED instead of BUSINESS)
            if (docs.length === 0 && employmentSuffix === '_BUSINESS') {
                const altKey = `${loanTypeKey}_SELF_EMPLOYED`;
                docs = DOCUMENT_LISTS[altKey] || [];
                
            }
        } else {
            // Direct Mapping for loan types that don't vary by employment
            docs = DOCUMENT_LISTS[loanTypeKey] || [];
            
        }

        // Add Rent Agreement if checkbox is checked
        if (formData.hasRentAgreement && !docs.some(d => d.toLowerCase().includes('rent agreement'))) {
            docs = [...docs, 'Rent Agreement'];
        }

        // Add Form 16 if checkbox is checked
        // Check for various Form 16 labels to avoid duplicates
        const hasForm16Already = docs.some(d =>
            d.toLowerCase().includes('form 16') ||
            d.toLowerCase().includes('form no. 16') ||
            d.toLowerCase().includes('form no.16')
        );
        if (formData.hasForm16 && !hasForm16Already) {
            docs = [...docs, 'Form 16'];
        }

        // Add Salary Slips / Bank Statement if checkbox is checked
        const hasSalarySlipsAlready = docs.some(d =>
            d.toLowerCase().includes('salary slip') ||
            d.toLowerCase().includes('salary slips')
        );
        if (formData.hasSalarySlips && !hasSalarySlipsAlready) {
            docs = [...docs, '3 Months Salary Slips / Bank Statement'];
        }

        // Add Shop Act / Udyam if checkbox is checked (Business)
        const hasBusinessProofAlready = docs.some(d =>
            d.toLowerCase().includes('shop act') ||
            d.toLowerCase().includes('udyam') ||
            d.toLowerCase().includes('business proof')
        );
        if (formData.hasBusinessProof && !hasBusinessProofAlready) {
            docs = [...docs, 'Shop Act / Udyam Registration'];
        }

        // Add ITR if checkbox is checked (Business)
        const hasITRAlready = docs.some(d => d.toLowerCase().includes('itr'));
        if (formData.itrFiled && !hasITRAlready) {
            docs = [...docs, 'ITR (Last 2 Years)'];
        }

        // Add 7/12 & 8A if checkbox is checked (Farm)
        const hasAgriDocsAlready = docs.some(d => d.includes('7/12') || d.includes('8A'));
        if (formData.hasFarmDocuments && !hasAgriDocsAlready) {
            docs = [...docs, '7/12 & 8A'];
        }

        // Final deduplication just in case
        docs = Array.from(new Set(docs));

        
        return docs;
    };

    const { currentUser, employeeData } = useAuth();

    const { state } = useLocation();
    const { id } = useParams();

    const [primaryLoanId, setPrimaryLoanId] = useState(null);
    // Live lookup state for Add Customer duplicate detection
    const [allCustomers, setAllCustomers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [showMatches, setShowMatches] = useState(false);
    const lookupTimerRef = useRef(null);
    const containerRef = useRef(null);

    // Contact autocomplete state for "Referred by" field
    const [allContacts, setAllContacts] = useState([]);
    const [contactMatches, setContactMatches] = useState([]);
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [referrerType, setReferrerType] = useState(''); // New state for contact type
    const contactLookupTimerRef = useRef(null);
    const contactContainerRef = useRef(null);

    useEffect(() => {
        // Load customers for live-lookup only when adding (no id and no state)
        if (!id && !state?.customerData) {
            const dbRef = ref(database);
            get(child(dbRef, `customers`)).then(snap => {
                if (!snap.exists()) return;
                const data = snap.val();
                const list = Object.entries(data).map(([key, v]) => {
                    const basic = v.customer_details?.basic_info || {};
                    return {
                        id: key,
                        name: basic.full_name || basic.name || '',
                        mobile1: basic.mobile || basic.mobile1 || '',
                        aadhar: basic.aadhar || basic.aadhaar || basic.aadhar_number || '',
                        city: basic.city_village || basic.city || '',
                        raw: v
                    };
                });
                setAllCustomers(list);
            }).catch(err => {});
        }

        // Click outside to close matches
        const handleDocClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowMatches(false);
            }
            if (contactContainerRef.current && !contactContainerRef.current.contains(e.target)) {
                setShowContactDropdown(false);
            }
        };
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, [state, id]);

    // Load contacts for "Referred by" autocomplete
    useEffect(() => {
        const loadContacts = async () => {
            try {
                const categories = ['dealers', 'agents', 'bankers', 'finance_executives', 'customers', 'key_persons', 'dsa', 'bni', 'social_media', 'others'];
                let all = [];
                let referrerNames = [];
                for (const cat of categories) {
                    const nodeRef = ref(database, `contacts/${cat}`);
                    const snap = await get(nodeRef);
                    if (!snap.exists()) continue;
                    const data = snap.val();
                    const list = Object.keys(data).map(id => ({
                        id,
                        name: data[id].dealerName || data[id].name || '',
                        businessName: data[id].businessName || '',
                        mobile1: data[id].mobile1 || data[id].mobile || '',
                        city: data[id].city || ''
                    }));
                    all = all.concat(list);
                    // Collect all names for referrer checking
                    referrerNames = referrerNames.concat(list.map(c => c.name.toLowerCase().trim()).filter(n => n));
                }
                setAllContacts(all);
                setExistingReferrers(referrerNames);
            } catch (err) {
                
            }
        };
        loadContacts();
    }, []);

    // Debounced contact autocomplete for "Referred by" field
    useEffect(() => {
        const q = (formData.referedby || '').trim();
        if (!q || q.length < 2) {
            setContactMatches([]);
            setShowContactDropdown(false);
            return;
        }

        if (contactLookupTimerRef.current) clearTimeout(contactLookupTimerRef.current);
        contactLookupTimerRef.current = setTimeout(() => {
            const needle = q.toLowerCase();
            const found = allContacts.filter(c =>
                (c.name || '').toLowerCase().includes(needle) ||
                (c.businessName || '').toLowerCase().includes(needle) ||
                (c.mobile1 || '').includes(needle)
            ).slice(0, 10);
            setContactMatches(found);
            setShowContactDropdown(found.length > 0);
        }, 300);

        return () => {
            if (contactLookupTimerRef.current) clearTimeout(contactLookupTimerRef.current);
        };
    }, [formData.referedby, allContacts]);

    // Detect if referrer is new (not in existing contacts)
    useEffect(() => {
        const referrerName = (formData.referedby || '').trim().toLowerCase();
        if (!referrerName) {
            setIsNewReferrer(false);
            setReferrerMobile('');
            return;
        }

        const isNew = !existingReferrers.includes(referrerName);
        setIsNewReferrer(isNew);

        // Reset mobile and type if referrer changes
        if (!isNew) {
            setReferrerMobile('');
            setReferrerType('');
        }
    }, [formData.referedby, existingReferrers]);

    // Separate effect: prefill when navigation state exists or when editing by id
    useEffect(() => {
        // If navigation passed customer data in state, use it to prefill the form
        if (state?.customerData) {
            
            const d = state.customerData;
            setFormData(prev => ({
                ...prev,
                name: d.name || d.full_name || '',
                mobile1: d.mobile1 || d.mobile || '',
                aadhar: d.aadhar || d.aadhaar || d.aadharNumber || d.identityNumber || '',
                mobile2: d.mobile2 || '',
                email: d.email || '',
                city: d.city || d.city_village || d.village || '',
                address: d.address || d.full_address || '',
                landmark: d.landmark || '',
                referedby: d.referedby || '',
                loanCategory: d.loanCategory || '',
                loanSubcategory: d.loanSubcategory || '',
                loanType: d.loanType || d.loanSubcategory || '',
                status: d.status || d.applicationStatus || ''
            }));

            return;
        }

        // If editing via URL param, fetch from DB
        if (id) {
            const dbRef = ref(database);
            get(child(dbRef, `customers/${id}`)).then(snap => {
                if (!snap.exists()) {
                    setToast({ type: 'error', message: 'Customer not found' });
                    return;
                }
                const rawData = snap.val();

                // Map from new nested structure to flat form state
                const basic = rawData.customer_details?.basic_info || {};
                const residence = rawData.customer_details?.residence_info || {};
                const occupation = rawData.customer_details?.occupation_info || {};
                const employment = occupation.employment_details || {};
                const farm = rawData.customer_details?.farm_income_info || {};
                const loanDetails = rawData.loan_application?.loan_details || {};
                const docs = rawData.loan_application?.documents || {};
                const vehicleHistory = rawData.vehicle_history || {};
                const existingLoans = rawData.existing_loans || {};
                const vehicleInfo = rawData.vehicle_info || {};

                // Primary Loan ID (first loan in the list)
                if (rawData.loan_application?.loan_ids?.length > 0) {
                    setPrimaryLoanId(rawData.loan_application.loan_ids[0]);
                }

                // FIX: Robustly determine Loan Type, Category, and Subcategory
                // 1. Try to find loanType from various legacy locations
                let detectedLoanType = loanDetails.loan_type ||
                    loanDetails.loan_subcategory ||
                    rawData.loanType ||
                    basic.loan_type ||
                    '';

                let detectedCategory = loanDetails.loan_category || '';
                let detectedSubcategory = loanDetails.loan_subcategory || simpleLoanType(detectedLoanType);

                // Helper to normalize loan type string if needed (though usually it's the key)
                function simpleLoanType(type) {
                    return type;
                }

                // 2. If Category is missing but we have a Loan Type, try to reverse-lookup
                if (!detectedCategory && detectedLoanType) {
                    // Iterate over LOAN_SUBCATEGORIES to find which category contains this loan type
                    for (const [cat, subcats] of Object.entries(LOAN_SUBCATEGORIES)) {
                        if (Object.keys(subcats).includes(detectedLoanType)) {
                            detectedCategory = cat;
                            detectedSubcategory = detectedLoanType;
                            break;
                        }
                    }
                }

                // 3. Robustly find Collected Documents from various legacy locations
                const detectedCollectedDocs = docs.collected_documents ||
                    rawData.documents?.collected_documents ||
                    rawData.collected_documents ||
                    {};

                // 4. Robustly find Extra Documents
                const detectedExtraDocs = docs.extra_documents ||
                    rawData.documents?.extra_documents ||
                    rawData.extra_documents ||
                    [];

                // 5. Robustly find Status
                const detectedStatus = loanDetails.status || rawData.applicationStatus || rawData.status || '';


                setFormData(prev => ({
                    ...prev,
                    // Basic
                    name: basic.full_name || '',
                    mobile1: basic.mobile || '',
                    mobile2: basic.mobile2 || '',
                    aadhar: basic.aadhar_number || '',
                    birthdate: basic.birthdate || '',
                    city: basic.city_village || '',
                    address: basic.full_address || '',
                    landmark: basic.landmark || '',
                    email: basic.email || '',
                    referedby: basic.referred_by || '',
                    requiredLoanAmount: basic.required_loan_amount || '',
                    // Residence
                    residenceType: residence.ownership_type || '',
                    houseCategory: residence.house_category || '',
                    numberOfRooms: residence.number_of_rooms || '',
                    houseOwnerName: residence.house_owner_name || '',
                    hasOwnerPanAadhar: residence.owner_has_pan_aadhar || false,
                    livesAtAadharAddress: residence.different_from_aadhar || false,
                    hasRentAgreement: residence.has_rent_agreement || false,
                    residenceRemark: residence.remark || '',
                    // Occupation
                    occupationType: occupation.type || basic.occupation_type || '',
                    companyName: employment.company_name || '',
                    designation: employment.designation || '',
                    jobYears: employment.years_employed || '',
                    salaryInBank: employment.salary_in_bank || false,
                    grossSalary: employment.gross_salary || '',
                    netSalary: employment.net_salary || '',
                    hasForm16: employment.has_form16 || false,
                    hasSalarySlips: employment.has_salary_slips || false,
                    hasBankStatement: employment.has_bank_statement || false,
                    hasPF: employment.has_pf || false,
                    businessName: employment.business_name || '',
                    businessYears: employment.years_in_business || '',
                    businessPlaceType: employment.business_place_type || '',
                    businessRentAmount: employment.business_rent_amount || '',
                    yearlyIncome: employment.yearly_income || '',
                    yearlyTurnover: employment.yearly_turnover || '',
                    hasShopAct: employment.has_shop_act || false,
                    hasUdyamReg: employment.has_udyam_reg || false,
                    hasBusinessProof: employment.has_business_proof || false,
                    itrFiled: employment.itr_filed || false,
                    itrIncome: employment.itr_income || '',
                    businessEntityType: employment.business_entity_type || '',
                    hasGST: employment.has_gst || false,
                    businessAddress: employment.business_address || '',
                    hasStockValuation: employment.has_stock_valuation || false,
                    stockValuationAmount: employment.stock_valuation_amount || '',
                    partners: rawData.partners || [],
                    // Farm
                    hasFarm: farm.has_farm || false,
                    farmArea: farm.farm_area || '',
                    farmOwnerName: farm.farm_owner_name || '',
                    hasFarmDocuments: farm.has_farm_documents || false,
                    hasExtraIncome: farm.has_extra_income || false,
                    extraIncomeSources: farm.extra_income_sources || [],
                    extraIncomeBreakdown: (() => {
                        const breakdown = farm.extra_income_breakdown || {};
                        const restored = {};
                        Object.keys(breakdown).forEach(key => {
                            // Restore known keys specific to Farm Income
                            if (key === 'Dairy _ Animals') restored['Dairy / Animals'] = breakdown[key];
                            else if (key === 'Stitching _ Small Biz') restored['Stitching / Small Biz'] = breakdown[key];
                            else restored[key] = breakdown[key];
                        });
                        return restored;
                    })(), // Load and restore keys
                    extraIncomeAmount: farm.extra_income_amount || '',
                    otherIncomeDescription: farm.other_income_description || '',
                    // Loan
                    loanCategory: detectedCategory,
                    loanSubcategory: detectedSubcategory,
                    loanPurpose: loanDetails.loan_purpose || '',
                    loanType: detectedLoanType,
                    status: detectedStatus,
                    priority: loanDetails.priority || 'Low',
                    remark: loanDetails.remark || '',
                    machineQuotation: loanDetails.machine_quotation || '',
                    // Documents
                    collectedDocuments: detectedCollectedDocs,
                    extraDocuments: detectedExtraDocs,
                    // Vehicle History
                    hasPreviousVehicle: vehicleHistory.has_previous_vehicle || false,
                    vehicles: vehicleHistory.vehicles || [],
                    // Existing Loans
                    existingLoan: existingLoans.has_existing_loan || false,
                    activeLoans: existingLoans.active_loans || [],
                    cibilScore: existingLoans.cibil_score || '',
                    // Vehicle Info (for vehicle loans)
                    vehicleRegistrationNumber: vehicleInfo.registration_number || '',
                    vehicleType: vehicleInfo.vehicle_type || '',
                    vehicleModel: vehicleInfo.model || '',
                    vehicleFuelType: vehicleInfo.fuel_type || '',
                    vehicleManufacturingYear: vehicleInfo.manufacturing_year || '',
                    vehicleNumberOfOwners: vehicleInfo.number_of_owners || '',
                    vehicleKmReading: vehicleInfo.km_reading || '',
                    vehiclePurchasePrice: vehicleInfo.purchase_price || '',
                    vehicleLoanAmountRequired: vehicleInfo.loan_amount_required || '',
                    // Hypothecation fields
                    vehicleHypothecation: vehicleInfo.hypothecation || '',
                    vehicleHypothecationBankName: vehicleInfo.hypothecation_bank_name || '',
                    vehicleHypothecationBalanceAmount: vehicleInfo.hypothecation_balance_amount || '',
                    // Insurance fields
                    vehicleInsurance: vehicleInfo.insurance || '',
                    vehicleInsuranceIdvAmount: vehicleInfo.insurance_idv_amount || '',
                    // New Vehicle Info
                    newVehicleType: vehicleInfo.new_vehicle_type || '',
                    newVehicleModel: vehicleInfo.new_vehicle_model || '',
                    newVehicleFuelType: vehicleInfo.new_vehicle_fuel_type || '',
                    newVehicleColor: vehicleInfo.new_vehicle_color || '',
                    newVehicleInvoicePrice: vehicleInfo.new_vehicle_invoice_price || '',
                    newVehicleOnRoadPrice: vehicleInfo.new_vehicle_onroad_price || '',
                    newVehicleUsageType: vehicleInfo.new_vehicle_usage_type || '',
                    newVehicleInsurance: vehicleInfo.new_vehicle_insurance || '',
                    newVehicleTax: vehicleInfo.new_vehicle_tax || '',
                    newVehicleTotal: vehicleInfo.new_vehicle_total || '',
                    newVehicleOther: vehicleInfo.new_vehicle_other || '',
                    hasHeavyLicense: vehicleInfo.has_heavy_license || false,
                    heavyLicenseDate: vehicleInfo.heavy_license_date || '',
                    hasTRLicense: vehicleInfo.has_tr_license || false,
                    trLicenseDate: vehicleInfo.tr_license_date || '',
                    // Co-Applicants
                    coApplicants: rawData.co_applicants || [],
                    // Home Loan
                    homeLoan: rawData.home_loan_details || prev.homeLoan,
                    // Used Commercial Vehicle
                    usedCommercialVehicle: rawData.used_commercial_vehicle || prev.usedCommercialVehicle,
                    // Assets
                    assets: rawData.assets || prev.assets,
                    // LAP Property Details
                    propertyType: rawData.lap_details?.property_type || '',
                    propertyUsage: rawData.lap_details?.property_usage || '',
                    propertyAddress: rawData.lap_details?.property_address || '',
                    propertyCity: rawData.lap_details?.city || '',
                    propertyPincode: rawData.lap_details?.pincode || '',
                    plotArea: rawData.lap_details?.plot_area || '',
                    constructionArea: rawData.lap_details?.construction_area || '',
                    agreementValue: rawData.lap_details?.agreement_value || '',
                    marketValue: rawData.lap_details?.market_value || '',
                    sellerName: rawData.lap_details?.seller_name || '',
                    projectName: rawData.lap_details?.project_name || '',
                    reraNumber: rawData.lap_details?.rera_number || '',
                    sellerMobile: rawData.lap_details?.seller_mobile || ''
                }));

                // Load referrer mobile if it exists
                if (basic.referred_by_mobile) {
                    setReferrerMobile(basic.referred_by_mobile);
                }
            }).catch(err => {
                setToast({ type: 'error', message: 'Failed to load customer data' });
            });
        }
    }, [state, id]);

    // Debounced live-lookup by name / mobile / aadhar
    useEffect(() => {
        if (id || state?.customerData) return; // Skip lookup when editing
        const q = formData.name.trim() || formData.mobile1.trim() || formData.aadhar.trim();
        if (!q || q.length < 3) {
            setMatches([]);
            setShowMatches(false);
            return;
        }

        if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
        lookupTimerRef.current = setTimeout(() => {
            const needle = q.toLowerCase();
            const found = allCustomers.filter(c =>
                (c.name || '').toLowerCase().includes(needle) ||
                (c.mobile1 || '').includes(needle) ||
                (c.aadhar || '').includes(needle)
            ).slice(0, 10);
            setMatches(found);
            setShowMatches(found.length > 0);
        }, 300);

        return () => {
            if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
        };
    }, [formData.name, formData.mobile1, formData.aadhar, allCustomers, id, state]);

    // Handler when user clicks a match to load that customer for editing
    const handleLoadMatch = (c) => {
        setShowMatches(false);
        navigate(`/customer/${c.id}/edit`, { replace: true });
    };

    // Helper function to sanitize Firebase keys (remove invalid characters)
    const sanitizeFirebaseKeys = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        const sanitized = {};
        Object.keys(obj).forEach(key => {
            // Replace invalid Firebase characters with underscores
            const sanitizedKey = key.replace(/[.#$/[\]]/g, '_');
            sanitized[sanitizedKey] = obj[key];
        });
        return sanitized;
    };

    // Update customer (when editing)
    const updateCustomer = async (customerId) => {
        // Determines loan amount based on category
        let loanAmount = '';
        if (formData.loanCategory === 'vehicle_loan') {
            loanAmount = formData.vehicleLoanAmountRequired || '';
        } else if (['home_loan', 'lap', 'business_finance'].includes(formData.loanCategory) && formData.homeLoan) {
            loanAmount = formData.homeLoan.requiredLoanAmount || '';
        } else if ([
            'personal_loan',
            'business_loan',
            'agriculture_loan',
            'education_loan',
            'government_scheme',
            'gold_loan'
        ].includes(formData.loanCategory)) {
            loanAmount = formData.requiredLoanAmount || '';
        }

        const customerData = {
            customer_details: {
                basic_info: {
                    full_name: formData.name,
                    mobile: formData.mobile1,
                    mobile2: formData.mobile2,
                    aadhar_number: formData.aadhar,
                    birthdate: formData.birthdate,
                    city_village: formData.city,
                    full_address: formData.address,
                    landmark: formData.landmark,
                    email: formData.email,
                    referred_by: formData.referedby,
                    referred_by_mobile: referrerMobile || '',
                    required_loan_amount: formData.requiredLoanAmount
                },
                residence_info: {
                    ownership_type: formData.residenceType,
                    house_category: formData.houseCategory,
                    number_of_rooms: formData.numberOfRooms,
                    house_owner_name: formData.houseOwnerName,
                    owner_has_pan_aadhar: formData.hasOwnerPanAadhar,
                    different_from_aadhar: formData.livesAtAadharAddress,
                    has_rent_agreement: formData.hasRentAgreement || false,
                    remark: formData.residenceRemark || ''
                },
                occupation_info: {
                    type: formData.occupationType,
                    employment_details: formData.occupationType === 'Job' ? {
                        company_name: formData.companyName,
                        designation: formData.designation,
                        years_employed: formData.jobYears,
                        salary_in_bank: formData.salaryInBank,
                        gross_salary: formData.grossSalary,
                        net_salary: formData.netSalary,
                        has_form16: formData.hasForm16,
                        has_salary_slips: formData.hasSalarySlips,
                        has_bank_statement: formData.hasBankStatement,
                        has_pf: formData.hasPF
                    } : {
                        business_name: formData.businessName,
                        years_in_business: formData.businessYears,
                        business_place_type: formData.businessPlaceType,
                        business_rent_amount: formData.businessRentAmount,
                        yearly_income: formData.yearlyIncome,
                        yearly_turnover: formData.yearlyTurnover,
                        has_shop_act: formData.hasShopAct,
                        has_udyam_reg: formData.hasUdyamReg,
                        has_business_proof: formData.hasBusinessProof,
                        itr_filed: formData.itrFiled,
                        itr_income: formData.itrIncome,
                        business_entity_type: formData.businessEntityType,
                        has_gst: formData.hasGST,
                        business_address: formData.businessAddress,
                        has_stock_valuation: formData.hasStockValuation,
                        stock_valuation_amount: formData.stockValuationAmount
                    }
                },
                farm_income_info: {
                    has_farm: formData.hasFarm,
                    farm_area: formData.farmArea,
                    farm_owner_name: formData.farmOwnerName,
                    has_farm_documents: formData.hasFarmDocuments,
                    has_extra_income: formData.hasExtraIncome,
                    extra_income_sources: formData.extraIncomeSources,
                    extra_income_breakdown: sanitizeFirebaseKeys(formData.extraIncomeBreakdown), // Sanitize keys before saving
                    extra_income_amount: formData.extraIncomeAmount,
                    other_income_description: formData.otherIncomeDescription
                }
            },
            loan_application: {
                loan_details: {
                    loan_category: formData.loanCategory,
                    loan_subcategory: formData.loanSubcategory,
                    loan_purpose: formData.loanPurpose,
                    loan_type: formData.loanType,
                    loan_amount: loanAmount,
                    status: formData.status,
                    priority: formData.priority || 'Low',
                    remark: formData.remark,
                    machine_quotation: formData.machineQuotation
                },
                documents: {
                    collected_documents: formData.collectedDocuments,
                    extra_documents: formData.extraDocuments
                }
            },
            vehicle_history: {
                has_previous_vehicle: formData.hasPreviousVehicle,
                vehicles: formData.vehicles
            },
            existing_loans: {
                has_existing_loan: formData.existingLoan,
                active_loans: formData.activeLoans,
                cibil_score: formData.cibilScore
            },
            vehicle_info: {
                registration_number: formData.vehicleRegistrationNumber,
                vehicle_type: formData.vehicleType,
                model: formData.vehicleModel,
                fuel_type: formData.vehicleFuelType,
                manufacturing_year: formData.vehicleManufacturingYear,
                number_of_owners: formData.vehicleNumberOfOwners,
                km_reading: formData.vehicleKmReading,
                purchase_price: formData.vehiclePurchasePrice,
                loan_amount_required: formData.vehicleLoanAmountRequired,
                // Hypothecation fields
                hypothecation: formData.vehicleHypothecation,
                hypothecation_bank_name: formData.vehicleHypothecationBankName,
                hypothecation_balance_amount: formData.vehicleHypothecationBalanceAmount,
                // Insurance fields
                insurance: formData.vehicleInsurance,
                insurance_idv_amount: formData.vehicleInsuranceIdvAmount,
                // New vehicle fields
                new_vehicle_type: formData.newVehicleType,
                new_vehicle_model: formData.newVehicleModel,
                new_vehicle_fuel_type: formData.newVehicleFuelType,
                new_vehicle_color: formData.newVehicleColor,
                new_vehicle_invoice_price: formData.newVehicleInvoicePrice,
                new_vehicle_onroad_price: formData.newVehicleOnRoadPrice,
                new_vehicle_usage_type: formData.newVehicleUsageType,
                new_vehicle_insurance: formData.newVehicleInsurance,
                new_vehicle_tax: formData.newVehicleTax,
                new_vehicle_total: formData.newVehicleTotal,
                new_vehicle_other: formData.newVehicleOther,
                has_heavy_license: formData.hasHeavyLicense,
                heavy_license_date: formData.heavyLicenseDate,
                has_tr_license: formData.hasTRLicense,
                tr_license_date: formData.trLicenseDate
            },
            co_applicants: formData.coApplicants,
            partners: formData.partners,
            assets: formData.assets,
            updated_at: new Date().toISOString(),
            updated_by: currentUser?.uid || 'unknown',
            applicationStatus: formData.status // For consistency with handleStatusChange
        };

        // Add home loan details if applicable
        // Add home loan details if applicable (for Home Loan or LAP)
        if (formData.loanCategory === 'home_loan' || formData.loanCategory === 'lap') {
            customerData.home_loan_details = formData.homeLoan;
        }

        // Add used commercial vehicle details if applicable
        if (formData.loanSubcategory === 'used_commercial') {
            customerData.used_commercial_vehicle = formData.usedCommercialVehicle;
        }

        // Add LAP specific details if applicable
        if (formData.loanCategory === 'lap') {
            customerData.lap_details = {
                property_type: formData.propertyType,
                property_usage: formData.propertyUsage,
                property_address: formData.propertyAddress,
                city: formData.propertyCity,
                pincode: formData.propertyPincode,
                plot_area: formData.plotArea,
                construction_area: formData.constructionArea,
                agreement_value: formData.agreementValue,
                market_value: formData.marketValue,
                seller_name: formData.sellerName,
                project_name: formData.projectName,
                rera_number: formData.reraNumber,
                seller_mobile: formData.sellerMobile
            };
        }

        // Add Home Loan details (also used for Business Finance and other loan types)
        if (formData.homeLoan) {
            customerData.home_loan_details = formData.homeLoan;
        }

        // Add Co-Applicants
        if (formData.coApplicants && formData.coApplicants.length > 0) {
            customerData.co_applicants = formData.coApplicants;
        }

        // Calculate and add pending documents
        const calculatePendingDocuments = (requiredDocs, collectedDocuments, extraDocuments) => {
            const pending = [];

            // Check required documents
            if (requiredDocs && Array.isArray(requiredDocs)) {
                requiredDocs.forEach(docLabel => {
                    const docId = docLabel.replace(/[^a-zA-Z0-9]/g, '');
                    const coDocId = `co_${docId}`;

                    // Check if document is not collected
                    if (!collectedDocuments[docId] && !collectedDocuments[coDocId]) {
                        pending.push(docLabel);
                    }
                });
            }

            // Check extra documents that are not collected
            if (extraDocuments && Array.isArray(extraDocuments)) {
                extraDocuments.forEach(doc => {
                    if (!doc.collected) {
                        pending.push(doc.name);
                    }
                });
            }

            return pending;
        };

        const pendingDocuments = calculatePendingDocuments(
            getRequiredDocs(),
            formData.collectedDocuments || {},
            formData.extraDocuments || []
        );
        customerData.pending_documents = pendingDocuments;

        await update(ref(database, `customers/${customerId}`), customerData);

        // Update or create birthdate entry in separate birthdates node
        if (formData.birthdate) {
            // First, check if a birthdate entry already exists for this customer
            const birthdatesRef = ref(database, 'birthdates');
            const birthdatesSnapshot = await get(birthdatesRef);

            let existingBirthdateId = null;
            if (birthdatesSnapshot.exists()) {
                const birthdatesData = birthdatesSnapshot.val();
                // Find existing birthdate entry for this customer
                Object.entries(birthdatesData).forEach(([id, data]) => {
                    if (data.customerId === customerId) {
                        existingBirthdateId = id;
                    }
                });
            }

            const birthdateData = {
                customerId: customerId,
                customerName: formData.name,
                mobile: formData.mobile1,
                birthdate: formData.birthdate,
                updatedAt: new Date().toISOString()
            };

            if (existingBirthdateId) {
                // Update existing birthdate entry
                await update(ref(database, `birthdates/${existingBirthdateId}`), birthdateData);
            } else {
                // Create new birthdate entry
                const generateCustomId = (prefix) => {
                    const randomPart = Math.random().toString(36).substring(2, 14);
                    return `${prefix}${randomPart}`;
                };
                const birthdateId = generateCustomId('bd');
                birthdateData.createdAt = new Date().toISOString();
                await set(ref(database, `birthdates/${birthdateId}`), birthdateData);
            }
        }

        // Update loan if exists
        if (primaryLoanId) {
            await update(ref(database, `loans/${primaryLoanId}`), {
                loan_category: formData.loanCategory,
                loan_subcategory: formData.loanSubcategory,
                loan_purpose: formData.loanPurpose,
                loan_type: formData.loanType,
                loan_amount: loanAmount,
                status: formData.status,
                priority: formData.priority,
                remark: formData.remark,
                machine_quotation: formData.machineQuotation,
                updated_at: new Date().toISOString()
            });
        }

        // Save new referrer as a contact in the correct category
        if (isNewReferrer && formData.referedby && formData.referedby.trim() && referrerMobile && referrerMobile.length === 10 && referrerType) {
            const generateContactId = (prefix) => {
                const randomPart = Math.random().toString(36).substring(2, 14);
                return `${prefix}${randomPart}`;
            };

            // Map type to category
            const typeToCategory = {
                dealer: 'dealers',
                agent: 'agents',
                banker: 'bankers',
                finance_executive: 'finance_executives',
                customer: 'customers',
                key_person: 'key_persons',
                dsa: 'dsa',
                bni: 'bni',
                social_media: 'social_media',
                others: 'others'
            };

            const category = typeToCategory[referrerType] || 'others';
            const getPrefixForType = (type) => {
                const prefixMap = {
                    'dealer': 'DEALER',
                    'agent': 'AGENT',
                    'banker': 'BANKER',
                    'finance_executive': 'FINANCE',
                    'customer': 'CUSTOMER',
                    'key_person': 'KEY',
                    'dsa': 'DSA',
                    'bni': 'BNI',
                    'social_media': 'SOCIAL',
                    'others': 'OTHER'
                };
                return prefixMap[type] || 'OTHER';
            };
            const prefix = getPrefixForType(referrerType);
            const contactId = generateContactId(prefix);

            const contactData = {
                id: contactId,
                dealerId: contactId,
                dealerName: formData.referedby.trim(),
                name: formData.referedby.trim(),
                businessName: '', // Optional, not collected here
                mobile1: referrerMobile,
                mobile: referrerMobile,
                dealerType: referrerType,
                createdAt: new Date().toISOString(),
                isActive: true,
                addedFrom: 'customer_form',
                addedByCustomer: customerId
            };

            await set(ref(database, `contacts/${category}/${contactId}`), contactData);
        }

        return customerId;
    };

    // Add new customer (uses instantSaveService)
    const addCustomer = async (customerData) => {
        // Dynamic import to avoid circular dependency issues
        const { addCustomer: instantAddCustomer } = await import('../services/instantSaveService');
        return instantAddCustomer(customerData, currentUser, employeeData, referrerMobile, referrerType);
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);

        try {
            // Check for validation errors
            if (Object.keys(errors).length > 0) {
                setToast({ type: 'error', message: 'Please fix the validation errors before submitting' });
                setLoading(false);
                return;
            }

            // Check if new referrer has mobile number and type
            if (isNewReferrer && formData.referedby.trim()) {
                if (!referrerMobile || referrerMobile.length !== 10) {
                    setToast({ type: 'error', message: 'Please enter a valid 10-digit mobile number for the new referrer' });
                    setLoading(false);
                    return;
                }
                if (!referrerType) {
                    setToast({ type: 'error', message: 'Please select a contact type for the new referrer' });
                    setLoading(false);
                    return;
                }
            }

            if (id) {
                // Editing existing customer
                await updateCustomer(id);
            } else {
                // Adding new customer
                // Add required documents to formData
                const formDataWithDocs = {
                    ...formData,
                    requiredDocuments: getRequiredDocs()
                };
                await addCustomer(formDataWithDocs);
            }

            // Show success popup and redirect
            setToast({
                type: 'success',
                message: id ? 'Customer details updated successfully' : 'Customer details saved successfully'
            });
            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                navigate('/customer-list');
            }, 1500);
        } catch (err) {
            
            setToast({ type: 'error', message: err.message || 'Failed to save customer. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-full mx-auto">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="bg-white p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1 w-full md:w-auto">


                            <div className="flex items-center gap-4">
                                <SecondaryButton
                                    onClick={() => navigate('/customer-list')}
                                    className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-all border-none shadow-none flex items-center justify-center -ml-2"
                                    title="Back to List"
                                >
                                    <FaArrowLeft className="text-gray-600 text-lg sm:text-xl" />
                                </SecondaryButton>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                                        <FaUserPlus className="text-white text-base sm:text-lg" />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                                        {(id || state?.customerData) ? 'Edit Customer' : 'Add New Customer'}
                                    </h1>
                                </div>
                            </div>
                            <p className="text-gray-600 ml-10 sm:ml-12 flex items-center gap-2 text-xs sm:text-sm">
                                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Enter complete customer profile and loan requirements
                            </p>
                        </div>
                    </div>
                </div>      {/* Messages */}
                {/* Messages - Replaced with Toast */}

                {/* Success Modal - Replaced with Toast */}

                <form onSubmit={handleSubmit} className="p-4 sm:p-5 lg:p-6 space-y-4">

                    {/* 0. Loan Category Selection */}
                    <LoanCategorySection
                        formData={formData}
                        handleCategoryChange={handleCategoryChange}
                        handleSubcategoryChange={handleSubcategoryChange}
                        handleInputChange={handleChange}
                    />

                    {/* New Vehicle Details Section */}
                    <NewVehicleSection
                        formData={formData}
                        handleChange={handleChange}
                    />

                    {/* Vehicle Details Section - Used Vehicle Loans */}
                    <UsedVehicleSection
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                    />

                    {/* 1. Basic Customer Information */}
                    <BasicInfoSection
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        containerRef={containerRef}
                        showMatches={showMatches}
                        matches={matches}
                        handleLoadMatch={handleLoadMatch}
                        contactContainerRef={contactContainerRef}
                        showContactDropdown={showContactDropdown}
                        contactMatches={contactMatches}
                        handleContactSelect={handleContactSelect}
                        isNewReferrer={isNewReferrer}
                        referrerMobile={referrerMobile}
                        setReferrerMobile={setReferrerMobile}
                        referrerType={referrerType}
                        setReferrerType={setReferrerType}
                        calculateAge={calculateAge}
                    />

                    {/* 2. Residence Information */}
                    <ResidenceSection
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                    />

                    {/* 3. Occupation Information */}
                    <OccupationSection
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        addPartner={addPartner}
                        removePartner={removePartner}
                        handlePartnerChange={handlePartnerChange}
                    />

                    {/* 4. Farming & Extra Income */}
                    <FarmIncomeSection
                        formData={formData}
                        handleChange={handleChange}
                        handleExtraIncomeSourceChange={handleExtraIncomeSourceChange}
                        handleExtraIncomeAmountChange={handleExtraIncomeAmountChange}
                    />


                    {/* 5. Co-Applicants */}
                    <CoApplicantSection
                        formData={formData}
                        handleCoApplicantChange={handleCoApplicantChange}
                        addCoApplicant={addCoApplicant}
                        removeCoApplicant={removeCoApplicant}
                    />

                    {/* 6. Current Vehicle Details (for vehicle loans) */}
                    <VehicleDetailsSection
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                    />

                    {/* 6. Vehicle History (only for vehicle loans) */}
                    {formData.loanCategory === 'vehicle_loan' && (
                        <VehicleHistorySection
                            formData={formData}
                            handleChange={handleChange}
                            handleVehicleChange={handleVehicleChange}
                            addVehicle={addVehicle}
                            removeVehicle={removeVehicle}
                        />
                    )}

                    {/* 7. Current Loans & CIBIL */}
                    <LoansSection
                        formData={formData}
                        errors={errors}
                        handleChange={handleChange}
                        handleLoanChange={handleLoanChange}
                        addLoan={addLoan}
                        removeLoan={removeLoan}
                    />

                    {/* Home Loan Details Section */}
                    <HomeLoanSection
                        formData={formData}
                        handleHomeLoanChange={handleHomeLoanChange}
                    />



                    {/* Used Commercial Vehicle Loan Form */}
                    {formData.loanSubcategory === 'used_commercial' && (
                        <UsedCommercialVehicleFormSections
                            formData={formData}
                            handleUsedCommercialVehicleChange={handleUsedCommercialVehicleChange}
                            addFleetLoan={addFleetLoan}
                            removeFleetLoan={removeFleetLoan}
                            handleFleetLoanChange={handleFleetLoanChange}
                            handleOtherIncomeSourceChange={handleOtherIncomeSourceChange}
                        />
                    )}

                    {/* Assets & Liabilities Section */}
                    <AssetsLiabilitiesSection
                        formData={formData}
                        handleAssetChange={handleAssetChange}
                    />

                    {/* 8. Application Status */}
                    <ApplicationStatusSection
                        formData={formData}
                        handleChange={handleChange}
                    />

                    {/* 9. Required Documents Checklist */}
                    <DocumentsSection
                        formData={formData}
                        handleChange={handleChange}
                        getRequiredDocs={getRequiredDocs}
                        addExtraDocument={addExtraDocument}
                        removeExtraDocument={removeExtraDocument}
                        handleExtraDocumentCheck={handleExtraDocumentCheck}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-center mt-8 mb-6">
                        <button type="submit" disabled={loading}
                            className="w-full sm:w-80 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (id || state?.customerData) ? 'Update Customer Details' : 'Save Customer Details'}
                        </button>
                    </div>

                </form>
            </div>

            {/* Add Document Modal */}
            <AddDocumentModal
                showAddDocModal={showAddDocModal}
                setShowAddDocModal={setShowAddDocModal}
                newDocName={newDocName}
                setNewDocName={setNewDocName}
                confirmAddExtraDocument={confirmAddExtraDocument}
            />
        </div >
    );
};

export default CustomerForm;
