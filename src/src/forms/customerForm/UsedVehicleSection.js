import React from 'react';
import { FUEL_TYPES } from '../loanTypes';

const UsedVehicleSection = ({ formData, errors, handleChange }) => {
  // Only show for used vehicle loans
  if (!(formData.loanSubcategory === 'used_car' || formData.loanSubcategory === 'used_commercial')) {
    return null;
  }

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🚗</span>
        Vehicle Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            1. Registration Number
          </label>
          <input
            type="text"
            name="vehicleRegistrationNumber"
            value={formData.vehicleRegistrationNumber}
            onChange={handleChange}
            placeholder="e.g., MH12AB1234"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none uppercase"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            2. Vehicle Type
          </label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Select Vehicle Type</option>
            <option value="Car">Car</option>
            <option value="Commercial Vehicle">Commercial Vehicle</option>
            <option value="Two Wheeler">Two Wheeler</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            3. Vehicle Name
          </label>
          <input
            type="text"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            placeholder="e.g., Maruti Swift VXI"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            4. Fuel Type
          </label>
          <select
            name="vehicleFuelType"
            value={formData.vehicleFuelType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Select Fuel Type</option>
            {FUEL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            5. Manufacturing Year
          </label>
          <input
            type="month"
            name="vehicleManufacturingYear"
            value={formData.vehicleManufacturingYear}
            onChange={handleChange}
            max={new Date().toISOString().slice(0, 7)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
          />
          {errors.vehicleManufacturingYear && <span className="text-red-500 text-sm mt-1 block">{errors.vehicleManufacturingYear}</span>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            6. Number of Owners
          </label>
          <select
            name="vehicleNumberOfOwners"
            value={formData.vehicleNumberOfOwners}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Select</option>
            <option value="1st Owner">1st Owner</option>
            <option value="2nd Owner">2nd Owner</option>
            <option value="3rd Owner">3rd Owner</option>
            <option value="4th Owner">4th Owner</option>
            <option value="5+ Owners">5+ Owners</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            7. KM Reading (Odometer)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="vehicleKmReading"
            value={formData.vehicleKmReading}
            onChange={handleChange}
            placeholder="e.g., 45000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
          />
          {errors.vehicleKmReading && <span className="text-red-500 text-sm mt-1 block">{errors.vehicleKmReading}</span>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            8. Purchase Price (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="vehiclePurchasePrice"
            value={formData.vehiclePurchasePrice}
            onChange={handleChange}
            placeholder="e.g., 500000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
          />
          {errors.vehiclePurchasePrice && <span className="text-red-500 text-sm mt-1 block">{errors.vehiclePurchasePrice}</span>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            9. Loan Amount Required (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="vehicleLoanAmountRequired"
            value={formData.vehicleLoanAmountRequired}
            onChange={handleChange}
            required={formData.loanCategory === 'vehicle_loan'}
            placeholder="e.g., 400000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
          />
          {errors.vehicleLoanAmountRequired && <span className="text-red-500 text-sm mt-1 block">{errors.vehicleLoanAmountRequired}</span>}
        </div>

        {/* Hypothecation Section */}
        <div className="md:col-span-2">
          <label className="block text-base font-semibold text-gray-700 mb-3">
            10. Hypothecation
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="vehicleHypothecation"
                value="yes"
                checked={formData.vehicleHypothecation === 'yes'}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-gray-700">Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="vehicleHypothecation"
                value="no"
                checked={formData.vehicleHypothecation === 'no'}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-gray-700">No</span>
            </label>
          </div>

          {formData.vehicleHypothecation === 'yes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-4 border-green-200">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Bank / Finance Name :
                </label>
                <input
                  type="text"
                  name="vehicleHypothecationBankName"
                  value={formData.vehicleHypothecationBankName || ''}
                  onChange={handleChange}
                  placeholder="Enter bank or finance company name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Balance Amount (₹) :
                </label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  name="vehicleHypothecationBalanceAmount"
                  value={formData.vehicleHypothecationBalanceAmount || ''}
                  onChange={handleChange}
                  placeholder="e.g., 150000"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Insurance Section */}
        <div className="md:col-span-2">
          <label className="block text-base font-semibold text-gray-700 mb-3">
            11. Insurance
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="vehicleInsurance"
                value="yes"
                checked={formData.vehicleInsurance === 'yes'}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-gray-700">Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="vehicleInsurance"
                value="no"
                checked={formData.vehicleInsurance === 'no'}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-2 text-gray-700">No</span>
            </label>
          </div>

          {formData.vehicleInsurance === 'yes' && (
            <div className="mt-4 pl-4 border-l-4 border-green-200">
              <div className="max-w-md">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  IDV Amount (₹) :
                </label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  name="vehicleInsuranceIdvAmount"
                  value={formData.vehicleInsuranceIdvAmount || ''}
                  onChange={handleChange}
                  placeholder="e.g., 450000"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UsedVehicleSection;
