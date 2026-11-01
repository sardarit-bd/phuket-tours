"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateAdminUserMutation } from "../../api/admin-api";
import type { AdminUserRecord } from "../../types/admin-users";
import { Loader2, AlertCircle, ShieldAlert, CheckCircle2, UserX, UserCheck } from "lucide-react";

export interface DeactivateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord | null;
  currentUserId?: string | null;
  onSuccess?: () => void;
}

export function DeactivateUserDialog({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
}: DeactivateUserDialogProps) {
  if (!user) return null;

  return (
    <DeactivateUserForm
      key={user.id}
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      currentUserId={currentUserId}
      onSuccess={onSuccess}
    />
  );
}

function DeactivateUserForm({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord;
  currentUserId?: string | null;
  onSuccess?: () => void;
}) {
  const isDeactivated = user.status === "deactivated";
  const targetStatus = isDeactivated ? "active" : "deactivated";
  const isSelf = Boolean(currentUserId && user.id === currentUserId);
  const isSelfDeactivationBlocked = isSelf && !isDeactivated;

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [updateUser, { isLoading }] = useUpdateAdminUserMutation();

  const handleConfirm = async () => {
    // Strict handler enforcement
    if (isSelfDeactivationBlocked) {
      setErrorMessage("You cannot deactivate your own administrative account.");
      return;
    }

    setErrorMessage(null);

    try {
      await updateUser({
        userId: user.id,
        status: targetStatus,
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setErrorMessage(
        apiErr?.data?.message || `Failed to ${targetStatus === "active" ? "activate" : "deactivate"} account.`
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isDeactivated ? "Activate User Account" : "Deactivate User Account"}
      description={`Change account status for ${user.name} (${user.email})`}
      size="sm"
    >
      <div className="space-y-4 pt-2" data-testid="deactivate-user-modal">
        {/* Status Error Feedback */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            data-testid="status-toggle-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
            data-testid="status-toggle-success"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Account successfully {targetStatus === "active" ? "activated" : "deactivated"}.
            </span>
          </div>
        )}

        {/* Self-deactivation warning */}
        {isSelfDeactivationBlocked ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
            data-testid="self-deactivation-warning"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-900 block">
                Self-Deactivation Blocked
              </span>
              <p className="leading-relaxed">
                You are currently logged into this administrator account ({user.email}). Deactivating your own account is forbidden to prevent administrative lockout.
              </p>
            </div>
          </div>
        ) : isDeactivated ? (
          /* Activation Explanation */
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
            <UserCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-emerald-950 block">
                Restore Account Access
              </span>
              <p className="leading-relaxed">
                Activating this account will restore login permissions for <strong>{user.name}</strong>. The user will immediately be able to sign in with their existing credentials.
              </p>
            </div>
          </div>
        ) : (
          /* Deactivation Consequences */
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900">
            <UserX className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-rose-950 block">
                Immediate Session Revocation
              </span>
              <p className="leading-relaxed">
                Deactivating <strong>{user.name}</strong> will immediately revoke all active sessions for this account. The user will be logged out and cannot sign in until an administrator reactivates this account.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading || isSuccess || isSelfDeactivationBlocked}
            className={
              isDeactivated
                ? "bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                : "bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
            }
            data-testid="confirm-status-toggle-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : isDeactivated ? (
              "Activate Account"
            ) : (
              "Deactivate Account"
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
