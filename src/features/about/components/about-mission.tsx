import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ourMissionData } from "../data/about-data";

export function AboutMission() {
  return (
    <section
      id="mission"
      className="bg-[#F8FAFB] py-16 sm:py-20 lg:py-24 border-y border-[#E5EAED]"
      aria-labelledby="mission-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        {/* Header Block */}
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
          <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
            OUR MISSION & STANDARDS
          </span>
          <h2
            id="mission-heading"
            className="mt-3 font-outfit text-2xl sm:text-3xl lg:text-[42px] font-bold tracking-tight text-[#18282A] lg:leading-[48px]"
          >
            Safe, Sustainable & Honest Travel
          </h2>
          <p className="mt-3.5 font-outfit text-sm sm:text-base lg:text-[17px] text-[#5C6C6E] leading-relaxed max-w-2xl">
            Every excursion booked through PhuketTours is guided by our core commitments to maritime safety standards, marine ecosystem conservation, and straightforward customer transparency.
          </p>
        </div>

        {/* 3 Mission Pillars Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {ourMissionData.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                id={pillar.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#E5EAED] bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#3297A3]/40"
              >
                <div>
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <span className="font-outfit text-[11px] font-bold tracking-[1.5px] uppercase text-[#3297A3] bg-[#3297A3]/10 px-3 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7F8] text-[#3297A3] transition-colors group-hover:bg-[#3297A3] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 font-outfit text-xl font-bold text-[#18282A]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 font-outfit text-sm text-[#5C6C6E] leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Highlights List */}
                  <ul className="mt-6 space-y-2.5 pt-5 border-t border-[#F0F4F6]">
                    {pillar.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3E4F51]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3297A3] mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
