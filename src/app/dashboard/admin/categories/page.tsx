import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories — Admin",
};

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
          Tour Categories & Taxonomy
        </h2>
        <p className="text-sm text-[#74818A]">
          Configure tour categories, destination tags, and experience classifications.
        </p>
      </div>

      <div className="rounded-[12px] border border-dashed border-[#E5EAED] bg-white p-8 text-center sm:p-12">
        <p className="font-outfit text-base font-semibold text-[#18282A]">
          Categories Management Placeholder
        </p>
        <p className="mt-1.5 text-xs text-[#74818A]">
          Category creation and taxonomy editing will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
