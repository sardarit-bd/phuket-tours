"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { useDeleteAdminUserMutation } from "../../api/admin-api";
import type { AdminUserRecord } from "../../types/admin-users";
import {
  Loader2,
  ShieldAlert,
  Trash2,
  Archive,
} from "lucide-react";

export interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord | null;
  currentUserId?: string | null;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
}: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <DeleteUserForm
      key={user.id}
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      currentUserId={currentUserId}
      onSuccess={onSuccess}
    />
  );
}

function DeleteUserForm({
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
  const isSelf = Boolean(currentUserId && user.id === currentUserId);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [deleteUser, { isLoading }] = useDeleteAdminUserMutation();

  const handleConfirm = async () => {
    if (isSelf) {
      setErrorMessage("You cannot delete your own administrative account.");
      return;
    }

    setErrorMessage(null);

    try {
      await deleteUser(user.id).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, "Failed to delete user account.")
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User Account"
      description={`Permanently archive account for ${user.name}`}
      size="sm"
    >
      <div className="space-y-4 pt-2" data-testid="delete-user-modal">
        {/* Error Feedback */}
        {errorMessage && (
          <div data-testid="delete-user-error">
            <ErrorAlert message={errorMessage} />
          </div>
        )}

        {/* Success Feedback */}
        {isSuccess && (
          <div data-testid="delete-user-success">
            <SuccessAlert message="User account successfully deleted and archived." />
          </div>
        )}

        {/* Self-deletion warning */}
        {isSelf ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
            data-testid="self-delete-warning"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-900 block">
                Self-Deletion Blocked
              </span>
              <p className="leading-relaxed">
                You are currently logged into this administrator account ({user.email}). Deleting your own account is forbidden to prevent administrative lockout.
              </p>
            </div>
          </div>
        ) : (
          /* Deletion Impact Details */
          <div className="space-y-3">
            <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[#18282A]">
                <span className="text-[#74818A]">Account Name:</span>
                <span className="font-semibold">{user.name}</span>
              </div>
              <div className="flex justify-between items-center text-[#18282A]">
                <span className="text-[#74818A]">Email Address:</span>
                <span className="font-medium font-mono text-[11px]">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-[#18282A]">
                <span className="text-[#74818A]">Account Role:</span>
                <span className="font-semibold capitalize text-[#176779]">{user.role}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900">
              <Archive className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-rose-950 block">
                  Archive & Soft-Deletion Policy
                </span>
                <p className="leading-relaxed text-[11px]">
                  This user will be soft-deleted and removed from normal user listings. All active sessions and invitation tokens will be revoked immediately. Historical bookings, payments, and commission records will remain preserved for audit compliance.
                </p>
              </div>
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
            data-testid="cancel-delete-user-btn"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading || isSuccess || isSelf}
            className="bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer flex items-center gap-1.5"
            data-testid="confirm-delete-user-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete User</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
