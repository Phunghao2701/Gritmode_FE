'use client';

import { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';

export default function QuickCollectionFormModal({
  parentCollections = [],
  isSaving = false,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(() => String(parentCollections[0]?.collection_id || parentCollections[0]?.id || ''));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name_collection: name.trim(),
      parent_collection_id: parentId ? Number(parentId) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-collection-title"
        className="w-full max-w-md space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tạo ngay trên trang sản phẩm</p>
            <h2 id="quick-collection-title" className="mt-1 font-display text-lg font-black uppercase tracking-tight text-black dark:text-white">
              Thêm bộ sưu tập
            </h2>
          </div>
          <button
            type="button"
            aria-label="Đóng cửa sổ tạo bộ sưu tập"
            onClick={onClose}
            className="rounded-lg p-1 text-xl text-neutral-400 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:hover:text-white dark:focus-visible:ring-white"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            name="quick_collection_name"
            label="Tên bộ sưu tập"
            placeholder="Ví dụ: Graphic Drop 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
          />

          <div className="space-y-2">
            <label htmlFor="quick_collection_parent" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              Nhóm cha <span className="font-normal normal-case tracking-normal text-neutral-400">(không bắt buộc)</span>
            </label>
            <select
              id="quick_collection_parent"
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-white dark:focus-visible:ring-white"
            >
              <option value="">Tạo nhóm cha mới</option>
              {parentCollections.map((parent) => (
                <option key={parent.collection_id || parent.id} value={parent.collection_id || parent.id}>
                  {parent.name_collection || parent.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400">
              {parentId
                ? 'Bộ sưu tập mới sẽ được chọn sẵn cho sản phẩm này.'
                : 'Nhóm cha chỉ dùng để tổ chức bộ sưu tập; hãy tạo bộ sưu tập con để gắn sản phẩm.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
            >
              Hủy
            </button>
            <PrimaryButton type="submit" size="sm" isLoading={isSaving} disabled={!name.trim() || isSaving}>
              {parentId ? 'Tạo & chọn' : 'Tạo nhóm'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
