export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isProvisional?: boolean;
}

export const faqItems: FaqItem[] = [
  {
    id: "pickup-times",
    question: "How do I know which pickup time applies to my tour?",
    answer:
      "Pickup locations and times vary by tour and area. Your tour page and booking details will show the confirmed information for your selected option.",
    isProvisional: false, // Verbatim from Figma reference
  },
  {
    id: "child-adult-pricing",
    question: "Are child and adult prices the same?",
    answer:
      "Guest pricing options (adult and child rates) depend on the individual tour and package selected. Confirmed pricing for each category is shown directly on the tour page and during checkout.",
    isProvisional: true, // Provisional copy - pending client confirmation
  },
  {
    id: "tour-inclusions",
    question: "What is included in my tour?",
    answer:
      "Inclusions vary by individual tour itinerary. Please check the detailed inclusions and exclusions listed on your selected tour’s page before booking.",
    isProvisional: true, // Provisional copy - pending client confirmation
  },
  {
    id: "change-cancel-booking",
    question: "Can I change or cancel a booking?",
    answer:
      "Cancellation and change conditions depend on the specific tour and booking terms. Please review the terms on your selected tour page and booking confirmation, or contact our team for assistance.",
    isProvisional: true, // Provisional copy - pending client confirmation
  },
];
