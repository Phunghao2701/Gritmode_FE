'use client';

import { createPortal } from 'react-dom';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import Icon from '../Icon';
import PrimaryButton from '../Button/PrimaryButton';
import { getImageProfile } from '../../config/imageProfiles';
import {
  clampCropOffset,
  createCroppedImageBlob,
  createImageFile,
  createObjectUrl,
  getCropAreaPixels,
  getCroppedImageFileName,
  getCropMetrics,
  normalizeCropState,
  revokeObjectUrl,
} from '../../utils/imageCrop';

const FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container) => (
  container ? [...container.querySelectorAll(FOCUSABLE_SELECTOR)] : []
);

const useElementSize = (elementRef) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);

  return size;
};

const toPreviewImageStyle = (imageMeta, viewportSize, crop) => {
  if (!imageMeta || viewportSize.width <= 0 || viewportSize.height <= 0) {
    return { opacity: 0 };
  }

  const metrics = getCropMetrics({
    ...crop,
    imageWidth: imageMeta.width,
    imageHeight: imageMeta.height,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  });

  return {
    position: 'absolute',
    left: `calc(50% + ${metrics.offsetX}px)`,
    top: `calc(50% + ${metrics.offsetY}px)`,
    width: `${metrics.renderedWidth}px`,
    height: `${metrics.renderedHeight}px`,
    maxWidth: 'none',
    transform: 'translate(-50%, -50%)',
    opacity: 1,
  };
};

