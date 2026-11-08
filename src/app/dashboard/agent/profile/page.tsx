"use client";

import * as React from "react";
import { AgencyProfileForm } from "@/features/agent/components/profile/agency-profile-form";

export default function AgencyProfilePage() {
  return (
    <div className="space-y-6" data-testid="agency-profile-page">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl">
            Agency Profile
          </h1>
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            Partner Account
          </span>
        </div>
        <p className="mt-1 text-sm text-[#74818A]">
          Manage your business contact details and agency identity on PhuketTours.
        </p>
      </div>

      {/* Form Component */}
      <AgencyProfileForm />
    </div>
  );
}
