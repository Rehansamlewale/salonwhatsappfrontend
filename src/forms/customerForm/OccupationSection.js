import React from 'react';

const OccupationSection = ({
  formData,
  errors,
  handleChange,
  addPartner,
  removePartner,
  handlePartnerChange

}) => {

  const getNumericValue = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const calculateTotalAnnualIncome = () => {
    // 1. Main Applicant Income
    let mainIncome = 0;
    if (formData.occupationType === 'Job') {
      mainIncome = getNumericValue(formData.grossSalary) * 12;
    } else if (formData.occupationType === 'Business') {
      mainIncome = getNumericValue(formData.yearlyIncome);
    }

    // 2. Farm / Extra Income
    const farmIncome = getNumericValue(formData.extraIncomeAmount);

    // 3. Co-Applicant Income
    const coApplicantIncome = (formData.coApplicants || []).reduce((sum, app) => {
      return sum + (getNumericValue(app.income) * 12);
    }, 0);

    return {
      main: mainIncome,
      farm: farmIncome,
      coApplicant: coApplicantIncome,
      total: mainIncome + farmIncome // Exclude coApplicantIncome as per request
    };
  };

  const incomeStats = calculateTotalAnnualIncome();

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">💼</span>
        Occupation / Job
      </h3>

      <div className="mb-4 sm:mb-4">
        <label className="block text-base font-semibold text-gray-700 mb-3">Occupation Type</label>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <input type="radio" name="occupationType" value="Job" checked={formData.occupationType === 'Job'} onChange={handleChange}
              className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <span className="font-medium text-gray-700">Job / Salaried</span>
          </label>
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <input type="radio" name="occupationType" value="Business" checked={formData.occupationType === 'Business'} onChange={handleChange}
              className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <span className="font-medium text-gray-700">Business / Self-Employed</span>
          </label>
        </div>
      </div>

      {formData.occupationType === 'Job' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 animate-fadeIn">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-base font-semibold text-gray-700 mb-2">Company Name</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
              placeholder="e.g., ABC Corporation"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Manager, Engineer"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Job Experience</label>
            <input type="text" name="jobYears" value={formData.jobYears} onChange={handleChange} placeholder="e.g. 2 years"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Gross Salary (₹)</label>
            <input type="number" onWheel={(e) => e.target.blur()} name="grossSalary" value={formData.grossSalary} onChange={handleChange}
              placeholder="e.g., 30000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
            {errors.grossSalary && <span className="text-red-500 text-sm mt-1 block">{errors.grossSalary}</span>}
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Net Salary (₹)</label>
            <input type="number" onWheel={(e) => e.target.blur()} name="netSalary" value={formData.netSalary} onChange={handleChange}
              placeholder="e.g., 25000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
            {errors.netSalary && <span className="text-red-500 text-sm mt-1 block">{errors.netSalary}</span>}
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" name="hasForm16" checked={formData.hasForm16} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base text-gray-700">Form 16 Available?</label>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" name="hasSalarySlips" checked={formData.hasSalarySlips} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base text-gray-700">3 Months Salary Slips Available?</label>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" name="hasBankStatement" checked={formData.hasBankStatement} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base text-gray-700">Bank Statement Available?</label>
          </div>

          {/* PF Option */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-base font-semibold text-gray-700 mb-3">PF (Provident Fund)</label>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
                <input
                  type="radio"
                  name="hasPF"
                  value="true"
                  checked={formData.hasPF === true}
                  onChange={(e) => handleChange({ target: { name: 'hasPF', type: 'checkbox', checked: true } })}
                  className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
                <input
                  type="radio"
                  name="hasPF"
                  value="false"
                  checked={formData.hasPF === false}
                  onChange={(e) => handleChange({ target: { name: 'hasPF', type: 'checkbox', checked: false } })}
                  className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {formData.occupationType === 'Business' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4 animate-fadeIn">
          {/* Business Finance Specific Fields */}
          {formData.loanCategory === 'business_finance' && (
            <>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Business Entity Type</label>
                <select name="businessEntityType" value={formData.businessEntityType} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
                  <option value="">Select Entity Type</option>
                  <option value="Proprietorship">Firm (Proprietorship)</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Pvt Ltd">Pvt. Ltd.</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-3">GST Registered?</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="hasGST" checked={formData.hasGST === true}
                      onChange={() => handleChange({ target: { name: 'hasGST', type: 'checkbox', checked: true } })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="hasGST" checked={formData.hasGST === false}
                      onChange={() => handleChange({ target: { name: 'hasGST', type: 'checkbox', checked: false } })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">Business Address</label>
                <textarea name="businessAddress" value={formData.businessAddress} onChange={handleChange} rows="2"
                  placeholder="Complete Business Address"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"></textarea>
              </div>

              {/* Stock Valuation Section */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    name="hasStockValuation"
                    checked={formData.hasStockValuation || false}
                    onChange={handleChange}
                    className="flex-shrink-0 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-base font-semibold text-gray-700">Stock Valuation</label>
                </div>

                {formData.hasStockValuation && (
                  <div className="mt-3 pl-4 border-l-4 border-blue-200">
                    <label className="block text-base font-medium text-gray-700 mb-2">Stock Valuation Amount (₹)</label>
                    <input
                      type="number" onWheel={(e) => e.target.blur()}
                      name="stockValuationAmount"
                      value={formData.stockValuationAmount || ''}
                      onChange={handleChange}
                      placeholder="e.g., 500000"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="col-span-1 md:col-span-2">
            <label className="block text-base font-semibold text-gray-700 mb-2">Business Name/Type</label>
            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
              placeholder="e.g., Retail Shop, Transport Service"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Years in Business</label>
            <input type="text" name="businessYears" value={formData.businessYears} onChange={handleChange}
              placeholder="e.g., 5 years"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Shop/Place</label>
            <select name="businessPlaceType" value={formData.businessPlaceType} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
              <option value="">Select Type</option>
              <option value="Own">Owned</option>
              <option value="Rented">Rented</option>
            </select>
          </div>
          {formData.businessPlaceType === 'Rented' && (
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Monthly Rent (₹)</label>
              <input type="number" onWheel={(e) => e.target.blur()} name="businessRentAmount" value={formData.businessRentAmount} onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              {errors.businessRentAmount && <span className="text-red-500 text-sm mt-1 block">{errors.businessRentAmount}</span>}
            </div>
          )}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Yearly Income (₹)</label>
            <input type="number" onWheel={(e) => e.target.blur()} name="yearlyIncome" value={formData.yearlyIncome} onChange={handleChange}
              placeholder="e.g., 500000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
            {errors.yearlyIncome && <span className="text-red-500 text-sm mt-1 block">{errors.yearlyIncome}</span>}
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Yearly Turnover (₹)</label>
            <input type="number" onWheel={(e) => e.target.blur()} name="yearlyTurnover" value={formData.yearlyTurnover} onChange={handleChange}
              placeholder="e.g., 1000000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
            {errors.yearlyTurnover && <span className="text-red-500 text-sm mt-1 block">{errors.yearlyTurnover}</span>}
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" name="hasShopAct" checked={formData.hasShopAct} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base text-gray-700">Shop Act Available?</label>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" name="hasUdyamReg" checked={formData.hasUdyamReg} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base text-gray-700">Udyam Registration Available?</label>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <input type="checkbox" name="itrFiled" checked={formData.itrFiled} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base text-gray-700">ITR Filed (Last 3 Years)?</label>
          </div>

          {/* Partners Section (Only for Partnership/LLP in Business Finance) */}
          {formData.loanCategory === 'business_finance' && (formData.businessEntityType === 'Partnership' || formData.businessEntityType === 'LLP') && (
            <div className="col-span-1 md:col-span-2 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">Partners Details</h4>
                <button
                  type="button"
                  onClick={addPartner}
                  className="text-base bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + Add Partner
                </button>
              </div>

              {formData.partners && formData.partners.length > 0 ? (
                <div className="space-y-4">
                  {formData.partners.map((partner, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded border">
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Partner Name"
                          value={partner.name}
                          onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-base outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <input
                          type="tel"
                          placeholder="Mobile Number"
                          value={partner.mobile}
                          onChange={(e) => handlePartnerChange(index, 'mobile', e.target.value)}
                          maxLength="10"
                          className="w-full px-3 py-2 border rounded-md text-base outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePartner(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Remove Partner"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500 italic text-center py-2">No partners added yet. Click "+ Add Partner" to add details.</p>
              )}
            </div>
          )}
        </div>
      )}
      {/* Total Annual Family Income Summary */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h4 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
          <span className="text-xl mr-2">💰</span> Total Annual Family Income
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Main Applicant</span>
            <div className="text-lg font-bold text-gray-800">₹{incomeStats.main.toLocaleString('en-IN')}</div>
            <div className="text-xs text-gray-500 mt-1">{formData.occupationType === 'Job' ? '(Gross Salary × 12)' : '(Yearly Income)'}</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Farm/Extra Income</span>
            <div className="text-lg font-bold text-gray-800">₹{incomeStats.farm.toLocaleString('en-IN')}</div>
          </div>
          {/* Co-Applicants removed from total as per request */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 rounded-lg shadow-md text-white">
            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wide">Total Annual</span>
            <div className="text-xl font-bold">₹{incomeStats.total.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccupationSection;
