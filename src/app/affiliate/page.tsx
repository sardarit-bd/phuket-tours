import type { Metadata } from "next";
import { AffiliateProgramLanding } from "@/features/affiliate/components/affiliate-program-landing";

export const metadata: Metadata = {
  title: "Affiliate Program — PhuketTours",
  description:
    "Join the PhuketTours Affiliate Program to share curated Phuket island tours and earn commission on verified bookings.",
};

export default function AffiliateProgramPage() {
  return <AffiliateProgramLanding />;
}
