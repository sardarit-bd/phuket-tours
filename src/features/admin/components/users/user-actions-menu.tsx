"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUserRecord } from "../../types/admin-users";

export interface UserActionsMenuProps {
  user: AdminUserRecord;
  currentUserId?: string | null;
  onViewDetails: (user: AdminUserRecord) => void;
  onEditUser: (user: AdminUserRecord) => void;
  onToggleStatus: (user: AdminUserRecord) => void;
}

const emptySubscribe = () => () => {};

export function UserActionsMenu({
  user,
  currentUserId,
  onViewDetails,
  onEditUser,
  onToggleStatus,
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isClient = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const isSelf = Boolean(currentUserId && user.id === currentUserId);
  const isDeactivated = user.status === "deactivated";

  const updatePosition = React.useCallback(() => {
    if (!buttonRef.current || typeof window === "undefined") return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 150;
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

  const handleStatusToggle = () => {
    if (isSelf && !isDeactivated) {
      // Disallow self-deactivation strictly in the action handler
      return;
    }
    handleAction(() => onToggleStatus(user));
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
      data-testid={`user-actions-menu-${user.id}`}
    >
      {/* 1. View Details */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(() => onViewDetails(user))}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
        data-testid={`action-view-user-${user.id}`}
      >
        <Eye className="h-4 w-4 text-[#74818A]" />
        <span>View Details</span>
      </button>

      {/* 2. Edit User */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(() => onEditUser(user))}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9] transition-colors cursor-pointer"
        data-testid={`action-edit-user-${user.id}`}
      >
        <Edit2 className="h-4 w-4 text-[#74818A]" />
        <span>Edit Account</span>
      </button>

      {/* Divider */}
      <div className="my-1 border-t border-[#E5EAED]" />

      {/* 3. Activate / Deactivate Account */}
      {isSelf && !isDeactivated ? (
        <div
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-amber-700 bg-amber-50 cursor-not-allowed select-none"
          title="You cannot deactivate your own administrative account"
          data-testid={`action-self-deactivate-blocked-${user.id}`}
        >
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Cannot self-deactivate</span>
        </div>
      ) : isDeactivated ? (
        <button
          type="button"
          role="menuitem"
          onClick={handleStatusToggle}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          data-testid={`action-activate-user-${user.id}`}
        >
          <UserCheck className="h-4 w-4 text-emerald-600" />
          <span>Activate Account</span>
        </button>
      ) : (
        <button
          type="button"
          role="menuitem"
          onClick={handleStatusToggle}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          data-testid={`action-deactivate-user-${user.id}`}
        >
          <UserX className="h-4 w-4 text-rose-600" />
          <span>Deactivate Account</span>
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
        aria-label={`Actions for ${user.name}`}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#74818A] transition-colors hover:border-[#E5EAED] hover:bg-[#F5F8F9] hover:text-[#18282A] focus:border-[#176779] focus:outline-none cursor-pointer",
          isOpen && "border-[#E5EAED] bg-[#F5F8F9] text-[#18282A]"
        )}
        data-testid={`user-actions-trigger-${user.id}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isClient && typeof document !== "undefined"
        ? createPortal(menuDropdown, document.body)
        : null}
    </div>
  );
}
