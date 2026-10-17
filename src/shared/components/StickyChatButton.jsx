'use client';

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
  return (
    <div className="fixed bottom-4 right-3 z-[70] flex flex-col items-end gap-2 sm:bottom-4 sm:right-3">
      {CHANNELS.map((channel) => {
        const isConfigured = Boolean(channel.href);
        const className = `grid size-12 place-items-center rounded-full transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${isConfigured ? 'hover:scale-105 active:scale-100' : 'cursor-not-allowed opacity-45'}`;

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
