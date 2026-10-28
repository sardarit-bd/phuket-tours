"use client";

import * as React from "react";
import { X } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardNavConfig } from "../types/dashboard-nav";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardNavConfig;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  config,
}: MobileNavDrawerProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handle escape key and focus management
  React.useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    // Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount
    closeButtonRef.current?.focus();

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Dashboard Navigation"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-2xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 280px Slide-over drawer */}
      <div className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-[#FAFEFF] shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Floating Close button in drawer */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#74818A] hover:bg-black/5 hover:text-[#18282A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Sidebar content within drawer */}
        <DashboardSidebar
          config={config}
          onNavigate={onClose}
          className="w-full border-r-0"
        />
      </div>
    </div>
  );
}
