import React from 'react';

const CoApplicantSection = ({ formData, handleCoApplicantChange, addCoApplicant, removeCoApplicant }) => {
  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-4 border-b pb-2 sm:pb-3">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">👥</span>
          Co-Applicants
        </h3>
        <button
          type="button"
          onClick={addCoApplicant}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Co-Applicant</span>
        </button>
      </div>

      {formData.coApplicants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No co-applicants added yet.</p>
          <p className="text-base">Click "Add Co-Applicant" to add one.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.coApplicants.map((coApplicant, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700">Co-Applicant {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeCoApplicant(index)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-base rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={coApplicant.name}
                    onChange={(e) => handleCoApplicantChange(index, 'name', e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <select
                    value={coApplicant.relationship}
                    onChange={(e) => handleCoApplicantChange(index, 'relationship', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={coApplicant.dob}
                    onChange={(e) => handleCoApplicantChange(index, 'dob', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={coApplicant.mobile}
                    onChange={(e) => handleCoApplicantChange(index, 'mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number" onWheel={(e) => e.target.blur()}
                    value={coApplicant.income}
                    onChange={(e) => handleCoApplicantChange(index, 'income', e.target.value)}
                    placeholder="e.g., 30000"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={coApplicant.occupation}
                    onChange={(e) => handleCoApplicantChange(index, 'occupation', e.target.value)}
                    placeholder="e.g., Teacher, Business"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CoApplicantSection;
