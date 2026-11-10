import { LucideIcon, ShieldCheck, Compass, Leaf, Anchor, Clock, Users, MapPin, Award } from "lucide-react";

export interface AboutHeroData {
  eyebrow: string;
  title: string;
  description: string;
}

export interface AboutStatItem {
  value: string;
  label: string;
  description: string;
}

export interface AboutMissionPillar {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  highlights: string[];
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const aboutHeroData: AboutHeroData = {
  eyebrow: "ABOUT PHUKETTOURS",
  title: "Locally Rooted, Globally Trusted",
  description:
    "We connect travelers with verified local boat captains, certified guides, and authentic island excursions across Phuket, Krabi, and Phang Nga Bay.",
};

export const aboutStatsData: AboutStatItem[] = [
  {
    value: "440+",
    label: "Curated Tours",
    description: "Verified island hopping, water sports, and land excursions.",
  },
  {
    value: "8+",
    label: "Key Destinations",
    description: "Phuket, Phi Phi, Similan, James Bond, Krabi, Racha & beyond.",
  },
  {
    value: "100%",
    label: "Licensed Operators",
    description: "Partnering strictly with registered captains and vetted crews.",
  },
  {
    value: "Daily",
    label: "Local Assistance",
    description: "On-the-ground support available 07:00 AM – 10:00 PM ICT.",
  },
];

export const ourStoryData = {
  eyebrow: "OUR STORY",
  title: "A Better Way to Discover the Andaman Sea",
  paragraphs: [
    "PhuketTours was created to eliminate the guesswork and friction often associated with booking island tours and marine excursions in southern Thailand. Too often, travelers face confusing pier haggling, uncertain boat standards, or unexpected surcharges.",
    "Our platform provides a curated, transparent marketplace that connects visitors directly with licensed local operators, experienced boat captains, and certified guides. From pristine beaches in the Similan Islands to the dramatic limestone karsts of Phang Nga Bay, we make unforgettable Andaman adventures straightforward to discover and book.",
  ],
  quote:
    "Our goal is simple: deliver safe, memorable, and environmentally conscious travel experiences supported by genuine local hospitality.",
  imageSrc: "/images/tour-details/know-before-you-go.jpg",
  imageAlt: "Tour boat anchored in clear turquoise Andaman waters by Phuket limestone karsts",
};

export const ourMissionData: AboutMissionPillar[] = [
  {
    id: "safety",
    badge: "SAFETY STANDARDS",
    title: "Maritime Safety & Certified Crews",
    description:
      "We partner exclusively with licensed captains and experienced crews who adhere to rigorous maritime safety protocols on every departure.",
    icon: ShieldCheck,
    highlights: [
      "Strict compliance with Thai marine transport regulations",
      "Regularly maintained speedboats, catamarans, and safety gear",
      "Sanitized life vests provided for all passengers",
      "Basic travel accident insurance included on licensed tours",
    ],
  },
  {
    id: "sustainability",
    badge: "SUSTAINABILITY",
    title: "Eco-Conscious Island Tourism",
    description:
      "The Andaman marine ecosystem is fragile. We advocate for responsible travel practices that protect coral reefs and wildlife for future generations.",
    icon: Leaf,
    highlights: [
      "Promoting reef-safe mineral sunscreen on all marine trips",
      "Strict adherence to national marine park wildlife guidelines",
      "Encouraging reduction of single-use plastics on charters",
      "Direct support for local coastal communities and guides",
    ],
  },
  {
    id: "transparency",
    badge: "TRANSPARENCY",
    title: "Honest Pricing & Clear Itineraries",
    description:
      "Travelers deserve clarity before they step foot on a pier. We provide detailed tour inclusions, schedules, and transparent pricing upfront.",
    icon: Compass,
    highlights: [
      "Clear itemization of national park fees and inclusions",
      "No hidden booking surcharges or surprise pier fees",
      "Direct support for weather-related rescheduling",
      "Authentic itineraries with realistic travel timings",
    ],
  },
];

export const whyChooseUsData: WhyChooseUsItem[] = [
  {
    id: "vetted-operators",
    title: "Vetted Local Operators",
    description:
      "Every tour operator in our network is screened for licensing, passenger insurance, safety records, and boat maintenance.",
    icon: Award,
  },
  {
    id: "broad-catalog",
    title: "440+ Verified Tours",
    description:
      "From high-speed island hopping to serene sunset catamarans and cultural explorations, choose the ideal experience for your travel style.",
    icon: Anchor,
  },
  {
    id: "local-expertise",
    title: "Local Phuket Expertise",
    description:
      "Based right in Phuket, our team understands local weather patterns, seasonal marine park openings, and optimal departure times.",
    icon: MapPin,
  },
  {
    id: "fair-weather-policy",
    title: "Weather Peace of Mind",
    description:
      "Tropical weather can change rapidly. We provide flexible rescheduling and cancellation support when sea conditions require it.",
    icon: Clock,
  },
  {
    id: "dedicated-support",
    title: "Daily Traveler Support",
    description:
      "Reach our local team daily from 07:00 AM to 10:00 PM ICT via WhatsApp, phone, or email for itinerary advice and booking assistance.",
    icon: Users,
  },
  {
    id: "safety-first",
    title: "Safety-First Approach",
    description:
      "All marine excursions prioritize passenger safety with certified life jackets, first-aid equipment, and trained multilingual tour leaders.",
    icon: ShieldCheck,
  },
];
