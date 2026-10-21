import Link from "next/link";
import {
  Compass,
  CalendarCheck2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#14262b] via-[#174853] to-[#2B9BA8] py-24 text-white lg:py-32">
        {/* Decorative background blurs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-dark/40 blur-3xl pointer-events-none" />

        <Container className="relative z-10 text-center">
          <Badge
            variant="secondary"
            className="mb-6 inline-flex items-center gap-2 border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span>Official Phuket Excursions & Andaman Sea Adventures</span>
          </Badge>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:leading-tight">
            Discover Paradise with <br />
            <span className="bg-gradient-to-r from-white via-teal-100 to-[#12B8C4] bg-clip-text text-transparent">
              Phuket’s Premier Tour Operator
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-teal-50/90 sm:text-xl leading-relaxed">
            Curated speedboats, catamaran island-hopping to Phi Phi & James Bond Island,
            snorkeling adventures, and ethical wildlife sanctuaries.
          </p>

          {/* Quick Search Preview Bar */}
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur-md transition-all sm:rounded-full">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 px-4 py-2 w-full">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div className="text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Destination / Tour
                  </span>
                  <input
                    type="text"
                    placeholder="e.g., Phi Phi Island, Phang Nga, Similan..."
                    className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-gray-400"
                    readOnly
                  />
                </div>
              </div>

              <div className="hidden h-8 w-px bg-border sm:block" />

              <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-auto">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div className="text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Full Day & Half Day
                  </span>
                </div>
              </div>

              <Button asChild size="default" className="w-full sm:w-auto shrink-0 shadow-lg shadow-primary/30">
                <Link href="/tours">
                  <Search className="mr-1.5 h-4 w-4" />
                  Search Tours
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick stats / highlights */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <div className="text-2xl font-bold text-white">40+</div>
              <div className="text-xs text-teal-100">Handpicked Tours</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <div className="text-2xl font-bold text-white">4.9 ★</div>
              <div className="text-xs text-teal-100">12,000+ Reviews</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-teal-100">Verified Local Guides</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-teal-100">Customer Support</div>
            </div>
          </div>
        </Container>
      </section>

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
