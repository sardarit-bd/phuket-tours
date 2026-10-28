import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Favorites — User Dashboard",
};

export default function UserFavoritesPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
          My Favorites
        </h2>
        <p className="text-sm text-[#74818A]">
          Saved island day trips, excursions, and tours wishlist.
        </p>
      </div>

      <div className="rounded-[12px] border border-dashed border-[#E5EAED] bg-white p-8 text-center sm:p-12">
        <p className="font-outfit text-base font-semibold text-[#18282A]">
          My Favorites Grid Placeholder
        </p>
        <p className="mt-1.5 text-xs text-[#74818A]">
          Saved favorites cards will be displayed in the next phase.
        </p>
      </div>
    </div>
  );
}
