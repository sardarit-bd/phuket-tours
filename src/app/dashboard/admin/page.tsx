import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Operations — PhuketTours",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
          Admin Operations Center
        </h2>
        <p className="text-sm text-[#74818A]">
          Master control panel for PhuketTours platform management and bookings.
        </p>
      </div>

      <div className="rounded-[12px] border border-dashed border-[#E5EAED] bg-white p-8 text-center sm:p-12">
        <p className="font-outfit text-base font-semibold text-[#18282A]">
          Admin Overview Content Placeholder
        </p>
        <p className="mt-1.5 text-xs text-[#74818A]">
          Operational KPIs, booking orders, and inventory charts will be built in the next phase.
        </p>
      </div>
    </div>
  );
}
