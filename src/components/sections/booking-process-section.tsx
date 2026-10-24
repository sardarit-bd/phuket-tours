"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { bookingStepsData } from "@/features/booking/data/booking-steps";

export function BookingProcessSection() {
  return (
    <section
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="booking-process-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        {/* Section Heading: Eyebrow + Main Title */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
            SIMPLE &amp; CLEAR
          </span>

          {/* Main Heading */}
          <h2
            id="booking-process-heading"
            className="mt-3 font-outfit text-2xl font-bold tracking-tight text-[#18282A] sm:text-3xl md:text-4xl lg:text-[48px] lg:leading-[48px] lg:tracking-[-1.2px]"
          >
            Book Your Phuket Experience
          </h2>
        </div>

        {/* ============================================================== */}
        {/* Desktop Timeline (≥1024px): 4 steps in a horizontal row        */}
        {/* ============================================================== */}
        <div className="hidden lg:block mt-16 lg:mt-20">
          <div className="relative">
            {/* Horizontal Dashed Connector Line connecting centers of Step 1 to Step 4 */}
            <div
              className="absolute top-[30px] left-[12.5%] right-[12.5%] -translate-y-1/2 border-t-[1.5px] border-dashed border-[#3297A3] z-0 pointer-events-none"
              aria-hidden="true"
            />

            {/* 4 Step Columns */}
            <div className="grid grid-cols-4 relative z-10">
              {bookingStepsData.map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center px-4">
                  {/* Step Number Circle */}
                  <div
                    className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-[1.5px] border-[#3297A3] bg-white shadow-xs"
                    aria-label={`Step ${item.step}`}
                  >
                    <span className="font-outfit text-[17px] font-semibold text-[#3297A3]">
                      {item.step}
                    </span>
                  </div>

                  {/* Step Label */}
                  <p className="mt-8 font-outfit text-[18px] lg:text-[20px] font-bold leading-[26px] text-[#18282A] max-w-[210px]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Tablet Timeline (600px - 1023px): 2x2 grid with connectors      */}
        {/* ============================================================== */}
        <div className="hidden sm:block lg:hidden mt-12 sm:mt-16">
          <div className="max-w-[560px] mx-auto flex flex-col gap-12">
            {/* Row 1: Steps 01 and 02 */}
            <div className="relative">
              <div
                className="absolute top-[28px] left-[25%] right-[25%] -translate-y-1/2 border-t-[1.5px] border-dashed border-[#3297A3] z-0 pointer-events-none"
                aria-hidden="true"
              />
              <div className="grid grid-cols-2 relative z-10">
                {bookingStepsData.slice(0, 2).map((item) => (
                  <div key={item.step} className="flex flex-col items-center text-center px-3">
                    <div
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-[1.5px] border-[#3297A3] bg-white shadow-xs"
                      aria-label={`Step ${item.step}`}
                    >
                      <span className="font-outfit text-base font-semibold text-[#3297A3]">
                        {item.step}
                      </span>
                    </div>
                    <p className="mt-6 font-outfit text-lg font-bold leading-[24px] text-[#18282A] max-w-[200px]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Steps 03 and 04 */}
            <div className="relative">
              <div
                className="absolute top-[28px] left-[25%] right-[25%] -translate-y-1/2 border-t-[1.5px] border-dashed border-[#3297A3] z-0 pointer-events-none"
                aria-hidden="true"
              />
              <div className="grid grid-cols-2 relative z-10">
                {bookingStepsData.slice(2, 4).map((item) => (
                  <div key={item.step} className="flex flex-col items-center text-center px-3">
                    <div
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-[1.5px] border-[#3297A3] bg-white shadow-xs"
                      aria-label={`Step ${item.step}`}
                    >
                      <span className="font-outfit text-base font-semibold text-[#3297A3]">
                        {item.step}
                      </span>
                    </div>
                    <p className="mt-6 font-outfit text-lg font-bold leading-[24px] text-[#18282A] max-w-[200px]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Mobile Timeline (<600px): Clean vertical sequence               */}
        {/* ============================================================== */}
        <div className="block sm:hidden mt-10">
          <div className="flex flex-col items-center">
            {bookingStepsData.map((item, index) => (
              <React.Fragment key={item.step}>
                <div className="flex flex-col items-center text-center px-4">
                  {/* Step Number Circle */}
                  <div
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-[#3297A3] bg-white shadow-xs"
                    aria-label={`Step ${item.step}`}
                  >
                    <span className="font-outfit text-base font-semibold text-[#3297A3]">
                      {item.step}
                    </span>
                  </div>

                  {/* Step Label */}
                  <p className="mt-3.5 font-outfit text-base font-bold leading-[22px] text-[#18282A] max-w-[240px]">
                    {item.label}
                  </p>
                </div>

                {/* Vertical Dashed Connector between steps */}
                {index < bookingStepsData.length - 1 && (
                  <div
                    className="my-3 h-8 w-0 border-l-[1.5px] border-dashed border-[#3297A3]"
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
