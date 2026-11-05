"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  EyeOff,
  FileEdit,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminServiceRecord, AdminServiceStatus } from "../../types/admin";

export interface TourActionsMenuProps {
  tour: AdminServiceRecord;
  onViewDetails: (tour: AdminServiceRecord) => void;
  onEditTour: (tour: AdminServiceRecord) => void;
  onStatusChange: (tour: AdminServiceRecord, nextStatus: AdminServiceStatus) => void;
  isUpdatingStatus?: boolean;
  canEdit?: boolean;
}

const emptySubscribe = () => () => {};

export function TourActionsMenu({
  tour,
  onViewDetails,
  onEditTour,
  onStatusChange,
  isUpdatingStatus = false,
  canEdit = true,
}: TourActionsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isClient = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const updatePosition = React.useCallback(() => {
    if (!buttonRef.current || typeof window === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 180;
    const menuWidth = 192; // 12rem = 192px

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

    const top = openUpwards
      ? Math.max(8, rect.top - menuHeight - 4)
      : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 4);

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
    );

    setMenuPosition({ top, left });
  }, []);

  // Update position on open & close on scroll/resize
  React.useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleWindowChange = () => {
      setIsOpen(false);
    };

    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);

    return () => {
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [isOpen, updatePosition]);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const toggleOpen = () => {
    if (isUpdatingStatus) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        disabled={isUpdatingStatus}
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={isOpen}
        data-testid={`tour-actions-trigger-${tour.id}`}
        aria-label={`Actions for ${tour.name}`}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAED] bg-white text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176779] cursor-pointer",
          isUpdatingStatus && "opacity-50 cursor-not-allowed"
        )}
      >
        {isUpdatingStatus ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#176779]" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {isOpen &&
        isClient &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            data-testid={`tour-actions-menu-${tour.id}`}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 9999,
            }}
            className="w-48 rounded-xl border border-[#E5EAED] bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
          >
            {/* View Details */}
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(() => onViewDetails(tour))}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer text-left"
            >
              <Eye className="h-4 w-4 text-[#74818A]" />
              <span>View Details</span>
            </button>

            {canEdit && (
              <>
                {/* Edit Tour */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleAction(() => onEditTour(tour))}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer text-left"
                >
                  <Edit className="h-4 w-4 text-[#74818A]" />
                  <span>Edit Tour</span>
                </button>

                <div className="my-1 border-t border-[#E5EAED]" />

                {/* Contextual Status Transitions */}
                {tour.status !== "PUBLISHED" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleAction(() => onStatusChange(tour, "PUBLISHED"))}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Publish Tour</span>
                  </button>
                )}

                {tour.status !== "DRAFT" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleAction(() => onStatusChange(tour, "DRAFT"))}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer text-left"
                  >
                    <FileEdit className="h-4 w-4 text-amber-600" />
                    <span>Move to Draft</span>
                  </button>
                )}

                {tour.status !== "UNPUBLISHED" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleAction(() => onStatusChange(tour, "UNPUBLISHED"))}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <EyeOff className="h-4 w-4 text-slate-500" />
                    <span>Unpublish Tour</span>
                  </button>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
