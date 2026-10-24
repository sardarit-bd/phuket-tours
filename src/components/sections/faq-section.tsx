"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { faqItems, type FaqItem } from "@/features/faq/data/faq-data";

interface FaqSectionProps {
  items?: FaqItem[];
  defaultOpenIndex?: number | null;
}

export function FaqSection({
  items = faqItems,
  defaultOpenIndex = 0,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(
    defaultOpenIndex
  );

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="faq-section-heading"
    >
      <Container className="max-w-[1320px] lg:px-0">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 sm:gap-12 lg:gap-16 xl:gap-20">
          {/* Left Column: Heading and Intro */}
          <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0">
            {/* Eyebrow */}
            <span className="font-outfit text-xs sm:text-[14px] font-semibold uppercase leading-[16px] tracking-[2.4px] text-[#3297A3]">
              GOOD TO KNOW
            </span>

            {/* Main Heading */}
            <h2
              id="faq-section-heading"
              className="mt-3.5 font-outfit text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#18282A] leading-tight lg:leading-[50px]"
            >
              Frequently
              <br className="hidden sm:inline" /> Asked Questions
            </h2>

            {/* Description */}
            <p className="mt-4 font-outfit text-sm sm:text-base text-[#74818A] leading-relaxed max-w-[380px]">
              Helpful information for planning and booking your Phuket experience.
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="w-full lg:flex-1 border-t border-[#E5EAED]">
            {items.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.id} className="border-b border-[#E5EAED]">
                  <button
                    type="button"
                    onClick={() => toggleItem(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-trigger-${item.id}`}
                    className="w-full flex items-center justify-between text-left py-5 sm:py-6 gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3297A3] focus-visible:ring-offset-2 rounded-xs"
                  >
                    <span className="font-outfit text-base sm:text-[18px] font-bold text-[#18282A] leading-snug pr-2">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "h-8 w-8 rounded-full border border-[#D5E0E3] bg-white flex items-center justify-center shrink-0 text-[#3297A3] transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0"
                      )}
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4 stroke-[2.2]" />
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${item.id}`}
                      className="pb-6 sm:pb-7 pr-10 sm:pr-14"
                    >
                      <p className="font-outfit text-sm sm:text-[15px] leading-relaxed text-[#74818A]">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
