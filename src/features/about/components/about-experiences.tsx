"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { experiencesData, type ExperienceItem } from "@/features/experiences/data/experiences";

export function AboutExperiences() {
  return (
    <section
      id="experiences"
      className="bg-[#F8FAFB] py-16 sm:py-20 lg:py-24 border-t border-[#E5EAED]"
      aria-labelledby="about-experiences-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-3 max-w-[720px]">
            <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
              OUR EXPERIENCES
            </span>
            <h2
              id="about-experiences-heading"
              className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl lg:text-[42px] lg:leading-[48px]"
            >
              Curated Phuket Adventures
            </h2>
            <p className="font-outfit text-sm text-[#5C6C6E] sm:text-base lg:text-[17px] leading-relaxed">
              Explore our core excursion categories, connecting you directly to verified local operators across the Andaman Sea.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              asChild
              className="h-[48px] sm:h-[52px] rounded-full bg-[#3297A3] px-6 text-sm sm:text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2B8691] inline-flex items-center gap-2.5 cursor-pointer"
            >
              <Link href="/tours">
                <span>View All Tours</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Experience Cards Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiencesData.slice(0, 3).map((item) => (
            <AboutExperienceCard key={item.id} item={item} />
          ))}
        </div>

        {/* Second Row: 2 wider cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {experiencesData.slice(3, 5).map((item) => (
            <AboutExperienceCard key={item.id} item={item} isWide />
          ))}
        </div>
      </Container>
    </section>
  );
}

function AboutExperienceCard({
  item,
  isWide = false,
}: {
  item: ExperienceItem;
  isWide?: boolean;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <Link
      href={item.href}
      className={`group relative flex ${
        isWide ? "h-[320px] sm:h-[360px]" : "h-[340px] sm:h-[380px]"
      } flex-col justify-end overflow-hidden rounded-2xl bg-slate-100 shadow-xs transition-all duration-300 hover:shadow-xl`}
      aria-label={`Explore ${item.title}`}
    >
      {/* Background Image */}
      {!imgError && (
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      )}

      {/* Gradient vignette */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="relative z-10 w-full p-5 sm:p-6 text-white">
        <h3 className="font-outfit text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-xs">
          {item.title}
        </h3>
        <p className="mt-1.5 font-outfit text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed drop-shadow-xs">
          {item.description}
        </p>

        <div className="mt-3.5 inline-flex items-center gap-1.5 font-outfit text-xs sm:text-sm font-semibold text-teal-300 drop-shadow-xs transition-transform duration-200 group-hover:translate-x-1">
          <span>Explore Tours</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
