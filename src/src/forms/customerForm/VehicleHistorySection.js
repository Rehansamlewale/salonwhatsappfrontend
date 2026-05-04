import React from 'react';

const VehicleHistorySection = ({ formData, handleChange, handleVehicleChange, addVehicle, removeVehicle }) => {
  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🚗</span>
        Old Vehicle History
      </h3>

      <div className="flex items-center space-x-3 mb-4">
        <input type="checkbox" name="hasPreviousVehicle" checked={formData.hasPreviousVehicle} onChange={handleChange}
          className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
        <label className="text-base font-semibold text-gray-800">Owned Vehicles previously?</label>
      </div>

      {formData.hasPreviousVehicle && (
        <div className="space-y-4 animate-fadeIn">
          {formData.vehicles.map((vehicle, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-600 mb-1">Vehicle Name</label>
                  <input type="text" value={vehicle.model}
                    onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                    placeholder="e.g. Swift Dzire"
                    className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-600 mb-1">Finance Company</label>
                  <input type="text" value={vehicle.financeCompany}
                    onChange={(e) => handleVehicleChange(index, 'financeCompany', e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-600 mb-1">Loan Active?</label>
                  <select value={vehicle.loanActive}
                    onChange={(e) => handleVehicleChange(index, 'loanActive', e.target.value)}
                    className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              {/* Remove Button */}
              {formData.vehicles.length > 1 && (
                <button type="button" onClick={() => removeVehicle(index)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addVehicle}
            className="text-base text-blue-600 font-semibold hover:text-blue-800 flex items-center space-x-1 pl-1">
            <span>+ Add Another Vehicle</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default VehicleHistorySection;
