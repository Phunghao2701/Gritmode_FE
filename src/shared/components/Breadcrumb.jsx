import Link from 'next/link';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-wider text-neutral-400">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && !item.current ? (
              <Link href={item.href} className="hover:text-black dark:hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={item.current ? 'page' : undefined}
                className={item.current ? 'text-black dark:text-white' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
