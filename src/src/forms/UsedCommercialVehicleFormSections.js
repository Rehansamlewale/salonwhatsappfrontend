import React from 'react';
import {
  INTENDED_USE_OPTIONS,
  RESIDENTIAL_STATUS_OPTIONS,
  HOUSE_TYPE_OPTIONS,
  BUSINESS_PREMISES_OPTIONS,
  OTHER_INCOME_SOURCES,
  YES_NO_OPTIONS
} from './usedCommercialVehicleForm';

const UsedCommercialVehicleFormSections = ({
  formData,
  handleUsedCommercialVehicleChange,
  addFleetLoan,
  removeFleetLoan,
  handleFleetLoanChange,
  handleOtherIncomeSourceChange
}) => {
  return (
    <>
      {/* Section 1: Driving License & Experience */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🚛</span>
          Driving License & Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasValidLicense}
              onChange={(e) => handleUsedCommercialVehicleChange('hasValidLicense', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="text-base font-semibold text-gray-700">Do you have a valid driving license?</label>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">License Active Years</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.usedCommercialVehicle.licenseActiveYears}
              onChange={(e) => handleUsedCommercialVehicleChange('licenseActiveYears', e.target.value)}
              placeholder="e.g., 5"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Driving Experience (Years)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.usedCommercialVehicle.drivingExperienceYears}
              onChange={(e) => handleUsedCommercialVehicleChange('drivingExperienceYears', e.target.value)}
              placeholder="e.g., 10"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Intended Use of Vehicle</label>
            <select
              value={formData.usedCommercialVehicle.intendedUse}
              onChange={(e) => handleUsedCommercialVehicleChange('intendedUse', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {INTENDED_USE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 2: Current Fleet Details */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🚚</span>
          Current Fleet Details
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.ownsCommercialVehicles}
              onChange={(e) => handleUsedCommercialVehicleChange('ownsCommercialVehicles', e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="text-base font-semibold text-gray-700">Do you currently own any commercial vehicles?</label>
          </div>

          {formData.usedCommercialVehicle.ownsCommercialVehicles && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 animate-fadeIn">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Total Number of Vehicles</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  value={formData.usedCommercialVehicle.totalVehicles}
                  onChange={(e) => handleUsedCommercialVehicleChange('totalVehicles', e.target.value)}
                  placeholder="e.g., 3"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Vehicle Models</label>
                <input
                  type="text"
                  value={formData.usedCommercialVehicle.vehicleModels}
                  onChange={(e) => handleUsedCommercialVehicleChange('vehicleModels', e.target.value)}
                  placeholder="e.g., Tata Ace, Mahindra Bolero"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Loan-Free Vehicles</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  value={formData.usedCommercialVehicle.loanFreeVehicles}
                  onChange={(e) => handleUsedCommercialVehicleChange('loanFreeVehicles', e.target.value)}
                  placeholder="e.g., 2"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Vehicles with Active Loan</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  value={formData.usedCommercialVehicle.vehiclesWithLoan}
                  onChange={(e) => {
                    handleUsedCommercialVehicleChange('vehiclesWithLoan', e.target.value);
                    if (parseInt(e.target.value) > 0 && formData.usedCommercialVehicle.fleetActiveLoans.length === 0) {
                      addFleetLoan();
                    }
                  }}
                  placeholder="e.g., 1"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              {parseInt(formData.usedCommercialVehicle.vehiclesWithLoan) > 0 && (
                <div className="col-span-full space-y-4">
                  <h4 className="font-semibold text-gray-700 mt-2">Active Loan Details</h4>
                  {formData.usedCommercialVehicle.fleetActiveLoans.map((loan, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1">Finance Company</label>
                          <input
                            type="text"
                            value={loan.financeCompany}
                            onChange={(e) => handleFleetLoanChange(index, 'financeCompany', e.target.value)}
                            placeholder="e.g., HDFC Bank"
                            className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1">Loan Amount</label>
                          <input
                            type="number" onWheel={(e) => e.target.blur()}
                            value={loan.loanAmount}
                            onChange={(e) => handleFleetLoanChange(index, 'loanAmount', e.target.value)}
                            placeholder="₹ Amount"
                            min="0"
                            className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1">Tenure (Months)</label>
                          <input
                            type="number" onWheel={(e) => e.target.blur()}
                            value={loan.tenure}
                            onChange={(e) => handleFleetLoanChange(index, 'tenure', e.target.value)}
                            placeholder="e.g., 60"
                            min="0"
                            className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1">EMIs Paid On Time?</label>
                          <select
                            value={loan.emisOnTime}
                            onChange={(e) => handleFleetLoanChange(index, 'emisOnTime', e.target.value)}
                            className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-purple-500 outline-none bg-white"
                          >
                            {YES_NO_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {formData.usedCommercialVehicle.fleetActiveLoans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFleetLoan(index)}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFleetLoan}
                    className="text-base text-purple-600 font-semibold hover:text-purple-800 flex items-center space-x-1"
                  >
                    <span>+ Add Another Loan</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Ongoing Loans & CIBIL */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">💳</span>
          Ongoing Loans & CIBIL
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasOtherLoans}
              onChange={(e) => handleUsedCommercialVehicleChange('hasOtherLoans', e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
            />
            <label className="text-base font-semibold text-gray-700">Do you have any other ongoing loans? (Personal, Gold, Home, etc.)</label>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Total Monthly EMI Outflow</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.usedCommercialVehicle.totalMonthlyEmi}
              onChange={(e) => handleUsedCommercialVehicleChange('totalMonthlyEmi', e.target.value)}
              placeholder="₹ Total EMI"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">CIBIL Score (Approximate)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              value={formData.usedCommercialVehicle.ucvCibilScore}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvCibilScore', e.target.value)}
              placeholder="e.g., 750"
              min="300"
              max="900"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Personal Information */}
      {/* <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">👤</span>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.usedCommercialVehicle.ucvFullName || formData.name}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvFullName', e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Mobile Number</label>
            <input
              type="tel"
              value={formData.usedCommercialVehicle.ucvMobileNumber || formData.mobile1}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvMobileNumber', e.target.value)}
              placeholder="10-digit mobile"
              maxLength="10"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Village / City</label>
            <input
              type="text"
              value={formData.usedCommercialVehicle.ucvVillage || formData.city}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvVillage', e.target.value)}
              placeholder="Village or City"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Nearest Landmark</label>
            <input
              type="text"
              value={formData.usedCommercialVehicle.ucvNearestLandmark || formData.landmark}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvNearestLandmark', e.target.value)}
              placeholder="Nearest Landmark"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="col-span-full">
            <label className="block text-base font-semibold text-gray-700 mb-2">Complete Address</label>
            <textarea
              value={formData.usedCommercialVehicle.ucvCompleteAddress || formData.address}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvCompleteAddress', e.target.value)}
              placeholder="Complete Address"
              rows="3"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </section> */}

      {/* Section 5: Residential Details */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🏠</span>
          Residential Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Residential Status</label>
            <select
              value={formData.usedCommercialVehicle.ucvResidentialStatus}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvResidentialStatus', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {RESIDENTIAL_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">House Type</label>
            <select
              value={formData.usedCommercialVehicle.ucvHouseType}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvHouseType', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
            >
              {HOUSE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">House Registered in Name of</label>
            <input
              type="text"
              value={formData.usedCommercialVehicle.ucvHouseRegisteredName}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvHouseRegisteredName', e.target.value)}
              placeholder="Owner's Name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.ucvHasPanAadhar}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvHasPanAadhar', e.target.checked)}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label className="text-base font-semibold text-gray-700">PAN Card and Aadhaar Card Available?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.ucvLivesAtAadharAddress}
              onChange={(e) => handleUsedCommercialVehicleChange('ucvLivesAtAadharAddress', e.target.checked)}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label className="text-base font-semibold text-gray-700">Currently residing at Aadhaar address?</label>
          </div>
        </div>
      </section>

      {/* Section 6: Business Details */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">💼</span>
          Business Details
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasBusiness}
              onChange={(e) => handleUsedCommercialVehicleChange('hasBusiness', e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label className="text-base font-semibold text-gray-700">Do you have a business?</label>
          </div>

          {formData.usedCommercialVehicle.hasBusiness && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 animate-fadeIn">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Nature of Business</label>
                <input
                  type="text"
                  value={formData.usedCommercialVehicle.natureOfBusiness}
                  onChange={(e) => handleUsedCommercialVehicleChange('natureOfBusiness', e.target.value)}
                  placeholder="e.g., Transport, Trading"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Number of Years in Business</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  value={formData.usedCommercialVehicle.businessYears}
                  onChange={(e) => handleUsedCommercialVehicleChange('businessYears', e.target.value)}
                  placeholder="e.g., 5"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Business Premises</label>
                <select
                  value={formData.usedCommercialVehicle.businessPremises}
                  onChange={(e) => handleUsedCommercialVehicleChange('businessPremises', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-white"
                >
                  {BUSINESS_PREMISES_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {formData.usedCommercialVehicle.businessPremises === 'Rented' && (
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Monthly Rent</label>
                  <input
                    type="number" onWheel={(e) => e.target.blur()}
                    value={formData.usedCommercialVehicle.monthlyRent}
                    onChange={(e) => handleUsedCommercialVehicleChange('monthlyRent', e.target.value)}
                    placeholder="₹ Monthly Rent"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.usedCommercialVehicle.hasShopActUdyam}
                  onChange={(e) => handleUsedCommercialVehicleChange('hasShopActUdyam', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label className="text-base font-semibold text-gray-700">Shop Act / Udyam Registration?</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.usedCommercialVehicle.hasGstNumber}
                  onChange={(e) => handleUsedCommercialVehicleChange('hasGstNumber', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label className="text-base font-semibold text-gray-700">GST Number?</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.usedCommercialVehicle.filesItr}
                  onChange={(e) => handleUsedCommercialVehicleChange('filesItr', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label className="text-base font-semibold text-gray-700">File ITR (Last 2 Years)?</label>
              </div>

              {formData.usedCommercialVehicle.filesItr && (
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Annual Income as per ITR</label>
                  <input
                    type="number" onWheel={(e) => e.target.blur()}
                    value={formData.usedCommercialVehicle.annualIncomePerItr}
                    onChange={(e) => handleUsedCommercialVehicleChange('annualIncomePerItr', e.target.value)}
                    placeholder="₹ Annual Income"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 7: Agriculture & Additional Income */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-lime-100 text-lime-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🌾</span>
          Agriculture & Additional Income
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.ownsAgriLand}
              onChange={(e) => handleUsedCommercialVehicleChange('ownsAgriLand', e.target.checked)}
              className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500"
            />
            <label className="text-base font-semibold text-gray-700">Do you own agricultural land?</label>
          </div>

          {formData.usedCommercialVehicle.ownsAgriLand && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 animate-fadeIn">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Land Area (Acres / Gunthas)</label>
                <input
                  type="text"
                  value={formData.usedCommercialVehicle.landArea}
                  onChange={(e) => handleUsedCommercialVehicleChange('landArea', e.target.value)}
                  placeholder="e.g., 5 Acres"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Land Registered in Name of</label>
                <input
                  type="text"
                  value={formData.usedCommercialVehicle.landRegisteredName}
                  onChange={(e) => handleUsedCommercialVehicleChange('landRegisteredName', e.target.value)}
                  placeholder="Owner's Name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.usedCommercialVehicle.has712And8A}
                  onChange={(e) => handleUsedCommercialVehicleChange('has712And8A', e.target.checked)}
                  className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500"
                />
                <label className="text-base font-semibold text-gray-700">7/12 (Satbara) & 8A Documents Available?</label>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 mt-4">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasOtherIncome}
              onChange={(e) => handleUsedCommercialVehicleChange('hasOtherIncome', e.target.checked)}
              className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500"
            />
            <label className="text-base font-semibold text-gray-700">Do you have any other source of income?</label>
          </div>

          {formData.usedCommercialVehicle.hasOtherIncome && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
              {OTHER_INCOME_SOURCES.map(source => (
                <div key={source.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.usedCommercialVehicle.otherIncomeSources.includes(source.value)}
                    onChange={() => handleOtherIncomeSourceChange(source.value)}
                    className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500"
                  />
                  <label className="text-base text-gray-700">{source.label}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 8: Vehicle Documentation */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">📄</span>
          Vehicle Documentation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasOriginalRc}
              onChange={(e) => handleUsedCommercialVehicleChange('hasOriginalRc', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Original RC Available?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasHypothecation}
              onChange={(e) => handleUsedCommercialVehicleChange('hasHypothecation', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Existing Hypothecation on Vehicle?</label>
          </div>

          {formData.usedCommercialVehicle.hasHypothecation && (
            <>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Hypothecation Bank/Finance Company</label>
                <input
                  type="text"
                  value={formData.usedCommercialVehicle.hypothecationBank}
                  onChange={(e) => handleUsedCommercialVehicleChange('hypothecationBank', e.target.value)}
                  placeholder="Bank/Finance Company Name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Current Outstanding Loan Amount</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  value={formData.usedCommercialVehicle.outstandingLoanAmount}
                  onChange={(e) => handleUsedCommercialVehicleChange('outstandingLoanAmount', e.target.value)}
                  placeholder="₹ Outstanding Amount"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasNoc}
              onChange={(e) => handleUsedCommercialVehicleChange('hasNoc', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">NOC Available (if loan cleared)?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasComprehensiveInsurance}
              onChange={(e) => handleUsedCommercialVehicleChange('hasComprehensiveInsurance', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Comprehensive Insurance Active?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasFitnessCertificate}
              onChange={(e) => handleUsedCommercialVehicleChange('hasFitnessCertificate', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Fitness Certificate Valid?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.hasValidPermit}
              onChange={(e) => handleUsedCommercialVehicleChange('hasValidPermit', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Valid Permit?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.roadTaxPaid}
              onChange={(e) => handleUsedCommercialVehicleChange('roadTaxPaid', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Road Tax Paid?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.professionalTaxPaid}
              onChange={(e) => handleUsedCommercialVehicleChange('professionalTaxPaid', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Professional Tax Paid?</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.usedCommercialVehicle.greenTaxPaid}
              onChange={(e) => handleUsedCommercialVehicleChange('greenTaxPaid', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-base font-semibold text-gray-700">Green Tax Paid?</label>
          </div>
        </div>
      </section>
    </>
  );
};

export default UsedCommercialVehicleFormSections;
