import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Experiences",
  description: "Browse Phuket experiences by category.",
};

export default function ExperiencesPage() {
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
          badge="Categories"
          title="Curated Phuket Experiences"
          subtitle="Explore island hopping, romantic sunset cruises, diving & snorkeling expeditions, and family-friendly adventures."
          align="left"
        />

        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-12 text-center">
          <h3 className="font-semibold text-foreground">Experiences Hub</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Category browsing, experience highlights, and dynamic collections planned for Phase 2/3.
          </p>
        </div>
      </Container>
    </div>
  );
}
