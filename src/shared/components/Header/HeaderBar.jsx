'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ROUTES from '@/shared/routes/routePaths';
import MobileNav from './MobileNav';
import HeaderNav from './HeaderNav';
import HeaderActions from './HeaderActions';

export default function HeaderBar() {
  const pathname = usePathname();
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const isHomePage = pathname === '/';

  // Listen to scroll for:
  // 1. Detecting when scrolled past Hero (for Homepage)
  // 2. Detecting scroll direction for Sticky on Scroll Up (for Non-homepage)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const heroThreshold = (window.innerHeight || 700) * 0.75;
      setIsScrolledPastHero(currentScrollY >= heroThreshold);

      if (currentScrollY <= 80) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY + 6) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY - 6) {
        setIsHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const isHeroState = isHomePage && !isScrolledPastHero;
  const isWhiteTheme = !isHeroState;
  const isTextSolidWhite = isHeroState && isHeaderHovered;
  const isHeaderHidden = !isHomePage && !isHeaderVisible && !isHeaderHovered;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        isWhiteTheme
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm'
          : isHeaderHovered
          ? 'bg-black/75 backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'bg-transparent border-b border-transparent'
      }`}
      onMouseEnter={() => setIsHeaderHovered(true)}
      onMouseLeave={() => setIsHeaderHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* 1. Left Nav: Mobile Hamburger + SHOP / COLLECTIONS Desktop */}
        <div className="flex items-center gap-2 sm:gap-6 flex-1 justify-start min-w-0">
          <MobileNav isWhiteTheme={isWhiteTheme} isTextSolidWhite={isTextSolidWhite} />
          <HeaderNav isWhiteTheme={isWhiteTheme} isTextSolidWhite={isTextSolidWhite} />
        </div>

        {/* 2. Center Brand Logo */}
        <div className="flex flex-col items-center justify-center text-center cursor-pointer select-none shrink-0 px-2">
          <Link href="/" className="flex flex-col items-center">
            <span
              className={`font-display font-black text-xl sm:text-2xl lg:text-3xl tracking-tight uppercase leading-none transition-colors duration-150 ease-out ${
                isWhiteTheme
                  ? 'text-black dark:text-white'
                  : isTextSolidWhite
                  ? 'text-white'
                  : 'text-white/70'
              }`}
            >
              GRITMODE<span className="text-[10px] sm:text-xs align-super ml-0.5 font-sans font-black">®</span>
            </span>
            <span
              className={`text-[8px] sm:text-[9px] font-black tracking-widest uppercase mt-0.5 sm:mt-1 transition-[color,opacity] duration-150 ease-out ${
                isWhiteTheme
                  ? 'text-neutral-400 dark:text-neutral-500'
                  : isTextSolidWhite
                  ? 'text-white/70'
                  : 'text-white/40'
              }`}
            >
              madeinvietnam
            </span>
          </Link>
        </div>

        {/* 3. Right Nav: CONTACT | ABOUT US + HeaderActions Pill */}
        <div className="flex items-center justify-end gap-3 sm:gap-5 flex-1 min-w-0">
          <nav className="hidden xl:flex items-center gap-6 text-xs font-black tracking-widest uppercase select-none">
            {[
              { label: 'CONTACT', to: ROUTES.CONTACT },
              { label: 'ABOUT US', to: ROUTES.ABOUT_US },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.to}
                className={`transition-[color,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded ${
                  isWhiteTheme
                    ? 'text-black dark:text-white hover:opacity-60'
                    : isTextSolidWhite
                    ? 'text-white hover:opacity-75'
                    : 'text-white/60 hover:text-white hover:opacity-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <HeaderActions isWhiteTheme={isWhiteTheme} isTextSolidWhite={isTextSolidWhite} />
        </div>
      </div>
    </header>
  );
}
