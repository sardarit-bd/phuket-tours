export interface TourDetailItem {
  id: string;
  label: string;
  title: string;
  description: string;
}

export const knowBeforeYouGoItems: TourDetailItem[] = [
  {
    id: "pickup",
    label: "PICKUP",
    title: "Tour-specific locations & times",
    description:
      "Confirmed details are shown for your selected tour and pickup area.",
  },
  {
    id: "guest-options",
    label: "GUEST OPTIONS",
    title: "Adult, child & package choices",
    description:
      "Available guest types and variants depend on the individual tour.",
  },
  {
    id: "whats-included",
    label: "WHAT’S INCLUDED",
    title: "Clear booking information",
    description:
      "Review confirmed inclusions and booking details before checkout.",
  },
];
