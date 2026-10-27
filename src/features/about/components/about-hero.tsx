import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { aboutHeroData, type AboutHeroData } from "../data/about-data";

interface AboutHeroProps {
  data?: AboutHeroData;
}

export function AboutHero({ data = aboutHeroData }: AboutHeroProps) {
  return (
    <section className="relative w-full overflow-hidden min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
      {/* Background Hero Image */}
      <Image
        src="/images/hero/hero-img.jpg"
        alt="Phuket coastal landscape and turquoise waters"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Hero Overlay with subtle dark-teal gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0E353B]/90 via-[#103D44]/70 to-black/40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Container */}
      <Container className="max-w-[1320px] lg:px-0 relative z-10 py-12 sm:py-14 md:py-16">
        <div className="max-w-[800px] flex flex-col">
          {/* Eyebrow */}
          <span className="font-outfit text-xs sm:text-[13px] font-semibold uppercase tracking-[2.4px] text-teal-300 drop-shadow-xs">
            {data.eyebrow}
          </span>

          {/* Main Title */}
          <h1 className="mt-3 font-outfit text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-white tracking-tight leading-[1.12] drop-shadow-sm">
            {data.title}
          </h1>

          {/* Description */}
          <p className="mt-3.5 font-outfit text-base sm:text-lg md:text-[18px] text-white/90 max-w-[660px] leading-relaxed drop-shadow-xs">
            {data.description}
          </p>

          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mt-6 sm:mt-7 flex items-center gap-2 text-xs sm:text-sm text-white/80"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/60" aria-hidden="true" />
            <span className="text-white font-medium" aria-current="page">
              About Us
            </span>
          </nav>
        </div>
      </Container>
    </section>
  );
}
