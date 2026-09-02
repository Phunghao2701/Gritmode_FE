import { useMemo, useState } from 'react';
import { useAdminCategories } from '../hooks/useAdmin';
import CategoryFormModal from '../components/CategoryFormModal';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

const normalizeText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [initialParentId, setInitialParentId] = useState('');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const { categories, isLoading, createCategory, updateCategory } = useAdminCategories();

  const categoryTree = useMemo(() => {
    const byParent = new Map();
    categories.forEach((category) => {
      const parentId = Number(category.parent_category_id || 0);
      if (!byParent.has(parentId)) byParent.set(parentId, []);
      byParent.get(parentId).push(category);
    });
    const sort = (items = []) => [...items].sort((a, b) =>
      Number(a.position_category || 0) - Number(b.position_category || 0)
      || String(a.name_category).localeCompare(String(b.name_category)),
    );
    const build = (parentId = 0) => sort(byParent.get(parentId)).map((category) => ({
      ...category,
      children: build(Number(category.category_id)),
    }));
    return build();
  }, [categories]);

  const visibleTree = useMemo(() => {
    const keyword = normalizeText(search.trim());
    if (!keyword) return categoryTree;
    return categoryTree.reduce((result, root) => {
      const matchingChildren = root.children.filter((child) => normalizeText(child.name_category).includes(keyword));
      if (normalizeText(root.name_category).includes(keyword) || matchingChildren.length) {
        result.push({ ...root, children: matchingChildren.length ? matchingChildren : root.children });
      }
      return result;
    }, []);
  }, [categoryTree, search]);

  const openCreate = (parentId = '') => {
    setEditingCategory(null);
    setInitialParentId(String(parentId || ''));
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setInitialParentId('');
    setModalOpen(true);
  };

  const toggleRoot = (categoryId) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const isRootExpanded = (categoryId) => Boolean(search.trim()) || expandedIds.has(categoryId);

  const handleSubmit = (formData) => {
    const payload = { ...formData, parent_category_id: formData.parent_category_id ? Number(formData.parent_category_id) : null };
    if (editingCategory) updateCategory({ id: editingCategory.category_id, data: payload });
    else createCategory(payload);
  };

  const totalProducts = categories.reduce((sum, category) => sum + Number(category.product_count || 0), 0);
  const childCount = categories.filter((category) => category.parent_category_id).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-balance font-display text-3xl font-black uppercase tracking-tight text-black dark:text-white">Quản lý danh mục</h1>
          </div>
          <PrimaryButton icon="solar:add-circle-linear" onClick={() => openCreate()} size="sm">Thêm danh mục gốc</PrimaryButton>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          {[
            ['Nhóm chính', categoryTree.length], ['Danh mục con', childCount], ['Lượt gắn sản phẩm', totalProducts],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
              <div className="tabular-nums text-xl font-black text-black dark:text-white">{value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="relative max-w-md">
        <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm danh mục..." className="h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition-[border-color,box-shadow] focus:border-black focus:ring-2 focus:ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white" />
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">Đang tải danh mục...</div>
      ) : visibleTree.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Icon icon="solar:folder-open-linear" className="mx-auto mb-3 text-4xl text-neutral-300" />
          <p className="font-bold text-neutral-500">Không tìm thấy danh mục phù hợp.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleTree.map((root) => (
            <section key={root.category_id} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <header className={`flex items-center gap-3 p-5 ${isRootExpanded(root.category_id) ? 'border-b border-neutral-100 dark:border-neutral-800' : ''}`}>
                <button type="button" onClick={() => toggleRoot(root.category_id)} aria-expanded={isRootExpanded(root.category_id)} className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                  <Icon aria-hidden="true" icon="solar:alt-arrow-right-linear" className={`shrink-0 text-lg transition-transform ${isRootExpanded(root.category_id) ? 'rotate-90' : ''}`} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-black text-black dark:text-white">{root.name_category}</h2>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">Nhóm chính</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">/{root.slug_category} · {root.children.length} danh mục con</p>
                  </div>
                </button>
                <button onClick={() => openCreate(root.category_id)} className="hidden min-h-10 px-3 text-xs font-black text-neutral-500 hover:text-black dark:hover:text-white sm:block">Thêm danh mục con</button>
                <button aria-label={`Sửa ${root.name_category}`} title="Chỉnh sửa tên" onClick={() => openEdit(root)} className="flex size-10 shrink-0 items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white"><Icon icon="solar:pen-2-linear" /></button>
              </header>
              {isRootExpanded(root.category_id) && <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {root.children.length === 0 ? (
                  <button onClick={() => openCreate(root.category_id)} className="flex min-h-20 w-full items-center justify-center gap-2 text-sm font-bold text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-black dark:hover:bg-neutral-800/50 dark:hover:text-white"><Icon icon="solar:add-circle-linear" /> Thêm danh mục con đầu tiên</button>
                ) : root.children.map((child) => (
                  <div key={child.category_id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 pl-2 sm:pl-8">
                      <span className="h-px w-5 shrink-0 bg-neutral-300 dark:bg-neutral-700" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><h3 className="truncate text-sm font-black text-black dark:text-white">{child.name_category}</h3>{child.is_active === false && <span className="text-[9px] font-black uppercase text-rose-500">Đang ẩn</span>}</div>
                        <p className="mt-1 text-xs text-neutral-400">/{child.slug_category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-5 pl-10 sm:pl-0">
                      <span className="tabular-nums text-xs font-black text-neutral-600 dark:text-neutral-300">{child.product_count || 0} sản phẩm</span>
                      <div className="flex gap-1">
                        <button aria-label={`Sửa ${child.name_category}`} title="Chỉnh sửa tên" onClick={() => openEdit(child)} className="flex size-10 items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white"><Icon icon="solar:pen-2-linear" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>}
            </section>
          ))}
        </div>
      )}

      {modalOpen && <CategoryFormModal category={editingCategory} categories={categoryTree} initialParentId={initialParentId} onClose={() => setModalOpen(false)} onSubmitCategory={handleSubmit} />}
    </div>
  );
}
