"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  UserCheck,
  Activity,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OperationalBookingRecord } from "../../types/admin-bookings";

export interface BookingActionsMenuProps {
  booking: OperationalBookingRecord;
  onViewDetails: (booking: OperationalBookingRecord) => void;
  onAssignStaff: (booking: OperationalBookingRecord) => void;
  onUpdateFulfillment: (booking: OperationalBookingRecord) => void;
  onReviewPriceApproval?: (booking: OperationalBookingRecord) => void;
}

const emptySubscribe = () => () => {};

export function BookingActionsMenu({
  booking,
  onViewDetails,
  onAssignStaff,
  onUpdateFulfillment,
  onReviewPriceApproval,
}: BookingActionsMenuProps) {
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
    const menuHeight = (booking.status as string) === "AWAITING_APPROVAL" ? 180 : 140;
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
  }, [booking.status]);

  React.useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    function handleScrollOrResize() {
      updatePosition();
    }

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  const menuDropdown = isOpen && isClient ? (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      style={{
        position: "fixed",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        width: "192px",
        zIndex: 9999,
      }}
      className={cn(
        "rounded-xl border border-[#E5EAED] bg-white p-1.5 shadow-xl transition-all duration-150 animate-in fade-in zoom-in-95"
      )}
      data-testid={`booking-actions-menu-${booking.id}`}
    >
      {/* 1. View Details */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(() => onViewDetails(booking))}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
        data-testid={`action-view-details-${booking.id}`}
      >
        <Eye className="h-4 w-4 text-[#74818A]" />
        <span>View Details</span>
      </button>

      {/* 2. Assign Staff */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(() => onAssignStaff(booking))}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
        data-testid={`action-assign-staff-${booking.id}`}
      >
        <UserCheck className="h-4 w-4 text-[#74818A]" />
        <span>Assign Staff</span>
      </button>

      {/* 3. Update Fulfillment */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(() => onUpdateFulfillment(booking))}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
        data-testid={`action-update-fulfillment-${booking.id}`}
      >
        <Activity className="h-4 w-4 text-[#74818A]" />
        <span>Update Fulfillment</span>
      </button>

      {/* 4. Price Approval (only if AWAITING_APPROVAL) */}
      {(booking.status as string) === "AWAITING_APPROVAL" && onReviewPriceApproval && (
        <button
          type="button"
          role="menuitem"
          onClick={() => handleAction(() => onReviewPriceApproval(booking))}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer border-t border-[#E5EAED] mt-1 pt-2"
          data-testid={`action-review-price-${booking.id}`}
        >
          <CheckCircle className="h-4 w-4 text-purple-600" />
          <span>Review Approval</span>
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Booking actions menu"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#74818A] transition-colors hover:border-[#E5EAED] hover:bg-[#F5F8F9] hover:text-[#18282A] focus:border-[#176779] focus:outline-none cursor-pointer",
          isOpen && "border-[#E5EAED] bg-[#F5F8F9] text-[#18282A]"
        )}
        data-testid={`booking-actions-trigger-${booking.id}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isClient && typeof document !== "undefined"
        ? createPortal(menuDropdown, document.body)
        : null}
    </div>
  );
}
