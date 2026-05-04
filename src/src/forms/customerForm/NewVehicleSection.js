import React, { useEffect } from 'react';
import { FUEL_TYPES } from '../loanTypes';

const NewVehicleSection = ({ formData, handleChange }) => {
  // Auto-calculate Other Charges
  useEffect(() => {
    const invoice = parseFloat(formData.newVehicleInvoicePrice) || 0;
    const insurance = parseFloat(formData.newVehicleInsurance) || 0;
    const tax = parseFloat(formData.newVehicleTax) || 0;
    const total = parseFloat(formData.newVehicleTotal) || 0;

    // Formula: Other = Total - (Invoice + Insurance + Tax)
    const otherCharges = total - (invoice + insurance + tax);

    // Only update if value has changed (and ensure not negative 0 or precision errors causing loops)
    // We update even if negative, as it helps user debug their inputs
    const currentOther = parseFloat(formData.newVehicleOther) || 0;

    if (currentOther !== otherCharges) {
      handleChange({ target: { name: 'newVehicleOther', value: otherCharges } });
    }
  }, [formData.newVehicleInvoicePrice, formData.newVehicleInsurance, formData.newVehicleTax, formData.newVehicleTotal, formData.newVehicleOther, handleChange]);

  // Only show for new vehicle loans
  if (!(formData.loanSubcategory === 'new_car' || formData.loanSubcategory === 'new_commercial')) {
    return null;
  }

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🚙</span>
        New Vehicle Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Vehicle Type
          </label>
          <select
            name="newVehicleType"
            value={formData.newVehicleType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Select Vehicle Type</option>
            <option value="Car">Car</option>
            <option value="Commercial Vehicle">Commercial Vehicle</option>
            <option value="Two Wheeler">Two Wheeler</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Vehicle Name
          </label>
          <input
            type="text"
            name="newVehicleModel"
            value={formData.newVehicleModel}
            onChange={handleChange}
            placeholder="e.g., Maruti Swift VXI"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Fuel Type
          </label>
          <select
            name="newVehicleFuelType"
            value={formData.newVehicleFuelType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Select Fuel Type</option>
            {FUEL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Invoice Price (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="newVehicleInvoicePrice"
            value={formData.newVehicleInvoicePrice}
            onChange={handleChange}
            placeholder="e.g., 800000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Usage Type
          </label>
          <select
            name="newVehicleUsageType"
            value={formData.newVehicleUsageType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="">Select Usage Type</option>
            {/* <option value="Private">Private</option> */}
            <option value="Personal Use">Personal Use</option>
            <option value="T-Permit">T-Permit (Commercial)</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Insurance (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="newVehicleInsurance"
            value={formData.newVehicleInsurance}
            onChange={handleChange}
            placeholder="e.g., 25000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Tax (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="newVehicleTax"
            value={formData.newVehicleTax}
            onChange={handleChange}
            placeholder="e.g., 80000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            On-Road Total Price (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="newVehicleTotal"
            value={formData.newVehicleTotal}
            onChange={handleChange}
            placeholder="e.g., 950000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Other Charges (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="newVehicleOther"
            value={formData.newVehicleOther}
            readOnly
            placeholder="Calculated automatically"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Loan Amount Required (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            name="vehicleLoanAmountRequired"
            value={formData.vehicleLoanAmountRequired}
            onChange={handleChange}
            placeholder="e.g., 700000"
            min="0"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Heavy License - Only for New Commercial */}
        {formData.loanSubcategory === 'new_commercial' && (
          <>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Heavy License
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  <input
                    type="radio"
                    name="hasHeavyLicense"
                    value="true"
                    checked={formData.hasHeavyLicense === true}
                    onChange={(e) => handleChange({ target: { name: 'hasHeavyLicense', type: 'checkbox', checked: true } })}
                    className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  <input
                    type="radio"
                    name="hasHeavyLicense"
                    value="false"
                    checked={formData.hasHeavyLicense === false}
                    onChange={(e) => handleChange({ target: { name: 'hasHeavyLicense', type: 'checkbox', checked: false } })}
                    className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Heavy License Date - Only shown when Yes is selected */}
            {formData.hasHeavyLicense === true && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Heavy License Issue Date
                </label>
                <input
                  type="date"
                  name="heavyLicenseDate"
                  value={formData.heavyLicenseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            )}

            {/* TR License */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-base font-semibold text-gray-700 mb-3">
                TR License
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  <input
                    type="radio"
                    name="hasTRLicense"
                    value="true"
                    checked={formData.hasTRLicense === true}
                    onChange={(e) => handleChange({ target: { name: 'hasTRLicense', type: 'checkbox', checked: true } })}
                    className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  <input
                    type="radio"
                    name="hasTRLicense"
                    value="false"
                    checked={formData.hasTRLicense === false}
                    onChange={(e) => handleChange({ target: { name: 'hasTRLicense', type: 'checkbox', checked: false } })}
                    className="flex-shrink-0 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* TR License Date - Only shown when Yes is selected */}
            {formData.hasTRLicense === true && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  TR License Issue Date
                </label>
                <input
                  type="date"
                  name="trLicenseDate"
                  value={formData.trLicenseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default NewVehicleSection;
