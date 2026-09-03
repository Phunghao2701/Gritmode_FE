import React from 'react';
import PaginationControls from './PaginationControls';
import { cn } from '../utils/cn';

/**
 * Reusable Pagination Component for lists & tables
 */
export default function Pagination({
  totalItems = 0,
  currentPage = 1,
  limit = 10,
  onPageChange,
  entityName = 'mục',
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalItems, currentPage * limit);

  if (totalItems === 0) {
    return null;
  }

  const formatNum = (num) => num.toLocaleString('vi-VN');

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1 border-t border-neutral-100 dark:border-neutral-800 select-none", className)}>
      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Hiển thị{' '}
        <span className="font-bold text-black dark:text-white">{formatNum(startItem)}</span>
        {' '}-{' '}
        <span className="font-bold text-black dark:text-white">{formatNum(endItem)}</span>
        {' '}trong tổng số{' '}
        <span className="font-black text-black dark:text-white">{formatNum(totalItems)}</span>
        {' '}{entityName}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
