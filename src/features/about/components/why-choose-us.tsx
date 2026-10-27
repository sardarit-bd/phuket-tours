import * as React from "react";
import { Container } from "@/components/layout/container";
import { whyChooseUsData } from "../data/about-data";

export function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="why-choose-us-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
          <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
            WHY CHOOSE PHUKETTOURS
          </span>
          <h2
            id="why-choose-us-heading"
            className="mt-3 font-outfit text-2xl sm:text-3xl lg:text-[42px] font-bold tracking-tight text-[#18282A] lg:leading-[48px]"
          >
            Built for Confident Travel in Phuket
          </h2>
          <p className="mt-3.5 font-outfit text-sm sm:text-base lg:text-[17px] text-[#5C6C6E] leading-relaxed max-w-2xl">
            We focus on what matters most to travelers: reliable operators, fair pricing, responsive support, and stress-free island adventures.
          </p>
        </div>

        {/* 6 Benefits Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {whyChooseUsData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-[#E5EAED] bg-white p-7 transition-all duration-300 hover:border-[#3297A3]/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F7F8] text-[#3297A3] transition-colors group-hover:bg-[#3297A3] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-outfit text-lg sm:text-xl font-bold text-[#18282A]">
                  {item.title}
                </h3>

                <p className="mt-2 font-outfit text-sm text-[#5C6C6E] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
