import Link from 'next/link';
import Logo from '@/shared/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white dark:bg-black text-black dark:text-white px-6 py-12 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Brand */}
      <div className="w-full flex justify-center pt-4">
        <Logo size="text-2xl" />
      </div>

      {/* Center 404 Message */}
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl font-black font-display tracking-tighter select-none opacity-20">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-black uppercase tracking-widest bg-white dark:bg-black px-4">
              NOT FOUND
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider">
            Trang không tồn tại
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Đường dẫn bạn đang truy cập có thể đã bị gỡ bỏ, thay đổi địa chỉ hoặc tạm thời không khả dụng.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-black tracking-widest uppercase rounded-full hover:opacity-85 transition-opacity"
          >
            Về trang chủ
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-black tracking-widest uppercase rounded-full transition-colors"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-widest select-none">
        GRITMODE® • madeinvietnam
      </div>
    </div>
  );
}
