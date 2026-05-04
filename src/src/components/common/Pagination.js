import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  // Calculate showing range
  const startItem = totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display (show up to 7 pages centered around current page)
  const generatePageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, start + 6);

    for (let p = start; p <= end; p++) {
      pages.push(
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-lg border transition-colors ${p === currentPage
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
        >
          {p}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-4 px-4 bg-white border-t">
      <div className="text-sm text-gray-600">
        Showing {startItem} - {endItem} of {totalItems}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg border transition-colors ${currentPage === 1
              ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
        >
          Prev
        </button>
        <div className="flex items-center space-x-1">
          {generatePageNumbers()}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-lg border transition-colors ${currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
