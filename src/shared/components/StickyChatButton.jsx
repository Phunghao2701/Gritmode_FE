'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const CHAT_SCROLL_THRESHOLD = 160;

const CHANNELS = [
  {
    key: 'messenger',
    label: 'Mở Messenger',
    iconSrc:
      'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg',
    href: process.env.NEXT_PUBLIC_MESSENGER_URL?.trim(),
  },
];

export default function StickyChatButton() {
  const pathname = usePathname();
  const isBannerPage = pathname === '/';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const nextVisibility =
        !isBannerPage || window.scrollY > CHAT_SCROLL_THRESHOLD;

      setIsVisible((currentVisibility) =>
        currentVisibility === nextVisibility ? currentVisibility : nextVisibility,
      );
    };

    updateVisibility();

    if (!isBannerPage) {
      return undefined;
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => window.removeEventListener('scroll', updateVisibility);
  }, [isBannerPage]);

  const shouldShow = !isBannerPage || isVisible;

  return (
    <div
      aria-hidden={!shouldShow}
      className={`fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-2 transition-[opacity,transform,visibility] duration-500 ease-out sm:bottom-5 sm:right-4 ${
        shouldShow
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none invisible translate-y-3 opacity-0'
      }`}
    >
      {CHANNELS.map((channel) => {
        const isConfigured = Boolean(channel.href);
        const className = `${shouldShow ? 'sticky-chat-button' : ''} grid size-12 place-items-center rounded-full transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${isConfigured ? 'hover:scale-105 active:scale-100' : 'cursor-not-allowed opacity-45'}`;

        if (!isConfigured) {
          return (
            <button
              key={channel.key}
              type="button"
              disabled
              aria-label={`${channel.label} — chưa cấu hình`}
              title="Chưa cấu hình"
              className={className}
            >
              <img
                src={channel.iconSrc}
                alt=""
                aria-hidden="true"
                className="size-10 object-contain"
                loading="eager"
                decoding="async"
              />
            </button>
          );
        }

        return (
          <a
            key={channel.key}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={channel.label}
            title={channel.label}
            className={className}
          >
            <img
              src={channel.iconSrc}
              alt=""
              aria-hidden="true"
              className="size-10 object-contain"
              loading="eager"
              decoding="async"
            />
          </a>
        );
      })}
    </div>
  );
}
