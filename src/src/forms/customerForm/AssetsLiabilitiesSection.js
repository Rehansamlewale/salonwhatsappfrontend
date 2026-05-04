import React from 'react';

const AssetsLiabilitiesSection = ({ formData, handleAssetChange }) => {
  // Calculate total assets
  const calculateTotal = () => {
    const assets = formData.assets || {};
    return (
      (parseFloat(assets.home) || 0) +
      (parseFloat(assets.plot) || 0) +
      (parseFloat(assets.farm) || 0) +
      (parseFloat(assets.vehicle) || 0) +
      (parseFloat(assets.gold) || 0) +
      (parseFloat(assets.other) || 0)
    );
  };

  const totalAssets = calculateTotal();

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">💰</span>
        Assets & Liabilities
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
        {/* Home */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            🏠 Home Value (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            value={formData.assets?.home || ''}
            onChange={(e) => handleAssetChange('home', e.target.value)}
            placeholder="e.g., 2500000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Plot */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            📍 Plot Value (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            value={formData.assets?.plot || ''}
            onChange={(e) => handleAssetChange('plot', e.target.value)}
            placeholder="e.g., 1000000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Farm */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            🌾 Farm Value (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            value={formData.assets?.farm || ''}
            onChange={(e) => handleAssetChange('farm', e.target.value)}
            placeholder="e.g., 500000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            🚗 Vehicle Value (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            value={formData.assets?.vehicle || ''}
            onChange={(e) => handleAssetChange('vehicle', e.target.value)}
            placeholder="e.g., 800000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Gold */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            ✨ Gold Value (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            value={formData.assets?.gold || ''}
            onChange={(e) => handleAssetChange('gold', e.target.value)}
            placeholder="e.g., 300000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Other */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">
            📦 Other Assets (₹)
          </label>
          <input
            type="number" onWheel={(e) => e.target.blur()}
            value={formData.assets?.other || ''}
            onChange={(e) => handleAssetChange('other', e.target.value)}
            placeholder="e.g., 100000"
            min="0"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      {/* Total Assets Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-700">💎 Total Asset Value</span>
          <span className="text-3xl font-bold text-emerald-600">
            {formatCurrency(totalAssets)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default AssetsLiabilitiesSection;
