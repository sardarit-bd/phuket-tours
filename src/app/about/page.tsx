import type { Metadata } from "next";
import { AboutHero } from "@/features/about/components/about-hero";
import { AboutStory } from "@/features/about/components/about-story";
import { AboutMission } from "@/features/about/components/about-mission";
import { WhyChooseUs } from "@/features/about/components/why-choose-us";
import { AboutExperiences } from "@/features/about/components/about-experiences";
import { CtaSection } from "@/components/sections/cta-section";

export const metadata: Metadata = {
  title: "About Us | PhuketTours",
  description:
    "Learn about PhuketTours — connecting travelers with licensed local boat captains, vetted tour operators, and unforgettable Andaman Sea excursions.",
  openGraph: {
    title: "About PhuketTours — Island Excursions & Marine Adventures",
    description:
      "Locally rooted, globally trusted. Discover authentic and sustainable island tours across Phuket, Krabi, and Phang Nga Bay.",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. About Hero Section with breadcrumbs */}
      <AboutHero />

      {/* 2. Our Story Section with verified facts & local boat photo */}
      <AboutStory />

      {/* 3. Our Mission & Safety/Sustainability Standards */}
      <AboutMission />

      {/* 4. Why Choose PhuketTours Benefits Grid */}
      <WhyChooseUs />

      {/* 5. Our Experiences Highlight Grid */}
      <AboutExperiences />

      {/* 6. Call to Action Section */}
      <CtaSection
        eyebrow="YOUR PHUKET JOURNEY STARTS HERE"
        title="Ready to Experience the Andaman Sea?"
        description="Explore 440+ verified tours, private charters, and authentic island excursions curated with local Phuket expertise."
        buttonText="Browse All Tours"
        buttonHref="/tours"
      />
    </div>
  );
}
