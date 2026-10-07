'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../../../shared/components/Icon';
import ErrorState from '../../../shared/components/ErrorState';
import { useAdminNotifications } from '../hooks/useAdminNotifications';

const formatTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
};

const getNotificationMeta = (notification) => {
  if (notification.event_type?.includes('payment')) {
    return { icon: 'solar:card-recive-linear', label: 'Thanh toán' };
  }

  if (notification.entity_type === 'order' || notification.event_type?.includes('order')) {
    return { icon: 'solar:bag-4-linear', label: 'Đơn hàng' };
  }

  return { icon: 'solar:bell-linear', label: 'Hệ thống' };
};

export default function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const notificationRef = useRef(null);
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isFetching: isNotificationsFetching,
    isError: isNotificationsError,
    refetch: refetchNotifications,
    markRead,
    markAllRead,
    isMarkingAllRead,
  } = useAdminNotifications({ includeAll: showAll });

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target)) setIsOpen(false);
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

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    if (!notification.is_read) markRead(notification.admin_notification_id);

    const orderId = notification.entity_id || notification.payload?.order_id;
    if (orderId) {
      router.push(`/admin/orders?orderId=${encodeURIComponent(orderId)}`);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !isMarkingAllRead) markAllRead();
  };

  const displayedNotifications = notifications;
  const displayedUnreadCount = unreadCount;
  const visibleNotifications = filter === 'unread'
    ? displayedNotifications.filter((notification) => !notification.is_read)
    : displayedNotifications;
  const renderedNotifications = showAll ? visibleNotifications : visibleNotifications.slice(0, 4);

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((value) => !value);
          setShowAll(false);
        }}
        className="notification-motion relative grid size-11 place-items-center rounded-full border border-neutral-200 text-black transition-[border-color,background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900 dark:hover:border-neutral-600 active:translate-y-0"
        aria-label="Mở thông báo quản trị"
        aria-expanded={isOpen}
        aria-controls="admin-notification-popover"
      >
        <Icon icon="solar:bell-bing-linear" className="text-xl" />
        {displayedUnreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-5 h-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black tabular-nums text-white ring-2 ring-white dark:ring-black">
            {displayedUnreadCount > 99 ? '99+' : displayedUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="admin-notification-popover"
          className="animate-notification-popover absolute right-0 top-[3.25rem] z-50 flex max-h-[calc(100dvh-5rem)] w-[min(94vw,400px)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_4px_8px_hsl(0_0%_0%/0.08)] dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="shrink-0 border-b border-neutral-200 bg-white px-4 pt-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[15px] font-black tracking-tight text-neutral-950 dark:text-white">Thông báo</h2>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={displayedUnreadCount === 0 || isMarkingAllRead}
                className="notification-motion relative min-h-11 shrink-0 px-1 text-[11px] font-bold text-red-600 transition-[color,transform] duration-200 ease-out hover:-translate-y-px hover:text-red-700 disabled:cursor-default disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:disabled:hover:text-red-400 after:pointer-events-none after:absolute after:bottom-2 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100"
                aria-label="Đánh dấu tất cả thông báo đã đọc"
              >
                Đã đọc
              </button>
            </div>

            <div className="mt-3 flex items-end gap-5" role="tablist" aria-label="Bộ lọc thông báo">
              {[
                { value: 'all', label: 'Tất cả', count: displayedNotifications.length },
                { value: 'unread', label: 'Chưa đọc', count: displayedUnreadCount },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`notification-motion relative min-h-10 pb-2 text-xs font-bold transition-[color,transform] duration-200 ease-out hover:-translate-y-px ${
                    filter === tab.value
                      ? 'text-neutral-950 dark:text-white'
                      : 'text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300'
                  }`}
                >
                  {tab.label} <span className="ml-0.5 tabular-nums">{tab.count}</span>
                  {filter === tab.value && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-red-600" />}
                </button>
              ))}
            </div>
          </div>

          <div
            data-lenis-prevent
            className="min-h-0 min-w-0 max-h-[calc(100dvh-12rem)] flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-neutral-950"
          >
            {isNotificationsError ? (
              <ErrorState onRetry={refetchNotifications} className="min-h-[220px] rounded-none border-0 bg-transparent" />
            ) : visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
                  <Icon icon="solar:check-read-linear" className="text-xl" />
                </span>
                <p className="mt-3 text-sm font-bold text-neutral-700 dark:text-neutral-200">
                  {filter === 'unread' ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo'}
                </p>
              </div>
            ) : renderedNotifications.map((notification, index) => (
              (() => {
                const meta = getNotificationMeta(notification);
                return (
                  <button
                    key={notification.admin_notification_id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
                    className={`notification-motion animate-notification-item group flex w-full min-w-0 items-start gap-3 border-b border-neutral-100 px-4 py-3.5 text-left transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px focus-visible:relative focus-visible:z-10 dark:border-neutral-900 ${
                      notification.is_read
                        ? 'bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900'
                        : 'bg-red-50/55 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30'
                    }`}
                  >
                    <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${notification.is_read ? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400' : 'bg-white text-red-600 ring-1 ring-red-100 dark:bg-neutral-900 dark:text-red-300 dark:ring-red-900/60'}`}>
                      <Icon icon={meta.icon} className="text-sm" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-start gap-2">
                        <span className={`min-w-0 flex-1 break-words text-[13px] leading-snug ${notification.is_read ? 'font-medium text-neutral-700 dark:text-neutral-300' : 'font-bold text-neutral-950 dark:text-white'}`}>
                          {notification.title}
                        </span>
                        {!notification.is_read && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-600" aria-label="Chưa đọc" />}
                      </span>
                      <span className="mt-1 block break-words text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{notification.body}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-neutral-400">
                        <span>{formatTime(notification.created_at)}</span>
                        <span className="size-0.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        <span>{meta.label}</span>
                      </span>
                    </span>
                  </button>
                );
              })()
            ))}
          </div>

          {visibleNotifications.length > 4 && (
            <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950">
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="notification-motion flex min-h-10 w-full items-center justify-center gap-2 text-xs font-bold text-neutral-500 transition-[color,transform] duration-200 ease-out hover:-translate-y-px hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              >
                {showAll && isNotificationsFetching ? 'Đang tải...' : showAll ? 'Thu gọn' : 'Xem tất cả'}
                <Icon icon={showAll ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} className="text-sm" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
