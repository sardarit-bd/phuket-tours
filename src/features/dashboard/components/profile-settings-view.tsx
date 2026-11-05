"use client";

import * as React from "react";
import {
  Pencil,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProfileMode = "view" | "edit";

/**
 * Props for the shared two-state profile settings card.
 *
 * The component handles the view/edit state machine and renders:
 * - Read-only fields in view mode
 * - Input controls in edit mode
 * - Save / Cancel action bar
 *
 * Callers manage:
 * - Draft values for editable fields (name, phone, and any extras)
 * - The `isDirty` check
 * - The save handler
 */
export interface ProfileSettingsViewProps {
  /** Authoritative profile data from the backend. */
  profile: {
    name: string;
    email: string;
    phone: string | null;
  } | null;

  isProfileLoading: boolean;
  profileLoadError: unknown;
  onRefetchProfile: () => void;

  /** Current draft values managed by the caller. */
  draftName: string;
  draftPhone: string;
  onDraftNameChange: (value: string) => void;
  onDraftPhoneChange: (value: string) => void;

  /** True when any editable field differs from the authoritative profile. */
  isDirty: boolean;

  isSaving: boolean;
  saveError: unknown;

  /** Displayed in the "Account Role" read-only field. */
  roleLabel: string;
  /** Short badge shown next to the heading. */
  badgeLabel: string;
  /** Description shown under the heading. */
  description: string;

  /** Called when the user clicks "Edit Profile". */
  onEnterEdit: () => void;
  /** Called when the user clicks "Save Changes". Returns true on success. */
  onHandleSave: () => Promise<boolean>;
  /** Called when the user clicks "Cancel". */
  onHandleCancel: () => void;

  /**
   * Render extra editable fields (e.g. agencyName) inside the editable grid.
   * Rendered only while in edit mode. Return null for portals that have no
   * extra editable fields.
   */
  extraEditableFields?: React.ReactNode;
  /**
   * Read-only display for any extra editable fields, rendered in view mode
   * in place of `extraEditableFields`. Only needed when `extraEditableFields`
   * is provided.
   */
  extraEditableFieldsView?: React.ReactNode;
  /**
   * Render extra read-only fields (e.g. account status, member since)
   * below the standard read-only grid.
   */
  extraReadonlyFields?: React.ReactNode;

  /** Test ID prefix for data-testid attributes. Defaults to "profile-settings". */
  testIdPrefix?: string;
}

/**
 * Shared two-state profile settings card used across all user portals
 * (Customer, Admin, Staff, Agent).
 *
 * Renders profile data in a read-only **view** state by default and switches
 * to an **edit** state when the user clicks *Edit Profile*. In edit mode the
 * editable fields become input controls, restricted fields stay read-only,
 * and a Save / Cancel action bar appears at the bottom of the card.
 */
export function ProfileSettingsView({
  profile,
  isProfileLoading,
  profileLoadError,
  onRefetchProfile,
  draftName,
  draftPhone,
  onDraftNameChange,
  onDraftPhoneChange,
  isDirty,
  isSaving,
  saveError,
  roleLabel,
  badgeLabel,
  description,
  onEnterEdit,
  onHandleSave,
  onHandleCancel,
  extraEditableFields,
  extraEditableFieldsView,
  extraReadonlyFields,
  testIdPrefix = "profile-settings",
}: ProfileSettingsViewProps) {
  const [mode, setMode] = React.useState<ProfileMode>("view");
  const [saved, setSaved] = React.useState(false);

  const enterEdit = () => {
    setMode("edit");
    onEnterEdit();
  };

  const handleCancel = () => {
    setMode("view");
    onHandleCancel();
  };

  const handleSave = async () => {
    const success = await onHandleSave();
    if (success) {
      setSaved(true);
      setMode("view");
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────
  if (isProfileLoading) {
    return (
      <div className="space-y-4" data-testid={`${testIdPrefix}-loading`}>
        <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
          Profile Settings
        </h1>
        <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (profileLoadError || !profile) {
    return (
      <div className="space-y-4" data-testid={`${testIdPrefix}-load-error`}>
        <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
          Profile Settings
        </h1>
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center"
          data-testid={`${testIdPrefix}-load-error-banner`}
        >
          <AlertCircle className="mx-auto h-8 w-8 text-rose-300" />
          <p className="mt-2 text-xs text-rose-800">
            Failed to load profile. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefetchProfile}
            className="mt-3 border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid={`${testIdPrefix}-page`}>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
              Profile Settings
            </h1>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              {badgeLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#74818A]">{description}</p>
        </div>

        {mode === "view" && (
          <Button
            onClick={enterEdit}
            variant="outline"
            size="sm"
            className="h-9 border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
            data-testid={`${testIdPrefix}-edit-btn`}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5 text-[#176779]" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success banner */}
      {saved && (
        <div
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800"
          data-testid={`${testIdPrefix}-saved`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      {/* Save error banner */}
      {!!saveError && mode === "edit" && (
        <div
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800"
          data-testid={`${testIdPrefix}-save-error`}
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>
            {typeof saveError === "string"
              ? saveError
              : (saveError as { message?: string })?.message || "Failed to save profile."}
          </span>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-[#E5EAED] bg-[#F8FAFB] px-5 py-4">
          <div>
            <h3 className="font-outfit text-sm font-bold text-[#18282A]">Personal Information</h3>
            <p className="text-xs text-[#74818A]">
              {mode === "view"
                ? "Your account details as they currently appear."
                : "Update your contact details. Changes are saved to your account."}
            </p>
          </div>
          {mode === "edit" && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Editing
            </span>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Editable fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
                <User className="h-3.5 w-3.5 text-[#74818A]" />
                Full Name
              </label>
              {mode === "view" ? (
                <p
                  className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#18282A]"
                  data-testid={`${testIdPrefix}-name-view`}
                >
                  {profile.name}
                </p>
              ) : (
                <Input
                  id="profile-name"
                  value={draftName}
                  onChange={(e) => onDraftNameChange(e.target.value)}
                  placeholder="Your full name"
                  className="h-10 text-sm border-[#E5EAED] bg-white rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
                  data-testid={`${testIdPrefix}-name-input`}
                />
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
                <Phone className="h-3.5 w-3.5 text-[#74818A]" />
                Phone Number
              </label>
              {mode === "view" ? (
                <p
                  className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#18282A]"
                  data-testid={`${testIdPrefix}-phone-view`}
                >
                  {profile.phone || "—"}
                </p>
              ) : (
                <Input
                  id="profile-phone"
                  value={draftPhone}
                  onChange={(e) => onDraftPhoneChange(e.target.value)}
                  placeholder="+66 812 345 678"
                  className="h-10 text-sm border-[#E5EAED] bg-white rounded-xl focus-visible:ring-1 focus-visible:ring-[#176779]"
                  data-testid={`${testIdPrefix}-phone-input`}
                />
              )}
              {mode === "edit" && (
                <p className="mt-1 text-[10px] text-[#74818A]">
                  Include country code. Example: +66 812 345 678
                </p>
              )}
            </div>

            {/* Extra editable fields (e.g. agencyName for agent portal) */}
            {mode === "view" ? extraEditableFieldsView : extraEditableFields}
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
                <Mail className="h-3.5 w-3.5 text-[#74818A]" />
                Email Address
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#74818A]">
                  Read-only
                </span>
              </label>
              <p
                className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#74818A]"
                data-testid={`${testIdPrefix}-email-view`}
              >
                {profile.email}
              </p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#18282A]">
                <Lock className="h-3.5 w-3.5 text-[#74818A]" />
                Account Role
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase text-[#74818A]">
                  Read-only
                </span>
              </label>
              <p
                className="flex h-10 items-center rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3 text-sm text-[#74818A]"
                data-testid={`${testIdPrefix}-role-view`}
              >
                {roleLabel}
              </p>
            </div>
          </div>

          {/* Extra read-only fields (e.g. account status, created date) */}
          {extraReadonlyFields}

          {/* Actions — only in edit mode */}
          {mode === "edit" && (
            <div className="flex items-center gap-3 border-t border-[#E5EAED] pt-4">
              <div className="text-xs text-[#74818A]">
                {isDirty ? (
                  <span className="font-medium text-[#D97706]">Unsaved changes</span>
                ) : (
                  <span>No changes yet</span>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="ghost"
                  className="h-9 text-xs text-[#74818A] hover:bg-slate-50"
                  data-testid={`${testIdPrefix}-cancel-btn`}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className="h-9 bg-[#176779] text-white text-xs font-semibold hover:bg-[#135664] disabled:opacity-50"
                  data-testid={`${testIdPrefix}-save-btn`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
