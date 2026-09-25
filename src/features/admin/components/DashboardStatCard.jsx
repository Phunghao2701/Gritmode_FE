import React from 'react';
import Icon from '../../../shared/components/Icon';

export default function DashboardStatCard({ title, value, icon, bg }) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start justify-between group hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-2xl ${bg} shrink-0`}>
        <Icon icon={icon} className="text-2xl" />
      </div>
    </div>
  );
}