export default function ImageCropModal({
  open = true,
  source,
  image,
  file,
  profile = 'product',
  initialCrop,
  isSaving = false,
  onCancel,
  onSave,
  title,
  saveLabel = 'Save crop',
  cancelLabel = 'Cancel',
}) {
  const profileConfig = useMemo(() => getImageProfile(profile), [profile]);
  const sourceInput = source ?? image ?? file;
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const viewportRef = useRef(null);
  const previewRef = useRef(null);
  const previousFocusRef = useRef(null);
  const sourceUrlRef = useRef('');
  const onCancelRef = useRef(onCancel);
  const onSaveRef = useRef(onSave);
  const isBusyRef = useRef(false);
  const minZoom = profileConfig?.minZoom || 1;
  const maxZoom = profileConfig?.maxZoom || 3.5;
  const zoomStep = profileConfig?.zoomStep || 0.05;
  const initialZoom = initialCrop?.zoom;
  const initialOffsetX = initialCrop?.offsetX;
  const initialOffsetY = initialCrop?.offsetY;
  const initialCropState = useMemo(
    () => normalizeCropState({
      zoom: initialZoom,
      offsetX: initialOffsetX,
      offsetY: initialOffsetY,
    }, { minZoom, maxZoom }),
    [initialOffsetX, initialOffsetY, initialZoom, maxZoom, minZoom],
  );
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageMeta, setImageMeta] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [crop, setCrop] = useState(initialCropState);
  const viewportSize = useElementSize(viewportRef);
  const previewSize = useElementSize(previewRef);

  const isBusy = isSaving || isExporting;

  useEffect(() => {
    isBusyRef.current = isBusy;
  }, [isBusy]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!isBusyRef.current) onCancelRef.current?.();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(dialogRef.current);
      if (!focusable.length) return;

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

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    setImageMeta(null);
    setImageError('');
    setSaveError('');
    setIsImageLoading(true);
    setCrop(initialCropState);

    let nextUrl = '';
    try {
      nextUrl = sourceInput ? createObjectUrl(sourceInput) : '';
      sourceUrlRef.current = nextUrl;
      setSourceUrl(nextUrl);
      if (!nextUrl) {
        setIsImageLoading(false);
        setImageError('Choose an image to start cropping.');
      }
    } catch (error) {
      setIsImageLoading(false);
      setImageError(error.message || 'The image preview could not be created.');
    }

    return () => {
      revokeObjectUrl(nextUrl);
      if (sourceUrlRef.current === nextUrl) sourceUrlRef.current = '';
    };
  }, [initialCropState, maxZoom, open, sourceInput]);

  useEffect(() => {
    if (!imageMeta || !viewportSize.width || !viewportSize.height) return;
    setCrop((previous) => ({
      ...previous,
      ...clampCropOffset({
        ...previous,
        imageWidth: imageMeta.width,
        imageHeight: imageMeta.height,
        viewportWidth: viewportSize.width,
        viewportHeight: viewportSize.height,
      }),
    }));
  }, [imageMeta, viewportSize.width, viewportSize.height]);

  const updateCrop = useCallback((updater) => {
    setCrop((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      const normalized = normalizeCropState(next, { minZoom, maxZoom });
      if (!imageMeta || !viewportSize.width || !viewportSize.height) return normalized;
      return {
        ...normalized,
        ...clampCropOffset({
          ...normalized,
          imageWidth: imageMeta.width,
          imageHeight: imageMeta.height,
          viewportWidth: viewportSize.width,
          viewportHeight: viewportSize.height,
        }),
      };
    });
    setSaveError('');
  }, [imageMeta, maxZoom, minZoom, viewportSize.height, viewportSize.width]);

  const updateZoom = (nextZoom) => {
    updateCrop((previous) => ({
      ...previous,
      zoom: nextZoom,
    }));
  };

  const nudgePan = (deltaX, deltaY) => {
    const step = Math.max(viewportSize.width * 0.05, 12);
    updateCrop((previous) => ({
      ...previous,
      offsetX: previous.offsetX + deltaX * step,
      offsetY: previous.offsetY + deltaY * step,
    }));
  };

  const resetCrop = () => updateCrop(initialCropState);

  const handlePointerDown = (event) => {
    if (isBusy || !imageMeta || event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: crop.offsetX,
      offsetY: crop.offsetY,
    });
  };

  const handlePointerMove = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    updateCrop({
      ...crop,
      offsetX: dragState.offsetX + event.clientX - dragState.startX,
      offsetY: dragState.offsetY + event.clientY - dragState.startY,
    });
  };

  const finishPointerDrag = (event) => {
    if (dragState?.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragState(null);
    setIsDragging(false);
  };

  const handleViewportKeyDown = (event) => {
    const panKeys = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (panKeys[event.key]) {
      event.preventDefault();
      nudgePan(...panKeys[event.key]);
      return;
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      updateZoom(crop.zoom + zoomStep);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      updateZoom(crop.zoom - zoomStep);
    } else if (event.key === '0') {
      event.preventDefault();
      resetCrop();
    }
  };

  const handleWheel = (event) => {
    if (isBusy) return;
    event.preventDefault();
    updateZoom(crop.zoom + (event.deltaY > 0 ? -zoomStep : zoomStep));
  };

  const handleImageLoad = (event) => {
    setImageMeta({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });
    setImageError('');
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setImageMeta(null);
    setIsImageLoading(false);
    setImageError('This image could not be loaded. Choose another file or try again.');
  };

  const handleSave = async () => {
    if (!profileConfig || !sourceUrl || !imageMeta || !onSaveRef.current || isBusy) return;
    setIsExporting(true);
    setSaveError('');

    try {
      const cropForExport = {
        ...crop,
        imageWidth: imageMeta.width,
        imageHeight: imageMeta.height,
        viewportWidth: viewportSize.width,
        viewportHeight: viewportSize.height,
      };
      const areaPixels = getCropAreaPixels(cropForExport);
      const blob = await createCroppedImageBlob(sourceUrl, cropForExport, profileConfig);
      const file = createImageFile(blob, getCroppedImageFileName(sourceInput, profileConfig));
      await onSaveRef.current({
        file,
        blob,
        profile: profileConfig.key,
        profileConfig,
        areaPixels,
        crop: {
          zoom: crop.zoom,
          offsetX: crop.offsetX,
          offsetY: crop.offsetY,
        },
      });
    } catch (error) {
      setSaveError(error.message || 'The crop could not be saved. Try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  if (!profileConfig) {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
        <div role="alert" className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-black shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
          Unknown image crop profile.
        </div>
      </div>,
      document.body,
    );
  }

  const dialogTitle = title || `Crop ${profileConfig.label.toLowerCase()}`;
  const imageStyle = toPreviewImageStyle(imageMeta, viewportSize, crop);
  const previewImageStyle = toPreviewImageStyle(imageMeta, previewSize, crop);

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onCancelRef.current?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isBusy}
        data-lenis-prevent
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-y-auto overscroll-contain rounded-[28px] border border-neutral-200 bg-white text-black shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-white sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 sm:px-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Media editor</p>
            <h2 id={titleId} className="mt-1 font-display text-lg font-black uppercase tracking-tight sm:text-xl">
              {dialogTitle}
            </h2>
            <p id={descriptionId} className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Drag to reposition, use the controls to zoom, then save the {profileConfig.widthRatio}:{profileConfig.heightRatio} crop.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={cancelLabel}
            onClick={() => !isBusy && onCancelRef.current?.()}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-900 dark:hover:text-white dark:focus-visible:ring-white"
            disabled={isBusy}
          >
            <Icon icon="solar:close-circle-linear" aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_250px]">
          <section className="min-w-0">
            <div
              ref={viewportRef}
              role="group"
              tabIndex={0}
              aria-label="Crop area. Use arrow keys to move the image, plus and minus to zoom, or press 0 to reset."
              className={`relative mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border-2 border-black bg-neutral-950 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:border-white dark:focus-visible:ring-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ aspectRatio: profileConfig.aspectRatio, touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerDrag}
              onPointerCancel={finishPointerDrag}
              onKeyDown={handleViewportKeyDown}
              onWheel={handleWheel}
            >
              {sourceUrl && (
                <img
                  src={sourceUrl}
                  alt={`${profileConfig.label} crop preview`}
                  crossOrigin="anonymous"
                  draggable="false"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className="select-none object-cover"
                  style={imageStyle}
                />
              )}
              <div className="pointer-events-none absolute inset-0 border border-white/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]" aria-hidden="true" />
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold uppercase tracking-widest text-white" role="status">
                  Loading image…
                </div>
              )}
              {imageError && !isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs font-medium text-white" role="alert">
                  {imageError}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <span>Drag to reposition · wheel to zoom</span>
              <span>{profileConfig.widthRatio}:{profileConfig.heightRatio} · {profileConfig.outputWidth}×{profileConfig.outputHeight}</span>
            </div>
          </section>

          <aside className="space-y-5 lg:border-l lg:border-neutral-100 lg:pl-6 lg:dark:border-neutral-800">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-xs font-black uppercase tracking-widest">Live preview</h3>
                <span className="text-[10px] font-bold text-neutral-400">{Math.round(crop.zoom * 100)}%</span>
              </div>
              <div
                ref={previewRef}
                className="relative mx-auto w-full max-w-[170px] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                style={{ aspectRatio: profileConfig.aspectRatio }}
              >
                {sourceUrl && (
                  <img
                    src={sourceUrl}
                    alt=""
                    aria-hidden="true"
                    crossOrigin="anonymous"
                    draggable="false"
                    className="select-none object-cover"
                    style={previewImageStyle}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 border border-black/20 dark:border-white/20" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
              <label htmlFor={`${titleId}-zoom`} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <span>Zoom</span>
                <span>{Math.round(crop.zoom * 100)}%</span>
              </label>
              <input
                id={`${titleId}-zoom`}
                type="range"
                min={minZoom}
                max={maxZoom}
                step={zoomStep}
                value={crop.zoom}
                onChange={(event) => updateZoom(Number(event.target.value))}
                disabled={!imageMeta || isBusy}
                aria-label="Zoom crop image"
                className="h-2 w-full cursor-pointer accent-black disabled:cursor-not-allowed disabled:opacity-40 dark:accent-white"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => updateZoom(crop.zoom - zoomStep)}
                  disabled={!imageMeta || isBusy || crop.zoom <= minZoom}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-lg transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:minus-circle-linear" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => updateZoom(crop.zoom + zoomStep)}
                  disabled={!imageMeta || isBusy || crop.zoom >= maxZoom}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-lg transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:add-circle-linear" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Reset crop"
                  onClick={resetCrop}
                  disabled={!imageMeta || isBusy}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-[10px] font-black uppercase tracking-wider transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:restart-linear" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Move image</h3>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Move image controls">
                <span aria-hidden="true" />
                <button
                  type="button"
                  aria-label="Move image up"
                  onClick={() => nudgePan(0, -1)}
                  disabled={!imageMeta || isBusy}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 text-lg transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:alt-arrow-up-linear" aria-hidden="true" />
                </button>
                <span aria-hidden="true" />
                <button
                  type="button"
                  aria-label="Move image left"
                  onClick={() => nudgePan(-1, 0)}
                  disabled={!imageMeta || isBusy}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 text-lg transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:alt-arrow-left-linear" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Move image down"
                  onClick={() => nudgePan(0, 1)}
                  disabled={!imageMeta || isBusy}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 text-lg transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Move image right"
                  onClick={() => nudgePan(1, 0)}
                  disabled={!imageMeta || isBusy}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 text-lg transition-colors hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-35 dark:border-neutral-700 dark:hover:border-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:alt-arrow-right-linear" aria-hidden="true" />
                </button>
              </div>
            </div>
          </aside>
        </div>

        {(saveError || imageError) && !isImageLoading && (
          <p className="mx-5 mb-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 sm:mx-7" role="alert">
            {saveError || imageError}
          </p>
        )}

        <footer className="flex flex-col-reverse gap-3 border-t border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => !isBusy && onCancelRef.current?.()}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-700 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
          >
            {cancelLabel}
          </button>
          <PrimaryButton
            type="button"
            onClick={handleSave}
            disabled={!imageMeta || !viewportSize.width || !viewportSize.height || Boolean(imageError) || isBusy}
            isLoading={isExporting || isSaving}
            icon="solar:check-circle-linear"
            className="min-h-11 rounded-xl px-5"
          >
            {saveLabel}
          </PrimaryButton>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
