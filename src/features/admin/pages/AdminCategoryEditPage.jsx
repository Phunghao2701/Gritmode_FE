import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useAdminCategories } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { slugify } from '../components/CategoryFormModal';
import { toast } from '../../../shared/utils/toast';

export default function AdminCategoryEditPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(categoryId);
  const parentIdParam = searchParams.get('parentId');

  const { categories, isLoading: loadingCategories, createCategory, updateCategory } = useAdminCategories();

  const [form, setForm] = useState({
    name_category: '',
    parent_category_id: parentIdParam ? String(parentIdParam) : '',
    position_category: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Determine parent info
  const parentCategory = useMemo(() => {
    const pId = form.parent_category_id || parentIdParam;
    if (!pId) return null;
    return categories.find((c) => Number(c.category_id || c.id) === Number(pId));
  }, [categories, form.parent_category_id, parentIdParam]);

  const isChildCategory = Boolean(parentIdParam || form.parent_category_id);

  // Load existing data if edit mode
  useEffect(() => {
    if (isEditMode && categories.length > 0) {
      const current = categories.find((c) => Number(c.category_id || c.id) === Number(categoryId));
      if (current) {
        setForm({
          name_category: current.name_category || '',
          parent_category_id: current.parent_category_id ? String(current.parent_category_id) : '',
          position_category: Number(current.position_category || 0),
        });
      }
    } else if (parentIdParam) {
      setForm((prev) => ({
        ...prev,
        parent_category_id: String(parentIdParam),
      }));
    }
  }, [isEditMode, categoryId, categories, parentIdParam]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name_category.trim()) {
      toast.error('Vui lòng nhập tên danh mục.');
      return;
    }

    const payload = {
      name_category: form.name_category.trim(),
      slug_category: slugify(form.name_category),
      parent_category_id: form.parent_category_id ? Number(form.parent_category_id) : null,
      position_category: Number(form.position_category) || 0,
      is_active: true,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateCategory({ id: Number(categoryId), data: payload });
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory(payload);
        toast.success(isChildCategory ? 'Tạo danh mục con thành công!' : 'Tạo danh mục gốc thành công!');
      }
      navigate('/admin/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories && isEditMode) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <LoadingSkeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const pageTitle = isEditMode
    ? 'Chỉnh sửa danh mục'
    : isChildCategory
    ? 'Thêm danh mục con'
    : 'Thêm danh mục gốc';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white mb-2 transition-colors"
          >
            <Icon icon="solar:arrow-left-linear" />
            <span>Quay lại danh mục</span>
          </Link>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white">
            {pageTitle}
          </h1>
        </div>

        <PrimaryButton
          onClick={handleSubmit}
          isLoading={submitting}
          disabled={!form.name_category.trim()}
          icon={isEditMode ? 'solar:diskette-bold' : 'solar:check-circle-linear'}
        >
          {isEditMode ? 'Lưu thay đổi' : 'Lưu danh mục'}
        </PrimaryButton>
      </div>

      {/* Main Form Section */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-12 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <span className="grid size-9 place-items-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
              <Icon icon="solar:widget-5-linear" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Thông tin danh mục</p>
              <h2 className="font-display font-black text-lg uppercase text-black dark:text-white">
                {isChildCategory ? 'Thông tin danh mục con' : 'Tên nhóm danh mục'}
              </h2>
            </div>
          </div>

          {/* If creating child category, show fixed parent information */}
          {isChildCategory && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  Thuộc danh mục cha
                </span>
                <span className="font-black text-sm text-black dark:text-white mt-0.5 block">
                  {parentCategory ? (parentCategory.name_category || parentCategory.name) : `ID #${form.parent_category_id}`}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                Danh mục con
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-xs font-black uppercase tracking-wider text-neutral-500">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                value={form.name_category}
                onChange={(e) => setForm((p) => ({ ...p, name_category: e.target.value }))}
                placeholder={isChildCategory ? "Ví dụ: Áo Thun Boxy, Quần Short..." : "Ví dụ: TOPS, BOTTOMS, PHỤ KIỆN..."}
                maxLength={255}
                autoFocus
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-sm text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category-position" className="text-xs font-black uppercase tracking-wider text-neutral-500">
                Thứ tự hiển thị
              </label>
              <input
                id="category-position"
                type="number"
                min="0"
                value={String(form.position_category)}
                onChange={(e) => setForm((p) => ({ ...p, position_category: e.target.value }))}
                placeholder="0"
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              <span className="text-[11px] text-neutral-400 block">Số càng nhỏ hiển thị càng trước trong menu</span>
            </div>
          </div>
        </section>
      </form>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-4 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-between gap-4">
        <Link
          to="/admin/categories"
          className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white"
        >
          Hủy bỏ
        </Link>
        <PrimaryButton
          onClick={handleSubmit}
          isLoading={submitting}
          disabled={!form.name_category.trim()}
        >
          {isEditMode ? 'Lưu thay đổi' : 'Lưu danh mục'}
        </PrimaryButton>
      </div>
    </div>
  );
}
