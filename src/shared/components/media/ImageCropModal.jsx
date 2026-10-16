"use client";

import { createPortal } from "react-dom";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { getImageProfile } from "../../config/imageProfiles";
import {
  createCroppedImageBlob,
  createImageFile,
  createObjectUrl,
  getCroppedImageFileName,
  revokeObjectUrl,
} from "../../utils/imageCrop";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const BASE_CROP_WIDTH = 82;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toFinite = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizePercentCrop = (crop = {}) => {
  const width = clamp(toFinite(crop.width, 0), 1, 100);
  const height = clamp(toFinite(crop.height, 0), 1, 100);

  return {
    unit: "%",
    x: clamp(toFinite(crop.x), 0, 100 - width),
    y: clamp(toFinite(crop.y), 0, 100 - height),
    width,
    height,
  };
};

const cropToPixels = (crop, imageMeta) => {
  if (!crop || !imageMeta?.width || !imageMeta?.height) return null;

  const normalized = normalizePercentCrop(crop);
  const x = Math.round((normalized.x / 100) * imageMeta.width);
  const y = Math.round((normalized.y / 100) * imageMeta.height);
  const width = Math.round((normalized.width / 100) * imageMeta.width);
  const height = Math.round((normalized.height / 100) * imageMeta.height);

  return {
    x: clamp(x, 0, imageMeta.width - 1),
    y: clamp(y, 0, imageMeta.height - 1),
    width: clamp(width, 1, imageMeta.width - x),
    height: clamp(height, 1, imageMeta.height - y),
  };
};

const createZoomCrop = (imageMeta, aspect, zoom = 1) => {
  if (!imageMeta?.width || !imageMeta?.height || !aspect) return undefined;

  const width = Math.min(96, BASE_CROP_WIDTH / Math.max(toFinite(zoom, 1), 1));
  const crop = makeAspectCrop(
    { unit: "%", width },
    aspect,
    imageMeta.width,
    imageMeta.height,
  );

  return normalizePercentCrop(
    centerCrop(crop, imageMeta.width, imageMeta.height),
  );
};

const getPreviewImageStyle = (crop) => {
  if (!crop?.width || !crop?.height) return undefined;

  return {
    position: "absolute",
    top: `-${(crop.y / crop.height) * 100}%`,
    left: `-${(crop.x / crop.width) * 100}%`,
    width: `${10000 / crop.width}%`,
    maxWidth: "none",
    height: "auto",
  };
};

const getSourceInput = ({ source, image, file }) => source ?? image ?? file;

