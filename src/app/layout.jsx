import '../index.css';
import Providers from './providers';

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
    <html lang="vi" className="font-sans">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
            const storageKey = 'gritmode:scroll-positions:v1';
            const navigationType = performance.getEntriesByType('navigation')[0]?.type;
            if (navigationType !== 'reload' && navigationType !== 'back_forward') return;

            history.scrollRestoration = 'manual';
            let savedY = 0;
            try {
              const positions = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
              const routeKey = location.pathname + location.search + location.hash;
              savedY = Number(positions[routeKey]?.y) || 0;
            } catch {
              return;
            }
            if (savedY <= 0) return;

            const root = document.documentElement;
            const originalMinHeight = root.style.minHeight;
            root.style.minHeight = (savedY + innerHeight) + 'px';
            scrollTo({ top: savedY, left: 0, behavior: 'auto' });

            let attempts = 0;
            const restoreWhenContentCanReachPosition = (force = false) => {
              const bodyHeight = document.body?.scrollHeight || 0;
              const naturalMaxScrollY = Math.max(0, bodyHeight - innerHeight);
              if (naturalMaxScrollY + 2 >= savedY || force) {
                root.style.minHeight = originalMinHeight;
                const documentHeight = Math.max(
                  document.documentElement.scrollHeight,
                  document.body?.scrollHeight || 0,
                );
                const maxScrollY = Math.max(0, documentHeight - innerHeight);
                const targetY = Math.min(savedY, maxScrollY);
                scrollTo({ top: targetY, left: 0, behavior: 'auto' });
                window.__gritmodeScrollRestoreBootstrapDone = true;
                return true;
              }
              return ++attempts >= 200;
            };

            const intervalId = setInterval(() => {
              if (restoreWhenContentCanReachPosition(++attempts >= 400)) clearInterval(intervalId);
            }, 25);
            const cancelForUserInput = () => {
              window.__gritmodeScrollRestoreCancelled = true;
              root.style.minHeight = originalMinHeight;
              clearInterval(intervalId);
            };
            requestAnimationFrame(() => {
              if (restoreWhenContentCanReachPosition()) clearInterval(intervalId);
            });
            addEventListener('load', () => {
              if (restoreWhenContentCanReachPosition(++attempts >= 400)) clearInterval(intervalId);
            }, { once: true });
            addEventListener('wheel', cancelForUserInput, { once: true, passive: true });
            addEventListener('touchstart', cancelForUserInput, { once: true, passive: true });
            addEventListener('keydown', cancelForUserInput, { once: true });
          })();`,
          }}
        />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
