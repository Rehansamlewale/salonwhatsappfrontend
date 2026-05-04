import React from 'react';

const BasicInfoSection = ({
  formData,
  errors,
  handleChange,
  containerRef,
  showMatches,
  matches,
  handleLoadMatch,
  contactContainerRef,
  showContactDropdown,
  contactMatches,
  handleContactSelect,
  isNewReferrer,
  referrerMobile,
  setReferrerMobile,
  referrerType,
  setReferrerType,
  calculateAge
}) => {
  return (
    <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center border-b pb-2 sm:pb-3">
        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">👤</span>
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
        <div ref={containerRef} className="col-span-1 md:col-span-2 relative">
          <label className="block text-base font-semibold text-gray-700 mb-2">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Customer Full Name"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}

          {showMatches && matches.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-60 overflow-auto">
              {matches.map(m => (
                <button key={m.id} type="button" onClick={() => handleLoadMatch(m)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{m.name || 'Unnamed'}</div>
                      <div className="text-base text-gray-500">{m.mobile1 || ''} {m.aadhar ? ` • ${m.aadhar}` : ''}</div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600 font-semibold">Load</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Mobile Number</label>
          <input type="tel" name="mobile1" value={formData.mobile1} onChange={handleChange} placeholder="Primary Mobile"
            maxLength="10"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          {errors.mobile1 && <span className="text-red-500 text-sm mt-1 block">{errors.mobile1}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Aadhaar Number</label>
          <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} placeholder="Aadhaar Number"
            maxLength="12"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          {errors.aadhar && <span className="text-red-500 text-sm mt-1 block">{errors.aadhar}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Mobile Number 2</label>
          <input type="tel" name="mobile2" value={formData.mobile2} onChange={handleChange} placeholder="Secondary Mobile (Optional)"
            maxLength="10"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          {errors.mobile2 && <span className="text-red-500 text-sm mt-1 block">{errors.mobile2}</span>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {formData.birthdate && (
            <span className="text-base text-blue-600 mt-1 block">
              Age: {calculateAge(formData.birthdate)} years
            </span>
          )}
          {errors.birthdate && <span className="text-red-500 text-sm mt-1 block">{errors.birthdate}</span>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">City / Village</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Village or City"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
          {errors.city && <span className="text-red-500 text-sm mt-1 block">{errors.city}</span>}
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-base font-semibold text-gray-700 mb-2">Full Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="2" placeholder="Complete Residential Address"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"></textarea>
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Nearby Landmark</label>
          <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Famous nearby place"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
        </div>

        <div ref={contactContainerRef} className="relative">
          <label className="block text-base font-semibold text-gray-700 mb-2">Refered by</label>
          <input type="text" name="referedby" value={formData.referedby} onChange={handleChange} placeholder="Person who referred this customer"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />

          {showContactDropdown && contactMatches.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-60 overflow-auto">
              {contactMatches.map(contact => (
                <button key={contact.id} type="button" onClick={() => handleContactSelect(contact)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{contact.name || 'Unnamed'}</div>
                      <div className="text-base text-gray-500">
                        {contact.businessName && <span>{contact.businessName}</span>}
                        {contact.mobile1 && <span> • {contact.mobile1}</span>}
                        {contact.city && <span> • {contact.city}</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600 font-semibold">Select</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conditional Mobile Number Field for New Referrer or Existing Referrer with Mobile */}
        {((isNewReferrer && formData.referedby.trim()) || referrerMobile) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-base font-semibold text-gray-700 mb-2">
              Referrer's Mobile Number
              {isNewReferrer && formData.referedby.trim() && (
                <span className="text-sm font-normal text-blue-600 ml-2">(New contact - will be saved)</span>
              )}
            </label>

            {isNewReferrer && formData.referedby.trim() && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Contact Type *</label>
                <div className="relative">
                  <select
                    value={referrerType}
                    onChange={(e) => setReferrerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                  >
                    <option value="">Select Contact Type</option>
                    <option value="dealer">Dealer</option>
                    <option value="agent">Agent</option>
                    <option value="finance_executive">Finance Executive/Banker</option>
                    <option value="banker">Banker</option>
                    <option value="customer">Customer</option>
                    <option value="key_person">Key Person</option>
                    <option value="dsa">DSA</option>
                    <option value="bni">BNI</option>
                    <option value="social_media">Social Media</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
            )}
            <input
              type="tel"
              value={referrerMobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setReferrerMobile(value);
              }}
              maxLength="10"
              placeholder="10-digit mobile number"
              className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
            {referrerMobile && referrerMobile.length !== 10 && (
              <span className="text-red-500 text-sm mt-1 block">Mobile number must be exactly 10 digits</span>
            )}
            {isNewReferrer && formData.referedby.trim() && (
              <p className="text-sm text-gray-600 mt-2">
                💡 This referrer is not in our contacts. Please provide their mobile number to add them.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BasicInfoSection;
