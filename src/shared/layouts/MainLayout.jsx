import AnnouncementTicker from '@/shared/components/Header/AnnouncementTicker';
import HeaderBar from '@/shared/components/Header/HeaderBar';
import MainFooter from '@/shared/components/Footer/MainFooter';

/**
 * MainLayout — React Server Component Shell (0kb client JS for layout structure)
 * Adopts Island Architecture:
 * - AnnouncementTicker: 100% Server Component
 * - HeaderBar: Controls sticky & theme, hosting isolated Client Islands (HeaderNav, MobileNav, HeaderActions)
 * - Page Content (children): Streamed via Suspense / RSC
 * - MainFooter: 100% Server Component with small NewsletterForm island
 */
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Announcement Marquee Ticker (Server Component) */}
      <AnnouncementTicker />

      {/* Streetwear Header Shell hosting Client Islands */}
      <HeaderBar />

      {/* Main Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Streetwear Footer (Server Component) */}
      <MainFooter />
    </div>
  );
}
