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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="category-modal-title" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <h3 id="category-modal-title" className="font-display font-black text-lg uppercase tracking-tight text-black dark:text-white">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <InputField
            name="name_category"
            label="Tên danh mục"
            placeholder="Ví dụ: Tops & Tees"
            value={formData.name_category}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-neutral-500 block">Danh mục cha</label>
            <select
              name="parent_category_id"
              value={formData.parent_category_id}
              onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white font-medium focus:outline-none"
            >
              <option value="">Không có — danh mục gốc</option>
              {parentChoices.map((item) => (
                <option key={item.category_id || item.id} value={item.category_id || item.id}>
                  {item.name_category || item.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400">Chỉ danh mục gốc có thể được chọn làm danh mục cha.</p>
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:border-neutral-400 dark:hover:border-neutral-500 transition-all cursor-pointer"
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
