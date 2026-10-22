import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-hero flex flex-col justify-start lg:justify-center">
      {/* Full-bleed Phuket Tropical Beach Background with mobile-tuned crop */}
      <Image
        src="/images/hero/hero-img.jpg"
        alt="Tropical beach in Phuket with turquoise sea and longtail boats"
        fill
        priority
        className="object-cover object-[58%_bottom] sm:object-[60%_bottom] md:object-[62%_center] lg:object-center"
        sizes="100vw"
      />

      {/* Subtle, low-opacity left-side gradient to preserve natural bright photo colors */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/15 to-transparent pointer-events-none" />

      {/* Hero Content Constrained by Shared Container with upper-middle mobile placement */}
      <Container className="relative z-10 pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:py-24">
        {/* Content Frame close to Figma frame */}
        <div className="max-w-[820px]">
          {/* Outlined Badge with Compact Responsive Spacing */}
          <div className="mb-3.5 sm:mb-4 lg:mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/10 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white inline-block" />
            <span>Tours & Experiences in Phuket</span>
          </div>

          {/* Responsive Headline: fluid mobile/tablet scaling to exact desktop 96px Figma spec */}
          <h1 className="font-outfit font-semibold text-white text-[32px] min-[400px]:text-[36px] min-[580px]:text-[48px] md:text-[60px] lg:text-[76px] xl:text-[96px] leading-[1.08] sm:leading-[1.04] xl:leading-[94.08px] tracking-[-0.02em] sm:tracking-[-0.03em] xl:tracking-[-4.32px] drop-shadow-xs">
            <span className="block">Discover Phuket.</span>
            <span className="block">Experience More.</span>
          </h1>

          {/* Responsive Paragraph: readable fluid mobile scaling to exact desktop 20px / 576px spec */}
          <p className="mt-3.5 sm:mt-4 lg:mt-7 font-outfit font-normal text-white text-sm sm:text-base md:text-lg xl:text-[20px] leading-relaxed sm:leading-[1.6] xl:leading-[32px] tracking-normal w-full max-w-[576px] drop-shadow-xs">
            Explore island adventures, jet ski experiences, yacht trips and more— all in Phuket, Thailand.
          </p>

          {/* Responsive CTA Button: comfortable touch target scaling to exact desktop 196px × 52px spec */}
          <div className="mt-5 sm:mt-6 lg:mt-[36px]">
            <Button
              asChild
              className="h-[48px] sm:h-[52px] min-w-[180px] sm:min-w-[196px] rounded-full bg-white hover:bg-white/95 text-primary hover:text-primary-dark font-semibold px-5 sm:px-6 text-sm sm:text-[15px] shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer group"
            >
              <Link href="/tours">
                <span>Browse All Tours</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform duration-200 group-hover:translate-x-1 stroke-[2.2]" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
