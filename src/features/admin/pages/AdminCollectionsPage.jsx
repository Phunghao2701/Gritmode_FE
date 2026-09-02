import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { toast } from '../../../shared/utils/toast';
import {
  createCollectionApi,
  deleteCollectionApi,
  getAdminCollectionsApi,
  updateCollectionApi,
} from '../../collections/apis/collection.api';

const emptyForm = { name_collection: '', parent_collection_id: '', image_collection: '' };

export default function AdminCollectionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const response = await getAdminCollectionsApi();
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : data.items || [];
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
  };

  const createMutation = useMutation({
    mutationFn: () => createCollectionApi({
      name_collection: form.name_collection.trim(),
      parent_collection_id: form.parent_collection_id ? Number(form.parent_collection_id) : null,
      image_collection: form.image_collection.trim() || null,
    }),
    onSuccess: async () => {
      await refresh();
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Đã tạo bộ sưu tập.');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Không thể tạo bộ sưu tập'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateCollectionApi(id, { is_active: isActive }),
    onSuccess: refresh,
    onError: (error) => toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollectionApi,
    onSuccess: async () => {
      await refresh();
      toast.success('Đã ngừng hiển thị bộ sưu tập.');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa bộ sưu tập'),
  });

  const openChildForm = (parentId) => {
    setForm({ ...emptyForm, parent_collection_id: String(parentId) });
    setShowForm(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Store merchandising</span>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight mt-1">Quản lý bộ sưu tập</h1>
          <p className="text-xs text-neutral-500 mt-1">Nhóm cha là tiêu đề menu; bộ sưu tập con chứa sản phẩm và ảnh đại diện.</p>
        </div>
        <PrimaryButton icon="solar:add-circle-linear" onClick={() => { setForm(emptyForm); setShowForm(true); }} size="sm">
          Thêm nhóm mới
        </PrimaryButton>
      </div>

      {showForm && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black uppercase">{form.parent_collection_id ? 'Thêm bộ sưu tập con' : 'Thêm nhóm bộ sưu tập'}</h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Đóng"><Icon icon="solar:close-circle-linear" className="text-xl" /></button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={form.name_collection}
              onChange={(event) => setForm((current) => ({ ...current, name_collection: event.target.value }))}
              placeholder={form.parent_collection_id ? 'Tên bộ sưu tập con' : 'Tên nhóm cha'}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-xs"
            />
            <select
              value={form.parent_collection_id}
              onChange={(event) => setForm((current) => ({ ...current, parent_collection_id: event.target.value }))}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-xs"
            >
              <option value="">Đây là nhóm cha</option>
              {parents.map((parent) => <option key={parent.collection_id} value={parent.collection_id}>Thuộc nhóm: {parent.name_collection}</option>)}
            </select>
            <input
              value={form.image_collection}
              disabled={!form.parent_collection_id}
              onChange={(event) => setForm((current) => ({ ...current, image_collection: event.target.value }))}
              placeholder="URL ảnh đại diện (dành cho collection con)"
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-xs disabled:opacity-50"
            />
          </div>
          <div className="flex justify-end">
            <PrimaryButton
              size="sm"
              disabled={!form.name_collection.trim() || createMutation.isPending}
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Tạo mới
            </PrimaryButton>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-400">Đang tải bộ sưu tập...</div>
      ) : parents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center text-neutral-400">Chưa có nhóm bộ sưu tập.</div>
      ) : (
        <div className="space-y-4">
          {parents.map((parent) => {
            const children = childrenByParent.get(String(parent.collection_id)) || [];
            return (
              <section key={parent.collection_id} className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                  <div>
                    <p className="text-[10px] uppercase font-black text-neutral-400">Nhóm cha</p>
                    <h2 className="font-display font-black text-xl uppercase">{parent.name_collection}</h2>
                    <p className="text-xs text-neutral-400">{children.length} bộ sưu tập con</p>
                  </div>
                  <button type="button" onClick={() => openChildForm(parent.collection_id)} className="rounded-full border border-black dark:border-white px-4 py-2 text-xs font-black uppercase">
                    + Thêm bộ sưu tập con
                  </button>
                </header>
                {children.length === 0 ? (
                  <p className="p-6 text-xs text-neutral-400">Nhóm này chưa có bộ sưu tập con.</p>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                    {children.map((child) => (
                      <article key={child.collection_id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="h-32 bg-neutral-100 dark:bg-neutral-800">
                          {child.image_collection ? <img src={child.image_collection} alt={child.name_collection} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-neutral-400"><Icon icon="solar:gallery-linear" className="text-3xl" /></div>}
                        </div>
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-black">{child.name_collection}</h3>
                            <p className="text-[11px] text-neutral-400">{child.product_count || 0} sản phẩm · {child.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" title={child.is_active ? 'Ẩn' : 'Hiển thị'} onClick={() => statusMutation.mutate({ id: child.collection_id, isActive: !child.is_active })} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700">
                              <Icon icon={child.is_active ? 'solar:eye-linear' : 'solar:eye-closed-linear'} />
                            </button>
                            <button type="button" title="Ngừng hiển thị" onClick={() => deleteMutation.mutate(child.collection_id)} className="p-2 rounded-xl border border-rose-200 text-rose-500">
                              <Icon icon="solar:trash-bin-minimalistic-linear" />
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
    </div>
  );
}
