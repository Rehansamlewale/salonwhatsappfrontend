import React from 'react';

const ResidenceSection = ({ formData, errors, handleChange }) => {
  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🏠</span>
        Residence Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Ownership Type</label>
          <select name="residenceType" value={formData.residenceType} onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
            <option value="">Select Type</option>
            <option value="Own">Owned</option>
            <option value="Rented">Rented</option>
          </select>
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">House Category</label>
          <select name="houseCategory" value={formData.houseCategory} onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white">
            <option value="">Select Category</option>
            <option value="Bungalow">Bungalow</option>
            <option value="Flat">Flat</option>
            <option value="Koularu">Tiled Roof (Koularu)</option>
            <option value="Sheet">Sheet Metal (Patryache)</option>
          </select>
          {errors.houseCategory && <span className="text-red-500 text-sm mt-1 block">{errors.houseCategory}</span>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">House Owner Name</label>
          <input type="text" name="houseOwnerName" value={formData.houseOwnerName} onChange={handleChange} placeholder="Name on property docs"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          {errors.houseOwnerName && <span className="text-red-500 text-sm mt-1 block">{errors.houseOwnerName}</span>}
        </div>

        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <input type="checkbox" name="livesAtAadharAddress" checked={formData.livesAtAadharAddress} onChange={handleChange}
            className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
          <label className="text-base text-gray-700">Different from Aadhar address?</label>
        </div>


        {/* Conditional Rent Agreement Checkbox */}
        {(formData.livesAtAadharAddress || formData.residenceType === 'Rented') && (
          <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
            <input
              type="checkbox"
              name="hasRentAgreement"
              checked={formData.hasRentAgreement || false}
              onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500"
            />
            <label className="text-base text-gray-700">Rent Agreement</label>
          </div>
        )}

        <div className="col-span-1 md:col-span-2">
          <label className="block text-base font-semibold text-gray-700 mb-2">Remark</label>
          <textarea
            name="residenceRemark"
            value={formData.residenceRemark || ''}
            onChange={handleChange}
            placeholder="Enter any additional remarks regarding residence..."
            rows="3"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
          />
        </div>
      </div>
    </section>
  );
};

export default ResidenceSection;
