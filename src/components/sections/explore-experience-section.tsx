"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { experiencesData, type ExperienceItem } from "@/features/experiences/data/experiences";

export function ExploreExperienceSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="experience-heading">
      <Container className="max-w-[1320px]">
        {/* Heading Block: ~120px tall on desktop, 12px gap in text stack, right-aligned CTA */}
        <div className="mb-6 flex flex-col justify-between gap-5 sm:gap-6 lg:min-h-[120px] md:flex-row md:items-end">
          {/* Left Text Stack */}
          <div className="flex flex-col gap-3 max-w-[760px]">
            {/* Eyebrow: Outfit 14px 600 line-height 16px tracking 2.4px #3297A3 */}
            <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
              EXPLORE BY EXPERIENCE
            </span>

            {/* Main Heading: Outfit 48px 700 line-height 48px tracking -1.2px #18282A */}
            <h2
              id="experience-heading"
              className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl md:text-4xl lg:text-[48px] lg:leading-[48px] lg:tracking-[-1.2px]"
            >
              Find Your Phuket Experience
            </h2>

            {/* Description: Outfit 18px 400 line-height 28px #5C6C6E */}
            <p className="font-outfit text-sm text-[#5C6C6E] sm:text-base lg:text-[18px] lg:leading-[28px]">
              From island adventures to private boat trips, explore the experiences available in Phuket.
            </p>
          </div>

          {/* Right CTA Button: Teal #3297A3, white text, pill shape, ~52px height, 24px padding, 10px gap */}
          <div className="shrink-0">
            <Button
              asChild
              className="h-[48px] sm:h-[52px] rounded-full bg-[#3297A3] px-5 sm:px-6 text-sm sm:text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2B8691] inline-flex items-center gap-[10px] cursor-pointer"
            >
              <Link href="/experiences">
                <span>See All Experience</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Card Grid: Desktop Row 1 (2 wider cards), Row 2 (3 cards); Tablet 2-col; Mobile 1-col */}
        <div className="grid grid-cols-1 tablet-grid-2 lg:grid-cols-6 gap-6">
          {experiencesData.map((card, index) => {
            // First 2 cards take 3 of 6 columns (50% width), next 3 cards take 2 of 6 columns (33.3% width)
            const desktopColSpan = index < 2 ? "lg:col-span-3" : "lg:col-span-2";
            // On iPad mini and tablet (2-col grid), 5th card spans 2 cols for balance
            const tabletColSpan = index === 4 ? "tablet-col-span-2" : "";

            return (
              <ExperienceCard
                key={card.id}
                card={card}
                className={`${desktopColSpan} ${tabletColSpan}`}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function ExperienceCard({
  card,
  className,
}: {
  card: ExperienceItem;
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <Link
      href={card.href}
      className={`group relative flex h-[380px] sm:h-[400px] lg:h-[420px] flex-col justify-end overflow-hidden rounded-[12px] bg-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl ${className}`}
      aria-label={`Explore ${card.title}`}
    >
      {/* Background Image: Bright and clear, no full-card dark overlay */}
      {!imgError && (
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      )}

      {/* Full-width lower translucent/frosted text panel */}
      <div
        className="relative z-10 w-full p-5 sm:p-6 transition-colors duration-200"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.10)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <h3 className="font-outfit text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-xs">
          {card.title}
        </h3>
        <p className="mt-1.5 font-outfit text-xs sm:text-sm leading-relaxed text-white/95 line-clamp-2 drop-shadow-xs">
          {card.description}
        </p>

        <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 font-outfit text-xs sm:text-sm font-semibold text-white drop-shadow-xs">
          <span>Explore More</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
