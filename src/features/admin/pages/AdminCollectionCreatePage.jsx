'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { toast } from '../../../shared/utils/toast';
import { createCollectionApi, getAdminCollectionsApi, updateCollectionApi } from '../../collections/apis/collection.api';
import { uploadAdminProductImagesApi } from '../apis/admin.api';
import { broadcastQueryInvalidation } from '../../../shared/services/queryClient';
import { requireApiArray } from '../../../shared/services/responseContract';

const ImageCropModal = dynamic(() => import('../../../shared/components/media/ImageCropModal'), {
  ssr: false,
  loading: () => null,
});

export default function AdminCollectionCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialParentId = searchParams.get('parent_collection_id') || '';
  const editId = searchParams.get('edit_collection_id') || '';
  const isEditMode = Boolean(editId);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(initialParentId);
  const [image, setImage] = useState('');
  const [sourceImage, setSourceImage] = useState('');
  const [mediaAssetId, setMediaAssetId] = useState(null);
  const [cropEditor, setCropEditor] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);

  const { data: collections = [] } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const response = await getAdminCollectionsApi();
      return requireApiArray(response, 'Danh sách bộ sưu tập');
    },
  });

  const parentCollections = collections.filter(
    (collection) => !collection.parent_collection_id && String(collection.collection_id) !== String(editId),
  );

  useEffect(() => {
    if (!editId || !collections.length) return;
    const collection = collections.find((item) => String(item.collection_id) === editId);
    if (collection) {
      setName(collection.name_collection || '');
      setParentId(collection.parent_collection_id ? String(collection.parent_collection_id) : '');
      setImage(collection.image_collection || '');
      setSourceImage(collection.cloudinary_source_url || collection.image_collection || '');
      setMediaAssetId(collection.media_asset_id || null);
    }
  }, [collections, editId]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setCropEditor({ source: file });
  };

  const handleCropSave = async ({ file }) => {
    try {
      setIsUploading(true);
      const response = await uploadAdminProductImagesApi([file], 'collection');
      const uploaded = requireApiArray(response, 'Ảnh bộ sưu tập');
      const asset = uploaded[0];
      if (!asset?.url || !asset.media_asset_id) throw new Error('Upload không trả về asset hợp lệ');
      setImage(asset.url);
      setSourceImage(asset.cloudinary_source_url || asset.url);
      setMediaAssetId(asset.media_asset_id);
      setCropEditor(null);
      toast.success('Đã chuẩn hoá ảnh bộ sưu tập.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tải ảnh bộ sưu tập thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLegacyImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const response = await uploadAdminProductImagesApi([file], 'collection');
      const uploaded = requireApiArray(response, 'Ảnh bộ sưu tập');
      const uploadedImage = uploaded[0]?.url;
      if (!uploadedImage) throw new Error('Không nhận được URL ảnh');
      setImage(uploadedImage);
      toast.success('Đã tải ảnh bộ sưu tập.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tải ảnh bộ sưu tập thất bại.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  void handleLegacyImageUpload;

  const createMutation = useMutation({
    mutationFn: () => (isEditMode ? updateCollectionApi(editId, {
      name_collection: name.trim(),
      parent_collection_id: parentId ? Number(parentId) : null,
      image_collection: image || null,
      ...(mediaAssetId ? { media_asset_id: mediaAssetId } : {}),
    }) : createCollectionApi({
      name_collection: name.trim(),
      parent_collection_id: parentId ? Number(parentId) : null,
      image_collection: image || null,
      ...(mediaAssetId ? { media_asset_id: mediaAssetId } : {}),
    })),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-collections'] }),
        queryClient.invalidateQueries({ queryKey: ['collections-public-list'] }),
      ]);
      broadcastQueryInvalidation([
        ['admin-collections'],
        ['collections-public-list'],
        ['collection-detail'],
      ]);
      toast.success(isEditMode ? 'Đã cập nhật bộ sưu tập.' : 'Đã tạo nhóm bộ sưu tập.');
      router.push('/admin/collections');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Không thể tạo nhóm bộ sưu tập'),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhóm.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20 font-sans font-[550]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <Link
            href="/admin/collections"
            className="mb-2 inline-flex items-center gap-2 font-sans text-xs font-[550] uppercase tracking-wider text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
          >
            <Icon icon="solar:arrow-left-linear" />
            <span>Quay lại bộ sưu tập</span>
          </Link>
          <h1 className="font-sans text-2xl font-[550] uppercase tracking-tight text-black dark:text-white sm:text-3xl">
            {isEditMode ? 'Chỉnh sửa bộ sưu tập' : parentId ? 'Thêm bộ sưu tập con' : 'Thêm nhóm mới'}
          </h1>
        </div>

        <PrimaryButton
          onClick={handleSubmit}
          isLoading={createMutation.isPending}
          disabled={!name.trim()}
          icon="solar:check-circle-linear"
        >
          Lưu nhóm
        </PrimaryButton>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8 lg:col-span-8">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <span className="grid size-9 place-items-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
              <Icon icon="solar:widget-5-linear" />
            </span>
            <div>
              <p className="font-sans text-[10px] font-[550] uppercase tracking-widest text-neutral-400">Thông tin nhóm</p>
              <h2 className="font-sans text-lg font-[550] uppercase text-black dark:text-white">{parentId ? 'Thông tin bộ sưu tập con' : 'Tên nhóm bộ sưu tập'}</h2>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="collection-name" className="font-sans text-xs font-[550] uppercase tracking-wider text-neutral-500">
              {parentId ? 'Tên bộ sưu tập con' : 'Tên nhóm bộ sưu tập'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="collection-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={parentId ? "Ví dụ: Áo khoác dù, Quần cargo..." : "Ví dụ: Summer 2026, Limited Graphics..."}
              maxLength={255}
              autoFocus
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-sans text-sm font-[550] text-black transition-colors placeholder:text-neutral-400 focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="collection-parent" className="font-sans text-xs font-[550] uppercase tracking-wider text-neutral-500">
              Nhóm cha <span className="font-normal normal-case tracking-normal text-neutral-400">(không bắt buộc)</span>
            </label>
            <div className="relative">
              <button
                id="collection-parent"
                type="button"
                onClick={() => setParentDropdownOpen((value) => !value)}
                aria-expanded={parentDropdownOpen}
                aria-haspopup="listbox"
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left font-sans text-xs font-[550] text-black outline-none transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:border-neutral-600 dark:focus-visible:ring-white"
              >
                <span className={parentId ? 'text-black dark:text-white' : 'text-neutral-400'}>
                  {parentId
                    ? collections.find((collection) => String(collection.collection_id) === String(parentId))?.name_collection || `Nhóm #${parentId}`
                    : '-- Tạo nhóm cha mới --'}
                </span>
                <Icon icon={parentDropdownOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} className="text-neutral-400" />
              </button>

              {parentDropdownOpen && (
                <div role="listbox" className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => {
                      setParentId('');
                      setParentDropdownOpen(false);
                    }}
                    className={`flex w-full rounded-xl px-3 py-2.5 text-left font-sans text-xs font-[550] transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${!parentId ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-600 dark:text-neutral-300'}`}
                  >
                    Tạo nhóm cha mới
                  </button>
                  {parentCollections.map((parent) => {
                    const parentValue = String(parent.collection_id || parent.id);
                    const isSelected = parentValue === String(parentId);
                    return (
                      <button
                        key={parentValue}
                        type="button"
                        onClick={() => {
                          setParentId(parentValue);
                          setParentDropdownOpen(false);
                        }}
                        className={`flex w-full rounded-xl px-3 py-2.5 text-left font-sans text-xs font-[550] transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-600 dark:text-neutral-300'}`}
                      >
                        {parent.name_collection || parent.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </section>

        {parentId && (
          <aside className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8 lg:col-span-4">
            <div>
              <p className="font-sans text-[10px] font-[550] uppercase tracking-widest text-neutral-400">Hình ảnh đại diện</p>
              <h2 className="mt-1 font-sans text-lg font-[550] uppercase text-black dark:text-white">Ảnh bộ sưu tập con</h2>
            </div>
            <label className="relative aspect-[4/3] rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex items-center justify-center cursor-pointer hover:border-black dark:hover:border-white transition-colors">
              {image ? <>
                <img src={image} alt="Xem trước ảnh bộ sưu tập" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-black text-white shadow-lg hover:scale-105 transition-transform"
                  title="Chỉnh crop ảnh"
                  aria-label="Chỉnh crop ảnh bộ sưu tập"
                  onClick={(event) => { event.preventDefault(); event.stopPropagation(); setCropEditor({ source: sourceImage || image, mode: 'edit' }); }}
                >
                  <Icon icon="solar:pen-new-square-linear" className="text-sm" />
                </button>
              </> : <div className="space-y-2 text-center font-normal text-neutral-400"><Icon icon={isUploading ? 'svg-spinners:ring-resize' : 'solar:cloud-upload-linear'} className="mx-auto text-4xl" /><p className="text-xs">{isUploading ? 'Đang tải ảnh...' : 'Bấm để chọn ảnh'}</p></div>}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="sr-only" />
            </label>
          </aside>
        )}

      </form>

      {cropEditor && (
        <ImageCropModal
          source={cropEditor.source}
          profile="collection"
          title="Crop ảnh bộ sưu tập"
          saveLabel="Lưu ảnh"
          cancelLabel="Huỷ"
          onCancel={() => setCropEditor(null)}
          onSave={handleCropSave}
        />
      )}

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-md backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
        <Link href="/admin/collections" className="font-sans text-xs font-[550] text-neutral-500 hover:text-black dark:hover:text-white">
          Hủy bỏ
        </Link>
        <PrimaryButton
          onClick={handleSubmit}
          isLoading={createMutation.isPending}
          disabled={!name.trim()}
        >
          Lưu nhóm
        </PrimaryButton>
      </div>
    </div>
  );
}
