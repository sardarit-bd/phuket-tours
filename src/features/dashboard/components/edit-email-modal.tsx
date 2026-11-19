"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
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

  const prevIsOpenRef = React.useRef(isOpen);

  React.useEffect(() => {
    // Only reset inputs and mutation state when modal transitions from closed to open
    if (isOpen && !prevIsOpenRef.current) {
      setNewEmail("");
      setCurrentPassword("");
      setValidationError(null);
      reset();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, reset]);

  const errorDetails = React.useMemo(() => {
    if (!error) return null;
    const status =
      typeof error === "object" && "status" in error
        ? (error as { status?: unknown }).status
        : undefined;

    const statusCode = typeof status === "number" ? status : undefined;

    if (status === 409) {
      return {
        title: "Email Update Failed",
        message:
          "Email address is already in use by another account. Please choose a different email address.",
        code: 409,
      };
    }

    if (status === "FETCH_ERROR") {
      return {
        title: "Connection Failed",
        message:
          "Unable to connect. Please check your internet connection and try again.",
      };
    }

    if (typeof status === "number" && status >= 500) {
      return {
        title: "Server Error",
        message: "A server error occurred. Please try again later.",
        code: statusCode,
      };
    }

    if (
      typeof error === "object" &&
      "data" in error &&
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data &&
      typeof (error.data as { message: unknown }).message === "string" &&
      (error.data as { message: string }).message.trim().length > 0
    ) {
      return {
        title: "Email Update Failed",
        message: (error.data as { message: string }).message,
        code: statusCode,
      };
    }

    if (status === 429) {
      return {
        title: "Too Many Requests",
        message: "Too many requests. Please wait a moment and try again.",
        code: 429,
      };
    }

    if (status === 401) {
      return {
        title: "Session Expired",
        message: "Your session has expired. Please sign in again.",
        code: 401,
      };
    }

    return {
      title: "Email Update Failed",
      message: formatErrorMessage(error, {
        context: "auth",
        fallback: "Failed to update email. Please check your credentials.",
      }),
      code: statusCode,
    };
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setValidationError(null);
    if (error) reset();

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
              if (error) reset();
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
              if (error) reset();
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

        {validationError && (
          <FeedbackAlert
            type="error"
            title="Validation Error"
            message={validationError}
            data-testid="edit-email-validation-error"
          />
        )}

        {errorDetails && (
          <FeedbackAlert
            type="error"
            title={errorDetails.title}
            message={errorDetails.message}
            code={errorDetails.code}
            data-testid="edit-email-api-error"
          />
        )}

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

