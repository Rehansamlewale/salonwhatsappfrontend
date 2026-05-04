import React from 'react';

const FarmIncomeSection = ({ formData, handleChange, handleExtraIncomeSourceChange, handleExtraIncomeAmountChange }) => {
  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">🌾</span>
        Farming & Extra Income
      </h3>

      <div className="space-y-4 sm:space-y-6">
        {/* Farming */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <input type="checkbox" name="hasFarm" checked={formData.hasFarm} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-green-600 rounded-full focus:ring-green-500" />
            <label className="text-base font-semibold text-gray-800">Has Agricultural Land / Farm?</label>
          </div>

          {formData.hasFarm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8">
              <div>
                <label className="block text-base font-semibold text-gray-600 mb-1">Area (Guntha/Acre)</label>
                <input type="text" name="farmArea" value={formData.farmArea} onChange={handleChange} placeholder="e.g. 2 Acres"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-600 mb-1">Owner Name</label>
                <input type="text" name="farmOwnerName" value={formData.farmOwnerName} onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none" />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-300 w-full mb-px">
                  <input type="checkbox" name="hasFarmDocuments" checked={formData.hasFarmDocuments} onChange={handleChange}
                    className="flex-shrink-0 w-5 h-5 text-green-600 rounded-full" />
                  <label className="text-base text-gray-600">7/12 & 8A Available?</label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Extra Income */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <input type="checkbox" name="hasExtraIncome" checked={formData.hasExtraIncome} onChange={handleChange}
              className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full focus:ring-blue-500" />
            <label className="text-base font-semibold text-gray-800">Has Extra Income Source?</label>
          </div>

          {formData.hasExtraIncome && (
            <div className="pl-8 space-y-4">
              <div className="flex flex-wrap gap-4">
                {['Room Rent', 'Dairy / Animals', 'Stitching / Small Biz', 'Other'].map((source) => (
                  <label key={source} className="flex items-center space-x-2 bg-gray-50 px-3 py-3 rounded-full border cursor-pointer hover:bg-gray-100">
                    <input type="checkbox"
                      checked={formData.extraIncomeSources.includes(source)}
                      onChange={() => handleExtraIncomeSourceChange(source)}
                      className="flex-shrink-0 w-5 h-5 text-blue-600 rounded-full" />
                    <span className="text-base text-gray-700">{source}</span>
                  </label>
                ))}
              </div>

              {/* Individual amount inputs for selected sources */}
              {
                formData.extraIncomeSources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {formData.extraIncomeSources.map(source => (
                      source !== 'Other' && (
                        <div key={source}>
                          <label className="block text-base font-semibold text-gray-600 mb-1">{source} Amount (₹) - Income per Annum</label>
                          <input
                            type="number" onWheel={(e) => e.target.blur()}
                            value={formData.extraIncomeBreakdown?.[source] || ''}
                            onChange={(e) => handleExtraIncomeAmountChange && handleExtraIncomeAmountChange(source, e.target.value)}
                            placeholder="Enter amount"
                            min="0"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      )
                    ))}
                    {formData.extraIncomeSources.includes('Other') && (
                      <div>
                        <label className="block text-base font-semibold text-gray-600 mb-1">Other Income Amount (₹) - Income per Annum</label>
                        <input
                          type="number" onWheel={(e) => e.target.blur()}
                          value={formData.extraIncomeBreakdown?.['Other'] || ''}
                          onChange={(e) => handleExtraIncomeAmountChange && handleExtraIncomeAmountChange('Other', e.target.value)}
                          placeholder="Enter amount"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )
              }

              <div className="max-w-xs mt-4">
                <label className="block text-base font-semibold text-gray-600 mb-1">Total Extra Income Amount (₹) - Income per Annum</label>
                <input
                  type="number" onWheel={(e) => e.target.blur()}
                  name="extraIncomeAmount"
                  value={formData.extraIncomeAmount || ''}
                  readOnly
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed font-bold text-gray-700"
                />
              </div>


              {formData.extraIncomeSources.includes('Other') && (
                <div className="max-w-md mt-4">
                  <label className="block text-base font-semibold text-gray-600 mb-1">Please specify other income source</label>
                  <input
                    type="text"
                    name="otherIncomeDescription"
                    value={formData.otherIncomeDescription || ''}
                    onChange={handleChange}
                    placeholder="e.g., Pension, Freelancing, etc."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FarmIncomeSection;
