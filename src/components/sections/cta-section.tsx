"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  imageSrc?: string;
  imageAlt?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CtaSection({
  imageSrc = "/images/cta/phuket-cta-beach.png",
  imageAlt = "Tropical turquoise waters and beach in Phuket, Thailand",
  eyebrow = "YOUR PHUKET EXPERIENCE STARTS HERE",
  title = "Ready to Explore Phuket?",
  description = "Find your next island adventure or Phuket experience.",
  buttonText = "Browse All Tours",
  buttonHref = "/tours",
}: CtaSectionProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#18282A] py-20 sm:py-24 lg:py-32"
      aria-labelledby="cta-heading"
    >
      {/* Background Beach Image */}
      {!imgError && imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={false}
          className="object-cover object-center"
          sizes="100vw"
          onError={() => setImgError(true)}
        />
      )}

      {/* Very subtle low-opacity overlay to keep white text readable while preserving natural beach brightness */}
      <div className="" aria-hidden="true" />

      {/* Content Container */}
      <Container className="max-w-[1320px] lg:px-0 relative z-10">
        <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
          {/* Eyebrow */}
          <span className="font-outfit text-xs sm:text-[13px] lg:text-[14px] font-semibold uppercase tracking-[2.4px] text-white/90 drop-shadow-xs">
            {eyebrow}
          </span>

          {/* Heading */}
          <h2
            id="cta-heading"
            className="mt-3.5 sm:mt-4 font-outfit text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.15] drop-shadow-sm"
          >
            {title}
          </h2>

          {/* Description */}
          <p className="mt-3.5 sm:mt-4 font-outfit text-sm sm:text-base lg:text-lg text-white/90 max-w-[540px] leading-relaxed drop-shadow-xs">
            {description}
          </p>

          {/* Pill CTA Button */}
          <div className="mt-7 sm:mt-8">
            <Button
              asChild
              className="h-12 sm:h-13 px-7 sm:px-8 rounded-full bg-white text-[#18282A] hover:bg-white/95 font-semibold text-sm sm:text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link
                href={buttonHref}
                className="inline-flex items-center gap-2.5"
              >
                <span>{buttonText}</span>
                <ArrowRight className="h-4 w-4 stroke-[2.2]" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
