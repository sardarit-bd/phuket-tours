"use client";

import * as React from "react";
import { useGetMeQuery } from "@/features/auth/api/auth-api";
import { useUpdateProfileMutation } from "@/features/customer/api/customer-api";
import { ProfileSettingsView } from "@/features/dashboard/components/profile-settings-view";
import type { UserProfile } from "@/features/auth/types/auth";

export default function UserSettingsPage() {
  const {
    data: meResponse,
    isLoading: isMeLoading,
    error: meError,
    refetch: refetchMe,
  } = useGetMeQuery();

  const [updateProfile, { isLoading: isSaving, error: saveError, reset: resetSaveError }] =
    useUpdateProfileMutation();

  const profile: UserProfile | null = meResponse?.data ?? null;

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const hasChanges =
    profile &&
    (name !== profile.name || phone !== (profile.phone ?? ""));

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
      isDirty={!!hasChanges}
      isSaving={isSaving}
      saveError={saveError}
      roleLabel="Customer"
      badgeLabel="Customer"
      description="Manage your contact details. Your email address is used for login and cannot be changed here."
      allowEmailEdit={false}
      onEnterEdit={enterEdit}
      onHandleSave={handleSave}
      onHandleCancel={handleCancel}
      testIdPrefix="customer-settings"
    />
  );
}
