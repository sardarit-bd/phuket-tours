"use client";

import * as React from "react";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
} from "@/features/auth/api/auth-api";
import { ProfileSettingsView } from "@/features/dashboard/components/profile-settings-view";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  staff: "Staff",
  agent: "Agent",
  customer: "Customer",
};

export interface AdminProfileSettingsProps {
  /** Role label override; falls back to the value from the loaded profile. */
  roleLabel?: string;
  /** Badge label shown next to the heading (e.g. "Admin" or "Staff"). */
  badgeLabel?: string;
  /** Test ID prefix for data-testid attributes. */
  testIdPrefix?: string;
}

/**
 * Profile settings panel for the Admin and Staff portals.
 *
 * Uses the shared `useGetMeQuery` (`GET /auth/me`) for read and the shared
 * `useUpdateProfileMutation` (`PATCH /users/me`) for write. Only `name` and
 * `phone` are editable; email, role and account status stay read-only.
 */
export function AdminProfileSettings({
  roleLabel,
  badgeLabel,
  testIdPrefix = "admin-profile-settings",
}: AdminProfileSettingsProps) {
  const {
    data: meResponse,
    isLoading: isMeLoading,
    error: meError,
    refetch: refetchMe,
  } = useGetMeQuery();

  const [updateProfile, { isLoading: isSaving, error: saveError, reset: resetSaveError }] =
    useUpdateProfileMutation();

  const profile = meResponse?.data ?? null;

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const hasChanges =
    !!profile && (name !== profile.name || phone !== (profile.phone ?? ""));

  const enterEdit = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? "");
    }
    resetSaveError();
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? "");
    }
    resetSaveError();
  };

  const handleSave = async (): Promise<boolean> => {
    if (!hasChanges || !profile) return false;
    resetSaveError();
    try {
      await updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || null,
      }).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  const resolvedRoleLabel =
    roleLabel ?? (profile ? ROLE_LABELS[profile.role] ?? profile.role : "");
  const resolvedBadge =
    badgeLabel ?? (profile ? ROLE_LABELS[profile.role] ?? profile.role : "");

  return (
    <ProfileSettingsView
      profile={profile}
      isProfileLoading={isMeLoading}
      profileLoadError={meError}
      onRefetchProfile={() => {
        void refetchMe();
      }}
      draftName={name}
      draftPhone={phone}
      onDraftNameChange={setName}
      onDraftPhoneChange={setPhone}
      isDirty={hasChanges}
      isSaving={isSaving}
      saveError={saveError}
      roleLabel={resolvedRoleLabel}
      badgeLabel={resolvedBadge}
      description="Manage your personal contact details and account email address."
      allowEmailEdit={profile?.role === "admin"}
      onEnterEdit={enterEdit}
      onHandleSave={handleSave}
      onHandleCancel={handleCancel}
      testIdPrefix={testIdPrefix}
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
                className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm capitalize text-[#74818A]"
                data-testid={`${testIdPrefix}-status-view`}
              >
                {profile.status}
              </p>
            </div>
          </div>
        ) : null
      }
    />
  );
}
