import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '../index.css';
import Providers from './providers';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Gritmode® | Vietnamese Streetwear Culture',
    template: 'Gritmode® | Vietnamese Streetwear Culture',
  },
  description:
    'Gritmode® — Thương hiệu thời trang thể thao & phong cách đường phố cao cấp lấy cảm hứng từ DirtyCoins và văn hóa Hip-Hop đương đại.',
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  openGraph: {
    title: 'Gritmode® | Vietnamese Streetwear Culture',
    description:
      'Gritmode® — Thương hiệu thời trang thể thao & phong cách đường phố cao cấp lấy cảm hứng từ DirtyCoins và văn hóa Hip-Hop đương đại.',
    siteName: 'Gritmode®',
    locale: 'vi_VN',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
