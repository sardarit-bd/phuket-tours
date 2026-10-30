"use client";

import * as React from "react";
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
}

export function TourActionsMenu({
  tour,
  onViewDetails,
  onEditTour,
  onStatusChange,
  isUpdatingStatus = false,
}: TourActionsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

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

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={isUpdatingStatus}
        onClick={() => setIsOpen(!isOpen)}
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

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          data-testid={`tour-actions-menu-${tour.id}`}
          className="absolute right-0 z-30 mt-1.5 w-48 origin-top-right rounded-xl border border-[#E5EAED] bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
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
        </div>
      )}
    </div>
  );
}
