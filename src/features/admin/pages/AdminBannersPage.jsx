'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import {
  useAdminHero,
  useUpdateHeroContent,
  useAddHeroImage,
  useToggleImageStatus,
  useDeleteHeroImage,
  useUpdateHeroImage,
  useCropHeroImage,
  useReorderHeroImages,
} from '../hooks/useAdminBanners';
import { uploadBannerImageApi } from '../apis/adminBannerApi';
import { toast } from '../../../shared/utils/toast';
import AdminPageHeader from '../components/AdminPageHeader';
import ImageCropModal from '../../../shared/components/media/ImageCropModal';

export default function AdminBannersPage() {
  const { data, isLoading, isError, refetch } = useAdminHero();
  const updateContentMutation = useUpdateHeroContent();
  const addImageMutation = useAddHeroImage();
  const toggleImageMutation = useToggleImageStatus();
  const deleteImageMutation = useDeleteHeroImage();
  const updateImageMutation = useUpdateHeroImage();
  const cropImageMutation = useCropHeroImage();
  const reorderImagesMutation = useReorderHeroImages();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [cropEditor, setCropEditor] = useState(null);

  // Form nội dung text chung
  const [contentForm, setContentForm] = useState({
    subtitle: 'SEASON DROP 2026',
    title: 'GRITMODE SIGNATURE',
    description: 'Thời trang đường phố Việt Nam định hình phong cách độc bản, tự do và đậm chất bụi bặm.',
    marquee_text: '⚡ MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO MỌI ĐƠN HÀNG • 🔥 BỘ SƯU TẬP SIGNATURE STREETWEAR DROP 2026 • 🛡️ 100% PREMIUM HEAVYWEIGHT COTTON 280GSM • 🔄 ĐỔI TRẢ THOẢI MÁI TRONG VÒNG 7 NGÀY',
  });

  useEffect(() => {
    if (data?.settings) {
      setContentForm({
        subtitle: data.settings.subtitle || 'SEASON DROP 2026',
        title: data.settings.title || 'GRITMODE SIGNATURE',
        description: data.settings.description || '',
        marquee_text: data.settings.marquee_text || '',
      });
    }
  }, [data?.settings]);

  const slides = data?.slides || [];

  // Lưu nội dung Tiêu đề / Mô tả / Marquee
  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!contentForm.title.trim()) {
      toast.error('Tiêu đề chính không được để trống');
      return;
    }
    await updateContentMutation.mutateAsync(contentForm);
  };

  // Upload ảnh trực tiếp từ máy
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }
    event.target.value = '';
    setCropEditor({ source: file, mode: 'upload' });
  };

  const handleCropSave = async ({ file }) => {
    setIsUploading(true);
    try {
      const asset = await uploadBannerImageApi(file, 'banner');
      if (cropEditor.mode === 'edit') {
        await cropImageMutation.mutateAsync({
          id: cropEditor.slide.banner_id,
          file,
        });
      } else {
        await addImageMutation.mutateAsync({
          image_url: asset.url,
          media_asset_id: asset.media_asset_id,
          sort_order: slides.length,
        });
      }
      setCropEditor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu ảnh banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLegacyFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadBannerImageApi(file, 'banner');
      const uploadedUrl = res.url || res.url_product_image || res;
      if (uploadedUrl) {
        await addImageMutation.mutateAsync({
          image_url: uploadedUrl,
          sort_order: slides.length + 1,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Bật / tắt ảnh
  const handleToggleStatus = async (slide) => {
    await toggleImageMutation.mutateAsync({
      id: slide.banner_id,
      is_active: !slide.is_active,
    });
  };

  const handleMoveSlide = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    await reorderImagesMutation.mutateAsync(reordered.map((slide, order) => ({ banner_id: slide.banner_id, sort_order: order })));
  };

  // Xác nhận xóa ảnh
  const handleConfirmDelete = async () => {
    if (!deletingImage) return;
    await deleteImageMutation.mutateAsync(deletingImage.banner_id);
    setDeletingImage(null);
  };

  void handleLegacyFileUpload;
  const handleEditSlide = (slide) => setCropEditor({ mode: 'edit', slide, source: slide.cloudinary_source_url || slide.image_url });

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 font-sans font-[550]">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Quản lý banner trang chủ"
        description="Cập nhật nội dung hero, marquee và hình ảnh hiển thị trên storefront."
        actions={(
          <button
            type="button"
            onClick={() => refetch()}
            className="grid size-10 place-items-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            title="Làm mới dữ liệu"
            aria-label="Làm mới dữ liệu banner"
          >
            <Icon icon="solar:refresh-bold" className="w-4 h-4" />
          </button>
        )}
      />

      {isLoading ? (
        <div className="space-y-6">
          <LoadingSkeleton className="h-48 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
          <p className="font-sans text-sm font-[550]">Không thể kết nối đến server để tải cấu hình</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 cursor-pointer rounded-xl bg-red-600 px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-white hover:bg-red-700"
          >
            Thử Lại
          </button>
        </div>
      ) : (
        <>
          {/* 2. MỤC 1: CẤU HÌNH TIÊU ĐỀ, MÔ TẢ & TEXT MARQUEE */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <span className="font-sans text-[10px] font-[550] uppercase tracking-widest text-neutral-400">
                MỤC 1
              </span>
              <h2 className="font-sans text-base font-[550] uppercase tracking-wider text-black dark:text-white">
                Nội Dung Hero & Text Marquee
              </h2>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Tag Phụ
                  </label>
                  <input
                    type="text"
                    value={contentForm.subtitle}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="SEASON DROP 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-sans text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Tiêu Đề Chính <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contentForm.title}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="GRITMODE SIGNATURE"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 font-sans text-sm font-[550] text-black transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Mô Tả Chiến Dịch
                </label>
                <textarea
                  rows={2}
                  value={contentForm.description}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả phong cách thời trang đường phố..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-sans text-xs font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  <Icon icon="solar:ticker-star-bold" className="w-4 h-4 text-amber-500" />
                  <span>Dải Chữ Chạy (Text Marquee Ticker)</span>
                </label>
                <input
                  type="text"
                  value={contentForm.marquee_text}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, marquee_text: e.target.value }))}
                  placeholder="⚡ MIỄN PHÍ VẬN CHUYỂN • 🔥 BỘ SƯU TẬP SIGNATURE STREETWEAR"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 font-sans text-sm font-[550] text-black transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateContentMutation.isPending}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  {updateContentMutation.isPending ? (
                    <>
                      <Icon icon="solar:spinner-line-duotone" className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5" />
                      <span>Lưu nội dung</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 3. MỤC 2: QUẢN LÝ DANH SÁCH ẢNH NỀN HERO SLIDER */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                  <span className="font-sans text-[10px] font-[550] uppercase tracking-widest text-neutral-400">
                  MỤC 2
                </span>
                <h2 className="font-sans text-base font-[550] uppercase tracking-wider text-black dark:text-white">
                  Bộ Ảnh Nền Hero Slider
                </h2>
              </div>

              {/* Nút Upload ảnh - Kích thước bình thường, gọn gàng */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading || addImageMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  {isUploading ? (
                    <>
                      <Icon icon="solar:spinner-line-duotone" className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:upload-track-2-bold" className="w-3.5 h-3.5" />
                      <span>Tải ảnh lên</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Danh sách ảnh */}
            {slides.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/30">
                <Icon icon="solar:gallery-wide-bold-duotone" className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                  <h3 className="font-sans text-xs font-[550] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Chưa có ảnh slide nào trong hệ thống
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.banner_id}
                    className={`group relative rounded-xl overflow-hidden border transition-all duration-300 bg-black flex flex-col shadow-xs ${
                      slide.is_active
                        ? 'border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white'
                        : 'border-neutral-200/50 dark:border-neutral-800/40 opacity-60'
                    }`}
                  >
                    {/* Ảnh 16:9 */}
                    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden select-none">
                      <Image
                        src={slide.image_url}
                        alt={`Slide ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleEditSlide(slide)}
                        className="absolute bottom-2.5 right-2.5 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-black shadow-lg transition-transform hover:scale-105"
                        title="Chỉnh crop ảnh banner"
                        aria-label={`Chỉnh crop slide ${idx + 1}`}
                      >
                        <Icon icon="solar:pen-new-square-linear" className="w-4 h-4" />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Thứ tự & Trạng thái (góc trên bên trái) */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="rounded-md border border-white/20 bg-black/85 px-2 py-0.5 font-sans text-[10px] font-[550] uppercase tracking-wider text-white backdrop-blur-md">
                          #{idx + 1}
                        </span>
                        <span
                            className={`rounded-md px-2 py-0.5 font-sans text-[10px] font-[550] uppercase tracking-wider backdrop-blur-md ${
                            slide.is_active
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-neutral-800/90 text-neutral-400'
                          }`}
                        >
                          {slide.is_active ? 'Đang Chiếu' : 'Tạm Ẩn'}
                        </span>
                      </div>

                    </div>

                    {/* Controls Footer */}
                    <div className="p-3 bg-neutral-950 flex items-center justify-between border-t border-neutral-900">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={slide.is_active}
                          onClick={() => handleToggleStatus(slide)}
                          className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            slide.is_active ? 'bg-emerald-500 justify-end' : 'bg-neutral-700 justify-start'
                          }`}
                          title={slide.is_active ? 'Tạm ẩn' : 'Bật hiển thị'}
                        >
                          <span className="bg-white w-3.5 h-3.5 rounded-full shadow-sm" />
                        </button>
                        <span className="font-sans text-[11px] font-[550] text-neutral-400">
                          {slide.is_active ? 'Bật' : 'Tắt'}
                        </span>
                        <button
                          type="button"
                          disabled={idx === 0 || reorderImagesMutation.isPending}
                          onClick={() => handleMoveSlide(idx, -1)}
                          className="grid size-7 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                          title="Đưa lên trước"
                          aria-label="Đưa banner lên trước"
                        >
                          <Icon icon="solar:alt-arrow-left-linear" className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === slides.length - 1 || reorderImagesMutation.isPending}
                          onClick={() => handleMoveSlide(idx, 1)}
                          className="grid size-7 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                          title="Đưa xuống sau"
                          aria-label="Đưa banner xuống sau"
                        >
                          <Icon icon="solar:alt-arrow-right-linear" className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Nút Xóa có icon thùng rác và chữ Xóa ở footer */}
                      <button
                        type="button"
                        onClick={() => setDeletingImage(slide)}
                          className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 font-sans text-xs font-[550] text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Xóa ảnh"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL XÁC NHẬN XÓA ẢNH */}
      {cropEditor && (
        <ImageCropModal
          source={cropEditor.source}
          profile="banner"
          title="Crop ảnh banner"
          saveLabel="Lưu banner"
          cancelLabel="Huỷ"
          onCancel={() => setCropEditor(null)}
          onSave={handleCropSave}
        />
      )}

      {deletingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
              <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
            </div>
            <div>
            <h3 className="font-sans text-base font-[550] text-white">Xác nhận xóa ảnh slide?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Ảnh này sẽ bị xóa vĩnh viễn khỏi danh sách Hero Banner trang chủ.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingImage(null)}
              className="cursor-pointer rounded-xl px-3.5 py-1.5 font-sans text-xs font-[550] text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteImageMutation.isPending}
                onClick={handleConfirmDelete}
              className="cursor-pointer rounded-xl bg-red-600 px-4 py-1.5 font-sans text-xs font-[550] uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteImageMutation.isPending ? 'Đang Xóa...' : 'Xóa Ảnh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
