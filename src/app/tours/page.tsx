import type { Metadata } from "next";
import { TourHero } from "@/features/tours/components/tour-hero";
import { ToursPageContent } from "@/features/tours/components/tours-page-content";
import { TOTAL_TOURS_CATALOG_COUNT } from "@/features/tours/data/tours-data";

export const metadata: Metadata = {
  title: "Tours & Experiences",
  description:
    "Discover 462+ amazing tours, activities and experiences across Phuket and nearby islands. Book island hopping, snorkeling, and day trips.",
};

export default function ToursPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Phuket Hero Section */}
      <TourHero totalCount={TOTAL_TOURS_CATALOG_COUNT} />

      {/* Main Tours & Experiences Interactive Catalog */}
      <ToursPageContent />
    </div>
  );
}
