"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const SIZE_CLASSES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  showCloseButton = true,
}: DialogProps) {
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl bg-white shadow-2xl transition-all duration-200 border border-[#E5EAED] flex flex-col max-h-[90vh]",
          SIZE_CLASSES[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-[#E5EAED] px-6 py-4.5 shrink-0">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="font-outfit text-lg font-bold tracking-tight text-[#18282A]"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="mt-1 text-xs text-[#74818A]">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176779]"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Content body with custom scrolling */}
        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
      </div>
    </div>
  );
}
