"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateAdminStaffMutation,
  useCreateAdminAgentMutation,
} from "../../api/admin-api";
import {
  Loader2,
  Mail,
  UserCheck,
  Briefcase,
  Info,
} from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import { cn } from "@/lib/utils";

export interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type InviteType = "staff" | "agent";

function InviteUserForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [inviteType, setInviteType] = React.useState<InviteType>("staff");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [agencyName, setAgencyName] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [createStaff, { isLoading: isCreatingStaff }] = useCreateAdminStaffMutation();
  const [createAgent, { isLoading: isCreatingAgent }] = useCreateAdminAgentMutation();

  const isSubmitting = isCreatingStaff || isCreatingAgent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedAgency = agencyName.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Full name must be at least 2 characters.");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      if (inviteType === "staff") {
        await createStaff({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone ? trimmedPhone : undefined,
        }).unwrap();
      } else {
        await createAgent({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone ? trimmedPhone : undefined,
          agencyName: trimmedAgency ? trimmedAgency : undefined,
        }).unwrap();
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to send invitation. Please verify details and try again.",
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1" data-testid="invite-user-form">
      {/* Type Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setInviteType("staff");
            setErrorMessage(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer",
            inviteType === "staff"
              ? "bg-white text-[#18282A] shadow-xs"
              : "text-[#74818A] hover:text-[#18282A]"
          )}
          data-testid="tab-invite-staff"
        >
          <UserCheck className="h-4 w-4" />
          <span>Invite Staff</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setInviteType("agent");
            setErrorMessage(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer",
            inviteType === "agent"
              ? "bg-white text-[#18282A] shadow-xs"
              : "text-[#74818A] hover:text-[#18282A]"
          )}
          data-testid="tab-invite-agent"
        >
          <Briefcase className="h-4 w-4" />
          <span>Invite Agent</span>
        </button>
      </div>

      {/* 72-hour Onboarding Explanatory Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <div className="leading-relaxed">
          <span className="font-semibold">72-Hour Invitation Flow:</span> An email will be dispatched to the recipient with a secure account activation link valid for 72 hours. The recipient will set their own password during setup.
        </div>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <ErrorAlert
          data-testid="invite-user-error"
          description={errorMessage}
        />
      )}

      {isSuccess && (
        <SuccessAlert
          data-testid="invite-user-success"
          description={`Invitation sent successfully to ${email}. The account has been provisioned.`}
        />
      )}

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
          placeholder={inviteType === "staff" ? "e.g. Somchai Prasert" : "e.g. Robert Smith"}
          className="text-xs"
          data-testid="invite-name-input"
        />
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74818A]" />
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. member@phukettours.com"
            className="pl-9 text-xs"
            data-testid="invite-email-input"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#18282A]">
          Phone Number <span className="text-[11px] font-normal text-[#74818A]">(Optional)</span>
        </label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +66 81 234 5678"
          className="text-xs"
          data-testid="invite-phone-input"
        />
      </div>

      {/* Agency Name (only for Agent) */}
      {inviteType === "agent" && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#18282A]">
            Agency Name <span className="text-[11px] font-normal text-[#74818A]">(Optional)</span>
          </label>
          <Input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="e.g. Phuket Sunshine Holidays"
            className="text-xs"
            data-testid="invite-agency-input"
          />
        </div>
      )}

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
          data-testid="invite-submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Sending Invitation...
            </>
          ) : (
            `Send ${inviteType === "staff" ? "Staff" : "Agent"} Invitation`
          )}
        </Button>
      </div>
    </form>
  );
}

export function InviteUserDialog({
  isOpen,
  onClose,
  onSuccess,
}: InviteUserDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Send a secure onboarding invitation to a new staff member or partner agent."
      size="md"
    >
      {isOpen && (
        <InviteUserForm
          key={isOpen ? "open" : "closed"}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
