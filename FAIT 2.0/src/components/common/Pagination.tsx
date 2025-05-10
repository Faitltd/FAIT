import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  maxPageButtons = 5
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Calculate which page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
  
  return (
    <nav className="flex justify-center mt-6" aria-label="Pagination">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </li>
        
        {startPage > 1 && (
          <>
            <li>
              <button
                onClick={() => onPageChange(1)}
                className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li>
                <span className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  ...
                </span>
              </li>
            )}
          </>
        )}
        
        {pageNumbers.map(page => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`relative block px-3 py-2 leading-tight border ${
                page === currentPage
                  ? 'z-10 text-blue-600 border-blue-300 bg-blue-50'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li>
                <span className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  ...
                </span>
              </li>
            )}
            <li>
              <button
                onClick={() => onPageChange(totalPages)}
                className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
        
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
