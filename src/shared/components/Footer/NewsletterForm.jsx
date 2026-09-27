'use client';

/**
 * NewsletterForm — Client Island
 * Lightweight form with toast feedback.
 */
export default function NewsletterForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailInput = e.target.elements.newsletter_email?.value?.trim();
    if (emailInput) {
      const { toast } = await import('@/shared/utils/toast');
      toast.success('Cảm ơn bạn đã đăng ký nhận tin từ Gritmode!');
      e.target.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto max-w-md">
      <input
        name="newsletter_email"
        type="email"
        autoComplete="email"
        placeholder="Nhập địa chỉ email của bạn..."
        required
        className="min-w-0 flex-1 px-4 py-3 text-xs font-[550] rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-black dark:focus:border-white transition-all"
      />
      <button
        type="submit"
        className="px-4 sm:px-6 py-3 text-xs font-[550] uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-85 transition-opacity cursor-pointer shrink-0"
      >
        ĐĂNG KÝ
      </button>
    </form>
  );
}
