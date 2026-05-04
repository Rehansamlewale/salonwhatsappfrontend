import { ref, set } from "firebase/database";
import { database } from "../firebase";

// Helper function to generate custom IDs with prefix
const generateCustomId = (prefix) => {
    // Generate a random string (12 characters)
    const randomPart = Math.random().toString(36).substring(2, 14);
    return `${prefix}${randomPart}`;
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

// Helper function to calculate pending documents
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

export const addCustomer = async (formData, currentUser, employeeData, referrerMobile, referrerType) => {
    // Generate a custom customer ID with 'cust' prefix
    const customerId = generateCustomId('cust');

    // Construct the customer data object based on formData
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
                    itr_filed: formData.itrFiled,
                    itr_income: formData.itrIncome,
                    // Business Finance
                    business_entity_type: formData.businessEntityType,
                    has_gst: formData.hasGST,
                    business_address: formData.businessAddress,
                    has_stock_valuation: formData.hasStockValuation,
                    stock_valuation_amount: formData.stockValuationAmount,
                    partners: formData.partners
                }
            },
            farm_income_info: {
                has_farm: formData.hasFarm,
                farm_area: formData.farmArea,
                farm_owner_name: formData.farmOwnerName,
                has_farm_documents: formData.hasFarmDocuments,
                has_extra_income: formData.hasExtraIncome,
                extra_income_sources: formData.extraIncomeSources,
                extra_income_breakdown: sanitizeFirebaseKeys(formData.extraIncomeBreakdown || {}), // Sanitize keys
                extra_income_amount: formData.extraIncomeAmount,
                other_income_description: formData.otherIncomeDescription
            }
        },
        loan_application: {
            loan_details: {
                loan_category: formData.loanCategory,
                loan_subcategory: formData.loanSubcategory,
                loan_type: formData.loanType,
                status: 'pending', // Default status for new application
                priority: formData.priority || 'Low', // Default priority
                remark: formData.remark || ''
            },
            documents: {
                collected_documents: formData.collectedDocuments || {},
                extra_documents: formData.extraDocuments || []
            }
        },
        vehicle_history: {
            has_previous_vehicle: formData.hasPreviousVehicle,
            vehicles: formData.vehicles || []
        },
        existing_loans: {
            has_existing_loan: formData.existingLoan,
            active_loans: formData.activeLoans || [],
            cibil_score: formData.cibilScore
        },
        vehicle_info: {
            registration_number: formData.vehicleRegistrationNumber,
            vehicle_type: formData.vehicleType,
            model: formData.vehicleModel,
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
        assets: formData.assets || {},
        co_applicants: formData.coApplicants || [],
        partners: formData.partners || [],
        created_at: new Date().toISOString(),
        created_by: currentUser?.uid || 'unknown',
        created_by_email: currentUser?.email || 'unknown',
        updated_at: new Date().toISOString()
    };

    // Add home loan details if applicable (also used for Business Finance and other loan types)
    if (formData.homeLoan && Object.keys(formData.homeLoan).some(key => formData.homeLoan[key])) {
        customerData.home_loan_details = formData.homeLoan;
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

    // Add used commercial vehicle details if applicable
    if (formData.loanSubcategory === 'used_commercial') {
        customerData.used_commercial_vehicle = formData.usedCommercialVehicle;
    }

    // Add customerId to the data object
    customerData.customerId = customerId;

    // Calculate and add pending documents
    const pendingDocuments = calculatePendingDocuments(
        formData.requiredDocuments || [],
        formData.collectedDocuments || {},
        formData.extraDocuments || []
    );
    customerData.pending_documents = pendingDocuments;

    // Save the new customer data using custom ID
    const customerRef = ref(database, `customers/${customerId}`);
    await set(customerRef, customerData);

    // Save birthdate to separate birthdates node if provided
    if (formData.birthdate) {
        const birthdateId = generateCustomId('bd');
        const birthdateData = {
            customerId: customerId,
            customerName: formData.name,
            mobile: formData.mobile1,
            birthdate: formData.birthdate,
            createdAt: new Date().toISOString()
        };
        const birthdateRef = ref(database, `birthdates/${birthdateId}`);
        await set(birthdateRef, birthdateData);
    }

    // Helper function to determine contact category node based on type
    const getContactCategory = (dealerType) => {
        const typeMap = {
            'dealer': 'dealers',
            'agent': 'agents',
            'banker': 'bankers',
            'finance_executive': 'finance_executives',
            'customer': 'customers',
            'key_person': 'key_persons',
            'dsa': 'dsa',
            'bni': 'bni',
            'social_media': 'social_media',
            'others': 'others'
        };
        return typeMap[dealerType] || 'others';
    };

    // Save new referrer as a contact if mobile is provided
    if (formData.referedby && formData.referedby.trim() && referrerMobile && referrerMobile.length === 10) {
        // Use provided referrerType or default to 'others'
        const contactType = referrerType || 'others';
        const contactCategory = getContactCategory(contactType);
        
        // Use a more appropriate prefix based on the type (matching AddContact.js)
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
        const prefix = getPrefixForType(contactType);
        const contactId = generateCustomId(prefix);
        
        const contactData = {
            id: contactId,
            dealerId: contactId,
            dealerName: formData.referedby.trim(),
            name: formData.referedby.trim(),
            businessName: '', // Optional, not collected here
            mobile1: referrerMobile,
            mobile: referrerMobile,
            dealerType: contactType,
            createdAt: new Date().toISOString(),
            isActive: true,
            addedFrom: 'customer_form',
            addedByCustomer: customerId
        };
        const contactRef = ref(database, `contacts/${contactCategory}/${contactId}`);
        await set(contactRef, contactData);
    }


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

    // Generate custom loan ID with 'loan' prefix
    const loanId = generateCustomId('loan');

    // Create a new loan entry in the 'loans' node
    const loanData = {
        loanId: loanId,
        customerId: customerId,
        customerName: formData.name,
        loanCategory: formData.loanCategory,
        loanSubcategory: formData.loanSubcategory,
        loanType: formData.loanType,
        loanAmount: loanAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const loanRef = ref(database, `loans/${loanId}`);
    await set(loanRef, loanData);

    // Create a new vehicle entry in the 'vehicles' node if vehicle data exists
    // Check for either existing vehicle (Vehicle Loan) or new vehicle details
    const hasVehicleData = formData.vehicleRegistrationNumber ||
        formData.vehicleModel ||
        formData.newVehicleModel ||
        formData.loanCategory === 'vehicle_loan';

    if (hasVehicleData) {
        // Generate custom vehicle ID with 'veh' prefix
        const vehicleId = generateCustomId('veh');

        const vehicleData = {
            vehicleId: vehicleId,
            customerId: customerId,
            loanId: loanId,
            customerName: formData.name,

            // Common Fields
            vehicleType: formData.vehicleType || formData.newVehicleType || '',
            model: formData.vehicleModel || formData.newVehicleModel || '',

            // Existing Vehicle Specific
            registrationNumber: formData.vehicleRegistrationNumber || '',
            manufacturingYear: formData.vehicleManufacturingYear || '',
            numberOfOwners: formData.vehicleNumberOfOwners || '',
            kmReading: formData.vehicleKmReading || '',
            purchasePrice: formData.vehiclePurchasePrice || '',

            // New Vehicle Specific
            color: formData.newVehicleColor || '',
            invoicePrice: formData.newVehicleInvoicePrice || '',
            onRoadPrice: formData.newVehicleOnRoadPrice || '',
            usageType: formData.newVehicleUsageType || '',

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const vehicleRef = ref(database, `vehicles/${vehicleId}`);
        await set(vehicleRef, vehicleData);
    }

    return customerId;
};
