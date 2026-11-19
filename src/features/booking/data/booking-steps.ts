export interface BookingStepItem {
  step: string;
  label: string;
}

export const bookingStepsData: BookingStepItem[] = [
  {
    step: "01",
    label: "Choose your tour",
  },
  {
    step: "02",
    label: "Select your available options",
  },
  {
    step: "03",
    label: "Review your booking details and price",
  },
  {
    step: "04",
    label: "Complete your booking",
  },
];
