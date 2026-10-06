import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/utils/toast';
import {
  getAdminNotificationsApi,
  markAllAdminNotificationsReadApi,
  markAdminNotificationReadApi,
} from '../apis/admin.api';
import { openAdminNotificationStream } from '../services/adminNotificationStream';

export const useAdminNotifications = ({ includeAll = false } = {}) => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const isAdmin = user?.role === 'admin';

  const query = useQuery({
    queryKey: ['admin-notifications', { includeAll }],
    queryFn: async () => {
      const response = await getAdminNotificationsApi({ page: 1, limit: includeAll ? 100 : 12 });
      const raw = response.data?.data || response.data || {};
      return {
        items: raw.items || [],
        unread_count: Number(raw.unread_count || 0),
        pagination: raw.pagination || {},
      };
    },
    enabled: isAdmin,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isAdmin) return undefined;

    let disposed = false;
    let reconnectTimer;
    let controller;

    const connect = async () => {
      if (disposed) return;
      controller = new AbortController();
      try {
        await openAdminNotificationStream({
          signal: controller.signal,
          onEvent: ({ event, data }) => {
            if (event === 'ready') {
              setIsConnected(true);
              return;
            }
            if (event !== 'admin.notification.created') return;

            setIsConnected(true);
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.info(data?.title || 'Có thông báo quản trị mới');
          },
        });
      } catch (error) {
        if (disposed || error?.name === 'AbortError') return;
        setIsConnected(false);
        reconnectTimer = window.setTimeout(connect, 5000);
      }
    };

    void connect();
    return () => {
      disposed = true;
      setIsConnected(false);
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
