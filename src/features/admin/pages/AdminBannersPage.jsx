'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import {
  useAdminHero,
  useUpdateHeroContent,
  useAddHeroImage,
  useToggleImageStatus,
  useDeleteHeroImage,
} from '../hooks/useAdminBanners';
import { uploadBannerImageApi } from '../apis/adminBannerApi';
import { toast } from '../../../shared/utils/toast';

export default function AdminBannersPage() {
  const { data, isLoading, isError, refetch } = useAdminHero();
  const updateContentMutation = useUpdateHeroContent();
  const addImageMutation = useAddHeroImage();
  const toggleImageMutation = useToggleImageStatus();
  const deleteImageMutation = useDeleteHeroImage();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);

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
  const handleFileUpload = async (event) => {
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
      const res = await uploadBannerImageApi(file);
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

  // Xác nhận xóa ảnh
  const handleConfirmDelete = async () => {
    if (!deletingImage) return;
    await deleteImageMutation.mutateAsync(deletingImage.banner_id);
    setDeletingImage(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
            STOREFRONT HERO
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-black dark:text-white mt-1">
            Quản Lý Banner Trang Chủ
          </h1>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer self-start sm:self-auto"
          title="Làm mới dữ liệu"
        >
          <Icon icon="solar:refresh-bold" className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <LoadingSkeleton className="h-48 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
          <p className="font-semibold text-sm">Không thể kết nối đến server để tải cấu hình</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer"
          >
            Thử Lại
          </button>
        </div>
      ) : (
        <>
          {/* 2. MỤC 1: CẤU HÌNH TIÊU ĐỀ, MÔ TẢ & TEXT MARQUEE */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                MỤC 1
              </span>
              <h2 className="text-base font-bold text-black dark:text-white uppercase tracking-wider">
                Nội Dung Hero & Text Marquee
              </h2>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Tiêu Đề Chính <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contentForm.title}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="GRITMODE SIGNATURE"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black text-sm text-black dark:text-white font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                  <Icon icon="solar:ticker-star-bold" className="w-4 h-4 text-amber-500" />
                  <span>Dải Chữ Chạy (Text Marquee Ticker)</span>
                </label>
                <input
                  type="text"
                  value={contentForm.marquee_text}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, marquee_text: e.target.value }))}
                  placeholder="⚡ MIỄN PHÍ VẬN CHUYỂN • 🔥 BỘ SƯU TẬP SIGNATURE STREETWEAR"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black text-sm font-mono text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateContentMutation.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  MỤC 2
                </span>
                <h2 className="text-base font-bold text-black dark:text-white uppercase tracking-wider">
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
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
                <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Thứ tự & Trạng thái (góc trên bên trái) */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/85 backdrop-blur-md text-white border border-white/20">
                          #{idx + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
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
                        <span className="text-[11px] font-medium text-neutral-400">
                          {slide.is_active ? 'Bật' : 'Tắt'}
                        </span>
                      </div>

                      {/* Nút Xóa có icon thùng rác và chữ Xóa ở footer */}
                      <button
                        type="button"
                        onClick={() => setDeletingImage(slide)}
                        className="px-2.5 py-1 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
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
      {deletingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
              <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xác nhận xóa ảnh slide?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Ảnh này sẽ bị xóa vĩnh viễn khỏi danh sách Hero Banner trang chủ.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingImage(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteImageMutation.isPending}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50"
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
