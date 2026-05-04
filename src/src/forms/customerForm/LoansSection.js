import React from 'react';

const LoansSection = ({ formData, errors, handleChange, handleLoanChange, addLoan, removeLoan }) => {
  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">💳</span>
        Current Loans & CIBIL Score
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg h-min mb-4 w-min whitespace-nowrap">
            <input type="checkbox" name="existingLoan" checked={formData.existingLoan} onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base font-semibold text-gray-700">Any other active loans?</label>
          </div>

          {formData.existingLoan && (
            <div className="space-y-4 animate-fadeIn mb-4 pl-2">
              {formData.activeLoans.map((loan, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Bank Name</label>
                      <input type="text" value={loan.bankName}
                        onChange={(e) => handleLoanChange(index, 'bankName', e.target.value)}
                        placeholder="Bank Name"
                        className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Loan Type</label>
                      <input type="text" value={loan.loanType || ''}
                        onChange={(e) => handleLoanChange(index, 'loanType', e.target.value)}
                        placeholder="e.g. Home Loan, Car Loan"
                        className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Loan Amount</label>
                      <input type="number" onWheel={(e) => e.target.blur()} value={loan.loanAmount}
                        onChange={(e) => handleLoanChange(index, 'loanAmount', e.target.value)}
                        placeholder="₹ Amount"
                        min="0"
                        className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Tenure (Months)</label>
                      <input type="number" onWheel={(e) => e.target.blur()} value={loan.tenure || ''}
                        onChange={(e) => handleLoanChange(index, 'tenure', e.target.value)}
                        placeholder="e.g. 60"
                        min="0"
                        className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Monthly EMI</label>
                      <input type="number" onWheel={(e) => e.target.blur()} value={loan.emi}
                        onChange={(e) => handleLoanChange(index, 'emi', e.target.value)}
                        placeholder="₹ EMI"
                        min="0"
                        className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Outstanding amount</label>
                      <input type="number" onWheel={(e) => e.target.blur()} value={loan.outstandingAmount || ''}
                        onChange={(e) => handleLoanChange(index, 'outstandingAmount', e.target.value)}
                        placeholder="₹ Outstanding Amount"
                        min="0"
                        className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  {/* Remove Button */}
                  {formData.activeLoans.length > 1 && (
                    <button type="button" onClick={() => removeLoan(index)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addLoan}
                className="text-base text-blue-600 font-semibold hover:text-blue-800 flex items-center space-x-1">
                <span>+ Add Another Loan</span>
              </button>
            </div>
          )}
        </div>

        <div className="col-span-1">
          <label className="block text-base font-semibold text-gray-700 mb-2">CIBIL Score (if known)</label>
          <input type="text" name="cibilScore" value={formData.cibilScore} onChange={handleChange} placeholder="e.g. 750, NA, Not Available"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none max-w-xs" />
          {errors.cibilScore && <span className="text-red-500 text-sm mt-1 block">{errors.cibilScore}</span>}
        </div>
      </div>
    </section>
  );
};

export default LoansSection;
