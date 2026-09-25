import React from 'react';

export default function AdminFooter() {
  return (
    <footer className="h-10 px-6 flex items-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} Gritmode Admin Panel
      </p>
    </footer>
  );
}
