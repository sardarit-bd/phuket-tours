import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";

interface TourHeroProps {
  totalCount?: number;
}

export function TourHero({ totalCount = 441 }: TourHeroProps) {
  return (
    <section className="relative w-full overflow-hidden min-h-[220px] sm:min-h-[260px] md:min-h-[290px] flex items-center">
      {/* Background Hero Image */}
      <Image
        src="/images/hero/hero-img.jpg"
        alt="Phuket Tours & Experiences panoramic coastline"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Hero Overlay with subtle dark-teal gradient matching reference screenshot */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E353B]/80 via-[#103D44]/55 to-black/30 pointer-events-none" />

      {/* Content Container */}
      <Container className="max-w-[1320px] lg:px-0 relative z-10 py-8 sm:py-10 md:py-12">
        <div className="max-w-[760px] flex flex-col">
          {/* Eyebrow */}
          <span className="font-outfit text-xs sm:text-[13px] font-semibold uppercase tracking-[2px] text-white/90 drop-shadow-xs">
            EXPLORE PHUKET
          </span>

          {/* Main Title */}
          <h1 className="mt-2 font-outfit text-3xl sm:text-4xl md:text-[46px] font-bold text-white tracking-tight leading-[1.15] drop-shadow-sm">
            Tours & Experiences
          </h1>

          {/* Description */}
          <p className="mt-2.5 font-outfit text-sm sm:text-base md:text-[16px] text-white/90 max-w-[620px] leading-relaxed drop-shadow-xs">
            Discover {totalCount}+ amazing tours, activities and experiences across Phuket and nearby islands.
          </p>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mt-5 sm:mt-6 flex items-center gap-1.5 text-xs sm:text-sm text-white/80">
            <Link
              href="/"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/60" aria-hidden="true" />
            <span className="text-white font-medium" aria-current="page">
              Tours
            </span>
          </nav>
        </div>
      </Container>
    </section>
  );
}
