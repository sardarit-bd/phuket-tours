"use client";

import * as React from "react";
import {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} from "../../api/agent-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Shield,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

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

export function AgencyProfileForm() {
  const { data: response, isLoading, isError, refetch } = useGetAgentProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateAgentProfileMutation();

  const profile = response?.data;

  const [name, setName] = React.useState("");
  const [agencyName, setAgencyName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sync state when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAgencyName(profile.agencyName || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({
        type: "error",
        message: "Agent name is required and cannot be empty.",
      });
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        agencyName: agencyName.trim() || undefined,
        phone: phone.trim() || null,
      }).unwrap();

      setFeedback({
        type: "success",
        message: "Agency profile successfully updated and synchronized.",
      });
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message || "Failed to update profile."
          : "An unexpected error occurred while saving profile changes.";
      setFeedback({
        type: "error",
        message: errorMsg,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" data-testid="profile-loading">
        <Loader2 className="h-8 w-8 animate-spin text-[#176779]" />
        <span className="ml-3 text-sm text-[#74818A]">Loading agency profile...</span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-xs"
        data-testid="profile-error"
      >
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
        <h4 className="mt-2 text-base font-bold text-rose-900">
          Failed to load agency profile
        </h4>
        <p className="mt-1 text-xs text-rose-700">
          Could not retrieve your partner credentials from the server.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="mt-4 border-rose-300 bg-white text-xs text-rose-700 hover:bg-rose-100"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl" data-testid="agency-profile-module">
      {/* Header Profile Identity Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#176779] border border-teal-200 font-outfit text-xl font-bold">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-outfit text-lg font-bold text-[#18282A]">
                {profile.name}
              </h2>
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Partner Agent
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  profile.status === "active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-slate-100 text-slate-700"
                }`}
              >
                {profile.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#74818A] flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#176779]" />
              <span>{profile.agencyName || "Independent Partner Agent"}</span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-[#74818A] border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E5EAED]">
          <span className="block text-[11px] font-semibold uppercase tracking-wider">
            Member Since
          </span>
          <span className="font-medium text-[#18282A]">
            {formatDate(profile.createdAt)}
          </span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-xs shadow-xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
          data-testid={`profile-feedback-${feedback.type}`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Editable Fields Section */}
        <div className="rounded-2xl border border-[#E5EAED] bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-[#E5EAED] pb-3">
            <h3 className="font-outfit text-base font-bold text-[#18282A]">
              Editable Agency Information
            </h3>
            <p className="text-xs text-[#74818A]">
              Update the contact details and agency branding displayed on your reservations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Agent Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="agent-name"
                className="text-xs font-semibold text-[#18282A] flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-[#176779]" />
                <span>Agent Contact Name *</span>
              </label>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="text-xs rounded-xl border-[#E5EAED] bg-white h-10"
                data-testid="input-agent-name"
              />
            </div>

            {/* Agency Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="agency-name"
                className="text-xs font-semibold text-[#18282A] flex items-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5 text-[#176779]" />
                <span>Agency / Business Name</span>
              </label>
              <Input
                id="agency-name"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Andaman Island Travel Group"
                className="text-xs rounded-xl border-[#E5EAED] bg-white h-10"
                data-testid="input-agency-name"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="agent-phone"
                className="text-xs font-semibold text-[#18282A] flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-[#176779]" />
                <span>Phone / WhatsApp Contact</span>
              </label>
              <Input
                id="agent-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+66 81 234 5678"
                className="text-xs rounded-xl border-[#E5EAED] bg-white h-10 max-w-md"
                data-testid="input-agent-phone"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] h-10 px-6 cursor-pointer"
              data-testid="save-profile-btn"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Read-Only Account Details Section */}
        <div className="rounded-2xl border border-[#E5EAED] bg-[#F8FAFB] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
            <div>
              <h3 className="font-outfit text-sm font-bold text-[#18282A] flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[#74818A]" />
                <span>System Managed Account Attributes</span>
              </h3>
              <p className="text-[11px] text-[#74818A]">
                These credentials are bound to your security authentication and can only be altered by system administrators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-[#176779]" />
                <span>Login Email Address</span>
              </span>
              <p className="font-medium text-[#18282A]">{profile.email}</p>
            </div>

            <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-[#176779]" />
                <span>Agent Account ID</span>
              </span>
              <p className="font-mono text-[11px] text-[#18282A] select-all">
                {profile.id}
              </p>
            </div>

            <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-[#176779]" />
                <span>Assigned Role</span>
              </span>
              <p className="font-medium text-[#18282A] capitalize">
                {profile.role} (B2B Partner)
              </p>
            </div>

            <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-[#176779]" />
                <span>Account Created</span>
              </span>
              <p className="font-medium text-[#18282A]">
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
