import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/utils/toast';
import {
  getAdminNotificationsApi,
  markAllAdminNotificationsReadApi,
  markAdminNotificationReadApi,
} from '../apis/admin.api';
import { openAdminNotificationStream } from '../services/adminNotificationStream';
import {
  CACHE_STALE_TIME,
  invalidateAdminOperationalQueries,
} from '../../../shared/services/cachePolicy';
import { requireApiObject } from '../../../shared/services/responseContract';

export const useAdminNotifications = ({ includeAll = false } = {}) => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptRef = useRef(0);
  const seenEventIdsRef = useRef(new Set());
  const isAdmin = user?.role === 'admin';

  const query = useQuery({
    queryKey: ['admin-notifications', { includeAll }],
    queryFn: async () => {
      const response = await getAdminNotificationsApi({ page: 1, limit: includeAll ? 100 : 12 });
      const raw = requireApiObject(response, 'Thông báo quản trị');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Thông báo quản trị không hợp lệ');
      const unreadCount = Number(raw.unread_count);
      if (!Number.isFinite(unreadCount)) throw new Error('Thông báo quản trị thiếu unread_count');
      return {
        items: raw.items,
        unread_count: unreadCount,
        pagination: raw.pagination,
      };
    },
    enabled: isAdmin,
    staleTime: CACHE_STALE_TIME.adminNotifications,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  useEffect(() => {
    if (!isAdmin) return undefined;

    let disposed = false;
    let reconnectTimer;
    let controller;
    const seenEventIds = seenEventIdsRef.current;

    const scheduleReconnect = () => {
      if (disposed) return;
      window.clearTimeout(reconnectTimer);
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(30_000, 5_000 * (2 ** attempt)) + Math.floor(Math.random() * 500);
      reconnectAttemptRef.current = Math.min(attempt + 1, 3);
      reconnectTimer = window.setTimeout(connect, delay);
    };

    const connect = async () => {
      if (disposed) return;
      controller = new AbortController();
      try {
        await openAdminNotificationStream({
          signal: controller.signal,
          onEvent: ({ event, id, data }) => {
            if (event === 'ready') {
              setIsConnected(true);
              reconnectAttemptRef.current = 0;
              queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
              return;
            }
            if (event !== 'admin.notification.created') return;

            const eventId = id || data?.notification_id || data?.id;
            if (eventId && seenEventIdsRef.current.has(String(eventId))) return;
            if (eventId) {
              seenEventIdsRef.current.add(String(eventId));
              if (seenEventIdsRef.current.size > 200) {
                const oldest = seenEventIdsRef.current.values().next().value;
                seenEventIdsRef.current.delete(oldest);
              }
            }

            setIsConnected(true);
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            invalidateAdminOperationalQueries(queryClient);
            toast.info(data?.title || 'Có thông báo quản trị mới');
          },
        });
      } catch (error) {
        if (disposed || error?.name === 'AbortError') return;
        setIsConnected(false);
      } finally {
        if (!disposed && !controller?.signal.aborted) {
          setIsConnected(false);
          scheduleReconnect();
        }
      }
    };

    void connect();
    return () => {
      disposed = true;
      setIsConnected(false);
      reconnectAttemptRef.current = 0;
      seenEventIds.clear();
      window.clearTimeout(reconnectTimer);
      controller?.abort();
    };
  }, [isAdmin, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId) => markAdminNotificationReadApi(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAdminNotificationsReadApi,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-notifications'] });
      const previous = queryClient.getQueriesData({ queryKey: ['admin-notifications'] });

      queryClient.setQueriesData({ queryKey: ['admin-notifications'] }, (current) => {
        if (!current) return current;
        return {
          ...current,
          unread_count: 0,
          items: current.items.map((notification) => ({ ...notification, is_read: true })),
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  return {
    ...query,
    notifications: query.data?.items || [],
    unreadCount: query.data?.unread_count || 0,
    isConnected,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
};
