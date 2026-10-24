"use client";

import * as React from "react";
import Image from "next/image";
import { Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import {
  knowBeforeYouGoItems,
  type TourDetailItem,
} from "@/features/tours/data/tour-details";

interface KnowBeforeYouGoSectionProps {
  items?: TourDetailItem[];
  imageSrc?: string;
  imageAlt?: string;
}

export function KnowBeforeYouGoSection({
  items = knowBeforeYouGoItems,
  imageSrc = "/images/tour-details/know-before-you-go.jpg",
  imageAlt = "Phuket tour boat anchored in clear turquoise water by limestone karsts",
}: KnowBeforeYouGoSectionProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <section
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="know-before-you-go-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        <div className="flex flex-col lg:flex-row items-start max-w-[1320px] mx-auto">
          {/* Left column — Tour image (Figma: 528 × 506px, no card frame/shadow/gradient overlay) */}
          <div className="w-full max-w-[528px] mx-auto lg:mx-0 shrink-0">
            <div className="relative aspect-[528/506] w-full overflow-hidden bg-[#EEF4F6]">
              {!imgError ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 528px, 528px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center bg-[#EEF4F6] p-6 text-center text-[#74818A]"
                  role="img"
                  aria-label="Tour details photo placeholder"
                >
                  <Compass className="h-10 w-10 text-[#3297A3]/50 mb-2" />
                  <span className="font-outfit text-sm font-medium text-[#74818A]">
                    Tour Details Photo
                  </span>
                  <span className="font-outfit text-xs text-[#94A3A8] mt-1">
                    528 &times; 506px
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right column — Content (Figma: 792px frame with 56px padding, 680 Fill content) */}
          <div className="w-full lg:w-[792px] lg:h-[506px] flex flex-col justify-start lg:pt-[56px] lg:pl-[56px] lg:pr-[56px] shrink-0">
            {/* Header Box (Figma: 680 Fill 80 Hug) */}
            <div className="w-full lg:h-[80px] flex flex-col justify-between shrink-0">
              {/* Eyebrow */}
              <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
                TOUR DETAILS
              </span>

              {/* Main Heading */}
              <h2
                id="know-before-you-go-heading"
                className="font-outfit text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#18282A] lg:leading-[48px]"
              >
                Know Before You Go
              </h2>
            </div>

            {/* Information Rows (Figma: 370px vertical space) */}
            <div className="mt-8 lg:mt-[48px] flex flex-col gap-6 sm:gap-7 lg:gap-[32px]">
              {items.map((item) => (
                <TourDetailRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function TourDetailRow({ item }: { item: TourDetailItem }) {
  return (
    <div className="tour-detail-row">
      {/* Left Column: Fixed-width teal uppercase label */}
      <div className="pt-0.5">
        <span className="font-outfit text-xs sm:text-[13px] font-semibold uppercase tracking-[1.8px] text-[#3297A3] leading-[1.3] block">
          {item.label === "WHAT’S INCLUDED" ||
          item.label === "WHAT'S INCLUDED" ? (
            <>
              WHAT&rsquo;S
              <br className="max-[539px]:hidden" /> INCLUDED
            </>
          ) : (
            item.label
          )}
        </span>
      </div>

      {/* Right Column: Bold detail title followed by its muted description */}
      <div className="flex flex-col">
        <h3 className="font-outfit text-base sm:text-[17px] font-bold text-[#18282A] leading-snug">
          {item.title}
        </h3>
        <p className="mt-1.5 font-outfit text-sm sm:text-[14px] leading-relaxed text-[#74818A]">
          {item.description}
        </p>
      </div>
    </div>
  );
}
