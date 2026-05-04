export const printCustomerDetails = (customer) => {
    if (!customer) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print');
        return;
    }

    // Extract data from both raw Firebase structure and flattened properties
    const {
        customer_details = {},
        loanType,
        vehicle_info = {},
        financeScheme = {},
        assets = {},
        name,
        mobile1,
        mobile2,
        email,
        city,
        address,
        landmark,
        employmentType,
        commission
    } = customer;

    const basic = customer_details.basic_info || {};
    const residence = customer_details.residence_info || {};
    const occupation = customer_details.occupation_info || {};
    const salariedDetails = occupation.salaried_job_details || {};
    const selfEmployedDetails = occupation.self_employed_details || {};


    // Helper to render a field only if value exists
    const Field = ({ label, value }) => {
        if (!value || value === 'undefined' || value === 'null') return '';
        return `
            <div class="field">
                <span class="label">${label}:</span>
                <span class="value">${value}</span>
            </div>
        `;
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Customer Details - ${name || basic.full_name || 'View'}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; line-height: 1.4; color: #333; }
                h1, h2, h3 { color: #1a365d; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
                h1 { text-align: center; margin-bottom: 30px; border: none; font-size: 24px; }
                .section { margin-bottom: 25px; page-break-inside: avoid; }
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                .field { margin-bottom: 5px; }
                .label { font-weight: 600; color: #4a5568; font-size: 13px; }
                .value { font-size: 14px; margin-left: 5px; }
                .tag { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #ebf8ff; color: #2c5282; }
                
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                    @page { margin: 1.5cm; }
                }
            </style>
        </head>
        <body>
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="border: none; margin: 0;">Whatsapp connection</h2>
                <div style="font-size: 12px; color: #666;">Customer Profile Report</div>
                <div style="margin-top: 10px;">
                    <span class="tag">${loanType || 'Loan Application'}</span>
                </div>
            </div>

            <div class="section">
                <h3>👤 Basic Information</h3>
                <div class="grid">
                    ${Field({ label: 'Full Name', value: name || basic.full_name })}
                    ${Field({ label: 'Mobile', value: mobile1 || basic.mobile })}
                    ${Field({ label: 'Alternate Mobile', value: mobile2 || basic.mobile2 })}
                    ${Field({ label: 'Email', value: email || basic.email })}
                    ${Field({ label: 'Date of Birth', value: basic.dob })}
                    ${Field({ label: 'Age', value: basic.age ? `${basic.age} years` : '' })}
                    ${Field({ label: 'Marital Status', value: basic.marital_status })}
                    ${Field({ label: 'Gender', value: basic.gender })}
                    ${Field({ label: 'Father\'s Name', value: basic.father_name })}
                    ${Field({ label: 'Mother\'s Name', value: basic.mother_name })}
                    ${Field({ label: 'Spouse Name', value: basic.spouse_name })}
                    ${Field({ label: 'Education', value: basic.education })}
                    ${Field({ label: 'Religion', value: basic.religion })}
                    ${Field({ label: 'Aadhaar Number', value: basic.aadhar_number })}
                    ${Field({ label: 'PAN Number', value: basic.pan_number })}
                    ${Field({ label: 'Cast/Category', value: basic.cast_category })}
                    ${Field({ label: 'Village/City', value: city || basic.city_village })}
                    ${Field({ label: 'Taluka', value: basic.taluka })}
                    ${Field({ label: 'District', value: basic.district })}
                    ${Field({ label: 'State', value: basic.state })}
                    ${Field({ label: 'Pincode', value: basic.pincode })}
                    ${Field({ label: 'Address', value: address || basic.full_address })}
                    ${Field({ label: 'Landmark', value: landmark || basic.landmark })}
                    ${Field({ label: 'Reference Name', value: basic.reference_name })}
                    ${Field({ label: 'Referee Mobile', value: basic.reference_mobile })}
                    ${Field({ label: 'Reference Relation', value: basic.reference_relation })}
                </div>
            </div>

            ${(residence.residence_type || residence.current_address || residence.permanent_address) ? `
            <div class="section">
                <h3>🏠 Residence Information</h3>
                <div class="grid">
                    ${Field({ label: 'Residence Type', value: residence.residence_type })}
                    ${Field({ label: 'Current Address', value: residence.current_address })}
                    ${Field({ label: 'Permanent Address', value: residence.permanent_address })}
                    ${Field({ label: 'Years at Current Address', value: residence.years_at_current_address })}
                    ${Field({ label: 'House Category', value: residence.house_category })}
                    ${Field({ label: 'Ownership Status', value: residence.ownership_status })}
                    ${Field({ label: 'Different from Aadhar Address', value: residence.different_from_aadhar ? 'Yes' : residence.different_from_aadhar === false ? 'No' : '' })}
                    ${Field({ label: 'Rent Agreement', value: residence.rent_agreement ? 'Yes' : residence.rent_agreement === false ? 'No' : '' })}
                    ${Field({ label: 'Locality Type', value: residence.locality_type })}
                    ${Field({ label: 'Number of Family Members', value: residence.number_of_family_members })}
                </div>
            </div>
            ` : ''}

            ${(occupation.occupation_type || employmentType) ? `
            <div class="section">
                <h3>💼 Occupation Details</h3>
                <div class="grid">
                    ${Field({ label: 'Occupation Type', value: employmentType || occupation.occupation_type })}
                    ${Field({ label: 'Primary Income Source', value: occupation.primary_income_source })}
                    ${Field({ label: 'Annual Income', value: occupation.annual_income ? `₹${occupation.annual_income}` : '' })}
                    ${Field({ label: 'Monthly Income', value: occupation.monthly_income ? `₹${occupation.monthly_income}` : '' })}
                    
                    ${salariedDetails.designation || salariedDetails.employer_name ? `
                        <div style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <strong style="color: #2d3748;">Salaried Job Details:</strong>
                        </div>
                        ${Field({ label: 'Designation', value: salariedDetails.designation })}
                        ${Field({ label: 'Employer Name', value: salariedDetails.employer_name })}
                        ${Field({ label: 'Employer Address', value: salariedDetails.employer_address })}
                        ${Field({ label: 'Work Experience', value: salariedDetails.work_experience ? `${salariedDetails.work_experience} years` : '' })}
                        ${Field({ label: 'Monthly Salary', value: salariedDetails.monthly_salary ? `₹${salariedDetails.monthly_salary}` : '' })}
                        ${Field({ label: 'Salary Credited to Bank', value: salariedDetails.salary_credited_to_bank })}
                        ${Field({ label: 'Bank Name', value: salariedDetails.bank_name })}
                        ${Field({ label: 'Job Type', value: salariedDetails.job_type })}
                    ` : ''}
                    
                    ${selfEmployedDetails.business_name || selfEmployedDetails.business_type ? `
                        <div style="grid-column: 1 / -1; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <strong style="color: #2d3748;">Self-Employed/Business Details:</strong>
                        </div>
                        ${Field({ label: 'Business Name', value: selfEmployedDetails.business_name })}
                        ${Field({ label: 'Business Type', value: selfEmployedDetails.business_type })}
                        ${Field({ label: 'Business Address', value: selfEmployedDetails.business_address })}
                        ${Field({ label: 'Years in Business', value: selfEmployedDetails.years_in_business ? `${selfEmployedDetails.years_in_business} years` : '' })}
                        ${Field({ label: 'Monthly Income', value: selfEmployedDetails.monthly_income ? `₹${selfEmployedDetails.monthly_income}` : '' })}
                        ${Field({ label: 'Annual Turnover', value: selfEmployedDetails.annual_turnover ? `₹${selfEmployedDetails.annual_turnover}` : '' })}
                        ${Field({ label: 'GST Number', value: selfEmployedDetails.gst_number })}
                        ${Field({ label: 'Business Ownership', value: selfEmployedDetails.business_ownership })}
                    ` : ''}
                </div>
            </div>
            ` : ''}

            ${(assets.home || assets.vehicle || assets.total_assets || assets.total_liabilities) ? `
            <div class="section">
                <h3>💰 Assets & Liabilities</h3>
                <div class="grid">
                    ${Field({ label: 'Total Assets', value: assets.total_assets ? `₹${assets.total_assets}` : '' })}
                    ${Field({ label: 'Total Liabilities', value: assets.total_liabilities ? `₹${assets.total_liabilities}` : '' })}
                    ${Field({ label: 'Net Worth', value: assets.net_worth ? `₹${assets.net_worth}` : '' })}
                    ${Field({ label: 'Home Value', value: assets.home ? `₹${assets.home}` : '' })}
                    ${Field({ label: 'Vehicle Value', value: assets.vehicle ? `₹${assets.vehicle}` : '' })}
                    ${Field({ label: 'Farm Value', value: assets.farm ? `₹${assets.farm}` : '' })}
                    ${Field({ label: 'Gold Value', value: assets.gold ? `₹${assets.gold}` : '' })}
                    ${Field({ label: 'Other Assets', value: assets.other ? `₹${assets.other}` : '' })}
                    ${Field({ label: 'Existing Loans', value: assets.existing_loans })}
                    ${Field({ label: 'Monthly EMI', value: assets.monthly_emi ? `₹${assets.monthly_emi}` : '' })}
                </div>
            </div>
            ` : ''}

            ${vehicle_info.vehicle_model || vehicle_info.registration_number ? `
            <div class="section">
                <h3>🚗 Vehicle Details</h3>
                <div class="grid">
                    ${Field({ label: 'Vehicle Model', value: vehicle_info.vehicle_model })}
                    ${Field({ label: 'Variant', value: vehicle_info.variant })}
                    ${Field({ label: 'Registration Number', value: vehicle_info.registration_number })}
                    ${Field({ label: 'Manufacturing Year', value: vehicle_info.manufacturing_year })}
                    ${Field({ label: 'Chassis Number', value: vehicle_info.chassis_number })}
                    ${Field({ label: 'Engine Number', value: vehicle_info.engine_number })}
                    ${Field({ label: 'Color', value: vehicle_info.color })}
                    ${Field({ label: 'Fuel Type', value: vehicle_info.fuel_type })}
                    ${Field({ label: 'Vehicle Type', value: vehicle_info.vehicle_type })}
                    ${Field({ label: 'Ex-Showroom Price', value: vehicle_info.ex_showroom_price ? `₹${vehicle_info.ex_showroom_price}` : '' })}
                    ${Field({ label: 'On-Road Price', value: vehicle_info.on_road_price ? `₹${vehicle_info.on_road_price}` : '' })}
                    ${Field({ label: 'Insurance Company', value: vehicle_info.insurance_company })}
                    ${Field({ label: 'Insurance Policy Number', value: vehicle_info.insurance_policy_number })}
                    ${Field({ label: 'Insurance Expiry Date', value: vehicle_info.insurance_expiry_date })}
                    ${Field({ label: 'Owner Name', value: vehicle_info.owner_name })}
                    ${Field({ label: 'Hypothecation', value: vehicle_info.hypothecation })}
                </div>
            </div>
            ` : ''}

            ${(financeScheme && financeScheme.loanAmount) ? `
            <div class="section">
                <h3>🏦 Finance Scheme</h3>
                <div class="grid">
                    ${Field({ label: 'Finance Company', value: financeScheme.financeCompanyName })}
                    ${Field({ label: 'Loan Amount', value: financeScheme.loanAmount ? `₹${financeScheme.loanAmount}` : '' })}
                    ${Field({ label: 'Interest Rate', value: financeScheme.interestRate ? `${financeScheme.interestRate}%` : '' })}
                    ${Field({ label: 'Tenure', value: financeScheme.tenure ? `${financeScheme.tenure} Months` : '' })}
                    ${Field({ label: 'Processing Fee', value: financeScheme.processingFee ? `₹${financeScheme.processingFee}` : '' })}
                    ${Field({ label: 'Insurance', value: financeScheme.insurance ? `₹${financeScheme.insurance}` : '' })}
                    ${Field({ label: 'GST', value: financeScheme.gst ? `₹${financeScheme.gst}` : '' })}
                    ${Field({ label: 'Total Charges', value: financeScheme.totalCharges ? `₹${financeScheme.totalCharges}` : '' })}
                    ${Field({ label: 'Actual Disbursement', value: financeScheme.actualDisbursement ? `₹${financeScheme.actualDisbursement}` : '' })}
                    ${Field({ label: 'EMI Amount', value: financeScheme.emiAmount ? `₹${financeScheme.emiAmount}` : '' })}
                    ${Field({ label: 'IRR (Annual)', value: financeScheme.irr ? `${financeScheme.irr}%` : '' })}
                    ${Field({ label: 'Start Date', value: financeScheme.startDate })}
                    ${Field({ label: 'End Date', value: financeScheme.endDate })}
                    ${Field({ label: 'Created At', value: financeScheme.createdAt ? new Date(financeScheme.createdAt).toLocaleDateString() : '' })}
                </div>
            </div>
            ` : ''}

            ${(commission && commission.payoutAmount) ? `
            <div class="section">
                <h3>💵 Commission Details</h3>
                <div class="grid">
                    ${Field({ label: 'Company Name', value: commission.companyName })}
                    ${Field({ label: 'Loan Amount', value: commission.loanAmount ? `₹${commission.loanAmount}` : '' })}
                    ${Field({ label: 'Payout Amount', value: commission.payoutAmount ? `₹${commission.payoutAmount}` : '' })}
                    ${Field({ label: 'Payout Percentage', value: commission.payoutPercentage ? `${commission.payoutPercentage}%` : '' })}
                    ${Field({ label: 'Given to Other', value: commission.givenToOther })}
                    ${Field({ label: 'Date', value: commission.date })}
                    ${Field({ label: 'Balance Amount', value: commission.balanceAmount ? `₹${commission.balanceAmount}` : '' })}
                </div>
            </div>
            ` : ''}
            
            <div class="section" style="margin-top: 40px; text-align: center; font-size: 11px; color: #888;">
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>Whatsapp connection</p>
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
