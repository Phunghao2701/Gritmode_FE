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
    <nav className={cn("inline-flex items-center gap-1.5", className)} aria-label="Pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
        aria-label="Previous page"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="text-base" />
      </button>

      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-slate-400 select-none">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={cn(
              "inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-xl text-sm font-semibold transition-all shadow-sm",
              item === currentPage
                ? "bg-brand-600 text-white shadow-brand-500/20"
                : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
        aria-label="Next page"
      >
        <Icon icon="solar:alt-arrow-right-linear" className="text-base" />
      </button>
    </nav>
  );
}
