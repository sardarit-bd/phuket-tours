import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn more about PhuketTours, our experienced crew, and our marine safety standards.",
};

export default function AboutPage() {
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
          badge="About PhuketTours"
          title="Locally Rooted, Globally Trusted"
          subtitle="We specialize in authentic, sustainable, and unforgettable excursions across Phuket, Krabi, and Phang Nga Bay."
          align="left"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-lg font-semibold text-foreground">Experienced Guides</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Licensed local captains and multilingual trip coordinators dedicated to your comfort and safety.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-lg font-semibold text-foreground">Premium Fleet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Modern catamarans and twin/triple engine speedboats maintained to highest maritime safety standards.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-lg font-semibold text-foreground">Eco-Friendly Tourism</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Reef-safe protocols, responsible wildlife viewing, and zero single-use plastic on select charters.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
