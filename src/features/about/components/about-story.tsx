"use client";

import * as React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ourStoryData, aboutStatsData } from "../data/about-data";

export function AboutStory() {
  const [imgError, setImgError] = React.useState(false);

  return (
    <section
      id="story"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="story-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Image with floating badge */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative mx-auto max-w-[500px] lg:max-w-none">
              <div className="relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted shadow-lg">
                {!imgError ? (
                  <Image
                    src={ourStoryData.imageSrc}
                    alt={ourStoryData.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <span>Phuket Excursions</span>
                  </div>
                )}

                {/* Gradient vignette at bottom */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Floating caption on bottom of image */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3.5 backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:p-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3297A3]/10 text-[#3297A3]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-outfit text-xs font-semibold uppercase tracking-wider text-[#3297A3]">
                        Certified Quality
                      </p>
                      <p className="font-outfit text-sm font-bold text-[#18282A]">
                        Verified Operators & Licensed Crews
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Stats */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
            {/* Eyebrow */}
            <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
              {ourStoryData.eyebrow}
            </span>

            {/* Main Heading */}
            <h2
              id="story-heading"
              className="mt-3 font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl lg:text-[40px] lg:leading-[46px]"
            >
              {ourStoryData.title}
            </h2>

            {/* Paragraphs */}
            <div className="mt-5 space-y-4 font-outfit text-sm sm:text-base leading-relaxed text-[#5C6C6E]">
              {ourStoryData.paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Callout quote */}
            <div className="mt-6 border-l-4 border-[#3297A3] bg-[#F5F8F9] p-4 sm:p-5 rounded-r-xl">
              <p className="font-outfit text-sm sm:text-base italic font-medium text-[#18282A]">
                &ldquo;{ourStoryData.quote}&rdquo;
              </p>
            </div>

            {/* Verified Facts / Stats Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-[#E5EAED]">
              {aboutStatsData.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-outfit text-2xl sm:text-3xl font-extrabold text-[#3297A3]">
                    {stat.value}
                  </span>
                  <span className="mt-1 font-outfit text-sm font-semibold text-[#18282A]">
                    {stat.label}
                  </span>
                  <span className="mt-0.5 font-outfit text-xs text-[#5C6C6E] leading-tight">
                    {stat.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
