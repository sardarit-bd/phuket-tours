import Link from "next/link";
import { HeroSection } from "@/components/sections/hero-section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Compass,
  CalendarCheck2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* PhuketTours Hero Section */}
      <HeroSection />

      {/* Phase 1 Foundation & Architecture Verification Section */}
      <section className="bg-muted py-16">
        <Container>
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Phase 1 Deliverable
            </span>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Frontend Foundation & Architectural Readiness
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Built strictly to the approved PhuketTours architecture specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">Centralized Theme</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Exact tokens configured: Primary <span className="font-semibold text-primary">#2B9BA8</span>,
                  Secondary <span className="font-semibold text-secondary">#12B8C4</span>,
                  Dark Teal <span className="font-semibold text-primary-dark">#176779</span>,
                  Pill buttons (<code className="rounded bg-muted px-1">999px</code>), Card radius (<code className="rounded bg-muted px-1">12px</code>).
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">RTK Query Base API</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Centralized <code className="rounded bg-muted px-1">baseApi</code> with tag types <code className="rounded bg-muted px-1">[&apos;Tour&apos;, &apos;Experience&apos;, &apos;Booking&apos;]</code>, Redux store provider, and type-safe hooks.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">Typed Data Contracts</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Domain contracts defined for <code className="rounded bg-muted px-1">Tour</code>, <code className="rounded bg-muted px-1">ExperienceCategory</code>, <code className="rounded bg-muted px-1">BookingDraft</code>, and pagination metadata.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">Next.js App Router</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Server Components by default, responsive Layout, Zod env validation, and Google Plus Jakarta Sans font optimization.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick links to Phase roadmap */}
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <div>
              <h4 className="font-semibold text-foreground">
                Ready for Phase 2: Homepage Implementation
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Experience categories, featured tour cards, booking process, FAQ accordions, and CTA banner.
              </p>
            </div>
            <Button asChild className="mt-4 sm:mt-0">
              <Link href="/tours">
                Preview Tour Listing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
