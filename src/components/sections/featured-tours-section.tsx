"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { featuredToursData, type FeaturedTourItem } from "@/features/tours/data/featured-tours";

export function FeaturedToursSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="featured-tours-heading">
      <Container className="max-w-[1320px] lg:px-0">
        {/* Section Heading Block */}
        <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          {/* Left Text Column */}
          <div className="flex flex-col gap-3 max-w-[620px]">
            {/* Eyebrow */}
            <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
              FEATURED TOURS
            </span>

            {/* Heading */}
            <h2
              id="featured-tours-heading"
              className="font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl md:text-4xl lg:text-[48px] lg:leading-[48px] lg:tracking-[-1.2px]"
            >
              Explore Our Phuket Tours
            </h2>

            {/* Description - preserves Figma line wrapping */}
            <p className="font-outfit text-sm text-[#5C6C6E] sm:text-base lg:text-[18px] lg:leading-[28px] max-w-[580px]">
              Find your next Phuket experience. Browse available tours, compare options and choose the one that&apos;s right for you.
            </p>
          </div>

          {/* Right CTA Button: Teal #3297A3, white text, pill shape, 52px height, 24px padding, 10px gap */}
          <div className="shrink-0">
            <Button
              asChild
              className="h-[48px] sm:h-[52px] rounded-full bg-[#3297A3] px-5 sm:px-6 text-sm sm:text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2B8691] inline-flex items-center gap-[10px] cursor-pointer"
            >
              <Link href="/tours">
                <span>See All Tours</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 3 Tour Cards Grid */}
        <div className="grid grid-cols-1 tablet-grid-2 lg:grid-cols-3 gap-6">
          {featuredToursData.map((tour, index) => {
            // On tablet (2-col grid), 3rd card spans 2 cols for balance
            const tabletColSpan = index === 2 ? "tablet-col-span-2" : "";

            return (
              <TourCard
                key={tour.id}
                tour={tour}
                className={tabletColSpan}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function TourCard({
  tour,
  className,
}: {
  tour: FeaturedTourItem;
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[12px] border border-[#E5EAEB] bg-white shadow-xs transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Top Image Area: 16:10 aspect ratio, neutral fallback if file is pending */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEF4F5]">
        {!imgError ? (
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#EEF4F5] text-[#8A9A9C]">
            <Compass className="h-8 w-8 opacity-40" />
          </div>
        )}
      </div>

      {/* White Information Area */}
      <div className="flex flex-1 flex-col justify-between p-6">
        {/* Category & Title */}
        <div className="flex flex-col">
          <span className="font-outfit text-xs font-semibold uppercase tracking-[1.5px] text-[#3297A3]">
            {tour.category}
          </span>
          <h3 className="mt-3 font-outfit text-[20px] font-bold leading-[28px] tracking-[-0.3px] text-[#18282A] min-h-[56px] line-clamp-2">
            <Link href={tour.href} className="transition-colors hover:text-[#3297A3]">
              {tour.title}
            </Link>
          </h3>
        </div>

        {/* Thin Divider Line & Bottom Metadata Row */}
        <div className="mt-6 flex items-center justify-between border-t border-[#EEF2F3] pt-5">
          {/* Duration & price */}
          <div className="flex flex-col">
            <span className="font-outfit text-[12px] font-normal leading-[16px] text-[#8A9A9C]">
              {tour.durationPriceLabel}
            </span>
            <span className="mt-0.5 font-outfit text-[13px] sm:text-[14px] font-semibold leading-[20px] text-[#18282A]">
              {tour.durationPriceValue}
            </span>
          </div>

          {/* View Tour CTA */}
          <Link
            href={tour.href}
            className="inline-flex items-center gap-1.5 font-outfit text-sm font-semibold text-[#3297A3] transition-colors hover:text-[#2B8691] group-hover:text-[#2B8691]"
            aria-label={`View tour details for ${tour.title}`}
          >
            <span>{tour.actionLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
