"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPaymentRecord } from "../../types/admin-payments";

export interface PaymentActionsMenuProps {
  payment: AdminPaymentRecord;
  onViewDetails: (payment: AdminPaymentRecord) => void;
  onVerifyPayment?: (payment: AdminPaymentRecord) => void;
  onRecordPayment?: (payment: AdminPaymentRecord) => void;
  canVerify?: boolean;
  canRecord?: boolean;
}

const emptySubscribe = () => () => {};

export function PaymentActionsMenu({
  payment,
  onViewDetails,
  onVerifyPayment,
  onRecordPayment,
  canVerify = false,
  canRecord = false,
}: PaymentActionsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isClient = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const isEligibleForVerify = payment.status === "SUBMITTED" && canVerify && !!onVerifyPayment;
  const isEligibleForRecord = payment.status === "INITIATED" && canRecord && !!onRecordPayment;

  const updatePosition = React.useCallback(() => {
    if (!buttonRef.current || typeof window === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    const actionCount = 1 + (isEligibleForVerify ? 1 : 0) + (isEligibleForRecord ? 1 : 0);
    const menuHeight = actionCount * 40 + 16;
    const menuWidth = 180;

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
  }, [isEligibleForVerify, isEligibleForRecord]);

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
        width: "180px",
        zIndex: 9999,
      }}
      className={cn(
        "rounded-xl border border-[#E5EAED] bg-white p-1.5 shadow-xl transition-all duration-150 animate-in fade-in zoom-in-95"
      )}
      data-testid={`payment-actions-menu-${payment.id}`}
    >
      {/* 1. View Details */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(() => onViewDetails(payment))}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F8FAFB] transition-colors cursor-pointer text-left"
        data-testid="action-view-payment-details"
      >
        <Eye className="h-3.5 w-3.5 text-[#176779]" aria-hidden="true" />
        <span>View Details</span>
      </button>

      {/* 2. Verify Payment (SUBMITTED only) */}
      {isEligibleForVerify && (
        <button
          type="button"
          role="menuitem"
          onClick={() => handleAction(() => onVerifyPayment!(payment))}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
          data-testid="action-verify-payment"
        >
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          <span>Verify / Review</span>
        </button>
      )}

      {/* 3. Record Payment (INITIATED only) */}
      {isEligibleForRecord && (
        <button
          type="button"
          role="menuitem"
          onClick={() => handleAction(() => onRecordPayment!(payment))}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer text-left"
          data-testid="action-record-payment"
        >
          <PlusCircle className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
          <span>Record Receipt</span>
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
        aria-label={`Actions for payment ${payment.id}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#74818A] hover:bg-[#F0F4F6] hover:text-[#18282A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176779] cursor-pointer"
        data-testid={`payment-action-trigger-${payment.id}`}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Portal rendered to body so it floats outside any table overflow clipping */}
      {typeof document !== "undefined" && menuDropdown && createPortal(menuDropdown, document.body)}
    </div>
  );
}
