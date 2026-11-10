"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import {
  useUpdateAdminUserMutation,
  useUpdateAdminAgentMutation,
  useGetAdminAgentByIdQuery,
} from "../../api/admin-api";
import type { AdminUserRecord, UserStatus } from "../../types/admin-users";
import { Loader2, ShieldAlert } from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";

export interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord | null;
  currentUserId?: string | null;
  onSuccess?: () => void;
}

interface EditUserFormProps {
  user: AdminUserRecord;
  currentUserId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: SelectOption<UserStatus>[] = [
  { value: "active", label: "Active" },
  { value: "deactivated", label: "Deactivated" },
];

function EditUserForm({
  user,
  currentUserId,
  onClose,
  onSuccess,
}: EditUserFormProps) {
  const isSelf = Boolean(currentUserId && user.id === currentUserId);
  const isAgent = user.role === "agent";

  // Form states
  const [name, setName] = React.useState(user.name || "");
  const [phone, setPhone] = React.useState(user.phone || "");
  const [status, setStatus] = React.useState<UserStatus>(user.status);
  const [customAgencyName, setCustomAgencyName] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Agent profile fetch if agent
  const { data: agentData, isLoading: isAgentLoading } = useGetAdminAgentByIdQuery(
    user.id,
    { skip: !isAgent }
  );

  const agencyName =
    customAgencyName !== null
      ? customAgencyName
      : agentData?.data?.agentProfile?.agencyName || "";

  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateAdminUserMutation();
  const [updateAgent, { isLoading: isUpdatingAgent }] = useUpdateAdminAgentMutation();

  const isSubmitting = isUpdatingUser || isUpdatingAgent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }

    // Self-deactivation protection check
    if (isSelf && status === "deactivated") {
      setErrorMessage("You cannot deactivate your own administrative account.");
      return;
    }

    try {
      // 1. Update core user fields: name, phone, status
      await updateUser({
        userId: user.id,
        name: trimmedName,
        phone: phone.trim() ? phone.trim() : null,
        status: !isSelf && status !== user.status ? status : undefined,
      }).unwrap();

      // 2. If agent and agencyName changed, update agent
      if (isAgent) {
        const trimmedAgency = agencyName.trim();
        const originalAgency = agentData?.data?.agentProfile?.agencyName || "";
        if (trimmedAgency !== originalAgency) {
          await updateAgent({
            agentId: user.id,
            agencyName: trimmedAgency || undefined,
          }).unwrap();
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update account. Please verify input and try again.",
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Status Messages */}
      {errorMessage && (
        <ErrorAlert
          data-testid="edit-user-error"
          description={errorMessage}
        />
      )}

      {isSuccess && (
        <SuccessAlert
          data-testid="edit-user-success"
          description="Account updated successfully."
        />
      )}

      {/* Read-only Email Notice */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Email Address <span className="text-[11px] font-normal text-[#74818A]">(Read-only)</span>
        </label>
        <Input
          type="email"
          value={user.email}
          disabled
          readOnly
          className="bg-slate-50 text-[#74818A] cursor-not-allowed text-xs"
        />
        <p className="text-[11px] text-[#74818A]">
          User email addresses are permanently tied to authentication credentials and cannot be modified.
        </p>
      </div>

      {/* Read-only Role Notice */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Assigned Role <span className="text-[11px] font-normal text-[#74818A]">(Immutable)</span>
        </label>
        <Input
          type="text"
          value={user.role.toUpperCase()}
          disabled
          readOnly
          className="bg-slate-50 text-[#74818A] cursor-not-allowed text-xs capitalize"
        />
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <Input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jane Doe"
          className="text-xs"
          data-testid="edit-user-name-input"
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Phone Number
        </label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +66 81 234 5678"
          className="text-xs"
          data-testid="edit-user-phone-input"
        />
      </div>

      {/* Agency Name (for Agents only) */}
      {isAgent && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#18282A]">
            Agency Name {isAgentLoading && <span className="text-[#74818A] font-normal">(Loading...)</span>}
          </label>
          <Input
            type="text"
            value={agencyName}
            onChange={(e) => setCustomAgencyName(e.target.value)}
            placeholder="e.g. Andaman Island Travel Co."
            className="text-xs"
            disabled={isAgentLoading}
            data-testid="edit-user-agency-input"
          />
          <p className="text-[11px] text-[#74818A]">
            Associated partner travel agency name for this agent account.
          </p>
        </div>
      )}

      {/* Account Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Account Status
        </label>
        {isSelf ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              You cannot deactivate your own administrative account while logged in.
            </span>
          </div>
        ) : (
          <CustomSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => setStatus(val as UserStatus)}
            aria-label="Account status"
            usePortal={true}
            data-testid="edit-user-status-select"
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAED]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || isSuccess}
          className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
          data-testid="edit-user-submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

export function EditUserDialog({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
}: EditUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User Account"
      description={`Update profile information for ${user.name}`}
      size="md"
    >
      <EditUserForm
        key={user.id}
        user={user}
        currentUserId={currentUserId}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
