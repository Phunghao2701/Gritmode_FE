'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const CHANNELS = [
  {
    key: 'messenger',
    label: 'Messenger',
    icon: 'simple-icons:messenger',
    href: process.env.NEXT_PUBLIC_MESSENGER_URL?.trim(),
  },
  {
    key: 'zalo',
    label: 'Zalo',
    icon: 'simple-icons:zalo',
    href: process.env.NEXT_PUBLIC_ZALO_URL?.trim(),
  },
  {
    key: 'hotline',
    label: 'Hotline CSKH',
    icon: 'solar:phone-linear',
    href: 'tel:0326747206',
  },
];

export default function StickyChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 right-4 z-[70] sm:bottom-6 sm:right-6"
    >
      {isOpen && (
        <div
          id="sticky-chat-menu"
          role="menu"
          aria-label="Kênh hỗ trợ Gritmode"
          className="mb-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
        >
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="text-[10px] font-[650] uppercase tracking-[0.18em] text-neutral-400">
              Hỗ trợ trực tiếp
            </p>
            <p className="mt-1 text-sm font-[550] text-black">
              Chọn kênh để liên hệ Gritmode
            </p>
          </div>

          <div className="p-2">
            {CHANNELS.map((channel) => {
              const isAvailable = Boolean(channel.href);
              const content = (
                <>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-lg text-black">
                    <Icon icon={channel.icon} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-[550] text-black">
                      {channel.label}
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      {isAvailable ? 'Mở kênh liên hệ' : 'Chưa cấu hình'}
                    </span>
                  </span>
                </>
              );

              if (!isAvailable) {
                return (
                  <div
                    key={channel.key}
                    role="menuitem"
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-2.5 py-2.5 opacity-45"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <a
                  key={channel.key}
                  href={channel.href}
                  target={channel.href.startsWith('tel:') ? undefined : '_blank'}
                  rel={channel.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="sticky-chat-menu"
        aria-label={isOpen ? 'Đóng kênh hỗ trợ' : 'Mở kênh hỗ trợ'}
        onClick={() => setIsOpen((current) => !current)}
        className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-black px-4 text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:translate-y-0 sm:min-h-12 sm:px-5"
      >
        <Icon
          icon={isOpen ? 'solar:close-circle-linear' : 'solar:chat-round-dots-bold'}
          className="text-[22px]"
          aria-hidden="true"
        />
        <span className="hidden text-[11px] font-[650] uppercase tracking-[0.14em] sm:inline">
          Hỗ trợ
        </span>
      </button>
    </div>
  );
}
