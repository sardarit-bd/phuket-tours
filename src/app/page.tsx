import { HeroSection } from "@/components/sections/hero-section";
import { ExploreExperienceSection } from "@/components/sections/explore-experience-section";
import { FeaturedToursSection } from "@/components/sections/featured-tours-section";
import { BookingProcessSection } from "@/components/sections/booking-process-section";
import { KnowBeforeYouGoSection } from "@/components/sections/know-before-you-go-section";
import { FaqSection } from "@/components/sections/faq-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* PhuketTours Hero Section */}
      <HeroSection />

      {/* Explore by Experience Section */}
      <ExploreExperienceSection />

      {/* Featured Tours Section */}
      <FeaturedToursSection />

      {/* Book Your Phuket Experience Section */}
      <BookingProcessSection />

      {/* Know Before You Go (Tour Details) Section */}
      <KnowBeforeYouGoSection />

      {/* Frequently Asked Questions (FAQ) Section */}
      <FaqSection />
    </div>
  );
}
