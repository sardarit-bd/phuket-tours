"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/alert";
import { useUpdateEmailMutation } from "@/features/auth/api/auth-api";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { Mail, Lock, Loader2 } from "lucide-react";

export interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess?: (newEmail: string) => void;
}

export function EditEmailModal({
  isOpen,
  onClose,
  currentEmail,
  onSuccess,
}: EditEmailModalProps) {
  const [newEmail, setNewEmail] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const [updateEmail, { isLoading, error, reset }] = useUpdateEmailMutation();

  const errorMessage: string = React.useMemo(() => {
    if (!error) return "";
    if (
      typeof error === "object" &&
      "data" in error &&
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data &&
      typeof (error.data as { message: unknown }).message === "string"
    ) {
      return (error.data as { message: string }).message;
    }
    return formatErrorMessage(error, {
      context: "auth",
      fallback: "Failed to update email. Please check your credentials.",
    });
  }, [error]);

  React.useEffect(() => {
    if (isOpen) {
      setNewEmail("");
      setCurrentPassword("");
      setValidationError(null);
      reset();
    }
  }, [isOpen, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setValidationError("Please enter a new email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (trimmedEmail === currentEmail.trim().toLowerCase()) {
      setValidationError("The new email must be different from your current email.");
      return;
    }

    if (!currentPassword) {
      setValidationError("Please enter your current password to confirm this change.");
      return;
    }

    try {
      await updateEmail({
        newEmail: trimmedEmail,
        currentPassword,
      }).unwrap();

      onSuccess?.(trimmedEmail);
      onClose();
    } catch {
      // Error handled by RTK mutation error state
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Change Email Address"
      description="Update your primary login and notification email. You will need to enter your current password for security verification."
      size="sm"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {validationError && (
          <ErrorAlert
            data-testid="edit-email-validation-error"
            description={validationError}
          />
        )}

        {error && (
          <ErrorAlert
            data-testid="edit-email-api-error"
            description={errorMessage}
          />
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#74818A]">
            Current Email
          </label>
          <div className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#74818A]">
            {currentEmail}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="new-email"
            className="flex items-center gap-1.5 text-xs font-medium text-[#18282A]"
          >
            <Mail className="h-3.5 w-3.5 text-[#74818A]" />
            New Email Address
          </label>
          <Input
            id="new-email"
            type="email"
            placeholder="name@example.com"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setValidationError(null);
            }}
            disabled={isLoading}
            required
            className="h-10 text-sm border-[#E5EAED] rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
            data-testid="edit-email-input"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="current-password"
            className="flex items-center gap-1.5 text-xs font-medium text-[#18282A]"
          >
            <Lock className="h-3.5 w-3.5 text-[#74818A]" />
            Current Password
          </label>
          <Input
            id="current-password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setValidationError(null);
            }}
            disabled={isLoading}
            required
            className="h-10 text-sm border-[#E5EAED] rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
            data-testid="edit-email-password-input"
          />
          <p className="text-[11px] text-[#74818A]">
            Required to prevent unauthorized modifications to your account.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 text-xs text-[#74818A] hover:bg-slate-50"
            data-testid="edit-email-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-9 bg-[#176779] text-white text-xs font-semibold hover:bg-[#135664] disabled:opacity-50"
            data-testid="edit-email-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Email"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