const ImageCropModal = ({
  open = true,
  source,
  image,
  file,
  profile = "product",
  title = "Chỉnh crop ảnh",
  saveLabel = "Lưu ảnh",
  cancelLabel = "Hủy",
  initialCrop,
  onCancel,
  onSave,
}) => {
  const dialogRef = useRef(null);
  const imageRef = useRef(null);
  const sourceInput = useMemo(
    () => getSourceInput({ source, image, file }),
    [file, image, source],
  );
  const profileConfig = getImageProfile(profile);
  const titleId = useId();

  const [sourceUrl, setSourceUrl] = useState("");
  const [imageMeta, setImageMeta] = useState(null);
  const [crop, setCrop] = useState();
  const [completedPercentCrop, setCompletedPercentCrop] = useState();
  const [zoom, setZoom] = useState(
    initialCrop?.zoom || profileConfig?.minZoom || 1,
  );
  const [imageError, setImageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) {
        event.preventDefault();
        onCancel?.();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)];
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousActiveElement?.focus?.();
    };
  }, [isSaving, onCancel, open]);

  useEffect(() => {
    if (!open) return undefined;

    setImageMeta(null);
    setCrop(undefined);
    setCompletedPercentCrop(undefined);
    setZoom(initialCrop?.zoom || profileConfig?.minZoom || 1);
    setImageError("");
    setSaveError("");

    if (!sourceInput) {
      setSourceUrl("");
      setImageError("Không có ảnh để chỉnh sửa.");
      return undefined;
    }

    let nextUrl = "";

    try {
      nextUrl = createObjectUrl(sourceInput);
      setSourceUrl(nextUrl);
    } catch (error) {
      setSourceUrl("");
      setImageError(
        error instanceof Error ? error.message : "Không thể đọc ảnh.",
      );
    }

    return () => {
      revokeObjectUrl(nextUrl);
    };
  }, [initialCrop?.zoom, open, profileConfig?.minZoom, sourceInput]);

  const handleImageLoad = useCallback(
    (event) => {
      const imageElement = event.currentTarget;
      const nextMeta = {
        width: imageElement.naturalWidth,
        height: imageElement.naturalHeight,
      };

      if (!nextMeta.width || !nextMeta.height) {
        setImageError("Không thể đọc kích thước ảnh.");
        return;
      }

      imageRef.current = imageElement;
      setImageMeta(nextMeta);

      const restoredCrop = initialCrop?.percentCrop;
      const nextCrop = restoredCrop
        ? normalizePercentCrop(restoredCrop)
        : createZoomCrop(nextMeta, profileConfig?.ratio, zoom);

      setCrop(nextCrop);
      setCompletedPercentCrop(nextCrop);
      setImageError("");
    },
    [initialCrop?.percentCrop, profileConfig?.ratio, zoom],
  );

  const handleCropChange = useCallback((_, percentCrop) => {
    const nextCrop = normalizePercentCrop(percentCrop);
    setCrop(nextCrop);
    setCompletedPercentCrop(nextCrop);
    setSaveError("");
  }, []);

  const handleCropComplete = useCallback((_, percentCrop) => {
    const nextCrop = normalizePercentCrop(percentCrop);
    setCompletedPercentCrop(nextCrop);
  }, []);

  const handleZoomChange = useCallback(
    (event) => {
      const nextZoom = clamp(
        toFinite(event.target.value, profileConfig?.minZoom || 1),
        profileConfig?.minZoom || 1,
        profileConfig?.maxZoom || 3.5,
      );

      setZoom(nextZoom);

      if (!imageMeta || !profileConfig?.ratio) return;

      const nextCrop = createZoomCrop(imageMeta, profileConfig.ratio, nextZoom);
      setCrop(nextCrop);
      setCompletedPercentCrop(nextCrop);
      setSaveError("");
    },
    [imageMeta, profileConfig],
  );

  const handleReset = useCallback(() => {
    const resetZoom = profileConfig?.minZoom || 1;
    setZoom(resetZoom);

    if (!imageMeta || !profileConfig?.ratio) return;

    const resetCrop = createZoomCrop(imageMeta, profileConfig.ratio, resetZoom);
    setCrop(resetCrop);
    setCompletedPercentCrop(resetCrop);
    setSaveError("");
  }, [imageMeta, profileConfig]);

  const handleZoomButton = useCallback(
    (delta) => {
      const currentZoom = toFinite(zoom, profileConfig?.minZoom || 1);
      const step = profileConfig?.zoomStep || 0.05;
      const nextZoom = clamp(
        Number((currentZoom + delta * step).toFixed(2)),
        profileConfig?.minZoom || 1,
        profileConfig?.maxZoom || 3.5,
      );

      setZoom(nextZoom);

      if (!imageMeta || !profileConfig?.ratio) return;

      const nextCrop = createZoomCrop(imageMeta, profileConfig.ratio, nextZoom);
      setCrop(nextCrop);
      setCompletedPercentCrop(nextCrop);
      setSaveError("");
    },
    [imageMeta, profileConfig, zoom],
  );

  const handleSave = useCallback(async () => {
    if (isSaving || !sourceUrl || !imageMeta || !profileConfig || !onSave)
      return;

    const nextCrop = completedPercentCrop || crop;
    const areaPixels = cropToPixels(nextCrop, imageMeta);

    if (!areaPixels?.width || !areaPixels?.height) {
      setSaveError("Crop chưa sẵn sàng. Vui lòng đợi ảnh tải xong.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const blob = await createCroppedImageBlob(
        sourceUrl,
        { areaPixels },
        profileConfig,
      );
      const fileName = getCroppedImageFileName(sourceInput, profileConfig.key);
      const croppedFile = createImageFile(blob, fileName);

      await onSave({
        file: croppedFile,
        blob,
        profile: profileConfig.key,
        profileConfig,
        areaPixels,
        crop: {
          zoom,
          offsetX: 0,
          offsetY: 0,
          percentCrop: nextCrop,
        },
      });
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Không thể lưu ảnh.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    completedPercentCrop,
    crop,
    imageMeta,
    isSaving,
    onSave,
    profileConfig,
    sourceInput,
    sourceUrl,
    zoom,
  ]);

  if (!open || typeof document === "undefined") return null;

  const activeCrop = completedPercentCrop || crop;
  const previewImageStyle = getPreviewImageStyle(activeCrop);
  const zoomMin = profileConfig?.minZoom || 1;
  const zoomMax = profileConfig?.maxZoom || 3.5;
  const zoomStep = profileConfig?.zoomStep || 0.05;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/70 p-3 font-sans font-[550] backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onCancel?.();
      }}
    >
      <div
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className="my-auto flex h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-md outline-none sm:h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-3rem)]"
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5 sm:px-8 sm:py-6">
          <div>
            <p className="font-sans text-[11px] font-[550] uppercase tracking-[0.2em] text-black/45">
              Media editor
            </p>
            <h2
              id={titleId}
              className="mt-1 font-sans text-2xl font-[550] uppercase tracking-[-0.02em] text-black sm:text-[2rem]"
            >
              {title}
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-xs font-normal leading-5 text-black/55 sm:text-sm">
              Kéo trong khung để di chuyển.
            </p>
          </div>
          <button
            aria-label="Đóng trình chỉnh sửa ảnh"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-black/15 font-sans text-lg font-normal text-black/60 transition hover:border-black hover:text-black disabled:opacity-40"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </header>

        <div
          data-lenis-prevent
          className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-7"
        >
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-sans text-sm font-[550] text-black">
                  Vùng cắt
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 font-sans text-[11px] font-[550] uppercase tracking-[0.12em] text-black/55">
                  {profileConfig?.widthRatio}:{profileConfig?.heightRatio}
                </span>
              </div>

              <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl bg-neutral-950 p-3 sm:min-h-[360px] sm:p-6">
                {sourceUrl && !imageError ? (
                  <ReactCrop
                    aspect={profileConfig?.ratio}
                    className="gritmode-crop"
                    crop={crop}
                    keepSelection
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    ruleOfThirds
                  >
                    <img
                      ref={imageRef}
                      alt="Ảnh đang chỉnh crop"
                      className="block max-w-full object-contain"
                      onError={() =>
                        setImageError("Không thể tải ảnh để chỉnh sửa.")
                      }
                      onLoad={handleImageLoad}
                      src={sourceUrl}
                      style={{ maxHeight: "min(58dvh, 680px)" }}
                    />
                  </ReactCrop>
                ) : (
                  <div className="flex min-h-[240px] items-center justify-center px-6 text-center text-sm text-white/70">
                    {imageError || "Đang tải ảnh…"}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 divide-x divide-black/10 border-y border-black/10">
                <div className="py-3 pr-4">
                  <span className="block font-sans text-[10px] font-[550] uppercase tracking-[0.12em] text-black/45">
                    Kích thước xuất
                  </span>
                  <span className="mt-1 block font-sans text-sm font-[550] text-black">
                    {profileConfig?.outputWidth} × {profileConfig?.outputHeight}
                    px
                  </span>
                </div>
                <div className="py-3 pl-4">
                  <span className="block font-sans text-[10px] font-[550] uppercase tracking-[0.12em] text-black/45">
                    Định dạng
                  </span>
                  <span className="mt-1 block font-sans text-sm font-[550] text-black">
                    Ảnh đã tối ưu
                  </span>
                </div>
              </div>
            </section>

            <aside className="min-w-0 space-y-4 lg:pr-1">
              <section className="rounded-2xl border border-black/10 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-sans text-sm font-[550] uppercase tracking-[0.14em] text-black">
                    Live preview
                  </h3>
                  <span className="font-sans text-xs font-normal text-black/45">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div
                  className="relative mx-auto aspect-[var(--crop-preview-ratio)] w-full max-w-[230px] overflow-hidden rounded-2xl border border-black/10 bg-[#f1f1f1]"
                  style={{ "--crop-preview-ratio": profileConfig?.aspectRatio }}
                >
                  {sourceUrl && previewImageStyle ? (
                    <img
                      alt="Xem trước ảnh sau khi crop"
                      src={sourceUrl}
                      style={previewImageStyle}
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center text-xs text-black/40">
                      Chưa có preview
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-black/10 pt-5">
                  <div className="flex items-center justify-between font-sans text-sm font-[550] uppercase tracking-[0.12em]">
                    <span>Zoom</span>
                    <span className="font-normal text-black/50">
                      {zoom.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    aria-label="Phóng to ảnh"
                    className="mt-4 w-full accent-black"
                    max={zoomMax}
                    min={zoomMin}
                    onChange={handleZoomChange}
                    step={zoomStep}
                    type="range"
                    value={zoom}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      aria-label="Giảm zoom"
                      className="h-10 w-10 rounded-xl border border-black/15 font-sans text-lg font-[550] transition hover:border-black disabled:opacity-40"
                      disabled={zoom <= zoomMin || isSaving}
                      onClick={() => handleZoomButton(-1)}
                      type="button"
                    >
                      −
                    </button>
                    <button
                      aria-label="Tăng zoom / Zoom in"
                      className="h-10 w-10 rounded-xl border border-black/15 font-sans text-lg font-[550] transition hover:border-black disabled:opacity-40"
                      disabled={zoom >= zoomMax || isSaving}
                      onClick={() => handleZoomButton(1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="flex-1 rounded-xl border border-black/15 px-3 font-sans text-xs font-[550] uppercase tracking-[0.12em] transition hover:border-black disabled:opacity-40"
                      aria-label="Đặt lại crop"
                      disabled={isSaving}
                      onClick={handleReset}
                      type="button"
                    >
                      Đặt lại
                    </button>
                  </div>
                </div>
              </section>

              <p className="font-sans text-xs font-normal leading-5 text-black/50">
                Vùng crop luôn khóa theo tỉ lệ của{" "}
                {profileConfig?.label?.toLowerCase() || "ảnh"} để ảnh hiển thị
                đồng nhất trên storefront.
              </p>
            </aside>
          </div>
        </div>

        <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-black/10 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          {saveError ? (
            <p className="mr-auto font-sans text-sm font-normal text-red-600">
              {saveError}
            </p>
          ) : null}
          <button
            aria-label="Hủy cancel"
            className="rounded-xl border border-black/15 px-5 py-3 font-sans text-sm font-[550] uppercase tracking-[0.12em] transition hover:border-black disabled:opacity-40"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            aria-label="Lưu ảnh / Save crop"
            className="rounded-xl bg-black px-6 py-3 font-sans text-sm font-[550] uppercase tracking-[0.12em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSaving || !activeCrop || !imageMeta}
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Đang lưu…" : saveLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

export default ImageCropModal;
