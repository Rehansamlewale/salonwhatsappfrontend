import React from 'react';
import { LOAN_CATEGORY_NAMES, LOAN_SUBCATEGORIES } from './loanTypes';

const LoanCategorySection = ({ formData, handleCategoryChange, handleSubcategoryChange }) => {
  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">📋</span>
        Select Loan Category & Type
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Main Loan Category *
          </label>
          <select
            name="loanCategory"
            value={formData.loanCategory}
            onChange={handleCategoryChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-base"
          >
            <option value="">Select Loan Category</option>
            {Object.entries(LOAN_CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Loan Subcategory *
          </label>
          <select
            name="loanSubcategory"
            value={formData.loanSubcategory}
            onChange={handleSubcategoryChange}
            required
            disabled={!formData.loanCategory}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Loan Type</option>
            {formData.loanCategory && Object.entries(LOAN_SUBCATEGORIES[formData.loanCategory] || {}).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default LoanCategorySection;
