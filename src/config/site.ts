export const siteConfig = {
  name: "PhuketTours",
  shortName: "Phuket Tours",
  description:
    "Discover the beauty of Phuket and the Andaman Sea. Premium island hopping, cultural explorations, and unforgettable experiences curated with local expertise.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  contact: {
    phone: "+66 76 123 4567",
    whatsapp: "+66 81 234 5678",
    email: "info@phukettours.com",
    address: "Patong Beach, Kathu, Phuket 83150, Thailand",
    hours: "Daily 07:00 AM – 10:00 PM (ICT)",
  },
  social: {
    facebook: "https://facebook.com/phukettours",
    instagram: "https://instagram.com/phukettours",
    tripadvisor: "https://tripadvisor.com",
  },
  meta: {
    themeColor: "#2B9BA8",
    ogImage: "/images/og-image.jpg",
  },
} as const;

export type SiteConfig = typeof siteConfig;
