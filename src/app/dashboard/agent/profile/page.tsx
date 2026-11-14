"use client";

import * as React from "react";
import { AgencyProfileForm } from "@/features/agent/components/profile/agency-profile-form";

export default function AgencyProfilePage() {
  return (
    <div className="space-y-6" data-testid="agency-profile-page">
      <AgencyProfileForm />
    </div>
  );
}
