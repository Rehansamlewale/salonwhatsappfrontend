import React from 'react';

const PropertyDetailsSection = ({ formData, handleChange }) => {
  // Only render if Loan Category is LAP
  if (formData.loanCategory !== 'lap') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Property Details Section */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
          <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🏠</span>
          Property Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
            >
              <option value="">Select Type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Plot">Open Plot</option>
              <option value="Mixed">Mixed Usage</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Property Usage</label>
            <select
              name="propertyUsage"
              value={formData.propertyUsage}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
            >
              <option value="">Select Usage</option>
              <option value="Self Occupied">Self Occupied</option>
              <option value="Rented">Rented</option>
              <option value="Vacant">Vacant</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-base font-semibold text-gray-700 mb-2">Property Address</label>
            <textarea
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleChange}
              rows="2"
              placeholder="Full property address"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="propertyCity"
              value={formData.propertyCity}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Pincode</label>
            <input
              type="text"
              name="propertyPincode"
              value={formData.propertyPincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              maxLength="6"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Plot Area/Land (sq.ft)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              name="plotArea"
              value={formData.plotArea}
              onChange={handleChange}
              placeholder="e.g., 1200"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Construction Area (sq.ft)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              name="constructionArea"
              value={formData.constructionArea}
              onChange={handleChange}
              placeholder="e.g., 1500"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Agreement Value (₹)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              name="agreementValue"
              value={formData.agreementValue}
              onChange={handleChange}
              placeholder="e.g., 6000000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Market Value (₹)</label>
            <input
              type="number" onWheel={(e) => e.target.blur()}
              name="marketValue"
              value={formData.marketValue}
              onChange={handleChange}
              placeholder="e.g., 6500000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </section>

      {/* Builder / Seller Details Section */}
      <section className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b border-yellow-200 pb-2 sm:pb-3">
          <span className="bg-yellow-200 text-yellow-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🏗️</span>
          Builder / Seller Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Seller/Builder Name</label>
            <input
              type="text"
              name="sellerName"
              value={formData.sellerName}
              onChange={handleChange}
              placeholder="Seller or Builder Name"
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="If applicable"
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">RERA Registration Number</label>
            <input
              type="text"
              name="reraNumber"
              value={formData.reraNumber}
              onChange={handleChange}
              placeholder="RERA Number"
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Seller Contact Details</label>
            <input
              type="tel"
              name="sellerMobile"
              value={formData.sellerMobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              maxLength="10"
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyDetailsSection;
