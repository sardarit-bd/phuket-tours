"use client";

import * as React from "react";
import {
  Shield,
  Search,
  CheckCheck,
  RotateCcw,
  AlertTriangle,
  Loader2,
  LayoutDashboard,
  Compass,
  ClipboardList,
  Users,
  CreditCard,
  Image as ImageIcon,
  BarChart3,
  Check,
  X,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  useGetAdminPermissionsQuery,
  useGetStaffPermissionsQuery,
  useUpdateStaffPermissionsMutation,
} from "../../api/admin-api";
import type { AdminUserRecord } from "../../types/admin-users";
import type { PermissionDefinition, PermissionModuleGroup } from "../../types/admin-permissions";

export interface ManagePermissionsDialogProps {
  staff: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const MODULE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  dashboard: { label: "Dashboard Overview", icon: LayoutDashboard },
  tours: { label: "Tours & Inventory", icon: Compass },
  bookings: { label: "Bookings & Operations", icon: ClipboardList },
  users: { label: "Users & Staff Management", icon: Users },
  payments: { label: "Payments & Accounting", icon: CreditCard },
  media: { label: "Media Library", icon: ImageIcon },
  reports: { label: "Reports & Analytics", icon: BarChart3 },
};

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export function ManagePermissionsDialog({
  staff,
  isOpen,
  onClose,
  onSuccess,
}: ManagePermissionsDialogProps) {
  const staffId = staff?.id ?? "";

  // 1. Fetch available permissions catalog
  const {
    data: catalogData,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useGetAdminPermissionsQuery(undefined, { skip: !isOpen });

  // 2. Fetch current staff permissions
  const {
    data: staffPermissionsData,
    isLoading: isStaffPermLoading,
    isError: isStaffPermError,
    refetch: refetchStaffPerm,
  } = useGetStaffPermissionsQuery(staffId, {
    skip: !isOpen || !staffId || staff?.role !== "staff",
  });

  // 3. Update mutation
  const [updatePermissions, { isLoading: isSaving }] =
    useUpdateStaffPermissionsMutation();

  // 4. Confirmation flow for unsaved changes (in-app, replacing window.confirm)
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);

  // Derive server-persisted permissions directly without cascading effects
  const savedPermissions = React.useMemo(() => {
    return new Set(staffPermissionsData?.data?.permissions || []);
  }, [staffPermissionsData?.data?.permissions]);

  // Track user modifications (null indicates clean state matching server)
  const [overridePermissions, setOverridePermissions] =
    React.useState<Set<string> | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const selectedPermissions = overridePermissions ?? savedPermissions;

  // dashboard.view is no longer a mandatory portal-entry permission. Staff
  // portal entry now requires at least one valid module-view permission. Show
  // a helpful reminder only when the admin has selected permissions but none
  // of the module-view permissions that grant a Staff module.
  const MODULE_VIEW_PERMISSION_IDS = [
    "tours.view",
    "media.view",
    "bookings.view",
    "payments.view",
    "users.view",
    "reports.view",
    "settings.view",
    "settings.general.manage",
    "settings.payment.manage",
    "settings.webhook.manage",
    "settings.cloudinary.manage",
    "settings.smtp.manage",
    "settings.audit.view",
  ] as const;

  const hasAnyModuleViewSelected = MODULE_VIEW_PERMISSION_IDS.some((id) =>
    selectedPermissions.has(id)
  );
  const isMissingModuleView =
    selectedPermissions.size > 0 && !hasAnyModuleViewSelected;

  const hasUnsavedChanges = React.useMemo(() => {
    if (overridePermissions === null) return false;
    return !setsEqual(overridePermissions, savedPermissions);
  }, [overridePermissions, savedPermissions]);

  const allCatalogPermissions = React.useMemo<PermissionDefinition[]>(() => {
    if (!catalogData?.data?.modules) return [];
    return catalogData.data.modules.flatMap((m) => m.permissions);
  }, [catalogData]);

  // Filter modules and permissions based on search query
  const filteredModules = React.useMemo<PermissionModuleGroup[]>(() => {
    if (!catalogData?.data?.modules) return [];
    if (!searchQuery.trim()) return catalogData.data.modules;

    const query = searchQuery.toLowerCase().trim();
    return catalogData.data.modules
      .map((mod) => {
        const matching = mod.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
        return {
          module: mod.module,
          permissions: matching,
        };
      })
      .filter((mod) => mod.permissions.length > 0);
  }, [catalogData, searchQuery]);

  const togglePermission = (id: string) => {
    const next = new Set(selectedPermissions);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setOverridePermissions(next);
  };

  const selectAll = () => {
    const allIds = allCatalogPermissions.map((p) => p.id);
    setOverridePermissions(new Set(allIds));
  };

  const deselectAll = () => {
    setOverridePermissions(new Set());
  };

  const selectModule = (modulePermissions: PermissionDefinition[]) => {
    const next = new Set(selectedPermissions);
    modulePermissions.forEach((p) => next.add(p.id));
    setOverridePermissions(next);
  };

  const deselectModule = (modulePermissions: PermissionDefinition[]) => {
    const next = new Set(selectedPermissions);
    modulePermissions.forEach((p) => next.delete(p.id));
    setOverridePermissions(next);
  };

  const handleClose = () => {
    setOverridePermissions(null);
    setSearchQuery("");
    setErrorMessage(null);
    setShowDiscardConfirm(false);
    onClose();
  };

  // When closing with unsaved changes, surface an in-app confirmation first.
  // The close-button (X) and Escape key both funnel through here.
  const handleRequestClose = () => {
    if (hasUnsavedChanges && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    handleClose();
  };

  const handleDiscard = () => {
    handleClose();
  };

  const handleSave = async () => {
    if (!staffId) return;
    setErrorMessage(null);

    try {
      await updatePermissions({
        staffId,
        permissions: Array.from(selectedPermissions),
      }).unwrap();

      setOverridePermissions(null);

      if (onSuccess) {
        onSuccess(`Permissions for ${staff?.name} updated successfully.`);
      }
      handleClose();
    } catch (err: unknown) {
      const apiError = err as
        | { data?: { message?: string }; message?: string }
        | undefined;
      const msg =
        apiError?.data?.message ||
        apiError?.message ||
        "Failed to update permissions. Please try again.";
      setErrorMessage(msg);
    }
  };

  const isLoading = isCatalogLoading || isStaffPermLoading;
  const isError = isCatalogError || isStaffPermError;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleRequestClose}
      size="xl"
      noBodyWrapper
      className="max-h-[90vh] flex flex-col p-0 overflow-hidden"
    >
      <div data-testid="manage-permissions-dialog" className="flex flex-col h-full overflow-hidden">
      {/* 1. Header */}
      <div className="border-b border-[#E5EAED] bg-gradient-to-r from-[#FAFEFF] via-[#F4FBFC] to-[#EEF8FA] px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#176779] to-[#0D3B45] text-white shadow-md shadow-[#176779]/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-outfit text-lg font-bold text-[#18282A]">
                  Manage Staff Permissions
                </h2>
                <Badge
                  variant="outline"
                  className="bg-[#176779]/10 text-[#176779] border-[#176779]/30 text-[11px] font-semibold uppercase tracking-wider"
                >
                  Staff Role
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-[#74818A]">
                Configure fine-grained access rights for{" "}
                <strong className="text-[#18282A]">{staff?.name}</strong> (
                {staff?.email})
              </p>
            </div>
          </div>
        </div>

        {/* Search & Convenience Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#74818A]" />
            <input
              type="text"
              data-testid="permissions-search-input"
              placeholder="Search permissions by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-[#D5DFE3] bg-white text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:outline-none focus:ring-1 focus:ring-[#176779]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="select-all-btn"
              onClick={selectAll}
              disabled={isLoading || isSaving}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#176779] hover:bg-[#176779]/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Select All</span>
            </button>
            <span className="text-[#D5DFE3]">|</span>
            <button
              type="button"
              data-testid="deselect-all-btn"
              onClick={deselectAll}
              disabled={isLoading || isSaving}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#74818A] hover:bg-[#EEF4F6] rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Deselect All</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Error Banner */}
      {errorMessage && (
        <div data-testid="permissions-error-banner" className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2b. Reminder: at least one module-view permission grants Staff portal entry */}
      {isMissingModuleView && (
        <div
          data-testid="module-view-reminder"
          role="alert"
          className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-900">
              No Module Access Yet
            </p>
            <p className="text-amber-800 leading-relaxed">
              Select at least one module view permission (for example
              Tours, Media, Bookings, Payments, Users, Reports or Settings)
              so this staff member can enter the Staff Portal.
              Action-only permissions such as tours.create or media.upload do
              not grant module access on their own.
            </p>
          </div>
        </div>
      )}

      {/* 3. Dialog Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#176779]" />
            <p className="mt-3 text-xs text-[#74818A]">
              Loading permissions catalog...
            </p>
          </div>
        ) : isError ? (
          <div data-testid="permissions-error-state" className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-[#18282A]">
              Unable to load permissions
            </p>
            <p className="mt-1 text-xs text-[#74818A]">
              Failed to connect to the permissions service.
            </p>
            <Button
              type="button"
              data-testid="retry-permissions-btn"
              variant="outline"
              size="sm"
              onClick={() => {
                refetchCatalog();
                refetchStaffPerm();
              }}
              className="mt-4 text-xs"
            >
              Retry
            </Button>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#74818A]">
            <Search className="h-7 w-7 text-[#D5DFE3] mb-2" />
            <p className="text-xs">No permissions found matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          filteredModules.map((group) => {
            const meta = MODULE_META[group.module] || {
              label: group.module.toUpperCase(),
              icon: Shield,
            };
            const Icon = meta.icon;

            const moduleSelectedCount = group.permissions.filter((p) =>
              selectedPermissions.has(p.id)
            ).length;
            const isAllSelected =
              moduleSelectedCount === group.permissions.length;

            return (
              <div
                key={group.module}
                className="rounded-xl border border-[#E5EAED] bg-white overflow-hidden shadow-2xs transition-all duration-150 hover:border-[#D5DFE3]"
              >
                {/* Module Group Header */}
                <div className="flex items-center justify-between border-b border-[#E5EAED] bg-[#F8FAFB] px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#176779]/10 text-[#176779]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-[#18282A]">
                        {meta.label}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-[#74818A]">
                      {moduleSelectedCount} of {group.permissions.length} granted
                    </span>
                    <button
                      type="button"
                      data-testid={`module-toggle-${group.module}`}
                      onClick={() =>
                        isAllSelected
                          ? deselectModule(group.permissions)
                          : selectModule(group.permissions)
                      }
                      className="text-[11px] font-semibold text-[#176779] hover:underline cursor-pointer"
                    >
                      {isAllSelected ? "Clear" : "Select All"}
                    </button>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3.5 bg-white">
                  {group.permissions.map((perm) => {
                    const isChecked = selectedPermissions.has(perm.id);
                    const isOriginallyGranted = savedPermissions.has(perm.id);
                    const isModified = isChecked !== isOriginallyGranted;

                    return (
                      <label
                        key={perm.id}
                        htmlFor={`perm-${perm.id}`}
                        className={`group relative flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                          isChecked
                            ? "border-[#176779]/40 bg-[#176779]/5"
                            : "border-[#E5EAED] bg-[#FAFEFF]/60 hover:bg-[#F5F8F9] hover:border-[#D5DFE3]"
                        }`}
                      >
                        <Checkbox
                          id={`perm-${perm.id}`}
                          data-testid={`perm-checkbox-${perm.id}`}
                          checked={isChecked}
                          onCheckedChange={() => togglePermission(perm.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-outfit text-xs font-bold text-[#18282A] group-hover:text-[#176779] transition-colors truncate">
                              {perm.name}
                            </span>
                            {isModified && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  isChecked
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {isChecked ? "+ Added" : "- Removed"}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#74818A] line-clamp-2 leading-relaxed">
                            {perm.description}
                          </p>
                          <span className="mt-1 inline-block font-mono text-[9px] text-[#A0AEB4]">
                            {perm.id}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#F8FAFB] px-6 py-4">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <div data-testid="unsaved-changes-badge" className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#74818A]">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Saved ({savedPermissions.size} granted)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            data-testid="cancel-permissions-btn"
            variant="outline"
            onClick={handleRequestClose}
            disabled={isSaving}
            className="text-xs h-9 px-4 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="save-permissions-btn"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving || isLoading}
            className="bg-[#176779] hover:bg-[#125362] text-white text-xs h-9 px-5 rounded-xl font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Permissions</span>
            )}
          </Button>
        </div>
      </div>
      </div>

      {/* In-app unsaved-changes confirmation (replaces window.confirm) */}
      {showDiscardConfirm && (
        <div
          data-testid="discard-changes-confirm"
          className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowDiscardConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E5EAED]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-outfit text-base font-bold text-[#18282A]">
                  Discard Unsaved Changes?
                </h3>
                <p className="mt-1 text-xs text-[#74818A] leading-relaxed">
                  You have made changes to staff permissions that haven&rsquo;t
                  been saved. Are you sure you want to discard them?
                </p>
              </div>
              <button
                type="button"
                aria-label="Keep editing"
                onClick={() => setShowDiscardConfirm(false)}
                className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#74818A] hover:bg-[#F5F8F9] hover:text-[#18282A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176779]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                data-testid="keep-editing-btn"
                variant="outline"
                size="sm"
                onClick={() => setShowDiscardConfirm(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                data-testid="discard-changes-btn"
                size="sm"
                onClick={handleDiscard}
                className="rounded-xl bg-[#176779] hover:bg-[#125362] text-white text-xs font-semibold"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
