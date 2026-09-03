import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCategories } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';

const normalizeText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [deletingCategory, setDeletingCategory] = useState(null);

  const {
    categories,
    isLoading,
    deleteCategory,
  } = useAdminCategories();

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
      children: build(Number(category.category_id || category.id)),
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

  const toggleRoot = (categoryId) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const isRootExpanded = (categoryId) => Boolean(search.trim()) || expandedIds.has(categoryId);

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;
    deleteCategory(Number(deletingCategory.category_id || deletingCategory.id), {
      onSettled: () => setDeletingCategory(null),
    });
  };

  const totalProducts = categories.reduce((sum, category) => sum + Number(category.product_count || 0), 0);
  const childCount = categories.filter((category) => category.parent_category_id).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Store Taxonomy</span>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white mt-1">
              Quản lý danh mục
            </h1>
            <p className="text-xs text-neutral-500 mt-1">Danh mục chính là phân loại lớn; danh mục con chứa chi tiết sản phẩm.</p>
          </div>
          <PrimaryButton
            icon="solar:add-circle-linear"
            onClick={() => navigate('/admin/categories/create')}
            size="sm"
          >
            Thêm danh mục gốc
          </PrimaryButton>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          {[
            ['Nhóm chính', categoryTree.length],
            ['Danh mục con', childCount],
            ['Lượt gắn sản phẩm', totalProducts],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
              <div className="tabular-nums text-xl font-black text-black dark:text-white">{value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
          className="h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
        />
      </div>

      {/* Categories Tree List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <LoadingSkeleton key={n} height="90px" className="rounded-3xl" />
          ))}
        </div>
      ) : visibleTree.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <Icon icon="solar:folder-open-linear" className="mx-auto mb-3 text-4xl text-neutral-300" />
          <p className="font-bold text-sm text-neutral-500">Không tìm thấy danh mục phù hợp.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleTree.map((root) => {
            const isExpanded = isRootExpanded(root.category_id || root.id);
            const rootId = root.category_id || root.id;

            return (
              <section
                key={rootId}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Header / Parent Row */}
                <header className={`flex flex-wrap items-center gap-3 px-6 py-5 bg-neutral-50 dark:bg-neutral-800/50 ${
                  isExpanded ? 'border-b border-neutral-200 dark:border-neutral-800' : ''
                }`}>
                  <button
                    type="button"
                    onClick={() => toggleRoot(rootId)}
                    aria-expanded={isExpanded}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                  >
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className={`shrink-0 text-base transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    <div>
                      <p className="text-[10px] uppercase font-black text-neutral-400">Nhóm cha</p>
                      <h2 className="font-display font-black text-lg uppercase text-black dark:text-white">
                        {root.name_category}
                      </h2>
                      <p className="text-xs text-neutral-400">
                        /{root.slug_category} · {root.children.length} danh mục con
                      </p>
                    </div>
                  </button>

                  {/* Actions for Root Category */}
                  <div className="flex items-center gap-2">
                    {/* Edit */}
                    <button
                      type="button"
                      title="Chỉnh sửa danh mục"
                      onClick={() => navigate(`/admin/categories/${rootId}/edit`)}
                      className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Icon icon="solar:pen-2-linear" className="text-base" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Xóa danh mục"
                      onClick={() => setDeletingCategory(root)}
                      className="p-2 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="text-base" />
                    </button>

                    {/* Add child button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/categories/create?parentId=${rootId}`)}
                      className="rounded-full border border-black dark:border-white px-4 py-2 text-xs font-black uppercase text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors ml-1 cursor-pointer"
                    >
                      + Thêm danh mục con
                    </button>
                  </div>
                </header>

                {/* Children List */}
                {isExpanded && (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {root.children.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/categories/create?parentId=${rootId}`)}
                        className="flex min-h-20 w-full items-center justify-center gap-2 text-xs font-bold text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-black dark:hover:bg-neutral-800/50 dark:hover:text-white cursor-pointer"
                      >
                        <Icon icon="solar:add-circle-linear" /> Thêm danh mục con đầu tiên
                      </button>
                    ) : (
                      root.children.map((child) => {
                        const childId = child.category_id || child.id;

                        return (
                          <div
                            key={childId}
                            className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3 pl-2 sm:pl-6">
                              <span className="h-px w-5 shrink-0 bg-neutral-300 dark:bg-neutral-700" />
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-black text-black dark:text-white">
                                  {child.name_category}
                                </h3>
                                <p className="mt-0.5 text-xs text-neutral-400">/{child.slug_category}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pl-10 sm:pl-0">
                              <span className="tabular-nums text-xs font-black text-neutral-600 dark:text-neutral-300">
                                {child.product_count || 0} sản phẩm
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Edit */}
                                <button
                                  type="button"
                                  title="Chỉnh sửa danh mục"
                                  onClick={() => navigate(`/admin/categories/${childId}/edit`)}
                                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                >
                                  <Icon icon="solar:pen-2-linear" className="text-base" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  title="Xóa danh mục"
                                  onClick={() => setDeletingCategory(child)}
                                  className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                >
                                  <Icon icon="solar:trash-bin-trash-linear" className="text-base" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Icon icon="solar:trash-bin-trash-bold" className="text-xl" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg uppercase text-black dark:text-white">
                  Xóa danh mục
                </h3>
                <p className="text-xs text-neutral-400">Thao tác này sẽ xóa hoàn toàn khỏi hệ thống</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục <span className="font-black text-black dark:text-white">"{deletingCategory.name_category}"</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
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
