import React from 'react';
import { FaTimes, FaUser, FaHome, FaBriefcase, FaCar, FaMoneyBillWave, FaFileContract, FaUniversity, FaPercent, FaTractor, FaBuilding, FaCheckCircle } from 'react-icons/fa';

const DetailRow = ({ label, value }) => {
  if (!value || value === 'null' || value === 'undefined') return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <dt className="font-semibold text-gray-600 text-sm flex items-center break-words pr-2">{label}</dt>
      <dd className="text-gray-900 sm:col-span-2 font-medium break-words text-sm">{value}</dd>
    </div>
  );
};

const Section = ({ title, children, condition = true, icon, bgColor = 'bg-gradient-to-r from-gray-50 to-gray-100' }) => {
  if (!condition) return null;

  return (
    <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 page-break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
      <h3 className={`text-lg font-bold text-gray-800 ${bgColor} rounded-lg px-4 py-3 mb-4 flex items-center gap-3 shadow-sm`}>
        {icon && <span className="text-xl opacity-80">{icon}</span>}
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
  const farmInfo = customer_details.farm_income_info || {};

  // Calculate Total Annual Income for Full Form
  const calculateTotalAnnualIncome = () => {
    let mainIncome = 0;
    if (occupation.type === 'Job' && occupation.employment_details) {
      const gross = parseFloat(occupation.employment_details.gross_salary || 0);
      if (!isNaN(gross)) mainIncome = gross * 12;
    } else if (occupation.type === 'Business' && occupation.employment_details) {
      const annual = parseFloat(occupation.employment_details.yearly_income || 0);
      if (!isNaN(annual)) mainIncome = annual;
    }

    let extraIncome = parseFloat(farmInfo.extra_income_amount || 0);
    if (isNaN(extraIncome)) extraIncome = 0;

    return mainIncome + extraIncome;
  };

  const totalAnnualIncome = calculateTotalAnnualIncome();

  const content = (
    <div className="w-full h-full overflow-y-auto flex justify-center py-8 print:p-0 print:w-full print:h-auto print:overflow-visible bg-gray-100/50" style={mode === 'embed' ? { padding: 0, height: 'auto', display: 'block', overflow: 'visible', background: 'white' } : {}}>
      <div id={containerId} className={`bg-white shadow-2xl w-full max-w-[21cm] flex flex-col relative ${mode === 'modal' ? 'animate-slideUp' : ''} print:shadow-none print:w-full print:max-w-none print:p-0 border border-gray-200`}>

        {/* Header with Clean Professional Styling */}
        <div className="relative mb-6 print:mb-6 flex-shrink-0" style={{ pageBreakAfter: 'avoid' }}>
          {/* Decorative Top Bar */}
          <div className="h-4 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"></div>

          <div className="px-12 pt-8 pb-6 border-b border-gray-100 bg-white relative">
            {/* Priority Badge */}
            {customer.loan_application?.loan_details?.priority && (
              <div className="absolute top-8 left-12">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border ${customer.loan_application.loan_details.priority.toLowerCase() === 'high'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : customer.loan_application.loan_details.priority.toLowerCase() === 'medium'
                      ? 'bg-orange-50 text-orange-600 border-orange-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                  {customer.loan_application.loan_details.priority} Priority
                </span>
              </div>
            )}

            {/* Close Button on Page */}
            {mode === 'modal' && (
              <button
                onClick={onClose}
                className="fixed top-6 right-6 p-2 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-all transform hover:scale-105 border border-red-200 print:hidden z-50"
                title="Close"
              >
                <FaTimes size={20} />
              </button>
            )}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-emerald-700 mb-2 uppercase tracking-wide">
                Customer Profile
              </h1>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                {loanType || 'General Application'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-12 flex-grow bg-white" style={{ pageBreakInside: 'avoid' }}>
          {/* Basic Information */}
          <Section title="Basic Information" icon={<FaUser />} bgColor="bg-gradient-to-r from-blue-100 to-blue-50">
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
          <Section title="Residence Information" icon={<FaHome />} bgColor="bg-gradient-to-r from-green-100 to-green-50">
            <DetailRow label="Residence Type" value={residence.ownership_type} />
            <DetailRow label="House Category" value={residence.house_category} />
            <DetailRow label="Number of Rooms" value={residence.number_of_rooms} />
            <DetailRow label="House Owner Name" value={residence.house_owner_name} />
            <DetailRow label="Owner has PAN/Aadhaar?" value={residence.owner_has_pan_aadhar !== undefined ? (residence.owner_has_pan_aadhar ? 'Yes' : 'No') : ''} />
            <DetailRow label="Diff. from Aadhaar Address?" value={residence.different_from_aadhar !== undefined ? (residence.different_from_aadhar ? 'Yes' : 'No') : ''} />
            <DetailRow label="Has Rent Agreement?" value={residence.has_rent_agreement !== undefined ? (residence.has_rent_agreement ? 'Yes' : 'No') : ''} />
            <DetailRow label="Remark" value={residence.remark} />
          </Section>

          {/* Occupation Information */}
          <Section title="Occupation Details" icon={<FaBriefcase />} bgColor="bg-gradient-to-r from-purple-100 to-purple-50">
            <DetailRow label="Occupation Type" value={occupation.type} />

            {/* Job/Salaried Specific */}
            {occupation.type === 'Job' && occupation.employment_details && (
              <>
                <DetailRow label="Company Name" value={occupation.employment_details.company_name} />
                <DetailRow label="Designation" value={occupation.employment_details.designation} />
                <DetailRow label="Years Employed" value={occupation.employment_details.years_employed} />
                <DetailRow label="Salary in Bank?" value={occupation.employment_details.salary_in_bank ? 'Yes' : 'No'} />
                <DetailRow label="Gross Salary" value={occupation.employment_details.gross_salary ? `₹${occupation.employment_details.gross_salary}` : ''} />
                <DetailRow label="Net Salary" value={occupation.employment_details.net_salary ? `₹${occupation.employment_details.net_salary}` : ''} />
                <DetailRow label="Monthly Salary" value={occupation.employment_details.monthly_salary ? `₹${occupation.employment_details.monthly_salary}` : ''} />
                <DetailRow label="Has Form 16?" value={occupation.employment_details.has_form16 ? 'Yes' : 'No'} />
                <DetailRow label="Has Salary Slips?" value={occupation.employment_details.has_salary_slips ? 'Yes' : 'No'} />
                <DetailRow label="Has PF?" value={occupation.employment_details.has_pf !== undefined ? (occupation.employment_details.has_pf ? 'Yes' : 'No') : ''} />
              </>
            )}

            {/* Business/Self-Employed Specific */}
            {occupation.type === 'Business' && occupation.employment_details && (
              <>
                <DetailRow label="Business Name" value={occupation.employment_details.business_name} />
                <DetailRow label="Years in Business" value={occupation.employment_details.years_in_business} />
                <DetailRow label="Business Place Type" value={occupation.employment_details.business_place_type} />
                <DetailRow label="Business Rent Amount" value={occupation.employment_details.business_rent_amount ? `₹${occupation.employment_details.business_rent_amount}` : ''} />
                <DetailRow label="Yearly Income" value={occupation.employment_details.yearly_income ? `₹${occupation.employment_details.yearly_income}` : ''} />
                <DetailRow label="Yearly Turnover" value={occupation.employment_details.yearly_turnover ? `₹${occupation.employment_details.yearly_turnover}` : ''} />
                <DetailRow label="Has Shop Act?" value={occupation.employment_details.has_shop_act ? 'Yes' : 'No'} />
                <DetailRow label="Has Udyam Reg?" value={occupation.employment_details.has_udyam_reg ? 'Yes' : 'No'} />
                <DetailRow label="Has Business Proof?" value={occupation.employment_details.has_business_proof ? 'Yes' : 'No'} />
                <DetailRow label="ITR Filed?" value={occupation.employment_details.itr_filed ? 'Yes' : 'No'} />
                <DetailRow label="ITR Income" value={occupation.employment_details.itr_income ? `₹${occupation.employment_details.itr_income}` : ''} />
                <DetailRow label="Business Entity Type" value={occupation.employment_details.business_entity_type} />
                <DetailRow label="Has GST?" value={occupation.employment_details.has_gst !== undefined ? (occupation.employment_details.has_gst ? 'Yes' : 'No') : ''} />
                <DetailRow label="Business Address" value={occupation.employment_details.business_address} />
                <DetailRow label="Has Stock Valuation?" value={occupation.employment_details.has_stock_valuation ? 'Yes' : 'No'} />
                <DetailRow label="Stock Valuation Amount" value={occupation.employment_details.stock_valuation_amount ? `₹${occupation.employment_details.stock_valuation_amount}` : ''} />
              </>
            )}
            <div className="mt-4 pt-4 border-t border-purple-200 col-span-1 md:col-span-2">
              <DetailRow label="Total Annual Income" value={`₹${totalAnnualIncome.toLocaleString('en-IN')}`} />
            </div>
          </Section>



          {/* New Vehicle Details */}
          <Section title="New Vehicle Details" icon={<FaCar />} bgColor="bg-gradient-to-r from-cyan-100 to-blue-50" condition={!!(safeVehicleInfo.new_vehicle_type || safeVehicleInfo.new_vehicle_model || safeVehicleInfo.new_vehicle_invoice_price)}>
            <DetailRow label="Vehicle Type" value={safeVehicleInfo.new_vehicle_type} />
            <DetailRow label="Vehicle Name" value={safeVehicleInfo.new_vehicle_model} />
            <DetailRow label="Fuel Type" value={safeVehicleInfo.new_vehicle_fuel_type} />
            <DetailRow label="Invoice Price" value={safeVehicleInfo.new_vehicle_invoice_price ? `₹${safeVehicleInfo.new_vehicle_invoice_price}` : ''} />
            <DetailRow label="Usage Type" value={safeVehicleInfo.new_vehicle_usage_type} />
            <DetailRow label="Insurance" value={safeVehicleInfo.new_vehicle_insurance ? `₹${safeVehicleInfo.new_vehicle_insurance}` : ''} />
            <DetailRow label="Tax" value={safeVehicleInfo.new_vehicle_tax ? `₹${safeVehicleInfo.new_vehicle_tax}` : ''} />
            <DetailRow label="On-Road Total Price" value={safeVehicleInfo.new_vehicle_total ? `₹${safeVehicleInfo.new_vehicle_total}` : ''} />
            <DetailRow label="Other Charges" value={safeVehicleInfo.new_vehicle_other ? `₹${safeVehicleInfo.new_vehicle_other}` : ''} />
            {customer.loan_application?.loan_details?.loan_subcategory === 'new_commercial' && (
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

          {/* Vehicle Details (Used/Refinance) */}
          <Section title="Vehicle Details" icon={<FaCar />} bgColor="bg-gradient-to-r from-orange-100 to-orange-50" condition={!!(safeVehicleInfo.registration_number || safeVehicleInfo.model) && !(safeVehicleInfo.new_vehicle_model)}>
            <DetailRow label="Registration Number" value={safeVehicleInfo.registration_number} />
            <DetailRow label="Vehicle Type" value={safeVehicleInfo.vehicle_type} />
            <DetailRow label="Vehicle Model" value={safeVehicleInfo.model} />
            <DetailRow label="Fuel Type" value={safeVehicleInfo.fuel_type} />
            <DetailRow label="Manufacturing Year" value={safeVehicleInfo.manufacturing_year} />
            <DetailRow label="Number of Owners" value={safeVehicleInfo.number_of_owners} />
            <DetailRow label="KM Reading" value={safeVehicleInfo.km_reading ? `${safeVehicleInfo.km_reading} KM` : ''} />
            <DetailRow label="Purchase Price" value={safeVehicleInfo.purchase_price ? `₹${safeVehicleInfo.purchase_price}` : ''} />
            <DetailRow label="Loan Required" value={safeVehicleInfo.loan_amount_required ? `₹${safeVehicleInfo.loan_amount_required}` : ''} />
            <DetailRow label="Hypothecation" value={safeVehicleInfo.hypothecation} />
            {safeVehicleInfo.hypothecation === 'yes' && (
              <>
                <DetailRow label="Hypoth. Bank" value={safeVehicleInfo.hypothecation_bank_name} />
                <DetailRow label="Hypoth. Balance" value={safeVehicleInfo.hypothecation_balance_amount ? `₹${safeVehicleInfo.hypothecation_balance_amount}` : ''} />
              </>
            )}
            <DetailRow label="Insurance" value={safeVehicleInfo.insurance} />
            {safeVehicleInfo.insurance === 'yes' && (
              <DetailRow label="Insurance IDV" value={safeVehicleInfo.insurance_idv_amount ? `₹${safeVehicleInfo.insurance_idv_amount}` : ''} />
            )}
          </Section>

          {/* Old Vehicle History */}
          <Section title="Old Vehicle History" icon={<FaCar />} bgColor="bg-gradient-to-r from-amber-100 to-orange-50" condition={!!(customer.vehicle_history?.has_previous_vehicle && customer.vehicle_history?.vehicles && customer.vehicle_history.vehicles.length > 0)}>
            {customer.vehicle_history?.vehicles?.map((vehicle, index) => (
              <React.Fragment key={index}>
                <div className="col-span-1 md:col-span-2 mt-2 mb-2">
                  <h4 className="font-bold text-gray-700 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 inline-block">Vehicle {index + 1}</h4>
                </div>
                <DetailRow label="Vehicle Name" value={vehicle.model} />
                <DetailRow label="Finance Company" value={vehicle.financeCompany} />
                <DetailRow label="Loan Active?" value={vehicle.loanActive} />
              </React.Fragment>
            ))}
          </Section>

          {/* Assets & Liabilities */}
          <Section title="Assets & Liabilities" icon={<FaMoneyBillWave />} bgColor="bg-gradient-to-r from-yellow-100 to-yellow-50" condition={!!(safeAssets.home || safeAssets.total_assets)}>
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
          <Section title="Finance Scheme" icon={<FaUniversity />} bgColor="bg-gradient-to-r from-indigo-100 to-indigo-50" condition={!!(safeFinanceScheme && safeFinanceScheme.loanAmount)}>
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
          <Section title="Commission Details" icon={<FaPercent />} bgColor="bg-gradient-to-r from-pink-100 to-pink-50" condition={!!(safeCommission && safeCommission.payoutAmount)}>
            <DetailRow label="Company" value={safeCommission.companyName} />
            <DetailRow label="Payout Amount" value={safeCommission.payoutAmount ? `₹${safeCommission.payoutAmount}` : ''} />
            <DetailRow label="Percentage" value={safeCommission.payoutPercentage ? `${safeCommission.payoutPercentage}%` : ''} />
            <DetailRow label="Agent Comm." value={safeCommission.givenToOther} />
            <DetailRow label="Date" value={safeCommission.date} />
            <DetailRow label="Balance" value={safeCommission.balanceAmount ? `₹${safeCommission.balanceAmount}` : ''} />
          </Section>

          {/* Farm Income Information */}
          <Section title="Farm & Extra Income Details" icon={<FaTractor />} bgColor="bg-gradient-to-r from-lime-100 to-lime-50" condition={!!(customer_details.farm_income_info && (customer_details.farm_income_info.has_farm || customer_details.farm_income_info.has_extra_income))}>
            <DetailRow label="Has Farm?" value={customer_details.farm_income_info?.has_farm ? 'Yes' : 'No'} />
            <DetailRow label="Farm Area" value={customer_details.farm_income_info?.farm_area} />
            <DetailRow label="Owner Name" value={customer_details.farm_income_info?.farm_owner_name} />
            <DetailRow label="Has 7/12 & 8A?" value={customer_details.farm_income_info?.has_farm_documents ? 'Yes' : 'No'} />
            <DetailRow label="Extra Income?" value={customer_details.farm_income_info?.has_extra_income ? 'Yes' : 'No'} />
            <DetailRow label="Extra Income Sources" value={customer_details.farm_income_info?.extra_income_sources?.join(', ')} />

            {/* Income Breakdown */}
            {customer_details.farm_income_info?.extra_income_breakdown && (
              <div className="col-span-1 md:col-span-2 mt-3 pt-3 border-t border-lime-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Income Breakdown:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(customer_details.farm_income_info.extra_income_breakdown).map(([key, amount]) => {
                    // Restore display keys (simple check for known ones or generic replace)
                    let displayKey = key;
                    if (key === 'Dairy _ Animals') displayKey = 'Dairy / Animals';
                    else if (key === 'Stitching _ Small Biz') displayKey = 'Stitching / Small Biz';

                    return (
                      <div key={key} className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-lime-100">
                        <span className="text-gray-600 text-sm font-medium">{displayKey}</span>
                        <span className="font-bold text-gray-900">₹{amount}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center bg-lime-100 p-2 rounded-lg border border-lime-200 font-bold">
                    <span className="text-lime-800 text-sm">Total Extra Income</span>
                    <span className="text-lime-900">₹{customer_details.farm_income_info?.extra_income_amount || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <DetailRow label="Other Income Desc" value={customer_details.farm_income_info?.other_income_description} />
          </Section>

          {/* LAP Property Details */}
          <Section title="LAP Property Details" icon={<FaBuilding />} bgColor="bg-gradient-to-r from-orange-100 to-orange-50" condition={!!(customer.lap_details)}>
            <DetailRow label="Property Type" value={customer.lap_details?.property_type} />
            <DetailRow label="Property Usage" value={customer.lap_details?.property_usage} />
            <DetailRow label="Property Address" value={customer.lap_details?.property_address} />
            <DetailRow label="City" value={customer.lap_details?.city} />
            <DetailRow label="Pincode" value={customer.lap_details?.pincode} />
            <DetailRow label="Plot Area" value={customer.lap_details?.plot_area ? `${customer.lap_details.plot_area} sq.ft` : ''} />
            <DetailRow label="Construction Area" value={customer.lap_details?.construction_area ? `${customer.lap_details.construction_area} sq.ft` : ''} />
            <DetailRow label="Agreement Value" value={customer.lap_details?.agreement_value ? `₹${customer.lap_details.agreement_value}` : ''} />
            <DetailRow label="Market Value" value={customer.lap_details?.market_value ? `₹${customer.lap_details.market_value}` : ''} />
            <DetailRow label="Seller/Builder Name" value={customer.lap_details?.seller_name} />
            <DetailRow label="Project Name" value={customer.lap_details?.project_name} />
            <DetailRow label="RERA Number" value={customer.lap_details?.rera_number} />
            <DetailRow label="Seller Mobile" value={customer.lap_details?.seller_mobile} />
          </Section>

          {/* Loan Application Details */}
          <Section title="Loan Application Details" icon={<FaFileContract />} bgColor="bg-gradient-to-r from-gray-200 to-gray-100" condition={!!(customer.loan_application?.loan_details)}>
            <DetailRow label="Loan Category" value={customer.loan_application?.loan_details?.loan_category} />
            <DetailRow label="Subcategory" value={customer.loan_application?.loan_details?.loan_subcategory} />
            <DetailRow label="Loan Type" value={customer.loan_application?.loan_details?.loan_type} />
            <DetailRow label="Required Amount" value={basic.required_loan_amount ? `₹${basic.required_loan_amount}` : ''} />
            <DetailRow label="Status" value={customer.loan_application?.loan_details?.status} />
            <DetailRow label="Priority" value={customer.loan_application?.loan_details?.priority} />
            <DetailRow label="Remark" value={customer.loan_application?.loan_details?.remark} />
          </Section>

          {/* Documents List */}
          <Section title="Documents Collected" icon={<FaFileContract />} bgColor="bg-gradient-to-r from-teal-100 to-teal-50" condition={!!(customer.loan_application?.documents?.collected_documents)}>
            {Object.entries(customer.loan_application?.documents?.collected_documents || {}).map(([doc, collected]) => (
              collected ? (
                <div key={doc} className="flex items-center gap-2 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <FaCheckCircle className="text-teal-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-sm break-words">{doc.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ) : null
            ))}
            {customer.loan_application?.documents?.extra_documents?.map((doc, idx) => (
              doc.collected ? (
                <div key={`extra_${idx}`} className="flex items-center gap-2 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <FaCheckCircle className="text-teal-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-sm break-words">{doc.name} (Extra)</span>
                </div>
              ) : null
            ))}
          </Section>

          {/* Existing Loans */}
          <Section title="Existing Loans" icon={<FaUniversity />} bgColor="bg-gradient-to-r from-red-100 to-red-50" condition={!!(customer.existing_loans?.has_existing_loan)}>
            <DetailRow label="Has Existing Loans?" value="Yes" />
            <DetailRow label="CIBIL Score" value={customer.existing_loans?.cibil_score} />
          </Section>
          {customer.existing_loans?.active_loans?.length > 0 && (
            <div className="mb-8 break-inside-avoid px-6">
              <h4 className="text-md font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Active Loan Details</h4>
              <div className="space-y-4">
                {customer.existing_loans.active_loans.map((loan, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold text-gray-600">Bank:</span> {loan.bankName}</div>
                      <div><span className="font-semibold text-gray-600">Amount:</span> ₹{loan.loanAmount}</div>
                      <div><span className="font-semibold text-gray-600">EMI:</span> ₹{loan.emi}</div>
                      <div><span className="font-semibold text-gray-600">Tenure:</span> {loan.tenure} Months</div>
                      <div><span className="font-semibold text-gray-600">Outstanding amount:</span> ₹{loan.outstandingAmount || loan.paidAmount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle History */}
          <Section title="Vehicle History" icon={<FaCar />} bgColor="bg-gradient-to-r from-amber-100 to-orange-50" condition={!!(customer.vehicle_history?.has_previous_vehicle)}>
            <DetailRow label="Has Previous Vehicle?" value="Yes" />
          </Section>
          {customer.vehicle_history?.vehicles?.length > 0 && (
            <div className="mb-8 break-inside-avoid px-6">
              <h4 className="text-md font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Previous Vehicles</h4>
              <div className="space-y-4">
                {customer.vehicle_history.vehicles.map((v, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold text-gray-600">Model:</span> {v.model}</div>
                      <div><span className="font-semibold text-gray-600">Number:</span> {v.number}</div>
                      <div><span className="font-semibold text-gray-600">Sold/Possess:</span> {v.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home Loan Details */}
          <Section title="Home Loan Details" icon={<FaHome />} bgColor="bg-gradient-to-r from-rose-100 to-rose-50" condition={!!(customer.home_loan_details)}>
            {/* Applicant Personal Details */}
            <DetailRow label="Gender" value={customer.home_loan_details?.applicantGender} />
            <DetailRow label="Marital Status" value={customer.home_loan_details?.applicantMaritalStatus} />
            <DetailRow label="Alternate Mobile" value={customer.home_loan_details?.applicantAlternateMobile} />
            <DetailRow label="PAN" value={customer.home_loan_details?.applicantPan} />
            <DetailRow label="Aadhaar" value={customer.home_loan_details?.applicantAadhaar} />
            <DetailRow label="Current Address" value={customer.home_loan_details?.applicantCurrentAddress} />
            <DetailRow label="Permanent Address" value={customer.home_loan_details?.applicantPermanentAddress} />

            {/* Employment Details - Salaried */}
            {customer.home_loan_details?.employerName && (
              <>
                <DetailRow label="Employer Name" value={customer.home_loan_details?.employerName} />
                <DetailRow label="Organization Type" value={customer.home_loan_details?.organizationType} />
                <DetailRow label="Designation" value={customer.home_loan_details?.designation} />
                <DetailRow label="Total Work Experience" value={customer.home_loan_details?.totalWorkExperience} />
                <DetailRow label="Current Company Experience" value={customer.home_loan_details?.currentCompanyExperience} />
                <DetailRow label="Monthly Gross Salary" value={customer.home_loan_details?.monthlyGrossSalary ? `₹${customer.home_loan_details.monthlyGrossSalary}` : ''} />
                <DetailRow label="Monthly Net Salary" value={customer.home_loan_details?.monthlyNetSalary ? `₹${customer.home_loan_details.monthlyNetSalary}` : ''} />
                <DetailRow label="Salary Account Bank" value={customer.home_loan_details?.salaryAccountBank} />
              </>
            )}

            {/* Employment Details - Self-Employed */}
            {customer.home_loan_details?.businessType && (
              <>
                <DetailRow label="Business Type" value={customer.home_loan_details?.businessType} />
                <DetailRow label="Nature of Business" value={customer.home_loan_details?.natureOfBusiness} />
                <DetailRow label="Business Vintage" value={customer.home_loan_details?.businessVintage} />
                <DetailRow label="Annual Turnover (Year 1)" value={customer.home_loan_details?.annualTurnover1 ? `₹${customer.home_loan_details.annualTurnover1}` : ''} />
                <DetailRow label="Annual Turnover (Year 2)" value={customer.home_loan_details?.annualTurnover2 ? `₹${customer.home_loan_details.annualTurnover2}` : ''} />
                <DetailRow label="Annual Turnover (Year 3)" value={customer.home_loan_details?.annualTurnover3 ? `₹${customer.home_loan_details.annualTurnover3}` : ''} />
                <DetailRow label="Net Profit (Year 1)" value={customer.home_loan_details?.netProfit1 ? `₹${customer.home_loan_details.netProfit1}` : ''} />
                <DetailRow label="Net Profit (Year 2)" value={customer.home_loan_details?.netProfit2 ? `₹${customer.home_loan_details.netProfit2}` : ''} />
                <DetailRow label="Net Profit (Year 3)" value={customer.home_loan_details?.netProfit3 ? `₹${customer.home_loan_details.netProfit3}` : ''} />
              </>
            )}

            {/* Loan Requirement */}
            <DetailRow label="Loan Purpose" value={customer.home_loan_details?.loanPurpose} />
            <DetailRow label="Required Loan Amount" value={customer.home_loan_details?.requiredLoanAmount ? `₹${customer.home_loan_details.requiredLoanAmount}` : ''} />
            <DetailRow label="Preferred Tenure" value={customer.home_loan_details?.preferredTenure ? `${customer.home_loan_details.preferredTenure} years` : ''} />
            <DetailRow label="Expected EMI" value={customer.home_loan_details?.expectedEmi ? `₹${customer.home_loan_details.expectedEmi}` : ''} />

            {/* Property Details */}
            <DetailRow label="Property Type" value={customer.home_loan_details?.propertyType} />
            <DetailRow label="Property Usage" value={customer.home_loan_details?.propertyUsage} />
            <DetailRow label="Property Address" value={customer.home_loan_details?.propertyAddress} />
            <DetailRow label="Property City" value={customer.home_loan_details?.propertyCity} />
            <DetailRow label="Property District" value={customer.home_loan_details?.propertyDistrict} />
            <DetailRow label="Property State" value={customer.home_loan_details?.propertyState} />
            <DetailRow label="Property Pincode" value={customer.home_loan_details?.propertyPincode} />
            <DetailRow label="Carpet Area" value={customer.home_loan_details?.carpetArea ? `${customer.home_loan_details.carpetArea} sq.ft` : ''} />
            <DetailRow label="Built-up Area" value={customer.home_loan_details?.builtUpArea ? `${customer.home_loan_details.builtUpArea} sq.ft` : ''} />
            <DetailRow label="Property Age" value={customer.home_loan_details?.propertyAge ? `${customer.home_loan_details.propertyAge} years` : ''} />
            <DetailRow label="Agreement Value" value={customer.home_loan_details?.agreementValue ? `₹${customer.home_loan_details.agreementValue}` : ''} />
            <DetailRow label="Market Value" value={customer.home_loan_details?.marketValue ? `₹${customer.home_loan_details.marketValue}` : ''} />

            {/* Builder/Seller Details */}
            <DetailRow label="Seller Name" value={customer.home_loan_details?.sellerName} />
            <DetailRow label="Project Name" value={customer.home_loan_details?.projectName} />
            <DetailRow label="RERA Number" value={customer.home_loan_details?.reraNumber} />
            <DetailRow label="Seller Contact" value={customer.home_loan_details?.sellerContact} />
          </Section>

          {/* Home Loan Co-Applicants */}
          {customer.home_loan_details?.coApplicants?.length > 0 && (
            <div className="mb-8 break-inside-avoid px-6">
              <h4 className="text-lg font-bold text-gray-800 bg-gradient-to-r from-rose-100 to-rose-50 rounded-lg px-4 py-3 mb-4 flex items-center gap-3 shadow-sm border border-rose-100">
                <span className="text-xl opacity-80"><FaUser /></span>
                <span>Home Loan Co-Applicants</span>
              </h4>
              <div className="space-y-4">
                {customer.home_loan_details.coApplicants.map((coApp, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold text-gray-600">Name:</span> {coApp.name}</div>
                      <div><span className="font-semibold text-gray-600">Relationship:</span> {coApp.relationship}</div>
                      <div><span className="font-semibold text-gray-600">DOB:</span> {coApp.dob}</div>
                      <div><span className="font-semibold text-gray-600">Mobile:</span> {coApp.mobile}</div>
                      <div><span className="font-semibold text-gray-600">Income:</span> ₹{coApp.income}</div>
                      <div><span className="font-semibold text-gray-600">Occupation:</span> {coApp.occupation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Used Commercial Vehicle Details */}
          <Section title="Used Commercial Vehicle" icon={<FaTractor />} bgColor="bg-gradient-to-r from-red-100 to-red-50" condition={!!(customer.used_commercial_vehicle) && (loanType === 'used_commercial' || customer.loan_application?.loan_details?.loan_subcategory === 'used_commercial')}>
            <DetailRow label="Vehicle Type" value={customer.used_commercial_vehicle?.vehicle_type} />
            <DetailRow label="Load Body Type" value={customer.used_commercial_vehicle?.load_body_type} />
            <DetailRow label="Body Length" value={customer.used_commercial_vehicle?.body_length} />
            <DetailRow label="Tyres Condition" value={customer.used_commercial_vehicle?.tyres_condition} />
            <DetailRow label="Tyre Count" value={customer.used_commercial_vehicle?.tyre_count} />
            <DetailRow label="Route Operated" value={customer.used_commercial_vehicle?.route_operated} />
            <DetailRow label="Major Repairs?" value={customer.used_commercial_vehicle?.major_repairs_required ? 'Yes' : 'No'} />
            <DetailRow label="Avg Trip KM" value={customer.used_commercial_vehicle?.average_trip_km} />
            <DetailRow label="Monthly Trips" value={customer.used_commercial_vehicle?.monthly_trips} />
          </Section>

          {/* Fleet Loans (Used Commercial) */}
          {customer.used_commercial_vehicle?.fleet_loans?.length > 0 && (loanType === 'used_commercial' || customer.loan_application?.loan_details?.loan_subcategory === 'used_commercial') && (
            <div className="mb-8 break-inside-avoid px-6">
              <h4 className="text-md font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Existing Fleet Loans</h4>
              <div className="space-y-4">
                {customer.used_commercial_vehicle.fleet_loans.map((loan, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold text-gray-600">Bank:</span> {loan.bank_name}</div>
                      <div><span className="font-semibold text-gray-600">Loan Amount:</span> ₹{loan.loan_amount}</div>
                      <div><span className="font-semibold text-gray-600">EMI:</span> ₹{loan.emi_amount}</div>
                      <div><span className="font-semibold text-gray-600">Tenure:</span> {loan.tenure} months</div>
                      <div><span className="font-semibold text-gray-600">Track (Months):</span> {loan.payment_track}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (mode === 'embed') {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-hidden backdrop-blur-sm print:p-0 print:bg-white print:relative print:z-auto print:block transition-opacity duration-300 opacity-100">
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

      {/* A4 Page Container */}
      {content}
    </div>
  );
};

export default CustomerFullDetails;
