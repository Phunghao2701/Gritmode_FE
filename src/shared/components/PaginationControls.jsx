import React from 'react';
import Icon from './Icon';
import { cn } from '../utils/cn';

function buildPageItems(currentPage, totalPages) {
  const items = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= 1;

    if (isEdge || isNearCurrent) {
      items.push(page);
    } else if (items[items.length - 1] !== 'ellipsis') {
      items.push('ellipsis');
    }
  }

  return items;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <nav className={cn("inline-flex items-center gap-1.5 select-none", className)} aria-label="Pagination">
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 text-sm shadow-sm"
        aria-label="Trang trước"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="text-base" />
      </button>

      {/* Page Numbers */}
      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="w-8 text-center text-xs font-black text-neutral-400 select-none">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(
              "inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95",
              item === currentPage
                ? "bg-black text-white dark:bg-white dark:text-black shadow-md border border-transparent"
                : "border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            )}
          >
            {item}
          </button>
        )
      )}

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 text-sm shadow-sm"
        aria-label="Trang tiếp theo"
      >
        <Icon icon="solar:alt-arrow-right-linear" className="text-base" />
      </button>
    </nav>
  );
}

