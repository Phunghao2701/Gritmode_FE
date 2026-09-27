import Link from 'next/link';
import Icon from '@/shared/components/Icon';
import NewsletterForm from './NewsletterForm';

/**
 * MainFooter — React Server Component (0kb client JS for the entire footer shell)
 * Renders DirtyCoins style streetwear footer with 5 columns.
 */
export default function MainFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
      {/* Top Newsletter & Culture Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-[10px] font-[550] uppercase tracking-widest text-neutral-400 block">
              GRITMODE® SQUAD
            </span>
            <h3 className="font-sans font-[550] text-xl sm:text-2xl uppercase tracking-widest text-black dark:text-white mt-0.5">
              GIA NHẬP CỘNG ĐỒNG STREETWEAR
            </h3>
            <p className="text-xs text-neutral-500 mt-1 font-[550] uppercase tracking-widest leading-relaxed">
              Nhận thông báo sớm nhất về các đợt phát hành Drop giới hạn và ưu đãi đặc quyền.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Footer Navigation Columns (5 Columns) */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Manifesto */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col">
              <span className="font-sans font-[550] text-2xl tracking-tight text-black dark:text-white uppercase leading-none">
                GRITMODE<span className="text-xs align-super ml-0.5 font-sans font-[550]">®</span>
              </span>
              <span className="text-[9px] font-[550] tracking-widest uppercase text-neutral-400 mt-1">madeinvietnam</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Thương hiệu thời trang đường phố Việt Nam đại diện cho tinh thần và tiếng nói của thế hệ trẻ — nơi phong cách sống tự do, tư duy sáng tạo và cá tính độc bản được định hình từ những giá trị nghệ thuật cốt lõi.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xl text-black dark:text-white">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gritmode Facebook Page"
                className="hover:opacity-60 transition-opacity"
              >
                <Icon icon="simple-icons:facebook" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gritmode Instagram Official"
                className="hover:opacity-60 transition-opacity"
              >
                <Icon icon="simple-icons:instagram" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gritmode TikTok Channel"
                className="hover:opacity-60 transition-opacity"
              >
                <Icon icon="simple-icons:tiktok" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gritmode YouTube Channel"
                className="hover:opacity-60 transition-opacity"
              >
                <Icon icon="simple-icons:youtube" />
              </a>
            </div>
          </div>

          {/* Column 2: Hệ thống Store */}
          <div>
            <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
              HỆ THỐNG CỬA HÀNG
            </h4>
            <ul className="space-y-3 text-xs text-neutral-500">
              <li className="space-y-0.5">
                <strong className="text-black dark:text-white font-[550] block">• Gritmode Online Store:</strong>
                <span className="text-[11px] leading-relaxed block">Based in HCM City</span>
                <span className="text-[10px] text-neutral-400 block">09:30 – 22:00 (Hàng ngày)</span>
              </li>
              <li className="pt-1 border-t border-neutral-100 dark:border-neutral-900 font-[550] text-black dark:text-white font-sans">
                Hotline: 0326 747 206
              </li>
            </ul>
          </div>

          {/* Column 3: Hỗ trợ mua hàng */}
          <div>
            <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
              HỖ TRỢ MUA HÀNG
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-500">
              <li>
                <Link href="/size-guide" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Bảng quy đổi kích cỡ
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Hướng dẫn mua hàng & thanh toán
                </Link>
              </li>
              <li>
                <Link href="/tra-cuu-don-hang" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Tra cứu & theo dõi đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Liên hệ hỗ trợ khách hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Chính sách khách hàng */}
          <div>
            <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
              CHÍNH SÁCH KHÁCH HÀNG
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-500">
              <li>
                <Link href="/policies/return" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Chính sách đổi trả & hoàn tiền (7 ngày)
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Chính sách vận chuyển (Freeship 0đ)
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Chính sách bảo hành sản phẩm (30 ngày)
                </Link>
              </li>
              <li>
                <Link href="/policies/payment" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Quy định & hình thức thanh toán
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors">
                  Điều khoản dịch vụ & sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Phương thức thanh toán (Verified Only) */}
          <div>
            <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
              PHƯƠNG THỨC THANH TOÁN
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed mb-3">
              Thanh toán an toàn, bảo mật và tiện lợi qua 2 hình thức chính thức:
            </p>

            <div className="space-y-2">
              {/* VietQR / payOS Badge */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm shrink-0">
                  <Icon icon="solar:qr-code-bold" />
                </div>
                <div>
                  <h5 className="font-[550] text-xs uppercase text-black dark:text-white">VietQR / payOS</h5>
                  <p className="text-[10px] text-neutral-400">Chuẩn NAPAS247 tự động 24/7</p>
                </div>
              </div>

              {/* COD Badge */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm shrink-0">
                  <Icon icon="solar:hand-money-bold" />
                </div>
                <div>
                  <h5 className="font-[550] text-xs uppercase text-black dark:text-white">Tiền mặt (COD)</h5>
                  <p className="text-[10px] text-neutral-400">Kiểm tra hàng khi nhận</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Culture Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-[550] text-neutral-400 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} GRITMODE STREETWEAR CO., LTD. ALL RIGHTS RESERVED.</p>
          <p>DESIGNED FOR VIETNAMESE STREET CULTURE</p>
        </div>
      </div>
    </footer>
  );
}
