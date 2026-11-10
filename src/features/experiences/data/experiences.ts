export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export const experiencesData: ExperienceItem[] = [
  {
    id: "islands-tours",
    title: "Islands Tours",
    description: "Explore Phuket’s stunning islands, hidden beaches and turquoise waters.",
    image: "/images/experiences/islands-tours.png",
    href: "/tours?category=island-hopping",
  },
  {
    id: "snorkelling-adventures",
    title: "Snorkelling Adventures",
    description: "Discover vibrant marine life and explore Phuket’s crystal-clear waters.",
    image: "/images/experiences/snorkelling-adventures.jpg",
    href: "/tours?category=snorkeling",
  },
  {
    id: "jet-ski-tours",
    title: "Jet Ski Tours",
    description: "Experience thrilling rides across Phuket’s beautiful coastline.",
    image: "/images/experiences/jet-ski-tours.jpg",
    href: "/tours?category=jet-ski",
  },
  {
    id: "yacht-boat-tours",
    title: "Yacht & Boat Tours",
    description: "Enjoy scenic cruises and unforgettable days out on the Andaman Sea.",
    image: "/images/experiences/yacht-boat-tours.jpg",
    href: "/tours?category=sunset-cruises",
  },
  {
    id: "atv-land-adventures",
    title: "ATV & Land Adventures",
    description: "Explore Phuket’s scenic landscapes with exciting off-road experiences.",
    image: "/images/experiences/atv-land-adventures.jpg",
    href: "/tours?category=cultural",
  },
];
