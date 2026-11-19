export interface FeaturedTourItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  href: string;
  durationPriceLabel: string;
  durationPriceValue: string;
  actionLabel: string;
}

export const featuredToursData: FeaturedTourItem[] = [
  {
    id: "khai-islands-tour-premium",
    slug: "khai-islands-tour-premium",
    title: "Khai Islands Tour Premium",
    category: "ISLAND TOUR",
    image: "/images/featured-tours/khai-islands-tour-premium.jpg",
    href: "/tours?slug=khai-islands-tour-premium",
    durationPriceLabel: "Duration & price",
    durationPriceValue: "See available options",
    actionLabel: "View Tour",
  },
  {
    id: "similan-islands-one-day-snorkelling",
    slug: "similan-islands-one-day-snorkelling",
    title: "Similan Islands One Day Tour Snorkelling Package",
    category: "ISLAND TOUR · SNORKELLING",
    image: "/images/featured-tours/similan-islands-one-day-snorkelling.jpg",
    href: "/tours?slug=similan-islands-one-day-snorkelling",
    durationPriceLabel: "Duration & price",
    durationPriceValue: "See available options",
    actionLabel: "View Tour",
  },
  {
    id: "similan-islands-2-days-1-night-tent",
    slug: "similan-islands-2-days-1-night-tent",
    title: "Similan Islands 2 Days 1 Night Tent Snorkelling Package",
    category: "ISLAND TOUR · MULTI-DAY",
    image: "/images/featured-tours/similan-islands-2-days-1-night-tent.jpg",
    href: "/tours?slug=similan-islands-2-days-1-night-tent",
    durationPriceLabel: "Duration & price",
    durationPriceValue: "See available options",
    actionLabel: "View Tour",
  },
];
