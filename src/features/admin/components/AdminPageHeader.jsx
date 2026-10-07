export default function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-1 truncate font-display text-2xl font-black uppercase tracking-tight text-black dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-xs text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
