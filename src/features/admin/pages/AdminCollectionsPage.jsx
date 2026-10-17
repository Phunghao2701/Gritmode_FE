'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { toast } from '../../../shared/utils/toast';
import AdminPageHeader from '../components/AdminPageHeader';
import {
  deleteCollectionApi,
  getAdminCollectionsApi,
} from '../../collections/apis/collection.api';
import { broadcastQueryInvalidation } from '../../../shared/services/queryClient';
import { requireApiArray } from '../../../shared/services/responseContract';
import ErrorState from '../../../shared/components/ErrorState';

export default function AdminCollectionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [deletingCollection, setDeletingCollection] = useState(null);

  const { data: collections = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-collections'],
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    queryFn: async () => {
      const response = await getAdminCollectionsApi();
      return requireApiArray(response, 'Danh sách bộ sưu tập');
    },
  });

  const parents = useMemo(() => collections.filter((item) => !item.parent_collection_id), [collections]);
  const childrenByParent = useMemo(() => {
    const grouped = new Map();
    collections.filter((item) => item.parent_collection_id).forEach((item) => {
      const key = String(item.parent_collection_id);
      grouped.set(key, [...(grouped.get(key) || []), item]);
    });
    return grouped;
  }, [collections]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] }),
      queryClient.invalidateQueries({ queryKey: ['collections-public-list'] }),
    ]);
    broadcastQueryInvalidation([
      ['admin-collections'],
      ['collections-public-list'],
      ['collection-detail'],
    ]);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCollectionApi(id),
    onSuccess: async () => {
      await refresh();
      toast.success('Đã xóa bộ sưu tập thành công.');
      setDeletingCollection(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa bộ sưu tập'),
  });

  const handleDeleteConfirm = () => {
    if (!deletingCollection) return;
    deleteMutation.mutate(deletingCollection.collection_id || deletingCollection.id);
  };

  if (isError && !isLoading) {
    return <ErrorState onRetry={refetch} title="Không thể tải bộ sưu tập" />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 font-sans font-[550]">
      <AdminPageHeader
        eyebrow="Sản phẩm & Kho"
        title="Quản lý bộ sưu tập"
        description="Nhóm cha là tiêu đề menu; bộ sưu tập con chứa sản phẩm và ảnh đại diện."
        actions={(
          <PrimaryButton
            icon="solar:add-circle-linear"
            onClick={() => router.push('/admin/collections/create')}
            size="sm"
          >
            Thêm nhóm mới
          </PrimaryButton>
        )}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <LoadingSkeleton key={n} height="90px" className="rounded-2xl" />
          ))}
        </div>
      ) : parents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center font-normal text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900">
          Chưa có nhóm bộ sưu tập.
        </div>
      ) : (
        <div className="space-y-4">
          {parents.map((parent) => {
            const isExpanded = expandedIds.has(parent.collection_id);
            const children = childrenByParent.get(String(parent.collection_id)) || [];

            return (
              <section
                key={parent.collection_id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Header / Parent Row */}
                <header className="flex flex-wrap items-center gap-3 px-6 py-5 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setExpandedIds((current) => {
                      const next = new Set(current);
                      if (next.has(parent.collection_id)) next.delete(parent.collection_id);
                      else next.add(parent.collection_id);
                      return next;
                    })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                  >
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className={`shrink-0 text-base transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    <div>
                      <p className="font-sans text-[10px] font-[550] uppercase text-neutral-400">Nhóm cha</p>
                      <h2 className="font-sans text-xl font-[550] uppercase text-black dark:text-white">
                        {parent.name_collection}
                      </h2>
                      <p className="font-normal text-xs text-neutral-400">{children.length} bộ sưu tập con</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Edit Parent */}
                    <button
                      type="button"
                      title="Chỉnh sửa nhóm"
                      onClick={() => router.push(`/admin/collections/create?edit_collection_id=${parent.collection_id}`)}
                      className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Icon icon="solar:pen-2-linear" className="text-base" />
                    </button>

                    {/* Delete Parent */}
                    <button
                      type="button"
                      title="Xóa nhóm cha"
                      onClick={() => setDeletingCollection(parent)}
                      className="p-2 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="text-base" />
                    </button>

                    {/* Add child button */}
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/collections/create?parent_collection_id=${parent.collection_id}`)}
                      className="ml-1 cursor-pointer rounded-full border border-black px-4 py-2 font-sans text-xs font-[550] uppercase text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                      + Thêm bộ sưu tập con
                    </button>
                  </div>
                </header>

                {/* Children Grid */}
                {!isExpanded ? null : children.length === 0 ? (
                  <p className="p-6 font-normal text-xs text-neutral-400">Nhóm này chưa có bộ sưu tập con.</p>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                    {children.map((child) => (
                      <article
                        key={child.collection_id}
                        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900"
                      >
                        <div className="h-32 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          {child.image_collection ? (
                            <img
                              src={child.image_collection}
                              alt={child.name_collection}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400">
                              <Icon icon="solar:gallery-linear" className="text-3xl" />
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-sans text-sm font-[550] text-black dark:text-white">{child.name_collection}</h3>
                            <p className="mt-0.5 font-normal text-[11px] text-neutral-400">{child.product_count || 0} sản phẩm</p>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Edit Child */}
                            <button
                              type="button"
                              title="Chỉnh sửa"
                              onClick={() => router.push(`/admin/collections/create?edit_collection_id=${child.collection_id}&parent_collection_id=${parent.collection_id}`)}
                              className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                              <Icon icon="solar:pen-2-linear" className="text-sm" />
                            </button>

                            {/* Delete Child */}
                            <button
                              type="button"
                              title="Xóa bộ sưu tập"
                              onClick={() => setDeletingCollection(child)}
                              className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Icon icon="solar:trash-bin-trash-linear" className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCollection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Icon icon="solar:trash-bin-trash-bold" className="text-xl" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-[550] uppercase text-black dark:text-white">
                  Xóa bộ sưu tập
                </h3>
                <p className="font-normal text-xs text-neutral-400">Thao tác này sẽ xóa hoàn toàn khỏi hệ thống</p>
              </div>
            </div>

            <p className="font-normal text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              Bạn có chắc chắn muốn xóa bộ sưu tập <span className="font-sans font-[550] text-black dark:text-white">"{deletingCollection.name_collection}"</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCollection(null)}
                className="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 font-sans text-xs font-[550] text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-xl bg-rose-600 px-5 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-white transition-colors hover:bg-rose-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
