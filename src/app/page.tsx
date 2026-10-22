import { HeroSection } from "@/components/sections/hero-section";
import { ExploreExperienceSection } from "@/components/sections/explore-experience-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* PhuketTours Hero Section */}
      <HeroSection />

      {/* Explore by Experience Section */}
      <ExploreExperienceSection />
    </div>
  );
}
