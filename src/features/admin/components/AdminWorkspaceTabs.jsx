'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Sản phẩm', href: '/admin/products' },
  { label: 'Tồn kho', href: '/admin/inventory' },
  { label: 'Danh mục', href: '/admin/categories' },
  { label: 'Bộ sưu tập', href: '/admin/collections' },
];

export default function AdminWorkspaceTabs() {
  const pathname = usePathname() || '';

  return (
    <nav
      aria-label="Điều hướng catalog"
      className="flex min-w-0 items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              active
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
