import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { TourCardSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Tours & Excursions",
  description: "Browse all curated day trips, island-hopping tours, and marine adventures in Phuket.",
};

export default function ToursPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <SectionHeader
          badge="Excursions"
          title="All Phuket Island Tours"
          subtitle="Explore all handpicked boat excursions, cultural visits, and outdoor experiences across Phuket and the Andaman Sea."
          align="left"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <h3 className="font-semibold text-foreground">Phase 3 Implementation Target</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dynamic tour cards, URL-synchronized search filters, category pills, and server-side RTK Query caching will be connected here.
          </p>
        </div>
      </Container>
    </div>
  );
}
