"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: string[];
  /** Index of the active image. When undefined the lightbox is closed. */
  activeIndex: number | undefined;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  title?: string;
}

/**
 * Fullscreen image preview / lightbox.
 *
 * - Opens when `activeIndex` is a number, closes when it becomes `undefined`.
 * - Keyboard: ArrowLeft / ArrowRight to navigate, Escape to close.
 * - Backdrop click closes; image click does NOT close.
 * - Prevents background scroll while open.
 * - Focus is moved to the dialog when opened and restored when closed.
 */
export function Lightbox({
  images,
  activeIndex,
  onIndexChange,
  onClose,
  title = "Photo",
}: LightboxProps) {
  const isOpen = activeIndex !== undefined;
  const current = activeIndex ?? 0;
  const total = images.length;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  const goPrev = React.useCallback(() => {
    if (total === 0) return;
    onIndexChange((current - 1 + total) % total);
  }, [current, total, onIndexChange]);

  const goNext = React.useCallback(() => {
    if (total === 0) return;
    onIndexChange((current + 1) % total);
  }, [current, total, onIndexChange]);

  // Save/restore focus + prevent body scroll
  React.useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  // Keyboard handling
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — image ${current + 1} of ${total}`}
      ref={dialogRef}
      tabIndex={-1}
    >
      {/* Backdrop — click to close */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Image container */}
      <div className="relative z-10 max-h-[90vh] max-w-[92vw] sm:max-w-[80vw]">
        <div className="relative flex items-center justify-center">
          <Image
            src={images[current]}
            alt={`${title} — image ${current + 1} of ${total}`}
            width={1200}
            height={800}
            className="max-h-[75vh] max-w-full object-contain rounded-xl"
            sizes="(max-width: 640px) 92vw, 80vw"
            priority
          />
        </div>
        {/* Counter */}
        <div className="mt-3 text-center text-xs font-semibold text-white/80">
          {current + 1} / {total}
        </div>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close photo preview"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 sm:left-6 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next */}
      {total > 1 && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 sm:right-6 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
