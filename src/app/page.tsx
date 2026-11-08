import { HeroSection } from "@/components/sections/hero-section";
import { ExploreExperienceSection } from "@/components/sections/explore-experience-section";
import { FeaturedToursSection } from "@/components/sections/featured-tours-section";
import { BookingProcessSection } from "@/components/sections/booking-process-section";
import { KnowBeforeYouGoSection } from "@/components/sections/know-before-you-go-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaSection } from "@/components/sections/cta-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ExploreExperienceSection />
      <FeaturedToursSection />
      <BookingProcessSection />
      <KnowBeforeYouGoSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
