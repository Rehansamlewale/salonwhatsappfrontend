import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const DetailRow = ({ label, value }) => {
    const displayValue = value && value !== 'null' && value !== 'undefined' ? value : '-';
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <dt className="font-semibold text-gray-600 text-sm">{label}</dt>
            <dd className="text-gray-900 sm:col-span-2 font-medium break-words text-sm">{displayValue}</dd>
        </div>
    );
};

const Section = ({ title, children, icon, bgColor = 'bg-gradient-to-r from-blue-50 to-indigo-50' }) => {
    return (
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <h3 className={`text-lg font-bold text-gray-800 ${bgColor} rounded-lg px-4 py-3 mb-4 flex items-center gap-3 shadow-sm`}>
                {icon && <span className="text-2xl">{icon}</span>}
                <span>{title}</span>
            </h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
                {children}
            </div>
        </div>
    );
};

const CustomerFullDetails = ({ customer, onClose, mode = 'modal', containerId = 'customer-details-content' }) => {
    if (!customer) return null;

    const {
        customer_details = {},
        loanType,
        vehicle_info = {},
        financeScheme = {},
        assets = {},
        commission = {}
    } = customer || {};

    const safeFinanceScheme = financeScheme || {};
    const safeCommission = commission || {};
    const safeVehicleInfo = vehicle_info || {};
    const safeAssets = assets || {};

    const basic = customer_details.basic_info || {};
    const residence = customer_details.residence_info || {};
    const occupation = customer_details.occupation_info || {};
    const salariedDetails = occupation.salaried_job_details || {};
    const selfEmployedDetails = occupation.self_employed_details || {};


    const handleDownload = () => {
        const element = document.getElementById(containerId);
        const opt = {
            margin: [0, 0, 0, 0],
            filename: `${customer.name || 'customer'}_profile.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const content = (
        <div className="w-full h-full overflow-y-auto flex justify-center py-8 print:p-0 print:w-full print:h-auto print:overflow-visible bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={mode === 'embed' ? { padding: 0, height: 'auto', display: 'block', overflow: 'visible' } : {}}>
            <div id={containerId} className={`bg-white shadow-2xl w-full max-w-[21cm] min-h-[29.7cm] relative ${mode === 'modal' ? 'animate-slideUp' : ''} print:shadow-none print:w-full print:max-w-none print:p-0 rounded-2xl overflow-hidden`}>

                {/* Header with Modern Styling */}
                <div className="relative mb-8 print:mb-6">
                    {/* Gradient Top Bar */}
                    <div className="h-3 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

                    <div className="px-[1.5cm] md:px-[2cm] pt-8 pb-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-indigo-200">
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 uppercase tracking-wide">
                            Customer Profile
                        </h1>
                        <span className="inline-flex items-center px-6 py-2 rounded-full text-sm font-bold shadow-md bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            {loanType || 'General Application'}
                        </span>
                    </div>
                </div>

                <div className="px-[1.5cm] md:px-[2cm] pb-[1.5cm]">
                    {/* Basic Information */}
                    <Section title="Basic Information" icon="👤" bgColor="bg-gradient-to-r from-blue-100 to-blue-50">
                        <DetailRow label="Full Name" value={customer.name || basic.full_name} />
                        <DetailRow label="Mobile" value={customer.mobile1 || basic.mobile} />
                        <DetailRow label="Alternate Mobile" value={customer.mobile2 || basic.mobile2} />
                        <DetailRow label="Email" value={customer.email || basic.email} />
                        <DetailRow label="Date of Birth" value={basic.dob} />
                        <DetailRow label="Age" value={basic.age ? `${basic.age} years` : ''} />
                        <DetailRow label="Marital Status" value={basic.marital_status} />
                        <DetailRow label="Gender" value={basic.gender} />
                        <DetailRow label="Father's Name" value={basic.father_name} />
                        <DetailRow label="Mother's Name" value={basic.mother_name} />
                        <DetailRow label="Spouse Name" value={basic.spouse_name} />
                        <DetailRow label="Education" value={basic.education} />
                        <DetailRow label="Religion" value={basic.religion} />
                        <DetailRow label="Aadhaar Number" value={basic.aadhar_number} />
                        <DetailRow label="PAN Number" value={basic.pan_number} />
                        <DetailRow label="Cast/Category" value={basic.cast_category} />
                        <DetailRow label="City/Village" value={customer.city || basic.city_village} />
                        <DetailRow label="Taluka" value={basic.taluka} />
                        <DetailRow label="District" value={basic.district} />
                        <DetailRow label="State" value={basic.state} />
                        <DetailRow label="Pincode" value={basic.pincode} />
                        <DetailRow label="Full Address" value={customer.address || basic.full_address} />
                        <DetailRow label="Landmark" value={customer.landmark || basic.landmark} />
                        <DetailRow label="Reference Name" value={basic.reference_name} />
                        <DetailRow label="Reference Mobile" value={basic.reference_mobile} />
                        <DetailRow label="Reference Relation" value={basic.reference_relation} />
                    </Section>

                    {/* Residence Information */}
                    <Section title="Residence Information" icon="🏠" bgColor="bg-gradient-to-r from-green-100 to-green-50">
                        <DetailRow label="Residence Type" value={residence.residence_type} />
                        <DetailRow label="Current Address" value={residence.current_address} />
                        <DetailRow label="Permanent Address" value={residence.permanent_address} />
                        <DetailRow label="Years at Current Address" value={residence.years_at_current_address} />
                        <DetailRow label="House Category" value={residence.house_category} />
                        <DetailRow label="Ownership Status" value={residence.ownership_status} />
                        <DetailRow label="Diff. from Aadhaar?" value={residence.different_from_aadhar !== undefined ? (residence.different_from_aadhar ? 'Yes' : 'No') : ''} />
                        <DetailRow label="Rent Agreement?" value={residence.rent_agreement !== undefined ? (residence.rent_agreement ? 'Yes' : 'No') : ''} />
                        <DetailRow label="Locality Type" value={residence.locality_type} />
                        <DetailRow label="Family Members" value={residence.number_of_family_members} />
                    </Section>

                    {/* Occupation Information */}
                    <Section title="Occupation Details" icon="💼" bgColor="bg-gradient-to-r from-purple-100 to-purple-50">
                        <DetailRow label="Occupation Type" value={customer.employmentType || occupation.occupation_type} />
                        <DetailRow label="Primary Income Source" value={occupation.primary_income_source} />
                        <DetailRow label="Annual Income" value={occupation.annual_income ? `₹${occupation.annual_income}` : ''} />
                        <DetailRow label="Monthly Income" value={occupation.monthly_income ? `₹${occupation.monthly_income}` : ''} />

                        {/* Salaried Specific */}
                        <DetailRow label="Designation" value={salariedDetails.designation} />
                        <DetailRow label="Employer Name" value={salariedDetails.employer_name} />
                        <DetailRow label="Employer Address" value={salariedDetails.employer_address} />
                        <DetailRow label="Work Experience" value={salariedDetails.work_experience ? `${salariedDetails.work_experience} years` : ''} />
                        <DetailRow label="Monthly Salary" value={salariedDetails.monthly_salary ? `₹${salariedDetails.monthly_salary}` : ''} />
                        <DetailRow label="Salary to Bank?" value={salariedDetails.salary_credited_to_bank} />
                        <DetailRow label="Bank Name" value={salariedDetails.bank_name} />
                        <DetailRow label="Job Type" value={salariedDetails.job_type} />

                        {/* Self Employed Specific */}
                        <DetailRow label="Business Name" value={selfEmployedDetails.business_name} />
                        <DetailRow label="Business Type" value={selfEmployedDetails.business_type} />
                        <DetailRow label="Business Address" value={selfEmployedDetails.business_address} />
                        <DetailRow label="Years in Business" value={selfEmployedDetails.years_in_business ? `${selfEmployedDetails.years_in_business} years` : ''} />
                        <DetailRow label="Monthly Income" value={selfEmployedDetails.monthly_income ? `₹${selfEmployedDetails.monthly_income}` : ''} />
                        <DetailRow label="Annual Turnover" value={selfEmployedDetails.annual_turnover ? `₹${selfEmployedDetails.annual_turnover}` : ''} />
                        <DetailRow label="GST Number" value={selfEmployedDetails.gst_number} />
                        <DetailRow label="Ownership" value={selfEmployedDetails.business_ownership} />
                    </Section>



                    {/* New Vehicle Details */}
                    {(safeVehicleInfo.new_vehicle_type || safeVehicleInfo.new_vehicle_model || safeVehicleInfo.new_vehicle_invoice_price) && (
                        <Section title="New Vehicle Details" icon="🚙" bgColor="bg-gradient-to-r from-cyan-100 to-blue-50">
                            <DetailRow label="Vehicle Type" value={safeVehicleInfo.new_vehicle_type} />
                            <DetailRow label="Vehicle Name" value={safeVehicleInfo.new_vehicle_model} />
                            <DetailRow label="Invoice Price" value={safeVehicleInfo.new_vehicle_invoice_price ? `₹${safeVehicleInfo.new_vehicle_invoice_price}` : ''} />
                            <DetailRow label="Usage Type" value={safeVehicleInfo.new_vehicle_usage_type} />
                            <DetailRow label="Insurance" value={safeVehicleInfo.new_vehicle_insurance ? `₹${safeVehicleInfo.new_vehicle_insurance}` : ''} />
                            <DetailRow label="Tax" value={safeVehicleInfo.new_vehicle_tax ? `₹${safeVehicleInfo.new_vehicle_tax}` : ''} />
                            <DetailRow label="On-Road Total Price" value={safeVehicleInfo.new_vehicle_total ? `₹${safeVehicleInfo.new_vehicle_total}` : ''} />
                            <DetailRow label="Other Charges" value={safeVehicleInfo.new_vehicle_other ? `₹${safeVehicleInfo.new_vehicle_other}` : ''} />
                            {customer.loanSubcategory === 'new_commercial' && (
                                <>
                                    <DetailRow label="Heavy License" value={safeVehicleInfo.has_heavy_license === true ? 'Yes' : safeVehicleInfo.has_heavy_license === false ? 'No' : ''} />
                                    {safeVehicleInfo.has_heavy_license === true && (
                                        <DetailRow label="Heavy License Date" value={safeVehicleInfo.heavy_license_date} />
                                    )}
                                    <DetailRow label="TR License" value={safeVehicleInfo.has_tr_license === true ? 'Yes' : safeVehicleInfo.has_tr_license === false ? 'No' : ''} />
                                    {safeVehicleInfo.has_tr_license === true && (
                                        <DetailRow label="TR License Date" value={safeVehicleInfo.tr_license_date} />
                                    )}
                                </>
                            )}
                        </Section>
                    )}

                    {/* Old Vehicle History */}
                    {customer.vehicle_history?.has_previous_vehicle && customer.vehicle_history?.vehicles && customer.vehicle_history.vehicles.length > 0 && (
                        <Section title="Old Vehicle History" icon="🚗" bgColor="bg-gradient-to-r from-amber-100 to-orange-50">
                            {customer.vehicle_history.vehicles.map((vehicle, index) => (
                                <React.Fragment key={index}>
                                    <div className="col-span-1 md:col-span-2 mt-4 mb-2">
                                        <h4 className="font-bold text-gray-700 text-sm bg-gray-100 px-3 py-2 rounded-lg">Vehicle {index + 1}</h4>
                                    </div>
                                    <DetailRow label="Vehicle Name" value={vehicle.model} />
                                    <DetailRow label="Finance Company" value={vehicle.financeCompany} />
                                    <DetailRow label="Loan Active?" value={vehicle.loanActive} />
                                </React.Fragment>
                            ))}
                        </Section>
                    )}

                    {/* Assets & Liabilities */}
                    <Section title="Assets & Liabilities" icon="💰" bgColor="bg-gradient-to-r from-yellow-100 to-yellow-50">
                        <DetailRow label="Total Assets" value={safeAssets.total_assets ? `₹${safeAssets.total_assets}` : ''} />
                        <DetailRow label="Total Liabilities" value={safeAssets.total_liabilities ? `₹${safeAssets.total_liabilities}` : ''} />
                        <DetailRow label="Net Worth" value={safeAssets.net_worth ? `₹${safeAssets.net_worth}` : ''} />
                        <DetailRow label="Home Value" value={safeAssets.home ? `₹${safeAssets.home}` : ''} />
                        <DetailRow label="Vehicle Value" value={safeAssets.vehicle ? `₹${safeAssets.vehicle}` : ''} />
                        <DetailRow label="Farm Value" value={safeAssets.farm ? `₹${safeAssets.farm}` : ''} />
                        <DetailRow label="Gold Value" value={safeAssets.gold ? `₹${safeAssets.gold}` : ''} />
                        <DetailRow label="Other Assets" value={safeAssets.other ? `₹${safeAssets.other}` : ''} />
                        <DetailRow label="Existing Loans" value={safeAssets.existing_loans} />
                        <DetailRow label="Monthly EMI" value={safeAssets.monthly_emi ? `₹${safeAssets.monthly_emi}` : ''} />
                    </Section>

                    {/* Finance Scheme */}
                    <Section title="Finance Scheme" icon="🏦" bgColor="bg-gradient-to-r from-indigo-100 to-indigo-50">
                        <DetailRow label="Company" value={safeFinanceScheme.financeCompanyName} />
                        <DetailRow label="Executive" value={safeFinanceScheme.executiveName} />
                        <DetailRow label="Executive Mobile" value={safeFinanceScheme.executiveMobile} />
                        <DetailRow label="Loan Amount" value={safeFinanceScheme.loanAmount ? `₹${safeFinanceScheme.loanAmount}` : ''} />
                        <DetailRow label="Interest Rate" value={safeFinanceScheme.interestRate ? `${safeFinanceScheme.interestRate}%` : ''} />
                        <DetailRow label="Tenure" value={safeFinanceScheme.tenure ? `${safeFinanceScheme.tenure} Months` : ''} />
                        <DetailRow label="EMI Amount" value={safeFinanceScheme.emiAmount ? `₹${safeFinanceScheme.emiAmount}` : ''} />
                        <DetailRow label="Total Charges" value={safeFinanceScheme.totalCharges ? `₹${safeFinanceScheme.totalCharges}` : ''} />
                        <DetailRow label="Net Disbursal" value={safeFinanceScheme.actualDisbursement ? `₹${safeFinanceScheme.actualDisbursement}` : ''} />
                        <DetailRow label="Start Date" value={safeFinanceScheme.startDate} />
                        <DetailRow label="End Date" value={safeFinanceScheme.endDate} />
                    </Section>

                    {/* Commission */}
                    <Section title="Commission Details" icon="💵" bgColor="bg-gradient-to-r from-pink-100 to-pink-50">
                        <DetailRow label="Company" value={safeCommission.companyName} />
                        <DetailRow label="Payout Amount" value={safeCommission.payoutAmount ? `₹${safeCommission.payoutAmount}` : ''} />
                        <DetailRow label="Percentage" value={safeCommission.payoutPercentage ? `${safeCommission.payoutPercentage}%` : ''} />
                        <DetailRow label="Agent Comm." value={safeCommission.givenToOther} />
                        <DetailRow label="Date" value={safeCommission.date} />
                        <DetailRow label="Balance" value={safeCommission.balanceAmount ? `₹${safeCommission.balanceAmount}` : ''} />
                    </Section>
                </div>
            </div>
        </div>
    );

    if (mode === 'embed') {
        return content;
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-hidden backdrop-blur-sm print:p-0 print:bg-white print:relative print:z-auto print:block transition-opacity duration-300 opacity-100">
            <style>
                {`
                    @keyframes slideUp {
                        from { transform: translateY(50px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slideUp {
                        animation: slideUp 0.4s ease-out forwards;
                    }
                `}
            </style>

            {/* Scrollable Action Buttons */}
            <div className="sticky top-4 right-4 flex justify-end gap-3 print:hidden z-50 animate-slideUp mb-4 px-4" style={{ animationDelay: '0.1s' }}>
                <button
                    onClick={handleDownload}
                    className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-110 border-2 border-white"
                    title="Download PDF"
                >
                    <FaDownload size={22} />
                </button>
                <button
                    onClick={onClose}
                    className="p-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-110 border-2 border-white"
                    title="Close"
                >
                    <FaTimes size={22} />
                </button>
            </div>

            {/* A4 Page Container */}
            {content}
        </div>
    );
};

export default CustomerFullDetails;
