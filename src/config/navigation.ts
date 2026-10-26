export interface DropdownItem {
  title: string;
  href: string;
  description?: string;
}

export interface NavItem {
  title: string;
  href: string;
  dropdown?: DropdownItem[];
}

export const mainNav: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Tours",
    href: "/tours",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export const footerNav = {
  tours: [
    { title: "Phi Phi Island Day Trip", href: "/tours/phi-phi-island" },
    { title: "James Bond & Phang Nga Bay", href: "/tours/james-bond-island" },
    { title: "Similan Islands Snorkeling", href: "/tours/similan-islands" },
    { title: "Phuket City & Cultural Tour", href: "/tours/phuket-city-tour" },
    { title: "Elephant Sanctuary Experience", href: "/tours/elephant-sanctuary" },
  ],
  company: [
    { title: "About Us", href: "/about" },
    { title: "Our Guides", href: "/about#team" },
    { title: "Safety & Quality", href: "/about#safety" },
    { title: "Sustainability", href: "/about#sustainability" },
    { title: "Reviews", href: "/about#reviews" },
  ],
  support: [
    { title: "Help & FAQ", href: "/faq" },
    { title: "Booking Terms", href: "/booking-terms" },
    { title: "Cancellation Policy", href: "/cancellation-policy" },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Contact Us", href: "/contact" },
  ],
};
