export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Brand Pulse */}
        <div className="w-8 h-8 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
        <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 animate-pulse">
          GRITMODE • LOADING...
        </span>
      </div>
    </div>
  );
}
