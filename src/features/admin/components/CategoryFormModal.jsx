import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';

export default function CategoryFormModal({ category, onClose, onSubmitCategory }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    isFeatured: !!category?.isFeatured,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitCategory(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <h3 className="font-display font-black text-lg uppercase tracking-tight text-black dark:text-white">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <InputField
            label="Tên danh mục *"
            placeholder="Ví dụ: Tops & Tees"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <InputField
            label="Slug (Đường dẫn tĩnh)"
            placeholder="tops-and-tees"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-neutral-500 block">Mô tả</label>
            <textarea
              rows={3}
              placeholder="Mô tả về dòng sản phẩm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white font-medium focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="featured" className="font-bold cursor-pointer text-black dark:text-white">
              Đánh dấu là danh mục nổi bật
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:border-black dark:hover:border-white transition-all cursor-pointer"
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
