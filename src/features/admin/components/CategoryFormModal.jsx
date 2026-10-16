import { useEffect, useRef, useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';

export const slugify = (text = '') => {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function CategoryFormModal({ category, categories = [], initialParentId = '', onClose, onSubmitCategory }) {
  const dialogRef = useRef(null);
  const [formData, setFormData] = useState({
    name_category: category?.name_category || '',
    slug_category: category?.slug_category || '',
    parent_category_id: category?.parent_category_id ? String(category.parent_category_id) : String(initialParentId || ''),
    position_category: Number(category?.position_category || 0),
  });

  const parentChoices = categories.filter(
    (item) => Number(item.category_id || item.id) !== Number(category?.category_id || category?.id),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const focusable = () => [...dialog.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')];
    dialog.querySelector('input')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0]?.focus();
      }
    };
    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const handleNameChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      name_category: val,
      slug_category: slugify(val),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSlug = formData.slug_category.trim() || slugify(formData.name_category);
    const parentId = formData.parent_category_id ? Number(formData.parent_category_id) : null;
    onSubmitCategory({
      name_category: formData.name_category.trim(),
      slug_category: finalSlug,
      parent_category_id: parentId,
      position_category: Number(formData.position_category) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-sans font-[550] backdrop-blur-sm animate-fade-in">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="category-modal-title" className="w-full max-w-md max-h-[calc(100dvh-2rem)] space-y-6 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <h3 id="category-modal-title" className="font-sans text-lg font-[550] uppercase tracking-tight text-black dark:text-white">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-400 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
          >
            <Icon icon="solar:close-linear" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <InputField
            name="name_category"
            label="Tên danh mục"
            placeholder="Ví dụ: Tops & Tees"
            value={formData.name_category}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-[550] uppercase tracking-wider text-neutral-500">Danh mục cha</label>
            <select
              name="parent_category_id"
              value={formData.parent_category_id}
              onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 font-sans text-xs font-[550] text-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
            >
              <option value="">Không có — danh mục gốc</option>
              {parentChoices.map((item) => (
                <option key={item.category_id || item.id} value={item.category_id || item.id}>
                  {item.name_category || item.name}
                </option>
              ))}
            </select>
            <p className="font-normal text-[11px] text-neutral-400">Chỉ danh mục gốc có thể được chọn làm danh mục cha.</p>
          </div>

          <InputField
            name="position_category"
            label="Thứ tự hiển thị"
            type="number"
            min="0"
            value={formData.position_category}
            onChange={(e) => setFormData({ ...formData, position_category: Number(e.target.value) })}
            disabled={!formData.parent_category_id}
            helperText={!formData.parent_category_id ? 'Chọn danh mục gốc để thiết lập thứ tự hiển thị.' : undefined}
          />

          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2.5 font-sans text-xs font-[550] text-neutral-600 transition-all hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
            >
              Hủy
            </button>
            <PrimaryButton type="submit" size="sm">
              {category ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
