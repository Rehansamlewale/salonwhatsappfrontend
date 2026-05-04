import React, { useState } from 'react';
import { CO_APPLICANT_DOCUMENTS } from '../loanTypes';
import { categorizeDocuments, DOCUMENT_SECTIONS } from '../documentCategories';

const DocumentsSection = ({
  formData,
  handleChange,
  getRequiredDocs,
  addExtraDocument,
  removeExtraDocument,
  handleExtraDocumentCheck
}) => {
  // Get categorized documents
  const allDocs = getRequiredDocs();
  const categorizedDocs = categorizeDocuments(allDocs);

  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    [DOCUMENT_SECTIONS.BASIC_DOCUMENTS]: true,
    [DOCUMENT_SECTIONS.INCOME_SALARIED]: true,
    [DOCUMENT_SECTIONS.INCOME_BUSINESS]: true,
    [DOCUMENT_SECTIONS.PROPERTY_DOCUMENTS]: true,
    [DOCUMENT_SECTIONS.VEHICLE_DOCUMENTS]: true
  });

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Section icon mapping
  const sectionIcons = {
    [DOCUMENT_SECTIONS.BASIC_DOCUMENTS]: '📄',
    [DOCUMENT_SECTIONS.INCOME_SALARIED]: '💼',
    [DOCUMENT_SECTIONS.INCOME_BUSINESS]: '🏢',
    [DOCUMENT_SECTIONS.PROPERTY_DOCUMENTS]: '🏠',
    [DOCUMENT_SECTIONS.VEHICLE_DOCUMENTS]: '🚗'
  };

  return (
    <section className="bg-orange-50 p-4 sm:p-4 rounded-xl border border-orange-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Required Documents collected?</h3>

      {/* Render each section */}
      {Object.entries(categorizedDocs).map(([sectionName, documents]) => (
        <div key={sectionName} className="mb-4 last:mb-0">
          {/* Section Header */}
          <button
            type="button"
            onClick={() => toggleSection(sectionName)}
            className="w-full flex items-center justify-between bg-orange-100 hover:bg-orange-200 p-3 rounded-lg transition-colors mb-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sectionIcons[sectionName] || '📋'}</span>
              <h4 className="text-base font-bold text-gray-800 uppercase tracking-wide">{sectionName}</h4>
              <span className="text-sm text-gray-600">({documents.length} documents)</span>
            </div>
            <span className="text-gray-600 text-2xl">
              {expandedSections[sectionName] ? '▼' : '▶'}
            </span>
          </button>

          {/* Section Content */}
          {expandedSections[sectionName] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pl-2">
              {documents.map((docLabel) => {
                const docId = docLabel.replace(/[^a-zA-Z0-9]/g, '');
                return (
                  <label key={`main_${docId}`} className="flex items-center space-x-3 cursor-pointer hover:bg-orange-100 p-2 sm:p-3 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      name={`doc_${docId}`}
                      checked={formData.collectedDocuments[docId] || false}
                      onChange={handleChange}
                      className="flex-shrink-0 w-5 h-5 text-orange-600 focus:ring-orange-500 rounded-full"
                    />
                    <span className="text-base font-medium text-gray-700">{docLabel}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Co-applicant Section */}
      <div className="mt-6 border-t border-orange-200 pt-4">
        <h4 className="text-base font-bold text-gray-800 mb-3 uppercase tracking-wide">Co-applicant / Guarantor (if required)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CO_APPLICANT_DOCUMENTS.map((docLabel) => {
            const docId = `co_${docLabel.replace(/[^a-zA-Z0-9]/g, '')}`;
            return (
              <label key={docId} className="flex items-center space-x-3 cursor-pointer hover:bg-orange-100 p-2 sm:p-3 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  name={`doc_${docId}`}
                  checked={formData.collectedDocuments[docId] || false}
                  onChange={handleChange}
                  className="flex-shrink-0 w-5 h-5 text-orange-600 focus:ring-orange-500 rounded-full"
                />
                <span className="text-base font-medium text-gray-700">{docLabel}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Extra Documents Section */}
      <div className="mt-6 border-t border-orange-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-bold text-gray-800 uppercase tracking-wide">Extra Documents</h4>
          <button
            type="button"
            onClick={addExtraDocument}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <span>+</span> Add Document
          </button>
        </div>
        {formData.extraDocuments && formData.extraDocuments.length > 0 ? (
          <>
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg flex items-center gap-3 animate-fadeIn">
              <span className="text-xl">ℹ️</span>
              <p className="text-sm text-blue-700 font-medium">
                Information: You have added custom documents. Please ensure to collect and check them in the list below.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {formData.extraDocuments.map((doc, index) => (
                <div key={`extra_${index}`} className="flex items-center justify-between bg-orange-100 p-2 sm:p-3 rounded-lg border border-orange-200 shadow-sm transition-all hover:shadow-md">
                  <label className="flex items-center space-x-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={doc.collected || false}
                      onChange={(e) => handleExtraDocumentCheck(index, e.target.checked)}
                      className="flex-shrink-0 w-5 h-5 text-orange-600 focus:ring-orange-500 rounded-full"
                    />
                    <span className="text-base font-medium text-gray-700">{doc.name}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeExtraDocument(index)}
                    className="ml-2 p-1.5 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white text-sm rounded-lg transition-all"
                    title="Remove document"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-base text-gray-500 italic">No extra documents added. Click "Add Document" to add custom documents.</p>
        )}
      </div>
    </section>
  );
};

export default DocumentsSection;
