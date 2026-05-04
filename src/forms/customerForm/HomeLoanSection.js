import React from 'react';
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  ORGANIZATION_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  LOAN_PURPOSE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PROPERTY_USAGE_OPTIONS,
  RELATIONSHIP_OPTIONS
} from '../homeLoanForm';

const HomeLoanSection = ({ formData, handleHomeLoanChange }) => {
  // Only show for home loans, LAP, or Business Finance
  if (formData.loanCategory !== 'home_loan' && formData.loanCategory !== 'lap' && formData.loanCategory !== 'business_finance') {
    return null;
  }

  // Determine section title based on loan category
  let sectionTitle = 'Home Loan Application Details';
  if (formData.loanCategory === 'lap') {
    sectionTitle = 'LAP (Loan Against Property) Details';
  } else if (formData.loanCategory === 'business_finance') {
    sectionTitle = 'Business Finance Application Details';
  }

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">??</span>
        {sectionTitle}
      </h3>

      {/* 1. Additional Applicant Personal Details */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">??</span> Additional Personal Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Gender</label>
            <select
              value={formData.homeLoan.applicantGender}
              onChange={(e) => handleHomeLoanChange('applicantGender', e.target.value)}

              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {GENDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Marital Status</label>
            <select
              value={formData.homeLoan.applicantMaritalStatus}
              onChange={(e) => handleHomeLoanChange('applicantMaritalStatus', e.target.value)}

              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {MARITAL_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Employment Details - Conditional based on occupation type */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">??</span> Employment / Income Details
        </h4>

        {formData.occupationType === 'Job' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Employer Name</label>
              <input
                type="text"
                value={formData.homeLoan.employerName}
                onChange={(e) => handleHomeLoanChange('employerName', e.target.value)}

                placeholder="Company Name"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Organization Type</label>
              <select
                value={formData.homeLoan.organizationType}
                onChange={(e) => handleHomeLoanChange('organizationType', e.target.value)}

                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
              >
                {ORGANIZATION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Designation</label>
              <input
                type="text"
                value={formData.homeLoan.designation}
                onChange={(e) => handleHomeLoanChange('designation', e.target.value)}
                placeholder="e.g., Senior Manager"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Total Work Experience (Years)</label>
              <input
                type="number" onWheel={(e) => e.target.blur()}
                value={formData.homeLoan.totalWorkExperience}
                onChange={(e) => handleHomeLoanChange('totalWorkExperience', e.target.value)}
                placeholder="e.g., 10"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Monthly Gross Salary (?)</label>
              <input
                type="number" onWheel={(e) => e.target.blur()}
                value={formData.homeLoan.monthlyGrossSalary}
                onChange={(e) => handleHomeLoanChange('monthlyGrossSalary', e.target.value)}
                placeholder="e.g., 80000"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Monthly Net Salary (?)</label>
              <input
                type="number" onWheel={(e) => e.target.blur()}
                value={formData.homeLoan.monthlyNetSalary}
                onChange={(e) => handleHomeLoanChange('monthlyNetSalary', e.target.value)}
                placeholder="e.g., 65000"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        )}

        {formData.occupationType === 'Business' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Business Type</label>
              <select
                value={formData.homeLoan.businessType}
                onChange={(e) => handleHomeLoanChange('businessType', e.target.value)}

                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
              >
                {BUSINESS_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Nature of Business</label>
              <input
                type="text"
                value={formData.homeLoan.natureOfBusiness}
                onChange={(e) => handleHomeLoanChange('natureOfBusiness', e.target.value)}
                placeholder="e.g., Retail, Manufacturing"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Business Vintage (Years)</label>
              <input
                type="number" onWheel={(e) => e.target.blur()}
                value={formData.homeLoan.businessVintage}
                onChange={(e) => handleHomeLoanChange('businessVintage', e.target.value)}
                placeholder="e.g., 5"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Annual Turnover (?)</label>
              <input
                type="number" onWheel={(e) => e.target.blur()}
                value={formData.homeLoan.annualTurnover1}
                onChange={(e) => handleHomeLoanChange('annualTurnover1', e.target.value)}
                placeholder="Annual Turnover (?)"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Co-Applicant Details - Multiple */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-700 flex items-center">
            <span className="mr-2">??</span> Co-Applicants
          </h4>
          <button
            type="button"
            onClick={() => {
              const newCoApplicant = {
                name: '',
                relationship: '',
                dob: '',
                income: '',
                occupation: '',
                mobile: ''
              };
              const currentCoApplicants = formData.homeLoan.coApplicants || [];
              handleHomeLoanChange('coApplicants', [...currentCoApplicants, newCoApplicant]);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base font-medium flex items-center gap-2 transition-colors"
          >
            <span className="text-lg">+</span> Add Co-Applicant
          </button>
        </div>

        {(formData.homeLoan.coApplicants || []).length === 0 && (
          <p className="text-gray-500 text-base text-center py-4">No co-applicants added. Click "Add Co-Applicant" to add one.</p>
        )}

        {(formData.homeLoan.coApplicants || []).map((coApplicant, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 mb-4 relative">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold text-blue-700">Co-Applicant #{index + 1}</span>
              <button
                type="button"
                onClick={() => {
                  const updatedCoApplicants = formData.homeLoan.coApplicants.filter((_, i) => i !== index);
                  handleHomeLoanChange('coApplicants', updatedCoApplicants);
                }}
                className="text-red-500 hover:text-red-700 text-base font-medium flex items-center gap-1"
              >
                ? Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={coApplicant.name}
                  onChange={(e) => {
                    const updated = [...formData.homeLoan.coApplicants];
                    updated[index] = { ...updated[index], name: e.target.value };
                    handleHomeLoanChange('coApplicants', updated);
                  }}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Relationship</label>
                <select
                  value={coApplicant.relationship}
                  onChange={(e) => {
                    const updated = [...formData.homeLoan.coApplicants];
                    updated[index] = { ...updated[index], relationship: e.target.value };
                    handleHomeLoanChange('coApplicants', updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
                >
                  {RELATIONSHIP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={coApplicant.dob}
                  onChange={(e) => {
                    const updated = [...formData.homeLoan.coApplicants];
                    updated[index] = { ...updated[index], dob: e.target.value };
                    handleHomeLoanChange('coApplicants', updated);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  value={coApplicant.occupation || ''}
                  onChange={(e) => {
                    const updated = [...formData.homeLoan.coApplicants];
                    updated[index] = { ...updated[index], occupation: e.target.value };
                    handleHomeLoanChange('coApplicants', updated);
                  }}
                  placeholder="e.g., Salaried, Business"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Monthly Income (?)</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  value={coApplicant.income}
                  onChange={(e) => {
                    const updated = [...formData.homeLoan.coApplicants];
                    updated[index] = { ...updated[index], income: e.target.value };
                    handleHomeLoanChange('coApplicants', updated);
                  }}
                  placeholder="e.g., 50000"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={coApplicant.mobile || ''}
                  onChange={(e) => {
                    const updated = [...formData.homeLoan.coApplicants];
                    updated[index] = { ...updated[index], mobile: e.target.value };
                    handleHomeLoanChange('coApplicants', updated);
                  }}
                  placeholder="10-digit mobile"
                  maxLength="10"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Loan Requirement */}
      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">??</span> Loan Requirement
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Purpose of Loan</label>
            <select
              value={formData.homeLoan.loanPurpose}
              onChange={(e) => handleHomeLoanChange('loanPurpose', e.target.value)}

              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {LOAN_PURPOSE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Required Loan Amount (?)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.requiredLoanAmount}
              onChange={(e) => handleHomeLoanChange('requiredLoanAmount', e.target.value)}

              placeholder="e.g., 5000000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Preferred Tenure (Years)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.preferredTenure}
              onChange={(e) => handleHomeLoanChange('preferredTenure', e.target.value)}
              placeholder="e.g., 20"
              min="1"
              max="30"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Expected EMI Range (?)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.expectedEmi}
              onChange={(e) => handleHomeLoanChange('expectedEmi', e.target.value)}
              placeholder="e.g., 45000"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. Property Details */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">??</span> Property Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Property Type</label>
            <select
              value={formData.homeLoan.propertyType}
              onChange={(e) => handleHomeLoanChange('propertyType', e.target.value)}

              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {PROPERTY_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Property Usage</label>
            <select
              value={formData.homeLoan.propertyUsage}
              onChange={(e) => handleHomeLoanChange('propertyUsage', e.target.value)}

              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {PROPERTY_USAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-base font-semibold text-gray-700 mb-2">Property Address</label>
            <textarea
              value={formData.homeLoan.propertyAddress}
              onChange={(e) => handleHomeLoanChange('propertyAddress', e.target.value)}

              placeholder="Full property address"
              rows="2"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.homeLoan.propertyCity}
              onChange={(e) => handleHomeLoanChange('propertyCity', e.target.value)}

              placeholder="City"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Pincode</label>
            <input
              type="text"
              value={formData.homeLoan.propertyPincode}
              onChange={(e) => handleHomeLoanChange('propertyPincode', e.target.value)}
              placeholder="6-digit pincode"
              maxLength="6"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Plot Area/Land (sq.ft)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.carpetArea}
              onChange={(e) => handleHomeLoanChange('carpetArea', e.target.value)}
              placeholder="e.g., 1200"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Construction Area (sq.ft)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.builtUpArea}
              onChange={(e) => handleHomeLoanChange('builtUpArea', e.target.value)}
              placeholder="e.g., 1500"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Agreement Value (?)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.agreementValue}
              onChange={(e) => handleHomeLoanChange('agreementValue', e.target.value)}

              placeholder="e.g., 6000000"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Market Value (?)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.homeLoan.marketValue}
              onChange={(e) => handleHomeLoanChange('marketValue', e.target.value)}
              placeholder="e.g., 6500000"
              min="0"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6. Builder/Seller Details */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">???</span> Builder / Seller Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Seller/Builder Name</label>
            <input
              type="text"
              value={formData.homeLoan.sellerName}
              onChange={(e) => handleHomeLoanChange('sellerName', e.target.value)}

              placeholder="Seller or Builder Name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.homeLoan.projectName}
              onChange={(e) => handleHomeLoanChange('projectName', e.target.value)}
              placeholder="If applicable"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">RERA Registration Number</label>
            <input
              type="text"
              value={formData.homeLoan.reraNumber}
              onChange={(e) => handleHomeLoanChange('reraNumber', e.target.value)}
              placeholder="RERA Number"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Seller Contact Details</label>
            <input
              type="tel"
              value={formData.homeLoan.sellerContact}
              onChange={(e) => handleHomeLoanChange('sellerContact', e.target.value)}
              placeholder="Mobile Number"
              maxLength="10"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLoanSection;
