"use client";

import * as React from "react";
import {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} from "../../api/agent-api";
import { ProfileSettingsView } from "@/features/dashboard/components/profile-settings-view";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Agency profile settings for the Agent portal.
 *
 * Uses the shared `ProfileSettingsView` state machine, wired to the agent
 * profile endpoints. Editable fields are the agent contact name, phone and
 * agency / business name. Email, role, status and account ID stay read-only.
 */
export function AgencyProfileForm() {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAgentProfileQuery();
  const [updateProfile, { isLoading: isUpdating, error: updateError, reset: resetUpdateError }] =
    useUpdateAgentProfileMutation();

  const profile = response?.data ?? null;

  const [name, setName] = React.useState("");
  const [agencyName, setAgencyName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const hasChanges =
    !!profile &&
    (name !== (profile.name || "") ||
      agencyName !== (profile.agencyName || "") ||
      phone !== (profile.phone || ""));

  const enterEdit = () => {
    if (profile) {
      setName(profile.name || "");
      setAgencyName(profile.agencyName || "");
      setPhone(profile.phone || "");
    }
    setValidationError(null);
    resetUpdateError();
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setAgencyName(profile.agencyName || "");
      setPhone(profile.phone || "");
    }
    setValidationError(null);
    resetUpdateError();
  };

  const handleSave = async (): Promise<boolean> => {
    if (!profile || !hasChanges) return false;
    setValidationError(null);
    resetUpdateError();

    if (!name.trim()) {
      setValidationError("Agent name is required and cannot be empty.");
      return false;
    }

    try {
      await updateProfile({
        name: name.trim(),
        agencyName: agencyName.trim() || undefined,
        phone: phone.trim() || null,
      }).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const saveError = validationError ?? updateError;

  return (
    <ProfileSettingsView
      profile={profile}
      isProfileLoading={isLoading}
      profileLoadError={isError ? error ?? true : null}
      onRefetchProfile={() => {
        void refetch();
      }}
      draftName={name}
      draftPhone={phone}
      onDraftNameChange={setName}
      onDraftPhoneChange={setPhone}
      isDirty={hasChanges}
      isSaving={isUpdating}
      saveError={saveError}
      pageTitle="Agency Profile"
      roleLabel="Agent (B2B Partner)"
      badgeLabel="Partner Account"
      description="Manage your business contact details and agency identity on PhuketTours."
      allowEmailEdit={false}
      onEnterEdit={enterEdit}
      onHandleSave={handleSave}
      onHandleCancel={handleCancel}
      testIdPrefix="agency-profile"
      extraEditableFieldsView={
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
            <Building2 className="h-3.5 w-3.5 text-[#74818A]" />
            Agency / Business Name
          </label>
          <p
            className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#18282A]"
            data-testid="agency-profile-agencyName-view"
          >
            {profile?.agencyName || "—"}
          </p>
        </div>
      }
      extraEditableFields={
        <div className="space-y-1.5">
          <label
            htmlFor="agency-name"
            className="flex items-center gap-1.5 text-xs font-medium text-[#18282A]"
          >
            <Building2 className="h-3.5 w-3.5 text-[#74818A]" />
            Agency / Business Name
          </label>
          <Input
            id="agency-name"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="e.g. Andaman Island Travel Group"
            className="h-10 text-sm border-[#E5EAED] bg-white rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
            data-testid="input-agency-name"
          />
        </div>
      }
      extraReadonlyFields={
        profile ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
                Account Status
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#74818A]">
                  Read-only
                </span>
              </label>
              <p
                className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm uppercase text-[#74818A]"
                data-testid="agency-profile-status-view"
              >
                {profile.status}
              </p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
                Member Since
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#74818A]">
                  Read-only
                </span>
              </label>
              <p
                className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#74818A]"
                data-testid="agency-profile-created-view"
              >
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        ) : null
      }
    />
  );
}
