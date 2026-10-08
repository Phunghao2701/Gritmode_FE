import React from 'react';
import Icon from '../../../shared/components/Icon';

export default function DashboardStatCard({ title, value, icon, bg, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between">
        <div className="space-y-3 flex-1 mr-4">
          <div className="h-3 w-24 bg-neutral-200/80 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-8 w-32 bg-neutral-200/80 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 animate-pulse shrink-0" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between group hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
      <div className="space-y-2">
        <span className="text-[11px] font-[550] text-neutral-400 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="font-display font-[550] text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-2xl ${bg} shrink-0`}>
        <Icon icon={icon} className="text-2xl" />
      </div>
    </div>
  );
}
