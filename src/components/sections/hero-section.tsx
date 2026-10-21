import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden min-h-hero flex flex-col justify-center">
      {/* Full-bleed Phuket Tropical Beach Background */}
      <Image
        src="/images/hero/hero-img.jpg"
        alt="Tropical beach in Phuket with turquoise sea and longtail boats"
        fill
        priority
        className="object-cover object-[70%_center] sm:object-center"
        sizes="100vw"
      />

      {/* Subtle, low-opacity left-side gradient to preserve natural bright photo colors */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />

      {/* Hero Content Constrained by Shared Container */}
      <Container className="relative z-10 py-12 sm:py-16 md:py-20">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Outlined Badge with Compact Spacing */}
          <div className="mb-3.5 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white inline-block" />
            <span>Tours & Experiences in Phuket</span>
          </div>

          {/* Large Bold Two-Line Headline with controlled scaling */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-xs">
            Discover Phuket.
            <br />
            <span className="inline-block">Experience More.</span>
          </h1>

          {/* Supporting Text Neatly Grouped */}
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base md:text-lg text-white/95 max-w-xl font-normal leading-relaxed drop-shadow-xs">
            Explore island adventures, jet ski experiences, yacht trips and
            <br className="hidden sm:inline" />
            more—all in Phuket, Thailand.
          </p>

          {/* White Rounded CTA Button */}
          <div className="mt-6 sm:mt-7">
            <Button
              asChild
              size="default"
              className="rounded-full bg-white hover:bg-white/95 text-primary hover:text-primary-dark font-semibold px-6 sm:px-7 h-10 sm:h-11 text-sm shadow-md transition-all duration-200 inline-flex items-center gap-2 cursor-pointer group"
            >
              <Link href="/tours">
                <span>Browse All Tours</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 stroke-[2.2]" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
