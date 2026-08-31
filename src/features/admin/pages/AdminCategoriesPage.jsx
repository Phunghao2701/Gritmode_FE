import React, { useState } from 'react';
import { useAdminCategories } from '../hooks/useAdmin';
import CategoryFormModal from '../components/CategoryFormModal';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function AdminCategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useAdminCategories();

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id || editingCategory._id, data: formData });
    } else {
      createCategory(formData);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Taxonomy & Grouping
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-1">
            Quản lý danh mục & Bộ sưu tập ({categories.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Phân loại các dòng sản phẩm thời trang và drops thiết kế đặc biệt.
          </p>
        </div>

        <PrimaryButton icon="solar:add-circle-linear" onClick={handleOpenCreate} size="sm">
          Thêm danh mục mới
        </PrimaryButton>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-neutral-400 text-xs">
            Chưa có danh mục nào.
          </div>
        ) : (
          categories.map((cat) => (
            <div 
              key={cat.id || cat._id} 
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4 group hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-neutral-400">
                    Slug: /{cat.slug}
                  </span>
                  {cat.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                      Nổi bật
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-xl text-black dark:text-white">
                  {cat.name}
                </h3>

                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'Chưa có mô tả chi tiết cho danh mục này.'}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                  {cat.itemCount || 0} sản phẩm
                </span>

                <div className="space-x-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Icon icon="solar:pen-2-linear" className="text-base" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
                        deleteCategory(cat.id || cat._id);
                      }
                    }}
                    className="p-2 rounded-xl text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Icon icon="solar:trash-bin-minimalistic-linear" className="text-base" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSubmitCategory={handleSubmit}
        />
      )}
    </div>
  );
}
