import React from 'react';
import {
  LOAN_CATEGORY_NAMES,
  LOAN_CATEGORIES,
  LOAN_SUBCATEGORIES,
  LOAN_PURPOSE_OPTIONS,
  LOAN_TYPES
} from '../loanTypes';

const LoanCategorySection = ({ formData, handleCategoryChange, handleSubcategoryChange, handleInputChange }) => {
  const showPurposeDropdown = [LOAN_TYPES.USED_CAR, LOAN_TYPES.USED_COMMERCIAL].includes(formData.loanSubcategory);
  const showMachineQuotation = formData.loanCategory === LOAN_CATEGORIES.BUSINESS_FINANCE && formData.loanSubcategory === LOAN_TYPES.MACHINERY_LOAN;

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">📋</span>
        Select Loan Category & Type
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Main Loan Category
          </label>
          <select
            name="loanCategory"
            value={formData.loanCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-base"
          >
            <option value="">Select Loan Category</option>
            {Object.entries(LOAN_CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Loan Subcategory
          </label>
          <select
            name="loanSubcategory"
            value={formData.loanSubcategory}
            onChange={handleSubcategoryChange}
            disabled={!formData.loanCategory}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Loan Type</option>
            {formData.loanCategory && Object.entries(LOAN_SUBCATEGORIES[formData.loanCategory] || {}).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {showPurposeDropdown && (
        <div className="mt-4 sm:mt-6">
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Loan Purpose
          </label>
          <select
            name="loanPurpose"
            value={formData.loanPurpose || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-base"
          >
            <option value="">Select Purpose</option>
            {LOAN_PURPOSE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      )}

      {showMachineQuotation && (
        <div className="mt-4 sm:mt-6">
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Machine Quotation (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="machineQuotation"
            value={formData.machineQuotation || ''}
            onChange={handleInputChange}
            placeholder="Enter machine quotation amount"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      )}

      {[
        LOAN_CATEGORIES.PERSONAL_LOAN,
        LOAN_CATEGORIES.BUSINESS_LOAN,
        LOAN_CATEGORIES.AGRICULTURE_LOAN,
        LOAN_CATEGORIES.EDUCATION_LOAN,
        LOAN_CATEGORIES.GOVERNMENT_SCHEME,
        LOAN_CATEGORIES.GOLD_LOAN
      ].includes(formData.loanCategory) && (
          <div className="mt-4 sm:mt-6">
            <label className="block text-base font-semibold text-gray-700 mb-2">
              Required Loan Amount (₹)
            </label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              name="requiredLoanAmount"
              value={formData.requiredLoanAmount || ''}
              onChange={handleInputChange}
              placeholder="Enter required loan amount"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        )}
    </section>
  );
};

export default LoanCategorySection;
