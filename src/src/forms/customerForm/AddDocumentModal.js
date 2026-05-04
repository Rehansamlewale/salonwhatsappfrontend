import React from 'react';

const AddDocumentModal = ({ showAddDocModal, setShowAddDocModal, newDocName, setNewDocName, confirmAddExtraDocument }) => {
  if (!showAddDocModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Add Extra Document</h3>
          <button
            type="button"
            onClick={() => setShowAddDocModal(false)}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-base font-semibold text-gray-700 mb-2">
            Document Name *
          </label>
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="Enter document name"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmAddExtraDocument();
              }
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={confirmAddExtraDocument}
            disabled={!newDocName.trim()}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add Document
          </button>
          <button
            type="button"
            onClick={() => setShowAddDocModal(false)}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;
