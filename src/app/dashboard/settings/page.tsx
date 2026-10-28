import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings — User Dashboard",
};

export default function UserSettingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
          Profile Settings
        </h2>
        <p className="text-sm text-[#74818A]">
          Manage guest details, contact numbers, and hotel pickup defaults.
        </p>
      </div>

      <div className="rounded-[12px] border border-dashed border-[#E5EAED] bg-white p-8 text-center sm:p-12">
        <p className="font-outfit text-base font-semibold text-[#18282A]">
          Profile Settings Form Placeholder
        </p>
        <p className="mt-1.5 text-xs text-[#74818A]">
          User profile preferences and emergency contacts will be configured in the next phase.
        </p>
      </div>
    </div>
  );
}
